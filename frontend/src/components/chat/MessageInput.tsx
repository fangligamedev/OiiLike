'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Palette, Users } from 'lucide-react';

interface MessageInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function MessageInput({ onSend, disabled, placeholder = '输入您的需求...' }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [message]);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
            <div className="flex items-end gap-2 p-2 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
                {/* Quick Actions */}
                <div className="flex items-center gap-1 pb-1">
                    <QuickButton icon={<Plus size={18} />} label="添加" />
                    <QuickButton icon={<Palette size={18} />} label="风格" badge="143" />
                    <QuickButton icon={<Users size={18} />} label="角色" />
                </div>

                {/* Text Input */}
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder:text-[var(--text-muted)] min-h-[36px] max-h-[150px] py-2"
                />

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className={`
            p-2 rounded-full transition-all duration-200
            ${message.trim() && !disabled
                            ? 'bg-[var(--color-producer)] text-white shadow-[var(--glow-pink)] hover:scale-105'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
                        }
          `}
                >
                    <Send size={18} />
                </button>
            </div>

            {/* Hint Text */}
            <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
                按 Enter 发送，Shift + Enter 换行
            </p>
        </div>
    );
}

interface QuickButtonProps {
    icon: React.ReactNode;
    label: string;
    badge?: string;
}

function QuickButton({ icon, label, badge }: QuickButtonProps) {
    return (
        <button
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-white transition-colors"
            title={label}
        >
            {icon}
            {badge && (
                <span className="text-xs text-[var(--color-producer)]">{badge}</span>
            )}
        </button>
    );
}
