import { useState, useCallback } from 'react';
import { Node, Edge, Connection } from 'reactflow';

export interface UseFlowOptions {
  /** 初始节点 */
  initialNodes?: Node[];
  /** 初始边 */
  initialEdges?: Edge[];
  /** 节点变化回调 */
  onNodesChange?: (nodes: Node[]) => void;
  /** 边变化回调 */
  onEdgesChange?: (edges: Edge[]) => void;
}

export interface UseFlowReturn {
  /** 当前节点 */
  nodes: Node[];
  /** 当前边 */
  edges: Edge[];
  /** 设置节点 */
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  /** 设置边 */
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  /** 添加节点 */
  addNode: (node: Node) => void;
  /** 删除节点 */
  removeNode: (nodeId: string) => void;
  /** 更新节点数据 */
  updateNodeData: (nodeId: string, data: any) => void;
  /** 添加边 */
  addEdge: (edge: Edge | Connection) => void;
  /** 删除边 */
  removeEdge: (edgeId: string) => void;
  /** 清空画布 */
  clear: () => void;
  /** 获取节点 */
  getNode: (nodeId: string) => Node | undefined;
  /** 获取边 */
  getEdge: (edgeId: string) => Edge | undefined;
}

/**
 * useFlow - 流程图状态管理 Hook
 * Flow state management hook
 * 
 * 提供便捷的方法来管理流程图的节点和边
 * Provides convenient methods to manage flow nodes and edges
 */
export function useFlow(options: UseFlowOptions = {}): UseFlowReturn {
  const {
    initialNodes = [],
    initialEdges = [],
    onNodesChange,
    onEdgesChange,
  } = options;

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // 添加节点
  const addNode = useCallback(
    (node: Node) => {
      setNodes((nds) => {
        const newNodes = [...nds, node];
        onNodesChange?.(newNodes);
        return newNodes;
      });
    },
    [onNodesChange]
  );

  // 删除节点
  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const newNodes = nds.filter((n) => n.id !== nodeId);
        onNodesChange?.(newNodes);
        return newNodes;
      });
      // 同时删除相关的边
      setEdges((eds) => {
        const newEdges = eds.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        );
        onEdgesChange?.(newEdges);
        return newEdges;
      });
    },
    [onNodesChange, onEdgesChange]
  );

  // 更新节点数据
  const updateNodeData = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) => {
        const newNodes = nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        );
        onNodesChange?.(newNodes);
        return newNodes;
      });
    },
    [onNodesChange]
  );

  // 添加边
  const addEdgeFunc = useCallback(
    (edge: Edge | Connection) => {
      setEdges((eds) => {
        const newEdge: Edge =
          'id' in edge
            ? (edge as Edge)
            : {
                id: `e${edge.source}-${edge.target}`,
                source: edge.source!,
                target: edge.target!,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
              };
        
        const newEdges = [...eds, newEdge];
        onEdgesChange?.(newEdges);
        return newEdges;
      });
    },
    [onEdgesChange]
  );

  // 删除边
  const removeEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => {
        const newEdges = eds.filter((e) => e.id !== edgeId);
        onEdgesChange?.(newEdges);
        return newEdges;
      });
    },
    [onEdgesChange]
  );

  // 清空画布
  const clear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    onNodesChange?.([]);
    onEdgesChange?.([]);
  }, [onNodesChange, onEdgesChange]);

  // 获取节点
  const getNode = useCallback(
    (nodeId: string) => {
      return nodes.find((n) => n.id === nodeId);
    },
    [nodes]
  );

  // 获取边
  const getEdge = useCallback(
    (edgeId: string) => {
      return edges.find((e) => e.id === edgeId);
    },
    [edges]
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    addNode,
    removeNode,
    updateNodeData,
    addEdge: addEdgeFunc,
    removeEdge,
    clear,
    getNode,
    getEdge,
  };
}
