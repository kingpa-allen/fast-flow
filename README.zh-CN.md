# React Flow Components

一个基于 React Flow 构建的强大且灵活的 React 组件库，用于创建交互式节点应用。非常适合工作流构建器、互动叙事、可视化编程等场景。

## ✨ 特性

- 🎨 **预构建基础组件** - 开箱即用的节点组件，支持自定义样式
- 🔧 **简单的注册系统** - 简洁的 API 注册自定义节点类型
- 📝 **内置设置面板** - 每个节点类型都有可配置的表单
- 🎭 **编辑/只读模式** - 在编辑和查看模式之间切换
- 🗂️ **节点库侧边栏** - 拖放界面添加节点
- 🔄 **自动布局** - 使用 Dagre 算法自动排列节点
- 🎯 **动态连接点** - 支持每个节点多个动态连接点
- 💾 **数据导入导出** - Flavor 系统适配后端
- 🎨 **Ant Design 集成** - 开箱即用的漂亮 UI 组件

## 📦 安装

```bash
npm install @kingpa/fast-flow reactflow antd
```

## 🚀 快速开始

### 1. 创建自定义节点

```tsx
import { BaseNode } from '@kingpa/fast-flow';
import { Form, Input } from 'antd';

class MyCustomNode extends BaseNode {
  // 可选：添加设置表单
  protected hasSettingsForm(): boolean {
    return true;
  }

  protected renderSettingsForm(): React.ReactNode {
    const { settingsData } = this.state;
    
    return (
      <Form layout="vertical">
        <Form.Item label="标题">
          <Input
            value={settingsData.title || ''}
            onChange={(e) => this.updateSettingsData('title', e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button onClick={this.handleCloseSettings}>取消</Button>
          <Button type="primary" onClick={this.handleSaveSettings}>保存</Button>
        </Form.Item>
      </Form>
    );
  }

  // 可选：自定义节点内容
  protected renderContent(): React.ReactNode {
    const { data } = this.props;
    return (
      <div>
        <h3>{data.title}</h3>
        <p>{data.description}</p>
      </div>
    );
  }
}
```

### 2. 注册节点类型

```tsx
import { RegisterHelper } from '@kingpa/fast-flow';
import { AppstoreOutlined } from '@ant-design/icons';

RegisterHelper.register(
  'myNode',                    // 节点类型 ID
  MyCustomNode,                // 组件类
  {                            // 默认数据
    title: '我的节点',
    description: '描述信息'
  },
  <AppstoreOutlined />,        // 图标（可选）
  '自定义节点类型'              // 描述（可选）
);
```

### 3. 创建你的 Flow 应用

```tsx
import { FlowCanvas, useFlow } from '@kingpa/fast-flow';

function App() {
  const { nodes, edges, setNodes, setEdges, addEdge } = useFlow({
    initialNodes: [],
    initialEdges: [],
  });

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
        mode="edit"                           // 'edit' | 'read'
        nodeLibraryTitle="📦 我的组件"         // 可选
        nodeLibrarySubtitle="拖拽到画布"       // 可选
        showControls={true}
        showMiniMap={true}
        showBackground={true}
      />
    </div>
  );
}
```

## 🎯 核心概念

### BaseNode 基础节点

所有自定义节点的基础类。提供以下功能：

- **可折叠的头部** 带有可自定义标题
- **设置按钮** 打开模态设置面板
- **连接点**（输入/输出端口）
- **状态管理** 用于表单数据
- **生命周期方法** 用于自定义

#### 受保护的方法

```tsx
class MyNode extends BaseNode {
  // 重写以启用设置面板
  protected hasSettingsForm(): boolean {
    return true;
  }

  // 渲染设置表单内容
  protected renderSettingsForm(): React.ReactNode {
    // 你的表单 JSX
  }

  // 渲染节点主体内容
  protected renderContent(): React.ReactNode {
    // 你的内容 JSX
  }

  // 添加自定义 CSS 类
  protected getClassName(): string {
    return 'my-custom-class';
  }

  // 处理保存操作
  protected onSettingsSave(data: Record<string, any>) {
    // 自定义保存逻辑
  }
}
```

### RegisterHelper 注册助手

用于全局管理节点类型的静态类。

```tsx
// 注册节点类型
RegisterHelper.register(type, component, defaultData, icon, description);

// 获取已注册的组件
const Component = RegisterHelper.getNodeType('myNode');

// 获取节点配置
const config = RegisterHelper.getConfig('myNode');

// 获取所有已注册的配置
const allConfigs = RegisterHelper.getAllConfigs();

// 获取所有节点类型
const nodeTypes = RegisterHelper.getNodeTypes();
```

### FlowCanvas 组件

包装 React Flow 并提供额外功能的主组件。

#### 属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|---------|-------------|
| `mode` | `'edit' \| 'read'` | `'edit'` | 编辑模式显示侧边栏并启用交互 |
| `nodes` | `Node[]` | `[]` | 初始或受控节点 |
| `edges` | `Edge[]` | `[]` | 初始或受控边 |
| `onNodesChange` | `function` | - | 节点变化时的回调 |
| `onEdgesChange` | `function` | - | 边变化时的回调 |
| `onConnect` | `function` | - | 边连接时的回调 |
| `nodeLibraryTitle` | `string` | `'📦 Node Library'` | 侧边栏标题 |
| `nodeLibrarySubtitle` | `string` | `'Drag nodes to canvas'` | 侧边栏副标题 |
| `showControls` | `boolean` | `true` | 显示缩放控件 |
| `showMiniMap` | `boolean` | `false` | 显示小地图 |
| `showBackground` | `boolean` | `false` | 显示网格背景 |
| `showAutoLayoutButton` | `boolean` | `true` | 显示自动布局按钮 |
| `deleteKeyEnabled` | `boolean` | `true` | 启用 Delete/Backspace 键 |

### useFlow Hook

用于管理 flow 状态的便捷 Hook。

```tsx
const {
  nodes,          // 当前节点
  edges,          // 当前边
  setNodes,       // 更新节点
  setEdges,       // 更新边
  addNode,        // 添加单个节点
  addEdge,        // 添加单条边
  removeNode,     // 删除节点
  removeEdge,     // 删除边
  updateNode,     // 更新节点数据
} = useFlow({ initialNodes, initialEdges });
```

## 🎨 高级功能

### 动态连接点

创建带有多个动态连接点的节点：

```tsx
import { Handle, Position } from 'reactflow';

class MultiHandleNode extends BaseNode {
  render() {
    const { data } = this.props;
    const options = data.options || [];

    return (
      <div className="base-node">
        {/* 节点内容 */}
        
        {/* 输入连接点 */}
        <Handle type="target" position={Position.Left} />
        
        {/* 动态输出连接点 */}
        {options.map((option, index) => {
          const topPosition = ((index + 1) / (options.length + 1)) * 100;
          return (
            <Handle
              key={`option-${index}`}
              type="source"
              position={Position.Right}
              id={`option-${index}`}
              style={{ top: `${topPosition}%` }}
            />
          );
        })}
      </div>
    );
  }
}
```

### 编辑模式 vs 只读模式

**编辑模式** (`mode="edit"`):
- 显示节点库侧边栏
- 节点可拖动和连接
- 设置按钮可见
- 启用删除键
- 显示自动布局按钮

**只读模式** (`mode="read"`):
- 隐藏侧边栏
- 节点静态显示
- 隐藏设置
- 禁用删除
- 仅查看模式

### Flavor 系统

用于数据转换的基类：

```tsx
import { Flavor } from '@kingpa/fast-flow';

class MyBackendFlavor extends Flavor {
  export(nodes: Node[], edges: Edge[]): any {
    // 转换为后端格式
    return {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        data: n.data,
      })),
      edges: edges.map(e => ({
        from: e.source,
        to: e.target,
      })),
    };
  }

  import(data: any): { nodes: Node[], edges: Edge[] } {
    // 从后端格式转换
    return {
      nodes: data.nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: { x: 0, y: 0 },
        data: n.data,
      })),
      edges: data.edges.map(e => ({
        id: `e${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
      })),
    };
  }
}
```

## 📖 示例：互动小说

查看 `example/src/InteractiveStory.tsx` 中的完整互动小说示例：

- **StartNode** - 故事开始
- **PlotNode** - 故事事件，带好感度追踪
- **ChoiceNode** - 玩家决策，支持动态选项
- **EndingNode** - 多个故事结局

演示的功能：
- 动态选项（添加/删除选择）
- 每个节点多个连接点
- 自定义样式和图标
- 使用 Ant Design 的设置表单
- 完整的叙事流程

## 🎨 样式定制

### 自定义节点样式

```css
/* 为你的节点添加自定义样式 */
.my-custom-node {
  border: 2px solid #1890ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.my-custom-node.selected {
  border-color: #096dd9;
  box-shadow: 0 4px 12px rgba(9, 109, 217, 0.3);
}
```

### 覆盖基础样式

导入并修改基础样式：

```tsx
import '@kingpa/fast-flow/dist/style.css';
import './my-custom-styles.css';
```

## 🛠️ API 参考

### 组件

- `BaseNode` - 自定义节点的基类
- `FlowCanvas` - 主 Flow 画布组件
- `Flow` - 受控 Flow 组件（较低级别）
- `NodeLibraryPanel` - 侧边栏组件（导出供自定义使用）

### 类

- `RegisterHelper` - 节点注册系统
- `Flavor` - 数据导入导出基类

### Hooks

- `useFlow` - Flow 状态管理 Hook

### 类型

```tsx
import type {
  BaseNodeProps,
  BaseNodeState,
  FlowProps,
  FlowMode,
  NodeConfig,
  BaseNodeData,
} from '@kingpa/fast-flow';
```

## 📝 开发

### 构建库

```bash
npm run build
```

### 运行示例

```bash
npm run demo
```

### 项目结构

```
flow/
├── src/
│   ├── components/
│   │   ├── BaseNode.tsx          # 基础节点组件
│   │   ├── BaseNode.css          # 基础节点样式
│   │   ├── Flow.tsx              # 主 Flow 组件
│   │   └── NodeLibraryPanel.tsx  # 侧边栏组件
│   ├── core/
│   │   ├── RegisterHelper.ts     # 节点注册
│   │   └── Flavor.ts             # 数据转换
│   ├── hooks/
│   │   └── useFlow.ts            # Flow 状态 Hook
│   ├── types/
│   │   └── index.ts              # TypeScript 类型
│   └── index.ts                  # 主导出文件
├── example/
│   └── src/
│       ├── App.tsx               # 演示应用
│       └── InteractiveStory.tsx  # 故事示例
└── dist/                         # 构建文件
```

## 💡 使用场景

### 工作流构建器
创建可视化的业务流程、审批流程等。

### 互动叙事
构建分支剧情的互动小说、游戏剧情编辑器。

### 可视化编程
实现拖拽式的逻辑编排、数据流处理。

### 思维导图
创建层级化的思维导图和知识图谱。

### 状态机编辑器
设计和可视化状态转换逻辑。

## 🎓 最佳实践

### 1. 节点设计

- **单一职责**：每个节点类型专注于一个功能
- **清晰的数据结构**：使用明确的 data 字段
- **合理的默认值**：在注册时提供合理的默认数据

### 2. 性能优化

- **避免不必要的重渲染**：使用 React.memo 包装纯展示组件
- **大量节点**：启用虚拟化或分页
- **复杂计算**：使用 useMemo 缓存计算结果

### 3. 用户体验

- **提供视觉反馈**：节点状态变化要有明显提示
- **键盘快捷键**：支持常用操作的快捷键
- **撤销/重做**：对于复杂应用考虑实现历史记录

### 4. 数据管理

- **持久化**：定期保存用户数据
- **版本控制**：为数据格式添加版本号
- **校验**：在导入数据时进行格式校验

## ❓ 常见问题

### Q: 如何限制连接规则？

```tsx
const isValidConnection = (connection) => {
  // 自定义连接验证逻辑
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);
  
  // 例如：只允许特定类型之间的连接
  return sourceNode.type === 'start' && targetNode.type === 'process';
};

<FlowCanvas
  isValidConnection={isValidConnection}
  // ... 其他属性
/>
```

### Q: 如何自定义边的样式？

```tsx
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: '#1890ff', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed },
};

<FlowCanvas
  defaultEdgeOptions={defaultEdgeOptions}
  // ... 其他属性
/>
```

### Q: 如何保存和加载数据？

```tsx
// 保存
const saveData = () => {
  const data = { nodes, edges };
  localStorage.setItem('flowData', JSON.stringify(data));
};

// 加载
const loadData = () => {
  const data = JSON.parse(localStorage.getItem('flowData'));
  if (data) {
    setNodes(data.nodes);
    setEdges(data.edges);
  }
};
```

### Q: 如何实现节点搜索？

```tsx
const searchNodes = (keyword: string) => {
  return nodes.filter(node => 
    node.data.label?.toLowerCase().includes(keyword.toLowerCase())
  );
};
```

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

### 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

MIT

## 🙏 致谢

本项目基于以下优秀开源项目构建：

- [React Flow](https://reactflow.dev/) - 节点式 UI 库
- [Ant Design](https://ant.design/) - UI 组件库
- [Dagre](https://github.com/dagrejs/dagre) - 图布局算法

## 📞 支持

如有问题和疑问，请使用 GitHub issue tracker。

## 🔗 相关链接

- [React Flow 文档](https://reactflow.dev/docs/introduction)
- [Ant Design 文档](https://ant.design/docs/react/introduce-cn)
- [在线演示](https://your-demo-url.com)

---

**开心构建！🚀**
