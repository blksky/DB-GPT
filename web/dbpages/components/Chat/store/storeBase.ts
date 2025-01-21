import { getLang } from '@/dbpages/components/Chat/chatLocales';
import { RequestMessage } from '@/dbpages/components/Chat/client/api';
import { DEFAULT_INPUT_TEMPLATE, KnowledgeCutOffDate, SUMMARIZE_MODEL } from '@/dbpages/components/Chat/constant';
import { localeMsg } from '@/dbpages/components/Chat/helper/LocaleHelper';
import { ModelConfig, ModelType } from '@/dbpages/components/Chat/store/config';
import { Mask, createEmptyMask } from '@/dbpages/components/Chat/store/mask';
import { estimateTokenLength } from '@/dbpages/components/Chat/utils/token';
import { EnumSqlFlowType, IFlowData, IFlowRequestData } from '@/dbpages/components/SqlFlow/ModelType';
import { nanoid } from 'nanoid';

/** 支持的问答方式 */
export enum EnumChatStoreType {
  /** 文档问答 */
  CHAT = 'chat',
  /** 限制范围的文档问答 */
  CHAT_SCOPE = 'chat_scope',
  /** BI问答 */
  CHAT_BI = 'chat_bi',
  /** 阅读问答 */
  CHAT_READING = 'chat_reading',
}

export type ChatMessage = RequestMessage & {
  id: string;
  date: string;
  question?: string;
  streaming?: boolean;
  isError?: boolean;
  isHello?: boolean;
  model?: ModelType;
  userLike?: boolean;
  flowRequest?: IFlowRequestData;
  flowDataList?: IFlowData[];
  activeSqlFlowType?: EnumSqlFlowType;
};

export interface ChatStat {
  tokenCount: number;
  wordCount: number;
  charCount: number;
}

export interface ChatSessionBiData {
  isExpertMode: boolean;
  sqlFlowTypes: EnumSqlFlowType[];
  databaseList: string[];
}

export interface ChatSessionReadingData {
  canUpload: boolean;
  /** 刚选择的文件列表，还未发送给对话服务 */
  fileList?: any[];
  /** 当前对话生效文件列表 */
  activeFileList?: any[];
}

export interface ChatSession {
  id: string;
  topic: string;
  memoryPrompt: string;
  messages: ChatMessage[];
  stat: ChatStat;
  scopeData?: string | string[];
  lastUpdate: number;
  lastSummarizeIndex: number;
  clearContextIndex?: number;
  mask: Mask;
  biData?: ChatSessionBiData;
  readingData?: ChatSessionReadingData;
  onSendMessage?: (
    content: string,
    options?: Record<string, any>,
    onUpdate?: (message: ChatMessage) => void,
  ) => Promise<string | null>;
}

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: 'user',
    content: '',
    ...override,
  };
}

export const DEFAULT_TOPIC = () => {
  let defaultTopic;
  try {
    defaultTopic = localeMsg('page.chat.topic.default');
  } catch (e: any) {
    defaultTopic = '新的聊天';
  }
  return defaultTopic;
};
export const BOT_HELLO = (): ChatMessage => {
  return createMessage({
    role: 'assistant',
    isHello: true,
    content: localeMsg('page.chat.msg.bot.hello'),
  });
};

export function getSummarizeModel(currentModel: string) {
  // if it is using gpt-* models, force to use 3.5 to summarize
  return currentModel.startsWith('gpt') ? SUMMARIZE_MODEL : currentModel;
}

export function countMessages(msgs: ChatMessage[]) {
  return msgs.reduce((pre, cur) => pre + estimateTokenLength(cur.content), 0);
}

export function fillTemplateWith(input: string, modelConfig: ModelConfig) {
  let cutoff = KnowledgeCutOffDate[modelConfig.model] ?? KnowledgeCutOffDate.default;

  const vars = {
    cutoff,
    model: modelConfig.model,
    time: new Date().toLocaleString(),
    lang: getLang(),
    input: input,
  };

  let output = modelConfig.template ?? DEFAULT_INPUT_TEMPLATE;

  // must contains {{input}}
  const inputVar = '{{input}}';
  if (!output.includes(inputVar)) {
    output += '\n' + inputVar;
  }

  Object.entries(vars).forEach(([name, value]) => {
    output = output.replaceAll(`{{${name}}}`, value);
  });

  return output;
}

function getDefaultEmptySession(sessionOption: Record<string, any> = {}): ChatSession {
  return {
    id: nanoid(),
    topic: DEFAULT_TOPIC(),
    memoryPrompt: '',
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
    mask: createEmptyMask(),
    ...sessionOption,
  };
}

function getScopeEmptySession(sessionOption: Record<string, any> = {}): ChatSession {
  return {
    id: nanoid(),
    topic: DEFAULT_TOPIC(),
    memoryPrompt: '',
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
    mask: createEmptyMask(),
    ...sessionOption,
  };
}

function getBIEmptySession(sessionOption: Record<string, any> = {}): ChatSession {
  return {
    id: nanoid(),
    topic: DEFAULT_TOPIC(),
    memoryPrompt: '',
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
    mask: createEmptyMask(),
    biData: {
      isExpertMode: true,
      databaseList: [],
      sqlFlowTypes: [EnumSqlFlowType['E-SQL'], EnumSqlFlowType['CHASE-SQL']],
    },
    ...sessionOption,
  };
}

function getReadingEmptySession(sessionOption: Record<string, any> = {}): ChatSession {
  return {
    id: nanoid(),
    topic: DEFAULT_TOPIC(),
    memoryPrompt: '',
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
    mask: createEmptyMask(),
    readingData: {
      canUpload: true,
      fileList: [],
      activeFileList: [],
    },
    ...sessionOption,
  };
}

export function getEmptySession(chatType?: EnumChatStoreType, sessionOption?: Record<string, any>) {
  console.log(EnumChatStoreType.CHAT);
  switch (chatType) {
    case EnumChatStoreType.CHAT:
      return getDefaultEmptySession(sessionOption);
    case EnumChatStoreType.CHAT_SCOPE:
      return getScopeEmptySession(sessionOption);
    case EnumChatStoreType.CHAT_BI:
      return getBIEmptySession(sessionOption);
    case EnumChatStoreType.CHAT_READING:
      return getReadingEmptySession(sessionOption);
    default:
      return getDefaultEmptySession(sessionOption);
  }
}

export const getDefaultChatState = () => {
  return {
    chatType: EnumChatStoreType.CHAT,
    sessions: [getEmptySession(EnumChatStoreType.CHAT)],
    currentSessionIndex: 0,
  };
};
export const getDefaultChatBIState = () => {
  return {
    chatType: EnumChatStoreType.CHAT_BI,
    sessions: [getEmptySession(EnumChatStoreType.CHAT_BI)],
    currentSessionIndex: 0,
  };
};
export const getDefaultChatReadingState = () => {
  return {
    chatType: EnumChatStoreType.CHAT_READING,
    sessions: [getEmptySession(EnumChatStoreType.CHAT_READING)],
    currentSessionIndex: 0,
  };
};
export const getDefaultChatScopeState = () => {
  return {
    chatType: EnumChatStoreType.CHAT_SCOPE,
    sessions: [],
    currentSessionIndex: 0,
  };
};
