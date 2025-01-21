import classnames from 'classnames';
import { memo } from 'react';
import styles from './index.module.less';

interface IProps {
  className?: string;
}

export default memo<IProps>(props => {
  const { className } = props;
  return (
    <div className={classnames(styles.realTimeSQL, className)}>
      <div className={styles.title}>实时 SQL</div>
      <div className={styles.content}>实时 SQL</div>
    </div>
  );
});
