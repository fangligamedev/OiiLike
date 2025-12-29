"""
Assets API Routes
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter()


class AssetResponse(BaseModel):
    id: str
    space_id: str
    task_id: str
    type: str  # image, code, audio, test_report
    name: str
    url: str
    metadata: Optional[dict] = None
    created_at: datetime


# 内存存储
assets_db: dict = {}  # space_id -> List[Asset]


@router.get("/{asset_id}")
async def get_asset(asset_id: str):
    """获取资产详情"""
    for space_assets in assets_db.values():
        for asset in space_assets:
            if asset["id"] == asset_id:
                return AssetResponse(**asset)
    
    raise HTTPException(status_code=404, detail="Asset not found")


@router.get("/{asset_id}/download")
async def download_asset(asset_id: str):
    """下载资产"""
    for space_assets in assets_db.values():
        for asset in space_assets:
            if asset["id"] == asset_id:
                # 实际实现中应返回真实文件
                return {"download_url": asset.get("url", "#")}
    
    raise HTTPException(status_code=404, detail="Asset not found")


@router.get("/space/{space_id}", response_model=List[AssetResponse])
async def list_space_assets(space_id: str):
    """列出工作空间的所有资产"""
    assets = assets_db.get(space_id, [])
    return [AssetResponse(**asset) for asset in assets]
