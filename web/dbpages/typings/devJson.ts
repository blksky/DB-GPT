export enum EnumDevJsonDifficulty {
  '简单' = 'simple',
  '中等' = 'moderate',
  '困难' = 'challanging',
}

export enum EnumGoldSqlSrcType {
  '系统内置' = 0,
  '管理系统' = 1,
}

export interface IDevJson {
  id: number;
  question_id: number;
  db_id: string;
  question: string;
  evidence: string;
  sql: string;
  difficulty: EnumDevJsonDifficulty;
  src_type: EnumGoldSqlSrcType;
  created_by: string;
  updated_by: string;
  created_time: string;
  updated_time: string;
}
