import { SettingOutlined } from '@ant-design/icons';
import { Dropdown, Flex, Tooltip } from 'antd';
import classnames from 'classnames';
import { memo, useMemo, useState } from 'react';
import styles from './index.module.less';

// ---- store ----
import { useConnectionStore } from '@/dbpages/store/connection';
import { useWorkspaceStore } from '@/pages/dbpages/workspace/store';
import { setCurrentConnectionDetails } from '@/pages/dbpages/workspace/store/common';

// ----- components -----
import Iconfont from '../../../../../dbpages/components/Iconfont';

// ----- constants/typings -----
import { databaseMap } from '@/dbpages/constants/';

import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import { IConnectionListItem } from '@/dbpages/typings/connection';

export default memo((props: any) => {
  const { onConnectionSetting } = props;
  const [connState, setConnState] = useState<{ open: boolean }>({ open: false });
  const { connectionList } = useConnectionStore(state => {
    return {
      connectionList: state.connectionList,
    };
  });

  const { currentConnectionDetails } = useWorkspaceStore(state => {
    return {
      currentConnectionDetails: state.currentConnectionDetails,
    };
  });

  const renderConnectionLabel = (item: IConnectionListItem) => {
    return (
      <div className={classnames(styles.menuLabel)}>
        {/* <Tag className={styles.menuLabelTag} color={item.environment.color.toLocaleLowerCase()}>
          {item.environment.shortName}
        </Tag> */}
        <span className={styles.envTag} style={{ background: item.environment.color.toLocaleLowerCase() }} />
        <div className={styles.menuLabelIconBox}>
          <Iconfont className={classnames(styles.menuLabelIcon)} code={databaseMap[item.type]?.icon} />
        </div>
        <div className={styles.menuLabelTitle}>{item.alias}</div>
      </div>
    );
  };

  const connectionItems = useMemo(() => {
    return (
      connectionList?.map(item => {
        return {
          key: item.id,
          label: renderConnectionLabel(item),
          onClick: () => {
            setCurrentConnectionDetails(item);
          },
        };
      }) || []
    );
  }, [connectionList, currentConnectionDetails]);

  return (
    <Flex>
      <Dropdown
        className={styles.selectWorkspace}
        menu={{ items: connectionItems }}
        trigger={['click']}
        overlayClassName={styles.dropdownOverlay}
      >
        <div className={styles.selectConnection}>
          {currentConnectionDetails && renderConnectionLabel(currentConnectionDetails)}
          <div className={styles.dropDownArrow}>
            <Iconfont code='&#xe641;' />
          </div>
        </div>
      </Dropdown>
      <Tooltip title='链接管理' color={Constants.TOOLTIP_COLOR}>
        <SettingOutlined onClick={onConnectionSetting} className={styles.settingWorkspace} />
      </Tooltip>
    </Flex>
  );
});
