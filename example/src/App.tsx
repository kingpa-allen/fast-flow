import React, { useState } from 'react';
import {
  RegisterHelper,
  Flavor,
  BaseNode,
  createCustomNode,
  BaseNodeData,
  FlowCanvas,
  useFlow,
} from '../dist/index.esm.js';

// 创建 RegisterHelper 实例
const registerHelper = new RegisterHelper();

// 创建 Flavor 实例
const flavor = new Flavor();

// 创建自定义节点 1: 数据处理节点
interface DataNodeData extends BaseNodeData {
  operation?: string;
  input?: string;
}

const DataProcessNode = createCustomNode<DataNodeData>(
  (props) => {
    return (
      <div style={{ padding: '8px' }}>
        <div style={{ marginBottom: '6px' }}>
          <strong>Operation:</strong> {props.data.operation || 'None'}
        </div>
        <div>
          <strong>Input:</strong> {props.data.input || 'No data'}
        </div>
      </div>
    );
  },
  {
    showHeader: true,
    collapsible: true,
    className: 'data-process-node',
  }
);

// 创建自定义节点 2: 输出节点
const OutputNode = createCustomNode(
  (props) => {
    return (
      <div style={{ padding: '8px', color: '#2e7d32' }}>
        <div>✓ Ready to output</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          {props.data.format || 'JSON'}
        </div>
      </div>
    );
  },
  {
    showHeader: true,
    collapsible: true,
    className: 'output-node',
  }
);

// 注册节点类型
registerHelper.register('baseNode', BaseNode, { label: 'Base Node' });
registerHelper.register('dataProcess', DataProcessNode);
registerHelper.register('output', OutputNode);

// 初始节点和边
const initialNodes = [
  {
    id: '1',
    type: 'baseNode',
    position: { x: 100, y: 100 },
    data: { label: 'Start Node', description: 'This is the starting point' },
  },
  {
    id: '2',
    type: 'dataProcess',
    position: { x: 400, y: 100 },
    data: { label: 'Process Data', operation: 'Transform', input: 'Raw data' },
  },
  {
    id: '3',
    type: 'output',
    position: { x: 700, y: 100 },
    data: { label: 'Output', format: 'JSON' },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

function App() {
  const { nodes, edges, addNode, updateNodeData } = useFlow({
    initialNodes,
    initialEdges,
  });

  const [exportedData, setExportedData] = useState<string>('');



  // 导出数据
  const handleExport = () => {
    const json = flavor.exportToJSON(nodes, edges, {
      author: 'Demo User',
      description: 'Example flow',
    });
    setExportedData(json);
    console.log('Exported Data:', json);
  };

  // 添加新节点
  const handleAddNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'baseNode',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: `New Node ${nodes.length + 1}` },
    };
    addNode(newNode);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* 工具栏 */}
      <div
        style={{
          width: '300px',
          padding: '20px',
          background: '#f5f5f5',
          borderRight: '1px solid #ddd',
          overflow: 'auto',
        }}
      >
        <h2 style={{ marginTop: 0 }}>React Flow Components Demo</h2>

        <div style={{ marginBottom: '20px' }}>
          <h3>Actions</h3>
          <button
            onClick={handleAddNode}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              marginBottom: '8px',
            }}
          >
            Add Node
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px',
              marginBottom: '8px',
            }}
          >
            Export Data
          </button>
        </div>

        <div>
          <h3>Registered Nodes</h3>
          <ul style={{ paddingLeft: '20px' }}>
            {registerHelper.getAllConfigs().map((config) => (
              <li key={config.type}>{config.type}</li>
            ))}
          </ul>
        </div>

        {exportedData && (
          <div>
            <h3>Exported Data</h3>
            <textarea
              value={exportedData}
              onChange={(e) => setExportedData(e.target.value)}
              style={{
                width: '100%',
                height: '200px',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
          </div>
        )}
      </div>

      {/* Flow 画布 */}
      <div style={{ flex: 1 }}>
        <FlowCanvas
          registerHelper={registerHelper}
          initialNodes={nodes}
          initialEdges={edges}
          showControls={true}
          showMiniMap={true}
          showBackground={true}
        />
      </div>
    </div>
  );
}

export default App;
