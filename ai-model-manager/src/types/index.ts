// AI Model Provider Types

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  inputCostPer1M?: number; // USD per 1M tokens
  outputCostPer1M?: number;
  maxOutputTokens?: number;
  supportsVision?: boolean;
  supportsFunctionCalling?: boolean;
}

export interface ProviderConfig {
  id: string;
  name: string;
  nameCn: string;
  icon: string;
  color: string;
  apiEndpoint?: string;
  website: string;
  authType: 'api-key' | 'oauth' | 'both';
  models: ModelInfo[];
  status: 'active' | 'inactive' | 'error';
  apiKeyConfigured: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  timestamp: Date;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface ChatSession {
  id: string;
  provider: string;
  model: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKeyConfig {
  providerId: string;
  apiKey: string;
  isValid?: boolean;
  lastValidated?: Date;
}

export interface ChatRequest {
  provider: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  model: string;
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  latency?: number; // ms
}

export interface StreamChunk {
  delta: string;
  done: boolean;
}

// Provider IDs
export type ProviderId = 
  | 'openai'
  | 'anthropic'
  | 'perplexity'
  | 'nvidia'
  | 'exa'
  | 'grok'
  | 'github'
  | 'deepseek'
  | 'minimax'
  | 'minimaxi'
  | 'tencent'
  | 'aliyun';
