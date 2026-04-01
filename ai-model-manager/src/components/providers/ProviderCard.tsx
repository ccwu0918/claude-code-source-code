import React from 'react';
import type { ProviderConfig } from '../../types';
import { Card, CardHeader, CardContent, Button } from '../ui';

interface ProviderCardProps {
  provider: ProviderConfig;
  isSelected: boolean;
  onSelect: () => void;
  onConfigure: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  isSelected,
  onSelect,
  onConfigure,
}) => {
  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
    error: 'bg-red-500',
  };

  return (
    <Card
      className={`provider-${provider.id}`}
      selected={isSelected}
      onClick={onSelect}
      hoverable
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${provider.color}20` }}
          >
            {provider.icon}
          </div>
          <div>
            <CardHeader className="text-lg">{provider.nameCn}</CardHeader>
            <CardContent className="text-sm text-gray-500 dark:text-gray-400">
              {provider.models.length} 模型可用
            </CardContent>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className={`w-2.5 h-2.5 rounded-full ${statusColors[provider.status]}`}
            title={provider.status === 'active' ? '已配置' : provider.status === 'error' ? '錯誤' : '未配置'}
          />
          {provider.apiKeyConfigured && (
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
              已配置
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-1">
        {provider.models.slice(0, 4).map((model) => (
          <span 
            key={model.id}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md"
          >
            {model.name}
          </span>
        ))}
        {provider.models.length > 4 && (
          <span className="text-xs px-2 py-1 text-gray-500">
            +{provider.models.length - 4} 更多
          </span>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {provider.website}
        </span>
        <Button 
          size="sm" 
          variant={provider.apiKeyConfigured ? 'secondary' : 'primary'}
          onClick={(e) => {
            e.stopPropagation();
            onConfigure();
          }}
        >
          {provider.apiKeyConfigured ? '更改' : '配置'}
        </Button>
      </div>
    </Card>
  );
};
