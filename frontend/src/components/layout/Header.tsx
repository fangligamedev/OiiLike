'use client';

import { Share2, Pencil, Coins } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
    title?: string;
    points?: number;
    onTitleChange?: (title: string) => void;
}

export function Header({ title = '未命名项目', points = 0, onTitleChange }: HeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title);

    const handleSave = () => {
        setIsEditing(false);
        onTitleChange?.(editTitle);
    };

    return (
        <header className="h-14 flex items-center justify-between px-4 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[var(--color-producer)]">
                    AntiGravity <span className="text-[var(--text-muted)]">Beta</span>
                </span>

                <div className="w-px h-6 bg-[var(--border-subtle)]" />

                {/* Editable Title */}
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            className="bg-transparent border-b border-[var(--color-producer)] outline-none text-white px-1"
                            autoFocus
                        />
                    ) : (
                        <>
                            <span className="text-white font-medium">{title}</span>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 rounded hover:bg-[var(--bg-panel)] text-[var(--text-muted)] hover:text-white transition-colors"
                            >
                                <Pencil size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Right: Points & Share */}
            <div className="flex items-center gap-4">
                {/* Points Display */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
                    <Coins size={16} className="text-[var(--color-producer)]" />
                    <span className="text-sm font-medium">{points}</span>
                    <span className="text-xs text-[var(--text-muted)]">积分</span>
                </div>

                {/* Share Button */}
                <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--color-producer)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    <Share2 size={16} />
                    分享
                </button>
            </div>
        </header>
    );
}
