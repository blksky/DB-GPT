import { memo, useCallback, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from './index.module.less';

// import classnames from 'classnames';
import { useWorkspaceStore } from '@/dbpages/workspace/store';
import { setPanelRightWidth } from '@/dbpages/workspace/store/config';
import WorkspaceExtendBody from '../WorkspaceExtend/WorkspaceExtendBody';
import WorkspaceExtendNav from '../WorkspaceExtend/WorkspaceExtendNav';

// ----- components -----
import DraggableContainer from '../../../components/DraggableContainer';
import WorkspaceTabs from '../WorkspaceTabs';

const WorkspaceRight = memo(() => {
  const draggableRef = useRef<any>();

  const { currentWorkspaceExtend, panelRight, panelRightWidth } = useWorkspaceStore(state => {
    return {
      currentWorkspaceExtend: state.currentWorkspaceExtend,
      panelRight: state.layout.panelRight,
      panelRightWidth: state.layout.panelRightWidth,
    };
  });

  const draggableContainerResize = useCallback((data: number) => {
    setPanelRightWidth(data);
  }, []);

  return (
    <div className={styles.workspaceRight}>
      <DraggableContainer
        onResize={draggableContainerResize}
        showLine={!!currentWorkspaceExtend}
        min={100}
        layout='column'
        className={styles.draggableContainer}
      >
        <WorkspaceTabs />
        <div
          ref={draggableRef}
          className={styles.workspaceExtendBody}
          style={{
            display: currentWorkspaceExtend && panelRight ? 'block' : 'none',
            height: `${panelRightWidth || 0}px`,
          }}
        >
          <WorkspaceExtendBody />
        </div>
      </DraggableContainer>
      {panelRight && <WorkspaceExtendNav className={styles.workspaceExtendNav} />}
    </div>
  );
});

export default WorkspaceRight;
