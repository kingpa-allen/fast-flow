import { ComponentType } from 'react';
import { NodeProps } from 'reactflow';

export interface NodeConfig {
  type: string;
  component: ComponentType<NodeProps>;
  defaultData?: Record<string, any>;
}

export interface BaseNodeData {
  label: string;
  collapsed?: boolean;
  [key: string]: any;
}

export interface FlavorData {
  nodes: any[];
  edges: any[];
  metadata?: Record<string, any>;
}
