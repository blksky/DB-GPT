import Iconfont from '@/dbpages/components/Iconfont';
import SqlFlow from '@/dbpages/components/SqlFlow';
import {
  EnumChaseNodeStep,
  EnumNodeStep,
  EnumNodeStepSimple,
  EnumSqlFlowType,
  EnumStepStatus,
  IFlowData,
  INodeData,
  IStepData,
} from '@/dbpages/components/SqlFlow/ModelType';
import ChaseSqlData from '@/dbpages/components/SqlFlow/data/ChaseSqlData';
import ChessSqlData from '@/dbpages/components/SqlFlow/data/ChessSqlData';
import ESqlData from '@/dbpages/components/SqlFlow/data/ESqlData';
import ESqlDataSimple from '@/dbpages/components/SqlFlow/data/ESqlDataSimple';
import TextToSqlData from '@/dbpages/components/SqlFlow/data/TextToSqlData';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Flex, Tabs, Tooltip } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { Resizable } from 're-resizable';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Constants } from '../../helper/Constants';
import { ChatProcess } from '../ProcessFlow/ChatProcess';
import PipelineLog from './PipelineLog';
import { PipelineJSON, PipelineS6Table, PipelineS8Table, PipelineTable } from './PipelineResult';
import PipelineTemplate from './PipelineTemplate';

import './index.less';

type PipelineProps = {
  isExpertMode?: boolean;
  flowType: EnumSqlFlowType;
  flowData?: IFlowData;
};

const Pipeline: React.FC<PipelineProps> = ({ flowType, flowData, isExpertMode }) => {
  const [showPipeline, setShowPipeline] = useState<boolean>(true);
  const [nodeList, setNodeList] = useState<INodeData[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>();
  const refSqlFlow = useRef<any>();
  const refNodeList = useRef<INodeData[]>(nodeList);
  const refActiveNodeId = useRef<string | undefined>(activeNodeId);

  const updateNodeList = (data: INodeData[]) => {
    refNodeList.current = data;
    setNodeList(refNodeList.current);
  };

  const updateActiveNodeId = (nodeId: string | undefined) => {
    refActiveNodeId.current = nodeId;
    setActiveNodeId(refActiveNodeId.current);
  };

  useEffect(() => {
    refNodeList.current.map(d => d.id);

    flowData?.step_list.filter(d => d.step_id);
  }, [flowData]);

  const unableClickNodeList = useMemo(() => {
    if (flowType === EnumSqlFlowType['E-SQL']) {
      return ['group-node-1'];
    } else if (flowType === EnumSqlFlowType['CHASE-SQL']) {
      return [EnumChaseNodeStep.S5_candidate_generation];
    } else if (flowType === EnumSqlFlowType['CHESS-SQL']) {
      return ['group-node-1', 'group-node-2', 'group-node-3'];
    }
    return [];
  }, [flowType]);

  const handleNodeClick = (node: INodeData) => {
    if (unableClickNodeList.includes(node.id)) {
      return;
    }
    const list = refNodeList.current;
    updateActiveNodeId(node.id);
    if (!list.some(d => d.id === node.id)) {
      updateNodeList([...list, node]);
    }
  };

  const handleNodeRemove = (e: any, node: INodeData) => {
    e.preventDefault?.();
    e.stopPropagation?.();
    const nextList = refNodeList.current.filter(d => d.id !== node.id);
    updateActiveNodeId(nextList[0]?.id);
    updateNodeList([...nextList]);
  };

  const handleRemoveAll = () => {
    updateActiveNodeId(undefined);
    updateNodeList([]);
  };

  let schemaData: any;
  let defaultHeight = isExpertMode ? 300 : 80;
  if (flowType === EnumSqlFlowType['Text-to-SQL']) {
    schemaData = TextToSqlData;
  } else if (flowType === EnumSqlFlowType['CHESS-SQL']) {
    schemaData = ChessSqlData;
    defaultHeight = 400;
  } else if (flowType === EnumSqlFlowType['CHASE-SQL']) {
    schemaData = ChaseSqlData;
    defaultHeight = 300;
  } else {
    if (isExpertMode) {
      schemaData = ESqlData;
    } else {
      schemaData = ESqlDataSimple;
    }
  }

  let sqlFlowData: IFlowData | undefined = flowData;
  if (flowData && !isExpertMode && flowType === EnumSqlFlowType['E-SQL']) {
    const getStepData = (step_id: EnumNodeStepSimple): IStepData => {
      const relatedSteps = flowData.step_list.filter(d => step_id.split('&').includes(d.step_id));
      const logList = relatedSteps.map(d => d.log).filter(d => !!d?.length);
      const stepData: IStepData = {
        step_id,
        code: 0,
        start_time: '',
        end_time: '',
        log: logList.join('\n'),
        status: EnumStepStatus.initial,
        result: {},
      };
      relatedSteps.forEach(d => {
        stepData.start_time = !stepData.start_time
          ? d.start_time
          : dayjs(stepData.start_time).isBefore(d.start_time)
            ? stepData.start_time
            : d.start_time;

        stepData.end_time = !stepData.end_time
          ? d.end_time
          : dayjs(stepData.end_time).isAfter(d.end_time)
            ? stepData.end_time
            : d.end_time;
        if (d.result) {
          const template_file = d.result?.template_file || stepData.result?.template_file;
          stepData.result = {
            ...d.result,
            template_file,
          };
        }
      });
      const errorStep = relatedSteps.find(d => d.status === EnumStepStatus.failed);
      if (errorStep) {
        stepData.error = errorStep.error;
      } else {
        stepData.error = '';
      }
      if (
        relatedSteps.some(d => d.status === EnumStepStatus.running) ||
        (relatedSteps.some(d => d.status === EnumStepStatus.success || d.status === EnumStepStatus.failed) &&
          relatedSteps.some(d => !d.status || d.status === EnumStepStatus.initial))
      ) {
        stepData.status = EnumStepStatus.running;
      } else if (relatedSteps.some(d => d.status === EnumStepStatus.failed)) {
        stepData.status = EnumStepStatus.failed;
      } else if (relatedSteps.every(d => d.status === EnumStepStatus.success)) {
        stepData.status = EnumStepStatus.success;
      }
      return stepData;
    };
    sqlFlowData = {
      ...flowData,
      step_list: [
        getStepData(EnumNodeStepSimple.意图及数据解析),
        getStepData(EnumNodeStepSimple.候选SQL生成),
        getStepData(EnumNodeStepSimple.SQL优化),
        getStepData(EnumNodeStepSimple.最终SQL生成),
      ],
    };
  }

  const nodeTabs = useMemo(() => {
    if (!refNodeList.current.length) return null;
    const tabProps = {
      className: 'pipeline-flow-tab',
      activeKey: refActiveNodeId.current,
      onChange: (activeKey: string) => {
        updateActiveNodeId(activeKey);
        refSqlFlow.current.selectNode(activeKey);
      },
      tabBarExtraContent: refNodeList.current.length > 0 && <Button onClick={handleRemoveAll}>关闭全部</Button>,
      items: refNodeList.current.map(d => {
        const stepData = sqlFlowData?.step_list.find(s => s.step_id === d.id);
        if (d.id === EnumNodeStep['Candidate SQL Generation']) {
          console.log('d.stepData?.result', stepData?.result);
        }
        const subTabProps: any = {
          type: 'card',
          tabPosition: 'left',
          className: 'pipeline-flow-sub-tab',
          items: [
            {
              key: 'result',
              label: 'result',
              children: <PipelineJSON result={stepData?.result} />,
            },
            { key: 'log', label: 'log', children: <PipelineLog log={stepData?.log} /> },
          ],
        };
        if (stepData?.result?.template_file) {
          subTabProps.items.push({
            key: 'template',
            label: 'template',
            children: <PipelineTemplate template={stepData?.result?.template_file} />,
          });
        }
        if (
          stepData?.step_id &&
          [
            EnumChaseNodeStep.S5_candidate_generation_DC,
            EnumChaseNodeStep.S5_candidate_generation_QP,
            EnumChaseNodeStep.S5_candidate_generation_OS,
          ].includes(stepData.step_id as any)
        ) {
          subTabProps.items.unshift({
            key: 'table',
            label: 'detail',
            children: <PipelineTable result={stepData?.result} />,
          });
        } else if (
          stepData?.step_id &&
          [
            EnumChaseNodeStep.S6_query_fixer_DC,
            EnumChaseNodeStep.S6_query_fixer_QP,
            EnumChaseNodeStep.S6_query_fixer_OS,
          ].includes(stepData.step_id as any)
        ) {
          subTabProps.items.unshift({
            key: 'table',
            label: 'detail',
            children: <PipelineS6Table result={stepData?.result} />,
          });
        } else if (stepData?.step_id && [EnumChaseNodeStep.S8_candidate_selection].includes(stepData.step_id as any)) {
          subTabProps.items.unshift({
            key: 'table',
            label: 'detail',
            children: <PipelineS8Table result={stepData?.result?.highest_candidates} />,
          });
        }
        return {
          key: d.id,
          label: (
            <Flex gap={5} align='center'>
              <div>{d.label}</div>
              <CloseOutlined onClick={e => handleNodeRemove(e, d)} />
            </Flex>
          ),
          children: <Tabs {...subTabProps} />,
        };
      }),
    };
    return (
      // <Resizable
      //   // defaultSize={{ height: 300 }}
      //   enable={{ bottom: true }}
      //   handleClasses={{ bottom: 'pipeline-resize-handle' }}
      // >
      <Tabs {...tabProps} />
      // </Resizable>
    );
  }, [refActiveNodeId.current, refNodeList.current, flowData]);

  const titleExtraRender = () => {
    return (
      <Flex gap={10} align='center' className='sql-type-list'>
        <Tooltip color={Constants.TOOLTIP_COLOR} title={showPipeline ? '收起' : '展开'}>
          <div
            className={classNames('pipeline-item', { active: showPipeline })}
            onClick={() => setShowPipeline(!showPipeline)}
          >
            <div className='pipeline-item-arrow'>
              <Iconfont code='&#xe641;' />
            </div>
          </div>
        </Tooltip>
      </Flex>
    );
  };

  const contentRender = () => {
    return (
      <Flex vertical={true} className={classNames('pipeline-flow-container', { active: showPipeline })}>
        <Resizable
          defaultSize={{ height: defaultHeight }}
          enable={{ bottom: true }}
          onResize={() => {
            setTimeout(() => {
              refSqlFlow.current?.resize();
            }, 100);
          }}
          handleClasses={{ bottom: 'pipeline-resize-handle' }}
        >
          <SqlFlow ref={refSqlFlow} flowData={sqlFlowData} schemaData={schemaData} onNodeClick={handleNodeClick} />
        </Resizable>
        {nodeTabs}
      </Flex>
    );
  };

  return (
    <ChatProcess
      title='Pipeline'
      loadingShowContent={true}
      contentRender={contentRender}
      titleExtraRender={titleExtraRender}
      loading={sqlFlowData?.status === EnumStepStatus.running}
    />
  );
};

export default Pipeline;
