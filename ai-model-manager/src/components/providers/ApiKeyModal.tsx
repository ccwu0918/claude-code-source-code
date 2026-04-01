import React, { useState } from 'react';
import type { ProviderConfig } from '../../types';
import { Button, Input } from '../ui';
import toast from 'react-hot-toast';

interface ApiKeyModalProps {
  provider: ProviderConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (providerId: string, apiKey: string) => void;
  onRemove: (providerId: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  provider,
  isOpen,
  onClose,
  onSave,
  onRemove,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !provider) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('請輸入 API Key');
      return;
    }

    setIsLoading(true);
    try {
      onSave(provider.id, apiKey.trim());
      toast.success(`${provider.nameCn} API Key 已保存`);
      setApiKey('');
      onClose();
    } catch (error) {
      toast.error('保存失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onRemove(provider.id);
    toast.success(`${provider.nameCn} API Key 已移除`);
    setApiKey('');
    onClose();
  };

  const getInputPlaceholder = () => {
    switch (provider.id) {
      case 'openai':
        return 'sk-...';
      case 'anthropic':
        return 'sk-ant-...';
      case 'deepseek':
        return 'sk-...';
      default:
        return '輸入 API Key';
    }
  };

  const getHelperText = () => {
    switch (provider.id) {
      case 'openai':
        return '從 https://platform.openai.com/api-keys 獲取';
      case 'anthropic':
        return '從 https://console.anthropic.com/settings/keys 獲取';
      case 'deepseek':
        return '從 https://platform.deepseek.com/api_keys 獲取';
      case 'github':
        return '使用 GitHub Personal Access Token';
      default:
        return `從 ${provider.website} 獲取 API Key`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${provider.color}20` }}
          >
            {provider.icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{provider.nameCn}</h2>
            <p className="text-sm text-gray-500">配置 API Key</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            type="password"
            label="API Key"
            placeholder={getInputPlaceholder()}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            helperText={getHelperText()}
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleRemove}
              disabled={!provider.apiKeyConfigured}
            >
              移除
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSave}
              loading={isLoading}
            >
              保存
            </Button>
          </div>
        </div>

        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
