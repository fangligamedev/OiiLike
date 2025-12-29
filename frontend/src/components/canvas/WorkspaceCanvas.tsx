'use client';

import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Hand, MousePointer2, MessageSquare } from 'lucide-react';

interface CanvasNode {
    id: string;
    type: 'image' | 'code' | 'test';
    title: string;
    agent: string;
    x: number;
    y: number;
    width: number;
    height: number;
    content: string;
    previewUrl?: string;
}

interface WorkspaceCanvasProps {
    nodes: CanvasNode[];
    onNodeClick?: (node: CanvasNode) => void;
}

export function WorkspaceCanvas({ nodes, onNodeClick }: WorkspaceCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [tool, setTool] = useState<'select' | 'pan'>('select');
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === 'pan' || e.button === 1) {
            setIsPanning(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            setZoom(z => Math.max(0.5, Math.min(2, z - e.deltaY * 0.001)));
        } else {
            setPan(p => ({
                x: p.x - e.deltaX,
                y: p.y - e.deltaY,
            }));
        }
    };

    return (
        <div className="relative h-full bg-[var(--bg-primary)] overflow-hidden">
            {/* Grid Background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`,
                }}
            />

            {/* Canvas Area */}
            <div
                ref={containerRef}
                className={`absolute inset-0 ${isPanning ? 'cursor-grabbing' : tool === 'pan' ? 'cursor-grab' : 'cursor-default'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <div
                    className="absolute origin-top-left transition-transform duration-75"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    }}
                >
                    {nodes.map((node) => (
                        <CanvasNodeCard
                            key={node.id}
                            node={node}
                            onClick={() => onNodeClick?.(node)}
                        />
                    ))}

                    {/* Connection Lines */}
                    <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
                        {nodes.slice(0, -1).map((node, i) => {
                            const nextNode = nodes[i + 1];
                            if (!nextNode) return null;
                            return (
                                <ConnectionLine
                                    key={`${node.id}-${nextNode.id}`}
                                    from={{ x: node.x + node.width, y: node.y + node.height / 2 }}
                                    to={{ x: nextNode.x, y: nextNode.y + nextNode.height / 2 }}
                                />
                            );
                        })}
                    </svg>
                </div>
            </div>

            {/* Toolbar */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
                <ToolButton
                    icon={<MousePointer2 size={18} />}
                    active={tool === 'select'}
                    onClick={() => setTool('select')}
                    label="选择"
                />
                <ToolButton
                    icon={<Hand size={18} />}
                    active={tool === 'pan'}
                    onClick={() => setTool('pan')}
                    label="平移"
                />
                <div className="w-px h-6 bg-[var(--border-subtle)]" />
                <ToolButton icon={<ZoomOut size={18} />} onClick={handleZoomOut} label="缩小" />
                <span className="text-xs text-[var(--text-muted)] min-w-[40px] text-center">
                    {Math.round(zoom * 100)}%
                </span>
                <ToolButton icon={<ZoomIn size={18} />} onClick={handleZoomIn} label="放大" />
                <div className="w-px h-6 bg-[var(--border-subtle)]" />
                <ToolButton icon={<MessageSquare size={18} />} label="反馈" />
            </div>

            {/* Empty State */}
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <div className="text-4xl mb-2 opacity-30">🎨</div>
                        <p className="text-[var(--text-muted)]">智能体产出将在此展示</p>
                    </div>
                </div>
            )}
        </div>
    );
}

interface CanvasNodeCardProps {
    node: CanvasNode;
    onClick: () => void;
}

function CanvasNodeCard({ node, onClick }: CanvasNodeCardProps) {
    const agentColors: Record<string, string> = {
        producer: 'var(--color-producer)',
        voidshaper: 'var(--color-voidshaper)',
        codeweaver: 'var(--color-codeweaver)',
        inquisitor: 'var(--color-inquisitor)',
    };

    const color = agentColors[node.agent] || 'var(--border-subtle)';

    return (
        <div
            className="absolute glass rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
            style={{
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                borderColor: color,
                borderWidth: 2,
            }}
            onClick={onClick}
        >
            {/* Header */}
            <div
                className="px-3 py-2 flex items-center justify-between"
                style={{ backgroundColor: `${color}20` }}
            >
                <span className="text-xs font-medium" style={{ color }}>{node.title}</span>
                <span className="text-xs text-[var(--text-muted)]">{node.agent}</span>
            </div>

            {/* Content */}
            <div className="p-3">
                {node.type === 'image' && node.previewUrl ? (
                    <img src={node.previewUrl} alt={node.title} className="w-full h-auto rounded-lg" />
                ) : node.type === 'code' ? (
                    <pre className="text-xs text-[var(--text-secondary)] font-mono overflow-hidden max-h-[100px]">
                        {node.content}
                    </pre>
                ) : (
                    <p className="text-xs text-[var(--text-secondary)]">{node.content}</p>
                )}
            </div>

            {/* Download Button */}
            {node.type === 'image' && (
                <div className="px-3 pb-3">
                    <button
                        className="w-full py-2 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: color }}
                    >
                        下载
                    </button>
                </div>
            )}
        </div>
    );
}

interface ConnectionLineProps {
    from: { x: number; y: number };
    to: { x: number; y: number };
}

function ConnectionLine({ from, to }: ConnectionLineProps) {
    const midX = (from.x + to.x) / 2;
    const path = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;

    return (
        <path
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            strokeDasharray="5,5"
        />
    );
}

interface ToolButtonProps {
    icon: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    label: string;
}

function ToolButton({ icon, onClick, active, label }: ToolButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
        p-2 rounded-lg transition-colors
        ${active
                    ? 'bg-[var(--color-producer)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-white'
                }
      `}
            title={label}
        >
            {icon}
        </button>
    );
}
