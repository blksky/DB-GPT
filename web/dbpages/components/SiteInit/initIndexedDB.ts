import { StoreKey } from '@/dbpages/components/Chat/constant';
import indexedDB, { EnumIndexedDbType, EnumIndexedTableType, getDataByIndex } from '../../indexedDB';

/** 初始化indexedDB */
const initIndexedDB = () => {
  indexedDB.createDB(EnumIndexedDbType.CHAT_BI, 2).then(db => {
    // @ts-ignore
    window._indexedDB = {
      [EnumIndexedDbType.CHAT_BI]: db,
      _getDataByIndex: getDataByIndex,
    };
    setTimeout(() => {
      // @ts-ignore
      window._indexedDB['_getChatData'] = getDataByIndex(
        EnumIndexedDbType.CHAT_BI,
        EnumIndexedTableType.CHATBI_CHAT_TABLE,
        'key',
        StoreKey.Chat,
      );
    }, 1000);
  });
};

export default initIndexedDB;
