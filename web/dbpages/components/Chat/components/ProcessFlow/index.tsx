import { ChatMessage, ChatSession, ChatSessionBiData, EnumChatStoreType } from '@/dbpages/components/Chat/store';
import { EnumSqlFlowType, IFlowData, SqlFlowTypeName } from '@/dbpages/components/SqlFlow/ModelType';
import { Tabs } from 'antd';
import React from 'react';
import Pipeline from '../Pipeline';
import ProcessResult from '../ProcessResult';
import ProcessSQL from './ProcessSQL';

import { getChatStoreMethod } from '@/dbpages/components/Chat/store/ModelType';
import styles from './index.module.less';

type ProcessFlowProps = {
  message: ChatMessage;
  biData?: ChatSessionBiData;
  chatType?: EnumChatStoreType;
};

type ProcessFlowItemProps = {
  isExpertMode?: boolean;
  flowType: EnumSqlFlowType;
  flowData?: IFlowData;
};

const ProcessFlowItem: React.FC<ProcessFlowItemProps> = ({ flowType, flowData, isExpertMode }) => {
  return (
    <>
      <Pipeline flowType={flowType} flowData={flowData} isExpertMode={isExpertMode} />
      <ProcessSQL flowType={flowType} flowData={flowData} isExpertMode={isExpertMode} />
      <ProcessResult flowType={flowType} flowData={flowData} isExpertMode={isExpertMode} />
    </>
  );
};

const ProcessFlow: React.FC<ProcessFlowProps> = ({ biData, message, chatType }) => {
  const { flowDataList, flowRequest, activeSqlFlowType } = message;
  if (!biData || !flowRequest || !flowDataList?.length) return null;
  // const { sqlFlowTypes, isExpertMode } = biData;
  const { is_expert, sql_flow_types } = flowRequest;
  const chatStore = getChatStoreMethod(chatType)();
  const renderContent = (flowData?: IFlowData) => {
    if (!flowData) return null;
    return <ProcessFlowItem flowData={flowData} isExpertMode={is_expert} flowType={flowData.sql_flow_type} />;
  };

  const handleTabChange = (key: string) => {
    chatStore.updateCurrentSession((session: ChatSession) => {
      const msgItem = session.messages.find(d => d.id === message.id);
      if (msgItem) {
        msgItem.activeSqlFlowType = key as EnumSqlFlowType;
      }
    });
  };

  return is_expert ? (
    <Tabs
      size='small'
      className={styles['chat-message-tab']}
      activeKey={activeSqlFlowType}
      onChange={handleTabChange}
      items={sql_flow_types.map((flowType: EnumSqlFlowType) => ({
        key: flowType,
        label: SqlFlowTypeName[flowType],
        children: renderContent(flowDataList.find(d => d.sql_flow_type === flowType)),
      }))}
    />
  ) : (
    renderContent(flowDataList.find(d => d.sql_flow_type === activeSqlFlowType))
  );
};

export default ProcessFlow;
