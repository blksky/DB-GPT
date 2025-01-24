export interface IWorkspaceConsoleDDL {
  consoleId: string; // 控制台的id 唯一
  ddl: string; // 数据源ddl
  userId?: string; // 用户的唯一id
}

export enum EnumIndexedTableType {
  CHATBI_DDL_TABLE = 'workspaceConsoleDDL',
  CHATBI_CHAT_TABLE = 'chatbi_chat',
  CHATBI_CHATBI_TABLE = 'chatbi_chatbi',
  CHATBI_READING_TABLE = 'chatbi_reading',
}

export enum EnumIndexedDbType {
  CHAT_BI = 'chatbi_250115',
}

// 工作区console表
export const workspaceConsoleDDL = {
  name: EnumIndexedTableType.CHATBI_DDL_TABLE,
  primaryKey: {
    keyPath: 'consoleId',
    autoIncrement: true,
  },
  column: [
    {
      name: 'consoleId',
      isIndex: true,
      keyPath: 'consoleId',
      options: {
        unique: true,
      },
    },
    {
      name: 'userId',
      isIndex: true,
      keyPath: 'userId',
      options: {
        unique: false,
      },
    },
    {
      name: 'ddl',
      isIndex: true,
      keyPath: 'ddl',
      options: {
        unique: false,
      },
    },
  ],
};

// 对话表
export const getChatTable = (tableName: EnumIndexedTableType) => {
  return {
    name: tableName,
    primaryKey: {
      keyPath: 'key',
      autoIncrement: false,
    },
    column: [
      {
        name: 'key',
        isIndex: true,
        keyPath: 'key',
        options: {
          unique: true,
        },
      },
      {
        name: 'value',
        keyPath: 'value',
        options: {
          unique: false,
        },
      },
    ],
  };
};

export const tableList = [
  {
    tableDetails: workspaceConsoleDDL,
  },
  {
    tableDetails: getChatTable(EnumIndexedTableType.CHATBI_CHAT_TABLE),
  },
  {
    tableDetails: getChatTable(EnumIndexedTableType.CHATBI_CHATBI_TABLE),
  },
  {
    tableDetails: getChatTable(EnumIndexedTableType.CHATBI_READING_TABLE),
  },
];

// 创建数据库的方法
export const createDB = (dbName: string, version: number) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, version);
    request.onerror = (event: any) => {
      reject(event.target.error);
    };
    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result; // 数据库对象
      // 创建存储库
      tableList.forEach((item: any) => {
        const { tableDetails } = item;
        const objectStore = db.createObjectStore(tableDetails.name, tableDetails.primaryKey);
        tableDetails.column.forEach((i: any) => {
          if (i.isIndex) {
            objectStore.createIndex(i.name, i.keyPath, i.options);
          }
        });
      });
    };
  });
};

// 添加数据
export const addData = (db: EnumIndexedDbType, tableName: EnumIndexedTableType, data: any) => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const transaction = typeof window !== 'undefined' && window._indexedDB[db].transaction(tableName, 'readwrite');
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.add(data);
    request.onsuccess = () => {
      resolve(true);
    };
    request.onerror = (error: any) => {
      reject(error);
    };
  });
};

// 通过索引删除数据
export const deleteDataByIndex = (
  db: EnumIndexedDbType,
  tableName: EnumIndexedTableType,
  indexName: string,
  indexValue: string,
) => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const transaction = typeof window !== 'undefined' && window._indexedDB[db].transaction(tableName, 'readwrite');
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.index(indexName).delete(indexValue);
    request.onsuccess = () => {
      resolve(true);
    };
    request.onerror = () => {
      reject(false);
    };
  });
};

// 通过主键删除数据
export const deleteData = (db: EnumIndexedDbType, tableName: EnumIndexedTableType, key: any) => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const transaction = typeof window !== 'undefined' && window._indexedDB[db].transaction(tableName, 'readwrite');
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.delete(key);
    request.onsuccess = () => {
      resolve(true);
    };
    request.onerror = () => {
      reject(false);
    };
  });
};

// 通过索引查询数据,支持传入多个索引
export const getDataByIndex = (
  db: EnumIndexedDbType,
  tableName: EnumIndexedTableType,
  indexName: string,
  indexValue: any,
) => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const transaction = typeof window !== 'undefined' && window._indexedDB[db].transaction(tableName, 'readwrite');
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.index(indexName).get(indexValue);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(false);
    };
  });
};

// 通过游标查询数据，支持传入多个条件
export const getDataByCursor = (
  db: EnumIndexedDbType,
  tableName: EnumIndexedTableType,
  condition: { [key in string]: any },
) => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const transaction = typeof window !== 'undefined' && window._indexedDB[db].transaction(tableName, 'readwrite');
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.openCursor();
    const result: any[] = [];
    request.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        let flag = true;
        Object.keys(condition).forEach(key => {
          if (cursor.value[key] !== condition[key]) {
            flag = false;
          }
        });
        if (flag) {
          result.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(result);
      }
    };
    request.onerror = () => {
      reject(false);
    };
  });
};

// 修改数据
export const updateData = (db: EnumIndexedDbType, tableName: EnumIndexedTableType, data: any) => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const transaction = typeof window !== 'undefined' && window._indexedDB[db].transaction(tableName, 'readwrite');
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.put(data);
    request.onsuccess = () => {
      resolve(true);
    };
    request.onerror = () => {
      reject(false);
    };
  });
};

// 关闭数据库
export const closeDB = (db: EnumIndexedDbType) => {
  return new Promise(resolve => {
    // @ts-ignore
    typeof window !== 'undefined' && window._indexedDB[db].close();
    resolve(true);
  });
};

export default {
  createDB,
  addData,
  deleteDataByIndex,
  deleteData,
  getDataByIndex,
  getDataByCursor,
  updateData,
  closeDB,
};
