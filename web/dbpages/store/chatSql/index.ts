import {
  EnumChaseNodeStep,
  EnumSqlFlowType,
  IFlowData,
  IFlowRequestData,
  IFlowStartData,
} from '@/dbpages/components/SqlFlow/ModelType';
import { beginChatTask, getChatTaskStatus } from '@/dbpages/service/chatSql';
import { OPERATE_TYPES, ResultWrapper } from '@/dbpages/typings/result';
import { StoreApi } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn, UseBoundStoreWithEqualityFn } from 'zustand/traditional';

export interface IChatSqlStore {
  loading: boolean;
}

const initChatSqlStore: IChatSqlStore = {
  loading: true,
};

/**
 * 用户 store
 */
export const useChatSqlStore: UseBoundStoreWithEqualityFn<StoreApi<IChatSqlStore>> = createWithEqualityFn(
  devtools(() => initChatSqlStore),
  shallow,
);

export const fetchBeginChatTask = async (payload: IFlowRequestData): Promise<IFlowStartData[] | undefined> => {
  const data = await beginChatTask({ ...payload, is_expert: true });
  let result: IFlowStartData[] | undefined;
  ResultWrapper<typeof data>({
    data,
    operate: OPERATE_TYPES.QUERY,
    onSuccess: content => {
      result = content;
    },
  });
  return result;
};

export const fetchChatTaskStatus = async (
  payload: Record<EnumSqlFlowType, { request_id: string }>,
): Promise<IFlowData[] | undefined> => {
  const data = await getChatTaskStatus(payload);
  let result: IFlowData[] | undefined;
  ResultWrapper<typeof data>({
    data,
    operate: OPERATE_TYPES.QUERY,
    onSuccess: content => {
      result = content;
      const chaseFlowData = result?.find(d => d.sql_flow_type === EnumSqlFlowType['CHASE-SQL']);
      if (chaseFlowData) {
        const s5Step = chaseFlowData.step_list.find(d => d.step_id === EnumChaseNodeStep.S5_candidate_generation);
        const s6Step = chaseFlowData.step_list.find(d => d.step_id === EnumChaseNodeStep.S6_query_fixer);
        if (s5Step) {
          const s5StepResult = s5Step.result || [];
          const s5StepIndex = chaseFlowData.step_list.indexOf(s5Step);
          const s5StepDC = {
            ...s5Step,
            step_id: EnumChaseNodeStep.S5_candidate_generation_DC,
            result: s5StepResult.filter((d: any) => d.implement === 'DivideConquerGenerator'),
          };
          const s5StepQP = {
            ...s5Step,
            step_id: EnumChaseNodeStep.S5_candidate_generation_QP,
            result: s5StepResult.filter((d: any) => d.implement === 'QueryPlanGenerator'),
          };
          const s5StepOS = {
            ...s5Step,
            step_id: EnumChaseNodeStep.S5_candidate_generation_OS,
            result: s5StepResult.filter((d: any) => d.implement === 'OnlineSyntheticExampleGenerator'),
          };
          chaseFlowData.step_list.splice(s5StepIndex + 1, 0, s5StepDC, s5StepQP, s5StepOS);
        }

        if (s6Step) {
          const s6StepResult = s6Step.result || [];
          const s6StepIndex = chaseFlowData.step_list.indexOf(s6Step);
          const s6StepDC = {
            ...s6Step,
            step_id: EnumChaseNodeStep.S6_query_fixer_DC,
            result: s6StepResult.filter((d: any) => d.implement === 'DivideConquerGenerator'),
          };
          const s6StepQP = {
            ...s6Step,
            step_id: EnumChaseNodeStep.S6_query_fixer_QP,
            result: s6StepResult.filter((d: any) => d.implement === 'QueryPlanGenerator'),
          };
          const s6StepOS = {
            ...s6Step,
            step_id: EnumChaseNodeStep.S6_query_fixer_OS,
            result: s6StepResult.filter((d: any) => d.implement === 'OnlineSyntheticExampleGenerator'),
          };
          chaseFlowData.step_list.splice(s6StepIndex + 1, 0, s6StepDC, s6StepQP, s6StepOS);
        }
      }
    },
  });
  return result;
};
