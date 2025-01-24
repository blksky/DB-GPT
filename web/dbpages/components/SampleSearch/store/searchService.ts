import { POST } from '@/client/api';
import {IDbGptApiData, IDbGptApiPageData, IDocumentData} from './ModelType'

/**
 * 全文检索
 * @param data
 */
export async function fulltextQuery(data: any = {}) {
  const { pageIndex, pageSize, keyword } = data;
  const values = { ...(data.values || {}) };
  return POST<any, IDbGptApiPageData<IDocumentData>>(`/knowledge/${values.space_name}/document/list`, {page: pageIndex, page_size: pageSize, doc_name: keyword});
}


/**
 * 查询提示词
 * @param data
 */
export async function searchPrompt(data: any = {}) {
  return {};
  // return requestApiResult<string[]>(`/api-poc/knowledge/prompt/${getProjectId()}`, {
  //   method: 'POST',
  //   data,
  // });
}
