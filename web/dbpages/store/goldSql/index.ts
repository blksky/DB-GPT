import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/dbpages/common/constants';
import { localeMsg } from '@/dbpages/helper/LocaleHelper';
import { createGoldSql, deleteGoldSql, pageQueryGoldSql, updateGoldSql } from '@/dbpages/service/goldSql';
import { IGoldSql } from '@/dbpages/typings/goldSql';
import { IApiPageResult, IApiResult, OPERATE_TYPES, ResultWrapper } from '@/dbpages/typings/result';
import { StoreApi } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { UseBoundStoreWithEqualityFn, createWithEqualityFn } from 'zustand/traditional';

export interface IGoldSqlStore {
  pageData: {
    loading: boolean;
    list: IGoldSql[];
    condition: Record<string, any>;
    pagination: {
      total: number;
      current: number;
      pageSize: number;
      showTotal: (total: number) => string;
    };
  };
}

const initGoldSqlStore: IGoldSqlStore = {
  pageData: {
    loading: false,
    list: [],
    condition: {},
    pagination: {
      total: 0,
      current: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
      showTotal: (total: number) => localeMsg('pages.total.rows', { total }),
    },
  },
};

/**
 * 用户 store
 */
export const useGoldSqlStore: UseBoundStoreWithEqualityFn<StoreApi<IGoldSqlStore>> = createWithEqualityFn(
  devtools(() => initGoldSqlStore),
  shallow,
);

export const fetchPageQueryGoldSql = async ({
  pageIndex,
  pageSize,
  condition,
  dbSchemaInfo,
}: {
  pageIndex: number;
  pageSize: number;
  condition: Record<string, any>;
  dbSchemaInfo?: Record<string, any>;
}): Promise<IApiResult<IApiPageResult<IGoldSql>>> => {
  const { pageData } = useGoldSqlStore.getState();
  const updateState: any = {
    ...pageData,
    condition,
    loading: true,
    pagination: { ...pageData.pagination, pageSize, current: pageIndex },
  };
  useGoldSqlStore.setState({ pageData: updateState });
  const resultCond: any = { ...condition };
  if (dbSchemaInfo?.dataSourceName) {
    resultCond.db_id = dbSchemaInfo.dataSourceName;
  }
  if (dbSchemaInfo?.dataSchemaName) {
    resultCond.schema_name = dbSchemaInfo.dataSchemaName;
  }
  if (dbSchemaInfo?.tableName) {
    resultCond.table_name = dbSchemaInfo.tableName;
  }
  const data = await pageQueryGoldSql({ pageIndex, pageSize, condition: resultCond });
  updateState.loading = false;
  ResultWrapper<typeof data.content>({
    data,
    operate: OPERATE_TYPES.QUERY,
    onSuccess: content => {
      updateState.list = content.data;
      updateState.pagination.total = content.totalCount;
      updateState.pagination.current = content.pageIndex;
      updateState.pagination.pageSize = content.pageSize;
    },
  });
  useGoldSqlStore.setState({ pageData: { ...updateState } });
  return data;
};

export const fetchCreateGoldSql = async (payload: IGoldSql) => {
  const data = await createGoldSql(payload);
  let result = 0;
  ResultWrapper<typeof data.content>({
    data,
    operate: OPERATE_TYPES.ADD,
    onSuccess: content => (result = content),
  });
  return result;
};

export const fetchUpdateGoldSql = async (payload: IGoldSql) => {
  const data = await updateGoldSql(payload);
  return ResultWrapper({ data, operate: OPERATE_TYPES.EDIT });
};

export const fetchDeleteGoldSql = async (payload: { id: number }) => {
  const data = await deleteGoldSql(payload);
  return ResultWrapper({ data, operate: OPERATE_TYPES.DEL });
};
