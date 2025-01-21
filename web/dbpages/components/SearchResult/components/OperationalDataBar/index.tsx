import classnames from 'classnames';
import { memo } from 'react';
import styles from './index.module.less';

interface IProps {
  className?: string;
}

export default memo<IProps>(props => {
  const { className } = props;
  return <div className={classnames(styles.operationalDataBar, className)}>operationalDataBar</div>;
});
