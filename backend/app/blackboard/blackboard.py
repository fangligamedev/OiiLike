"""
Blackboard System - 智能体间共享状态的核心数据结构
采用发布-订阅模式实现解耦通信
"""
from typing import Dict, List, Any, Optional, Callable
from enum import Enum
from datetime import datetime
from dataclasses import dataclass, field
import asyncio
from collections import defaultdict


class AgentType(str, Enum):
    PRODUCER = "producer"
    VOIDSHAPER = "voidshaper"
    CODEWEAVER = "codeweaver"
    INQUISITOR = "inquisitor"


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskType(str, Enum):
    GENERATE_IMAGE = "generate_image"
    WRITE_CODE = "write_code"
    RUN_TEST = "run_test"
    REVIEW = "review"


@dataclass
class Task:
    id: str
    type: TaskType
    assigned_agent: AgentType
    input: Dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    output: Optional[Dict[str, Any]] = None
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None


@dataclass
class BlackboardMessage:
    type: str  # task_publish, task_claim, task_complete, resource_update
    sender: AgentType
    payload: Any
    timestamp: datetime = field(default_factory=datetime.now)


class Blackboard:
    """
    黑板系统 - 智能体间的通信中枢
    
    职责:
    - 管理任务队列
    - 共享资源(纹理、脚本、测试结果)
    - 追踪智能体状态
    - 发布订阅消息
    """
    
    def __init__(self):
        # 任务队列
        self.tasks: Dict[str, List[Task]] = {
            "pending": [],
            "running": [],
            "completed": [],
        }
        
        # 共享资源
        self.resources: Dict[str, Dict[str, str]] = {
            "textures": {},  # name -> path
            "scripts": {},   # name -> path
            "test_results": {},  # name -> result
        }
        
        # 智能体状态
        self.agent_status: Dict[AgentType, str] = {
            agent: "idle" for agent in AgentType
        }
        
        # 用户上下文
        self.context: Dict[str, Any] = {
            "original_request": "",
            "project_type": "godot",
            "preferences": {},
        }
        
        # 消息历史
        self.message_history: List[BlackboardMessage] = []
        
        # 订阅者
        self._subscribers: Dict[str, List[Callable]] = defaultdict(list)
        
        # 锁，用于并发控制
        self._lock = asyncio.Lock()
    
    async def publish_task(self, task: Task) -> None:
        """发布任务到黑板"""
        async with self._lock:
            self.tasks["pending"].append(task)
            
            message = BlackboardMessage(
                type="task_publish",
                sender=AgentType.PRODUCER,
                payload={"task_id": task.id, "task_type": task.type.value},
            )
            self.message_history.append(message)
            
            await self._notify_subscribers("task_publish", task)
    
    async def claim_task(self, agent: AgentType) -> Optional[Task]:
        """智能体认领任务"""
        async with self._lock:
            for task in self.tasks["pending"]:
                if task.assigned_agent == agent:
                    self.tasks["pending"].remove(task)
                    task.status = TaskStatus.RUNNING
                    self.tasks["running"].append(task)
                    self.agent_status[agent] = "busy"
                    
                    message = BlackboardMessage(
                        type="task_claim",
                        sender=agent,
                        payload={"task_id": task.id},
                    )
                    self.message_history.append(message)
                    
                    return task
            return None
    
    async def complete_task(self, task_id: str, output: Dict[str, Any]) -> None:
        """完成任务"""
        async with self._lock:
            for task in self.tasks["running"]:
                if task.id == task_id:
                    self.tasks["running"].remove(task)
                    task.status = TaskStatus.COMPLETED
                    task.output = output
                    task.completed_at = datetime.now()
                    self.tasks["completed"].append(task)
                    self.agent_status[task.assigned_agent] = "idle"
                    
                    message = BlackboardMessage(
                        type="task_complete",
                        sender=task.assigned_agent,
                        payload={"task_id": task.id, "output": output},
                    )
                    self.message_history.append(message)
                    
                    await self._notify_subscribers("task_complete", task)
                    break
    
    def update_resource(self, category: str, name: str, value: str) -> None:
        """更新共享资源"""
        if category in self.resources:
            self.resources[category][name] = value
            
            message = BlackboardMessage(
                type="resource_update",
                sender=AgentType.PRODUCER,  # 默认发送者
                payload={"category": category, "name": name, "value": value},
            )
            self.message_history.append(message)
    
    def get_resource(self, category: str, name: str) -> Optional[str]:
        """获取共享资源"""
        return self.resources.get(category, {}).get(name)
    
    def get_pending_tasks_for_agent(self, agent: AgentType) -> List[Task]:
        """获取指定智能体的待处理任务"""
        return [t for t in self.tasks["pending"] if t.assigned_agent == agent]
    
    def subscribe(self, event_type: str, callback: Callable) -> None:
        """订阅事件"""
        self._subscribers[event_type].append(callback)
    
    async def _notify_subscribers(self, event_type: str, data: Any) -> None:
        """通知订阅者"""
        for callback in self._subscribers[event_type]:
            if asyncio.iscoroutinefunction(callback):
                await callback(data)
            else:
                callback(data)
    
    def get_summary(self) -> Dict[str, Any]:
        """获取黑板状态摘要"""
        return {
            "tasks": {
                "pending": len(self.tasks["pending"]),
                "running": len(self.tasks["running"]),
                "completed": len(self.tasks["completed"]),
            },
            "resources": {
                category: list(items.keys())
                for category, items in self.resources.items()
            },
            "agent_status": {
                agent.value: status
                for agent, status in self.agent_status.items()
            },
        }


# 全局黑板实例
blackboard = Blackboard()
