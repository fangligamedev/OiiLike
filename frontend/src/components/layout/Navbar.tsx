'use client';

import { Home, Plus, User } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
    return (
        <nav className="fixed right-0 top-0 h-full w-[60px] flex flex-col items-center py-4 bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] z-50">
            {/* Logo */}
            <div className="mb-8">
                <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-producer)] to-[var(--color-voidshaper)] text-white font-bold text-lg">
                    AG
                </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col items-center gap-4 flex-1">
                <NavItem href="/" icon={<Home size={20} />} label="首页" active />
                <NavItem href="/space/new" icon={<Plus size={20} />} label="新建" isCreate />
            </div>

            {/* User */}
            <div className="mt-auto">
                <NavItem href="/profile" icon={<User size={20} />} label="用户" />
            </div>
        </nav>
    );
}

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    isCreate?: boolean;
}

function NavItem({ href, icon, label, active, isCreate }: NavItemProps) {
    return (
        <Link
            href={href}
            className={`
        group relative flex items-center justify-center w-10 h-10 rounded-xl
        transition-all duration-200
        ${active
                    ? 'bg-[var(--color-producer)] text-white shadow-[var(--glow-pink)]'
                    : isCreate
                        ? 'bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:bg-[var(--color-producer)] hover:text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-panel)] hover:text-white'
                }
      `}
        >
            {icon}
            {/* Tooltip */}
            <span className="absolute left-14 px-2 py-1 rounded-md bg-[var(--bg-panel)] text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {label}
            </span>
        </Link>
    );
}
