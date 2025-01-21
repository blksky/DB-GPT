import { DatabaseTypeCode } from '@/dbpages/constants/';
import { CreateType } from '../../../../dbpages/components/CreateDatabase';
import { useWorkspaceStore } from './index';

export interface IModalStore {
  openCreateDatabaseModal:
    | ((params: {
        type: CreateType;
        relyOnParams: {
          databaseType: DatabaseTypeCode;
          dataSourceId: number;
          databaseName?: string;
        };
        executedCallback?: (status: true) => void;
      }) => void)
    | null;
}

export const initModalStore: IModalStore = {
  openCreateDatabaseModal: null,
};

export const setOpenCreateDatabaseModal = (fn: any) => {
  useWorkspaceStore.setState({ openCreateDatabaseModal: fn });
};
