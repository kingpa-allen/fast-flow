import React, { useState, useCallback } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { BaseNodeData } from '../types';
import './BaseNode.css';

export interface BaseNodeProps extends NodeProps {
  data: BaseNodeData;
}

/**
 * BaseNode - 基础节点组件
 * Base node component with header, title, and collapse functionality
 * 所有自定义节点必须继承此组件
 */
export const BaseNode: React.FC<BaseNodeProps> = ({ data, id, selected }) => {
  const [collapsed, setCollapsed] = useState(data.collapsed || false);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div className={`base-node ${selected ? 'selected' : ''} ${collapsed ? 'collapsed' : ''}`}>
      {/* 头部标题栏 */}
      <div className="base-node-header">
        <div className="base-node-title">{data.label || 'Node'}</div>
        <button
          className="base-node-collapse-btn"
          onClick={handleToggleCollapse}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '▶' : '▼'}
        </button>
      </div>

      {/* 节点内容区域 */}
      {!collapsed && (
        <div className="base-node-content">
          {renderContent(data)}
        </div>
      )}

      {/* 输入端点 */}
      <Handle
        type="target"
        position={Position.Left}
        className="base-node-handle base-node-handle-target"
        id={`${id}-target`}
      />

      {/* 输出端点 */}
      <Handle
        type="source"
        position={Position.Right}
        className="base-node-handle base-node-handle-source"
        id={`${id}-source`}
      />
    </div>
  );
};

/**
 * 渲染节点内容
 * Render node content
 */
function renderContent(data: BaseNodeData) {
  // 过滤掉内部属性
  const contentData = Object.keys(data)
    .filter((key) => key !== 'label' && key !== 'collapsed')
    .reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {} as Record<string, any>);

  // 如果没有额外数据，显示默认内容
  if (Object.keys(contentData).length === 0) {
    return <div className="base-node-empty">No content</div>;
  }

  // 渲染数据
  return (
    <div className="base-node-data">
      {Object.entries(contentData).map(([key, value]) => (
        <div key={key} className="base-node-data-item">
          <span className="base-node-data-key">{key}:</span>
          <span className="base-node-data-value">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * 创建自定义节点的高阶组件
 * Create custom node HOC
 */
export function createCustomNode<T extends BaseNodeData>(
  renderContent: (props: NodeProps<T>) => React.ReactNode,
  options?: {
    showHeader?: boolean;
    collapsible?: boolean;
    className?: string;
  }
): React.FC<NodeProps<T>> {
  const CustomNode: React.FC<NodeProps<T>> = (props) => {
    const { data, id, selected } = props;
    const [collapsed, setCollapsed] = useState(data.collapsed || false);

    const handleToggleCollapse = useCallback(() => {
      setCollapsed((prev) => !prev);
    }, []);

    const showHeader = options?.showHeader !== false;
    const collapsible = options?.collapsible !== false;

    return (
      <div
        className={`base-node ${selected ? 'selected' : ''} ${collapsed ? 'collapsed' : ''} ${
          options?.className || ''
        }`}
      >
        {showHeader && (
          <div className="base-node-header">
            <div className="base-node-title">{data.label || 'Node'}</div>
            {collapsible && (
              <button
                className="base-node-collapse-btn"
                onClick={handleToggleCollapse}
                aria-label={collapsed ? 'Expand' : 'Collapse'}
              >
                {collapsed ? '▶' : '▼'}
              </button>
            )}
          </div>
        )}

        {!collapsed && <div className="base-node-content">{renderContent(props)}</div>}

        <Handle
          type="target"
          position={Position.Left}
          className="base-node-handle base-node-handle-target"
          id={`${id}-target`}
        />

        <Handle
          type="source"
          position={Position.Right}
          className="base-node-handle base-node-handle-source"
          id={`${id}-source`}
        />
      </div>
    );
  };

  return CustomNode;
}

export default BaseNode;
