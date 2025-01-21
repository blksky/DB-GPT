import { EnumSqlFlowType, EnumStepStatus, IFlowData } from '@/dbpages/components/SqlFlow/ModelType';
import { fetchBeginChatTask, fetchChatTaskStatus } from '@/dbpages/store/chatSql';
import Locale from '../../chatLocales';
import { DEFAULT_MODELS, OpenaiPath, REQUEST_TIMEOUT_MS } from '../../constant';
import { formatTime } from '../../utils/chatUtil';
import { ChatOptions, LLMApi, LLMModel, LLMUsage, getHeaders } from '../api';

export interface OpenAIListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}

export interface IChatSrcData {
  content: string;
  flowDataList?: IFlowData[];
}

export class ChatGPTApi implements LLMApi {
  private disableListModels = true;

  path(path: string): string {
    return ['', path].join('/');
  }

  formatMessage(text: string, isFirstLine: boolean) {
    const lines = text.split('\n');
    const data = [];
    const parseErrors = [];

    const isValidData = (item: any) => {
      return (
        typeof item === 'object' &&
        item !== null &&
        !!(item.answer || item.source?.length || item.image?.length || item.table?.length)
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      try {
        if (line.startsWith('data:')) {
          if (line.endsWith('[DONE]')) {
            data.push({ segment: 'stop' });
          } else {
            const parsedData = JSON.parse(line.substring(5));
            const dataItem: any = {
              segment: 'text',
              answer: parsedData.choices?.[0]?.delta.content,
            };
            if (parsedData.choices?.[0]?.finish_reason === 'stop') {
              dataItem.segment = 'stop';
              Reflect.deleteProperty(dataItem, 'answer');
            } else if (isFirstLine) {
              dataItem.dateTime = formatTime();
            }
            data.push(dataItem);
          }
        } else if (line === '[START]' || line === '[start]') {
          data.push({ segment: 'start' });
        } else if (line === '[END]' || line === '[end]') {
          data.push({ segment: 'stop' });
        } else if (line !== '') {
          const parsedData = JSON.parse(line);
          if (isValidData(parsedData)) {
            const dataItem = { segment: 'text', ...parsedData };
            if (isFirstLine) {
              dataItem.dateTime = formatTime();
            }
            data.push(dataItem);
          } else {
            parseErrors.push(line);
          }
        }
      } catch (error) {
        parseErrors.push(line);
      }
    }

    return data;
  }

  extractMessage(text: string): IChatSrcData {
    const result: IChatSrcData = { content: '' };
    const texts = this.formatMessage(text, true);
    for (let i = 0, j = texts.length; i < j; i++) {
      const { answer = '' } = texts[i];
      result.content += answer;
    }
    return result;
  }

  async refreshFlowStatus(options: ChatOptions) {
    const { botMessage } = options;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: any = this;
    if (
      !botMessage.streaming ||
      !botMessage.flowRequest ||
      botMessage.flowDataList?.every(d => d.status !== EnumStepStatus.running)
    ) {
      options.onFinish({ content: '', flowDataList: botMessage.flowDataList });
      return;
    }

    const statusParam = {} as Record<EnumSqlFlowType, { request_id: string }>;
    botMessage.flowRequest?.flow_start_data?.forEach(flowInfo => {
      const flowData = botMessage.flowDataList?.find(d => d.sql_flow_type === flowInfo.sql_flow_type);
      if (!flowData || ![EnumStepStatus.failed, EnumStepStatus.success].includes(flowData.status)) {
        statusParam[flowInfo.sql_flow_type] = { request_id: flowInfo.request_id };
      }
    });
    if (!Reflect.ownKeys(statusParam).length) {
      return;
    }
    const result = await fetchChatTaskStatus(statusParam);
    result?.forEach(flowData => {
      const { step_list } = flowData;
      if (flowData.sql_flow_type !== EnumSqlFlowType['CHASE-SQL']) {
        if (step_list.some(d => d.status === EnumStepStatus.failed)) {
          flowData.status = EnumStepStatus.failed;
        } else if (step_list.some(d => d.status !== EnumStepStatus.success)) {
          flowData.status = EnumStepStatus.running;
        } else {
          flowData.status = EnumStepStatus.success;
        }
      }
      botMessage.flowDataList = botMessage.flowDataList || [];
      const itemIndex = botMessage.flowDataList?.findIndex(d => d.sql_flow_type === flowData.sql_flow_type);
      if (itemIndex > -1) {
        botMessage.flowDataList[itemIndex] = flowData;
      } else {
        botMessage.flowDataList.push(flowData);
      }
    });

    const hasFinished = result?.some(d => [EnumStepStatus.failed, EnumStepStatus.success].includes(d.status));
    options.onUpdateFlow?.({ content: '', flowDataList: botMessage.flowDataList });
    setTimeout(() => self.refreshFlowStatus(options), hasFinished ? 100 : 5000);
  }

  async chat(options: ChatOptions) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: any = this;
    let finished: boolean = false;
    const { userMessage, botMessage } = options;
    const result: IChatSrcData = { content: '' };
    if (!userMessage) return;
    const finish = () => {
      if (!finished) {
        finished = true;
        options.onFinish(result);
      }
    };

    if (botMessage.flowRequest) {
      botMessage.flowRequest.flow_start_data = await fetchBeginChatTask(botMessage.flowRequest);
      await self.refreshFlowStatus(options);
      return;
    }

    const messages = options.messages
      .filter(d => d.role !== 'system')
      .map(v => ({
        role: v.role,
        content: v.content,
      }));
    let messageIndex = 0;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      // @ts-ignore
      if (messages[i].searchChat) {
        messageIndex = i;
      }
    }
    const historyData = [...messages.slice(messageIndex, messages.length - 1)];
    const historyList: string[][] = [];
    historyData.forEach(d => {
      if (d.role === 'user') {
        historyList.push([d.content, '']);
      } else {
        const prev = historyList[historyList.length - 1];
        if (prev) {
          prev[1] = d.content || '';
        }
      }
    });

    const requestPayload = {
      stream: false, // options.config.stream,
      query: userMessage?.content,
      docCode: userMessage?.scopeData,
      history: historyList.filter(d => d[0]?.length && d[1]?.length),
    };

    console.log('[Request] catl api payload: ', requestPayload);

    const shouldStream = !!requestPayload.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = this.path(`api-chat/dialogue`);
      const chatPayload = {
        method: 'POST',
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(),
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      if (shouldStream) {
        controller.signal.onabort = finish;
        const response: any = await fetch(chatPath, chatPayload);
        const reader = response.body?.getReader?.();
        reader?.read().then(async function processText({ done, value }: any): Promise<any> {
          if (done) {
            finish();
            return;
          }
          if (!result.content.length) {
            clearTimeout(requestTimeoutId);
          }
          const text = new TextDecoder('utf-8').decode(value);
          console.log('收到回复：', text);
          const texts: any = self.formatMessage(text, !result.content.length);
          for (let i = 0, j = texts.length; i < j; i++) {
            const { answer = '' } = texts[i];
            if (answer.length) {
              result.content += answer;
              options.onUpdate?.(result.content, answer);
            }
          }
          return reader.read().then(processText);
        });
      } else {
        const res = await fetch(chatPath, chatPayload);
        clearTimeout(requestTimeoutId);
        const resText = await res.text();
        const data = this.extractMessage(resText);
        options.onFinish(data);
      }

      // doPageTrack({
      //   page: EnumSitePage.KG_CHAT,
      //   eventType: EnumEventType.handleSubmit,
      //   operationObject: 'chat',
      //   params: JSON.stringify(userMessage),
      // });
    } catch (e) {
      console.log('[Request] failed to make a chat request', e);
      options.onError?.(e as Error);
    }
  }

  async usage() {
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate = formatDate(startOfMonth);
    const endDate = formatDate(new Date(Date.now() + ONE_DAY));

    const [used, subs] = await Promise.all([
      fetch(this.path(`${OpenaiPath.UsagePath}?start_date=${startDate}&end_date=${endDate}`), {
        method: 'GET',
        headers: getHeaders(),
      }),
      fetch(this.path(OpenaiPath.SubsPath), {
        method: 'GET',
        headers: getHeaders(),
      }),
    ]);

    if (used.status === 401) {
      throw new Error(Locale.Error.Unauthorized);
    }

    if (!used.ok || !subs.ok) {
      throw new Error('Failed to query usage from openai');
    }

    const response = (await used.json()) as {
      total_usage?: number;
      error?: {
        type: string;
        message: string;
      };
    };

    const total = (await subs.json()) as {
      hard_limit_usd?: number;
    };

    if (response.error && response.error.type) {
      throw Error(response.error.message);
    }

    if (response.total_usage) {
      response.total_usage = Math.round(response.total_usage) / 100;
    }

    if (total.hard_limit_usd) {
      total.hard_limit_usd = Math.round(total.hard_limit_usd * 100) / 100;
    }

    return {
      used: response.total_usage,
      total: total.hard_limit_usd,
    } as LLMUsage;
  }

  async models(): Promise<LLMModel[]> {
    if (this.disableListModels) {
      return DEFAULT_MODELS.slice();
    }

    const res = await fetch(this.path(OpenaiPath.ListModelPath), {
      method: 'GET',
      headers: {
        ...getHeaders(),
      },
    });

    const resJson = (await res.json()) as OpenAIListModelResponse;
    const chatModels = resJson.data?.filter(m => m.id.startsWith('gpt-'));
    console.log('[Models]', chatModels);

    if (!chatModels) {
      return [];
    }

    return chatModels.map(m => ({
      name: m.id,
      available: true,
    }));
  }
}

export { OpenaiPath };
