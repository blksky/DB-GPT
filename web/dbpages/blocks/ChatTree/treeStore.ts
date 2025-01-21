/**
 * 树的store
 */
import { create, StoreApi, UseBoundStore } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface IChatTreeStore {
  focusId: number | string | null;
  focusTreeNode: {
    dataSourceId: number;
    dataSourceName: string;
    databaseType: string;
    databaseName?: string;
    schemaName?: string;
    tableName?: string;
  } | null;
}

const chatTreeStore = {
  focusId: null,
  focusTreeNode: null,
};

export const useChatTreeStore: UseBoundStore<StoreApi<IChatTreeStore>> = create(devtools(() => chatTreeStore));

export const setFocusId = (focusId: IChatTreeStore['focusId']) => {
  useChatTreeStore.setState({ focusId });
};

export const setFocusTreeNode = (focusTreeNode: IChatTreeStore['focusTreeNode']) => {
  useChatTreeStore.setState({ focusTreeNode });
};

// 清除treeStore
export const clearChatTreeStore = () => {
  useChatTreeStore.setState(chatTreeStore);
};
