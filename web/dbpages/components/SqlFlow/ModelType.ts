import { DatabaseTypeCode } from '../../constants';

/** 节点类型 */
export enum EnumSqlNodeType {
  DATABASE_NODE = 'DATABASE_NODE',
  KNOWLEDGE_NODE = 'KNOWLEDGE_NODE',
  PIPELINE_NODE = 'PIPELINE_NODE',
  OPERATION_NODE = 'OPERATION_NODE',
  RESULT_NODE = 'RESULT_NODE',
  GROUP_NODE = 'GROUP_NODE',
  DECISION_NODE = 'DECISION_NODE',

  DATABASE_SIMPLE_NODE = 'DATABASE_SIMPLE_NODE',
  PIPELINE_SIMPLE_NODE = 'PIPELINE_SIMPLE_NODE',
}

/** 边类型 */
export enum EnumSqlEdgeType {
  COMMON_EDGE = 'COMMON_EDGE',
  VIRTUAL_EDGE = 'VIRTUAL_EDGE',
  CIRCLE_EDGE = 'CIRCLE_EDGE',
}

/** 算法流程类型 */
export enum EnumSqlFlowType {
  'Text-to-SQL' = 'Text-to-SQL',
  'E-SQL' = 'E-SQL',
  'CHASE-SQL' = 'CHASE-SQL',
  'CHESS-SQL' = 'CHESS-SQL',
}

export const SqlFlowTypeName = {
  [EnumSqlFlowType['Text-to-SQL']]: 'Text-to-SQL',
  [EnumSqlFlowType['E-SQL']]: '模型E',
  [EnumSqlFlowType['CHASE-SQL']]: '模型C',
  [EnumSqlFlowType['CHESS-SQL']]: '模型S',
};

/** 步骤状态 */
export enum EnumStepStatus {
  /** 初始状态 */
  initial = 'initial',
  /** 执行中 */
  running = 'running',
  /** 成功 */
  success = 'success',
  /** 出错 */
  failed = 'failed',
  /** 停止 */
  cancel = 'cancel',
}

/** 节点数据 */
export interface INodeData {
  id: string;
  label?: string;
  stepData?: IStepData;
  isDatabase?: boolean;
  databaseType?: DatabaseTypeCode;
  isModel?: boolean;
  modelType?: string;

  [key: string]: any;
}

/** 步骤id */
export enum EnumNodeStep {
  'Natural Language Question & Hint' = 'NLQ',
  'Database Schema & Description' = 'DSD',
  'Few-shot Examples' = 'FSE',
  'Candidate SQL Generation' = 'CSG',
  'Executing error Detection' = 'EED',
  'Predicate Value Extraction' = 'PVE',
  'Possible Predicate Generation' = 'PPG',
  'Question Enrichment' = 'QE',
  'SQL Refinement' = 'SR',
  'Result Show' = 'RS',
  'Database1' = '4',
  'Database2' = '7',
}

/** Chess步骤id */
export enum EnumChessNodeStep {
  'Database' = 'DB',
  'Question & Hint' = 'QH',
  'Keyword Extraction' = 'KE',
  'Keywords' = 'K',

  'Entity Retrieval' = 'ER',
  'Context Retrieval' = 'CR',

  'Similar Entities' = 'SE',
  'Relevant Descriptions' = 'RD',

  'Column Filtering' = 'CF',
  'Table Selection' = 'TS',

  'Column Selection' = 'CS',
  'Selected Schema' = 'SS',

  'Candidate Generation' = 'CG',

  'Revision' = 'R',
  'Final SQL' = 'FS',
}

/** Chase步骤id */
export enum EnumChaseNodeStep {
  /* 自然语言问题与提示 */
  S1_retrieve = 'S1_retrieve',
  /* 模式链接 */
  S2_schema_linking = 'S2_schema_linking',
  /*  数据库模式与描述 */
  S3_database_repr = 'S3_database_repr',
  /*  Few-shots 示例 */
  S4_example_selection = 'S4_example_selection',
  /* 多路候选SQL生成 */
  S5_candidate_generation = 'S5_candidate_generation',

  /* 多路候选SQL生成 DC COT */
  S5_candidate_generation_DC = 'S5_candidate_generation_DC',
  /* 多路候选SQL生成 QP */
  S5_candidate_generation_QP = 'S5_candidate_generation_QP',
  /* 多路候选SQL生成 OS */
  S5_candidate_generation_OS = 'S5_candidate_generation_OS',

  /* SQL执行、修复、优化 */
  S6_query_fixer = 'S6_query_fixer',

  /* SQL执行、修复、优化 DC COT */
  S6_query_fixer_DC = 'S6_query_fixer_DC',
  /* SQL执行、修复、优化 QP */
  S6_query_fixer_QP = 'S6_query_fixer_QP',
  /* SQL执行、修复、优化 OS */
  S6_query_fixer_OS = 'S6_query_fixer_OS',

  /* 结果筛选 */
  S7_query_result = 'S7_query_result',
  /* SQL筛选 */
  S8_candidate_selection = 'S8_candidate_selection',
  /* 最终SQL */
  S9_final_result = 'S9_final_result',
}

/** 简化结果步骤 */
export enum EnumNodeStepSimple {
  '意图及数据解析' = 'DSD&NLQ&FSE',
  '候选SQL生成' = 'CSG',
  'SQL优化' = 'PVE&PPG&&QE&SR',
  '最终SQL生成' = 'RS',
}

/** 每一步的执行结果 */
export interface IStepData {
  /** 返回的状态码 */
  code: number;
  /** 步骤枚举 */
  step_id: EnumNodeStep | EnumNodeStepSimple | EnumChaseNodeStep | EnumChessNodeStep;
  /** 执行开始时间 */
  start_time: string;
  /** 执行结束时间 */
  end_time: string;
  /** 执行日志 */
  log: string;
  /** 执行状态 */
  status?: EnumStepStatus;
  /** 错误信息 */
  error?: string;
  // /** 模版文件名称 */
  // template: string;
  /** 执行结果 */
  result?: any;
}

/** 请求体格式 */
export interface IFlowRequestData {
  /** 请求时间 */
  request_time: string;
  /** 提问 */
  question: string;
  /**是否是专家模式*/
  is_expert: boolean;
  /** 数据库名称 */
  database: string;
  /** 数据库类型，目前只有SQLITE */
  database_type: string;
  /** 使用的模型列表 */
  sql_flow_types: EnumSqlFlowType[];
  /** 请求启动后的结果列表 */
  flow_start_data?: IFlowStartData[];
}

/** E-SQL流程执行结果 */
export interface IFlowStartData {
  /** 返回的状态码 */
  code: number;
  /** 匹配到的问题id */
  question_id: string;
  /** 请求唯一标识 */
  request_id: string;
  /** 流程类型 */
  sql_flow_type: EnumSqlFlowType;
}

/** E-SQL流程执行结果 */
export interface IFlowData extends IFlowRequestData {
  /** 返回的状态码 */
  code: number;
  /** 流程类型 */
  sql_flow_type: EnumSqlFlowType;
  /** 步骤结果 */
  step_list: IStepData[];
  /** 执行状态 */
  status: EnumStepStatus;
}
