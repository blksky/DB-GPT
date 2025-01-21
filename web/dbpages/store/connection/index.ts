import { StoreApi } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn, UseBoundStoreWithEqualityFn } from 'zustand/traditional';

import connectionService from '@/dbpages/service/connection';
import { IConnectionEnv, IConnectionListItem } from '@/dbpages/typings/connection';

import { treeConfig } from '@/dbpages/blocks/Tree/treeConfig';
import { ITreeNode } from '@/dbpages/typings';
import { useWorkspaceStore } from '@/pages/dbpages/workspace/store';
import { setCurrentConnectionDetails } from '@/pages/dbpages/workspace/store/common';
import { TreeNodeType } from '../../constants';

export interface IConnectionStore {
  loadingConnection: boolean;
  connectionList: IConnectionListItem[] | null;
  connectionEnvList: IConnectionEnv[] | null;
}

export const initConnectionStore = {
  loadingConnection: true,
  connectionList: null,
  connectionEnvList: null,
};

export const useConnectionStore: UseBoundStoreWithEqualityFn<StoreApi<IConnectionStore>> = createWithEqualityFn(
  devtools(() => initConnectionStore),
  shallow,
);

export const setConnectionList = (connectionList: IConnectionListItem[]) => {
  return useConnectionStore.setState({ connectionList });
};

export const setConnectionEnvList = (connectionEnvList: IConnectionEnv[]) => {
  return useConnectionStore.setState({ connectionEnvList });
};

export const getConnectionList: () => Promise<IConnectionListItem[]> = () => {
  return new Promise((resolve, reject) => {
    const currentConnectionDetails = useWorkspaceStore.getState().currentConnectionDetails;
    connectionService
      .getList({
        pageNo: 1,
        pageSize: 1000,
        refresh: true,
      })
      .then(res => {
        const connectionList = res?.data || [];
        useConnectionStore.setState({ connectionList, loadingConnection: false });
        resolve(connectionList);

        // 如果连接列表为空，则设置当前连接为空
        if (connectionList.length === 0) {
          setCurrentConnectionDetails(null);
          return;
        }

        // 如果当前连接不存在，则设置当前连接为第一个连接
        if (!currentConnectionDetails?.id) {
          setCurrentConnectionDetails(connectionList[0]);
          return;
        }

        // 如果存在但是不在列表中，则设置当前连接为第一个连接
        const currentConnection = connectionList.find(item => item.id === currentConnectionDetails?.id);
        if (!currentConnection) {
          setCurrentConnectionDetails(connectionList[0]);
        }
      })
      .catch(() => {
        useConnectionStore.setState({ connectionList: [] });
        reject([]);
      });
  });
};

export const getSchemaList: (connectionItem: IConnectionListItem) => Promise<ITreeNode[]> = async (
  connectionItem: IConnectionListItem,
) => {
  const treeNodeType = connectionItem.supportDatabase ? TreeNodeType.DATA_SOURCE : TreeNodeType.DATABASE;
  const databaseData = await treeConfig[treeNodeType].getChildren?.({
    dataSourceId: connectionItem.id,
    dataSourceName: connectionItem.alias,
    refresh: false,
    extraParams: {
      dataSourceId: connectionItem.id,
      dataSourceName: connectionItem.alias,
      databaseType: connectionItem.type,
    },
  });
  return databaseData || [];
};
