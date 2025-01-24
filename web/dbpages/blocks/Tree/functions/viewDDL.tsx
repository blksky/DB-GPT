// 置顶表格
import mysqlService from '@/dbpages/service/sql';
import { openModal } from '@/dbpages/store/common/components';
import { Spin } from 'antd';
import dynamic from 'next/dynamic';
import React from 'react';
import { v4 as uuid } from 'uuid';
import styles from './viewDDL.module.less';

const MonacoEditor = dynamic(() => import('@/dbpages/components/MonacoEditor'), {
  ssr: false,
  loading: () => <Spin />,
});

export const viewDDL = treeNodeData => {
  const getSql = () => {
    return new Promise(resolve => {
      mysqlService
        .exportCreateTableSql({
          dataSourceId: treeNodeData.extraParams.dataSourceId,
          databaseName: treeNodeData.extraParams.databaseName,
          schemaName: treeNodeData.extraParams.schemaName,
          tableName: treeNodeData.name,
        })
        .then(res => {
          resolve(res);
        });
    });
  };

  openModal({
    title: `DDL-${treeNodeData.name}`,
    width: '60%',
    height: '60%',
    footer: false,
    content: (
      <div className={styles.monacoEditorBox}>
        <MonacoEditorAsync getSql={getSql} />
      </div>
    ),
  });
};

export const MonacoEditorAsync = (params: { getSql: any }) => {
  const { getSql } = params;
  const monacoEditorRef = React.useRef<any>();
  getSql().then(sql => {
    monacoEditorRef.current.setValue(sql);
  });
  return <MonacoEditor id={uuid()} ref={monacoEditorRef} />;
};
