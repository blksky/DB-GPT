import { getDefaultChatScopeState } from '@/dbpages/components/Chat/store/storeBase';
import { StoreKey } from '../constant';
import { createPersistStore } from '../utils/store';
import { getChatStoreMethods } from './chat';

export const getChatScopeStoreMethods = (set: any, get: any) => {
  return {
    ...getChatStoreMethods(set, get),
    clearSessions() {
      set(() => getDefaultChatScopeState());
    },
  };
};

export const useChatScopeStore = createPersistStore(
  getDefaultChatScopeState(),
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = getChatScopeStoreMethods(set, get);

    return methods;
  },
  {
    name: StoreKey.ChatScope,
    version: 3.1,
    migrate(persistedState) {
      const state = persistedState as any;
      const newState = JSON.parse(JSON.stringify(state));
      return newState as any;
    },
  },
);
