import React, { useState } from 'react';
import { useProviderStore } from './store';
import { ProviderCard, ApiKeyModal, ChatPanel } from './components';
import { Card } from './components/ui';

function App() {
  const { 
    providers, 
    selectedProvider, 
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
    setApiKey,
    removeApiKey,
    getConfiguredProviders 
  } = useProviderStore();
  
  const [configModalProvider, setConfigModalProvider] = useState<string | null>(null);
  
  const configuredProviders = getConfiguredProviders();
  const providerToConfig = providers.find(p => p.id === configModalProvider);
  
  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = providers.find(p => p.id === providerId);
    if (provider?.models.length) {
      setSelectedModel(provider.models[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Model Manager</h1>
                <p className="text-sm text-gray-500">統一AI模型管理工具</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                已配置 {configuredProviders.length} / {providers.length} 提供商
              </span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Provider List */}
          <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                AI 提供商
              </h2>
              <div className="space-y-3">
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    isSelected={selectedProvider === provider.id}
                    onSelect={() => handleProviderSelect(provider.id)}
                    onConfigure={() => setConfigModalProvider(provider.id)}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content - Chat Area */}
          <section className="col-span-12 lg:col-span-8 xl:col-span-9">
            {selectedProvider && selectedModel ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 h-[calc(100vh-180px)]">
                <ChatPanel 
                  providerId={selectedProvider} 
                  modelId={selectedModel} 
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 h-[calc(100vh-180px)] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-8xl mb-6">AI</div>
                <h2 className="text-2xl font-semibold mb-2">歡迎使用 AI Model Manager</h2>
                <p className="text-center max-w-md">
                  選擇左側的 AI 提供商開始使用。支持 OpenAI、Anthropic Claude、DeepSeek、騰訊混元、阿里雲通義千問等多種模型。
                </p>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['🤖', '🧠', '🔵', '🟠'].map((emoji, i) => (
                    <div key={i} className="text-4xl opacity-50">{emoji}</div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        provider={providerToConfig || null}
        isOpen={!!configModalProvider}
        onClose={() => setConfigModalProvider(null)}
        onSave={setApiKey}
        onRemove={removeApiKey}
      />
    </div>
  );
}

export default App;
