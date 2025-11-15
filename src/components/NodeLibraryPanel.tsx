import React from 'react';
import { Card } from 'antd';
import { RegisterHelper } from '../core/RegisterHelper';

export interface NodeLibraryPanelProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  title?: string;
  subtitle?: string;
}

export const NodeLibraryPanel: React.FC<NodeLibraryPanelProps> = ({
  onDragStart,
  title = '业务流配置器',
  subtitle = '拖拽节点至画布即可',
}) => {
  return (
    <div
      style={{
        width: '200px',
        background: '#fafafa',
        borderRight: '1px solid #e8e8e8',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid #e8e8e8' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#262626' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#8c8c8c' }}>
            {subtitle}
          </p>
        )}
      </div>
      
      {/* 可拖拽的节点列表 */}
      <div style={{ padding: '12px', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {RegisterHelper.getAllConfigs().map((config) => (
            <Card
              key={config.type}
              draggable
              onDragStart={(e) => onDragStart(e, config.type)}
              size="small"
              hoverable
              style={{
                cursor: 'grab',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
              }}
              styles={{
                body: { padding: '10px' },
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                <div
                  style={{
                    fontSize: '20px',
                    color: '#1890ff',
                    lineHeight: 1,
                  }}
                >
                  {config.icon || '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#262626', marginBottom: '4px' }}>
                    {config.type}
                  </div>
                  {config.description && (
                    <div style={{ fontSize: '11px', color: '#8c8c8c', lineHeight: 1.4 }}>
                      {config.description}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
