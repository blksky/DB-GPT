import { IGoldSql } from '@/dbpages/typings/goldSql';
import { IApiPageResult } from '@/dbpages/typings/result';
import { requestApiResult } from '@/dbpages/utils/RequestUtil';

/** 创建Gold sql */
export async function createGoldSql(data: any) {
  return requestApiResult<number>(`/api-chatbi-manage/gold_sql/create`, {
    method: 'POST',
    data,
  });
}

/** 更新Gold sql */
export async function updateGoldSql(data: any) {
  return requestApiResult<boolean>(`/api-chatbi-manage/gold_sql/update`, {
    method: 'POST',
    data,
  });
}

/** 删除Gold sql */
export async function deleteGoldSql(data: { id: number }) {
  return requestApiResult<boolean>(`/api-chatbi-manage/gold_sql/delete_by_id/${data.id}`, {
    method: 'POST',
  });
}

/** Gold sql 分页查询*/
export async function pageQueryGoldSql(data: { pageIndex: number; pageSize: number; condition: Record<string, any> }) {
  return requestApiResult<IApiPageResult<IGoldSql>>(
    `/api-chatbi-manage/gold_sql/page_query/${data.pageIndex}/${data.pageSize}`,
    {
      method: 'POST',
      data,
    },
  );
}

/** 根据id获取Gold sql */
export async function getGoldSqlById(data: { id: number }) {
  return requestApiResult<IGoldSql>(`/api-chatbi-manage/gold_sql/get_by_id/${data.id}`);
}
