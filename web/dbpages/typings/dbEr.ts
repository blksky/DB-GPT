export interface IDbEr {
  id: number;
  data_source_id: number;
  data_schema_name: string;
  content: string;
  created_by?: number;
  updated_by?: number;
  created_user?: string;
  updated_user?: string;
  created_time?: string;
  updated_time?: string;
}

export interface IDbErRelation {
  source_column: string;
  target_column: string;
}
