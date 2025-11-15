# Quick Start Guide

## 1. 安装 / Installation

```bash
npm install @your-scope/react-flow-components react reactflow
```

## 2. 基础使用 / Basic Usage

### 最简单的例子 / Simplest Example

```tsx
import React from 'react';
import ReactFlow from 'reactflow';
import { registerHelper, BaseNode } from '@your-scope/react-flow-components';
import 'reactflow/dist/style.css';

// 注册基础节点
registerHelper.register('baseNode', BaseNode);

function App() {
  const nodes = [
    {
      id: '1',
      type: 'baseNode',
      position: { x: 100, y: 100 },
      data: { label: 'Hello World!' }
    }
  ];

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow 
        nodes={nodes} 
        nodeTypes={registerHelper.getNodeTypes()} 
      />
    </div>
  );
}

export default App;
```

## 3. 创建自定义节点 / Create Custom Node

```tsx
import { createCustomNode, BaseNodeData } from '@your-scope/react-flow-components';

// 定义节点数据类型
interface MyNodeData extends BaseNodeData {
  value: number;
  status: string;
}

// 创建自定义节点
const MyCustomNode = createCustomNode<MyNodeData>(
  (props) => {
    return (
      <div>
        <p>Value: {props.data.value}</p>
        <p>Status: {props.data.status}</p>
      </div>
    );
  },
  {
    showHeader: true,      // 显示头部
    collapsible: true,     // 可折叠
    className: 'my-node'   // 自定义样式类
  }
);

// 注册节点
registerHelper.register('myNode', MyCustomNode);

// 使用节点
const nodes = [
  {
    id: '1',
    type: 'myNode',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Custom Node',
      value: 42,
      status: 'active'
    }
  }
];
```

## 4. 数据导入导出 / Import/Export Data

```tsx
import { flavor } from '@your-scope/react-flow-components';

function DataManager({ nodes, edges }) {
  // 导出为 JSON
  const handleExport = () => {
    const json = flavor.exportToJSON(nodes, edges, {
      author: 'Your Name',
      created: new Date().toISOString()
    });
    
    // 保存到文件
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flow-data.json';
    a.click();
  };

  // 从 JSON 导入
  const handleImport = (jsonString) => {
    const { nodes, edges } = flavor.importFromJSON(jsonString);
    // 更新你的状态
    setNodes(nodes);
    setEdges(edges);
  };

  return (
    <div>
      <button onClick={handleExport}>Export</button>
      <input 
        type="file" 
        onChange={(e) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (e) => handleImport(e.target.result);
          reader.readAsText(file);
        }}
      />
    </div>
  );
}
```

## 5. 完整示例 / Complete Example

```tsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { 
  registerHelper, 
  flavor, 
  BaseNode,
  createCustomNode 
} from '@your-scope/react-flow-components';
import 'reactflow/dist/style.css';

// 创建自定义节点
const ProcessNode = createCustomNode(
  (props) => (
    <div style={{ padding: '10px' }}>
      <p>Processing: {props.data.task}</p>
      <progress value={props.data.progress} max="100" />
    </div>
  )
);

// 注册节点
registerHelper.register('baseNode', BaseNode);
registerHelper.register('processNode', ProcessNode);

function FlowApp() {
  const [nodes, setNodes] = useState([
    {
      id: '1',
      type: 'baseNode',
      position: { x: 100, y: 100 },
      data: { label: 'Start' }
    },
    {
      id: '2',
      type: 'processNode',
      position: { x: 300, y: 100 },
      data: { label: 'Process', task: 'Data Transform', progress: 75 }
    }
  ]);

  const [edges, setEdges] = useState([
    { id: 'e1-2', source: '1', target: '2' }
  ]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  // 导出数据
  const handleExport = () => {
    const data = flavor.exportToJSON(nodes, edges);
    console.log('Exported:', data);
    navigator.clipboard.writeText(data);
    alert('Data copied to clipboard!');
  };

  // 添加新节点
  const addNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'baseNode',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: `Node ${nodes.length + 1}` }
    };
    setNodes([...nodes, newNode]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <button onClick={addNode}>Add Node</button>
        <button onClick={handleExport}>Export</button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={registerHelper.getNodeTypes()}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}

export default FlowApp;
```

## 6. 自定义样式 / Custom Styling

```css
/* 覆盖 BaseNode 样式 */
.my-custom-node .base-node-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.my-custom-node.selected .base-node-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.my-custom-node .base-node-content {
  background: #f0f0f0;
  border-radius: 0 0 8px 8px;
}
```

## 7. 常见用例 / Common Use Cases

### 7.1 批量注册节点

```tsx
const nodeConfigs = [
  { type: 'input', component: InputNode },
  { type: 'process', component: ProcessNode },
  { type: 'output', component: OutputNode }
];

registerHelper.registerBatch(nodeConfigs);
```

### 7.2 动态数据更新

```tsx
// 更新节点数据
setNodes((nds) =>
  nds.map((node) =>
    node.id === '1'
      ? { ...node, data: { ...node.data, value: newValue } }
      : node
  )
);
```

### 7.3 持久化到 LocalStorage

```tsx
// 保存
const saveToLocalStorage = () => {
  const data = flavor.export(nodes, edges);
  localStorage.setItem('flowData', JSON.stringify(data));
};

// 加载
const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('flowData');
  if (saved) {
    const { nodes, edges } = flavor.import(JSON.parse(saved));
    setNodes(nodes);
    setEdges(edges);
  }
};
```

## 8. 常见问题 / FAQ

### Q: 如何禁用节点折叠功能？
```tsx
const NonCollapsibleNode = createCustomNode(
  (props) => <YourContent />,
  { collapsible: false }
);
```

### Q: 如何隐藏头部？
```tsx
const NoHeaderNode = createCustomNode(
  (props) => <YourContent />,
  { showHeader: false }
);
```

### Q: 如何添加更多的 Handle？
```tsx
import { Handle, Position } from 'reactflow';

const MultiHandleNode = createCustomNode((props) => (
  <div>
    <Handle type="target" position={Position.Top} id="top" />
    <Handle type="target" position={Position.Left} id="left" />
    {/* Your content */}
    <Handle type="source" position={Position.Right} id="right" />
    <Handle type="source" position={Position.Bottom} id="bottom" />
  </div>
));
```

## 9. 下一步 / Next Steps

- 📖 阅读完整 API 文档: [USAGE.md](./USAGE.md)
- 🏗️ 查看架构设计: [ARCHITECTURE.md](./ARCHITECTURE.md)
- 💻 运行示例项目: `example/` 目录
- 📦 发布到 npm: 修改 package.json 后运行 `npm publish`

## 10. 资源 / Resources

- [React Flow 官方文档](https://reactflow.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [项目仓库](your-repository-url)

---

**开始构建你的流程图应用吧！** 🚀
