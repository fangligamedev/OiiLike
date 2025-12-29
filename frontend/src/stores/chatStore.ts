import { create } from 'zustand';
import { AgentType } from '@/config/agents';
import { Message, StatusItem } from '@/components/chat/MessageBubble';

interface ChatState {
    messages: Message[];
    isProcessing: boolean;

    // Actions
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    addStatusItem: (messageId: string, item: StatusItem) => void;
    updateStatusItem: (messageId: string, itemId: string, updates: Partial<StatusItem>) => void;
    setProcessing: (isProcessing: boolean) => void;
    clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    isProcessing: false,

    addMessage: (message) => set((state) => ({
        messages: [
            ...state.messages,
            {
                ...message,
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
            },
        ],
    })),

    updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
        ),
    })),

    addStatusItem: (messageId, item) => set((state) => ({
        messages: state.messages.map((msg) =>
            msg.id === messageId
                ? { ...msg, statusItems: [...(msg.statusItems || []), item] }
                : msg
        ),
    })),

    updateStatusItem: (messageId, itemId, updates) => set((state) => ({
        messages: state.messages.map((msg) =>
            msg.id === messageId
                ? {
                    ...msg,
                    statusItems: msg.statusItems?.map((item) =>
                        item.id === itemId ? { ...item, ...updates } : item
                    ),
                }
                : msg
        ),
    })),

    setProcessing: (isProcessing) => set({ isProcessing }),

    clearMessages: () => set({ messages: [] }),
}));
