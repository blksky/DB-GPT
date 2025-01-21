export enum EnumGoldSqlFlowType {
  'E-SQL' = 0,
  'CHASE' = 1,
}

export enum EnumGoldSqlSrcType {
  '系统内置' = 0,
  '管理系统' = 1,
}

export enum EnumGoldSqlDifficulty {
  '简单' = 'simple',
  '中等' = 'moderate',
  '困难' = 'challanging',
}

export interface IGoldSql {
  id?: number;
  sql?: string;
  db_id?: string;
  question?: string;
  evidence?: string;
  difficulty?: EnumGoldSqlDifficulty;
  src_type: EnumGoldSqlSrcType;
  flow_type?: EnumGoldSqlFlowType;
  created_by?: number | string | null;
  updated_by?: number | string | null;
  created_user?: string;
  updated_user?: string;
  created_time?: string;
  updated_time?: string;
}
