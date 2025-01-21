import { StoreApi } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn, UseBoundStoreWithEqualityFn } from 'zustand/traditional';

import { IAppTitleBarConfig, initAppTitleBarConfig } from './appTitleBarConfig';
import { IComponentsContent, initComponentsContent } from './components';
import { ICopyFocusedContent, initCopyFocusedContent } from './copyFocusedContent';

export type IStore = ICopyFocusedContent & IComponentsContent & IAppTitleBarConfig;

export const useCommonStore: UseBoundStoreWithEqualityFn<StoreApi<IStore>> = createWithEqualityFn(
  devtools(() => ({
    ...initCopyFocusedContent,
    ...initComponentsContent,
    ...initAppTitleBarConfig,
  })),
  shallow,
);
