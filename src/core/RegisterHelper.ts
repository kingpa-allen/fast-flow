import { ComponentType } from 'react';
import { NodeProps } from 'reactflow';
import { NodeConfig } from '../types';

/**
 * RegisterHelper - 用于动态注册画布中的节点组件（静态类）
 * Dynamically register node components for the canvas (Static Class)
 */
export class RegisterHelper {
  private static nodeTypes: Map<string, ComponentType<NodeProps>> = new Map();
  private static nodeConfigs: Map<string, NodeConfig> = new Map();

  /**
   * 注册一个节点组件
   * Register a node component
   * @param type - 节点类型标识
   * @param component - React组件
   * @param defaultData - 默认数据
   * @param icon - 节点图标
   * @param description - 节点描述
   */
  static register(
    type: string,
    component: ComponentType<NodeProps>,
    defaultData?: Record<string, any>,
    icon?: React.ReactNode,
    description?: string
  ): void {
    if (this.nodeTypes.has(type)) {
      console.warn(`Node type "${type}" is already registered. Overwriting...`);
    }

    this.nodeTypes.set(type, component);
    this.nodeConfigs.set(type, {
      type,
      component,
      defaultData,
      icon,
      description,
    });
  }

  /**
   * 批量注册节点组件
   * Register multiple node components
   * @param configs - 节点配置数组
   */
  static registerBatch(configs: NodeConfig[]): void {
    configs.forEach(({ type, component, defaultData }) => {
      this.register(type, component, defaultData);
    });
  }

  /**
   * 注销一个节点组件
   * Unregister a node component
   * @param type - 节点类型标识
   */
  static unregister(type: string): boolean {
    const hasType = this.nodeTypes.has(type);
    this.nodeTypes.delete(type);
    this.nodeConfigs.delete(type);
    return hasType;
  }

  /**
   * 获取所有已注册的节点类型
   * Get all registered node types
   */
  static getNodeTypes(): Record<string, ComponentType<NodeProps>> {
    const types: Record<string, ComponentType<NodeProps>> = {};
    this.nodeTypes.forEach((component, type) => {
      types[type] = component;
    });
    return types;
  }

  /**
   * 获取节点配置
   * Get node configuration
   * @param type - 节点类型标识
   */
  static getConfig(type: string): NodeConfig | undefined {
    return this.nodeConfigs.get(type);
  }

  /**
   * 获取所有节点配置
   * Get all node configurations
   */
  static getAllConfigs(): NodeConfig[] {
    return Array.from(this.nodeConfigs.values());
  }

  /**
   * 检查节点类型是否已注册
   * Check if node type is registered
   * @param type - 节点类型标识
   */
  static isRegistered(type: string): boolean {
    return this.nodeTypes.has(type);
  }

  /**
   * 获取节点组件
   * Get node component
   * @param type - 节点类型标识
   */
  static getComponent(type: string): ComponentType<NodeProps> | undefined {
    return this.nodeTypes.get(type);
  }

  /**
   * 清空所有注册的节点
   * Clear all registered nodes
   */
  static clear(): void {
    this.nodeTypes.clear();
    this.nodeConfigs.clear();
  }
}
