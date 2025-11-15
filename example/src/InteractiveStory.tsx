import React from 'react';
import { Form, Input, Select, Button, Tag } from 'antd';
import {
  PlayCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HeartOutlined,
  StarOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { Handle, Position } from 'reactflow';
import {
  RegisterHelper,
  BaseNode,
  FlowCanvas,
  useFlow,
} from '../../dist/index.esm.js';

// 1. 开始节点 - 故事开篇
class StartNode extends BaseNode {
  protected hasSettingsForm(): boolean {
    return true;
  }

  protected renderSettingsForm(): React.ReactNode {
    const { settingsData } = this.state;

    return (
      <Form layout="vertical">
        <Form.Item label="故事标题">
          <Input
            value={settingsData.label || ''}
            onChange={(e) => this.updateSettingsData('label', e.target.value)}
            placeholder="输入故事标题..."
          />
        </Form.Item>
        <Form.Item label="开篇内容">
          <Input.TextArea
            rows={4}
            value={settingsData.content || ''}
            onChange={(e) => this.updateSettingsData('content', e.target.value)}
            placeholder="输入故事开篇内容..."
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={this.handleCloseSettings}>Cancel</Button>
            <Button type="primary" onClick={this.handleSaveSettings}>Save</Button>
          </div>
        </Form.Item>
      </Form>
    );
  }

  protected renderContent(): React.ReactNode {
    const { data } = this.props;
    return (
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: '13px', color: '#52c41a', fontWeight: 600, marginBottom: '8px' }}>
          📖 故事开始
        </div>
        <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
          {data.content || '点击开始你的故事...'}
        </div>
      </div>
    );
  }

  protected getClassName(): string {
    return 'start-node';
  }
}

// 2. 情节节点 - 故事情节描述
class PlotNode extends BaseNode {
  protected hasSettingsForm(): boolean {
    return true;
  }

  protected renderSettingsForm(): React.ReactNode {
    const { settingsData } = this.state;

    return (
      <Form layout="vertical" size='small'>
        <Form.Item label="情节内容">
          <Input.TextArea
            rows={4}
            value={settingsData.content || ''}
            onChange={(e) => this.updateSettingsData('content', e.target.value)}
            placeholder="输入情节描述..."
          />
        </Form.Item>
        <Form.Item label="好感度变化">
          <Select
            value={settingsData.affection || 'neutral'}
            onChange={(value) => this.updateSettingsData('affection', value)}
          >
            <Select.Option value="increase">+10 好感度 ❤️</Select.Option>
            <Select.Option value="neutral">无变化</Select.Option>
            <Select.Option value="decrease">-10 好感度 💔</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={this.handleCloseSettings}>Cancel</Button>
            <Button type="primary" onClick={this.handleSaveSettings}>Save</Button>
          </div>
        </Form.Item>
      </Form>
    );
  }

  protected renderContent(): React.ReactNode {
    const { data } = this.props;
    const affectionColor = {
      increase: '#ff4d4f',
      neutral: '#8c8c8c',
      decrease: '#1890ff',
    };

    return (
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, marginBottom: '8px' }}>
          {data.content || '情节内容...'}
        </div>
        {data.affection && data.affection !== 'neutral' && (
          <Tag color={affectionColor[data.affection]} style={{ fontSize: '11px' }}>
            {data.affection === 'increase' ? '❤️ +10' : '💔 -10'}
          </Tag>
        )}
      </div>
    );
  }

  protected getClassName(): string {
    return 'plot-node';
  }
}

// 3. 选择节点 - 玩家做选择
class ChoiceNode extends BaseNode {
  protected hasSettingsForm(): boolean {
    return true;
  }

  protected renderSettingsForm(): React.ReactNode {
    const { settingsData } = this.state;
    const options = settingsData.options || ['选项A', '选项B'];

    const addOption = () => {
      const newOptions = [...options, `选项${String.fromCharCode(65 + options.length)}`];
      this.updateSettingsData('options', newOptions);
    };

    const removeOption = (index: number) => {
      if (options.length <= 2) {
        alert('至少需要保留2个选项');
        return;
      }
      const newOptions = options.filter((_, i) => i !== index);
      this.updateSettingsData('options', newOptions);
    };

    const updateOption = (index: number, value: string) => {
      const newOptions = [...options];
      newOptions[index] = value;
      this.updateSettingsData('options', newOptions);
    };

    return (
      <Form layout="vertical">
        <Form.Item label="选择问题">
          <Input
            value={settingsData.question || ''}
            onChange={(e) => this.updateSettingsData('question', e.target.value)}
            placeholder="玩家需要做出的选择..."
          />
        </Form.Item>
        
        <Form.Item label="选项列表">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {options.map((option: string, index: number) => (
              <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '24px', fontWeight: 600, color: '#666' }}>
                  {String.fromCharCode(65 + index)}.
                </div>
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`选项${String.fromCharCode(65 + index)}`}
                  style={{ flex: 1 }}
                />
                {options.length > 2 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    onClick={() => removeOption(index)}
                    icon={<CloseCircleOutlined />}
                  />
                )}
              </div>
            ))}
          </div>
          <Button
            type="dashed"
            block
            onClick={addOption}
            style={{ marginTop: '8px' }}
            icon={<span>➕</span>}
          >
            添加选项
          </Button>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={this.handleCloseSettings}>Cancel</Button>
            <Button type="primary" onClick={this.handleSaveSettings}>Save</Button>
          </div>
        </Form.Item>
      </Form>
    );
  }

  protected renderContent(): React.ReactNode {
    const { data } = this.props;
    const options = data.options || ['选项A', '选项B'];
    
    return (
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1890ff', marginBottom: '8px' }}>
          ❓ {data.question || '你会如何选择？'}
        </div>
        {options.map((option: string, index: number) => (
          <div key={index} style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
            {String.fromCharCode(65 + index)}. {option}
          </div>
        ))}
      </div>
    );
  }

  // 重写 render 方法，动态生成连接点
  render() {
    const { data, selected } = this.props;
    const { collapsed, showSettings } = this.state;
    const options = data.options || ['选项A', '选项B'];

    return (
      <div className={`base-node choice-node ${selected ? 'selected' : ''} ${collapsed ? 'collapsed' : ''}`}>
        {/* 头部 */}
        <div className="base-node-header">
          <div className="base-node-title">{data.label || 'Choice Node'}</div>
          <div className="base-node-header-actions">
            {this.renderSettingsButton()}
            <button
              className="base-node-collapse-btn"
              onClick={this.handleToggleCollapse}
              aria-label={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? '▼' : '▲'}
            </button>
          </div>
        </div>

        {/* 内容 */}
        {!collapsed && <div className="base-node-content">{this.renderContent()}</div>}

        {/* 输入连接点 */}
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#555' }}
        />

        {/* 动态输出连接点 - 每个选项一个 */}
        {options.map((option: string, index: number) => {
          const totalOptions = options.length;
          // 计算每个连接点的垂直位置
          const topPosition = ((index + 1) / (totalOptions + 1)) * 100;
          
          return (
            <Handle
              key={`option-${index}`}
              type="source"
              position={Position.Right}
              id={`option-${index}`}
              style={{
                top: `${topPosition}%`,
                background: '#1890ff',
              }}
            />
          );
        })}

        {/* 设置面板 */}
        {showSettings && this.renderSettingsPanel()}
      </div>
    );
  }

  protected getClassName(): string {
    return 'choice-node';
  }
}

// 4. 结局节点 - 不同的故事结局
class EndingNode extends BaseNode {
  protected hasSettingsForm(): boolean {
    return true;
  }

  protected renderSettingsForm(): React.ReactNode {
    const { settingsData } = this.state;

    return (
      <Form layout="vertical">
        <Form.Item label="结局类型">
          <Select
            value={settingsData.endingType || 'good'}
            onChange={(value) => this.updateSettingsData('endingType', value)}
          >
            <Select.Option value="perfect">完美结局 👑</Select.Option>
            <Select.Option value="good">好结局 ⭐</Select.Option>
            <Select.Option value="normal">普通结局 😊</Select.Option>
            <Select.Option value="bad">坏结局 😢</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="结局描述">
          <Input.TextArea
            rows={4}
            value={settingsData.content || ''}
            onChange={(e) => this.updateSettingsData('content', e.target.value)}
            placeholder="描述这个结局..."
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={this.handleCloseSettings}>Cancel</Button>
            <Button type="primary" onClick={this.handleSaveSettings}>Save</Button>
          </div>
        </Form.Item>
      </Form>
    );
  }

  protected renderContent(): React.ReactNode {
    const { data } = this.props;
    const endingEmoji = {
      perfect: '👑',
      good: '⭐',
      normal: '😊',
      bad: '😢',
    };
    const endingColor = {
      perfect: '#ffd700',
      good: '#52c41a',
      normal: '#1890ff',
      bad: '#8c8c8c',
    };

    return (
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: endingColor[data.endingType || 'good'], marginBottom: '8px' }}>
          {endingEmoji[data.endingType || 'good']} {data.label}
        </div>
        <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
          {data.content || '结局描述...'}
        </div>
      </div>
    );
  }

  protected getClassName(): string {
    return 'ending-node';
  }
}

// 注册所有节点类型
RegisterHelper.register(
  'start',
  StartNode,
  { label: '开始', content: '你是一个刚毕业的穷小子，每天为了生计奔波...' },
  <PlayCircleOutlined />,
  '故事的起点'
);

RegisterHelper.register(
  'plot',
  PlotNode,
  { label: '情节', content: '某个命中注定的下午...', affection: 'neutral' },
  <StarOutlined />,
  '故事情节描述'
);

RegisterHelper.register(
  'choice',
  ChoiceNode,
  { label: '选择', question: '你会如何回应？', options: ['选项A', '选项B'] },
  <QuestionCircleOutlined />,
  '玩家做出选择'
);

RegisterHelper.register(
  'ending',
  EndingNode,
  { label: '结局', endingType: 'good', content: '你们幸福地生活在一起...' },
  <CrownOutlined />,
  '故事结局'
);

// 互动小说故事数据
const storyNodes = [
  {
    id: '1',
    type: 'start',
    position: { x: 50, y: 250 },
    data: {
      label: '故事开始',
      content: '你是个刚毕业的穷小子，每天在咖啡厅打工维持生计。今天是个平凡的下午...',
    },
  },
  {
    id: '2',
    type: 'plot',
    position: { x: 350, y: 250 },
    data: {
      label: '初次相遇',
      content: '一位穿着名贵的美女走进咖啡厅，她优雅地坐下，点了一杯拿铁。你不小心被她的美貌吸引，手一抖，咖啡洒了她一身...',
      affection: 'neutral',
    },
  },
  {
    id: '3',
    type: 'choice',
    position: { x: 650, y: 250 },
    data: {
      label: '第一次选择',
      question: '面对这个尴尬的局面，你会？',
      options: ['慣张道歉，手忙脚乱地递纸巾', '冷静道歉，专业地处理污渍'],
    },
  },
  {
    id: '4',
    type: 'plot',
    position: { x: 950, y: 150 },
    data: {
      label: '她的微笑',
      content: '看到你慌张的样子，她反而笑了："没关系，挺可爱的。" 她递给你一张名片："我是林雪儿，明天来我公司面试吧。"',
      affection: 'increase',
    },
  },
  {
    id: '5',
    type: 'plot',
    position: { x: 950, y: 350 },
    data: {
      label: '她的赞赏',
      content: '她欣赏地看着你："处理得很专业。" 她递给你一张名片："我是林雪儿，明天来我公司面试吧，我需要像你这样冷静的人。"',
      affection: 'increase',
    },
  },
  {
    id: '6',
    type: 'choice',
    position: { x: 1250, y: 250 },
    data: {
      label: '面试决定',
      question: '第二天，你会去面试吗？',
      options: ['去面试，这是个机会', '不去，感觉像施舍'],
    },
  },
  {
    id: '7',
    type: 'plot',
    position: { x: 1550, y: 150 },
    data: {
      label: '成为同事',
      content: '面试很顺利，你成为了她公司的员工。在接下来的日子里，她总是找各种理由接近你，请你吃饭、看电影...',
      affection: 'increase',
    },
  },
  {
    id: '8',
    type: 'plot',
    position: { x: 1550, y: 350 },
    data: {
      label: '失去机会',
      content: '你没有去面试。几天后，她又来咖啡厅找你："为什么不来？我是真心想帮你的..." 她看起来有些失落。',
      affection: 'decrease',
    },
  },
  {
    id: '9',
    type: 'choice',
    position: { x: 1850, y: 150 },
    data: {
      label: '表白时刻',
      question: '某天下班后，她突然说：“我喜欢你，做我男朋友好吗？”',
      options: ['接受她的告白', '拒绝，觉得配不上她'],
    },
  },
  {
    id: '10',
    type: 'choice',
    position: { x: 1850, y: 350 },
    data: {
      label: '挽回机会',
      question: '她真诚地看着你：“再给我一次机会，让我证明我是真心的，好吗？”',
      options: ['给她一次机会', '坚持拒绝'],
    },
  },
  {
    id: '11',
    type: 'ending',
    position: { x: 2150, y: 50 },
    data: {
      label: '完美结局',
      endingType: 'perfect',
      content: '你们幸福地在一起了。她帮助你实现梦想，你用真心对待她。一年后，你们在海边举办了婚礼，从此过上了幸福的生活。真爱不分贫富！',
    },
  },
  {
    id: '12',
    type: 'ending',
    position: { x: 2150, y: 200 },
    data: {
      label: '遗憾结局',
      endingType: 'bad',
      content: '你拒绝了她。她失望地离开了。多年后你才明白，那是真心，但已经错过了。她已经结婚了，而你还在原地...',
    },
  },
  {
    id: '13',
    type: 'ending',
    position: { x: 2150, y: 350 },
    data: {
      label: '重逢结局',
      endingType: 'good',
      content: '你给了她机会。经过一段时间的相处，你发现她是真心的。虽然起步艰难，但你们携手度过了难关，最终走到了一起。',
    },
  },
  {
    id: '14',
    type: 'ending',
    position: { x: 2150, y: 500 },
    data: {
      label: '孤独结局',
      endingType: 'bad',
      content: '你坚持拒绝了她。她最后一次看了你，转身离开。你回到了原来的生活，但心里总有一个遗憾...',
    },
  },
];

const storyEdges = [
  { id: 'e1-2', source: '1', target: '2', label: '开始' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4', sourceHandle: 'option-0', label: '选A' },
  { id: 'e3-5', source: '3', target: '5', sourceHandle: 'option-1', label: '选B' },
  { id: 'e4-6', source: '4', target: '6' },
  { id: 'e5-6', source: '5', target: '6' },
  { id: 'e6-7', source: '6', target: '7', sourceHandle: 'option-0', label: '选A' },
  { id: 'e6-8', source: '6', target: '8', sourceHandle: 'option-1', label: '选B' },
  { id: 'e7-9', source: '7', target: '9' },
  { id: 'e8-10', source: '8', target: '10' },
  { id: 'e9-11', source: '9', target: '11', sourceHandle: 'option-0', label: '选A' },
  { id: 'e9-12', source: '9', target: '12', sourceHandle: 'option-1', label: '选B' },
  { id: 'e10-13', source: '10', target: '13', sourceHandle: 'option-0', label: '选A' },
  { id: 'e10-14', source: '10', target: '14', sourceHandle: 'option-1', label: '选B' },
];

function InteractiveStory() {
  const { nodes, edges, addEdge, setNodes, setEdges } = useFlow({
    initialNodes: storyNodes,
    initialEdges: storyEdges,
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
        mode="edit"
        nodeLibraryTitle="💕 互动小说节点"
        nodeLibrarySubtitle="富婆倒追穷小子"
        showControls={true}
        showMiniMap={true}
        showBackground={true}
      />
      
      {/* 添加自定义样式 */}
      <style>{`
        .start-node {
          border: 2px solid #52c41a !important;
          background: linear-gradient(135deg, #f0fff4 0%, #d9f7be 100%) !important;
        }
        .plot-node {
          border: 2px solid #1890ff !important;
          background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%) !important;
        }
        .choice-node {
          border: 2px solid #faad14 !important;
          background: linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%) !important;
        }
        .ending-node {
          border: 2px solid #f5222d !important;
          background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%) !important;
        }
      `}</style>
    </div>
  );
}

export default InteractiveStory;
