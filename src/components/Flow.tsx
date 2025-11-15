import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RegisterHelper } from '../core/RegisterHelper';

export interface FlowProps {
  /** 注册助手实例 */
  registerHelper: RegisterHelper;
  /** 初始节点数据 */
  initialNodes?: Node[];
  /** 初始边数据 */
  initialEdges?: Edge[];
  /** 节点变化回调 */
  onNodesChange?: (nodes: Node[]) => void;
  /** 边变化回调 */
  onEdgesChange?: (edges: Edge[]) => void;
  /** 连接回调 */
  onConnect?: (connection: Connection) => void;
  /** 是否显示控制器 */
  showControls?: boolean;
  /** 是否显示小地图 */
  showMiniMap?: boolean;
  /** 是否显示背景 */
  showBackground?: boolean;
  /** 背景类型 */
  backgroundVariant?: BackgroundVariant;
  /** 是否自动适应视图 */
  fitView?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 顶部面板内容 */
  toolbar?: React.ReactNode;
}

/**
 * Flow - 流程图画布组件
 * Flow canvas component that wraps the underlying flow library
 * 
 * 用户可以直接使用此组件生成画布，屏蔽底层流程图库的实现细节
 * Users can directly use this component to generate canvas, hiding implementation details
 */
export const Flow: React.FC<FlowProps> = ({
  registerHelper,
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onConnect: onConnectProp,
  showControls = true,
  showMiniMap = false,
  showBackground = true,
  backgroundVariant = BackgroundVariant.Dots,
  fitView = true,
  style,
  className,
  toolbar,
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // 获取注册的节点类型
  const nodeTypes = useMemo(() => {
    return registerHelper.getNodeTypes();
  }, [registerHelper]);

  // 处理节点变化
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        onNodesChangeProp?.(updatedNodes);
        return updatedNodes;
      });
    },
    [onNodesChangeProp]
  );

  // 处理边变化
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const updatedEdges = applyEdgeChanges(changes, eds);
        onEdgesChangeProp?.(updatedEdges);
        return updatedEdges;
      });
    },
    [onEdgesChangeProp]
  );

  // 处理连接
  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
      onConnectProp?.(connection);
    },
    [onConnectProp]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
      className={className}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        fitView={fitView}
      >
        {showControls && <Controls />}
        {showMiniMap && <MiniMap />}
        {showBackground && <Background variant={backgroundVariant} />}
        {toolbar && <Panel position="top-left">{toolbar}</Panel>}
      </ReactFlow>
    </div>
  );
};

/**
 * FlowCanvas - 带 Provider 的完整画布组件
 * Complete canvas component with Provider
 * 
 * 推荐使用此组件，它已经包含了必要的 Provider
 * Recommended to use this component as it includes necessary Provider
 */
export const FlowCanvas: React.FC<FlowProps> = (props) => {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
};

export default FlowCanvas;
