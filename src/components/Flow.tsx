import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  ReactFlowInstance,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { ApartmentOutlined } from '@ant-design/icons';
import { RegisterHelper } from '../core/RegisterHelper';
import { NodeLibraryPanel } from './NodeLibraryPanel';

export type FlowMode = 'edit' | 'read';

export interface FlowProps {
  /** 初始节点数据 */
  initialNodes?: Node[];
  /** 初始边数据 */
  initialEdges?: Edge[];
  /** 节点数组（受控模式） */
  nodes?: Node[];
  /** 边数组（受控模式） */
  edges?: Edge[];
  /** 节点变化回调 */
  onNodesChange?: (nodes: Node[]) => void;
  /** 边变化回调 */
  onEdgesChange?: (edges: Edge[]) => void;
  /** 连接回调 */
  onConnect?: (connection: Connection) => void;
  /** React Flow 实例初始化回调 */
  onInit?: (instance: ReactFlowInstance) => void;
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
  /** 默认边样式 */
  defaultEdgeOptions?: Partial<Edge>;
  /** 是否允许删除节点和边 */
  deleteKeyEnabled?: boolean;
  /** 是否显示自动布局按钮 */
  showAutoLayoutButton?: boolean;
  /** 模式：edit 编辑模式（显示左侧栏）| read 只读模式 */
  mode?: FlowMode;
  /** 左侧栏标题 */
  nodeLibraryTitle?: string;
  /** 左侧栏副标题 */
  nodeLibrarySubtitle?: string;
}

/**
 * 使用 Dagre 算法自动布局节点
 * Auto layout nodes using Dagre algorithm
 * 
 * @param nodes - 节点数组
 * @param edges - 边数组
 * @param direction - 布局方向 ('TB' | 'LR')
 * @param getDimensions - 获取节点实际尺寸的函数
 */
const getLayoutedElements = (
  nodes: Node[], 
  edges: Edge[], 
  direction = 'TB',
  getDimensions?: (nodeId: string) => { width: number; height: number } | null
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // Increase spacing to prevent overlaps
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 80,   // Horizontal spacing between nodes (increased from 50)
    ranksep: 150,  // Vertical spacing between ranks (increased from 100)
    marginx: 20,   // Graph margin
    marginy: 20
  });

  // 使用节点的实际尺寸或估算尺寸
  nodes.forEach((node) => {
    let nodeWidth: number;
    let nodeHeight: number;

    // 尝试获取实际渲染尺寸
    const actualDimensions = getDimensions?.(node.id);
    
    if (actualDimensions) {
      // 使用实际渲染尺寸，并添加padding以确保不重叠
      // Add padding to ensure nodes don't overlap
      nodeWidth = actualDimensions.width + 20;  // Add 20px horizontal padding
      nodeHeight = actualDimensions.height + 20; // Add 20px vertical padding
    } else {
      // 回退到估算尺寸
      const baseWidth = 280; // 最大宽度
      const minWidth = 180;  // 最小宽度
      
      // 根据节点数据估算宽度
      nodeWidth = node.data.label?.length > 10 ? baseWidth : minWidth;
      
      // 估算高度：折叠状态下高度更小
      const isCollapsed = node.data.collapsed || false;
      const headerHeight = 40;  // 头部高度
      const contentHeight = isCollapsed ? 0 : 80; // 内容区高度
      nodeHeight = headerHeight + contentHeight;
    }
    
    dagreGraph.setNode(node.id, { 
      width: nodeWidth, 
      height: nodeHeight 
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const nodeWidth = nodeWithPosition.width;
    const nodeHeight = nodeWithPosition.height;
    
    return {
      ...node,
      position: {
        // Dagre 返回的是中心点位置，需要转换为左上角位置
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

/**
 * Flow - 流程图画布组件
 * Flow canvas component that wraps the underlying flow library
 * 
 * 用户可以直接使用此组件生成画布，屏蔽底层流程图库的实现细节
 * Users can directly use this component to generate canvas, hiding implementation details
 */
export const Flow: React.FC<FlowProps> = ({
  initialNodes = [],
  initialEdges = [],
  nodes: nodesProp,
  edges: edgesProp,
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onConnect: onConnectProp,
  onInit,
  showControls = true,
  showMiniMap = false,
  showBackground = true,
  backgroundVariant = BackgroundVariant.Dots,
  fitView = true,
  style,
  className,
  toolbar,
  defaultEdgeOptions = {
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
  },
  deleteKeyEnabled = true,
  showAutoLayoutButton = true,
  mode = 'edit',
  nodeLibraryTitle,
  nodeLibrarySubtitle,
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [allCollapsed, setAllCollapsed] = useState(false);

  // 如果传入了 nodes/edges props，使用受控模式
  const isControlled = nodesProp !== undefined || edgesProp !== undefined;
  const actualNodes = isControlled ? (nodesProp || []) : nodes;
  const actualEdges = isControlled ? (edgesProp || []) : edges;

  // 处理节点变化
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!isControlled) {
        setNodes((nds) => {
          const updatedNodes = applyNodeChanges(changes, nds);
          onNodesChangeProp?.(updatedNodes);
          return updatedNodes;
        });
      } else {
        // 受控模式下，只通知父组件
        const updatedNodes = applyNodeChanges(changes, actualNodes);
        onNodesChangeProp?.(updatedNodes);
      }
    },
    [isControlled, actualNodes, onNodesChangeProp]
  );

  // 处理边变化
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!isControlled) {
        setEdges((eds) => {
          const updatedEdges = applyEdgeChanges(changes, eds);
          onEdgesChangeProp?.(updatedEdges);
          return updatedEdges;
        });
      } else {
        // 受控模式下，只通知父组件
        const updatedEdges = applyEdgeChanges(changes, actualEdges);
        onEdgesChangeProp?.(updatedEdges);
      }
    },
    [isControlled, actualEdges, onEdgesChangeProp]
  );

  // 处理连接
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!isControlled) {
        setEdges((eds) => addEdge(connection, eds));
      }
      onConnectProp?.(connection);
    },
    [isControlled, onConnectProp]
  );

  // 处理节点数据变化
  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: Record<string, any>) => {
      if (!isControlled) {
        setNodes((nds) => {
          const updatedNodes = nds.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...newData } }
              : node
          );
          onNodesChangeProp?.(updatedNodes);
          return updatedNodes;
        });
      } else {
        // 受控模式下，通知父组件更新
        const updatedNodes = actualNodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        );
        onNodesChangeProp?.(updatedNodes);
      }
    },
    [isControlled, actualNodes, onNodesChangeProp]
  );

  // 使用 ref 保持 handleNodeDataChange 的最新引用
  const handleNodeDataChangeRef = React.useRef(handleNodeDataChange);
  React.useEffect(() => {
    handleNodeDataChangeRef.current = handleNodeDataChange;
  }, [handleNodeDataChange]);

  // 获取注册的节点类型（稳定引用）
  const nodeTypes = useMemo(() => {
    const registeredTypes = RegisterHelper.getNodeTypes();
    
    // 包装每个节点类型，注入 onDataChange 回调
    const wrappedTypes: Record<string, React.ComponentType<any>> = {};
    
    Object.keys(registeredTypes).forEach((type) => {
      const OriginalComponent = registeredTypes[type];
      
      // 使用稳定的包装组件，通过 ref 访问最新的回调
      wrappedTypes[type] = (props: any) => {
        return React.createElement(OriginalComponent, {
          ...props,
          onDataChange: (nodeId: string, newData: Record<string, any>) => {
            handleNodeDataChangeRef.current(nodeId, newData);
          },
          readOnly: mode === 'read',
        });
      };
    });
    
    return wrappedTypes;
  }, [mode]); // mode 变化时重新创建

  // 自动布局
  const onAutoLayout = useCallback(() => {
    // 获取节点的实际DOM尺寸
    const getNodeDimensions = (nodeId: string) => {
      // Try to find the node element by data-id attribute
      const nodeElement = document.querySelector(`[data-id="${nodeId}"]`) as HTMLElement;
      if (nodeElement) {
        // Get the actual rendered size without transform effects
        // Use offsetWidth/offsetHeight which gives the actual element size
        const width = nodeElement.offsetWidth || nodeElement.getBoundingClientRect().width;
        const height = nodeElement.offsetHeight || nodeElement.getBoundingClientRect().height;
        
        return {
          width: Math.max(width, 180),  // Ensure minimum width
          height: Math.max(height, 40), // Ensure minimum height
        };
      }
      return null;
    };
    
    const layouted = getLayoutedElements(
      actualNodes, 
      actualEdges, 
      'LR', // 使用 LR (Left to Right)
      getNodeDimensions
    );
    
    if (!isControlled) {
      setNodes(layouted.nodes);
      onNodesChangeProp?.(layouted.nodes);
    } else {
      onNodesChangeProp?.(layouted.nodes);
    }
  }, [actualNodes, actualEdges, isControlled, onNodesChangeProp]);

  // 全局折叠/展开节点
  const toggleAllNodesCollapse = useCallback(() => {
    const newCollapsedState = !allCollapsed;
    setAllCollapsed(newCollapsedState);

    const updatedNodes = actualNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        collapsed: newCollapsedState,
      },
    }));

    if (!isControlled) {
      setNodes(updatedNodes);
      onNodesChangeProp?.(updatedNodes);
    } else {
      onNodesChangeProp?.(updatedNodes);
    }
  }, [actualNodes, allCollapsed, isControlled, onNodesChangeProp]);

  // 处理拖拽开始
  const handleDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  // 处理拖拽到画布上
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      // 使用 React Flow 的 screenToFlowPosition 精确计算位置
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // 获取节点配置，使用注册时的默认数据
      const config = RegisterHelper.getConfig(type);
      const defaultData = config?.defaultData || {};

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: {
          ...defaultData,
          label: defaultData.label || `${type} ${actualNodes.length + 1}`,
        },
      };

      if (!isControlled) {
        setNodes((nds) => {
          const newNodes = [...nds, newNode];
          onNodesChangeProp?.(newNodes);
          return newNodes;
        });
      } else {
        onNodesChangeProp?.([...actualNodes, newNode]);
      }
    },
    [reactFlowInstance, actualNodes, isControlled, onNodesChangeProp]
  );

  // 允许拖拽
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 处理 ReactFlow 实例初始化
  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
      onInit?.(instance);
    },
    [onInit]
  );

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', ...style }} className={className}>
      {/* 编辑模式显示左侧栏 */}
      {mode === 'edit' && (
        <NodeLibraryPanel
          onDragStart={handleDragStart}
          title={nodeLibraryTitle}
          subtitle={nodeLibrarySubtitle}
        />
      )}
      
      {/* Flow 画布 */}
      <div
        ref={reactFlowWrapper}
        style={{ flex: 1 }}
        onDrop={mode === 'edit' ? handleDrop : undefined}
        onDragOver={mode === 'edit' ? handleDragOver : undefined}
      >
        <ReactFlow
          nodes={actualNodes}
          edges={actualEdges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onInit={handleInit}
          fitView={fitView}
          fitViewOptions={{
            padding: 0.2,
            maxZoom: 0.75,
          }}
          defaultEdgeOptions={defaultEdgeOptions}
          deleteKeyCode={mode === 'edit' && deleteKeyEnabled ? ['Backspace', 'Delete'] : null}
          minZoom={0.1}
          maxZoom={2}
          nodesDraggable={mode === 'edit'}
          nodesConnectable={mode === 'edit'}
          elementsSelectable={true}
        >
        {showControls && <Controls />}
        {showMiniMap && <MiniMap />}
        {showBackground && <Background variant={backgroundVariant} />}
        {toolbar && <Panel position="top-left">{toolbar}</Panel>}
        {mode === 'edit' && showAutoLayoutButton && (
          <Panel position="top-right">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* 自动布局按钮 */}
              <button
                onClick={onAutoLayout}
                style={{
                  padding: '6px 12px',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1565c0';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1976d2';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                }}
              >
                <ApartmentOutlined style={{ fontSize: '12px' }} />
                <span>Auto Layout</span>
              </button>

              {/* 折叠/展开按钮 */}
              <button
                onClick={toggleAllNodesCollapse}
                style={{
                  padding: '6px 12px',
                  background: allCollapsed ? '#52c41a' : '#faad14',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = allCollapsed ? '#73d13d' : '#ffc53d';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = allCollapsed ? '#52c41a' : '#faad14';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                }}
                title={allCollapsed ? '展开所有节点' : '折叠所有节点'}
              >
                <span style={{ fontSize: '10px' }}>{allCollapsed ? '▼' : '▲'}</span>
                <span>{allCollapsed ? 'Expand All' : 'Collapse All'}</span>
              </button>
            </div>
          </Panel>
        )}
      </ReactFlow>
      </div>
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
