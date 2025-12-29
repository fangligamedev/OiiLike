'use client';

import { AgentType, getAgentConfig } from '@/config/agents';

interface AgentAvatarProps {
    agent: AgentType;
    size?: 'sm' | 'md' | 'lg';
    showGlow?: boolean;
    showName?: boolean;
}

const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-lg',
    lg: 'w-12 h-12 text-2xl',
};

export function AgentAvatar({ agent, size = 'md', showGlow = true, showName = false }: AgentAvatarProps) {
    const config = getAgentConfig(agent);

    return (
        <div className="flex items-center gap-2">
            <div
                className={`
          ${sizeClasses[size]}
          flex items-center justify-center rounded-full
          ${showGlow ? config.glowClass : ''}
          transition-all duration-200
        `}
                style={{
                    backgroundColor: `${config.color}20`,
                    border: `2px solid ${config.color}`
                }}
            >
                <span role="img" aria-label={config.name}>
                    {config.icon}
                </span>
            </div>

            {showName && (
                <div className="flex flex-col">
                    <span
                        className="text-sm font-medium"
                        style={{ color: config.color }}
                    >
                        {config.chineseName}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                        {config.name}
                    </span>
                </div>
            )}
        </div>
    );
}
