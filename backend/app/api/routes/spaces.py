"""
Spaces API Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter()


class SpaceCreate(BaseModel):
    title: str = "未命名项目"


class SpaceResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime


# 内存存储（生产环境应使用数据库）
spaces_db: dict = {}


@router.post("/", response_model=SpaceResponse)
async def create_space(data: SpaceCreate):
    """创建新的工作空间"""
    space_id = str(uuid.uuid4())
    now = datetime.now()
    
    space = {
        "id": space_id,
        "title": data.title,
        "created_at": now,
        "updated_at": now,
    }
    
    spaces_db[space_id] = space
    return SpaceResponse(**space)


@router.get("/{space_id}", response_model=SpaceResponse)
async def get_space(space_id: str):
    """获取工作空间详情"""
    if space_id not in spaces_db:
        # 创建一个默认空间用于演示
        if space_id == "demo":
            now = datetime.now()
            spaces_db[space_id] = {
                "id": space_id,
                "title": "推箱子功能开发",
                "created_at": now,
                "updated_at": now,
            }
        else:
            raise HTTPException(status_code=404, detail="Space not found")
    
    return SpaceResponse(**spaces_db[space_id])


@router.delete("/{space_id}")
async def delete_space(space_id: str):
    """删除工作空间"""
    if space_id not in spaces_db:
        raise HTTPException(status_code=404, detail="Space not found")
    
    del spaces_db[space_id]
    return {"message": "Space deleted"}


@router.get("/", response_model=List[SpaceResponse])
async def list_spaces():
    """列出所有工作空间"""
    return [SpaceResponse(**space) for space in spaces_db.values()]
