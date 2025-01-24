import classnames from 'classnames';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from './index.module.less';

// import i18n from '@/pages/dbpages/i18n';
import { Popover } from 'antd';
import Iconfont from '../../../../components/Iconfont';
import { extendConfig } from '../config';

import { useWorkspaceStore } from '@/dbpages/workspace/store';
import { setCurrentWorkspaceExtend } from '@/dbpages/workspace/store/common';

interface IToolbar {
  code: string;
  title: string;
  icon: string;
  components: any;
}

interface IProps {
  className?: any;
}

export default (props: IProps) => {
  const { className } = props;
  const { currentWorkspaceExtend } = useWorkspaceStore(state => {
    return {
      currentWorkspaceExtend: state.currentWorkspaceExtend,
    };
  });

  const changeExtend = (item: IToolbar) => {
    if (currentWorkspaceExtend === item.code) {
      setCurrentWorkspaceExtend(null);
      return;
    }
    setCurrentWorkspaceExtend(item.code);
  };

  return (
    <div className={classnames(className, styles.workspaceExtendNav)}>
      {extendConfig.map((item, index) => {
        return (
          <Popover mouseEnterDelay={0.8} key={index} placement='top' content={item.title}>
            <div className={styles.rightBarFront} onClick={changeExtend.bind(null, item)}>
              <Iconfont code={item.icon} box size={18} active={currentWorkspaceExtend === item.code} />
            </div>
          </Popover>
        );
      })}
    </div>
  );
};
