import { ComponentType, ReactNode } from 'react';
import { NodeProps } from 'reactflow';

export interface NodeConfig {
  type: string;
  component: ComponentType<NodeProps>;
  defaultData?: Record<string, any>;
  icon?: ReactNode;
  description?: string;
}

export interface BaseNodeData {
  label: string;
  collapsed?: boolean;
  icon?: ReactNode;
  [key: string]: any;
}

export interface FlavorData {
  nodes: any[];
  edges: any[];
  metadata?: Record<string, any>;
}
