import {
  EnumChessNodeStep,
  EnumSqlEdgeType,
  EnumSqlFlowType,
  EnumSqlNodeType,
} from '@/dbpages/components/SqlFlow/ModelType';
import { DatabaseTypeCode } from '../../../constants';

const nodeData: any[] = [
  {
    id: EnumChessNodeStep.Database,
    position: { x: 570, y: -150 },
    width: 80,
    height: 86,
    shape: EnumSqlNodeType.DATABASE_NODE,
    data: {
      label: 'Database',
      flowType: EnumSqlFlowType['CHESS-SQL'],
      databaseType: DatabaseTypeCode.SQLITE,
    },
  },
  {
    id: EnumChessNodeStep['Question & Hint'],
    position: { x: 0, y: 0 },
    width: 120,
    height: 65,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: 'Question & Hint',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: 'group-node-1',
    position: { x: 180, y: -55 },
    width: 510,
    height: 175,
    shape: EnumSqlNodeType.GROUP_NODE,
    data: { label: 'Entity and Context Retrieval', flowType: EnumSqlFlowType['CHESS-SQL'] },
  },
  {
    id: EnumChessNodeStep['Keyword Extraction'],
    position: { x: 200, y: 0 },
    width: 120,
    height: 65,
    parentId: 'group-node-1',
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: 'Keyword Extraction',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: EnumChessNodeStep.Keywords,
    position: { x: 370, y: 0 },
    width: 100,
    height: 65,
    parentId: 'group-node-1',
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: 'Keywords',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: EnumChessNodeStep['Entity Retrieval'],
    position: { x: 550, y: -40 },
    width: 120,
    height: 65,
    parentId: 'group-node-1',
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: 'Entity Retrieval',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: EnumChessNodeStep['Context Retrieval'],
    position: { x: 550, y: 40 },
    width: 120,
    height: 65,
    parentId: 'group-node-1',
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: 'Context Retrieval',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: EnumChessNodeStep['Similar Entities'],
    position: { x: 750, y: -40 },
    width: 120,
    height: 65,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: 'Similar Entities',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: EnumChessNodeStep['Relevant Descriptions'],
    position: { x: 750, y: 40 },
    width: 120,
    height: 65,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: 'Relevant Descriptions',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: 'group-node-2',
    position: { x: -20, y: 180 },
    width: 460,
    height: 100,
    shape: EnumSqlNodeType.GROUP_NODE,
    data: { label: 'Schema Selection', flowType: EnumSqlFlowType['CHESS-SQL'] },
  },
  {
    id: EnumChessNodeStep['Column Filtering'],
    position: { x: 0, y: 200 },
    parentId: 'group-node-2',
    width: 100,
    height: 65,
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: 'Column Filtering',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: EnumChessNodeStep['Table Selection'],
    position: { x: 160, y: 200 },
    parentId: 'group-node-2',
    width: 100,
    height: 65,
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: 'Table Selection',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: EnumChessNodeStep['Column Selection'],
    position: { x: 320, y: 200 },
    parentId: 'group-node-2',
    width: 100,
    height: 65,
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: 'Column Selection',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: EnumChessNodeStep['Selected Schema'],
    position: { x: 480, y: 200 },
    width: 150,
    height: 65,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: 'Selected Schema',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: 'group-node-3',
    position: { x: 670, y: 180 },
    width: 290,
    height: 100,
    shape: EnumSqlNodeType.GROUP_NODE,
    data: { label: 'Query Generation', flowType: EnumSqlFlowType['CHESS-SQL'] },
  },
  {
    id: EnumChessNodeStep['Candidate Generation'],
    position: { x: 690, y: 200 },
    width: 100,
    height: 65,
    parentId: 'group-node-3',
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: 'Candidate Generation',
      flowType: EnumSqlFlowType['CHESS-SQL'],
    },
  },
  {
    id: EnumChessNodeStep.Revision,
    position: { x: 840, y: 200 },
    width: 100,
    height: 65,
    parentId: 'group-node-3',
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: { label: 'Revision', flowType: EnumSqlFlowType['CHESS-SQL'] },
  },
  {
    id: EnumChessNodeStep['Final SQL'],
    position: { x: 1000, y: 182 },
    width: 100,
    height: 101,
    shape: EnumSqlNodeType.RESULT_NODE,
    data: { label: 'Final SQL', flowType: EnumSqlFlowType['CHESS-SQL'] },
  },
];
const edgeData: any[] = [
  {
    id: 'edge-1',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep['Question & Hint'],
    target: EnumChessNodeStep['Keyword Extraction'],
  },
  {
    id: 'edge-2',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep['Keyword Extraction'],
    target: EnumChessNodeStep.Keywords,
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
    source: EnumChessNodeStep.Keywords,
    target: EnumChessNodeStep['Entity Retrieval'],
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
    source: EnumChessNodeStep.Keywords,
    target: EnumChessNodeStep['Context Retrieval'],
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
    source: EnumChessNodeStep['Entity Retrieval'],
    target: EnumChessNodeStep['Similar Entities'],
  },
  {
    id: 'edge-6',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep['Context Retrieval'],
    target: EnumChessNodeStep['Relevant Descriptions'],
  },
  {
    id: 'edge-7',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep['Similar Entities'],
    target: EnumChessNodeStep['Column Filtering'],
    router: {
      args: {
        padding: {
          right: 30,
          left: 30,
          top: 30,
        },
        startDirections: ['right'],
        endDirections: ['left'],
      },
    },
  },
  {
    id: 'edge-8',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep['Relevant Descriptions'],
    target: EnumChessNodeStep['Column Filtering'],
    router: {
      args: {
        padding: {
          right: 30,
          left: 30,
          top: 30,
        },
        startDirections: ['right'],
        endDirections: ['left'],
      },
    },
  },
  {
    id: 'edge-9',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep['Column Filtering'],
    target: EnumChessNodeStep['Table Selection'],
  },
  {
    id: 'edge-10',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep['Table Selection'],
    target: EnumChessNodeStep['Column Selection'],
  },
  {
    id: 'edge-11',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep['Column Selection'],
    target: EnumChessNodeStep['Selected Schema'],
  },
  {
    id: 'edge-12',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep['Selected Schema'],
    target: EnumChessNodeStep['Candidate Generation'],
  },
  {
    id: 'edge-13',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep['Candidate Generation'],
    target: EnumChessNodeStep.Revision,
  },
  {
    id: 'edge-14',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep.Revision,
    target: EnumChessNodeStep['Final SQL'],
  },
  {
    id: 'edge-15',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChessNodeStep.Database,
    target: EnumChessNodeStep['Entity Retrieval'],
  },
];

export default { nodeData, edgeData };
