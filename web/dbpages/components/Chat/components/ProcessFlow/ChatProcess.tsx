import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import LoadingIcon from '../../icons/three-dots.svg';
// import ICON_READY from '../../images/icons_ready.svg?url';
import styles from './ChatProcess.module.less';

type ChatProcessProps = {
  title?: string;
  loading?: boolean;
  loadingText?: string;
  loadingShowContent?: boolean;
  timeCost?: number;
  errorMsg?: string;
  isDeveloper?: boolean;
  contentIsNull?: boolean;
  contentRender?: ReactNode | (() => ReactNode | null);
  titleExtraRender?: ReactNode | (() => ReactNode | null);
};

export const prefixCls = `ss-chat-item`;

export const getNode = (tipTitle: ReactNode, tipNode?: ReactNode, failed?: boolean, loading?: boolean) => {
  // let tipIcon = <img alt="" className={`${prefixCls}-step-icon`} src={ICON_READY} />;
  let tipIcon = <CheckCircleFilled className={styles[`${prefixCls}-step-success-icon`]} />;
  if (loading) {
    tipIcon = <LoadingOutlined className={styles[`${prefixCls}-step-loading-icon`]} />;
  } else if (failed) {
    tipIcon = <CloseCircleFilled className={styles[`${prefixCls}-step-error-icon`]} />;
  }

  return (
    <div className={styles[`${prefixCls}-parse-tip`]}>
      <div className={styles[`${prefixCls}-title-bar`]}>
        {tipIcon}
        <div className={styles[`${prefixCls}-step-title`]}>
          {tipTitle}
          {tipNode === undefined && <LoadingIcon className='markdown-body-loading' />}
        </div>
      </div>
      {(tipNode || tipNode === null) && (
        <div
          className={classNames(
            styles[`${prefixCls}-content-container`],
            tipNode === null && styles[`${prefixCls}-empty-content-container`],
            failed && styles[`${prefixCls}-content-container-failed`],
          )}
        >
          {tipNode}
        </div>
      )}
    </div>
  );
};

export const ChatProcess: React.FC<ChatProcessProps> = ({
  title,
  loading,
  loadingText,
  loadingShowContent = false,
  timeCost,
  errorMsg,
  isDeveloper,
  contentIsNull,
  contentRender,
  titleExtraRender,
}) => {
  const prefixCls = `ss-chat-item`;

  if (loading && !loadingShowContent) {
    return getNode(loadingText, null, false, true);
  }

  if (errorMsg) {
    return getNode(
      <>
        {title}生成失败
        {timeCost && isDeveloper && <span className={styles[`${prefixCls}-title-tip`]}>(耗时: {timeCost}ms)</span>}
      </>,
      errorMsg,
      true,
    );
  }

  if (contentIsNull) return null;

  const content = typeof contentRender === 'function' ? contentRender?.() : contentRender;
  const titleExtra = typeof titleExtraRender === 'function' ? titleExtraRender?.() : titleExtraRender;

  return getNode(
    <div className={styles[`${prefixCls}-title-bar`]}>
      <div>
        {title}
        {timeCost && isDeveloper && <span className={styles[`${prefixCls}-title-tip`]}>(耗时: {timeCost}ms)</span>}
        {titleExtra ? '：' : ''}
      </div>
      {titleExtra}
    </div>,
    content,
    false,
    loading,
  );
};
