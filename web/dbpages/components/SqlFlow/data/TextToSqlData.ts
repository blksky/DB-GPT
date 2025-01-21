import { EnumSqlEdgeType, EnumSqlNodeType } from '@/dbpages/components/SqlFlow/ModelType';
import { DatabaseTypeCode } from '../../../constants';

const nodeData: any[] = [
  {
    id: 'db-node-1',
    position: { x: 0, y: -20 },
    width: 80,
    height: 70,
    shape: EnumSqlNodeType.DATABASE_NODE,
    data: {
      label: 'Database',
      databaseType: DatabaseTypeCode.SQLITE,
    },
  },
  {
    id: 'opt-node-1',
    position: { x: 300, y: -20 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: 'Entity Retrieval',
    },
  },
  {
    id: 'kg-node-1',
    position: { x: -40, y: 100 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: 'Database Schema & Description',
    },
  },
  {
    id: 'kg-node-2',
    position: { x: -40, y: 200 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: 'Natural Language Question & Hint',
    },
  },
  {
    id: 'kg-node-3',
    position: { x: -40, y: 300 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: 'Few-shot Examples',
    },
  },
  {
    id: 'pip-node-1',
    position: { x: 200, y: 200 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: 'Schema Filtering',
    },
  },
  {
    id: 'pip-node-2',
    position: { x: 400, y: 200 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: 'Decomposition',
    },
  },
  {
    id: 'group-node-1',
    position: { x: 610, y: 95 },
    width: 420,
    height: 280,
    shape: EnumSqlNodeType.GROUP_NODE,
    data: { label: 'Query Generation' },
  },
  {
    id: 'pip-node-3',
    parentId: 'group-node-1',
    position: { x: 640, y: 130 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: 'Multiple SQL Generation',
    },
  },
  {
    id: 'pip-node-4',
    parentId: 'group-node-1',
    position: { x: 850, y: 130 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: 'Candidate SQL Filtering（Selection）',
    },
  },
  {
    id: 'pip-node-5',
    parentId: 'group-node-1',
    position: { x: 640, y: 270 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: 'Single SQL Generation',
    },
  },
  {
    id: 'pip-node-6',
    parentId: 'group-node-1',
    position: { x: 850, y: 270 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: 'Correction',
    },
  },
  {
    id: 'result-node-1',
    position: { x: 1100, y: 185 },
    width: 100,
    height: 100,
    shape: EnumSqlNodeType.RESULT_NODE,
    data: {},
  },
];

const edgeData: any[] = [
  {
    id: 'edge-1',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: 'db-node-1',
    target: 'opt-node-1',
  },
  {
    id: 'edge-2',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: 'kg-node-1',
    target: 'pip-node-1',
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
    source: 'kg-node-2',
    target: 'pip-node-1',
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
    source: 'kg-node-3',
    target: 'pip-node-1',
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
    source: 'pip-node-1',
    target: 'pip-node-2',
  },
  {
    id: 'edge-6',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: 'pip-node-2',
    target: 'group-node-1',
  },
  {
    id: 'edge-7',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: 'pip-node-3',
    target: 'pip-node-4',
  },
  {
    id: 'edge-8',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: 'pip-node-5',
    target: 'pip-node-6',
  },
  {
    id: 'edge-9',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: 'group-node-1',
    target: 'result-node-1',
  },
  {
    id: 'edge-10',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: 'opt-node-1',
    target: 'group-node-1',
    router: {
      args: {
        startDirections: ['right'],
        endDirections: ['left'],
      },
    },
  },
];

export default { nodeData, edgeData };
