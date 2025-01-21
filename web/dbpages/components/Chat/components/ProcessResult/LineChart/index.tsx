import { EnumSqlFlowType, IFlowData } from '@/dbpages/components/SqlFlow/ModelType';
import type { ECharts } from 'echarts';
import * as echarts from 'echarts';
import { Resizable } from 're-resizable';
import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_CHART_HEIGHT, EnumResultShowType, THEME_COLOR_LIST } from '../ModelType';

type LineChartProps = {
  isExpertMode?: boolean;
  flowType: EnumSqlFlowType;
  flowData?: IFlowData;
  chartType: EnumResultShowType;
  srStepId: any;
};

const LineChart: React.FC<LineChartProps> = ({ chartType, flowData, srStepId }) => {
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
      type: chartType,
      name: '',
      symbol: 'circle',
      smooth: true,
      showSymbol: true,
      color: THEME_COLOR_LIST[0],
      data: predicted_result.map((d: any) => d[1]),
    };

    if (chartType === EnumResultShowType.AREA_CHART) {
      seriesData.type = EnumResultShowType.LINE_CHART;
      seriesData.areaStyle = {};
    } else if (chartType === EnumResultShowType.DOT_CHART) {
      seriesData.symbolSize = 10;
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
      xAxis: {
        type: 'category',
        axisTick: {
          alignWithLabel: true,
          // lineStyle: {
          //   color: CHART_SECONDARY_COLOR,
          // },
        },
        // axisLine: {
        //   lineStyle: {
        //     color: CHART_SECONDARY_COLOR,
        //   },
        // },
        axisLabel: {
          showMaxLabel: true,
          color: '#999',
        },
        data: predicted_result.map((d: any) => d[0]),
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            opacity: 0.3,
          },
        },
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
      series: [seriesData],
    };
    instanceObj.setOption(options);
    instanceObj.resize();
  };

  useEffect(() => {
    if ((resultStep && show_columns?.length) || predicted_result?.length) {
      renderChart();
    }
  }, [chartType]);

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

export default LineChart;
