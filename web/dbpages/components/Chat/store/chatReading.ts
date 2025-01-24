import { EnumChatStoreType, getDefaultChatReadingState } from '@/dbpages/components/Chat/store/storeBase';
import { createJSONStorage } from 'zustand/middleware';
import { StoreKey } from '../constant';
import { IndexedDBStorage, createPersistStore } from '../utils/store';
import { getChatStoreMethods } from './chat';

export const getChatReadingStoreMethods = (set: any, get: any) => {
  return {
    ...getChatStoreMethods(set, get),
    clearSessions() {
      set(() => getDefaultChatReadingState());
    },
  };
};

export const useChatReadingStore = createPersistStore(
  getDefaultChatReadingState(),
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = getChatReadingStoreMethods(set, get);
    return methods;
  },
  {
    name: StoreKey.ChatScope,
    version: 3.1,
    storage: typeof window !== 'undefined' && createJSONStorage(() => IndexedDBStorage(EnumChatStoreType.CHAT_READING)),
    migrate(persistedState) {
      const state = persistedState as any;
      const newState = JSON.parse(JSON.stringify(state));
      return newState as any;
    },
  },
);
