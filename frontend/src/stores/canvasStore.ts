import { create } from 'zustand';
import { AgentType } from '@/config/agents';

export interface CanvasNode {
    id: string;
    type: 'image' | 'code' | 'test';
    title: string;
    agent: AgentType;
    x: number;
    y: number;
    width: number;
    height: number;
    content: string;
    previewUrl?: string;
}

interface CanvasState {
    nodes: CanvasNode[];
    selectedNodeId: string | null;
    zoom: number;
    pan: { x: number; y: number };

    // Actions
    addNode: (node: Omit<CanvasNode, 'id'>) => string;
    updateNode: (id: string, updates: Partial<CanvasNode>) => void;
    removeNode: (id: string) => void;
    selectNode: (id: string | null) => void;
    setZoom: (zoom: number) => void;
    setPan: (pan: { x: number; y: number }) => void;
    clearCanvas: () => void;
}

// Auto-layout helper
function getNextPosition(nodes: CanvasNode[]): { x: number; y: number } {
    if (nodes.length === 0) {
        return { x: 100, y: 100 };
    }
    const lastNode = nodes[nodes.length - 1];
    return {
        x: lastNode.x + lastNode.width + 80,
        y: lastNode.y,
    };
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    nodes: [],
    selectedNodeId: null,
    zoom: 1,
    pan: { x: 0, y: 0 },

    addNode: (node) => {
        const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const position = getNextPosition(get().nodes);

        set((state) => ({
            nodes: [
                ...state.nodes,
                {
                    ...node,
                    id,
                    x: node.x ?? position.x,
                    y: node.y ?? position.y,
                },
            ],
        }));

        return id;
    },

    updateNode: (id, updates) => set((state) => ({
        nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, ...updates } : node
        ),
    })),

    removeNode: (id) => set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== id),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

    selectNode: (id) => set({ selectedNodeId: id }),

    setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),

    setPan: (pan) => set({ pan }),

    clearCanvas: () => set({ nodes: [], selectedNodeId: null }),
}));
