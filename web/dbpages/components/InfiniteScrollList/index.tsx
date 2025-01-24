import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import { localeMsg } from '@/dbpages/helper/LocaleHelper';
import { LoadingOutlined } from '@ant-design/icons';
import { List, Pagination, Space } from 'antd';
import type { PaginationConfig } from 'antd/es/pagination/Pagination';
import classNames from 'classnames';
import { FC, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

// @ts-ignore
import ICONS_EMPTY from '@/dbpages/images/icons_empty.svg?url';

type InfiniteScrollListProps = {
  list: any[];
  loading: boolean;
  hideLoader?: boolean;
  emptyText?: string;
  className?: string;
  loaderClassName?: string;
  scrollProps?: any;
  scrollableTarget?: string | null;
  pagination?: PaginationConfig;
  paginationProps?: any;
  locale?: any;
  getListProps: (skeleton: boolean) => any;
  getDataSource?: (skeleton: boolean) => any[];
  getHasMore?: (total: number, current: number, pageSize: number) => boolean;
  showPager?: boolean;
  onLoadMore?: () => Promise<any> | undefined;
  onPageChange?: (pageIndex: number, pageSize: number) => Promise<any> | undefined;
};

const InfiniteScrollList: FC<InfiniteScrollListProps> = props => {
  const {
    list,
    loading,
    hideLoader,
    pagination,
    locale,
    getHasMore,
    getListProps,
    loaderClassName,
    emptyText = localeMsg('page.data.empty'),
    scrollableTarget,
  } = props;

  const refContainer = useRef<any>();

  const handleLoadMore = () => {
    console.log('handleLoadMore');
    if (loading) {
      return;
    }
    props.onLoadMore?.();
  };

  const dataLen = list.length;
  const {
    total = 0,
    current = Constants.DEFAULT_PAGE_INDEX,
    pageSize = Constants.DEFAULT_PAGE_SIZE,
  } = pagination || {};
  let hasMore: boolean;
  if (getHasMore) {
    hasMore = getHasMore(total, current, pageSize);
  } else if (props.showPager) {
    hasMore =
      dataLen > 0 &&
      dataLen < total &&
      dataLen < Constants.DEFAULT_SEARCH_PAGE_SIZE &&
      current <= Constants.DEFAULT_PAGE_INDEX;
  } else {
    hasMore = dataLen > 0 && dataLen < total;
  }
  const skeleton = !dataLen;
  const dataSource = props.getDataSource?.(skeleton) || list;
  const wrapperStyle: any = {};
  const isEmpty = !dataSource.length;
  const { height, ...scrollProps } = props.scrollProps || {};
  if (height) {
    wrapperStyle.height = height;
    wrapperStyle.overflow = 'auto';
  }
  const listOpts: any = {
    dataSource,
    split: false,
    pagination: false,
    itemLayout: 'vertical',
    loading: { spinning: loading && isEmpty, delay: Constants.LOADING_DELAY },
    locale: {
      emptyText: locale || (
        <Space direction='vertical'>
          <img alt='' src={ICONS_EMPTY} />
          <span>{emptyText}</span>
        </Space>
      ),
    },
    ...getListProps(skeleton),
  };

  const content = refContainer.current && (
    <>
      <InfiniteScroll
        next={handleLoadMore}
        hasMore={hasMore}
        dataLength={dataLen}
        scrollableTarget={scrollableTarget || refContainer.current}
        loader={
          hideLoader ? (
            ''
          ) : (
            <div className={classNames('kg-list-skeleton-more', loaderClassName)}>
              <Space>
                <LoadingOutlined />
                {localeMsg('pages.loading')}
              </Space>
            </div>
          )
        }
        {...(scrollProps || {})}
      >
        <List {...listOpts} />
      </InfiniteScroll>
      {props.showPager && (
        <Pagination
          showSizeChanger={false}
          hideOnSinglePage={true}
          total={pagination?.total || 0}
          showTotal={pagination?.showTotal}
          current={pagination?.current || Constants.DEFAULT_PAGE_INDEX}
          pageSize={pagination?.pageSize || Constants.DEFAULT_PAGE_SIZE}
          onChange={(pageIndex: number, pageSize: number) => {
            props.onPageChange?.(pageIndex, pageSize);
          }}
          {...(props.paginationProps || {})}
        />
      )}
    </>
  );

  return (
    <div
      ref={refContainer}
      style={wrapperStyle}
      className={classNames('infinite-scroll-list-wrapper', props.className || '', {
        flexCenter: isEmpty && height,
      })}
    >
      {content}
    </div>
  );
};

export default InfiniteScrollList;
