import { useWorkspaceStore } from '@/dbpages/workspace/store';
import { setPanelLeftWidth } from '@/dbpages/workspace/store/config';
import { Spin } from 'antd';
import classnames from 'classnames';
import { memo, useCallback, useEffect, useRef } from 'react';

import DraggableContainer from '@/dbpages/components/DraggableContainer';
import dynamic from 'next/dynamic';

// import useMonacoTheme from '@/dbpages/components/MonacoEditor/useMonacoTheme';
import shortcutKeyCreateConsole from '@/dbpages/workspace/functions/shortcutKeyCreateConsole';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from './index.module.less';

const WorkspaceLeft = dynamic(() => import('@/dbpages/workspace/components/WorkspaceLeft'), {
  ssr: false,
  loading: () => <Spin />,
});

const WorkspaceRight = dynamic(() => import('@/dbpages/workspace/components/WorkspaceRight'), {
  ssr: false,
  loading: () => <Spin />,
});

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
          <WorkspaceLeft />
        </div>
        <WorkspaceRight />
      </DraggableContainer>
    </div>
  );
});

export default workspacePage;
