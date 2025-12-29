"""
AntiGravity Backend - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from app.api.routes import spaces, messages, assets
from app.api.websocket import sio

app = FastAPI(
    title="AntiGravity API",
    description="多智能体协作平台后端 API",
    version="1.0.0",
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO应用
socket_app = socketio.ASGIApp(sio, app)

# 注册路由
app.include_router(spaces.router, prefix="/api/spaces", tags=["Spaces"])
app.include_router(messages.router, prefix="/api", tags=["Messages"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])


@app.get("/")
async def root():
    return {
        "name": "AntiGravity API",
        "version": "1.0.0",
        "agents": ["Producer", "VoidShaper", "CodeWeaver", "Inquisitor"],
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
