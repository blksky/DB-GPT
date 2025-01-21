import { EnumChatStoreType } from '@/dbpages/components/Chat/store';
import indexedDB, { EnumIndexedDbType, EnumIndexedTableType } from '../../../indexedDB';
import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';
import { Updater } from '../typing';
import { deepClone } from './clone';

type SecondParam<T> = T extends (_f: infer _F, _s: infer S, ...args: infer _U) => any ? S : never;

type MakeUpdater<T> = {
  lastUpdateTime: number;

  markUpdate: () => void;
  update: Updater<T>;
};

type SetStoreState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean | undefined,
) => void;

export function createPersistStore<T extends object, M>(
  state: T,
  methods: (set: SetStoreState<T & MakeUpdater<T>>, get: () => T & MakeUpdater<T>) => M,
  persistOptions: SecondParam<typeof persist<T & M & MakeUpdater<T>>>,
) {
  return create(
    persist(
      combine(
        {
          ...state,
          lastUpdateTime: 0,
        },
        (set, get) => {
          return {
            ...methods(set, get as any),

            markUpdate() {
              set({ lastUpdateTime: Date.now() } as Partial<T & M & MakeUpdater<T>>);
            },
            update(updater) {
              const state = deepClone(get());
              updater(state);
              set({
                ...state,
                lastUpdateTime: Date.now(),
              });
            },
          } as M & MakeUpdater<T>;
        },
      ),
      persistOptions as any,
    ),
  );
}

export const IndexedDBStorage: any = (chatType?: EnumChatStoreType) => {
  let tableName: EnumIndexedTableType = EnumIndexedTableType.CHATBI_CHAT_TABLE;
  switch (chatType) {
    case EnumChatStoreType.CHAT:
      tableName = EnumIndexedTableType.CHATBI_CHAT_TABLE;
      break;
    case EnumChatStoreType.CHAT_BI:
      tableName = EnumIndexedTableType.CHATBI_CHATBI_TABLE;
      break;
    case EnumChatStoreType.CHAT_READING:
      tableName = EnumIndexedTableType.CHATBI_READING_TABLE;
      break;
    default:
      tableName = EnumIndexedTableType.CHATBI_CHAT_TABLE;
  }
  return {
    getItem: (key: string) => {
      return new Promise(resolve => {
        const result = indexedDB.getDataByIndex(EnumIndexedDbType.CHAT_BI, tableName, 'key', key);
        result.then((result: any) => {
          resolve(result.value);
        });
      });
    },
    setItem: (key: string, value: string) =>
      indexedDB.updateData(EnumIndexedDbType.CHAT_BI, tableName, {
        key,
        value,
      }),
    removeItem: (key: string) => indexedDB.deleteDataByIndex(EnumIndexedDbType.CHAT_BI, tableName, 'key', key),
  };
};
