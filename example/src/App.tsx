import React, { useState } from 'react';
import { Form, Input, Select, Button } from 'antd';
import { AppstoreOutlined, FunctionOutlined, ExportOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import {
  RegisterHelper,
  Flavor,
  BaseNode,
  FlowCanvas,
  useFlow,
} from '../../dist/index.esm.js';

// 创建 Flavor 实例
const flavor = new Flavor();

// 创建自定义节点 1: 数据处理节点（继承 BaseNode）
class DataProcessNode extends BaseNode {
  // 启用设置面板
  protected hasSettingsForm(): boolean {
    return true;
  }

  // 渲染设置表单
  protected renderSettingsForm(): React.ReactNode {
    const { settingsData } = this.state;

    return (
      <Form
        layout="vertical"
        initialValues={{
          operation: settingsData.operation || 'Transform',
          input: settingsData.input || '',
        }}
      >
        <Form.Item label="Operation Type" name="operation">
          <Select
            value={settingsData.operation || 'Transform'}
            onChange={(value) => this.updateSettingsData('operation', value)}
          >
            <Select.Option value="Transform">Transform</Select.Option>
            <Select.Option value="Filter">Filter</Select.Option>
            <Select.Option value="Aggregate">Aggregate</Select.Option>
            <Select.Option value="Map">Map</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Input Data" name="input">
          <Input.TextArea
            rows={4}
            value={settingsData.input || ''}
            onChange={(e) => this.updateSettingsData('input', e.target.value)}
            placeholder="Enter input data..."
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={this.handleCloseSettings}>
              Cancel
            </Button>
            <Button type="primary" onClick={this.handleSaveSettings}>
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    );
  }

  protected renderContent(): React.ReactNode {
    const { data } = this.props;
    return (
      <div style={{ padding: '8px' }}>
        <div style={{ marginBottom: '6px' }}>
          <strong>Operation:</strong> {data.operation || 'None'}
        </div>
        <div>
          <strong>Input:</strong> {data.input || 'No data'}
        </div>
      </div>
    );
  }

  protected getClassName(): string {
    return 'data-process-node';
  }
}

// 创建自定义节点 2: 输出节点（继承 BaseNode）
class OutputNode extends BaseNode {
  protected renderContent(): React.ReactNode {
    const { data } = this.props;
    return (
      <div style={{ padding: '8px', color: '#2e7d32' }}>
        <div>✓ Ready to output</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          {data.format || 'JSON'}
        </div>
      </div>
    );
  }

  protected getClassName(): string {
    return 'output-node';
  }
}

// 注册节点类型
RegisterHelper.register(
  'baseNode',
  BaseNode,
  { label: 'Base Node' },
  <AppstoreOutlined />,
  'Basic node component with header and collapse'
);
RegisterHelper.register(
  'dataProcess',
  DataProcessNode,
  {
    label: 'Data Process',
    operation: 'Transform',
    input: '',
  },
  <FunctionOutlined />,
  'Process and transform data'
);
RegisterHelper.register(
  'output',
  OutputNode,
  {
    label: 'Output',
    format: 'JSON',
  },
  <ExportOutlined />,
  'Output result in various formats'
);

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
  const { nodes, edges, addEdge, setNodes, setEdges } = useFlow({
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

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
        onConnect={(connection) => {
          const newEdge = {
            id: `e${connection.source}-${connection.target}`,
            ...connection,
          };
          addEdge(newEdge);
        }}
        mode="edit"
        showControls={true}
        showMiniMap={true}
        showBackground={true}
      />
    </div>
  );
}

export default App;
