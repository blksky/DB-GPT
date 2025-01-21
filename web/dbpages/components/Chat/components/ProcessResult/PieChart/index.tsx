import { EnumSqlFlowType, IFlowData } from '@/dbpages/components/SqlFlow/ModelType';
import type { ECharts } from 'echarts';
import * as echarts from 'echarts';
import { Resizable } from 're-resizable';
import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_CHART_HEIGHT } from '../ModelType';

type PieChartProps = {
  isExpertMode?: boolean;
  flowType: EnumSqlFlowType;
  flowData?: IFlowData;
  srStepId: any;
};

const PieChart: React.FC<PieChartProps> = ({ flowData, srStepId }) => {
  const chartRef = useRef<any>();
  const [instance, setInstance] = useState<ECharts>();

  const resultStep = flowData?.step_list.find(d => d.step_id === srStepId);
  const show_columns = resultStep?.result?.predicted_show_columns || [];
  const predicted_result = resultStep?.result?.predicted_result || [];

  const renderChart = () => {
    let instanceObj: any;
    if (!instance) {
      instanceObj = echarts.init(chartRef.current);
      setInstance(instanceObj);
    } else {
      instanceObj = instance;
      instanceObj.clear();
    }

    const options: any = {
      legend: {
        left: 0,
        top: 0,
        icon: 'rect',
        itemWidth: 15,
        itemHeight: 5,
        type: 'scroll',
      },
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '1%',
        right: '4%',
        bottom: '3%',
        top: 20,
        containLabel: true,
      },
      series: [
        {
          type: 'pie',
          name: '',
          data: predicted_result.map((d: any) => ({ name: d[0], value: d[1] })),
        },
      ],
    };
    instanceObj.setOption(options);
    instanceObj.resize();
  };

  useEffect(() => {
    if ((resultStep && show_columns?.length) || predicted_result?.length) {
      renderChart();
    }
  }, []);

  return (
    <Resizable
      enable={{ bottom: true }}
      defaultSize={{ height: DEFAULT_CHART_HEIGHT }}
      handleClasses={{ bottom: 'process-resize-handle' }}
      onResize={() => setTimeout(() => instance?.resize(), 100)}
    >
      <div className='process-result-chat' ref={chartRef} />
    </Resizable>
  );
};

export default PieChart;
