import { StoreApi } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn, UseBoundStoreWithEqualityFn } from 'zustand/traditional';

export interface IGlobalStore {
  loading: boolean;
}

const initGlobalStore: IGlobalStore = {
  loading: true,
};

/**
 * 全局store
 */
export const useGlobalStore: UseBoundStoreWithEqualityFn<StoreApi<IGlobalStore>> = createWithEqualityFn(
  devtools(() => initGlobalStore),
  shallow,
);
