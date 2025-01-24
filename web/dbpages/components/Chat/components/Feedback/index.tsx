import { DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { ChatMessage, EnumChatStoreType } from '../../store';
import GoldSqlModify from './GoldSqlModify';
import ReportDialog from './ReportDialog';

import { getChatStoreMethod } from '@/dbpages/components/Chat/store/ModelType';
import { EnumChaseNodeStep, EnumNodeStep, EnumSqlFlowType } from '@/dbpages/components/SqlFlow/ModelType';
import { IGoldSql } from '@/dbpages/typings/goldSql';
import styles from './index.module.less';

type FeedbackProps = {
  message: ChatMessage;
  chatType?: EnumChatStoreType;
  scopeData?: string | string[];
};

const Feedback: React.FC<FeedbackProps> = props => {
  const { message } = props;
  if (message.isHello || message.streaming) {
    return null;
  }
  const chatStore = getChatStoreMethod(props.chatType)();

  const handleLike = () => {
    chatStore.updateCurrentSession(
      (session: any) => (session.messages.find((d: any) => d.id === message.id).userLike = true),
    );
  };

  const handleUnLike = () => {
    chatStore.updateCurrentSession(
      (session: any) => (session.messages.find((d: any) => d.id === message.id).userLike = false),
    );
  };

  const goldSqlProps = {
    ...props,
    getModelData: () => {
      const { flowDataList } = props.message;
      if (!flowDataList?.length) return;
      const { activeSqlFlowType } = props.message;
      const flowData = flowDataList.find((d: any) => d.sql_flow_type === activeSqlFlowType);
      let rsStepId: any = EnumNodeStep['Result Show'];
      let nlqStepId: any = EnumNodeStep['Natural Language Question & Hint'];
      if (activeSqlFlowType === EnumSqlFlowType['CHASE-SQL']) {
        nlqStepId = EnumChaseNodeStep.S1_retrieve;
        rsStepId = EnumChaseNodeStep.S9_final_result;
      }
      const stepNLQ = flowData?.step_list.find((d: any) => d.step_id === nlqStepId);
      const stepRS = flowData?.step_list.find((d: any) => d.step_id === rsStepId);
      return {
        question: stepNLQ?.result?.question,
        difficulty: stepNLQ?.result?.difficulty,
        evidence: stepNLQ?.result?.evidence,
        sql: stepRS?.result?.predicted_sql,
        db_id: stepNLQ?.result?.database,
      } as IGoldSql;
    },
  };

  return (
    <Flex gap={8} align='center' className={styles['chat-message-action-feedback']}>
      <div>这个回答正确吗？</div>
      <LikeOutlined
        onClick={handleLike}
        className={classNames(styles['chat-message-action-feedback-icon'], {
          [styles['feedback-icon-active']]: message.userLike === true,
        })}
      />
      <DislikeOutlined
        onClick={handleUnLike}
        className={classNames(styles['chat-message-action-feedback-icon'], {
          [styles['feedback-icon-active']]: message.userLike === false,
        })}
      />
      {props.chatType === EnumChatStoreType.CHAT_BI && <GoldSqlModify {...goldSqlProps} />}
      {props.chatType === EnumChatStoreType.CHAT_BI && <ReportDialog />}
    </Flex>
  );
};

export default Feedback;
