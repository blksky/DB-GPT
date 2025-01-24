import {
  EnumChaseNodeStep,
  EnumNodeStep,
  EnumSqlFlowType,
  EnumStepStatus,
  IFlowData,
} from '@/dbpages/components/SqlFlow/ModelType';
import {
  AreaChartOutlined,
  BarChartOutlined,
  DotChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Segmented } from 'antd';
import React, { useState } from 'react';
import { ChatProcess } from '../ProcessFlow/ChatProcess';
import LineChart from './LineChart';
import { EnumResultShowType } from './ModelType';
import PieChart from './PieChart';
import RadarChart from './RadarChart';
import TableView from './TableView';

import styles from './index.module.less';

type ProcessResultProps = {
  isExpertMode?: boolean;
  flowType: EnumSqlFlowType;
  flowData?: IFlowData;
};

const ProcessResult: React.FC<ProcessResultProps> = ({ flowType, flowData, isExpertMode }) => {
  const [resultShowType, setResultShowType] = useState<EnumResultShowType>(EnumResultShowType.TABLE);

  const titleExtraRender = () => {
    return (
      <Segmented
        className={styles['process-result-segmented']}
        value={resultShowType}
        onChange={setResultShowType}
        options={[
          { label: <TableOutlined />, value: EnumResultShowType.TABLE },
          { label: <LineChartOutlined />, value: EnumResultShowType.LINE_CHART },
          { label: <PieChartOutlined />, value: EnumResultShowType.PIE_CHART },
          { label: <AreaChartOutlined />, value: EnumResultShowType.AREA_CHART },
          { label: <DotChartOutlined />, value: EnumResultShowType.DOT_CHART },
          { label: <BarChartOutlined />, value: EnumResultShowType.BAR_CHART },
          { label: <RadarChartOutlined />, value: EnumResultShowType.RADAR_CHART },
        ]}
      />
    );
  };

  // const titleExtraRender_bak = () => {
  //   return (
  //     <Tabs
  //       className="process-result-tabs"
  //       activeKey={resultShowType}
  //       onChange={handleTabChange}
  //       items={[
  //         { label: <TableOutlined />, key: EnumResultShowType.TABLE },
  //         { label: <LineChartOutlined />, key: EnumResultShowType.LINE_CHART },
  //         { label: <PieChartOutlined />, key: EnumResultShowType.PIE_CHART },
  //         { label: <AreaChartOutlined />, key: EnumResultShowType.AREA_CHART },
  //         { label: <DotChartOutlined />, key: EnumResultShowType.DOT_CHART },
  //         { label: <BarChartOutlined />, key: EnumResultShowType.BAR_CHART },
  //         { label: <RadarChartOutlined />, key: EnumResultShowType.RADAR_CHART },
  //       ]}
  //     />
  //   );
  // };

  const dataOpt: any = {
    flowType,
    flowData,
    isExpertMode,
    srStepId: EnumNodeStep['Result Show'],
  };

  if (flowData?.sql_flow_type === EnumSqlFlowType['CHASE-SQL']) {
    dataOpt.srStepId = EnumChaseNodeStep.S9_final_result;
  }

  const contentRender = () => {
    if (resultShowType === EnumResultShowType.TABLE) {
      return <TableView {...dataOpt} />;
    } else if (
      [
        EnumResultShowType.LINE_CHART,
        EnumResultShowType.BAR_CHART,
        EnumResultShowType.AREA_CHART,
        EnumResultShowType.DOT_CHART,
      ].includes(resultShowType)
    ) {
      const chatOpt: any = { ...dataOpt, chartType: resultShowType };
      return <LineChart {...chatOpt} />;
    } else if (EnumResultShowType.PIE_CHART === resultShowType) {
      return <PieChart {...dataOpt} />;
    } else if (EnumResultShowType.RADAR_CHART === resultShowType) {
      return <RadarChart {...dataOpt} />;
    }
    return null;
  };
  return (
    <ChatProcess
      title='数据结果'
      contentRender={contentRender}
      titleExtraRender={titleExtraRender}
      loadingText='数据结果'
      loading={flowData?.status === EnumStepStatus.running}
    />
  );
};

export default ProcessResult;
