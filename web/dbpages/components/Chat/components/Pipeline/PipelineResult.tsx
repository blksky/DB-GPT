// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

// @ts-ignore
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Collapse, Table } from 'antd';
import { FC } from 'react';
import ReactJson from 'react-json-view';
import { getFormatedSql } from '../ProcessResult/ModelType';
import styles from './PipelineResult.module.less';

type PipelineResultProps = {
  result?: any;
};

type PipelineTableProps = {
  result?: any;
  columns?: any;
  dataSource?: any;
  expandedRowRender?: any;
};

export const PipelineText: FC<PipelineResultProps> = props => {
  return (
    <SyntaxHighlighter className={styles['pipeline-result-template']} language='text' style={solarizedlight}>
      {props.result}
    </SyntaxHighlighter>
  );
};

export const PipelineSQL: FC<PipelineResultProps> = props => {
  return (
    <SyntaxHighlighter className={styles['pipeline-result-sql']} language='sql' style={solarizedlight}>
      {getFormatedSql(props.result)}
    </SyntaxHighlighter>
  );
};

export const PipelineJSON: FC<PipelineResultProps> = props => {
  return (
    <div className={styles['pipeline-result-json']}>
      <ReactJson src={props.result} displayDataTypes={false} enableClipboard={false} />
    </div>
  );
};

export const PipelineTable: FC<PipelineTableProps> = props => {
  if (!props.result) return null;
  const columns = props.columns || [
    { title: '序号', width: 60, dataIndex: 'id' },
    { title: 'SQL', dataIndex: 'sql' },
  ];
  const dataSource =
    props.dataSource ||
    props.result.map((d: any, i: any) => ({
      ...d,
      id: i + 1,
      sql: d.sql,
    }));
  let expandedRowRender = props.expandedRowRender;
  if (!expandedRowRender) {
    expandedRowRender = (record: any) => {
      const items = [
        {
          key: '1',
          label: 'SQL详情',
          children: <PipelineSQL result={record.sql} />,
        },
        {
          key: '2',
          label: '提示词',
          children: <PipelineText result={record.prompt} />,
        },
        {
          key: '3',
          label: '模型输出',
          children: <PipelineText result={record.content} />,
        },
      ];
      return <Collapse defaultActiveKey={['1']} ghost items={items} />;
    };
  }

  const tableOpt: any = {
    columns,
    dataSource,
    rowKey: 'id',
    pagination: false,
    tableLayout: 'fixed',
    expandable: {
      expandedRowRender,
      expandRowByClick: true,
    },
  };
  return (
    <div className={styles['pipeline-result-table']}>
      <Table {...tableOpt} />
    </div>
  );
};

export const PipelineS6Table: FC<PipelineResultProps> = props => {
  if (!props.result) return null;
  const tableOpt: any = {
    ...props,
    columns: [
      { title: '序号', width: 60, dataIndex: 'id' },
      { title: 'SQL', dataIndex: 'sql' },
      { title: '错误', dataIndex: 'err', render: (content: any) => content || '--' },
    ],
    expandedRowRender: (record: any) => {
      const items = [
        {
          key: '1',
          label: 'SQL详情',
          children: <PipelineSQL result={record.sql} />,
        },
        {
          key: '2',
          label: 'SQL结果',
          children: <PipelineJSON result={record.data} />,
        },
        {
          key: '3',
          label: '提示词',
          children: <PipelineText result={record.prompt} />,
        },
        {
          key: '4',
          label: '模型输出',
          children: <PipelineText result={record.content} />,
        },
      ];
      return <Collapse defaultActiveKey={['1']} ghost items={items} />;
    },
  };
  return <PipelineTable {...tableOpt} />;
};

export const PipelineS8Table: FC<PipelineResultProps> = props => {
  if (!props.result) return null;
  const tableOpt: any = {
    ...props,
    columns: [
      { title: '序号', width: 60, dataIndex: 'id' },
      { title: '得分', width: 100, dataIndex: 'score' },
      { title: 'SQL', dataIndex: 'sql' },
      { title: '错误', dataIndex: 'err', render: (content: any) => content || '--' },
    ],
    expandedRowRender: (record: any) => {
      const items = [
        {
          key: '1',
          label: 'SQL详情',
          children: <PipelineSQL result={record.sql} />,
        },
        {
          key: '2',
          label: 'SQL结果',
          children: <PipelineJSON result={record.data} />,
        },
        {
          key: '3',
          label: '提示词',
          children: <PipelineText result={record.prompt} />,
        },
        {
          key: '4',
          label: '模型输出',
          children: <PipelineText result={record.content} />,
        },
      ];
      return <Collapse defaultActiveKey={['1']} ghost items={items} />;
    },
  };
  return <PipelineTable {...tableOpt} />;
};
