'use client';

import { useRef, useEffect } from 'react';
import { MessageBubble, Message } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface ChatPanelProps {
    messages: Message[];
    onSendMessage: (content: string) => void;
    isProcessing?: boolean;
}

export function ChatPanel({ messages, onSendMessage, isProcessing }: ChatPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            {/* Messages Container */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                id="mind-output-main"
            >
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                    <div className="flex items-center gap-2 text-[var(--text-muted)] animate-pulse">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-producer)] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-[var(--color-producer)] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-[var(--color-producer)] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm">智能体正在思考...</span>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <MessageInput onSend={onSendMessage} disabled={isProcessing} />
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white mb-2">
                欢迎使用 AntiGravity
            </h3>
            <p className="text-[var(--text-secondary)] max-w-sm">
                描述您的需求，四个智能体将协同工作为您创造。
            </p>
            <div className="flex gap-4 mt-6">
                <AgentBadge icon="🎬" name="Producer" color="var(--color-producer)" />
                <AgentBadge icon="🎨" name="VoidShaper" color="var(--color-voidshaper)" />
                <AgentBadge icon="⚙️" name="CodeWeaver" color="var(--color-codeweaver)" />
                <AgentBadge icon="🔍" name="Inquisitor" color="var(--color-inquisitor)" />
            </div>
        </div>
    );
}

interface AgentBadgeProps {
    icon: string;
    name: string;
    color: string;
}

function AgentBadge({ icon, name, color }: AgentBadgeProps) {
    return (
        <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{ borderColor: color, color }}
        >
            <span>{icon}</span>
            <span className="text-xs font-medium">{name}</span>
        </div>
    );
}
