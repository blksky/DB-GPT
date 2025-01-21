import Iconfont from '@/dbpages/components/Iconfont';
import { Spin } from 'antd';
import classnames from 'classnames';
import React, { memo } from 'react';
import styles from './index.module.less';

interface IProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  className?: string;
  loading: boolean;
}

export default memo<IProps>(props => {
  const { className, loading, ...res } = props;
  return (
    <div {...res} className={classnames(styles.box, className)}>
      {loading && <Spin size='small' />}
      {!loading && <Iconfont code='&#xec08;' />}
    </div>
  );
});
