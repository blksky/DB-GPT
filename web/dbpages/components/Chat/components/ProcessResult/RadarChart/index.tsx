import { EnumSqlFlowType, IFlowData } from '@/dbpages/components/SqlFlow/ModelType';
import type { ECharts } from 'echarts';
import * as echarts from 'echarts';
import { Resizable } from 're-resizable';
import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_CHART_HEIGHT, EnumResultShowType } from '../ModelType';

type RadarChartProps = {
  isExpertMode?: boolean;
  flowType: EnumSqlFlowType;
  flowData?: IFlowData;
  srStepId: any;
};

const RadarChart: React.FC<RadarChartProps> = ({ flowData, srStepId }) => {
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

    const seriesData: any = {
      type: EnumResultShowType.RADAR_CHART,
      data: show_columns.slice(1).map((c: any, i: number) => ({
        name: c,
        value: predicted_result.map((d: any) => d[i + 1]),
      })),
    };

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
        trigger: 'item',
      },
      radar: {
        indicator: show_columns.slice(1).map((d: any, i: number) => ({
          name: d,
          max: Math.max(seriesData.data[i].value),
        })),
      },
      series: [seriesData],
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

export default RadarChart;
