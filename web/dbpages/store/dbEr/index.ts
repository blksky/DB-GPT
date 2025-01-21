import { createDbEr, deleteDbEr, generateRelation, getDbErByDb, updateDbEr } from '@/dbpages/service/dbEr';
import { IDbEr, IDbErRelation } from '@/dbpages/typings/dbEr';
import { OPERATE_TYPES, ResultWrapper } from '@/dbpages/typings/result';
import { StoreApi } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn, UseBoundStoreWithEqualityFn } from 'zustand/traditional';

export interface IDbErStore {
  loading: boolean;
  saving: boolean;
  dbErData?: IDbEr;
}

const initDbErStore: IDbErStore = {
  loading: true,
  saving: false,
  dbErData: undefined,
};

/**
 * 用户 store
 */
export const useDbErStore: UseBoundStoreWithEqualityFn<StoreApi<IDbErStore>> = createWithEqualityFn(
  devtools(() => initDbErStore),
  shallow,
);

export const fetchDbErByDb = async ({
  data_source_id,
  data_schema_name,
}: {
  data_source_id: number;
  data_schema_name: string;
}): Promise<IDbEr | undefined> => {
  useDbErStore.setState({ loading: true, dbErData: undefined });
  const data = await getDbErByDb({ data_source_id, data_schema_name });
  let dbErData: IDbEr | undefined;
  ResultWrapper<typeof data.content>({
    data,
    operate: OPERATE_TYPES.QUERY,
    onSuccess: content => {
      dbErData = content;
    },
  });
  useDbErStore.setState({ loading: false, dbErData });
  return dbErData;
};

export const fetchCreateDbEr = async (payload: IDbEr) => {
  useDbErStore.setState({ saving: true });
  const data = await createDbEr(payload);
  let result = 0;
  ResultWrapper<typeof data.content>({
    data,
    sucMsg: false,
    operate: OPERATE_TYPES.ADD,
    onSuccess: content => (result = content),
  });
  useDbErStore.setState({ saving: false });
  return result;
};

export const fetchUpdateDbEr = async (payload: IDbEr) => {
  useDbErStore.setState({ saving: true });
  const data = await updateDbEr(payload);
  useDbErStore.setState({ saving: false });
  return ResultWrapper({ data, sucMsg: false, operate: OPERATE_TYPES.EDIT });
};

export const fetchDeleteDbEr = async (payload: { id: number }) => {
  const data = await deleteDbEr(payload);
  return ResultWrapper({ data, operate: OPERATE_TYPES.DEL });
};

export const fetchGenerateRelation = async ({
  data_source_name,
  data_schema_name,
}: {
  data_source_name: string;
  data_schema_name: string;
}): Promise<IDbErRelation[] | undefined> => {
  useDbErStore.setState({ loading: true });
  const data = await generateRelation({ data_source_name, data_schema_name });
  let relations: IDbErRelation[] | undefined;
  ResultWrapper<typeof data.content>({
    data,
    operate: OPERATE_TYPES.QUERY,
    onSuccess: content => {
      relations = content;
    },
  });
  useDbErStore.setState({ loading: false });
  return relations;
};
