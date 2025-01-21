import { EnumNodeStepSimple, EnumSqlEdgeType, EnumSqlNodeType } from '@/dbpages/components/SqlFlow/ModelType';

const nodeData: any[] = [
  {
    id: EnumNodeStepSimple.意图及数据解析,
    position: { x: 0, y: 0 },
    width: 170,
    height: 40,
    shape: EnumSqlNodeType.PIPELINE_SIMPLE_NODE,
    data: {
      label: '意图及数据解析',
      // databaseType: DatabaseTypeCode.SQLITE,
    },
  },
  {
    id: EnumNodeStepSimple.候选SQL生成,
    position: { x: 250, y: 0 },
    width: 170,
    height: 40,
    shape: EnumSqlNodeType.PIPELINE_SIMPLE_NODE,
    data: {
      label: '候选SQL生成',
    },
  },
  {
    id: EnumNodeStepSimple.SQL优化,
    position: { x: 500, y: 0 },
    width: 170,
    height: 40,
    shape: EnumSqlNodeType.PIPELINE_SIMPLE_NODE,
    data: {
      label: 'SQL优化',
    },
  },
  {
    id: EnumNodeStepSimple.最终SQL生成,
    position: { x: 750, y: 0 },
    width: 170,
    height: 40,
    shape: EnumSqlNodeType.PIPELINE_SIMPLE_NODE,
    data: {
      label: '最终SQL生成',
    },
  },
];
const edgeData: any[] = [
  {
    id: 'edge-1',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStepSimple.意图及数据解析,
    target: EnumNodeStepSimple.候选SQL生成,
  },
  {
    id: 'edge-2',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStepSimple.候选SQL生成,
    target: EnumNodeStepSimple.SQL优化,
  },
  {
    id: 'edge-3',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumNodeStepSimple.SQL优化,
    target: EnumNodeStepSimple.最终SQL生成,
  },
];

export default { nodeData, edgeData };
