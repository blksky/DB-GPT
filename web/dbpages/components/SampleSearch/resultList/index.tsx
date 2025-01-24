import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import { Col, Row, Select, Space } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
import InfiniteScrollList from '../../InfiniteScrollList';
import { useSearchStore } from '../store';
import { EnumSearchActionType } from '../store/ModelType';
import { MainListItem } from './MainListItem';

// @ts-ignore
import styles from './index.module.less';

// @ts-ignore
import ICONS_EMPTY from '@/dbpages/images/icons_empty.svg?url';

const DEFAULT_SEARCH_DATA = Array.from({ length: 1 }).map(d => ({ docCode: d }));

export const ResultList = forwardRef((props, ref) => {
  const { searchData, searchCondition, checkedList, fetchSearchResult } = useSearchStore();

  const { loading, list, actionType } = searchData;
  const dataLen = list.length;
  const pagination = searchData.pagination as any;

  useImperativeHandle(ref, () => {
    return {
      checkedList,
    };
  });

  const listHeader = !!dataLen && (
    <Row className={styles['kg-search-result-before']}>
      <Col flex='auto'>搜寻到 {searchData.pagination?.total} 结果</Col>
      <Col flex='none'>
        <Select
          className={styles['kg-search-result-sort']}
          defaultValue='1'
          popupMatchSelectWidth={false}
          options={[{ value: '1', label: '按最相关性排序' }]}
        />
      </Col>
    </Row>
  );

  const infiniteScrollListOpt = {
    list,
    loading,
    pagination,
    scrollableTarget: Constants.SITE_SCROLL_ROOT,
    showPager:
      dataLen === Constants.DEFAULT_SEARCH_PAGE_SIZE ||
      actionType === EnumSearchActionType.PAGE_CHANGE ||
      pagination.current > Constants.DEFAULT_PAGE_INDEX,
    getDataSource: (skeleton: boolean) => (skeleton && loading ? DEFAULT_SEARCH_DATA : list),
    onLoadMore: () => fetchSearchResult(searchCondition, EnumSearchActionType.LOAD_MORE),
    onPageChange: (pageIndex: number, pageSize: number) => {
      return fetchSearchResult({ ...searchCondition, pageIndex, pageSize }, EnumSearchActionType.PAGE_CHANGE).then(
        () => {},
      );
    },
    getListProps: (skeleton: boolean) => {
      return {
        size: 'large',
        rowKey: 'doc_code',
        locale: {
          emptyText: (
            <Space direction='vertical'>
              <img src={ICONS_EMPTY} alt='' />
              <span>暂无数据</span>
            </Space>
          ),
        },
        renderItem: (item: any, index: number) => {
          const options = {
            item,
            skeleton,
            showCheckbox: true,
            docTextPriority: true,
            loading: searchData.loading,
            formatItem: () => {
              return {
                ...item,
                docRealName: item.doc_name,
                docName: item.doc_name,
                docAbs: '文档内容摘要XXXXXXXX',
                docText: '文档内容XXXXXXXXXX',
              };
            },
            checked: checkedList?.findIndex((c: any) => c.id === item?.id) !== -1,
            handleCheckChange: (checked: boolean, item: { id: number; space: string; doc_name: string }) => {
              let newCheckList = [...checkedList];
              if (checked) {
                newCheckList.push(item);
              } else {
                const index = newCheckList?.findIndex(n => n.id === item.id);
                newCheckList?.splice(index, 1);
              }
              useSearchStore.setState({
                checkedList: [...newCheckList],
              });
            },
          };
          return <MainListItem {...options} />;
        },
      };
    },
  };

  return (
    <div className={styles['kg-search-result-list']}>
      {listHeader}
      <InfiniteScrollList {...infiniteScrollListOpt} />
    </div>
  );
});
