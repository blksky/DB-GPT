import sqlServer from '@/dbpages/service/sql';
import { Spin } from 'antd';
import classnames from 'classnames';
import React, { lazy, memo, Suspense, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { IExportRefFunction } from '../MonacoEditor';
import styles from './index.module.less';

const MonacoEditor = lazy(() => import('@/dbpages/components/MonacoEditor'));

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
      <Suspense fallback={<Spin />}>
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
      </Suspense>
    </div>
  );
});
