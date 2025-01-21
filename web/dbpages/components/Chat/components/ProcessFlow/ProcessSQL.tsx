// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

// @ts-ignore
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// import Iconfont from '@/pages/dbpages/components/Iconfont';
import {
  EnumChaseNodeStep,
  EnumNodeStep,
  EnumSqlFlowType,
  EnumStepStatus,
  IFlowData,
} from '@/dbpages/components/SqlFlow/ModelType';
import { Flex, Tooltip } from 'antd';
import React, { useState } from 'react';
import { ChatProcess } from './ChatProcess';

import Iconfont from '@/dbpages/components/Iconfont';
import classNames from 'classnames';
import { Constants } from '../../helper/Constants';
import { getFormatedSql } from '../ProcessResult/ModelType';
import './ProcessSQL.less';

type ProcessSQLProps = {
  isExpertMode?: boolean;
  flowType: EnumSqlFlowType;
  flowData?: IFlowData;
};

enum EnumSqlType {
  few_shot = 'Few-shot示例',
  possible_sql = '候选SQL',
  predicted_sql = '最终SQL',
}

const ProcessSQL: React.FC<ProcessSQLProps> = ({ flowType, flowData }) => {
  const [showSqlType, setShowSqlType] = useState<boolean>(true);
  const [activeSqlType, setActiveSqlType] = useState<EnumSqlType | undefined>(EnumSqlType.predicted_sql);

  const handleActiveSqlType = (type?: EnumSqlType) => {
    if (!showSqlType) {
      setShowSqlType(true);
    }
    setActiveSqlType(type);
  };
  const titleExtraRender = () => {
    if (!flowData?.step_list?.length) return null;
    const itemList: any[] = [];
    let fseStepId: any = EnumNodeStep['Few-shot Examples'];
    let csgStepId: any = EnumNodeStep['Candidate SQL Generation'];
    let srStepId: any = EnumNodeStep['SQL Refinement'];

    if (flowData.sql_flow_type === EnumSqlFlowType['CHASE-SQL']) {
      fseStepId = EnumChaseNodeStep.S4_example_selection;
      srStepId = EnumChaseNodeStep.S9_final_result;
    }

    if (flowData.step_list.find(d => d.step_id === fseStepId)?.result?.few_shot_examples) {
      itemList.push(EnumSqlType.few_shot);
    }
    if (flowData.step_list.find(d => d.step_id === csgStepId)?.result?.possible_sql) {
      itemList.push(EnumSqlType.possible_sql);
    }
    if (flowData.step_list.find(d => d.step_id === srStepId)?.result?.predicted_sql) {
      itemList.push(EnumSqlType.predicted_sql);
    }

    return (
      <Flex gap={10} align='center' className='sql-type-list'>
        <Tooltip color={Constants.TOOLTIP_COLOR} title={showSqlType ? '收起' : '展开'}>
          <div
            onClick={() => setShowSqlType(!showSqlType)}
            className={classNames('sql-type-list-arrow', { active: showSqlType })}
          >
            <Iconfont code='&#xe641;' />
          </div>
        </Tooltip>

        {itemList.map(type => (
          <div
            key={type}
            className={`sql-type-item ${showSqlType && activeSqlType === type ? 'active' : ''}`}
            onClick={() => handleActiveSqlType(type)}
          >
            {type}
          </div>
        ))}
      </Flex>
    );
  };
  const contentRender = () => {
    if (!showSqlType || !activeSqlType || !flowData?.step_list?.length) return null;
    let fseStepId: any = EnumNodeStep['Few-shot Examples'];
    let csgStepId: any = EnumNodeStep['Candidate SQL Generation'];
    let srStepId: any = EnumNodeStep['SQL Refinement'];

    if (flowData.sql_flow_type === EnumSqlFlowType['CHASE-SQL']) {
      fseStepId = EnumChaseNodeStep.S4_example_selection;
      srStepId = EnumChaseNodeStep.S9_final_result;
    }

    if (activeSqlType === EnumSqlType.few_shot) {
      const stepData = flowData.step_list.find(d => d.step_id === fseStepId);
      if (stepData?.result?.few_shot_examples && typeof stepData.result.few_shot_examples === 'object') {
        return (
          <SyntaxHighlighter className='process-result-sql' language='json' style={solarizedlight}>
            {JSON.stringify(stepData.result.few_shot_examples, null, 2)}
          </SyntaxHighlighter>
        );
      }
      return (
        <SyntaxHighlighter className='process-result-sql' language='text' style={solarizedlight}>
          {stepData?.result?.few_shot_examples && stepData.result.few_shot_examples}
        </SyntaxHighlighter>
      );
    }
    if (activeSqlType === EnumSqlType.possible_sql) {
      const stepData = flowData.step_list.find(d => d.step_id === csgStepId);
      return (
        <SyntaxHighlighter className='process-result-sql' language='sqlite' style={solarizedlight}>
          {getFormatedSql(stepData?.result?.possible_sql)}
        </SyntaxHighlighter>
      );
    }
    if (activeSqlType === EnumSqlType.predicted_sql) {
      const stepData = flowData.step_list.find(d => d.step_id === srStepId);
      console.log('stepData?.result?.predicted_sql', stepData?.result?.predicted_sql);
      return (
        <SyntaxHighlighter className='process-result-sql' language='sqlite' style={solarizedlight}>
          {getFormatedSql(stepData?.result?.predicted_sql)}
        </SyntaxHighlighter>
      );
    }
    return null;
  };
  return (
    <ChatProcess
      title='SQL生成'
      contentRender={contentRender}
      titleExtraRender={titleExtraRender}
      loadingShowContent={true}
      loading={flowData?.status === EnumStepStatus.running}
    />
  );
};

export default ProcessSQL;
