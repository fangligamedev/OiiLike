'use client';

import { useState } from 'react';

import { Navbar } from '@/components/layout/Navbar';
import { Header } from '@/components/layout/Header';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { WorkspaceCanvas } from '@/components/canvas/WorkspaceCanvas';
import { useChatStore } from '@/stores/chatStore';
import { useCanvasStore, CanvasNode } from '@/stores/canvasStore';
import { AgentType } from '@/config/agents';
import { Message } from '@/components/chat/MessageBubble';

// 模拟智能体工作流程
async function simulateAgentWorkflow(
    userMessage: string,
    addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void,
    addNode: (node: Omit<CanvasNode, 'id'>) => string,
    setProcessing: (p: boolean) => void
) {
    setProcessing(true);

    // Step 1: Producer responds
    await delay(500);
    const producerMsgId = Date.now().toString();
    addMessage({
        role: 'producer' as AgentType,
        content: '收到需求，正在分析任务并分配给相关智能体...',
        statusItems: [
            { id: 's1', text: '已获取知识库', status: 'completed' },
            { id: 's2', text: '正在解析需求意图', status: 'running' },
        ],
        thinkingProcess: `分析用户请求: "${userMessage}"\n\n需要的资源:\n1. 视觉资产 -> VoidShaper\n2. 代码逻辑 -> CodeWeaver\n3. 质量验证 -> Inquisitor`,
    });

    // Step 2: Update Producer, VoidShaper starts
    await delay(1500);
    addMessage({
        role: 'voidshaper' as AgentType,
        content: '🎨 开始生成视觉资产...',
        statusItems: [
            { id: 'vs1', text: '正在调用 Stable Diffusion', status: 'running' },
        ],
    });

    // Step 3: VoidShaper produces asset
    await delay(2000);
    addNode({
        type: 'image',
        title: '木箱纹理',
        agent: 'voidshaper' as AgentType,
        x: 100,
        y: 100,
        width: 280,
        height: 320,
        content: '生成的木箱纹理',
        previewUrl: 'https://via.placeholder.com/256x256/8B5CF6/ffffff?text=Crate+Texture',
    });

    addMessage({
        role: 'voidshaper' as AgentType,
        content: '✅ 纹理生成完成！已添加到画布。',
        statusItems: [
            { id: 'vs2', text: '纹理已生成并导入', status: 'completed' },
            { id: 'vs3', text: '路径: res://assets/crate.png', status: 'completed' },
        ],
    });

    // Step 4: CodeWeaver starts
    await delay(1000);
    addMessage({
        role: 'codeweaver' as AgentType,
        content: '⚙️ 开始编写推动逻辑代码...',
        statusItems: [
            { id: 'cw1', text: '已获取纹理路径', status: 'completed' },
            { id: 'cw2', text: '正在生成 GDScript', status: 'running' },
        ],
        thinkingProcess: `检测到纹理路径: res://assets/crate.png\n\n需要实现:\n- RigidBody2D 节点\n- Sprite2D 组件\n- 碰撞层配置`,
    });

    // Step 5: CodeWeaver produces code
    await delay(2000);
    const codeContent = `extends RigidBody2D

@onready var sprite = $Sprite2D

func _ready():
    sprite.texture = preload("res://assets/crate.png")
    mass = 2.0
    physics_material_override = PhysicsMaterial.new()
    physics_material_override.friction = 0.8`;

    addNode({
        type: 'code',
        title: 'pushable_crate.gd',
        agent: 'codeweaver' as AgentType,
        x: 420,
        y: 100,
        width: 320,
        height: 280,
        content: codeContent,
    });

    addMessage({
        role: 'codeweaver' as AgentType,
        content: '✅ 推动逻辑代码已完成！',
        statusItems: [
            { id: 'cw3', text: 'GDScript 生成完成', status: 'completed' },
            { id: 'cw4', text: '语法检查通过', status: 'completed' },
        ],
    });

    // Step 6: Inquisitor tests
    await delay(1000);
    addMessage({
        role: 'inquisitor' as AgentType,
        content: '🔍 开始质量验证与自动化测试...',
        statusItems: [
            { id: 'iq1', text: '正在生成测试用例', status: 'running' },
        ],
    });

    await delay(1500);
    addNode({
        type: 'test',
        title: 'test_pushable_crate.gd',
        agent: 'inquisitor' as AgentType,
        x: 780,
        y: 100,
        width: 280,
        height: 200,
        content: `✅ 测试通过: 3/3\n\n• test_crate_has_rigidbody ✓\n• test_crate_is_pushable ✓\n• test_crate_has_texture ✓`,
    });

    addMessage({
        role: 'inquisitor' as AgentType,
        content: '✅ 所有测试通过！功能验证完成。',
        statusItems: [
            { id: 'iq2', text: '测试用例生成完成', status: 'completed' },
            { id: 'iq3', text: 'GUT 测试: 3/3 通过', status: 'completed' },
        ],
    });

    // Step 7: Producer final review
    await delay(1000);
    addMessage({
        role: 'producer' as AgentType,
        content: '🎬 验收通过！\n\n您的"可推动箱子"功能已完成：\n- 木箱纹理素材 ✓\n- 推动物理逻辑 ✓\n- 自动化测试 ✓\n\n所有产出已同步到画布，可直接下载使用。',
        statusItems: [
            { id: 'p1', text: '审美审核通过', status: 'completed' },
            { id: 'p2', text: '功能验收通过', status: 'completed' },
            { id: 'p3', text: '任务完成', status: 'completed' },
        ],
    });

    setProcessing(false);
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function SpacePage() {
    const [spaceTitle, setSpaceTitle] = useState('推箱子功能开发');
    const { messages, isProcessing, addMessage, setProcessing, clearMessages } = useChatStore();
    const { nodes, addNode, clearCanvas } = useCanvasStore();

    const handleSendMessage = async (content: string) => {
        // Add user message
        addMessage({
            role: 'user',
            content,
        });

        // Clear previous demo data if fresh start
        if (messages.length === 0) {
            clearCanvas();
        }

        // Simulate agent workflow
        await simulateAgentWorkflow(content, addMessage, addNode, setProcessing);
    };

    const handleNodeClick = (node: CanvasNode) => {
        console.log('Node clicked:', node);
    };

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col mr-[60px]">
                {/* Header */}
                <Header title={spaceTitle} points={635} onTitleChange={setSpaceTitle} />

                {/* Workspace */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Chat Panel - Fixed width */}
                    <div className="w-[480px] min-w-[400px] max-w-[600px] flex-shrink-0 border-r border-[var(--border-subtle)]">
                        <ChatPanel
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isProcessing={isProcessing}
                        />
                    </div>

                    {/* Canvas Panel - Flex grow */}
                    <div className="flex-1">
                        <WorkspaceCanvas
                            nodes={nodes as any}
                            onNodeClick={handleNodeClick as any}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
