"""
黑板系统单元测试
"""
import pytest
import asyncio
from datetime import datetime

from app.blackboard.blackboard import (
    Blackboard,
    Task,
    TaskType,
    TaskStatus,
    AgentType,
)


class TestBlackboard:
    """黑板系统测试"""
    
    @pytest.fixture
    def blackboard(self):
        """创建新的黑板实例"""
        return Blackboard()
    
    @pytest.fixture
    def sample_task(self):
        """创建示例任务"""
        return Task(
            id="task-001",
            type=TaskType.GENERATE_IMAGE,
            assigned_agent=AgentType.VOIDSHAPER,
            input={"prompt": "wooden crate texture"},
        )
    
    @pytest.mark.asyncio
    async def test_publish_task(self, blackboard, sample_task):
        """测试任务发布"""
        await blackboard.publish_task(sample_task)
        
        assert sample_task in blackboard.tasks["pending"]
        assert len(blackboard.tasks["pending"]) == 1
        assert len(blackboard.message_history) == 1
        assert blackboard.message_history[0].type == "task_publish"
    
    @pytest.mark.asyncio
    async def test_claim_task(self, blackboard, sample_task):
        """测试任务认领"""
        await blackboard.publish_task(sample_task)
        
        # VoidShaper 认领任务
        claimed = await blackboard.claim_task(AgentType.VOIDSHAPER)
        
        assert claimed is not None
        assert claimed.id == "task-001"
        assert claimed.status == TaskStatus.RUNNING
        assert blackboard.agent_status[AgentType.VOIDSHAPER] == "busy"
        assert len(blackboard.tasks["pending"]) == 0
        assert len(blackboard.tasks["running"]) == 1
    
    @pytest.mark.asyncio
    async def test_claim_task_wrong_agent(self, blackboard, sample_task):
        """测试错误的智能体认领任务"""
        await blackboard.publish_task(sample_task)
        
        # CodeWeaver 尝试认领 VoidShaper 的任务
        claimed = await blackboard.claim_task(AgentType.CODEWEAVER)
        
        assert claimed is None
        assert len(blackboard.tasks["pending"]) == 1
    
    @pytest.mark.asyncio
    async def test_complete_task(self, blackboard, sample_task):
        """测试任务完成"""
        await blackboard.publish_task(sample_task)
        await blackboard.claim_task(AgentType.VOIDSHAPER)
        
        output = {"path": "res://assets/crate.png"}
        await blackboard.complete_task("task-001", output)
        
        assert len(blackboard.tasks["running"]) == 0
        assert len(blackboard.tasks["completed"]) == 1
        
        completed_task = blackboard.tasks["completed"][0]
        assert completed_task.status == TaskStatus.COMPLETED
        assert completed_task.output == output
        assert completed_task.completed_at is not None
        assert blackboard.agent_status[AgentType.VOIDSHAPER] == "idle"
    
    def test_update_resource(self, blackboard):
        """测试资源更新"""
        blackboard.update_resource("textures", "crate", "res://assets/crate.png")
        
        assert blackboard.resources["textures"]["crate"] == "res://assets/crate.png"
        assert len(blackboard.message_history) == 1
        assert blackboard.message_history[0].type == "resource_update"
    
    def test_get_resource(self, blackboard):
        """测试资源获取"""
        blackboard.update_resource("textures", "crate", "res://assets/crate.png")
        
        path = blackboard.get_resource("textures", "crate")
        assert path == "res://assets/crate.png"
        
        # 不存在的资源
        missing = blackboard.get_resource("textures", "missing")
        assert missing is None
    
    def test_get_summary(self, blackboard):
        """测试状态摘要"""
        summary = blackboard.get_summary()
        
        assert "tasks" in summary
        assert "resources" in summary
        assert "agent_status" in summary
        assert summary["tasks"]["pending"] == 0
        assert summary["agent_status"]["producer"] == "idle"
    
    @pytest.mark.asyncio
    async def test_full_workflow(self, blackboard):
        """测试完整工作流程"""
        # 1. Producer 发布任务
        texture_task = Task(
            id="task-texture",
            type=TaskType.GENERATE_IMAGE,
            assigned_agent=AgentType.VOIDSHAPER,
            input={"prompt": "wooden crate"},
        )
        code_task = Task(
            id="task-code",
            type=TaskType.WRITE_CODE,
            assigned_agent=AgentType.CODEWEAVER,
            input={"requirement": "pushable box"},
        )
        
        await blackboard.publish_task(texture_task)
        await blackboard.publish_task(code_task)
        
        assert len(blackboard.tasks["pending"]) == 2
        
        # 2. VoidShaper 认领并完成任务
        vs_task = await blackboard.claim_task(AgentType.VOIDSHAPER)
        assert vs_task.id == "task-texture"
        
        blackboard.update_resource("textures", "crate", "res://crate.png")
        await blackboard.complete_task("task-texture", {"path": "res://crate.png"})
        
        # 3. CodeWeaver 认领并完成任务
        cw_task = await blackboard.claim_task(AgentType.CODEWEAVER)
        assert cw_task.id == "task-code"
        
        # 检查纹理路径是否可用
        texture_path = blackboard.get_resource("textures", "crate")
        assert texture_path == "res://crate.png"
        
        await blackboard.complete_task("task-code", {"code": "extends RigidBody2D"})
        
        # 4. 验证最终状态
        assert len(blackboard.tasks["completed"]) == 2
        assert len(blackboard.tasks["pending"]) == 0
        assert len(blackboard.tasks["running"]) == 0
        
        for agent in AgentType:
            assert blackboard.agent_status[agent] == "idle"
    
    @pytest.mark.asyncio
    async def test_subscription(self, blackboard, sample_task):
        """测试事件订阅"""
        received_events = []
        
        async def on_task_publish(task):
            received_events.append(("publish", task.id))
        
        async def on_task_complete(task):
            received_events.append(("complete", task.id))
        
        blackboard.subscribe("task_publish", on_task_publish)
        blackboard.subscribe("task_complete", on_task_complete)
        
        await blackboard.publish_task(sample_task)
        await blackboard.claim_task(AgentType.VOIDSHAPER)
        await blackboard.complete_task("task-001", {"result": "done"})
        
        assert ("publish", "task-001") in received_events
        assert ("complete", "task-001") in received_events
