"""
Messages API Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter()


class MessageCreate(BaseModel):
    content: str
    role: str = "user"


class MessageResponse(BaseModel):
    id: str
    space_id: str
    role: str
    content: str
    created_at: datetime
    metadata: Optional[dict] = None


# 内存存储
messages_db: dict = {}  # space_id -> List[Message]


@router.post("/spaces/{space_id}/messages", response_model=MessageResponse)
async def create_message(space_id: str, data: MessageCreate):
    """发送消息"""
    message_id = str(uuid.uuid4())
    now = datetime.now()
    
    message = {
        "id": message_id,
        "space_id": space_id,
        "role": data.role,
        "content": data.content,
        "created_at": now,
        "metadata": None,
    }
    
    if space_id not in messages_db:
        messages_db[space_id] = []
    
    messages_db[space_id].append(message)
    return MessageResponse(**message)


@router.get("/spaces/{space_id}/messages", response_model=List[MessageResponse])
async def get_messages(space_id: str, limit: int = 50, offset: int = 0):
    """获取消息历史"""
    messages = messages_db.get(space_id, [])
    return [MessageResponse(**msg) for msg in messages[offset:offset + limit]]
