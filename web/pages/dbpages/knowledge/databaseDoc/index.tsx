import ICON_WORD from '@/dbpages/assets/img/icons_Word.png';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Flex } from 'antd';
import { useEffect, useRef } from 'react';

export const waitTimePromise = async (time: number = 100) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};

const queryDatabaseDoc = async (current: number, pageSize: number) => {
  return new Promise(resolve => {
    const total = 30;
    const data: any = [];
    for (let i = 0; i < total; i += 1) {
      data.push({
        id: i + 1,
        index: i + 1,
        docName: `库表描述文档${i + 1}.docx`,
        databaseName: 'graph_platform',
        tableName: 't_platform_user',
        username: `上传人${i + 1}`,
        uploadTime: '2024-09-16',
      });
    }
    resolve({
      success: true,
      page: current,
      total: data.length,
      data: data.slice((current - 1) * pageSize, current * pageSize),
    });
  });
};

type IDatabaseDocProps = {
  dbSchemaInfo?: {
    tableName?: string;
    dataSourceId: number;
    dataSourceName: string;
    dataSchemaName: string;
  };
};

function DatabaseDocIndex(props: IDatabaseDocProps) {
  useEffect(() => {}, []);

  const actionRef = useRef<ActionType>();
  const tableOpt: any = {
    columns: [
      {
        dataIndex: 'index',
        valueType: 'index',
        width: 48,
      },
      {
        title: '文档名称',
        dataIndex: 'docName',
        ellipsis: true,
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        },
        render: (docName: string) => (
          <Flex align='center' gap={4}>
            <img src={ICON_WORD as any} style={{ width: 16 }} />
            <span>{docName}</span>
          </Flex>
        ),
      },
      {
        title: '文档关联库名称',
        dataIndex: 'databaseName',
        ellipsis: true,
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        },
      },
      {
        title: '文档关联表名称',
        dataIndex: 'tableName',
        ellipsis: true,
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        },
      },
      {
        title: '上传人',
        dataIndex: 'username',
        ellipsis: true,
        hideInSearch: true,
      },
      {
        title: '上传时间',
        dataIndex: 'uploadTime',
        hideInSearch: true,
        search: {
          transform: value => {
            return {
              startTime: value[0],
              endTime: value[1],
            };
          },
        },
      },
    ],
    actionRef,
    rowKey: 'id',
    cardBordered: true,
    scroll: { y: 'calc(100vh - 276px)' },
    search: { labelWidth: 'auto', span: 5 },
    editable: { type: 'multiple' },
    columnsState: {
      persistenceKey: 'pro-table-singe-demos',
      persistenceType: 'localStorage',
      defaultValue: {
        option: { fixed: 'right', disable: true },
      },
      onChange(value) {
        console.log('value: ', value);
      },
    },
    options: {
      setting: {
        listsHeight: 400,
      },
    },
    pagination: {
      pageSize: props.dbSchemaInfo ? 10 : 20,
      onChange: page => console.log(page),
    },
    dateFormatter: 'string',
    toolbar: { settings: [] },
    toolBarRender: () => [
      <Button key='button' type='primary' icon={<PlusOutlined />} onClick={() => actionRef.current?.reload()}>
        上传文档
      </Button>,
    ],
  };

  return (
    <ProTable
      {...tableOpt}
      request={async (params, sort, filter) => {
        console.log(sort, filter);
        await waitTime(100);
        return queryDatabaseDoc(params.current, params.pageSize);
      }}
      form={{
        // 由于配置了 transform，提交的参数与定义的不同这里需要转化一下
        syncToUrl: (values, type) => {
          if (type === 'get') {
            return {
              ...values,
              created_at: [values.startTime, values.endTime],
            };
          }
          return values;
        },
      }}
    />
  );
}

export default DatabaseDocIndex;
