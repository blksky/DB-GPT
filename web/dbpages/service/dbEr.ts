import { IDbEr, IDbErRelation } from '@/dbpages/typings/dbEr';
import { requestApiResult } from '@/dbpages/utils/RequestUtil';

/** 创建ER */
export async function createDbEr(data: any) {
  return requestApiResult<number>(`/api-chatbi-manage/db_er/create`, {
    method: 'POST',
    data,
  });
}

/** 更新ER */
export async function updateDbEr(data: any) {
  return requestApiResult<boolean>(`/api-chatbi-manage/db_er/update`, {
    method: 'POST',
    data,
  });
}

/** 删除ER */
export async function deleteDbEr(data: { id: number }) {
  return requestApiResult<boolean>(`/api-chatbi-manage/db_er/delete_by_id/${data.id}`, {
    method: 'POST',
  });
}

/** 根据数据源id获取er图 */
export async function getDbErByDb(data: { data_source_id: number; data_schema_name: string }) {
  return requestApiResult<IDbEr>(`/api-chatbi-manage/db_er/get_by_db/${data.data_source_id}/${data.data_schema_name}`);
}

/** 根据数据源名称获取er关系 */
export async function generateRelation(data: { data_source_name: string; data_schema_name: string }) {
  return requestApiResult<IDbErRelation[]>(`/api-chatbi-manage/db_er/generate_relation/${data.data_source_name}`);
}
