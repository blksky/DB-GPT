import {
  ChatMessage,
  ChatSession,
  countMessages,
  createMessage,
  DEFAULT_TOPIC,
  EnumChatStoreType,
  fillTemplateWith,
  getDefaultChatState,
  getEmptySession,
  getSummarizeModel,
} from '@/dbpages/components/Chat/store/storeBase';
import dayjs from 'dayjs';
import { createJSONStorage } from 'zustand/middleware';
import Locale from '../chatLocales';
import { api, ChatOptions } from '../client/api';
import { ChatControllerPool } from '../client/controller';
import { DEFAULT_SYSTEM_TEMPLATE, StoreKey } from '../constant';
import { trimTopic } from '../utils';
import { prettyObject } from '../utils/format';
import { createPersistStore, IndexedDBStorage } from '../utils/store';
import { estimateTokenLength } from '../utils/token';
import { useAppConfig } from './config';
import { Mask } from './mask';

export const getChatStoreMethods = (set: any, get: any) => {
  return {
    clearSessions() {
      set(() => getDefaultChatState());
    },

    selectSession(index: number) {
      set({
        currentSessionIndex: index,
      });
    },

    moveSession(from: number, to: number) {
      set((state: any) => {
        const { sessions, currentSessionIndex: oldIndex } = state;

        // move the session
        const newSessions = [...sessions];
        const session = newSessions[from];
        newSessions.splice(from, 1);
        newSessions.splice(to, 0, session);

        // modify current session id
        let newIndex = oldIndex === from ? to : oldIndex;
        if (oldIndex > from && oldIndex <= to) {
          newIndex -= 1;
        } else if (oldIndex < from && oldIndex >= to) {
          newIndex += 1;
        }

        return {
          currentSessionIndex: newIndex,
          sessions: newSessions,
        };
      });
    },

    newSession(mask?: Mask, scopeData?: string | string[], extraSession?: any): string {
      const session = getEmptySession(get().chatType, { scopeData, ...(extraSession || {}) });

      if (mask) {
        const config = useAppConfig.getState();
        const globalModelConfig = config.modelConfig;

        session.mask = {
          ...mask,
          modelConfig: {
            ...globalModelConfig,
            ...mask.modelConfig,
          },
        };
        session.topic = mask.name;
      }

      set((state: any) => ({
        currentSessionIndex: 0,
        sessions: [session].concat(state.sessions),
      }));
      return session.id;
    },

    nextSession(delta: number) {
      const n = get().sessions.length;
      const limit = (x: number) => (x + n) % n;
      const i = get().currentSessionIndex;
      get().selectSession(limit(i + delta));
    },

    deleteSession(index: number) {
      const deletingLastSession = get().sessions.length === 1;
      const deletedSession = get().sessions.at(index);

      if (!deletedSession) return;

      const sessions = get().sessions.slice();
      sessions.splice(index, 1);

      const currentIndex = get().currentSessionIndex;
      let nextIndex = Math.min(currentIndex - Number(index < currentIndex), sessions.length - 1);

      if (deletingLastSession) {
        const nextSession = getEmptySession(get().chatType);
        sessions.push(nextSession);
        nextIndex = sessions.indexOf(nextSession);
      }

      // for undo delete action
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const restoreState = {
        currentSessionIndex: get().currentSessionIndex,
        sessions: get().sessions.slice(),
      };

      set(() => ({
        currentSessionIndex: nextIndex,
        sessions,
      }));
      // if (!deletedSession.scopeData) {
      //   showToast(
      //     Locale.Home.DeleteToast,
      //     {
      //       text: Locale.Home.Revert,
      //       onClick() {
      //         set(() => restoreState);
      //       },
      //     },
      //     5000,
      //   );
      // }
    },

    currentSession() {
      let index = get().currentSessionIndex;
      const sessions = get().sessions;

      if (index < 0 || index >= sessions.length) {
        index = Math.min(sessions.length - 1, Math.max(0, index));
        set(() => ({ currentSessionIndex: index }));
      }

      const session = sessions[index];

      return session;
    },

    onNewMessage(message: ChatMessage) {
      get().updateCurrentSession((session: ChatSession) => {
        session.messages = session.messages.concat();
        session.lastUpdate = Date.now();
      });
      get().updateStat(message);
      get().summarizeSession();
    },

    async onUserInput(content: string, options?: Record<string, any>, onUpdate?: (message: ChatMessage) => void) {
      const session = get().currentSession();
      const modelConfig = session.mask.modelConfig;

      const userContent = fillTemplateWith(content, modelConfig);
      console.log('[User Input] after template: ', userContent);

      const userMessage: ChatMessage = createMessage({
        role: 'user',
        content: userContent,
        scopeData: session.scopeData,
        searchChat: options?.searchChat,
      });

      const botMessage: ChatMessage = createMessage({
        role: 'assistant',
        streaming: true,
        question: userContent,
        model: modelConfig.model,
        ...(options || {}),
      });

      if (get().chatType === EnumChatStoreType.CHAT_BI) {
        const { isExpertMode, sqlFlowTypes, databaseList } = session.biData;
        botMessage.activeSqlFlowType = sqlFlowTypes[0];
        botMessage.flowRequest = {
          question: userContent,
          database: databaseList[0],
          database_type: 'SQLITE',
          flow_start_data: [],
          is_expert: isExpertMode,
          sql_flow_types: sqlFlowTypes,
          request_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
      } else if (get().chatType === EnumChatStoreType.CHAT_READING) {
        get().updateCurrentSession((session: ChatSession) => {
          session.readingData = {
            fileList: [],
            canUpload: session.readingData?.canUpload || false,
            activeFileList: session.readingData?.fileList || [],
          };
        });
      }

      // get recent messages
      const recentMessages = get().getMessagesWithMemory();
      const sendMessages = recentMessages.concat(userMessage);
      const messageIndex = get().currentSession().messages.length + 1;

      // save user's and bot's message
      get().updateCurrentSession((session: ChatSession) => {
        const savedUserMessage = {
          ...userMessage,
          content,
        };
        session.messages = session.messages.concat([savedUserMessage, botMessage]);
      });
      onUpdate?.(botMessage);

      const chatOptions: ChatOptions = {
        userMessage,
        botMessage,
        messages: sendMessages,
        config: { ...modelConfig, stream: true },
        onUpdate(message) {
          botMessage.streaming = true;
          if (message) {
            botMessage.content = message;
          }
          get().updateCurrentSession((session: ChatSession) => {
            session.messages = session.messages.concat();
          });
          onUpdate?.(botMessage);
        },
        onUpdateInfo(options) {
          Object.assign(botMessage, options);
          get().updateCurrentSession((session: ChatSession) => {
            session.messages = session.messages.concat();
          });
          onUpdate?.(botMessage);
        },
        onUpdateFlow(message) {
          botMessage.streaming = true;
          if (message) {
            botMessage.content = message.content;
            botMessage.flowDataList = message.flowDataList;
          }
          get().updateCurrentSession((session: ChatSession) => {
            session.messages = session.messages.concat();
          });
          onUpdate?.(botMessage);
        },
        onFinish(message) {
          botMessage.streaming = false;
          if (message) {
            botMessage.content = message.content;
            botMessage.flowDataList = message.flowDataList;
            get().onNewMessage(botMessage);
          }
          onUpdate?.(botMessage);
          ChatControllerPool.remove(session.id, botMessage.id);
        },
        onError(error) {
          // const isAborted = error.message.includes('aborted');
          botMessage.content +=
            '\n\n' +
            prettyObject({
              error: true,
              message: error.message,
            });
          botMessage.streaming = false;
          userMessage.isError = true; // !isAborted;
          botMessage.isError = true; // !isAborted;
          get().updateCurrentSession((session: ChatSession) => {
            session.messages = session.messages.concat();
          });
          onUpdate?.(botMessage);
          ChatControllerPool.remove(session.id, botMessage.id ?? messageIndex);
          console.error('[Chat] failed ', error);
        },
        onController(controller) {
          // collect controller for stop/retry
          ChatControllerPool.addController(session.id, botMessage.id ?? messageIndex, controller);
        },
      };

      if (session.onSendMessage) {
        const resultMsg = await session.onSendMessage(content, options, onUpdate);
        if (resultMsg) {
          botMessage.content = resultMsg;
          chatOptions.onFinish(botMessage);
        }
        return;
      }
      // make request
      api.llm.chat(chatOptions);
    },

    getMemoryPrompt() {
      const session = get().currentSession();

      return {
        role: 'system',
        content: session.memoryPrompt.length > 0 ? Locale.Store.Prompt.History(session.memoryPrompt) : '',
        date: '',
      } as ChatMessage;
    },

    getMessagesWithMemory() {
      const session = get().currentSession();
      const modelConfig = session.mask.modelConfig;
      const clearContextIndex = session.clearContextIndex ?? 0;
      const messages = session.messages.slice();
      const totalMessageCount = session.messages.length;

      // in-context prompts
      const contextPrompts = session.mask.context.slice();

      // system prompts, to get close to OpenAI Web ChatGPT
      const shouldInjectSystemPrompts = modelConfig.enableInjectSystemPrompts;
      const systemPrompts = shouldInjectSystemPrompts
        ? [
            createMessage({
              role: 'system',
              content: fillTemplateWith('', {
                ...modelConfig,
                template: DEFAULT_SYSTEM_TEMPLATE,
              }),
            }),
          ]
        : [];
      if (shouldInjectSystemPrompts) {
        console.log('[Global System Prompt] ', systemPrompts.at(0)?.content ?? 'empty');
      }

      // long term memory
      const shouldSendLongTermMemory =
        modelConfig.sendMemory &&
        session.memoryPrompt &&
        session.memoryPrompt.length > 0 &&
        session.lastSummarizeIndex > clearContextIndex;
      const longTermMemoryPrompts = shouldSendLongTermMemory ? [get().getMemoryPrompt()] : [];
      const longTermMemoryStartIndex = session.lastSummarizeIndex;

      // short term memory
      const shortTermMemoryStartIndex = Math.max(0, totalMessageCount - modelConfig.historyMessageCount);

      // lets concat send messages, including 4 parts:
      // 0. system prompt: to get close to OpenAI Web ChatGPT
      // 1. long term memory: summarized memory messages
      // 2. pre-defined in-context prompts
      // 3. short term memory: latest n messages
      // 4. newest input message
      const memoryStartIndex = shouldSendLongTermMemory
        ? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
        : shortTermMemoryStartIndex;
      // and if user has cleared history messages, we should exclude the memory too.
      const contextStartIndex = Math.max(clearContextIndex, memoryStartIndex);
      const maxTokenThreshold = modelConfig.max_tokens;

      // get recent messages as much as possible
      const reversedRecentMessages = [];
      for (
        let i = totalMessageCount - 1, tokenCount = 0;
        i >= contextStartIndex && tokenCount < maxTokenThreshold;
        i -= 1
      ) {
        const msg = messages[i];
        if (!msg || msg.isError) continue;
        msg.content = msg.content ?? '';
        tokenCount += estimateTokenLength(msg.content);
        reversedRecentMessages.push(msg);
      }

      // concat all messages
      const recentMessages = [
        ...systemPrompts,
        ...longTermMemoryPrompts,
        ...contextPrompts,
        ...reversedRecentMessages.reverse(),
      ];

      return recentMessages;
    },

    updateMessage(sessionIndex: number, messageIndex: number, updater: (message?: ChatMessage) => void) {
      const sessions = get().sessions;
      const session = sessions.at(sessionIndex);
      const messages = session?.messages;
      updater(messages?.at(messageIndex));
      set(() => ({ sessions }));
    },

    resetSession() {
      get().updateCurrentSession((session: ChatSession) => {
        session.messages = [];
        session.memoryPrompt = '';
      });
    },

    summarizeSession() {
      const config = useAppConfig.getState();
      const session = get().currentSession();

      // remove error messages if any
      const messages = session.messages;

      // should summarize topic after chating more than 50 words
      const SUMMARIZE_MIN_LEN = 50;
      if (
        config.enableAutoGenerateTitle &&
        session.topic === DEFAULT_TOPIC() &&
        countMessages(messages) >= SUMMARIZE_MIN_LEN
      ) {
        const topicMessages = messages.concat(
          createMessage({
            role: 'user',
            content: Locale.Store.Prompt.Topic,
          }),
        );
        // @ts-ignore
        api.llm.chat({
          messages: topicMessages,
          config: {
            model: getSummarizeModel(session.mask.modelConfig.model),
          },
          onFinish(message) {
            get().updateCurrentSession(
              (session: ChatSession) =>
                (session.topic = message.content.length > 0 ? trimTopic(message.content) : DEFAULT_TOPIC()),
            );
          },
        });
      }

      const modelConfig = session.mask.modelConfig;
      const summarizeIndex = Math.max(session.lastSummarizeIndex, session.clearContextIndex ?? 0);
      let toBeSummarizedMsgs = messages.filter((msg: ChatMessage) => !msg.isError).slice(summarizeIndex);

      const historyMsgLength = countMessages(toBeSummarizedMsgs);

      if (historyMsgLength > modelConfig?.max_tokens ?? 4000) {
        const n = toBeSummarizedMsgs.length;
        toBeSummarizedMsgs = toBeSummarizedMsgs.slice(Math.max(0, n - modelConfig.historyMessageCount));
      }

      // add memory prompt
      toBeSummarizedMsgs.unshift(get().getMemoryPrompt());

      const lastSummarizeIndex = session.messages.length;

      console.log('[Chat History] ', toBeSummarizedMsgs, historyMsgLength, modelConfig.compressMessageLengthThreshold);

      if (historyMsgLength > modelConfig.compressMessageLengthThreshold && modelConfig.sendMemory) {
        // @ts-ignore
        api.llm.chat({
          messages: toBeSummarizedMsgs.concat(
            createMessage({
              role: 'system',
              content: Locale.Store.Prompt.Summarize,
              date: '',
            }),
          ),
          config: {
            ...modelConfig,
            stream: true,
            model: getSummarizeModel(session.mask.modelConfig.model),
          },
          onUpdate(message) {
            session.memoryPrompt = message;
          },
          onFinish(message) {
            console.log('[Memory] ', message);
            session.lastSummarizeIndex = lastSummarizeIndex;
          },
          onError(err) {
            console.error('[Summarize] ', err);
          },
        });
      }
    },

    updateStat(message: ChatMessage) {
      get().updateCurrentSession((session: ChatSession) => {
        session.stat.charCount += message.content.length;
        // TODO: should update chat count and word count
      });
    },

    updateCurrentSession(updater: (session: ChatSession) => void) {
      const sessions = get().sessions;
      const index = get().currentSessionIndex;
      updater(sessions[index]);
      set(() => ({ sessions }));
    },

    clearAllData() {
      localStorage.clear();
      location.reload();
    },
  };
};

export const useChatStore: any = createPersistStore(
  getDefaultChatState(),
  (set, _get) => {
    let methods: Record<string, any> = {};

    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    methods = getChatStoreMethods(set, get);
    return methods;
  },
  {
    name: StoreKey.Chat,
    version: 3.1,
    storage: typeof window !== 'undefined' && createJSONStorage(() => IndexedDBStorage(EnumChatStoreType.CHAT)),
    migrate(persistedState, version) {
      const state = persistedState as any;
      const newState = JSON.parse(JSON.stringify(state));
      return newState as any;
    },
  },
);
