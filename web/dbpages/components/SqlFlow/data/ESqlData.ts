import { EnumNodeStep, EnumSqlEdgeType, EnumSqlNodeType } from '@/dbpages/components/SqlFlow/ModelType';
import { DatabaseTypeCode } from '../../../constants';

const nodeData: any[] = [
  // {
  //   id: EnumNodeStep.Database1,
  //   position: { x: 420, y: 52 },
  //   width: 70,
  //   height: 86,
  //   shape: EnumSqlNodeType.DATABASE_NODE,
  //   data: {
  //     label: 'Database',
  //     databaseType: DatabaseTypeCode.SQLITE,
  //   },
  // },
  {
    id: EnumNodeStep['Executing error Detection'],
    position: { x: 600, y: 60 },
    width: 200,
    height: 70,
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: '执行错误检测',
      isDatabase: true,
      databaseType: DatabaseTypeCode.SQLITE,
    },
  },
  {
    id: EnumNodeStep['Natural Language Question & Hint'],
    position: { x: -40, y: 100 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: '自然语言问题与提示',
    },
  },
  {
    id: EnumNodeStep['Database Schema & Description'],
    position: { x: -40, y: 200 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: '数据库模式与描述',
    },
  },
  {
    id: EnumNodeStep['Few-shot Examples'],
    position: { x: -40, y: 300 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: 'Few-shot示例',
    },
  },
  {
    id: EnumNodeStep['Candidate SQL Generation'],
    position: { x: 200, y: 200 },
    width: 180,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: '候选 SQL 生成',
      isModel: true,
    },
  },
  {
    id: 'group-node-1',
    position: { x: 410, y: 175 },
    width: 480,
    height: 120,
    shape: EnumSqlNodeType.GROUP_NODE,
    data: { label: '候选谓词生成' },
  },
  {
    id: EnumNodeStep['Predicate Value Extraction'],
    position: { x: 440, y: 200 },
    parentId: 'group-node-1',
    width: 180,
    height: 70,
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: '谓词值提取',
      isDatabase: true,
      databaseType: DatabaseTypeCode.SQLITE,
    },
  },
  // {
  //   id: EnumNodeStep.Database2,
  //   position: { x: 640, y: 192 },
  //   parentId: 'group-node-1',
  //   width: 70,
  //   height: 86,
  //   shape: EnumSqlNodeType.DATABASE_NODE,
  //   data: {
  //     label: 'Database',
  //     databaseType: DatabaseTypeCode.SQLITE,
  //   },
  // },
  {
    id: EnumNodeStep['Possible Predicate Generation'],
    position: { x: 680, y: 200 },
    parentId: 'group-node-1',
    width: 180,
    height: 70,
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: '可能的谓词生成',
    },
  },
  {
    id: EnumNodeStep['Question Enrichment'],
    position: { x: 940, y: 200 },
    width: 170,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: '问题增强',
      isModel: true,
    },
  },
  {
    id: EnumNodeStep['SQL Refinement'],
    position: { x: 1160, y: 200 },
    width: 170,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: 'SQL 优化',
      isModel: true,
    },
  },
  {
    id: EnumNodeStep['Result Show'],
    position: { x: 1400, y: 185 },
    width: 100,
    height: 100,
    shape: EnumSqlNodeType.RESULT_NODE,
    data: { label: '最终SQL' },
  },
];
const edgeData: any[] = [
  // {
  //   id: 'edge-1',
  //   shape: EnumSqlEdgeType.COMMON_EDGE,
  //   source: EnumNodeStep.Database1,
  //   target: EnumNodeStep['Executing error Detection'],
  // },
  {
    id: 'edge-2',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStep['Database Schema & Description'],
    target: EnumNodeStep['Candidate SQL Generation'],
    router: {
      args: {
        startDirections: ['right'],
        endDirections: ['left'],
      },
    },
  },
  {
    id: 'edge-3',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStep['Natural Language Question & Hint'],
    target: EnumNodeStep['Candidate SQL Generation'],
    router: {
      args: {
        startDirections: ['right'],
        endDirections: ['left'],
      },
    },
  },
  {
    id: 'edge-4',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStep['Few-shot Examples'],
    target: EnumNodeStep['Candidate SQL Generation'],
    router: {
      args: {
        startDirections: ['right'],
        endDirections: ['left'],
      },
    },
  },
  {
    id: 'edge-5',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStep['Candidate SQL Generation'],
    // target: EnumNodeStep.Database1,
    target: EnumNodeStep['Executing error Detection'],
    router: {
      args: {
        startDirections: ['top'],
        endDirections: ['left'],
      },
    },
  },
  {
    id: 'edge-6',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStep['Candidate SQL Generation'],
    target: EnumNodeStep['Predicate Value Extraction'],
  },
  // {
  //   id: 'edge-7',
  //   shape: EnumSqlEdgeType.COMMON_EDGE,
  //   source: EnumNodeStep['Predicate Value Extraction'],
  //   target: EnumNodeStep.Database2,
  // },
  {
    id: 'edge-8',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    // source: EnumNodeStep.Database2,
    source: EnumNodeStep['Predicate Value Extraction'],
    target: EnumNodeStep['Possible Predicate Generation'],
  },
  {
    id: 'edge-9',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStep['Possible Predicate Generation'],
    target: EnumNodeStep['Question Enrichment'],
  },
  {
    id: 'edge-10',
    shape: EnumSqlEdgeType.VIRTUAL_EDGE,
    source: EnumNodeStep['Possible Predicate Generation'],
    target: EnumNodeStep['SQL Refinement'],
    router: {
      args: {
        padding: {
          bottom: 30,
        },
        startDirections: ['right'],
        endDirections: ['bottom'],
      },
    },
  },
  {
    id: 'edge-11',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStep['Question Enrichment'],
    target: EnumNodeStep['SQL Refinement'],
  },
  {
    id: 'edge-12',
    shape: EnumSqlEdgeType.VIRTUAL_EDGE,
    source: EnumNodeStep['Executing error Detection'],
    target: EnumNodeStep['SQL Refinement'],
    router: {
      args: {
        startDirections: ['right'],
        endDirections: ['top'],
      },
    },
  },
  {
    id: 'edge-13',
    shape: EnumSqlEdgeType.VIRTUAL_EDGE,
    source: EnumNodeStep['Candidate SQL Generation'],
    target: EnumNodeStep['SQL Refinement'],
    router: {
      args: {
        padding: {
          bottom: 60,
        },
        startDirections: ['bottom'],
        endDirections: ['bottom'],
      },
    },
  },
  {
    id: 'edge-14',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStep['SQL Refinement'],
    target: EnumNodeStep['Result Show'],
  },
];

export default { nodeData, edgeData };
