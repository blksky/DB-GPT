import sqlServer from '@/dbpages/service/sql';
import { Spin } from 'antd';
import classnames from 'classnames';
import dynamic from 'next/dynamic';
import React, { memo, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { IExportRefFunction } from '../MonacoEditor';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from './index.module.less';

const MonacoEditor = dynamic(() => import('@/dbpages/components/MonacoEditor'), {
  ssr: false,
  loading: () => <Spin />,
});

interface IProps {
  className?: string;
  data: any;
}

export default memo<IProps>(props => {
  const { className, data } = props;
  const [monacoEditorId] = React.useState(uuid());
  const monacoEditorRef = React.useRef<IExportRefFunction>(null);
  const [sql, setSql] = React.useState('');

  useEffect(() => {
    if (data) {
      sqlServer
        .exportCreateTableSql({
          ...data,
        } as any)
        .then(res => {
          setSql(res);
        });
    }
  }, [data]);

  useEffect(() => {
    monacoEditorRef.current?.setValue(sql || '', 'reset');
  }, [sql]);

  return (
    <div className={classnames(styles.viewDDL, className)}>
      <MonacoEditor
        id={monacoEditorId}
        ref={monacoEditorRef}
        options={{
          lineNumbers: 'off',
          readOnly: true,
          glyphMargin: false,
          folding: false,
        }}
      />
    </div>
  );
});
