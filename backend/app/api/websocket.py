"""
WebSocket 事件处理
使用 python-socketio 实现实时通信
"""
import socketio
from typing import Dict, Any
import asyncio

from app.blackboard.blackboard import blackboard, AgentType, Task, TaskType, TaskStatus
import uuid

# 创建 Socket.IO 服务器
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
)


@sio.event
async def connect(sid: str, environ: Dict[str, Any]):
    """客户端连接"""
    print(f"Client connected: {sid}")
    await sio.emit('connected', {'sid': sid}, room=sid)


@sio.event
async def disconnect(sid: str):
    """客户端断开连接"""
    print(f"Client disconnected: {sid}")


@sio.event
async def join_space(sid: str, data: Dict[str, Any]):
    """加入工作空间"""
    space_id = data.get('spaceId')
    if space_id:
        sio.enter_room(sid, space_id)
        await sio.emit('joined_space', {'spaceId': space_id}, room=sid)
        print(f"Client {sid} joined space {space_id}")


@sio.event
async def user_message(sid: str, data: Dict[str, Any]):
    """
    处理用户消息，触发智能体工作流
    """
    content = data.get('content', '')
    space_id = data.get('spaceId', 'default')
    
    # 更新黑板上下文
    blackboard.context['original_request'] = content
    
    # 模拟智能体工作流
    await simulate_agent_workflow(sid, space_id, content)


async def simulate_agent_workflow(sid: str, space_id: str, user_message: str):
    """
    模拟四智能体协作流程
    """
    # Step 1: Producer 分析需求
    await sio.emit('agent:thinking', {
        'agent': 'producer',
        'content': '正在分析需求...',
    }, room=space_id)
    
    await asyncio.sleep(0.5)
    
    await sio.emit('agent:message', {
        'agent': 'producer',
        'content': '收到需求，正在分析任务并分配给相关智能体...',
        'status': 'complete',
        'statusItems': [
            {'id': 's1', 'text': '已获取知识库', 'status': 'completed'},
            {'id': 's2', 'text': '需求解析完成', 'status': 'completed'},
        ],
    }, room=space_id)
    
    # 发布任务到黑板
    texture_task = Task(
        id=str(uuid.uuid4()),
        type=TaskType.GENERATE_IMAGE,
        assigned_agent=AgentType.VOIDSHAPER,
        input={'prompt': f'为以下需求生成纹理: {user_message}'},
    )
    await blackboard.publish_task(texture_task)
    
    code_task = Task(
        id=str(uuid.uuid4()),
        type=TaskType.WRITE_CODE,
        assigned_agent=AgentType.CODEWEAVER,
        input={'requirement': user_message},
    )
    await blackboard.publish_task(code_task)
    
    # Step 2: VoidShaper 生成资产
    await sio.emit('task:update', {
        'taskId': texture_task.id,
        'agent': 'voidshaper',
        'status': 'running',
        'progress': 0,
    }, room=space_id)
    
    await asyncio.sleep(1)
    
    await sio.emit('agent:message', {
        'agent': 'voidshaper',
        'content': '🎨 开始生成视觉资产...',
        'status': 'streaming',
    }, room=space_id)
    
    await asyncio.sleep(1.5)
    
    # 更新资源
    blackboard.update_resource('textures', 'crate', 'res://assets/crate.png')
    
    await sio.emit('asset:created', {
        'assetId': str(uuid.uuid4()),
        'type': 'image',
        'url': 'https://via.placeholder.com/256x256/8B5CF6/ffffff?text=Texture',
        'agent': 'voidshaper',
        'title': '生成的纹理',
    }, room=space_id)
    
    await sio.emit('agent:message', {
        'agent': 'voidshaper',
        'content': '✅ 纹理生成完成！',
        'status': 'complete',
        'statusItems': [
            {'id': 'vs1', 'text': '纹理已生成并导入', 'status': 'completed'},
        ],
    }, room=space_id)
    
    await blackboard.complete_task(texture_task.id, {'path': 'res://assets/crate.png'})
    
    # Step 3: CodeWeaver 编写代码
    await sio.emit('agent:message', {
        'agent': 'codeweaver',
        'content': '⚙️ 开始编写代码逻辑...',
        'status': 'streaming',
    }, room=space_id)
    
    await asyncio.sleep(1.5)
    
    code_content = '''extends RigidBody2D

func _ready():
    mass = 2.0
'''
    
    await sio.emit('asset:created', {
        'assetId': str(uuid.uuid4()),
        'type': 'code',
        'content': code_content,
        'agent': 'codeweaver',
        'title': 'script.gd',
    }, room=space_id)
    
    await sio.emit('agent:message', {
        'agent': 'codeweaver',
        'content': '✅ 代码编写完成！',
        'status': 'complete',
        'statusItems': [
            {'id': 'cw1', 'text': 'GDScript 生成完成', 'status': 'completed'},
            {'id': 'cw2', 'text': '语法检查通过', 'status': 'completed'},
        ],
    }, room=space_id)
    
    await blackboard.complete_task(code_task.id, {'code': code_content})
    
    # Step 4: Inquisitor 测试
    test_task = Task(
        id=str(uuid.uuid4()),
        type=TaskType.RUN_TEST,
        assigned_agent=AgentType.INQUISITOR,
        input={'code': code_content},
    )
    await blackboard.publish_task(test_task)
    
    await sio.emit('agent:message', {
        'agent': 'inquisitor',
        'content': '🔍 开始质量验证...',
        'status': 'streaming',
    }, room=space_id)
    
    await asyncio.sleep(1)
    
    await sio.emit('agent:message', {
        'agent': 'inquisitor',
        'content': '✅ 所有测试通过！',
        'status': 'complete',
        'statusItems': [
            {'id': 'iq1', 'text': 'GUT 测试: 3/3 通过', 'status': 'completed'},
        ],
    }, room=space_id)
    
    await blackboard.complete_task(test_task.id, {'passed': True, 'tests': 3})
    
    # Step 5: Producer 验收
    await sio.emit('agent:message', {
        'agent': 'producer',
        'content': '🎬 验收通过！所有任务已完成。',
        'status': 'complete',
        'statusItems': [
            {'id': 'p1', 'text': '审美审核通过', 'status': 'completed'},
            {'id': 'p2', 'text': '功能验收通过', 'status': 'completed'},
        ],
    }, room=space_id)
    
    # 发送黑板状态
    await sio.emit('blackboard:update', blackboard.get_summary(), room=space_id)


@sio.event
async def canvas_update(sid: str, data: Dict[str, Any]):
    """画布更新"""
    space_id = data.get('spaceId')
    if space_id:
        await sio.emit('canvas:updated', data, room=space_id, skip_sid=sid)
