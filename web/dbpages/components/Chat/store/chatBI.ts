import { EnumChatStoreType, getDefaultChatBIState } from '@/dbpages/components/Chat/store/storeBase';
import { createJSONStorage } from 'zustand/middleware';
import { StoreKey } from '../constant';
import { IndexedDBStorage, createPersistStore } from '../utils/store';
import { getChatStoreMethods } from './chat';

export const getChatBIStoreMethods = (set: any, get: any) => {
  return {
    ...getChatStoreMethods(set, get),
    clearSessions() {
      set(() => getDefaultChatBIState());
    },
  };
};

export const useChatBIStore = createPersistStore(
  getDefaultChatBIState(),
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = getChatBIStoreMethods(set, get);
    return methods;
  },
  {
    name: StoreKey.ChatScope,
    version: 3.1,
    storage: typeof window !== 'undefined' && createJSONStorage(() => IndexedDBStorage(EnumChatStoreType.CHAT_BI)),
    migrate(persistedState) {
      const state = persistedState as any;
      const newState = JSON.parse(JSON.stringify(state));
      return newState as any;
    },
  },
);
