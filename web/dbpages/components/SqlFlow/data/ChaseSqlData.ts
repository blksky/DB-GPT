import {
  EnumChaseNodeStep,
  EnumSqlEdgeType,
  EnumSqlFlowType,
  EnumSqlNodeType,
} from '@/dbpages/components/SqlFlow/ModelType';

const nodeData: any[] = [
  {
    id: EnumChaseNodeStep.S1_retrieve,
    position: { x: -40, y: 100 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: '自然语言问题与提示',
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
  },
  {
    id: EnumChaseNodeStep.S3_database_repr,
    position: { x: -40, y: 200 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: '数据库模式与描述',
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
  },
  {
    id: EnumChaseNodeStep.S4_example_selection,
    position: { x: -40, y: 300 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.KNOWLEDGE_NODE,
    data: {
      label: 'Few-shots 示例',
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
  },
  {
    id: EnumChaseNodeStep.S5_candidate_generation,
    position: { x: 250, y: 75 },
    width: 200,
    height: 320,
    shape: EnumSqlNodeType.GROUP_NODE,
    data: {
      label: '多路候选SQL生成',
      flowType: EnumSqlFlowType['CHASE-SQL'],
      className: 'label-inner-bottom',
    },
  },
  {
    id: EnumChaseNodeStep.S5_candidate_generation_DC,
    parentId: EnumChaseNodeStep.S5_candidate_generation,
    position: { x: 275, y: 100 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: '分治拆解 COT',
      isModel: true,
      className: 'label-left',
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
  },
  {
    id: EnumChaseNodeStep.S5_candidate_generation_QP,
    parentId: EnumChaseNodeStep.S5_candidate_generation,
    position: { x: 275, y: 200 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: '查询计划 COT',
      isModel: true,
      className: 'label-left',
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
  },
  {
    id: EnumChaseNodeStep.S5_candidate_generation_OS,
    parentId: EnumChaseNodeStep.S5_candidate_generation,
    position: { x: 275, y: 300 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: '在线示例生成',
      isModel: true,
      className: 'label-left',
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
  },
  {
    id: EnumChaseNodeStep.S6_query_fixer_DC,
    position: { x: 520, y: 100 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: 'SQL修复和优化',
      isDatabase: true,
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
    // ports: {
    //   groups: {
    //     group1: {
    //       attrs: {
    //         circle: {
    //           r: 0,
    //           magnet: true,
    //           strokeWidth: 0,
    //           fill: 'transparent',
    //           stroke: 'transparent',
    //         },
    //       },
    //       position: { name: 'absolute' },
    //     },
    //   },
    //   items: [
    //     {
    //       id: 'topRight',
    //       group: 'group1',
    //       args: {
    //         x: '90%',
    //         y: '0%',
    //       },
    //     },
    //     {
    //       id: 'rightTop',
    //       group: 'group1',
    //       args: {
    //         x: '100%',
    //         y: '20%',
    //       },
    //     },
    //   ],
    // },
  },
  {
    id: EnumChaseNodeStep.S6_query_fixer_QP,
    position: { x: 520, y: 200 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: 'SQL修复和优化',
      isDatabase: true,
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
  },
  {
    id: EnumChaseNodeStep.S6_query_fixer_OS,
    position: { x: 520, y: 300 },
    width: 150,
    height: 70,
    shape: EnumSqlNodeType.OPERATION_NODE,
    data: {
      label: 'SQL修复和优化',
      isDatabase: true,
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
  },
  {
    id: EnumChaseNodeStep.S8_candidate_selection,
    position: { x: 800, y: 200 },
    width: 120,
    height: 70,
    shape: EnumSqlNodeType.PIPELINE_NODE,
    data: {
      label: 'SQL筛选',
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
  },
  {
    id: EnumChaseNodeStep.S9_final_result,
    position: { x: 1000, y: 185 },
    width: 120,
    height: 100,
    shape: EnumSqlNodeType.RESULT_NODE,
    data: {
      label: '最终SQL',
      flowType: EnumSqlFlowType['CHASE-SQL'],
    },
  },
];
const edgeData: any[] = [
  {
    id: 'edge-1',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChaseNodeStep.S1_retrieve,
    target: EnumChaseNodeStep.S5_candidate_generation,
    router: {
      args: {
        padding: {
          left: 75,
        },
      },
    },
  },
  {
    id: 'edge-2',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChaseNodeStep.S3_database_repr,
    target: EnumChaseNodeStep.S5_candidate_generation,
    router: {
      args: {
        padding: {
          left: 75,
        },
      },
    },
  },
  {
    id: 'edge-3',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChaseNodeStep.S4_example_selection,
    target: EnumChaseNodeStep.S5_candidate_generation,
    router: {
      args: {
        padding: {
          left: 75,
        },
      },
    },
  },
  {
    id: 'edge-4',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChaseNodeStep.S5_candidate_generation_DC,
    target: EnumChaseNodeStep.S6_query_fixer_DC,
  },
  {
    id: 'edge-5',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChaseNodeStep.S5_candidate_generation_QP,
    target: EnumChaseNodeStep.S6_query_fixer_QP,
  },
  {
    id: 'edge-6',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChaseNodeStep.S5_candidate_generation_OS,
    target: EnumChaseNodeStep.S6_query_fixer_OS,
  },
  {
    id: 'edge-7',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChaseNodeStep.S6_query_fixer_DC,
    target: EnumChaseNodeStep.S8_candidate_selection,
  },
  {
    id: 'edge-8',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChaseNodeStep.S6_query_fixer_QP,
    target: EnumChaseNodeStep.S8_candidate_selection,
  },
  {
    id: 'edge-9',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChaseNodeStep.S6_query_fixer_OS,
    target: EnumChaseNodeStep.S8_candidate_selection,
  },
  // {
  //   id: 'edge-10',
  //   shape: EnumSqlEdgeType.CIRCLE_EDGE,
  //   source: { cell: EnumChaseNodeStep.S6_query_fixer_DC, port: 'rightTop' },
  //   target: { cell: EnumChaseNodeStep.S6_query_fixer_DC, port: 'topRight' },
  //   router: {
  //     args: {
  //       padding: {
  //         right: 7,
  //         top: 13,
  //       },
  //       startDirections: ['right'],
  //       endDirections: ['top'],
  //     },
  //   },
  // },
  // {
  //   id: 'edge-11',
  //   shape: EnumSqlEdgeType.CIRCLE_EDGE,
  //   source: EnumChaseNodeStep.S6_query_fixer_QP,
  //   target: EnumChaseNodeStep.S6_query_fixer_QP,
  //   router: {
  //     args: {
  //       padding: {
  //         right: 30,
  //         top: 30,
  //       },
  //       startDirections: ['right'],
  //       endDirections: ['top'],
  //     },
  //   },
  // },
  // {
  //   id: 'edge-12',
  //   shape: EnumSqlEdgeType.CIRCLE_EDGE,
  //   source: EnumChaseNodeStep.S6_query_fixer_OS,
  //   target: EnumChaseNodeStep.S6_query_fixer_OS,
  //   router: {
  //     args: {
  //       padding: {
  //         right: 30,
  //         top: 30,
  //       },
  //       startDirections: ['right'],
  //       endDirections: ['top'],
  //     },
  //   },
  // },
  {
    id: 'edge-13',
    shape: EnumSqlEdgeType.COMMON_EDGE,
    source: EnumChaseNodeStep.S8_candidate_selection,
    target: EnumChaseNodeStep.S9_final_result,
  },
];

export default { nodeData, edgeData };
