import { FlavorData } from '../types';

/**
 * BaseFlavor - 数据转入转出的基类
 * Base class for data import and export
 * 用户可以继承此类实现自定义的数据格式转换以适配不同的后端
 * Users can extend this class to implement custom data format conversions for different backends
 */
export abstract class BaseFlavor {
  protected version: string = '1.0.0';

  constructor(version?: string) {
    if (version) {
      this.version = version;
    }
  }

  /**
   * 序列化节点数据 - 子类可重写此方法以自定义节点序列化逻辑
   * Serialize nodes - Override this method to customize node serialization
   * @param nodes - 节点数组
   */
  protected serializeNodes(nodes: any[]): any[] {
    return nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      width: node.width,
      height: node.height,
      selected: node.selected,
      dragging: node.dragging,
      ...this.extractCustomFields(node),
    }));
  }

  /**
   * 序列化连线数据 - 子类可重写此方法以自定义连线序列化逻辑
   * Serialize edges - Override this method to customize edge serialization
   * @param edges - 连线数组
   */
  protected serializeEdges(edges: any[]): any[] {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      animated: edge.animated,
      style: edge.style,
      data: edge.data,
      ...this.extractCustomFields(edge),
    }));
  }

  /**
   * 反序列化节点数据 - 子类可重写此方法以自定义节点反序列化逻辑
   * Deserialize nodes - Override this method to customize node deserialization
   * @param nodes - 序列化后的节点数组
   */
  protected deserializeNodes(nodes: any[]): any[] {
    return nodes.map((node) => ({
      ...node,
      position: node.position || { x: 0, y: 0 },
      data: node.data || {},
    }));
  }

  /**
   * 反序列化连线数据 - 子类可重写此方法以自定义连线反序列化逻辑
   * Deserialize edges - Override this method to customize edge deserialization
   * @param edges - 序列化后的连线数组
   */
  protected deserializeEdges(edges: any[]): any[] {
    return edges.map((edge) => ({
      ...edge,
    }));
  }

  /**
   * 转换元数据 - 子类可重写此方法以添加自定义元数据
   * Transform metadata - Override this method to add custom metadata
   * @param metadata - 原始元数据
   */
  protected transformMetadata(metadata?: Record<string, any>): Record<string, any> {
    return {
      version: this.version,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
  }

  /**
   * 验证数据格式 - 子类可重写此方法以添加自定义验证逻辑
   * Validate data format - Override this method to add custom validation
   * @param data - 待验证的数据
   */
  protected validateData(data: FlavorData): void {
    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid data format: nodes must be an array');
    }

    if (!data.edges || !Array.isArray(data.edges)) {
      throw new Error('Invalid data format: edges must be an array');
    }

    // 检查版本兼容性
    if (data.metadata?.version && data.metadata.version !== this.version) {
      console.warn(
        `Version mismatch: current ${this.version}, data ${data.metadata.version}`
      );
    }
  }

  /**
   * 提取自定义字段
   * Extract custom fields
   */
  protected extractCustomFields(obj: any): Record<string, any> {
    const standardFields = [
      'id',
      'type',
      'position',
      'data',
      'width',
      'height',
      'selected',
      'dragging',
      'source',
      'target',
      'sourceHandle',
      'targetHandle',
      'animated',
      'style',
    ];

    const customFields: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      if (!standardFields.includes(key)) {
        customFields[key] = obj[key];
      }
    });

    return customFields;
  }

  /**
   * 导出数据
   * Export data
   * @param nodes - 节点数据
   * @param edges - 连线数据
   * @param metadata - 元数据
   */
  export(
    nodes: any[],
    edges: any[],
    metadata?: Record<string, any>
  ): FlavorData {
    return {
      nodes: this.serializeNodes(nodes),
      edges: this.serializeEdges(edges),
      metadata: this.transformMetadata(metadata),
    };
  }

  /**
   * 导入数据
   * Import data
   * @param data - 导入的数据
   */
  import(data: FlavorData): { nodes: any[]; edges: any[] } {
    this.validateData(data);
    
    return {
      nodes: this.deserializeNodes(data.nodes),
      edges: this.deserializeEdges(data.edges),
    };
  }

  /**
   * 导出为JSON字符串
   * Export to JSON string
   */
  exportToJSON(
    nodes: any[],
    edges: any[],
    metadata?: Record<string, any>
  ): string {
    const data = this.export(nodes, edges, metadata);
    return JSON.stringify(data, null, 2);
  }

  /**
   * 从JSON字符串导入
   * Import from JSON string
   */
  importFromJSON(json: string): { nodes: any[]; edges: any[] } {
    try {
      const data = JSON.parse(json);
      return this.import(data);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error}`);
    }
  }



  /**
   * 克隆数据
   * Clone data
   */
  clone(nodes: any[], edges: any[]): { nodes: any[]; edges: any[] } {
    const data = this.export(nodes, edges);
    return this.import(data);
  }

  /**
   * 获取版本号
   * Get version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * 设置版本号
   * Set version
   */
  setVersion(version: string): void {
    this.version = version;
  }
}

/**
 * Flavor - 默认的 Flavor 实现
 * Default Flavor implementation
 */
export class Flavor extends BaseFlavor {
  constructor(version?: string) {
    super(version);
  }
}

// 导出默认实例
// Export default instance
export const flavor = new Flavor();
