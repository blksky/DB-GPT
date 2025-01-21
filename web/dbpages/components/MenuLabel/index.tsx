import Iconfont from '@/dbpages/components/Iconfont';
import classnames from 'classnames';
import { memo } from 'react';
import styles from './index.module.less';

interface IProps {
  className?: string;
  icon?: string;
  iconBright?: boolean;
  label: string;
}

export default memo<IProps>(props => {
  const { className, icon, label, iconBright } = props;
  return (
    <div className={classnames(styles.menuLabel, className)}>
      <div className={styles.menuLabelIconBox}>
        {icon && (
          <Iconfont
            className={classnames(styles.menuLabelIcon, { [styles.menuLabelIconBright]: iconBright })}
            code={icon}
          />
        )}
      </div>
      <div className={styles.menuLabelTitle}>{label}</div>
    </div>
  );
});
