import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { NodeProps, Handle, Position } from 'reactflow';
import { BaseNodeData } from '../types';
import { SettingOutlined, CloseOutlined } from '@ant-design/icons';
import './BaseNode.css';

export interface BaseNodeProps extends NodeProps {
  data: BaseNodeData;
  onDataChange?: (id: string, newData: Record<string, any>) => void;
  readOnly?: boolean;
}

export interface BaseNodeState {
  collapsed: boolean;
  showSettings: boolean;
  settingsData: Record<string, any>;
}

/**
 * BaseNode - 基础节点组件（Class Component）
 * Base node component with header, title, and collapse functionality
 * 用户可以继承此类来创建自定义节点
 * Users can extend this class to create custom nodes
 */
export class BaseNode extends Component<BaseNodeProps, BaseNodeState> {
  constructor(props: BaseNodeProps) {
    super(props);
    this.state = {
      collapsed: props.data.collapsed || false,
      showSettings: false,
      settingsData: {},
    };
  }

  /**
   * 组件挂载时初始化设置数据
   */
  componentDidMount() {
    this.setState({
      settingsData: this.getInitialSettingsData(),
    });
  }

  /**
   * 组件更新时同步 collapsed 状态
   */
  componentDidUpdate(prevProps: BaseNodeProps) {
    // 当外部 props.data.collapsed 变化时，更新内部状态
    if (prevProps.data.collapsed !== this.props.data.collapsed) {
      this.setState({
        collapsed: this.props.data.collapsed || false,
      });
    }
  }

  /**
   * 获取初始设置数据
   * Get initial settings data
   * 子类可以重写此方法来提供初始数据
   * Subclasses can override this method to provide initial data
   */
  protected getInitialSettingsData(): Record<string, any> {
    return { ...this.props.data };
  }

  /**
   * 更新设置数据
   * Update settings data
   */
  protected updateSettingsData = (key: string, value: any) => {
    this.setState((prevState) => ({
      settingsData: {
        ...prevState.settingsData,
        [key]: value,
      },
    }));
  };

  /**
   * 切换折叠状态
   * Toggle collapse state
   */
  protected handleToggleCollapse = () => {
    const newCollapsedState = !this.state.collapsed;
    
    this.setState({
      collapsed: newCollapsedState,
    });

    // 同步到外部数据
    const { id, onDataChange, data } = this.props;
    if (onDataChange) {
      onDataChange(id, {
        ...data,
        collapsed: newCollapsedState,
      });
    }
  };

  /**
   * 切换设置面板
   * Toggle settings panel
   */
  protected handleToggleSettings = () => {
    this.setState((prevState) => ({
      showSettings: !prevState.showSettings,
    }));
  };

  /**
   * 关闭设置面板
   * Close settings panel
   */
  protected handleCloseSettings = () => {
    this.setState({ showSettings: false });
  };

  /**
   * 保存设置
   * Save settings
   * 子类可以重写此方法来处理设置保存逻辑
   * Subclasses can override this method to handle settings save logic
   */
  protected handleSaveSettings = () => {
    const { settingsData } = this.state;
    // 默认实现：调用 onSettingsSave 回调
    // 注意：在实际使用中，应该通过 React Flow 的 API 来更新节点数据
    this.onSettingsSave(settingsData);
    this.handleCloseSettings();
  };

  /**
   * 设置保存回调
   * Settings save callback
   * 子类可以重写此方法来实现自定义保存逻辑
   * Subclasses can override this method to implement custom save logic
   */
  protected onSettingsSave(data: Record<string, any>) {
    const { id, onDataChange } = this.props;
    
    // 调用外部回调更新节点数据
    if (onDataChange) {
      onDataChange(id, data);
    } else {
      console.warn(
        'BaseNode: onDataChange callback is not provided. ' +
        'Node data will not be persisted. ' +
        'Please provide onDataChange prop or override onSettingsSave method.'
      );
    }
  }

  /**
   * 渲染节点头部
   * Render node header
   * 子类可以重写此方法自定义头部
   * Subclasses can override this method to customize header
   */
  protected renderHeader(): React.ReactNode {
    const { data } = this.props;
    const { collapsed } = this.state;

    return (
      <div className="base-node-header">
        <div className="base-node-title">{data.label || 'Node'}</div>
        <div className="base-node-header-actions">
          {this.renderSettingsButton()}
          <button
            className="base-node-collapse-btn"
            onClick={this.handleToggleCollapse}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▶' : '▼'}
          </button>
        </div>
      </div>
    );
  }

  /**
   * 渲染设置按钮
   * Render settings button
   * 子类可以重写此方法自定义设置按钮
   * Subclasses can override this method to customize settings button
   */
  protected renderSettingsButton(): React.ReactNode {
    const { readOnly } = this.props;
    
    // 如果子类没有实现设置表单，则不显示设置按钮
    if (!this.hasSettingsForm()) {
      return null;
    }

    // 只读模式下不显示设置按钮
    if (readOnly) {
      return null;
    }

    return (
      <button
        className="base-node-settings-btn"
        onClick={this.handleToggleSettings}
        aria-label="Settings"
        title="Node Settings"
      >
        <SettingOutlined />
      </button>
    );
  }

  /**
   * 检查是否有设置表单
   * Check if has settings form
   * 子类应该重写此方法返回 true 如果需要设置面板
   * Subclasses should override this method to return true if settings panel is needed
   */
  protected hasSettingsForm(): boolean {
    return false;
  }

  /**
   * 渲染设置表单内容
   * Render settings form content
   * 子类应该重写此方法来渲染自定义设置表单
   * Subclasses should override this method to render custom settings form
   * 
   * 使用 this.state.settingsData 获取当前设置数据
   * 使用 this.updateSettingsData(key, value) 更新设置数据
   */
  protected renderSettingsForm(): React.ReactNode {
    return (
      <div className="base-node-settings-empty">
        No settings available
      </div>
    );
  }

  /**
   * 渲染节点内容
   * Render node content
   * 子类应该重写此方法来渲染自定义内容
   * Subclasses should override this method to render custom content
   */
  protected renderContent(): React.ReactNode {
    const { data } = this.props;

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
   * 渲染输入端点
   * Render input handle
   * 子类可以重写此方法自定义输入端点
   * Subclasses can override this method to customize input handle
   */
  protected renderInputHandle(): React.ReactNode {
    const { id } = this.props;
    return (
      <Handle
        type="target"
        position={Position.Left}
        className="base-node-handle base-node-handle-target"
        id={`${id}-target`}
      />
    );
  }

  /**
   * 渲染输出端点
   * Render output handle
   * 子类可以重写此方法自定义输出端点
   * Subclasses can override this method to customize output handle
   */
  protected renderOutputHandle(): React.ReactNode {
    const { id } = this.props;
    return (
      <Handle
        type="source"
        position={Position.Right}
        className="base-node-handle base-node-handle-source"
        id={`${id}-source`}
      />
    );
  }

  /**
   * 获取自定义类名
   * Get custom class name
   * 子类可以重写此方法添加自定义类名
   * Subclasses can override this method to add custom class names
   */
  protected getClassName(): string {
    return '';
  }

  /**
   * 渲染设置面板
   * Render settings panel
   */
  protected renderSettingsPanel(): React.ReactNode {
    const { showSettings } = this.state;

    if (!showSettings) {
      return null;
    }

    // 使用 Portal 将设置面板渲染到 body，避免受 React Flow 缩放影响
    return createPortal(
      <div className="base-node-settings-overlay" onClick={this.handleCloseSettings}>
        <div
          className="base-node-settings-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="base-node-settings-header">
            <h3>Node Settings</h3>
            <button
              className="base-node-settings-close"
              onClick={this.handleCloseSettings}
              aria-label="Close"
            >
              <CloseOutlined />
            </button>
          </div>
          <div className="base-node-settings-body">
            {this.renderSettingsForm()}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  render() {
    const { selected } = this.props;
    const { collapsed } = this.state;
    const customClassName = this.getClassName();

    return (
      <>
        <div
          className={`base-node ${selected ? 'selected' : ''} ${collapsed ? 'collapsed' : ''} ${customClassName}`}
        >
          {this.renderHeader()}

          {!collapsed && (
            <div className="base-node-content">
              {this.renderContent()}
            </div>
          )}

          {this.renderInputHandle()}
          {this.renderOutputHandle()}
        </div>
        {this.renderSettingsPanel()}
      </>
    );
  }
}


