import {
  EnumSqlFlowType,
  IFlowData,
  IFlowRequestData,
  IFlowStartData,
} from '@/dbpages/components/SqlFlow/ModelType';
import { QUESTION_MAP, request } from '@/dbpages/utils/RequestUtil';

/** 开始对话问答任务-e-sql */
export async function beginChatTask(data: IFlowRequestData) {
  let question: string | undefined = data.question;
  if (QUESTION_MAP.has(data.question)) {
    question = QUESTION_MAP.get(data.question)?.question || data.question;
  }
  return request<IFlowStartData[]>('/api-chatbi-manage/chat_sql/start_task', {
    method: 'POST',
    data: {
      question,
      database: data.database,
      is_expert: data.is_expert,
      sql_flow_types: data.sql_flow_types,
    },
  });
}

/**
 * 获取对话任务状态
 * @param data
 */
export function getChatTaskStatus(data: Record<EnumSqlFlowType, { request_id: string }>) {
  return request<IFlowData[]>('/api-chatbi-manage/chat_sql/task_status', {
    method: 'POST',
    data,
  });
}
