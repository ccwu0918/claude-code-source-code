import type { ChatRequest, ChatResponse, StreamChunk } from '../types';
import { PROVIDERS } from '../lib/providers';

type StreamCallback = (chunk: StreamChunk) => void;

class AIAPIClient {
  private getProviderConfig(providerId: string) {
    return PROVIDERS.find((p) => p.id === providerId);
  }

  private getApiKey(providerId: string): string {
    const envKeyMap: Record<string, string> = {
      openai: import.meta.env.VITE_OPENAI_API_KEY,
      anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY,
      perplexity: import.meta.env.VITE_PERPLEXITY_API_KEY,
      nvidia: import.meta.env.VITE_NVIDIA_API_KEY,
      exa: import.meta.env.VITE_EXA_API_KEY,
      grok: import.meta.env.VITE_GROK_API_KEY,
      github: import.meta.env.VITE_GITHUB_TOKEN,
      deepseek: import.meta.env.VITE_DEEPSEEK_API_KEY,
      minimax: import.meta.env.VITE_MINIMAX_API_KEY,
      minimaxi: import.meta.env.VITE_MINIMAXI_API_KEY,
      tencent: import.meta.env.VITE_TENCENT_SECRET_KEY,
      aliyun: import.meta.env.VITE_ALIYUN_API_KEY,
    };
    return envKeyMap[providerId] || '';
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    const provider = this.getProviderConfig(request.provider);
    
    if (!provider) {
      throw new Error(`Unknown provider: ${request.provider}`);
    }

    const apiKey = this.getApiKey(request.provider);
    if (!apiKey) {
      throw new Error(`API key not configured for ${provider.name}`);
    }

    try {
      let response: Response;

      switch (request.provider) {
        case 'openai':
          response = await this.openaiChat(provider.apiEndpoint!, apiKey, request);
          break;
        case 'anthropic':
          response = await this.anthropicChat(provider.apiEndpoint!, apiKey, request);
          break;
        case 'deepseek':
          response = await this.deepseekChat(provider.apiEndpoint!, apiKey, request);
          break;
        case 'perplexity':
          response = await this.perplexityChat(provider.apiEndpoint!, apiKey, request);
          break;
        case 'grok':
          response = await this.grokChat(provider.apiEndpoint!, apiKey, request);
          break;
        default:
          throw new Error(`Provider ${request.provider} not yet implemented`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        id: data.id || Math.random().toString(36).substring(2, 15),
        model: data.model || request.model,
        content: this.extractContent(data, request.provider),
        usage: data.usage,
        finishReason: data.finish_reason || data.stop_reason,
        latency,
      };
    } catch (error) {
      console.error(`Chat error for ${request.provider}:`, error);
      throw error;
    }
  }

  async chatStream(request: ChatRequest, onChunk: StreamCallback): Promise<void> {
    const provider = this.getProviderConfig(request.provider);
    
    if (!provider) {
      throw new Error(`Unknown provider: ${request.provider}`);
    }

    const apiKey = this.getApiKey(request.provider);
    if (!apiKey) {
      throw new Error(`API key not configured for ${provider.name}`);
    }

    try {
      let response: Response;

      switch (request.provider) {
        case 'openai':
          response = await this.openaiChatStream(provider.apiEndpoint!, apiKey, request);
          break;
        case 'anthropic':
          response = await this.anthropicChatStream(provider.apiEndpoint!, apiKey, request);
          break;
        case 'deepseek':
          response = await this.deepseekChatStream(provider.apiEndpoint!, apiKey, request);
          break;
        default:
          throw new Error(`Streaming not supported for ${request.provider}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onChunk({ delta: '', done: true });
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = this.extractStreamDelta(parsed, request.provider);
              if (delta) {
                onChunk({ delta, done: false });
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error(`Stream error for ${request.provider}:`, error);
      throw error;
    }
  }

  private async openaiChat(endpoint: string, apiKey: string, request: ChatRequest): Promise<Response> {
    return fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: false,
      }),
    });
  }

  private async openaiChatStream(endpoint: string, apiKey: string, request: ChatRequest): Promise<Response> {
    return fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: true,
      }),
    });
  }

  private async anthropicChat(endpoint: string, apiKey: string, request: ChatRequest): Promise<Response> {
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const otherMessages = request.messages.filter((m) => m.role !== 'system');

    return fetch(`${endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens ?? 4096,
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });
  }

  private async anthropicChatStream(endpoint: string, apiKey: string, request: ChatRequest): Promise<Response> {
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const otherMessages = request.messages.filter((m) => m.role !== 'system');

    return fetch(`${endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens ?? 4096,
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        stream: true,
      }),
    });
  }

  private async deepseekChat(endpoint: string, apiKey: string, request: ChatRequest): Promise<Response> {
    return fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
      }),
    });
  }

  private async deepseekChatStream(endpoint: string, apiKey: string, request: ChatRequest): Promise<Response> {
    return fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: true,
      }),
    });
  }

  private async perplexityChat(endpoint: string, apiKey: string, request: ChatRequest): Promise<Response> {
    return fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 4096,
      }),
    });
  }

  private async grokChat(endpoint: string, apiKey: string, request: ChatRequest): Promise<Response> {
    return fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
      }),
    });
  }

  private extractContent(data: any, provider: string): string {
    switch (provider) {
      case 'anthropic':
        return data.content?.[0]?.text || '';
      case 'openai':
      case 'deepseek':
      case 'perplexity':
      case 'grok':
        return data.choices?.[0]?.message?.content || '';
      default:
        return data.content || '';
    }
  }

  private extractStreamDelta(data: any, provider: string): string {
    switch (provider) {
      case 'anthropic':
        return data.delta?.text || '';
      case 'openai':
      case 'deepseek':
      case 'perplexity':
      case 'grok':
        return data.choices?.[0]?.delta?.content || '';
      default:
        return '';
    }
  }
}

export const aiClient = new AIAPIClient();
