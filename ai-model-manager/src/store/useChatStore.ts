import { create } from 'zustand';
import type { ChatMessage, ChatSession } from '../types';

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createSession: (provider: string, model: string) => string;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string | null) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateLastMessage: (sessionId: string, content: string) => void;
  clearSession: (sessionId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getCurrentSession: () => ChatSession | null;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  error: null,
  
  createSession: (provider: string, model: string) => {
    const id = generateId();
    const newSession: ChatSession = {
      id,
      provider,
      model,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: id,
    }));
    
    return id;
  },
  
  deleteSession: (sessionId: string) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
    }));
  },
  
  setCurrentSession: (sessionId: string | null) => {
    set({ currentSessionId: sessionId });
  },
  
  addMessage: (sessionId: string, message: ChatMessage) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, message], updatedAt: new Date() }
          : s
      ),
    }));
  },
  
  updateLastMessage: (sessionId: string, content: string) => {
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id !== sessionId) return s;
        const messages = [...s.messages];
        if (messages.length > 0) {
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content: messages[messages.length - 1].content + content,
          };
        }
        return { ...s, messages, updatedAt: new Date() };
      }),
    }));
  },
  
  clearSession: (sessionId: string) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, messages: [] } : s
      ),
    }));
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    return sessions.find((s) => s.id === currentSessionId) || null;
  },
}));
