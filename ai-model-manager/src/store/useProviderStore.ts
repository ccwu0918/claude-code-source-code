import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProviderConfig, ApiKeyConfig } from '../types';
import { PROVIDERS } from '../lib/providers';

interface ProviderStore {
  providers: ProviderConfig[];
  apiKeys: Record<string, string>;
  selectedProvider: string | null;
  selectedModel: string | null;
  
  // Actions
  setApiKey: (providerId: string, apiKey: string) => void;
  removeApiKey: (providerId: string) => void;
  setSelectedProvider: (providerId: string | null) => void;
  setSelectedModel: (modelId: string | null) => void;
  getConfiguredProviders: () => ProviderConfig[];
  validateApiKey: (providerId: string) => Promise<boolean>;
}

export const useProviderStore = create<ProviderStore>()(
  persist(
    (set, get) => ({
      providers: PROVIDERS,
      apiKeys: {},
      selectedProvider: null,
      selectedModel: null,
      
      setApiKey: (providerId: string, apiKey: string) => {
        set((state) => ({
          apiKeys: { ...state.apiKeys, [providerId]: apiKey },
          providers: state.providers.map((p) =>
            p.id === providerId
              ? { ...p, apiKeyConfigured: !!apiKey, status: apiKey ? 'active' : 'inactive' }
              : p
          ),
        }));
      },
      
      removeApiKey: (providerId: string) => {
        set((state) => {
          const newApiKeys = { ...state.apiKeys };
          delete newApiKeys[providerId];
          return {
            apiKeys: newApiKeys,
            providers: state.providers.map((p) =>
              p.id === providerId
                ? { ...p, apiKeyConfigured: false, status: 'inactive' }
                : p
            ),
          };
        });
      },
      
      setSelectedProvider: (providerId: string | null) => {
        set({ selectedProvider: providerId, selectedModel: null });
      },
      
      setSelectedModel: (modelId: string | null) => {
        set({ selectedModel: modelId });
      },
      
      getConfiguredProviders: () => {
        return get().providers.filter((p) => p.apiKeyConfigured);
      },
      
      validateApiKey: async (providerId: string) => {
        const apiKey = get().apiKeys[providerId];
        if (!apiKey) return false;
        
        // TODO: Implement actual API key validation
        // For now, just check if key exists and has minimum length
        return apiKey.length > 10;
      },
    }),
    {
      name: 'ai-model-manager-providers',
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
      }),
    }
  )
);
