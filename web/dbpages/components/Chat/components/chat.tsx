import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

// @ts-ignore
// @ts-ignore
import BottomIcon from '../icons/bottom.svg';
import BrainIcon from '../icons/brain.svg';
import SettingsIcon from '../icons/chat-settings.svg';
import CopyIcon from '../icons/copy.svg';
import StopIcon from '../icons/pause.svg';
import PromptIcon from '../icons/prompt.svg';
import ResetIcon from '../icons/reload.svg';

// @ts-ignore
import ICON_DOWN from '../images/icons_direction_right.svg?url';
// @ts-ignore
import ICON_READY from '../images/icons_ready.svg?url';

import {
  BOT_HELLO,
  ChatMessage,
  ChatSession,
  createMessage,
  DEFAULT_TOPIC,
  EnumChatStoreType,
  ModelType,
  SubmitKey,
  Theme,
  useAccessStore,
  useAppConfig,
  useChatPathStore,
} from '../store';

import { autoGrowTextArea, copyToClipboard, selectOrCopy, useMobileScreen } from '../utils';

import Locale from '../chatLocales';
import { ChatControllerPool } from '../client/controller';
import { Prompt, usePromptStore } from '../store/prompt';

import { IconButton } from './button';
import styles from './chat.module.less';

import {
  BorderOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SafetyCertificateFilled,
  SyncOutlined,
} from '@ant-design/icons';

import { Button, Col, Divider, Dropdown, Input, Row, Space, Tooltip, Typography } from 'antd';
import { useChatCommand, useCommand } from '../command';
import { getClientConfig } from '../config/client';
import { CHAT_PAGE_SIZE, LAST_INPUT_KEY, Path, REQUEST_TIMEOUT_MS, UNFINISHED_INPUT } from '../constant';
import { useMaskStore } from '../store/mask';
import { prettyObject } from '../utils/format';
import { useAllModels } from '../utils/hooks';
import { Avatar, CommonAvatar } from './emoji';
import { ExportMessageModal } from './exporter';
import { ContextPrompts, MaskConfig } from './mask';
import { ListItem, Modal, showConfirm, showToast } from './ui-lib';
// @ts-ignore
import classNames from 'classnames';
// @ts-ignore
import Feedback from '@/dbpages/components/Chat/components/Feedback';
import FileUploader, { showFileUploader } from '@/dbpages/components/Chat/components/FileUploader';
import { getChatStoreMethod } from '@/dbpages/components/Chat/store/ModelType';
import { EnumStepStatus } from '@/dbpages/components/SqlFlow/ModelType';
import { Constants } from '../helper/Constants';
import { localeMsg } from '../helper/LocaleHelper';
import { useChatWrapperStore } from '../store/chatWrapper';
import { Markdown } from './markdown';
import ProcessFlow from './ProcessFlow';
import Reminder from './Reminder';

// @ts-ignore
// const Markdown: any = React.lazy(() =>
//   import('./markdown').then((res) => ({ default: res.Markdown })),
// );

export function SessionConfigModel(props: {
  chatType?: EnumChatStoreType;
  scopeData?: string | string[];
  onClose: () => void;
}) {
  const chatStore = getChatStoreMethod(props.chatType)();
  const session = chatStore.currentSession();
  const maskStore = useMaskStore();
  const { navigateChat } = useChatPathStore();

  return (
    <Modal
      title={Locale.Context.Edit}
      onClose={() => props.onClose()}
      actions={[
        <IconButton
          key='reset'
          icon={<ResetIcon />}
          bordered
          text={Locale.Chat.Config.Reset}
          onClick={async () => {
            if (await showConfirm(Locale.Memory.ResetConfirm)) {
              chatStore.updateCurrentSession(session => (session.memoryPrompt = ''));
            }
          }}
        />,
        <IconButton
          key='copy'
          icon={<CopyIcon />}
          bordered
          text={Locale.Chat.Config.SaveAs}
          onClick={() => {
            navigateChat(Path.Masks);
            setTimeout(() => {
              maskStore.create(session.mask);
            }, 500);
          }}
        />,
      ]}
    >
      <MaskConfig
        mask={session.mask}
        updateMask={updater => {
          const mask = { ...session.mask };
          updater(mask);
          chatStore.updateCurrentSession(session => (session.mask = mask));
        }}
        shouldSyncFromGlobal
        extraListItems={
          session.mask.modelConfig.sendMemory ? (
            <ListItem
              className='copyable'
              title={`${Locale.Memory.Title} (${session.lastSummarizeIndex} of ${session.messages.length})`}
              subTitle={session.memoryPrompt || Locale.Memory.EmptyContent}
            ></ListItem>
          ) : (
            <></>
          )
        }
      />
    </Modal>
  );
}

function PromptToast(props: {
  chatType?: EnumChatStoreType;
  scopeData?: string | string[];
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const chatStore = getChatStoreMethod(props.chatType)();
  const session = chatStore.currentSession();
  const context = session.mask.context;

  return (
    <div className={styles['prompt-toast']} key='prompt-toast'>
      {props.showToast && (
        <div
          className={styles['prompt-toast-inner'] + ' clickable'}
          role='button'
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={styles['prompt-toast-content']}>{Locale.Context.Toast(context.length)}</span>
        </div>
      )}
      {props.showModal && (
        <SessionConfigModel
          chatType={props.chatType}
          scopeData={props.scopeData}
          onClose={() => props.setShowModal(false)}
        />
      )}
    </div>
  );
}

function useSubmitHandler() {
  const config = useAppConfig();
  const submitKey = config.submitKey;
  const isComposing = useRef(false);

  useEffect(() => {
    const onCompositionStart = () => {
      isComposing.current = true;
    };
    const onCompositionEnd = () => {
      isComposing.current = false;
    };

    window.addEventListener('compositionstart', onCompositionStart);
    window.addEventListener('compositionend', onCompositionEnd);

    return () => {
      window.removeEventListener('compositionstart', onCompositionStart);
      window.removeEventListener('compositionend', onCompositionEnd);
    };
  }, []);

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return false;
    if (e.key === 'Enter' && (e.nativeEvent.isComposing || isComposing.current)) return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter && !e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export type RenderPompt = Pick<Prompt, 'title' | 'content'>;

export function PromptHints(props: { prompts: RenderPompt[]; onPromptSelect: (prompt: RenderPompt) => void }) {
  const noPrompts = props.prompts.length === 0;
  const [selectIndex, setSelectIndex] = useState(0);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectIndex(0);
  }, [props.prompts.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (noPrompts || e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      // arrow up / down to select prompt
      const changeIndex = (delta: number) => {
        e.stopPropagation();
        e.preventDefault();
        const nextIndex = Math.max(0, Math.min(props.prompts.length - 1, selectIndex + delta));
        setSelectIndex(nextIndex);
        selectedRef.current?.scrollIntoView({
          block: 'center',
        });
      };

      if (e.key === 'ArrowUp') {
        changeIndex(1);
      } else if (e.key === 'ArrowDown') {
        changeIndex(-1);
      } else if (e.key === 'Enter') {
        const selectedPrompt = props.prompts.at(selectIndex);
        if (selectedPrompt) {
          props.onPromptSelect(selectedPrompt);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prompts.length, selectIndex]);

  if (noPrompts) return null;
  return (
    <div className={styles['prompt-hints']}>
      {props.prompts.map((prompt, i) => (
        <div
          ref={i === selectIndex ? selectedRef : null}
          className={styles['prompt-hint'] + ` ${i === selectIndex ? styles['prompt-hint-selected'] : ''}`}
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
          onMouseEnter={() => setSelectIndex(i)}
        >
          <div className={styles['hint-title']}>{prompt.title}</div>
          <div className={styles['hint-content']}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}

function ClearContextDivider(props: { chatType?: EnumChatStoreType; scopeData?: string | string[] }) {
  const chatStore = getChatStoreMethod(props?.chatType)();
  return (
    <div
      className={styles['clear-context']}
      onClick={() => chatStore.updateCurrentSession(session => (session.clearContextIndex = undefined))}
    >
      <div className={styles['clear-context-tips']}>{Locale.Context.Clear}</div>
      <div className={styles['clear-context-revert-btn']}>{Locale.Context.Revert}</div>
    </div>
  );
}

function ChatAction(props: { text: string; icon: JSX.Element; onClick?: () => void }) {
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState({
    full: 16,
    icon: 16,
  });

  function updateWidth() {
    if (!iconRef.current || !textRef.current) return;
    const getWidth = (dom: HTMLDivElement) => dom.getBoundingClientRect().width;
    const textWidth = getWidth(textRef.current);
    const iconWidth = getWidth(iconRef.current);
    setWidth({
      full: textWidth + iconWidth,
      icon: iconWidth,
    });
  }

  return (
    <div
      className={`${styles['chat-input-action']} clickable`}
      onClick={() => {
        props.onClick?.();
        setTimeout(updateWidth, 1);
      }}
      onMouseEnter={updateWidth}
      onTouchStart={updateWidth}
      style={
        {
          '--icon-width': `${width.icon}px`,
          '--full-width': `${width.full}px`,
        } as React.CSSProperties
      }
    >
      <div ref={iconRef} className={styles['icon']}>
        {props.icon}
      </div>
      <div className={styles['text']} ref={textRef}>
        {props.text}
      </div>
    </div>
  );
}

function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  function scrollDomToBottom() {
    const dom = scrollRef.current;
    if (dom) {
      requestAnimationFrame(() => {
        setAutoScroll(true);
        dom.scrollTo(0, dom.scrollHeight);
      });
    }
  }

  // auto scroll
  useEffect(() => {
    if (autoScroll) {
      scrollDomToBottom();
    }
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollDomToBottom,
  };
}

export function ChatActions(props: {
  chatType?: EnumChatStoreType;
  scopeData?: string | string[];
  messages: RenderMessage[];
  showPromptModal: () => void;
  scrollToBottom: () => void;
  showPromptHints: () => void;
  hitBottom: boolean;
}) {
  const config = useAppConfig();
  const chatStore = getChatStoreMethod(props.chatType)();
  const { navigateChat } = useChatPathStore();

  // switch themes
  const theme = config.theme;

  function nextTheme() {
    const themes = [Theme.Auto, Theme.Light, Theme.Dark];
    const themeIndex = themes.indexOf(theme);
    const nextIndex = (themeIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    config.update(config => (config.theme = nextTheme));
  }

  // stop all responses
  const couldStop = ChatControllerPool.hasPending();
  const stopAll = () => ChatControllerPool.stopAll();

  // switch model
  const currentModel = chatStore.currentSession().mask.modelConfig.model;
  const allModels = useAllModels();
  const models = useMemo(() => allModels.filter(m => m.available), [allModels]);

  useEffect(() => {
    // if current model is not available
    // switch to first available model
    const isUnavaliableModel = !models.some(m => m.name === currentModel);
    if (isUnavaliableModel && models.length > 0) {
      const nextModel = models[0].name as ModelType;
      chatStore.updateCurrentSession(session => (session.mask.modelConfig.model = nextModel));
      showToast(nextModel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModel, models]);

  return (
    <Space size={5} className={styles['chat-input-actions']}>
      {couldStop && (
        <ChatAction onClick={stopAll} text={localeMsg('page.chat.input.action.stop')} icon={<StopIcon />} />
      )}
      {!props.hitBottom && !!props.messages.length && (
        <ChatAction
          onClick={props.scrollToBottom}
          text={localeMsg('page.chat.input.action.ToBottom')}
          icon={<BottomIcon />}
        />
      )}
      <Dropdown
        trigger={['click']}
        placement='topLeft'
        menu={{
          items: [
            {
              key: 'delete',
              danger: true,
              label: localeMsg('page.chat.action.current.delete'),
            },
            {
              key: 'create',
              label: localeMsg('page.chat.action.create'),
            },
            // {
            //   key: 'chatList',
            //   label: localeMsg('page.chat.action.list'),
            //   children: [
            //     ...chatStore.sessions.map((d, index) => ({
            //       key: d.id,
            //       label: (
            //         <Space>
            //           {d.topic}
            //           <DeleteOutlined
            //             onClick={(e) => {
            //               e.preventDefault();
            //               e.stopPropagation();
            //               chatStore.deleteSession(index);
            //             }}
            //           />
            //         </Space>
            //       ),
            //     })),
            //     { key: 'deleteAll', danger: true, label: localeMsg('page.chat.action.deleteAll') },
            //   ],
            // },
            // { key: 'settingCurrent', label: localeMsg('page.chat.action.current.setting') },
          ],
          onClick: e => {
            if (!e.key) return;
            if (e.key === 'delete') {
              chatStore.deleteSession(chatStore.currentSessionIndex);
            }
            if (e.key === 'create') {
              chatStore.newSession();
            } else if (e.key === 'deleteAll') {
              chatStore.clearSessions();
            } else {
              const sessionIndex = chatStore.sessions.findIndex(d => d.id === e.key);
              if (sessionIndex >= 0) {
                chatStore.selectSession(sessionIndex);
              }
            }
            // else if (e.key === 'settingCurrent') {
            //   props.showPromptModal();
            // }
          },
        }}
      >
        <div>
          <ChatAction text={localeMsg('page.chat.action.setting')} icon={<SettingsIcon />} />
        </div>
      </Dropdown>
      {/*<ChatAction*/}
      {/*  onClick={nextTheme}*/}
      {/*  text={Locale.Chat.InputActions.Theme[theme]}*/}
      {/*  icon={*/}
      {/*    <>*/}
      {/*      {theme === Theme.Auto ? (*/}
      {/*        <AutoIcon />*/}
      {/*      ) : theme === Theme.Light ? (*/}
      {/*        <LightIcon />*/}
      {/*      ) : theme === Theme.Dark ? (*/}
      {/*        <DarkIcon />*/}
      {/*      ) : null}*/}
      {/*    </>*/}
      {/*  }*/}
      {/*/>*/}

      <ChatAction onClick={props.showPromptHints} text={Locale.Chat.InputActions.Prompt} icon={<PromptIcon />} />

      {/*<ChatAction*/}
      {/*  onClick={() => {*/}
      {/*    navigateChat(Path.Masks);*/}
      {/*  }}*/}
      {/*  text={Locale.Chat.InputActions.Masks}*/}
      {/*  icon={<MaskIcon />}*/}
      {/*/>*/}

      {/*<ChatAction*/}
      {/*  text={Locale.Chat.InputActions.Clear}*/}
      {/*  icon={<BreakIcon />}*/}
      {/*  onClick={() => {*/}
      {/*    chatStore.updateCurrentSession((session) => {*/}
      {/*      if (session.clearContextIndex === session.messages.length) {*/}
      {/*        session.clearContextIndex = undefined;*/}
      {/*      } else {*/}
      {/*        session.clearContextIndex = session.messages.length;*/}
      {/*        session.memoryPrompt = ''; // will clear memory*/}
      {/*      }*/}
      {/*    });*/}
      {/*  }}*/}
      {/*/>*/}

      {/*<Dropdown*/}
      {/*  trigger={['click']}*/}
      {/*  menu={{*/}
      {/*    items: models.map((d) => ({ key: d.name, label: d.displayName })),*/}
      {/*    onClick: (e) => {*/}
      {/*      if (!e.key) return;*/}
      {/*      chatStore.updateCurrentSession((session) => {*/}
      {/*        session.mask.modelConfig.model = e.key as ModelType;*/}
      {/*        session.mask.syncGlobalConfig = false;*/}
      {/*      });*/}
      {/*      showToast(e.key);*/}
      {/*    },*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <div>*/}
      {/*    <ChatAction text={currentModel} icon={<RobotIcon />} />*/}
      {/*  </div>*/}
      {/*</Dropdown>*/}
    </Space>
  );
}

export function EditMessageModal(props: {
  chatType?: EnumChatStoreType;
  sessionIndex: number;
  showMessageEdit?: boolean;
  onClose: () => void;
}) {
  const chatStore = getChatStoreMethod(props.chatType)();
  const session = chatStore.sessions[props.sessionIndex];
  const [messages, setMessages] = useState(session.messages.slice());

  return (
    <Modal
      title={localeMsg('page.chat.topic.edit')}
      onClose={props.onClose}
      actions={[
        <Button key='cancel' onClick={() => props.onClose()}>
          {localeMsg('pages.cancel')}
        </Button>,
        <Button
          key='ok'
          type='primary'
          onClick={() => {
            chatStore.updateCurrentSession(session => (session.messages = messages));
            props.onClose();
          }}
        >
          {localeMsg('pages.ok')}
        </Button>,
      ]}
    >
      <Row gutter={16} style={{ margin: '24px 25px 24px 16px', lineHeight: '32px' }}>
        <Col flex='none'>{localeMsg('page.chat.topic')}</Col>
        <Col flex='auto'>
          <Input
            value={session.topic}
            onInput={e => chatStore.updateCurrentSession(session => (session.topic = e.currentTarget.value))}
          />
        </Col>
      </Row>
      {props.showMessageEdit && (
        <ContextPrompts
          context={messages}
          updateContext={updater => {
            const newMessages = messages.slice();
            updater(newMessages);
            setMessages(newMessages);
          }}
        />
      )}
    </Modal>
  );
}

type RenderMessage = ChatMessage & { preview?: boolean };

interface IChatMessageItemProps {
  index: number;
  clearContextIndex: number;
  chatType?: EnumChatStoreType;
  scopeData?: string | string[];
  message: RenderMessage;
  messages: RenderMessage[];
  context: RenderMessage[];
  isMobileScreen: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  onUserStop: (id: string) => void;
  onResend: (message: ChatMessage) => void;
  onDelete: (msgId: string) => void;
  onPinMessage: (message: ChatMessage) => void;
  onRightClick: (e: any, message: ChatMessage) => void;
  setUserInput: (input: string) => void;
  onSourceChatMessage?: (data: any, item: any) => void;
}

function ChatMessageItem(props: IChatMessageItemProps) {
  const {
    message,
    context,
    index,
    clearContextIndex,
    messages,
    scrollRef,
    isMobileScreen,
    scopeData,
    onUserStop,
    onResend,
    onDelete,
    onPinMessage,
    onRightClick,
    setUserInput,
    onSourceChatMessage,
  } = props;
  const { flowDataList } = message;
  const config = useAppConfig();
  const chatStore = getChatStoreMethod(props.chatType)();
  const chatWrapperStore = useChatWrapperStore();
  const session = chatStore.currentSession();
  const isUser = message.role === 'user';
  const isContext = index < context.length;
  const showActions = index >= 0 && !message.preview && !isContext; //index > 0 && !(message.preview || message.content.length === 0) && !isContext;
  // const showTyping = message.preview || message.streaming;
  const shouldShowClearContextDivider = index === clearContextIndex - 1;

  const findMessage = (chatSession: ChatSession) => {
    return chatSession.mask.context.concat(chatSession.messages).find(m => m.id === message.id);
  };

  const renderFlow = useMemo(() => {
    if (!flowDataList) return null;
    return <ProcessFlow message={message} biData={session.biData} chatType={props.chatType} scopeData={scopeData} />;
  }, [session.biData, flowDataList]);

  const hasExtension = renderFlow;

  const renderMessage = useMemo(() => {
    // return message.streaming && !message.content.length && !isUser ? 'loading' : message.content;
    const content = message.content ?? '';
    if (typeof content === 'object') {
      return content;
    }
    return (
      <Markdown
        content={content}
        loading={message.streaming && !content.length && !isUser}
        // loading={(message.preview || message.streaming) && message.content.length === 0 && !isUser}
        onContextMenu={(e: any) => onRightClick(e, message)}
        onDoubleClickCapture={() => {
          if (!isMobileScreen) return;
          setUserInput(content);
        }}
        parentRef={scrollRef}
        fontSize={config.fontSize}
        // defaultShow={index >= messages.length - 6}
      />
    );
  }, [message.content, message.streaming]);

  const chatAvatar = (
    <div className={styles['chat-message-avatar']}>
      {/*<div className={styles['chat-message-edit']}>*/}
      {/*  <IconButton*/}
      {/*    icon={<EditIcon />}*/}
      {/*    onClick={async () => {*/}
      {/*      const newMessage = await showPrompt(*/}
      {/*        Locale.Chat.Actions.Edit,*/}
      {/*        message.content,*/}
      {/*        10,*/}
      {/*      );*/}
      {/*      chatStore.updateCurrentSession((d) => {*/}
      {/*        const m = findMessage(d);*/}
      {/*        if (m) {*/}
      {/*          m.content = newMessage;*/}
      {/*        }*/}
      {/*      });*/}
      {/*    }}*/}
      {/*  ></IconButton>*/}
      {/*</div>*/}
      {isUser ? (
        <CommonAvatar isUser={true} />
      ) : (
        // <Avatar avatar={config.avatar} />
        <>
          {['system'].includes(message.role) ? (
            <Avatar avatar='2699-fe0f' />
          ) : (
            <CommonAvatar isUser={false} />
            // <MaskAvatar
            //   avatar={session.mask.avatar}
            //   model={message.model || session.mask.modelConfig.model}
            // />
          )}
        </>
      )}
    </div>
  );

  return (
    <Fragment key={message.id}>
      <div className={isUser ? styles['chat-message-user'] : styles['chat-message']}>
        {message.question ? (
          <div className={styles['chat-message-processing']}>
            <Space size={18}>
              <img width={16} src={ICON_READY} />
              <span>
                {localeMsg('page.chat.processing')}
                <Typography.Text ellipsis={true} className={styles['chat-message-processing-question']}>
                  {message.question}
                </Typography.Text>
              </span>
            </Space>
            <Space size={18}>
              <img width={16} src={ICON_READY} />
              <span className={styles['chat-message-processing-result']}>
                {localeMsg('page.chat.processing.result')}
              </span>
            </Space>
          </div>
        ) : (
          <div className={styles['chat-message-processing-user']} />
        )}
        <div
          className={classNames(styles['chat-message-container'], {
            [styles['hello-message']]: message.isHello,
            [styles['chat-message-container-extension']]: hasExtension,
          })}
        >
          <div
            className={classNames(styles['chat-message-header'], {
              [styles['chat-message-header-user']]: isUser,
            })}
          >
            {showActions && (
              <div className={styles['chat-message-actions']}>
                {!message.streaming && (
                  //   <ChatAction
                  //     text={localeMsg('page.chat.action.stop')}
                  //     icon={<StopIcon />}
                  //     onClick={() => onUserStop(message.id ?? index)}
                  //   />
                  // ) : (
                  <Space size={0} split={<Divider type='vertical' />} className={styles['chat-input-actions']}>
                    <Tooltip color={Constants.TOOLTIP_COLOR} title={localeMsg('page.chat.action.retry')}>
                      <Button
                        icon={<SyncOutlined />}
                        className={styles['chat-input-action']}
                        onClick={() => onResend(message)}
                      />
                    </Tooltip>

                    <Tooltip color={Constants.TOOLTIP_COLOR} title={localeMsg('page.chat.action.delete')}>
                      <Button
                        icon={<DeleteOutlined />}
                        className={styles['chat-input-action']}
                        onClick={() => onDelete(message.id ?? index)}
                      />
                    </Tooltip>

                    <Tooltip color={Constants.TOOLTIP_COLOR} title={localeMsg('page.chat.action.copy')}>
                      <Button
                        icon={<CopyIcon />}
                        className={styles['chat-input-action']}
                        onClick={() => copyToClipboard(message.content)}
                      />
                    </Tooltip>

                    {/*<ChatAction*/}
                    {/*  text={localeMsg('page.chat.action.retry')}*/}
                    {/*  icon={<SyncOutlined />}*/}
                    {/*  onClick={() => onResend(message)}*/}
                    {/*/>*/}

                    {/*<ChatAction*/}
                    {/*  text={localeMsg('page.chat.action.delete')}*/}
                    {/*  icon={<DeleteOutlined />}*/}
                    {/*  onClick={() => onDelete(message.id ?? index)}*/}
                    {/*/>*/}

                    {/*<ChatAction*/}
                    {/*  text={Locale.Chat.Actions.Pin}*/}
                    {/*  icon={<PinIcon />}*/}
                    {/*  onClick={() => onPinMessage(message)}*/}
                    {/*/>*/}
                    {/*<ChatAction*/}
                    {/*  text={localeMsg('page.chat.action.copy')}*/}
                    {/*  icon={<img src={CopyIcon} />}*/}
                    {/*  onClick={() => copyToClipboard(message.content)}*/}
                    {/*/>*/}
                  </Space>
                )}
              </div>
            )}
          </div>
          {/*{showTyping && <div className={styles['chat-message-status']}>{Locale.Chat.Typing}</div>}*/}
          <Space size={4} className={styles['chat-message-space']}>
            {isUser ? null : chatAvatar}
            <div className={styles['chat-message-item']}>{renderFlow || renderMessage}</div>
            {isUser ? chatAvatar : null}
          </Space>

          <div
            className={classNames(styles['chat-message-action-date'], {
              [styles['chat-message-action-date-user']]: isUser,
            })}
          >
            {message.date.toLocaleString()}
            {/*{isContext ? Locale.Chat.IsContext : message.date.toLocaleString()}*/}
          </div>
          {!isUser && (
            <div
              className={classNames(styles['chat-message-action-stop'], {
                [styles['chat-message-action-stop-streaming']]: message.streaming,
              })}
            >
              <Button icon={<BorderOutlined />} onClick={() => onUserStop(message.id ?? index)}>
                {localeMsg('page.chat.input.action.stop')}
              </Button>
              {/*<ChatAction*/}
              {/*  text={localeMsg('page.chat.action.stop')}*/}
              {/*  icon={<StopIcon />}*/}
              {/*  onClick={() => onUserStop(message.id ?? index)}*/}
              {/*/>*/}
            </div>
          )}
          {!isUser && <Feedback message={message} chatType={props.chatType} scopeData={scopeData} />}
        </div>
      </div>
      {shouldShowClearContextDivider && <ClearContextDivider scopeData={props.scopeData} />}
    </Fragment>
  );
}

const _Chat = forwardRef(
  (
    props: {
      chatType?: EnumChatStoreType;
      scopeData?: string | string[];
      autoFocus?: boolean;
      renderHello?: () => ChatMessage;
      onScrollToBottom?: () => void;
      windowTitleRender?: (windowTitle: React.ReactElement, windowActions: React.ReactElement) => React.ReactElement;
    } = {},
    ref,
  ) => {
    const chatStore = getChatStoreMethod(props?.chatType)();
    const session = chatStore.currentSession();
    const config = useAppConfig();
    const [showExport, setShowExport] = useState(false);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const userInputRef = useRef<{ focused: boolean; keydown: boolean; value: string }>({
      focused: false,
      keydown: false,
      value: '',
    });
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { submitKey, shouldSubmit } = useSubmitHandler();
    const { scrollRef, setAutoScroll, scrollDomToBottom } = useScrollToBottom();
    const [hitBottom, setHitBottom] = useState(true);
    const isMobileScreen = useMobileScreen();
    const { navigateChat } = useChatPathStore();

    // prompt hints
    const promptStore = usePromptStore();
    const [promptHints, setPromptHints] = useState<RenderPompt[]>([]);
    const onSearch = useDebouncedCallback(
      (text: string) => {
        const matchedPrompts = promptStore.search(text);
        setPromptHints(matchedPrompts);
      },
      100,
      { leading: true, trailing: true },
    );

    // auto grow input
    const [inputRows, setInputRows] = useState(2);
    const measure = useDebouncedCallback(
      () => {
        const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
        const inputRows = Math.min(2, Math.max(2, rows));
        setInputRows(inputRows);
      },
      100,
      {
        leading: true,
        trailing: true,
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(measure, [userInput]);

    // chat commands shortcuts
    const chatCommands = useChatCommand({
      // new: () => chatStore.newSession(),
      // newm: () => navigateChat(Path.NewChat),
      // prev: () => chatStore.nextSession(-1),
      // next: () => chatStore.nextSession(1),
      // clear: () =>
      //   chatStore.updateCurrentSession(
      //     (session) => (session.clearContextIndex = session.messages.length),
      //   ),
      // del: () => chatStore.deleteSession(chatStore.currentSessionIndex),
    });

    // only search prompts when user input is short
    const SEARCH_TEXT_LIMIT = 30;
    const onInput = (text: string) => {
      setUserInput(text);
      const n = text.trim().length;

      // clear search results
      if (n === 0) {
        setPromptHints([]);
        // } else if (text.startsWith(ChatCommandPrefix)) {
        //   setPromptHints(chatCommands.search(text));
      } else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
        // check if need to trigger auto completion
        if (text.startsWith('/')) {
          let searchText = text.slice(1);
          onSearch(searchText);
        }
      }
    };

    const doSubmit = (userInput: string) => {
      if (userInput.trim() === '') return;
      const matchCommand = chatCommands.match(userInput);
      if (matchCommand.matched) {
        setUserInput('');
        setPromptHints([]);
        matchCommand.invoke();
        return;
      }
      setIsLoading(true);
      chatStore.onUserInput(userInput).then(() => setIsLoading(false));
      localStorage.setItem(LAST_INPUT_KEY, userInput);
      userInputRef.current.value = '';
      setUserInput('');
      setPromptHints([]);
      if (!isMobileScreen) inputRef.current?.focus();
      setAutoScroll(true);
      props?.onScrollToBottom?.();
    };

    const onPromptSelect = (prompt: RenderPompt) => {
      setTimeout(() => {
        setPromptHints([]);

        const matchedChatCommand = chatCommands.match(prompt.content);
        if (matchedChatCommand.matched) {
          // if user is selecting a chat command, just trigger it
          matchedChatCommand.invoke();
          setUserInput('');
        } else {
          // or fill the prompt
          setUserInput(prompt.content);
        }
        inputRef.current?.focus();
      }, 30);
    };

    // stop response
    const onUserStop = (messageId: string) => {
      chatStore.updateCurrentSession((session: ChatSession) => {
        const msgItem = session.messages.find(d => d.id === messageId);
        if (msgItem?.flowDataList) {
          msgItem.streaming = false;
          msgItem.flowDataList = msgItem.flowDataList.map(d => {
            if (d.status === EnumStepStatus.running) {
              d.status = EnumStepStatus.cancel;
              d.step_list.forEach(s => {
                if (s.status === EnumStepStatus.running) {
                  s.status = EnumStepStatus.cancel;
                }
              });
            }
            return { ...d };
          });
        }
      });
      ChatControllerPool.stop(session.id, messageId);
    };

    useImperativeHandle(ref, () => {
      return {
        inputRef,
        doSubmit,
        setUserInput,
      };
    });

    useEffect(() => {
      chatStore.updateCurrentSession((session: ChatSession) => {
        const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
        session.messages.forEach(m => {
          // check if should stop all stale messages
          if (m.isError || new Date(m.date).getTime() < stopTiming) {
            if (m.streaming) {
              m.streaming = false;
            }

            if (m.content === undefined || m.content === null || m.content.length === 0) {
              m.isError = true;
              m.content = prettyObject({
                error: true,
                message: 'empty response',
              });
            }
          }
        });

        // auto sync mask config from global config
        if (session.mask?.syncGlobalConfig) {
          console.log('[Mask] syncing from global, name = ', session.mask.name);
          session.mask.modelConfig = { ...config.modelConfig };
        }
      });
      window.addEventListener('beforeunload', () => {
        chatStore.updateCurrentSession((session: ChatSession) => {
          session.messages.forEach(d => {
            if (d.streaming) {
              d.streaming = false;
            }
            if (d.flowDataList) {
              d.flowDataList.forEach(d => {
                if (d.status === EnumStepStatus.running) {
                  d.status = EnumStepStatus.cancel;
                  d.step_list.forEach(s => {
                    if (s.status === EnumStepStatus.running) {
                      s.status = EnumStepStatus.cancel;
                    }
                  });
                }
              });
            }
          });
        });
      });
    }, []);

    // check if should send message
    const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // if ArrowUp and no userInput, fill with last input
      if (e.key === 'ArrowUp' && userInput.length <= 0 && !(e.metaKey || e.altKey || e.ctrlKey)) {
        setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? '');
        e.preventDefault();
        return;
      }
      if (shouldSubmit(e) && promptHints.length === 0) {
        doSubmit(userInput);
        e.preventDefault();
        return;
      }
      userInputRef.current.keydown = true;
    };

    const onRightClick = (e: any, message: ChatMessage) => {
      // copy to clipboard
      if (selectOrCopy(e.currentTarget, message.content)) {
        if (userInput.length === 0) {
          setUserInput(message.content);
        }

        e.preventDefault();
      }
    };

    const deleteMessage = (msgId?: string) => {
      chatStore.updateCurrentSession((session: ChatSession) => {
        const msgItem = session.messages.find(d => d.id === msgId);
        if (msgItem?.flowDataList) {
          msgItem.streaming = false;
          msgItem.flowDataList = msgItem.flowDataList.map(d => ({
            ...d,
            status: EnumStepStatus.cancel,
          }));
        }
        session.messages = session.messages.filter(m => m.id !== msgId);
      });
    };

    const onDelete = (msgId: string) => {
      deleteMessage(msgId);
    };

    const onResend = (message: ChatMessage) => {
      // when it is resending a message
      // 1. for a user's message, find the next bot response
      // 2. for a bot's message, find the last user's input
      // 3. delete original user input and bot's message
      // 4. resend the user's input

      const resendingIndex = session.messages.findIndex((m: ChatMessage) => m.id === message.id);

      if (resendingIndex < 0 || resendingIndex >= session.messages.length) {
        console.error('[Chat] failed to find resending message', message);
        return;
      }

      let userMessage: ChatMessage | undefined;
      let botMessage: ChatMessage | undefined;

      if (message.role === 'assistant') {
        // if it is resending a bot's message, find the user input for it
        botMessage = message;
        for (let i = resendingIndex; i >= 0; i -= 1) {
          if (session.messages[i].role === 'user') {
            userMessage = session.messages[i];
            break;
          }
        }
      } else if (message.role === 'user') {
        // if it is resending a user's input, find the bot's response
        userMessage = message;
        for (let i = resendingIndex; i < session.messages.length; i += 1) {
          if (session.messages[i].role === 'assistant') {
            botMessage = session.messages[i];
            break;
          }
        }
      }

      if (userMessage === undefined) {
        console.error('[Chat] failed to resend', message);
        return;
      }

      // delete the original messages
      deleteMessage(userMessage.id);
      deleteMessage(botMessage?.id);

      // resend the message
      setIsLoading(true);
      chatStore
        .onUserInput(userMessage.content, { searchChat: userMessage.searchChat })
        .then(() => setIsLoading(false));
      inputRef.current?.focus();
    };

    const onPinMessage = (message: ChatMessage) => {
      chatStore.updateCurrentSession(session => session.mask.context.push(message));

      showToast(Locale.Chat.Actions.PinToastContent, {
        text: Locale.Chat.Actions.PinToastAction,
        onClick: () => {
          setShowPromptModal(true);
        },
      });
    };

    const context: RenderMessage[] = useMemo(() => {
      return session.mask.hideContext ? [] : session.mask.context.slice();
    }, [session.mask.context, session.mask.hideContext]);
    const accessStore = useAccessStore();
    if (!context[0]?.isHello) {
      context.unshift(props.renderHello ? props.renderHello() : BOT_HELLO());
    }

    // preview messages
    const renderMessages = useMemo(() => {
      return context
        .concat(session.messages as RenderMessage[])
        .concat(
          isLoading
            ? [
                {
                  ...createMessage({
                    role: 'assistant',
                    content: '……',
                  }),
                  preview: true,
                },
              ]
            : [],
        )
        .concat(
          userInput.length > 0 && config.sendPreviewBubble
            ? [
                {
                  ...createMessage({
                    role: 'user',
                    content: userInput,
                  }),
                  preview: true,
                },
              ]
            : [],
        );
    }, [config.sendPreviewBubble, context, isLoading, session.messages, userInput]);

    const [msgRenderIndex, _setMsgRenderIndex] = useState(Math.max(0, renderMessages.length - CHAT_PAGE_SIZE));

    function setMsgRenderIndex(newIndex: number) {
      _setMsgRenderIndex(Math.max(0, Math.min(renderMessages.length - CHAT_PAGE_SIZE, newIndex)));
    }

    const messages = useMemo(() => {
      const endRenderIndex = Math.min(msgRenderIndex + 3 * CHAT_PAGE_SIZE, renderMessages.length);
      return renderMessages.slice(msgRenderIndex, endRenderIndex);
    }, [msgRenderIndex, renderMessages]);

    const onChatBodyScroll = (e: HTMLElement) => {
      const bottomHeight = e.scrollTop + e.clientHeight;
      const edgeThreshold = e.clientHeight;

      const isTouchTopEdge = e.scrollTop <= edgeThreshold;
      const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
      const isHitBottom = bottomHeight >= e.scrollHeight - (isMobileScreen ? 4 : 10);

      const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
      const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

      if (isTouchTopEdge && !isTouchBottomEdge) {
        setMsgRenderIndex(prevPageMsgIndex);
      } else if (isTouchBottomEdge) {
        setMsgRenderIndex(nextPageMsgIndex);
      }

      setHitBottom(isHitBottom);
      setAutoScroll(isHitBottom);
    };

    function scrollToBottom() {
      setMsgRenderIndex(renderMessages.length - CHAT_PAGE_SIZE);
      scrollDomToBottom();
      props?.onScrollToBottom?.();
    }

    const onInputFocus = () => {
      userInputRef.current.focused = true;
      userInputRef.current.value = userInput;
      scrollToBottom();
    };

    const onInputBlur = () => {
      userInputRef.current.value = userInput;
      userInputRef.current.keydown = false;
      userInputRef.current.focused = false;
    };

    // clear context index = context length + index in messages
    const clearContextIndex =
      (session.clearContextIndex ?? -1) >= 0 ? session.clearContextIndex! + context.length - msgRenderIndex : -1;

    const [showPromptModal, setShowPromptModal] = useState(false);

    const clientConfig = useMemo(() => getClientConfig(), []);

    const autoFocus = props.autoFocus !== undefined ? props.autoFocus : !isMobileScreen; // wont auto focus on mobile screen
    const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

    useCommand({
      fill: setUserInput,
      submit: text => {
        doSubmit(text);
      },
      code: text => {
        if (accessStore.disableFastLink) return;
        console.log('[Command] got code from url: ', text);
        showConfirm(Locale.URLCommand.Code + `code = ${text}`).then(res => {
          if (res) {
            accessStore.update(access => (access.accessCode = text));
          }
        });
      },
      settings: text => {
        if (accessStore.disableFastLink) return;

        try {
          const payload = JSON.parse(text) as {
            key?: string;
            url?: string;
          };

          console.log('[Command] got settings from url: ', payload);

          if (payload.key || payload.url) {
            showConfirm(Locale.URLCommand.Settings + `\n${JSON.stringify(payload, null, 4)}`).then(res => {
              if (!res) return;
              if (payload.key) {
                accessStore.update(access => (access.openaiApiKey = payload.key!));
              }
              if (payload.url) {
                accessStore.update(access => (access.openaiUrl = payload.url!));
              }
            });
          }
        } catch {
          console.error('[Command] failed to get settings from url: ', text);
        }
      },
    });

    // edit / insert message modal
    const [isEditingMessage, setIsEditingMessage] = useState<undefined | number>(undefined);

    // remember unfinished input
    useEffect(() => {
      // try to load from local storage
      const key = UNFINISHED_INPUT(session.id);
      const mayBeUnfinishedInput = localStorage.getItem(key);
      if (mayBeUnfinishedInput && userInput.length === 0) {
        setUserInput(mayBeUnfinishedInput);
        localStorage.removeItem(key);
      }

      const dom = inputRef.current;
      return () => {
        localStorage.setItem(key, dom?.value ?? '');
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSourceChatMessage = (data: any, info: any) => {
      let query = '';
      if (info.key === 'keywords' || info.key === 'bomNodes' || info.key === 'jobNodes' || info.key === 'flowNodes') {
        query = `${data.id}相关的文档有哪些？`;
      }
      chatStore.onUserInput(query, { sourceInfo: { data, info } }).then(() => setIsLoading(false));
    };

    const chatWrapperStore = useChatWrapperStore();

    const topMenuItems: any[] = chatStore.sessions.map((d, index) => ({
      key: d.id,
      className: classNames({ isActive: index === chatStore.currentSessionIndex }),
      label: (
        <Row gutter={12}>
          <Col flex='auto'>{d.topic}</Col>
          <Col flex='none'>
            <EditOutlined
              onClick={() => {
                setIsEditingMessage(index);
              }}
            />
          </Col>
          <Col flex='none'>
            <DeleteOutlined onClick={() => chatStore.deleteSession(index)} />
          </Col>
        </Row>
      ),
    }));
    topMenuItems.push({
      key: 'addSession',
      className: '',
      label: localeMsg('page.chat.action.create'),
    });

    const handleShowPromptHints = () => {
      // Click again to close
      if (promptHints.length > 0) {
        setPromptHints([]);
        return;
      }
      inputRef.current?.focus();
      setUserInput('/');
      onSearch('');
    };

    const defaultWindowTitle = (
      <div className={`window-header-title`}>
        <Dropdown
          placement='bottomLeft'
          autoAdjustOverflow={false}
          getPopupContainer={d => d.parentElement?.parentElement || document.body}
          overlayClassName={styles['chat-body-main-title-dropdown']}
          menu={{
            items: topMenuItems,
            onClick: e => {
              if (e.key === 'addSession') {
                chatStore.newSession();
                return;
              }
              const sessionIndex = chatStore.sessions.findIndex(d => d.id === e.key);
              if (sessionIndex >= 0) {
                chatStore.selectSession(sessionIndex);
              }
            },
          }}
        >
          <Space size={16} className={styles['chat-body-main-title-wrapper']}>
            <div className={`window-header-main-title ${styles['chat-body-main-title']}`}>
              {!session.topic ? DEFAULT_TOPIC() : session.topic}
            </div>
            <img className={styles['chat-body-main-title-down']} src={ICON_DOWN} />
          </Space>
        </Dropdown>
      </div>
    );

    const defaultWindowActions = (
      <div className='window-actions'>
        {/*{showMaxIcon && (*/}
        {/*  <div className="window-action-button">*/}
        {/*    <IconButton*/}
        {/*      icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}*/}
        {/*      bordered*/}
        {/*      onClick={() => {*/}
        {/*        config.update((config) => (config.tightBorder = !config.tightBorder));*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*)}*/}
        {/*<div className="window-action-button chat-top-action">*/}
        {/*  <IconFont*/}
        {/*    type={chatWrapperStore.chatFullscreen ? 'icon-catlshrink' : 'icon-catlexpand'}*/}
        {/*    onClick={() => chatWrapperStore.toggleFullscreen()}*/}
        {/*  />*/}
        {/*</div>*/}
        <div className='window-action-button chat-top-action'>
          <CloseOutlined onClick={() => chatWrapperStore.toggleShowChat(false)} />
        </div>
      </div>
    );

    const windowHeader = props.windowTitleRender ? (
      props.windowTitleRender(defaultWindowTitle, defaultWindowActions)
    ) : (
      <div className='window-header'>
        {/*{isMobileScreen && (*/}
        {/*  <div className="window-actions">*/}
        {/*    <div className={'window-action-button'}>*/}
        {/*      <IconButton*/}
        {/*        icon={<ReturnIcon />}*/}
        {/*        bordered*/}
        {/*        title={Locale.Chat.Actions.ChatList}*/}
        {/*        onClick={() => navigateChat(Path.Home)}*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}

        {/*<div className={`window-header-title ${styles['chat-body-title']}`}>*/}
        {/*  <div*/}
        {/*    className={`window-header-main-title ${styles['chat-body-main-title']}`}*/}
        {/*    onClickCapture={() => setIsEditingMessage(true)}*/}
        {/*  >*/}
        {/*    {!session.topic ? DEFAULT_TOPIC : session.topic}*/}
        {/*  </div>*/}
        {/*  <div className="window-header-sub-title">*/}
        {/*    {Locale.Chat.SubTitle(session.messages.length)}*/}
        {/*  </div>*/}
        {/*</div>*/}
        {/*<div className="window-actions">*/}
        {/*  {!isMobileScreen && (*/}
        {/*    <div className="window-action-button">*/}
        {/*      <IconButton*/}
        {/*        icon={<RenameIcon />}*/}
        {/*        bordered*/}
        {/*        onClick={() => setIsEditingMessage(true)}*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  )}*/}
        {/*  <div className="window-action-button">*/}
        {/*    <IconButton*/}
        {/*      icon={<ExportIcon />}*/}
        {/*      bordered*/}
        {/*      title={Locale.Chat.Actions.Export}*/}
        {/*      onClick={() => {*/}
        {/*        setShowExport(true);*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*  {showMaxIcon && (*/}
        {/*    <div className="window-action-button">*/}
        {/*      <IconButton*/}
        {/*        icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}*/}
        {/*        bordered*/}
        {/*        onClick={() => {*/}
        {/*          config.update((config) => (config.tightBorder = !config.tightBorder));*/}
        {/*        }}*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  )}*/}
        {/*</div>*/}
        {defaultWindowTitle}
        {defaultWindowActions}
      </div>
    );

    return (
      <div className={classNames(styles.chat, { [styles['chat-scope-data']]: !!props?.scopeData })} key={session.id}>
        {windowHeader}
        <div
          className={styles['chat-body']}
          ref={scrollRef}
          onScroll={e => onChatBodyScroll(e.currentTarget)}
          onMouseDown={() => inputRef.current?.blur()}
          onTouchStart={() => {
            inputRef.current?.blur();
            setAutoScroll(false);
          }}
        >
          <div className={styles['chat-body-content']}>
            {!props.scopeData && messages.length <= 0 && <Reminder />}
            {messages.map((message, i) => {
              const options: IChatMessageItemProps = {
                message,
                messages,
                context,
                index: i,
                clearContextIndex,
                scrollRef,
                isMobileScreen,
                onUserStop,
                onResend,
                onDelete,
                onPinMessage,
                onRightClick,
                setUserInput,
                onSourceChatMessage,
                scopeData: props?.scopeData,
              };
              return <ChatMessageItem key={message.id} {...options} />;
            })}
          </div>
        </div>

        <div className={styles['chat-input-panel']}>
          <div className={styles['chat-input-panel-content']}>
            {/*<PromptHints prompts={promptHints} onPromptSelect={onPromptSelect} />*/}
            {/*<ChatActions*/}
            {/*  messages={messages}*/}
            {/*  scopeData={props?.scopeData}*/}
            {/*  showPromptModal={() => setShowPromptModal(true)}*/}
            {/*  scrollToBottom={scrollToBottom}*/}
            {/*  hitBottom={hitBottom}*/}
            {/*  showPromptHints={handleShowPromptHints}*/}
            {/*/>*/}
            <div
              className={styles['chat-input-panel-inner-wrapper']}
              style={{ height: props?.scopeData ? 22 * inputRows + 34 : 22 * inputRows + 14 }}
            >
              <div className={styles['chat-input-panel-inner-action']}>
                <Button
                  onClick={() => {
                    chatStore.updateCurrentSession((d: ChatSession) => {
                      d.messages = [];
                    });
                  }}
                  className={classNames(styles['chat-input-panel-inner-action-clear'])}
                />
              </div>
              <div
                className={classNames(styles['chat-input-panel-inner'], {
                  [styles['show-file-uploader']]: showFileUploader(session),
                })}
              >
                <textarea
                  ref={inputRef}
                  className={styles['chat-input']}
                  placeholder={localeMsg('page.chat.placeholder')}
                  onInput={e => onInput(e.currentTarget.value)}
                  value={userInput}
                  onKeyDown={onInputKeyDown}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  onClick={scrollToBottom}
                  rows={inputRows}
                  autoFocus={autoFocus}
                  style={{
                    fontSize: config.fontSize,
                  }}
                />
                <FileUploader chatSession={session} chatType={props.chatType} />
                {/*<Dropdown*/}
                {/*  trigger={['click']}*/}
                {/*  menu={{*/}
                {/*    items: [*/}
                {/*      {*/}
                {/*        key: 'clear',*/}
                {/*        danger: true,*/}
                {/*        label: localeMsg('page.chat.action.current.delete'),*/}
                {/*      },*/}
                {/*      { key: 'settingCurrent', label: localeMsg('page.chat.action.current.setting') },*/}
                {/*    ],*/}
                {/*    onClick: (e) => {*/}
                {/*      if (!e.key) return;*/}
                {/*      if (e.key === 'clear') {*/}
                {/*      }*/}
                {/*    },*/}
                {/*  }}*/}
                {/*>*/}
                {/*  <Button className={classNames(styles['chat-input-setting'])} />*/}
                {/*</Dropdown>*/}
                <Button
                  onClick={() => doSubmit(userInput)}
                  className={classNames(styles['chat-input-send'], {
                    [styles['large']]: inputRows > 1,
                    [styles['chat-input-send-active']]: !!userInput?.length,
                  })}
                />
              </div>
            </div>
            {!props?.scopeData ? (
              <div className={styles['chat-input-panel-protect']}>
                <SafetyCertificateFilled />
                {localeMsg('page.chat.protect')}
              </div>
            ) : (
              <div className={styles['chat-input-panel-protect']}>
                <SafetyCertificateFilled />
                {localeMsg('page.chat.scope.message')}
              </div>
            )}
          </div>
        </div>
        {showExport && <ExportMessageModal onClose={() => setShowExport(false)} />}
        {isEditingMessage !== undefined && (
          <EditMessageModal sessionIndex={isEditingMessage} onClose={() => setIsEditingMessage(undefined)} />
        )}
        <PromptToast
          scopeData={props?.scopeData}
          // showToast={!hitBottom}
          showModal={showPromptModal}
          setShowModal={setShowPromptModal}
        />
      </div>
    );
  },
);

const Chat = forwardRef(
  (
    props: {
      chatType?: EnumChatStoreType;
      scopeData?: string | string[];
      autoFocus?: boolean;
      renderHello?: () => ChatMessage;
      onScrollToBottom?: () => void;
      windowTitleRender?: (windowTitle: React.ReactElement, windowActions: React.ReactElement) => React.ReactElement;
    } = {},
    ref,
  ) => {
    const chatStore = getChatStoreMethod(props.chatType)();
    const sessionIndex = chatStore.currentSessionIndex;
    if (!chatStore.sessions?.length) {
      return null;
    }
    return <_Chat ref={ref} key={sessionIndex} {...props} />;
  },
);

export default Chat;
