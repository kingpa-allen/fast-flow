# React Flow Components Library - Project Summary

## 项目概述 / Project Overview

这是一个基于 React Flow 的 npm 组件库，提供了三个核心功能：

1. **RegisterHelper** - 动态注册画布节点组件的类
2. **Flavor** - 数据导入导出的类
3. **BaseNode** - 带有头部、标题、折叠功能的基础节点组件

## 项目结构 / Project Structure

```
flow/
├── src/                          # 源代码目录
│   ├── components/               # 组件目录
│   │   ├── BaseNode.tsx         # 基础节点组件
│   │   └── BaseNode.css         # 基础节点样式
│   ├── core/                    # 核心类目录
│   │   ├── RegisterHelper.ts    # 节点注册管理类
│   │   └── Flavor.ts            # 数据导入导出类
│   ├── types/                   # 类型定义目录
│   │   └── index.ts             # 类型定义
│   └── index.ts                 # 主入口文件
├── example/                     # 示例应用
│   ├── src/
│   │   ├── App.tsx             # 示例应用主组件
│   │   ├── main.tsx            # 示例应用入口
│   │   └── index.css           # 示例应用样式
│   └── index.html              # 示例应用 HTML
├── dist/                        # 构建输出目录（自动生成）
│   ├── index.js                # CommonJS 格式
│   ├── index.esm.js            # ES Module 格式
│   └── index.d.ts              # TypeScript 类型定义
├── package.json                # 项目配置
├── tsconfig.json               # TypeScript 配置
├── rollup.config.js            # Rollup 打包配置
├── USAGE.md                    # 使用文档
└── .gitignore                  # Git 忽略文件

```

## 核心功能 / Core Features

### 1. RegisterHelper 类

**用途**: 动态注册和管理画布中的节点组件

**主要方法**:
- `register(type, component, defaultData)` - 注册单个节点组件
- `registerBatch(configs)` - 批量注册节点组件
- `unregister(type)` - 注销节点组件
- `getNodeTypes()` - 获取所有已注册的节点类型
- `getConfig(type)` - 获取节点配置
- `isRegistered(type)` - 检查节点是否已注册
- `clear()` - 清空所有注册

**使用示例**:
```typescript
import { RegisterHelper, BaseNode } from '@kingpa/fast-flow';

const registerHelper = new RegisterHelper();

// 注册节点
registerHelper.register('myNode', BaseNode, { label: 'My Node' });

// 在 ReactFlow 中使用
<ReactFlow nodeTypes={registerHelper.getNodeTypes()} />
```

### 2. Flavor 类

**用途**: 处理流程图数据的导入和导出

**主要方法**:
- `export(nodes, edges, metadata)` - 导出数据对象
- `import(data)` - 导入数据对象
- `exportToJSON(nodes, edges, metadata)` - 导出为 JSON 字符串
- `importFromJSON(json)` - 从 JSON 字符串导入
- `clone(nodes, edges)` - 克隆数据
- `getVersion()` / `setVersion()` - 版本管理

**使用示例**:
```typescript
import { Flavor } from '@kingpa/fast-flow';

const flavor = new Flavor();

// 导出
const json = flavor.exportToJSON(nodes, edges, { 
  author: 'Your Name' 
});

// 导入
const { nodes, edges } = flavor.importFromJSON(json);
```

### 3. BaseNode 组件

**用途**: 提供带有标准功能的基础节点组件

**特性**:
- ✅ 美观的头部标题栏
- ✅ 折叠/展开功能
- ✅ 自动渲染节点数据
- ✅ 内置输入/输出端点
- ✅ 选中状态样式
- ✅ 响应式设计

**使用方式**:

1. **直接使用 BaseNode**:
```typescript
registerHelper.register('baseNode', BaseNode);
```

2. **使用 createCustomNode 创建自定义节点**:
```typescript
import { createCustomNode } from '@kingpa/fast-flow';

const MyCustomNode = createCustomNode(
  (props) => (
    <div>
      <p>Custom content: {props.data.value}</p>
    </div>
  ),
  {
    showHeader: true,
    collapsible: true,
    className: 'my-custom-node'
  }
);

registerHelper.register('customNode', MyCustomNode);
```

## 技术栈 / Tech Stack

- **React** 18/19
- **React Flow** 11.x
- **TypeScript** 5.x
- **Rollup** - 模块打包
- **PostCSS** - CSS 处理

## 构建和开发 / Build & Development

### 安装依赖
```bash
npm install
```

### 构建库
```bash
npm run build
```

### 开发模式（监听文件变化）
```bash
npm run dev
```

### 输出文件
- `dist/index.js` - CommonJS 格式
- `dist/index.esm.js` - ES Module 格式
- `dist/index.d.ts` - TypeScript 类型定义

## 使用示例 / Usage Example

完整的使用示例请参考 `example/` 目录和 `USAGE.md` 文件。

### 快速开始
```typescript
import React from 'react';
import ReactFlow from 'reactflow';
import { 
  RegisterHelper, 
  Flavor, 
  BaseNode 
} from '@kingpa/fast-flow';

const registerHelper = new RegisterHelper();
registerHelper.register('baseNode', BaseNode);

const App = () => {
  const [nodes, setNodes] = React.useState([
    {
      id: '1',
      type: 'baseNode',
      position: { x: 100, y: 100 },
      data: { label: 'My First Node' }
    }
  ]);

  return (
    <ReactFlow 
      nodes={nodes} 
      nodeTypes={registerHelper.getNodeTypes()} 
    />
  );
};
```

## 发布到 npm / Publishing to npm

1. 更新 `package.json` 中的包名：
   ```json
   {
     "name": "@kingpa/fast-flow"
   }
   ```

2. 构建项目：
   ```bash
   npm run build
   ```

3. 发布到 npm：
   ```bash
   npm publish --access public
   ```

## 类型定义 / Type Definitions

库完全支持 TypeScript，所有导出的类和组件都有完整的类型定义。

## License

MIT

## 下一步 / Next Steps

1. ✅ 核心功能已实现
2. ⬜ 添加单元测试
3. ⬜ 添加更多自定义节点示例
4. ⬜ 添加在线文档
5. ⬜ 发布到 npm

---

**创建时间**: 2025-11-15  
**版本**: 1.0.0
