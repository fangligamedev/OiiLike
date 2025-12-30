'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { AgentAvatar } from '@/components/agents/AgentAvatar';
import { AgentType, getAgentConfig } from '@/config/agents';

export interface StatusItem {
    id: string;
    text: string;
    status: 'pending' | 'running' | 'completed' | 'error';
}

export interface Message {
    id: string;
    role: 'user' | AgentType;
    content: string;
    timestamp: Date;
    thinkingProcess?: string;
    statusItems?: StatusItem[];
    isStreaming?: boolean;
}

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const [showThinking, setShowThinking] = useState(false);
    const isUser = message.role === 'user';
    const agentConfig = !isUser ? getAgentConfig(message.role as AgentType) : null;

    return (
        <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {isUser ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    U
                </div>
            ) : (
                <AgentAvatar agent={message.role as AgentType} size="md" />
            )}

            {/* Content */}
            <div className={`flex-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                {/* Agent Name */}
                {!isUser && agentConfig && (
                    <div className="flex items-center gap-2">
                        <span style={{ color: agentConfig.color }} className="text-base font-medium">
                            {agentConfig.chineseName}
                        </span>
                        <span className="text-sm text-[var(--text-muted)]">
                            {agentConfig.name}
                        </span>
                    </div>
                )}

                {/* Message Content */}
                <div
                    className={`
            px-5 py-4 rounded-2xl shadow-sm
            ${isUser
                            ? 'bg-[var(--color-producer)] text-white rounded-tr-md'
                            : 'bg-[var(--bg-panel)] text-[var(--text-primary)] rounded-tl-md border border-[var(--border-subtle)]'
                        }
          `}
                >
                    <p className="text-lg leading-8 whitespace-pre-wrap break-words">
                        {message.content}
                        {message.isStreaming && (
                            <span className="inline-block w-2.5 h-5 ml-1 bg-current animate-pulse" />
                        )}
                    </p>
                </div>

                {/* Status Items */}
                {message.statusItems && message.statusItems.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-full">
                        {message.statusItems.map((item) => (
                            <StatusCard key={item.id} item={item} agentColor={agentConfig?.color} />
                        ))}
                    </div>
                )}

                {/* Thinking Process Toggle */}
                {message.thinkingProcess && (
                    <button
                        onClick={() => setShowThinking(!showThinking)}
                        className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                        {showThinking ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        展示思考过程
                    </button>
                )}

                {/* Thinking Process Content */}
                {showThinking && message.thinkingProcess && (
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] animate-fade-in">
                        <pre className="whitespace-pre-wrap font-mono">{message.thinkingProcess}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

interface StatusCardProps {
    item: StatusItem;
    agentColor?: string;
}

function StatusCard({ item, agentColor }: StatusCardProps) {
    const getStatusIcon = () => {
        switch (item.status) {
            case 'completed':
                return <Check size={16} className="text-[var(--status-success)]" />;
            case 'running':
                return <Loader2 size={16} className="text-[var(--status-pending)] animate-spin" />;
            case 'error':
                return <AlertCircle size={16} className="text-[var(--status-error)]" />;
            default:
                return <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--text-muted)]" />;
        }
    };

    return (
        <div
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border-l-4 shadow-sm"
            style={{ borderLeftColor: agentColor || 'var(--border-subtle)' }}
        >
            <div className="flex-shrink-0">{getStatusIcon()}</div>
            <span className="text-sm text-[var(--text-secondary)] break-words leading-relaxed">{item.text}</span>
        </div>
    );
}
