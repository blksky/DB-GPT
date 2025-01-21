import Loading from '@/dbpages/components/Loading/Loading';
import classnames from 'classnames';
import { memo } from 'react';
import styles from './index.module.less';

interface IProps {
  className?: string;
}

export default memo<IProps>(function LazyLoading({ className }) {
  return (
    <div className={classnames(className, styles.box)}>
      <Loading></Loading>
    </div>
  );
});
