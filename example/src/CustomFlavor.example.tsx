/**
 * 自定义 Flavor 示例
 * Custom Flavor Example
 * 
 * 展示如何继承 BaseFlavor 类来实现自定义的数据格式转换
 * Shows how to extend BaseFlavor class to implement custom data format conversion
 */

import { BaseFlavor } from '../../dist/index.esm.js';

/**
 * 示例 1: 适配 RESTful API 后端
 * Example 1: Adapt to RESTful API backend
 */
export class RestAPIFlavor extends BaseFlavor {
  constructor() {
    super('1.0.0');
  }

  /**
   * 重写节点序列化，转换为后端期望的格式
   * Override node serialization to convert to backend expected format
   */
  protected serializeNodes(nodes: any[]): any[] {
    return nodes.map((node) => ({
      // 后端使用 'nodeId' 而不是 'id'
      nodeId: node.id,
      nodeType: node.type,
      // 后端使用 'x' 和 'y' 而不是嵌套的 position 对象
      x: node.position.x,
      y: node.position.y,
      // 后端使用 'properties' 而不是 'data'
      properties: node.data,
      // 保留其他字段
      width: node.width,
      height: node.height,
    }));
  }

  /**
   * 重写边序列化
   * Override edge serialization
   */
  protected serializeEdges(edges: any[]): any[] {
    return edges.map((edge) => ({
      edgeId: edge.id,
      from: edge.source,
      to: edge.target,
      fromHandle: edge.sourceHandle,
      toHandle: edge.targetHandle,
      edgeType: edge.type,
      isAnimated: edge.animated,
      styleConfig: edge.style,
    }));
  }

  /**
   * 重写节点反序列化，从后端格式转换回前端格式
   * Override node deserialization to convert from backend format
   */
  protected deserializeNodes(nodes: any[]): any[] {
    return nodes.map((node) => ({
      id: node.nodeId,
      type: node.nodeType,
      position: { x: node.x || 0, y: node.y || 0 },
      data: node.properties || {},
      width: node.width,
      height: node.height,
    }));
  }

  /**
   * 重写边反序列化
   * Override edge deserialization
   */
  protected deserializeEdges(edges: any[]): any[] {
    return edges.map((edge) => ({
      id: edge.edgeId,
      source: edge.from,
      target: edge.to,
      sourceHandle: edge.fromHandle,
      targetHandle: edge.toHandle,
      type: edge.edgeType,
      animated: edge.isAnimated,
      style: edge.styleConfig,
    }));
  }

  /**
   * 添加自定义元数据
   * Add custom metadata
   */
  protected transformMetadata(metadata?: Record<string, any>): Record<string, any> {
    return {
      ...super.transformMetadata(metadata),
      apiVersion: 'v1',
      source: 'react-flow-frontend',
      platform: 'web',
    };
  }
}

/**
 * 示例 2: 适配 GraphQL 后端
 * Example 2: Adapt to GraphQL backend
 */
export class GraphQLFlavor extends BaseFlavor {
  constructor() {
    super('2.0.0');
  }

  /**
   * GraphQL 格式的节点序列化
   * GraphQL format node serialization
   */
  protected serializeNodes(nodes: any[]): any[] {
    return nodes.map((node) => ({
      __typename: 'FlowNode',
      id: node.id,
      type: node.type,
      position: {
        __typename: 'Position',
        x: node.position.x,
        y: node.position.y,
      },
      data: JSON.stringify(node.data), // GraphQL 可能需要字符串化复杂对象
      dimensions: {
        __typename: 'Dimensions',
        width: node.width,
        height: node.height,
      },
    }));
  }

  /**
   * GraphQL 格式的边序列化
   * GraphQL format edge serialization
   */
  protected serializeEdges(edges: any[]): any[] {
    return edges.map((edge) => ({
      __typename: 'FlowEdge',
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      config: {
        __typename: 'EdgeConfig',
        animated: edge.animated,
        style: edge.style,
      },
    }));
  }

  /**
   * GraphQL 格式的节点反序列化
   * GraphQL format node deserialization
   */
  protected deserializeNodes(nodes: any[]): any[] {
    return nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: {
        x: node.position?.x || 0,
        y: node.position?.y || 0,
      },
      data: typeof node.data === 'string' ? JSON.parse(node.data) : node.data,
      width: node.dimensions?.width,
      height: node.dimensions?.height,
    }));
  }

  /**
   * GraphQL 格式的边反序列化
   * GraphQL format edge deserialization
   */
  protected deserializeEdges(edges: any[]): any[] {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      animated: edge.config?.animated,
      style: edge.config?.style,
    }));
  }
}

/**
 * 示例 3: 数据加密/解密 Flavor
 * Example 3: Data encryption/decryption Flavor
 */
export class EncryptedFlavor extends BaseFlavor {
  private encryptionKey: string;

  constructor(encryptionKey: string) {
    super('1.0.0');
    this.encryptionKey = encryptionKey;
  }

  /**
   * 简单的加密函数 (实际应用中应使用真正的加密算法)
   * Simple encryption function (use real encryption in production)
   */
  private encrypt(data: string): string {
    // 这里仅作示例，实际应使用 crypto-js 等库
    // 浏览器环境使用 btoa，Node环境使用 Buffer
    if (typeof btoa !== 'undefined') {
      return btoa(data);
    }
    // Node.js 环境
    return data; // 简化处理
  }

  /**
   * 简单的解密函数
   * Simple decryption function
   */
  private decrypt(data: string): string {
    // 浏览器环境使用 atob，Node环境使用 Buffer
    if (typeof atob !== 'undefined') {
      return atob(data);
    }
    // Node.js 环境
    return data; // 简化处理
  }

  /**
   * 加密敏感节点数据
   * Encrypt sensitive node data
   */
  protected serializeNodes(nodes: any[]): any[] {
    const serialized = super.serializeNodes(nodes);
    return serialized.map((node) => ({
      ...node,
      data: {
        encrypted: true,
        value: this.encrypt(JSON.stringify(node.data)),
      },
    }));
  }

  /**
   * 解密节点数据
   * Decrypt node data
   */
  protected deserializeNodes(nodes: any[]): any[] {
    const decrypted = nodes.map((node) => {
      if (node.data?.encrypted) {
        return {
          ...node,
          data: JSON.parse(this.decrypt(node.data.value)),
        };
      }
      return node;
    });
    return super.deserializeNodes(decrypted);
  }

  /**
   * 添加加密相关元数据
   * Add encryption metadata
   */
  protected transformMetadata(metadata?: Record<string, any>): Record<string, any> {
    return {
      ...super.transformMetadata(metadata),
      encrypted: true,
      algorithm: 'base64', // 实际应使用真正的加密算法名
    };
  }
}

/**
 * 使用示例
 * Usage Example
 */
export function exampleUsage() {
  // 1. 使用 REST API Flavor
  const restFlavor = new RestAPIFlavor();
  const nodes = [
    {
      id: '1',
      type: 'custom',
      position: { x: 100, y: 100 },
      data: { label: 'Node 1' },
    },
  ];
  const edges = [{ id: 'e1', source: '1', target: '2' }];

  // 导出为 REST API 格式
  const restData = restFlavor.export(nodes, edges);
  console.log('REST API Format:', restData);

  // 2. 使用 GraphQL Flavor
  const graphqlFlavor = new GraphQLFlavor();
  const graphqlData = graphqlFlavor.export(nodes, edges);
  console.log('GraphQL Format:', graphqlData);

  // 3. 使用加密 Flavor
  const encryptedFlavor = new EncryptedFlavor('my-secret-key');
  const encryptedData = encryptedFlavor.export(nodes, edges);
  console.log('Encrypted Format:', encryptedData);

  // 导入回来
  const { nodes: decryptedNodes, edges: decryptedEdges } =
    encryptedFlavor.import(encryptedData);
  console.log('Decrypted Nodes:', decryptedNodes);
}
