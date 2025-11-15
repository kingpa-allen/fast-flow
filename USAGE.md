# React Flow Components Library

A React Flow component library with powerful features for building interactive node-based UIs.

## Features

### 1. **RegisterHelper** - Dynamic Node Registration
A class for dynamically registering and managing node components in the canvas.

### 2. **Flavor** - Data Import/Export
A class for handling data serialization and deserialization.

### 3. **BaseNode** - Base Node Component
A foundational node component with built-in features:
- Header with title
- Collapse/expand functionality
- Customizable content area
- Input/output handles

## Installation

```bash
npm install @kingpa/fast-flow
```

## Usage

### Basic Example

```tsx
import React from 'react';
import ReactFlow from 'reactflow';
import { 
  RegisterHelper, 
  Flavor, 
  BaseNode, 
  createCustomNode 
} from '@kingpa/fast-flow';
import 'reactflow/dist/style.css';

// 1. Create and register custom nodes
const registerHelper = new RegisterHelper();

// Register BaseNode
registerHelper.register('baseNode', BaseNode, { 
  label: 'Default Node' 
});

// Create a custom node
const MyCustomNode = createCustomNode((props) => {
  return (
    <div>
      <p>Custom content: {props.data.customField}</p>
    </div>
  );
}, {
  showHeader: true,
  collapsible: true,
  className: 'my-custom-node'
});

registerHelper.register('customNode', MyCustomNode);

// 2. Use Flavor for data management
const flavor = new Flavor();

const App = () => {
  const [nodes, setNodes] = React.useState([
    {
      id: '1',
      type: 'baseNode',
      position: { x: 100, y: 100 },
      data: { label: 'Node 1', description: 'First node' }
    },
    {
      id: '2',
      type: 'customNode',
      position: { x: 300, y: 100 },
      data: { label: 'Node 2', customField: 'Hello World' }
    }
  ]);

  const [edges, setEdges] = React.useState([
    { id: 'e1-2', source: '1', target: '2' }
  ]);

  // Export data
  const handleExport = () => {
    const data = flavor.export(nodes, edges, { 
      author: 'Your Name',
      created: new Date()
    });
    console.log('Exported:', data);
    
    // Export to JSON string
    const json = flavor.exportToJSON(nodes, edges);
    console.log('JSON:', json);
  };

  // Import data
  const handleImport = (jsonString: string) => {
    const { nodes: importedNodes, edges: importedEdges } = 
      flavor.importFromJSON(jsonString);
    setNodes(importedNodes);
    setEdges(importedEdges);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={registerHelper.getNodeTypes()}
        onNodesChange={(changes) => {/* handle changes */}}
        onEdgesChange={(changes) => {/* handle changes */}}
      >
        <button onClick={handleExport}>Export</button>
      </ReactFlow>
    </div>
  );
};

export default App;
```

## API Reference

### RegisterHelper

```typescript
class RegisterHelper {
  // Register a single node
  register(type: string, component: React.ComponentType, defaultData?: object): void
  
  // Register multiple nodes
  registerBatch(configs: NodeConfig[]): void
  
  // Unregister a node
  unregister(type: string): boolean
  
  // Get all registered node types
  getNodeTypes(): Record<string, React.ComponentType>
  
  // Get node configuration
  getConfig(type: string): NodeConfig | undefined
  
  // Check if node is registered
  isRegistered(type: string): boolean
  
  // Clear all registrations
  clear(): void
}
```

### Flavor

```typescript
class Flavor {
  // Export data
  export(nodes: any[], edges: any[], metadata?: object): FlavorData
  
  // Import data
  import(data: FlavorData): { nodes: any[], edges: any[] }
  
  // Export to JSON string
  exportToJSON(nodes: any[], edges: any[], metadata?: object): string
  
  // Import from JSON string
  importFromJSON(json: string): { nodes: any[], edges: any[] }
  
  // Clone data
  clone(nodes: any[], edges: any[]): { nodes: any[], edges: any[] }
}
```

### BaseNode

```typescript
// Use directly
<BaseNode data={{ label: 'My Node', collapsed: false }} />

// Create custom node with HOC
const CustomNode = createCustomNode(
  (props) => <YourContent />,
  {
    showHeader: true,
    collapsible: true,
    className: 'custom-class'
  }
);
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev
```

## License

MIT
