export type AgentType = 'producer' | 'voidshaper' | 'codeweaver' | 'inquisitor';

export interface AgentConfig {
    id: AgentType;
    name: string;
    chineseName: string;
    icon: string;
    color: string;
    glowClass: string;
    description: string;
    personality: string;
}

export const AGENTS: Record<AgentType, AgentConfig> = {
    producer: {
        id: 'producer',
        name: 'Producer',
        chineseName: '制作人',
        icon: '🎬',
        color: '#FF3399',
        glowClass: 'shadow-[0_0_20px_rgba(255,51,153,0.4)]',
        description: '项目总负责人，统筹全局任务进度',
        personality: '沉稳果决、统筹力极强，对成果质量有严苛要求',
    },
    voidshaper: {
        id: 'voidshaper',
        name: 'VoidShaper',
        chineseName: '虚空塑形者',
        icon: '🎨',
        color: '#8B5CF6',
        glowClass: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]',
        description: '负责所有非代码资产的生成与处理',
        personality: '感性细腻、富有创造力，对色彩与风格敏感度极高',
    },
    codeweaver: {
        id: 'codeweaver',
        name: 'CodeWeaver',
        chineseName: '代码编织者',
        icon: '⚙️',
        color: '#10B981',
        glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
        description: '专注于 GDScript/C# 代码的生成、重构与修复',
        personality: '严谨细致、逻辑缜密，对语法错误零容忍',
    },
    inquisitor: {
        id: 'inquisitor',
        name: 'Inquisitor',
        chineseName: '审判官',
        icon: '🔍',
        color: '#F59E0B',
        glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
        description: '质量保证与自动化测试',
        personality: '审慎较真、一丝不苟，是系统的纠错卫士',
    },
};

export function getAgentConfig(agentType: AgentType): AgentConfig {
    return AGENTS[agentType];
}

export function getAgentColor(agentType: AgentType): string {
    return AGENTS[agentType].color;
}
