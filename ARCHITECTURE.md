# Architecture Overview

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Flow Canvas                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           RegisterHelper (Singleton)              │  │
│  │                                                   │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐          │  │
│  │  │ BaseNode│  │ Custom  │  │ Custom  │          │  │
│  │  │         │  │ Node 1  │  │ Node 2  │  ...     │  │
│  │  └─────────┘  └─────────┘  └─────────┘          │  │
│  │                                                   │  │
│  │  register() | unregister() | getNodeTypes()     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘

           ▲                                    │
           │                                    │
           │ Import/Export                      │
           │                                    ▼

┌─────────────────────────────────────────────────────────┐
│                  Flavor (Data Layer)                     │
│                                                          │
│  export() ──▶ Serialize ──▶ JSON String                │
│  import() ──▶ Deserialize ──▶ Nodes & Edges            │
│                                                          │
│  • Version Management                                   │
│  • Data Validation                                      │
│  • Clone & Transform                                    │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action
    │
    ▼
┌─────────────────┐
│  RegisterHelper │ ──▶ Register/Manage Node Types
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   React Flow    │ ──▶ Render Canvas with Nodes
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   BaseNode /    │ ──▶ Display with Header & Content
│  Custom Nodes   │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│     Flavor      │ ──▶ Export/Import Data
└─────────────────┘
```

## Class Relationships

### RegisterHelper
```typescript
RegisterHelper
  │
  ├─ Map<string, ComponentType>  // nodeTypes
  ├─ Map<string, NodeConfig>     // nodeConfigs
  │
  └─ Methods:
      ├─ register()
      ├─ unregister()
      ├─ getNodeTypes()
      ├─ getConfig()
      └─ clear()
```

### Flavor
```typescript
Flavor
  │
  ├─ version: string
  │
  └─ Methods:
      ├─ export()
      ├─ import()
      ├─ exportToJSON()
      ├─ importFromJSON()
      ├─ clone()
      └─ validate()
```

### BaseNode
```typescript
BaseNode (Component)
  │
  ├─ Props:
  │   ├─ data: BaseNodeData
  │   ├─ id: string
  │   └─ selected: boolean
  │
  ├─ State:
  │   └─ collapsed: boolean
  │
  └─ Features:
      ├─ Header with Title
      ├─ Collapse Button
      ├─ Content Area
      ├─ Input Handle (Left)
      └─ Output Handle (Right)
```

## Node Inheritance Pattern

```
BaseNode (Base Component)
    │
    ├─ Header & Title
    ├─ Collapse Functionality
    ├─ Input/Output Handles
    └─ Styling
        │
        ▼
createCustomNode(renderFn, options)
    │
    ├─ Extends BaseNode features
    ├─ Custom content renderer
    └─ Optional configuration
        │
        ▼
    Custom Node Components
        ├─ DataProcessNode
        ├─ OutputNode
        └─ YourCustomNode
```

## Type System

```typescript
// Core Types
interface NodeConfig {
  type: string;
  component: ComponentType<NodeProps>;
  defaultData?: Record<string, any>;
}

interface BaseNodeData {
  label: string;
  collapsed?: boolean;
  [key: string]: any;
}

interface FlavorData {
  nodes: any[];
  edges: any[];
  metadata?: Record<string, any>;
}
```

## Usage Pattern

```
1. Initialize
   ├─ Create RegisterHelper instance
   └─ Create Flavor instance

2. Register Nodes
   ├─ Use registerHelper.register()
   └─ Register BaseNode or custom nodes

3. Setup React Flow
   ├─ Pass nodeTypes from registerHelper.getNodeTypes()
   └─ Define initial nodes and edges

4. Data Management
   ├─ Use flavor.export() to save data
   └─ Use flavor.import() to load data

5. Customize
   ├─ Create custom nodes with createCustomNode()
   └─ Style with CSS classes
```

## Extension Points

### 1. Custom Node Creation
```typescript
const MyNode = createCustomNode(
  (props) => <YourContent />,
  { showHeader: true, collapsible: true }
);
```

### 2. Data Transformation
```typescript
class CustomFlavor extends Flavor {
  // Override serialize methods
  customTransform(data) { ... }
}
```

### 3. Node Registration
```typescript
// Add custom validation
class CustomRegisterHelper extends RegisterHelper {
  register(type, component, data) {
    // Add validation logic
    super.register(type, component, data);
  }
}
```

## Best Practices

1. **Singleton Pattern**: Use provided singleton instances for global state
   ```typescript
   import { registerHelper, flavor } from '@your-scope/react-flow-components';
   ```

2. **Type Safety**: Leverage TypeScript types for custom nodes
   ```typescript
   interface MyNodeData extends BaseNodeData {
     customField: string;
   }
   ```

3. **Composition**: Use `createCustomNode` for reusable components
   ```typescript
   const reusableNode = createCustomNode(renderFn, options);
   ```

4. **Data Versioning**: Use Flavor's version management for compatibility
   ```typescript
   const flavor = new Flavor('2.0.0');
   ```
