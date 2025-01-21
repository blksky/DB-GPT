import { DEFAULT_PAGE_INDEX } from '@/dbpages/common/constants';
import GoldSqlModify from '@/dbpages/components/Chat/components/Feedback/GoldSqlModify';
import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import { getDateYmdHms } from '@/dbpages/helper/DateTimeHelper';
import Search from '@/pages/dbpages/knowledge/goldSql/Search';
import { fetchDeleteGoldSql, fetchPageQueryGoldSql, useGoldSqlStore } from '@/dbpages/store/goldSql';
import { IGoldSql } from '@/dbpages/typings/goldSql';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Popconfirm, Table, Typography } from 'antd';
import { useEffect, useRef } from 'react';

// const queryGoldenSql = async (params: any) => {
//   const { current: pageIndex = DEFAULT_PAGE_INDEX, pageSize = DEFAULT_PAGE_SIZE } = params;
//   const data = await fetchPageQueryGoldSql({ pageIndex, pageSize });
//   return {
//     success: true,
//     page: pageIndex,
//     data: data.content?.data || [],
//     total: data.content?.totalCount || 0,
//   };
// };

type IGoldSqlListProps = {
  dbSchemaInfo?: {
    tableName?: string;
    dataSourceId: number;
    dataSourceName: string;
    dataSchemaName: string;
  };
};

function GoldenSqlIndex(props: IGoldSqlListProps) {
  const modifyDialogRef = useRef<any>(null);
  const { pageData } = useGoldSqlStore();
  const { pagination } = pageData;

  const refreshData = async (
    pageIndex = pagination.current,
    pageSize = pagination.pageSize,
    condition = pageData.condition,
  ) => {
    const { dbSchemaInfo } = props;
    fetchPageQueryGoldSql({ pageIndex, pageSize, condition, dbSchemaInfo });
  };

  const modifyDialogProps: any = {
    dbSchemaInfo: props.dbSchemaInfo,
    buttonRender: () => null,
    onSuccess: () => refreshData(),
  };

  useEffect(() => {
    refreshData(DEFAULT_PAGE_INDEX);
  }, [props.dbSchemaInfo?.tableName, props.dbSchemaInfo?.dataSourceName, props.dbSchemaInfo?.dataSchemaName]);

  const columns = [
    {
      dataIndex: 'index',
      valueType: 'index',
      width: 48,
      render: (_: any, __: IGoldSql, index: number) => index + 1 + (pagination.current - 1) * pagination.pageSize,
    },
    {
      title: '问题',
      dataIndex: 'question',
      render: (text: string) => (
        <Typography.Text ellipsis={{ tooltip: { color: Constants.TOOLTIP_COLOR } }}>{text}</Typography.Text>
      ),
    },
    {
      title: 'SQL',
      dataIndex: 'sql',
      render: (text: string) => (
        <Typography.Text ellipsis={{ tooltip: { color: Constants.TOOLTIP_COLOR } }}>{text}</Typography.Text>
      ),
    },
    {
      title: '数据链接',
      dataIndex: 'db_id',
      width: 150,
    },
    {
      title: '更新人',
      dataIndex: 'updated_user',
      width: 100,
      render: (updated_user: any, record: IGoldSql) => updated_user || record.created_user,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_time',
      width: 145,
      render: (text: string) => getDateYmdHms(text),
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      valueType: 'option',
      render: (_: any, record: IGoldSql) => (
        <Flex align='center' gap={8}>
          <Typography.Link key='edit' onClick={() => modifyDialogRef.current.showModal({ ...record })}>
            编辑
          </Typography.Link>
          <Popconfirm
            key='delete'
            title='删除Gold SQL确认'
            description='确定要删除此Gold SQL吗?'
            onConfirm={() => {
              fetchDeleteGoldSql({ id: record.id as number }).then(() => refreshData());
            }}
          >
            <Typography.Link key='delete'>删除</Typography.Link>
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  const handlePageChange = async (current: number) => refreshData(current);

  const tableOpt: any = {
    columns,
    rowKey: 'id',
    loading: pageData.loading,
    dataSource: pageData.list,
    className: 'common-table',
    scroll: { y: 'calc(100vh - 276px)' },
    pagination: {
      ...pagination,
      onChange: handlePageChange,
    },
    title: () => (
      <Flex justify='flex-end'>
        <Button
          key='button'
          type='primary'
          icon={<PlusOutlined />}
          onClick={() =>
            modifyDialogRef.current.showModal({
              id: 0,
              db_id: props.dbSchemaInfo?.dataSourceName,
              schema_name: props.dbSchemaInfo?.dataSchemaName,
            })
          }
        >
          创建Gold SQL
        </Button>
      </Flex>
    ),
  };

  const searchOpt: any = {
    dbSchemaInfo: props.dbSchemaInfo,
    onSearch: async (condition: Record<string, any>) => {
      await refreshData(DEFAULT_PAGE_INDEX, pagination.pageSize, condition);
    },
  };

  return (
    <Flex vertical={true} gap={12}>
      <Search {...searchOpt} />
      <Table {...tableOpt} />
      <GoldSqlModify ref={modifyDialogRef} {...modifyDialogProps} />
    </Flex>
  );
}

export default GoldenSqlIndex;
