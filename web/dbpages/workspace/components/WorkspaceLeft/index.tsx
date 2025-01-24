// import useMonacoTheme from '@/dbpages/components/MonacoEditor/useMonacoTheme';
import { useConnectionStore } from '@/dbpages/store/connection';
import Connection from '@/pages/dbpages/connection';
import { Drawer } from 'antd';
import classnames from 'classnames';
import { memo, useState } from 'react';
import CreateDatabase from '../../../components/CreateDatabase';
import Iconfont from '../../../components/Iconfont';
import i18n from '../../../i18n';
import TableList from '../TableList';
import WorkspaceLeftHeader from '../WorkspaceLeftHeader';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from './index.module.less';

const WorkspaceLeft = memo(() => {
  const [connState, setConnState] = useState<{ open: boolean }>({ open: false });
  const { connectionList } = useConnectionStore(state => {
    return {
      connectionList: state.connectionList,
    };
  });

  // 编辑器的主题
  // useMonacoTheme();

  // const jumpPage = () => {
  //   setMainPageActiveTab('connections');
  // };

  const handleConnection = () => {
    setConnState({ ...connState, open: true });
  };

  return (
    <>
      <div className={classnames(styles.workspaceLeft)}>
        {connectionList?.length ? (
          <>
            <WorkspaceLeftHeader onConnectionSetting={handleConnection} />
            <TableList />
          </>
        ) : (
          <div className={styles.noConnectionList}>
            <Iconfont className={styles.noConnectionListIcon} code='&#xe638;' />
            <div className={styles.noConnectionListTips}>{i18n('workspace.tips.noConnection')}</div>
            <div>
              <span className={styles.create} onClick={handleConnection}>
                {i18n('common.title.create')}
              </span>
              {i18n('connection.title.connections')}
            </div>
          </div>
        )}
      </div>
      <CreateDatabase />
      <Drawer
        title='链接管理'
        width='100%'
        styles={{ body: { padding: 0 } }}
        onClose={() => setConnState({ ...connState, open: false })}
        open={connState.open}
      >
        <Connection />
      </Drawer>
    </>
  );
});

export default WorkspaceLeft;
