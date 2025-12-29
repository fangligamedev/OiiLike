"""
智能体协作流程集成测试
"""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.blackboard.blackboard import blackboard, AgentType, Task, TaskType


class TestAgentWorkflow:
    """智能体协作流程测试"""
    
    @pytest.fixture
    async def client(self):
        """创建测试客户端"""
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            yield client
    
    @pytest.mark.asyncio
    async def test_health_check(self, client):
        """测试健康检查端点"""
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self, client):
        """测试根端点"""
        response = await client.get("/")
        data = response.json()
        
        assert data["name"] == "AntiGravity API"
        assert "Producer" in data["agents"]
        assert "VoidShaper" in data["agents"]
        assert "CodeWeaver" in data["agents"]
        assert "Inquisitor" in data["agents"]
    
    @pytest.mark.asyncio
    async def test_create_space(self, client):
        """测试创建工作空间"""
        response = await client.post(
            "/api/spaces/",
            json={"title": "测试项目"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "测试项目"
        assert "id" in data
    
    @pytest.mark.asyncio
    async def test_get_demo_space(self, client):
        """测试获取演示空间"""
        response = await client.get("/api/spaces/demo")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "demo"
    
    @pytest.mark.asyncio
    async def test_send_message(self, client):
        """测试发送消息"""
        response = await client.post(
            "/api/spaces/demo/messages",
            json={"content": "我想做一个能被玩家推动的箱子", "role": "user"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "我想做一个能被玩家推动的箱子"
        assert data["role"] == "user"
        assert data["space_id"] == "demo"
    
    @pytest.mark.asyncio
    async def test_get_messages(self, client):
        """测试获取消息历史"""
        # 先发送一条消息
        await client.post(
            "/api/spaces/test-space/messages",
            json={"content": "测试消息", "role": "user"}
        )
        
        response = await client.get("/api/spaces/test-space/messages")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
    
    @pytest.mark.asyncio
    async def test_full_agent_task_flow(self):
        """测试完整的智能体任务流程"""
        # 重置黑板
        bb = blackboard
        bb.tasks = {"pending": [], "running": [], "completed": []}
        bb.resources = {"textures": {}, "scripts": {}, "test_results": {}}
        
        # 1. 模拟 Producer 分析需求并发布任务
        texture_task = Task(
            id="test-texture-task",
            type=TaskType.GENERATE_IMAGE,
            assigned_agent=AgentType.VOIDSHAPER,
            input={"prompt": "wooden crate texture for pushable box"},
        )
        
        code_task = Task(
            id="test-code-task",
            type=TaskType.WRITE_CODE,
            assigned_agent=AgentType.CODEWEAVER,
            input={"requirement": "create a pushable box with RigidBody2D"},
        )
        
        test_task = Task(
            id="test-test-task",
            type=TaskType.RUN_TEST,
            assigned_agent=AgentType.INQUISITOR,
            input={"target": "pushable_box.gd"},
        )
        
        await bb.publish_task(texture_task)
        await bb.publish_task(code_task)
        await bb.publish_task(test_task)
        
        assert len(bb.tasks["pending"]) == 3
        
        # 2. VoidShaper 处理纹理任务
        vs_task = await bb.claim_task(AgentType.VOIDSHAPER)
        assert vs_task is not None
        assert bb.agent_status[AgentType.VOIDSHAPER] == "busy"
        
        # 模拟生成纹理
        bb.update_resource("textures", "pushable_crate", "res://assets/pushable_crate.png")
        await bb.complete_task(vs_task.id, {"path": "res://assets/pushable_crate.png"})
        
        assert bb.agent_status[AgentType.VOIDSHAPER] == "idle"
        
        # 3. CodeWeaver 处理代码任务
        cw_task = await bb.claim_task(AgentType.CODEWEAVER)
        assert cw_task is not None
        
        # 验证可以获取纹理路径
        texture_path = bb.get_resource("textures", "pushable_crate")
        assert texture_path == "res://assets/pushable_crate.png"
        
        # 模拟生成代码
        code = f'''extends RigidBody2D
@onready var sprite = $Sprite2D
func _ready():
    sprite.texture = preload("{texture_path}")
    mass = 2.0
'''
        bb.update_resource("scripts", "pushable_crate", "res://scripts/pushable_crate.gd")
        await bb.complete_task(cw_task.id, {"code": code})
        
        # 4. Inquisitor 执行测试
        iq_task = await bb.claim_task(AgentType.INQUISITOR)
        assert iq_task is not None
        
        # 模拟测试结果
        test_result = {
            "passed": True,
            "total": 3,
            "passed_count": 3,
            "tests": [
                {"name": "test_crate_has_rigidbody", "passed": True},
                {"name": "test_crate_is_pushable", "passed": True},
                {"name": "test_crate_has_texture", "passed": True},
            ],
        }
        bb.update_resource("test_results", "pushable_crate", "PASSED: 3/3")
        await bb.complete_task(iq_task.id, test_result)
        
        # 5. 验证最终状态
        assert len(bb.tasks["completed"]) == 3
        assert len(bb.tasks["pending"]) == 0
        assert len(bb.tasks["running"]) == 0
        
        # 验证所有资源都已生成
        assert bb.get_resource("textures", "pushable_crate") is not None
        assert bb.get_resource("scripts", "pushable_crate") is not None
        assert bb.get_resource("test_results", "pushable_crate") is not None
        
        # 验证所有智能体都已空闲
        for agent in AgentType:
            assert bb.agent_status[agent] == "idle"
