import { EnumSqlFlowType, IFlowData } from '@/dbpages/components/SqlFlow/ModelType';
import {
  AreaChartOutlined,
  BarChartOutlined,
  DotChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Segmented } from 'antd';
import React, { useState } from 'react';
import { ChatProcess } from '../ProcessFlow/ChatProcess';
import './index.less';

type ProcessResultProps = {
  isExpertMode?: boolean;
  flowType: EnumSqlFlowType;
  flowData?: IFlowData;
};

enum EnumResultShowType {
  TABLE = 'TABLE',
  LINE_CHART = 'LINE_CHART',
  AREA_CHART = 'AREA_CHART',
  PIE_CHART = 'PIE_CHART',
  DOT_CHART = 'DOT_CHART',
  BAR_CHART = 'BAR_CHART',
}

const ProcessResult: React.FC<ProcessResultProps> = ({ flowType, flowData, isExpertMode }) => {
  const [resultShowType, setResultShowType] = useState<EnumResultShowType>(EnumResultShowType.TABLE);

  const titleExtraRender = () => {
    return (
      <Segmented
        value={resultShowType}
        onChange={setResultShowType}
        options={[
          { label: <TableOutlined />, value: EnumResultShowType.TABLE },
          { label: <LineChartOutlined />, value: EnumResultShowType.LINE_CHART },
          { label: <PieChartOutlined />, value: EnumResultShowType.PIE_CHART },
          { label: <AreaChartOutlined />, value: EnumResultShowType.AREA_CHART },
          { label: <DotChartOutlined />, value: EnumResultShowType.DOT_CHART },
          { label: <BarChartOutlined />, value: EnumResultShowType.BAR_CHART },
        ]}
      />
    );
  };

  const contentRender = () => {
    return null;
  };
  return <ChatProcess title='数据结果' titleExtraRender={titleExtraRender} contentRender={contentRender} />;
};

export default ProcessResult;
