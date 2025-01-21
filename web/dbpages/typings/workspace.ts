import { ITreeNode } from '@/dbpages/typings/index';
import { ConsoleStatus, CreateTabIntroType, DatabaseTypeCode, WorkspaceTabType } from '../constants';

export interface ICreateTabIntro {
  type: CreateTabIntroType;
  workspaceTabType: WorkspaceTabType;
  treeNodeData: ITreeNode;
}

export interface IWorkspaceTab {
  id: number | string; // Tab的id
  type: WorkspaceTabType; // 工作区tab的类型
  title: string; // 工作区tab的名称
  uniqueData?: any;
}

export interface IBoundInfo {
  consoleId?: number;
  dataSourceId: number;
  dataSourceName: string;
  databaseType: DatabaseTypeCode;
  databaseName?: string;
  schemaName?: string;
  status: ConsoleStatus;
  connectable: boolean;
  supportDatabase: boolean;
  supportSchema: boolean;
  executeOnInit?: boolean;
}
