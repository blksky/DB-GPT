import { StoreApi } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn, UseBoundStoreWithEqualityFn } from 'zustand/traditional';

export interface IConfigStore {
  curRoute: string;
}

const initConfigStore: IConfigStore = {
  curRoute: '/',
};

/**
 * 配置 store
 */
export const useConfigStore: UseBoundStoreWithEqualityFn<StoreApi<IConfigStore>> = createWithEqualityFn(
  devtools(() => initConfigStore),
  shallow,
);

/**
 *
 * @param curRoute 设置当前路由
 */
export const setCurRoute = (curRoute: string) => {
  useConfigStore.setState({ curRoute });
};
