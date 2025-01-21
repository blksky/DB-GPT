import { EnumSqlFlowType, IFlowData } from '@/dbpages/components/SqlFlow/ModelType';
import { Table } from 'antd';
import './index.less';

type TableViewProps = {
  isExpertMode?: boolean;
  flowType: EnumSqlFlowType;
  flowData?: IFlowData;
  srStepId: any;
};

const TableView: React.FC<TableViewProps> = ({ flowData, srStepId }) => {
  const resultStep = flowData?.step_list.find(d => d.step_id === srStepId);
  const show_columns = resultStep?.result?.predicted_show_columns || [];
  const predicted_result = resultStep?.result?.predicted_result || [];
  if (!resultStep || !show_columns?.length) return null;
  const tableColumns: any[] = show_columns.map((d: any) => ({
    key: d,
    title: d,
    dataIndex: d,
  }));

  const dataSource: any[] = predicted_result.map((d: any) => {
    const dataItem = {};
    tableColumns.forEach((c, cIndex) => {
      dataItem[c.key] = d[cIndex];
    });
    return dataItem;
  });

  return (
    <Table
      pagination={false}
      columns={tableColumns}
      dataSource={dataSource}
      className='process-result-table'
      scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
    />
  );
};

export default TableView;
