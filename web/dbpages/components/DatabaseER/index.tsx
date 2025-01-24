// @ts-ignore
import WorkSpace from './components/Workspace.jsx';
// @ts-ignore
import AreasContextProvider from './context/AreasContext';
// @ts-ignore
import TablesContextProvider from './context/DiagramContext';
// @ts-ignore
import EnumsContextProvider from './context/EnumsContext';
// @ts-ignore
import LayoutContextProvider from './context/LayoutContext';
// @ts-ignore
import NotesContextProvider from './context/NotesContext';
// @ts-ignore
import SaveStateContextProvider from './context/SaveStateContext';
// @ts-ignore
import SelectContextProvider from './context/SelectContext';
// @ts-ignore
import SettingsContextProvider from './context/SettingsContext';
// @ts-ignore
import TasksContextProvider from './context/TasksContext';
// @ts-ignore
import TransformContextProvider from './context/TransformContext';
// @ts-ignore
import TypesContextProvider from './context/TypesContext';
// @ts-ignore
import UndoRedoContextProvider from './context/UndoRedoContext';

import { useWorkspaceStore } from '@/dbpages/workspace/store';
import { useEffect, useRef, useState } from 'react';

// @ts-ignore
import { treeConfig } from '@/dbpages/blocks/Tree/treeConfig';
import { TreeNodeType } from '@/dbpages/constants';
import sqlService from '@/dbpages/service/sql';
import { getSchemaList } from '@/dbpages/store/connection';
import { fetchDbErByDb } from '@/dbpages/store/dbEr';
import { ITreeNode } from '@/dbpages/typings/tree';
import './index.css';

export default function Editor() {
  const [treeData, setTreeDataReal] = useState<ITreeNode[] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dbErData, setDbErData] = useState<any>();
  const [dbSchemaInfo, setDbSchemaInfo] = useState<any>({});
  const refTreeData = useRef<ITreeNode[] | null>(treeData);
  const refWorkSpace = useRef<any>();

  const setTreeData = (value: ITreeNode[] | null) => {
    setTreeDataReal(value);
    refTreeData.current = value;
  };

  const { currentConnectionDetails } = useWorkspaceStore();

  const loadDatabaseER = () => {
    const tableTreeData = refTreeData.current?.[0];
    const tableListData = tableTreeData?.children;
    const tables = tableListData?.map((item, index) => {
      return {
        id: index,
        name: item.name,
        x: 0,
        y: 0,
        comment: item.comment || '',
        indices: [],
        color: '#6360f7',
        fields: item.children?.map((d: any, i) => ({
          id: i,
          check: '',
          // unique: false,
          name: d.name,
          type: d.columnType,
          primary: d.primaryKey,
          notNull: !d.nullable,
          increment: d.autoIncrement,
          default: d.defaultValue || '',
          comment: d.comment || '',
        })),
      };
    });
    const erData = {
      id: 0,
      custom: 0,
      tables: tables,
      relationships: [],
      notes: [],
      subjectAreas: [],
      types: [],
      title: tableTreeData?.name,
      description: '',
      database: currentConnectionDetails?.type?.toLowerCase(),
      dataSourceId: currentConnectionDetails?.id,
      dataSourceName: currentConnectionDetails?.alias,
      dataSchemaName: tableTreeData?.name,
    };
    setDbErData(erData);
    refWorkSpace.current?.loadFromDiagramData(erData);
  };

  const getDatabaseData = async (parents: ITreeNode[]) => {
    for (let parent of parents) {
      // @ts-ignore
      const tables: any = await treeConfig[TreeNodeType.TABLES]?.getChildren({
        pageNo: 1,
        refresh: false,
        extraParams: {
          ...parent.extraParams,
          schemaName: parent.name,
        },
        ...parent.extraParams,
      });
      if (tables.data) {
        parent.children = tables.data;
        for (let table of tables.data) {
          const params = {
            tableName: table.name,
            databaseName: table.extraParams?.dataSourceName,
            dataSourceId: table.extraParams?.dataSourceId,
            schemaName: table.extraParams?.schemaName,
            refresh: true,
          };
          const tableDetail = await sqlService.getTableDetails(params);
          table.children = tableDetail?.columnList || [];
        }
      }
    }
    setTreeData(parents);
  };

  const getTreeData = async () => {
    setDbSchemaInfo({ ...dbSchemaInfo, loading: true });
    if (!currentConnectionDetails?.id) {
      setTreeData([]);
      return;
    }
    const schemaList = await getSchemaList(currentConnectionDetails);
    const dataSchemaName = schemaList[0]?.name;
    const existData = await fetchDbErByDb({
      data_source_id: currentConnectionDetails.id,
      data_schema_name: dataSchemaName,
    });
    if (existData) {
      refWorkSpace.current?.loadFromDiagramData({
        ...JSON.parse(existData.content),
        id: existData.id,
      });
    } else {
      await getDatabaseData(schemaList);
      await loadDatabaseER();
    }
    setDbSchemaInfo({
      loading: false,
      dataSchemaName,
      dataSourceId: currentConnectionDetails?.id,
      dataSourceName: currentConnectionDetails?.alias,
      databaseType: currentConnectionDetails?.type?.toLowerCase(),
    });
  };

  useEffect(() => {
    getTreeData();
  }, [currentConnectionDetails?.id]);

  if (!Reflect.ownKeys(dbSchemaInfo).length) return null;

  const workSpaceProps: any = { dbSchemaInfo };

  return (
    <SettingsContextProvider>
      <LayoutContextProvider>
        <TransformContextProvider>
          <UndoRedoContextProvider>
            <SelectContextProvider>
              <TasksContextProvider>
                <AreasContextProvider>
                  <NotesContextProvider>
                    <TypesContextProvider>
                      <EnumsContextProvider>
                        <TablesContextProvider>
                          <SaveStateContextProvider>
                            <WorkSpace ref={refWorkSpace} {...workSpaceProps} />
                          </SaveStateContextProvider>
                        </TablesContextProvider>
                      </EnumsContextProvider>
                    </TypesContextProvider>
                  </NotesContextProvider>
                </AreasContextProvider>
              </TasksContextProvider>
            </SelectContextProvider>
          </UndoRedoContextProvider>
        </TransformContextProvider>
      </LayoutContextProvider>
    </SettingsContextProvider>
  );
}
