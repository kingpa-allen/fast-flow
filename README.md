# React Flow Components

A powerful and flexible React component library built on top of React Flow for creating interactive node-based applications. Perfect for workflow builders, interactive storytelling, visual programming, and more.

## ✨ Features

- 🎨 **Pre-built Base Components** - Ready-to-use node components with customizable styling
- 🔧 **Easy Registration System** - Simple API to register custom node types
- 📝 **Built-in Settings Panel** - Configurable forms for each node type
- 🎭 **Edit/Read Modes** - Switch between editing and viewing modes
- 🗂️ **Node Library Sidebar** - Drag-and-drop interface for adding nodes
- 🔄 **Auto Layout** - Automatic node arrangement using Dagre algorithm
- 🎯 **Dynamic Connection Points** - Support for multiple dynamic handles per node
- 💾 **Data Import/Export** - Flavor system for backend adaptability
- 🎨 **Ant Design Integration** - Beautiful UI components out of the box

## 📦 Installation

```bash
npm install @kingpa/fast-flow reactflow antd
```

## 🚀 Quick Start

### 1. Create Custom Nodes

```tsx
import { BaseNode } from '@kingpa/fast-flow';
import { Form, Input } from 'antd';

class MyCustomNode extends BaseNode {
  // Optional: Add settings form
  protected hasSettingsForm(): boolean {
    return true;
  }

  protected renderSettingsForm(): React.ReactNode {
    const { settingsData } = this.state;
    
    return (
      <Form layout="vertical">
        <Form.Item label="Title">
          <Input
            value={settingsData.title || ''}
            onChange={(e) => this.updateSettingsData('title', e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button onClick={this.handleCloseSettings}>Cancel</Button>
          <Button type="primary" onClick={this.handleSaveSettings}>Save</Button>
        </Form.Item>
      </Form>
    );
  }

  // Optional: Customize node content
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

### 2. Register Node Types

```tsx
import { RegisterHelper } from '@kingpa/fast-flow';
import { AppstoreOutlined } from '@ant-design/icons';

RegisterHelper.register(
  'myNode',                    // Node type ID
  MyCustomNode,                // Component class
  {                            // Default data
    title: 'My Node',
    description: 'Description'
  },
  <AppstoreOutlined />,        // Icon (optional)
  'A custom node type'         // Description (optional)
);
```

### 3. Create Your Flow Application

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
        nodeLibraryTitle="📦 My Components"   // Optional
        nodeLibrarySubtitle="Drag to canvas"  // Optional
        showControls={true}
        showMiniMap={true}
        showBackground={true}
      />
    </div>
  );
}
```

## 🎯 Core Concepts

### BaseNode

The foundation for all custom nodes. Provides:

- **Collapsible header** with customizable title
- **Settings button** with modal panel
- **Connection handles** (input/output ports)
- **State management** for form data
- **Lifecycle methods** for customization

#### Protected Methods

```tsx
class MyNode extends BaseNode {
  // Override to enable settings panel
  protected hasSettingsForm(): boolean {
    return true;
  }

  // Render settings form content
  protected renderSettingsForm(): React.ReactNode {
    // Your form JSX
  }

  // Render node body content
  protected renderContent(): React.ReactNode {
    // Your content JSX
  }

  // Add custom CSS class
  protected getClassName(): string {
    return 'my-custom-class';
  }

  // Handle save action
  protected onSettingsSave(data: Record<string, any>) {
    // Custom save logic
  }
}
```

### RegisterHelper

Static class for managing node types globally.

```tsx
// Register a node type
RegisterHelper.register(type, component, defaultData, icon, description);

// Get registered component
const Component = RegisterHelper.getNodeType('myNode');

// Get node configuration
const config = RegisterHelper.getConfig('myNode');

// Get all registered configs
const allConfigs = RegisterHelper.getAllConfigs();

// Get all node types
const nodeTypes = RegisterHelper.getNodeTypes();
```

### FlowCanvas Component

Main component that wraps React Flow with additional features.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'edit' \| 'read'` | `'edit'` | Edit mode shows sidebar and enables interactions |
| `nodes` | `Node[]` | `[]` | Initial or controlled nodes |
| `edges` | `Edge[]` | `[]` | Initial or controlled edges |
| `onNodesChange` | `function` | - | Callback when nodes change |
| `onEdgesChange` | `function` | - | Callback when edges change |
| `onConnect` | `function` | - | Callback when edges connect |
| `nodeLibraryTitle` | `string` | `'📦 Node Library'` | Sidebar title |
| `nodeLibrarySubtitle` | `string` | `'Drag nodes to canvas'` | Sidebar subtitle |
| `showControls` | `boolean` | `true` | Show zoom controls |
| `showMiniMap` | `boolean` | `false` | Show minimap |
| `showBackground` | `boolean` | `false` | Show grid background |
| `showAutoLayoutButton` | `boolean` | `true` | Show auto layout button |
| `deleteKeyEnabled` | `boolean` | `true` | Enable Delete/Backspace keys |

### useFlow Hook

Convenient hook for managing flow state.

```tsx
const {
  nodes,          // Current nodes
  edges,          // Current edges
  setNodes,       // Update nodes
  setEdges,       // Update edges
  addNode,        // Add a single node
  addEdge,        // Add a single edge
  removeNode,     // Remove a node
  removeEdge,     // Remove an edge
  updateNode,     // Update node data
} = useFlow({ initialNodes, initialEdges });
```

## 🎨 Advanced Features

### Dynamic Connection Points

Create nodes with multiple dynamic handles:

```tsx
import { Handle, Position } from 'reactflow';

class MultiHandleNode extends BaseNode {
  render() {
    const { data } = this.props;
    const options = data.options || [];

    return (
      <div className="base-node">
        {/* Node content */}
        
        {/* Input handle */}
        <Handle type="target" position={Position.Left} />
        
        {/* Dynamic output handles */}
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

### Edit vs Read Mode

**Edit Mode** (`mode="edit"`):
- Shows node library sidebar
- Nodes are draggable and connectable
- Settings button visible
- Delete keys enabled
- Auto layout button visible

**Read Mode** (`mode="read"`):
- Hides sidebar
- Nodes are static
- Settings hidden
- Delete disabled
- View-only mode

### Flavor System

Base class for data transformation:

```tsx
import { Flavor } from '@kingpa/fast-flow';

class MyBackendFlavor extends Flavor {
  export(nodes: Node[], edges: Edge[]): any {
    // Transform to your backend format
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
    // Transform from your backend format
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

## 📖 Example: Interactive Story

See the complete interactive story example in `example/src/InteractiveStory.tsx`:

- **StartNode** - Story beginning
- **PlotNode** - Story events with affection tracking
- **ChoiceNode** - Player decisions with dynamic options
- **EndingNode** - Multiple story endings

Features demonstrated:
- Dynamic options (add/remove choices)
- Multiple connection points per node
- Custom styling and icons
- Settings forms with Ant Design
- Complete narrative flow

## 🎨 Styling

### Custom Node Styles

```css
/* Add custom styles for your nodes */
.my-custom-node {
  border: 2px solid #1890ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.my-custom-node.selected {
  border-color: #096dd9;
  box-shadow: 0 4px 12px rgba(9, 109, 217, 0.3);
}
```

### Override Base Styles

Import and modify the base styles:

```tsx
import '@kingpa/fast-flow/dist/style.css';
import './my-custom-styles.css';
```

## 🛠️ API Reference

### Components

- `BaseNode` - Base class for custom nodes
- `FlowCanvas` - Main flow canvas component
- `Flow` - Controlled flow component (lower level)
- `NodeLibraryPanel` - Sidebar component (exported for custom use)

### Classes

- `RegisterHelper` - Node registration system
- `Flavor` - Data import/export base class

### Hooks

- `useFlow` - Flow state management hook

### Types

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

## 📝 Development

### Build the library

```bash
npm run build
```

### Run the example

```bash
npm run demo
```

### Project Structure

```
flow/
├── src/
│   ├── components/
│   │   ├── BaseNode.tsx          # Base node component
│   │   ├── BaseNode.css          # Base node styles
│   │   ├── Flow.tsx              # Main flow component
│   │   └── NodeLibraryPanel.tsx  # Sidebar component
│   ├── core/
│   │   ├── RegisterHelper.ts     # Node registration
│   │   └── Flavor.ts             # Data transformation
│   ├── hooks/
│   │   └── useFlow.ts            # Flow state hook
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   └── index.ts                  # Main export
├── example/
│   └── src/
│       ├── App.tsx               # Demo app
│       └── InteractiveStory.tsx  # Story example
└── dist/                         # Built files
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🙏 Acknowledgments

Built with:
- [React Flow](https://reactflow.dev/) - Node-based UI library
- [Ant Design](https://ant.design/) - UI component library
- [Dagre](https://github.com/dagrejs/dagre) - Graph layout algorithm

## 📞 Support

For issues and questions, please use the GitHub issue tracker.

---

**Happy Building! 🚀**
