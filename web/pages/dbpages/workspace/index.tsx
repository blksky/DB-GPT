import { useWorkspaceStore } from '@/pages/dbpages/workspace/store';
import { setPanelLeftWidth } from '@/pages/dbpages/workspace/store/config';
import { Spin } from 'antd';
import classnames from 'classnames';
import { Suspense, lazy, memo, useCallback, useEffect, useRef } from 'react';

import DraggableContainer from '../../../dbpages/components/DraggableContainer';

// import useMonacoTheme from '@/dbpages/components/MonacoEditor/useMonacoTheme';
import shortcutKeyCreateConsole from './functions/shortcutKeyCreateConsole';

import styles from './index.module.less';

const WorkspaceLeft = lazy(() => import('./components/WorkspaceLeft'));
const WorkspaceRight = lazy(() => import('./components/WorkspaceRight'));

const workspacePage = memo(() => {
  const draggableRef = useRef<any>();
  const { panelLeft, panelLeftWidth } = useWorkspaceStore(state => {
    return {
      panelLeft: state.layout.panelLeft,
      panelLeftWidth: state.layout.panelLeftWidth,
    };
  });

  // 编辑器的主题
  // useMonacoTheme();

  // 快捷键
  useEffect(() => {
    shortcutKeyCreateConsole();
  }, []);

  const draggableContainerResize = useCallback((data: number) => {
    setPanelLeftWidth(data);
  }, []);

  return (
    <div className={styles.workspace}>
      <DraggableContainer className={styles.workspaceMain} onResize={draggableContainerResize}>
        <div
          ref={draggableRef}
          style={{ '--panel-left-width': `${panelLeftWidth}px` } as any}
          className={classnames({ [styles.hiddenPanelLeft]: !panelLeft }, styles.boxLeft)}
        >
          <Suspense fallback={<Spin />}>
            <WorkspaceLeft />
          </Suspense>
        </div>
        <Suspense fallback={<Spin />}>
          <WorkspaceRight />
        </Suspense>
      </DraggableContainer>
    </div>
  );
});

export default workspacePage;
