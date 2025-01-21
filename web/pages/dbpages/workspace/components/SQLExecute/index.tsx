import ConsoleEditor, { IConsoleRef } from '../../../../../dbpages/components/ConsoleEditor';
import DraggableContainer from '../../../../../dbpages/components/DraggableContainer';
import { IBoundInfo } from '@/dbpages/typings/index';
import { useWorkspaceStore } from '@/pages/dbpages/workspace/store';
import classnames from 'classnames';
import { memo, useEffect, useRef, useState } from 'react';
import SearchResult, { ISearchResultRef } from '../../../../../dbpages/components/SearchResult';
import styles from './index.module.less';

interface IProps {
  boundInfo: IBoundInfo;
  initDDL: string;
  // 异步加载sql
  loadSQL: () => Promise<string>;
}

const SQLExecute = memo<IProps>(props => {
  const { boundInfo: _boundInfo, initDDL, loadSQL } = props;
  const draggableRef = useRef<any>();
  const searchResultRef = useRef<ISearchResultRef>(null);
  const consoleRef = useRef<IConsoleRef>(null);
  const [boundInfo, setBoundInfo] = useState<IBoundInfo>(_boundInfo);
  const activeConsoleId = useWorkspaceStore(state => state.activeConsoleId);

  useEffect(() => {
    if (loadSQL) {
      loadSQL().then(sql => {
        consoleRef.current?.editorRef?.setValue(sql, 'cover');
      });
    }
    if (initDDL && _boundInfo.executeOnInit) {
      searchResultRef.current?.handleExecuteSQL(initDDL);
    }
  }, []);

  return (
    <div className={classnames(styles.sqlExecute)}>
      <DraggableContainer layout='column' className={styles.boxRightCenter}>
        <div ref={draggableRef} className={styles.boxRightConsole}>
          <ConsoleEditor
            ref={consoleRef}
            source='workspace'
            defaultValue={initDDL}
            boundInfo={boundInfo}
            setBoundInfo={setBoundInfo}
            hasAiChat={true}
            hasAi2Lang={true}
            isActive={activeConsoleId === boundInfo.consoleId}
            onExecuteSQL={sql => {
              searchResultRef.current?.handleExecuteSQL(sql);
            }}
          />
        </div>
        <div className={styles.boxRightResult}>
          <SearchResult
            isActive={activeConsoleId === boundInfo.consoleId}
            ref={searchResultRef}
            executeSqlParams={boundInfo}
          />
        </div>
      </DraggableContainer>
    </div>
  );
});

export default SQLExecute;
