import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store';
import { Button, Input, Select } from './ui';
import type { ModelInfo } from '../types';
import { PROVIDERS } from '../lib/providers';

interface ChatPanelProps {
  providerId: string;
  modelId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ providerId, modelId }) => {
  const { sessions, currentSessionId, createSession, addMessage, setLoading, isLoading } = useChatStore();
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(modelId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const provider = PROVIDERS.find(p => p.id === providerId);
  const currentSession = sessions.find(s => s.id === currentSessionId);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedModel) return;
    
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createSession(providerId, selectedModel);
    }
    
    const userMessage = {
      id: Math.random().toString(36).substring(2, 15),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };
    
    addMessage(sessionId, userMessage);
    setInput('');
    setLoading(true);
    
    // TODO: Implement actual API call via aiClient
    // For demo, simulate response
    setTimeout(() => {
      const assistantMessage = {
        id: Math.random().toString(36).substring(2, 15),
        role: 'assistant' as const,
        content: `這是來自 ${provider?.nameCn} - ${selectedModel} 的模擬回覆。\n\n您的問題是: ${userMessage.content}`,
        timestamp: new Date(),
      };
      addMessage(sessionId, assistantMessage);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${provider?.color}20` }}
          >
            {provider?.icon}
          </div>
          <div>
            <h2 className="font-medium">{provider?.nameCn}</h2>
            <Select
              options={provider?.models.map(m => ({ value: m.id, label: m.name })) || []}
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-sm py-1 min-w-[150px]"
            />
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">{provider?.icon}</div>
            <p className="text-lg">開始與 {provider?.name} 對話</p>
            <p className="text-sm mt-2">選擇模型並輸入您的問題</p>
          </div>
        ) : (
          currentSession.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-200' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="輸入您的問題..."
rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          按 Enter 發送，Shift + Enter 換行
        </p>
      </div>
    </div>
  );
};
