import { useEffect, useMemo, useState } from 'react';
import AddIcon from '../icons/add.svg';
import ClearIcon from '../icons/clear.svg';
import CloseIcon from '../icons/close.svg';
import CloudFailIcon from '../icons/cloud-fail.svg';
import CloudSuccessIcon from '../icons/cloud-success.svg';
import ConfigIcon from '../icons/config.svg';
import ConfirmIcon from '../icons/confirm.svg';
import ConnectionIcon from '../icons/connection.svg';
import CopyIcon from '../icons/copy.svg';
import DownloadIcon from '../icons/download.svg';
import EditIcon from '../icons/edit.svg';
import EyeIcon from '../icons/eye.svg';
import ResetIcon from '../icons/reload.svg';
import LoadingIcon from '../icons/three-dots.svg';
import UploadIcon from '../icons/upload.svg';

import { ModelConfigList } from './model-config';
import { List, ListItem, Modal, Popover, showConfirm, showToast } from './ui-lib';

import {
  SubmitKey,
  Theme,
  useAccessStore,
  useAppConfig,
  useChatPathStore,
  useChatStore,
  useUpdateStore,
} from '../store';
import { IconButton } from './button';

import { Checkbox, Input, Select } from 'antd';
import { nanoid } from 'nanoid';
import Locale, { ALL_LANG_OPTIONS, AllLangs, changeLang, getLang } from '../chatLocales';
import { getClientConfig } from '../config/client';
import {
  Azure,
  OPENAI_BASE_URL,
  Path,
  RELEASE_URL,
  STORAGE_KEY,
  ServiceProvider,
  SlotID,
  UPDATE_URL,
} from '../constant';
import { useMaskStore } from '../store/mask';
import { Prompt, SearchService, usePromptStore } from '../store/prompt';
import { useSyncStore } from '../store/sync';
import { copyToClipboard } from '../utils';
import { ProviderType } from '../utils/cloud';
import { Avatar, AvatarPicker } from './emoji';
import { ErrorBoundary } from './error';
import { InputRange } from './input-range';

import styles from './settings.module.less';

function EditPromptModal(props: { id: string; onClose: () => void }) {
  const promptStore = usePromptStore();
  const prompt = promptStore.get(props.id);

  return prompt ? (
    <Modal
      title={Locale.Settings.Prompt.EditModal.Title}
      onClose={props.onClose}
      actions={[<IconButton key='' onClick={props.onClose} text={Locale.UI.Confirm} bordered />]}
    >
      <div className={styles['edit-prompt-modal']}>
        <Input
          value={prompt.title}
          readOnly={!prompt.isUser}
          className={styles['edit-prompt-title']}
          onInput={e => promptStore.updatePrompt(props.id, prompt => (prompt.title = e.currentTarget.value))}
        />
        <Input.TextArea
          value={prompt.content}
          readOnly={!prompt.isUser}
          className={styles['edit-prompt-content']}
          rows={10}
          onInput={e => promptStore.updatePrompt(props.id, prompt => (prompt.content = e.currentTarget.value))}
        ></Input.TextArea>
      </div>
    </Modal>
  ) : null;
}

function UserPromptModal(props: { onClose?: () => void }) {
  const promptStore = usePromptStore();
  const userPrompts = promptStore.getUserPrompts();
  const builtinPrompts = SearchService.builtinPrompts;
  const allPrompts = userPrompts.concat(builtinPrompts);
  const [searchInput, setSearchInput] = useState('');
  const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
  const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;

  const [editingPromptId, setEditingPromptId] = useState<string>();

  useEffect(() => {
    if (searchInput.length > 0) {
      const searchResult = SearchService.search(searchInput);
      setSearchPrompts(searchResult);
    } else {
      setSearchPrompts([]);
    }
  }, [searchInput]);

  return (
    <Modal
      title={Locale.Settings.Prompt.Modal.Title}
      onClose={() => props.onClose?.()}
      actions={[
        <IconButton
          key='add'
          onClick={() => {
            const promptId = promptStore.add({
              id: nanoid(),
              createdAt: Date.now(),
              title: 'Empty Prompt',
              content: 'Empty Prompt Content',
            });
            setEditingPromptId(promptId);
          }}
          icon={<AddIcon />}
          bordered
          text={Locale.Settings.Prompt.Modal.Add}
        />,
      ]}
    >
      <div className={styles['user-prompt-modal']}>
        <Input
          className={styles['user-prompt-search']}
          placeholder={Locale.Settings.Prompt.Modal.Search}
          value={searchInput}
          onInput={e => setSearchInput(e.currentTarget.value)}
        />

        <div className={styles['user-prompt-list']}>
          {prompts.map((v, _) => (
            <div className={styles['user-prompt-item']} key={v.id ?? v.title}>
              <div className={styles['user-prompt-header']}>
                <div className={styles['user-prompt-title']}>{v.title}</div>
                <div className={styles['user-prompt-content'] + ' one-line'}>{v.content}</div>
              </div>

              <div className={styles['user-prompt-buttons']}>
                {v.isUser && (
                  <IconButton
                    icon={<ClearIcon />}
                    className={styles['user-prompt-button']}
                    onClick={() => promptStore.remove(v.id!)}
                  />
                )}
                {v.isUser ? (
                  <IconButton
                    icon={<EditIcon />}
                    className={styles['user-prompt-button']}
                    onClick={() => setEditingPromptId(v.id)}
                  />
                ) : (
                  <IconButton
                    icon={<EyeIcon />}
                    className={styles['user-prompt-button']}
                    onClick={() => setEditingPromptId(v.id)}
                  />
                )}
                <IconButton
                  icon={<CopyIcon />}
                  className={styles['user-prompt-button']}
                  onClick={() => copyToClipboard(v.content)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {editingPromptId !== undefined && (
        <EditPromptModal id={editingPromptId!} onClose={() => setEditingPromptId(undefined)} />
      )}
    </Modal>
  );
}

function DangerItems() {
  const chatStore = useChatStore();
  const appConfig = useAppConfig();

  return (
    <List>
      <ListItem title={Locale.Settings.Danger.Reset.Title} subTitle={Locale.Settings.Danger.Reset.SubTitle}>
        <IconButton
          text={Locale.Settings.Danger.Reset.Action}
          onClick={async () => {
            if (await showConfirm(Locale.Settings.Danger.Reset.Confirm)) {
              appConfig.reset();
            }
          }}
          type='danger'
        />
      </ListItem>
      <ListItem title={Locale.Settings.Danger.Clear.Title} subTitle={Locale.Settings.Danger.Clear.SubTitle}>
        <IconButton
          text={Locale.Settings.Danger.Clear.Action}
          onClick={async () => {
            if (await showConfirm(Locale.Settings.Danger.Clear.Confirm)) {
              chatStore.clearAllData();
            }
          }}
          type='danger'
        />
      </ListItem>
    </List>
  );
}

function CheckButton() {
  const syncStore = useSyncStore();

  const couldCheck = useMemo(() => {
    return syncStore.coundSync();
  }, [syncStore]);

  const [checkState, setCheckState] = useState<'none' | 'checking' | 'success' | 'failed'>('none');

  async function check() {
    setCheckState('checking');
    const valid = await syncStore.check();
    setCheckState(valid ? 'success' : 'failed');
  }

  if (!couldCheck) return null;

  return (
    <IconButton
      text={Locale.Settings.Sync.Config.Modal.Check}
      bordered
      onClick={check}
      icon={
        checkState === 'none' ? (
          <ConnectionIcon />
        ) : checkState === 'checking' ? (
          <LoadingIcon />
        ) : checkState === 'success' ? (
          <CloudSuccessIcon />
        ) : checkState === 'failed' ? (
          <CloudFailIcon />
        ) : (
          <ConnectionIcon />
        )
      }
    ></IconButton>
  );
}

function SyncConfigModal(props: { onClose?: () => void }) {
  const syncStore = useSyncStore();

  return (
    <Modal
      title={Locale.Settings.Sync.Config.Modal.Title}
      onClose={() => props.onClose?.()}
      actions={[
        <CheckButton key='check' />,
        <IconButton key='confirm' onClick={props.onClose} icon={<ConfirmIcon />} bordered text={Locale.UI.Confirm} />,
      ]}
    >
      <List>
        <ListItem
          title={Locale.Settings.Sync.Config.SyncType.Title}
          subTitle={Locale.Settings.Sync.Config.SyncType.SubTitle}
        >
          <select
            value={syncStore.provider}
            onChange={e => {
              syncStore.update(config => (config.provider = e.target.value as ProviderType));
            }}
          >
            {Object.entries(ProviderType).map(([k, v]) => (
              <option value={v} key={k}>
                {k}
              </option>
            ))}
          </select>
        </ListItem>

        <ListItem title={Locale.Settings.Sync.Config.Proxy.Title} subTitle={Locale.Settings.Sync.Config.Proxy.SubTitle}>
          <Checkbox
            checked={syncStore.useProxy}
            onChange={e => {
              syncStore.update(config => (config.useProxy = e.target.checked));
            }}
          />
        </ListItem>
        {syncStore.useProxy ? (
          <ListItem
            title={Locale.Settings.Sync.Config.ProxyUrl.Title}
            subTitle={Locale.Settings.Sync.Config.ProxyUrl.SubTitle}
          >
            <Input
              value={syncStore.proxyUrl}
              onChange={e => {
                syncStore.update(config => (config.proxyUrl = e.currentTarget.value));
              }}
            />
          </ListItem>
        ) : null}
      </List>

      {syncStore.provider === ProviderType.WebDAV && (
        <>
          <List>
            <ListItem title={Locale.Settings.Sync.Config.WebDav.Endpoint}>
              <Input
                value={syncStore.webdav.endpoint}
                onChange={e => {
                  syncStore.update(config => (config.webdav.endpoint = e.currentTarget.value));
                }}
              />
            </ListItem>

            <ListItem title={Locale.Settings.Sync.Config.WebDav.UserName}>
              <Input
                value={syncStore.webdav.username}
                onChange={e => {
                  syncStore.update(config => (config.webdav.username = e.currentTarget.value));
                }}
              />
            </ListItem>
            <ListItem title={Locale.Settings.Sync.Config.WebDav.Password}>
              <Input.Password
                value={syncStore.webdav.password}
                onChange={e => {
                  syncStore.update(config => (config.webdav.password = e.currentTarget.value));
                }}
              ></Input.Password>
            </ListItem>
          </List>
        </>
      )}

      {syncStore.provider === ProviderType.UpStash && (
        <List>
          <ListItem title={Locale.Settings.Sync.Config.UpStash.Endpoint}>
            <Input
              value={syncStore.upstash.endpoint}
              onChange={e => {
                syncStore.update(config => (config.upstash.endpoint = e.currentTarget.value));
              }}
            />
          </ListItem>

          <ListItem title={Locale.Settings.Sync.Config.UpStash.UserName}>
            <Input
              value={syncStore.upstash.username}
              placeholder={STORAGE_KEY}
              onChange={e => {
                syncStore.update(config => (config.upstash.username = e.currentTarget.value));
              }}
            />
          </ListItem>
          <ListItem title={Locale.Settings.Sync.Config.UpStash.Password}>
            <Input.Password
              value={syncStore.upstash.apiKey}
              onChange={e => {
                syncStore.update(config => (config.upstash.apiKey = e.currentTarget.value));
              }}
            />
          </ListItem>
        </List>
      )}
    </Modal>
  );
}

function SyncItems() {
  const syncStore = useSyncStore();
  const chatStore = useChatStore();
  const promptStore = usePromptStore();
  const maskStore = useMaskStore();
  const couldSync = useMemo(() => {
    return syncStore.coundSync();
  }, [syncStore]);

  const [showSyncConfigModal, setShowSyncConfigModal] = useState(false);

  const stateOverview = useMemo(() => {
    const sessions = chatStore.sessions;
    const messageCount = sessions.reduce((p, c) => p + c.messages.length, 0);

    return {
      chat: sessions.length,
      message: messageCount,
      prompt: Object.keys(promptStore.prompts).length,
      mask: Object.keys(maskStore.masks).length,
    };
  }, [chatStore.sessions, maskStore.masks, promptStore.prompts]);

  return (
    <>
      <List>
        <ListItem
          title={Locale.Settings.Sync.CloudState}
          subTitle={
            syncStore.lastProvider
              ? `${new Date(syncStore.lastSyncTime).toLocaleString()} [${syncStore.lastProvider}]`
              : Locale.Settings.Sync.NotSyncYet
          }
        >
          <div style={{ display: 'flex' }}>
            <IconButton
              icon={<ConfigIcon />}
              text={Locale.UI.Config}
              onClick={() => {
                setShowSyncConfigModal(true);
              }}
            />
            {couldSync && (
              <IconButton
                icon={<ResetIcon />}
                text={Locale.UI.Sync}
                onClick={async () => {
                  try {
                    await syncStore.sync();
                    showToast(Locale.Settings.Sync.Success);
                  } catch (e) {
                    showToast(Locale.Settings.Sync.Fail);
                    console.error('[Sync]', e);
                  }
                }}
              />
            )}
          </div>
        </ListItem>

        <ListItem title={Locale.Settings.Sync.LocalState} subTitle={Locale.Settings.Sync.Overview(stateOverview)}>
          <div style={{ display: 'flex' }}>
            <IconButton
              icon={<UploadIcon />}
              text={Locale.UI.Export}
              onClick={() => {
                syncStore.export();
              }}
            />
            <IconButton
              icon={<DownloadIcon />}
              text={Locale.UI.Import}
              onClick={() => {
                syncStore.import();
              }}
            />
          </div>
        </ListItem>
      </List>

      {showSyncConfigModal && <SyncConfigModal onClose={() => setShowSyncConfigModal(false)} />}
    </>
  );
}

export default function Settings() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;

  const updateStore = useUpdateStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const currentVersion = updateStore.formatVersion(updateStore.version);
  const remoteId = updateStore.formatVersion(updateStore.remoteVersion);
  const hasNewVersion = currentVersion !== remoteId;
  const updateUrl = getClientConfig()?.isApp ? RELEASE_URL : UPDATE_URL;

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestVersion(force).then(() => {
      setCheckingUpdate(false);
    });

    console.log('[Update] local version ', updateStore.version);
    console.log('[Update] remote version ', updateStore.remoteVersion);
  }

  const { navigateChat } = useChatPathStore();
  const accessStore = useAccessStore();
  const shouldHideBalanceQuery = useMemo(() => {
    const isOpenAiUrl = accessStore.openaiUrl.includes(OPENAI_BASE_URL);
    return accessStore.hideBalanceQuery || isOpenAiUrl || accessStore.provider === ServiceProvider.Azure;
  }, [accessStore.hideBalanceQuery, accessStore.openaiUrl, accessStore.provider]);

  const usage = {
    used: updateStore.used,
    subscription: updateStore.subscription,
  };
  const [loadingUsage, setLoadingUsage] = useState(false);

  function checkUsage(force = false) {
    if (shouldHideBalanceQuery) {
      return;
    }

    setLoadingUsage(true);
    updateStore.updateUsage(force).finally(() => {
      setLoadingUsage(false);
    });
  }

  const enabledAccessControl = useMemo(
    () => accessStore.enabledAccessControl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const promptStore = usePromptStore();
  const builtinCount = SearchService.count.builtin;
  const customCount = promptStore.getUserPrompts().length ?? 0;
  const [shouldShowPromptModal, setShowPromptModal] = useState(false);

  const showUsage = accessStore.isAuthorized();
  useEffect(() => {
    // checks per minutes
    checkUpdate();
    showUsage && checkUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigateChat(Path.Home);
      }
    };
    document.addEventListener('keydown', keydownEvent);
    return () => {
      document.removeEventListener('keydown', keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientConfig = useMemo(() => getClientConfig(), []);
  const showAccessCode = enabledAccessControl && !clientConfig?.isApp;

  return (
    <ErrorBoundary>
      <div className='window-header' data-tauri-drag-region>
        <div className='window-header-title'>
          <div className='window-header-main-title'>{Locale.Settings.Title}</div>
          <div className='window-header-sub-title'>{Locale.Settings.SubTitle}</div>
        </div>
        <div className='window-actions'>
          <div className='window-action-button'></div>
          <div className='window-action-button'></div>
          <div className='window-action-button'>
            <IconButton icon={<CloseIcon />} onClick={() => navigateChat(Path.Home)} bordered />
          </div>
        </div>
      </div>
      <div className={styles['settings']}>
        <List>
          <ListItem title={Locale.Settings.Avatar}>
            <Popover
              onClose={() => setShowEmojiPicker(false)}
              content={
                <AvatarPicker
                  onEmojiClick={(avatar: string) => {
                    updateConfig(config => (config.avatar = avatar));
                    setShowEmojiPicker(false);
                  }}
                />
              }
              open={showEmojiPicker}
            >
              <div className={styles.avatar} onClick={() => setShowEmojiPicker(true)}>
                <Avatar avatar={config.avatar} />
              </div>
            </Popover>
          </ListItem>

          <ListItem
            title={Locale.Settings.Update.Version(currentVersion ?? 'unknown')}
            subTitle={
              checkingUpdate
                ? Locale.Settings.Update.IsChecking
                : hasNewVersion
                  ? Locale.Settings.Update.FoundUpdate(remoteId ?? 'ERROR')
                  : Locale.Settings.Update.IsLatest
            }
          >
            {checkingUpdate ? (
              <LoadingIcon />
            ) : hasNewVersion ? (
              <a href={updateUrl} target='_blank' className='link'>
                {Locale.Settings.Update.GoToUpdate}
              </a>
            ) : (
              <IconButton
                icon={<ResetIcon></ResetIcon>}
                text={Locale.Settings.Update.CheckUpdate}
                onClick={() => checkUpdate(true)}
              />
            )}
          </ListItem>

          <ListItem title={Locale.Settings.SendKey}>
            <Select
              value={config.submitKey}
              popupMatchSelectWidth={false}
              options={Object.values(SubmitKey).map(v => ({ label: v, value: v }))}
              onChange={e => {
                updateConfig(config => (config.submitKey = e as any as SubmitKey));
              }}
            />
          </ListItem>

          <ListItem title={Locale.Settings.Theme}>
            <Select
              value={config.theme}
              popupMatchSelectWidth={false}
              options={Object.values(Theme).map(v => ({ label: v, value: v }))}
              onChange={e => {
                updateConfig(config => (config.theme = e as any as Theme));
              }}
            />
          </ListItem>

          <ListItem title={Locale.Settings.Lang.Name}>
            <Select
              value={getLang()}
              popupMatchSelectWidth={false}
              options={AllLangs.map(lang => ({ label: ALL_LANG_OPTIONS[lang], value: lang }))}
              onChange={e => {
                changeLang(e as any);
              }}
            />
          </ListItem>

          <ListItem title={Locale.Settings.FontSize.Title} subTitle={Locale.Settings.FontSize.SubTitle}>
            <InputRange
              title={`${config.fontSize ?? 14}px`}
              value={config.fontSize}
              min={12}
              max={40}
              step={1}
              onChange={e => updateConfig(config => (config.fontSize = Number.parseInt(`${e}`)))}
            />
          </ListItem>

          <ListItem
            title={Locale.Settings.AutoGenerateTitle.Title}
            subTitle={Locale.Settings.AutoGenerateTitle.SubTitle}
          >
            <Checkbox
              checked={config.enableAutoGenerateTitle}
              onChange={e => updateConfig(config => (config.enableAutoGenerateTitle = e.target.checked))}
            />
          </ListItem>

          <ListItem
            title={Locale.Settings.SendPreviewBubble.Title}
            subTitle={Locale.Settings.SendPreviewBubble.SubTitle}
          >
            <Checkbox
              checked={config.sendPreviewBubble}
              onChange={e => updateConfig(config => (config.sendPreviewBubble = e.target.checked))}
            />
          </ListItem>
        </List>

        <SyncItems />

        <List>
          <ListItem title={Locale.Settings.Mask.Splash.Title} subTitle={Locale.Settings.Mask.Splash.SubTitle}>
            <Checkbox
              checked={!config.dontShowMaskSplashScreen}
              onChange={e => updateConfig(config => (config.dontShowMaskSplashScreen = !e.target.checked))}
            />
          </ListItem>

          <ListItem title={Locale.Settings.Mask.Builtin.Title} subTitle={Locale.Settings.Mask.Builtin.SubTitle}>
            <Checkbox
              checked={config.hideBuiltinMasks}
              onChange={e => updateConfig(config => (config.hideBuiltinMasks = e.target.checked))}
            />
          </ListItem>
        </List>

        <List>
          <ListItem title={Locale.Settings.Prompt.Disable.Title} subTitle={Locale.Settings.Prompt.Disable.SubTitle}>
            <Checkbox
              checked={config.disablePromptHint}
              onChange={e => updateConfig(config => (config.disablePromptHint = e.target.checked))}
            />
          </ListItem>

          <ListItem
            title={Locale.Settings.Prompt.List}
            subTitle={Locale.Settings.Prompt.ListCount(builtinCount, customCount)}
          >
            <IconButton
              icon={<EditIcon />}
              text={Locale.Settings.Prompt.Edit}
              onClick={() => setShowPromptModal(true)}
            />
          </ListItem>
        </List>

        <List id={SlotID.CustomModel}>
          {showAccessCode && (
            <ListItem
              title={Locale.Settings.Access.AccessCode.Title}
              subTitle={Locale.Settings.Access.AccessCode.SubTitle}
            >
              <Input.Password
                value={accessStore.accessCode}
                placeholder={Locale.Settings.Access.AccessCode.Placeholder}
                onChange={e => {
                  accessStore.update(access => (access.accessCode = e.currentTarget.value));
                }}
              />
            </ListItem>
          )}

          {!accessStore.hideUserApiKey && (
            <>
              <ListItem
                title={Locale.Settings.Access.CustomEndpoint.Title}
                subTitle={Locale.Settings.Access.CustomEndpoint.SubTitle}
              >
                <Checkbox
                  checked={accessStore.useCustomConfig}
                  onChange={e => accessStore.update(access => (access.useCustomConfig = e.target.checked))}
                />
              </ListItem>
              {accessStore.useCustomConfig && (
                <>
                  <ListItem
                    title={Locale.Settings.Access.Provider.Title}
                    subTitle={Locale.Settings.Access.Provider.SubTitle}
                  >
                    <Select
                      value={accessStore.provider}
                      popupMatchSelectWidth={false}
                      options={Object.entries(ServiceProvider).map(([k, v]) => ({
                        label: k,
                        value: k,
                      }))}
                      onChange={e => {
                        accessStore.update(access => (access.provider = e as ServiceProvider));
                      }}
                    />
                  </ListItem>

                  {accessStore.provider === 'OpenAI' ? (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.OpenAI.Endpoint.Title}
                        subTitle={Locale.Settings.Access.OpenAI.Endpoint.SubTitle}
                      >
                        <Input
                          value={accessStore.openaiUrl}
                          placeholder={OPENAI_BASE_URL}
                          onChange={e => accessStore.update(access => (access.openaiUrl = e.currentTarget.value))}
                        />
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.OpenAI.ApiKey.Title}
                        subTitle={Locale.Settings.Access.OpenAI.ApiKey.SubTitle}
                      >
                        <Input.Password
                          value={accessStore.openaiApiKey}
                          placeholder={Locale.Settings.Access.OpenAI.ApiKey.Placeholder}
                          onChange={e => {
                            accessStore.update(access => (access.openaiApiKey = e.currentTarget.value));
                          }}
                        />
                      </ListItem>
                    </>
                  ) : (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.Azure.Endpoint.Title}
                        subTitle={Locale.Settings.Access.Azure.Endpoint.SubTitle + Azure.ExampleEndpoint}
                      >
                        <Input
                          value={accessStore.azureUrl}
                          placeholder={Azure.ExampleEndpoint}
                          onChange={e => accessStore.update(access => (access.azureUrl = e.currentTarget.value))}
                        />
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Azure.ApiKey.Title}
                        subTitle={Locale.Settings.Access.Azure.ApiKey.SubTitle}
                      >
                        <Input.Password
                          value={accessStore.azureApiKey}
                          placeholder={Locale.Settings.Access.Azure.ApiKey.Placeholder}
                          onChange={e => {
                            accessStore.update(access => (access.azureApiKey = e.currentTarget.value));
                          }}
                        />
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Azure.ApiVerion.Title}
                        subTitle={Locale.Settings.Access.Azure.ApiVerion.SubTitle}
                      >
                        <Input
                          value={accessStore.azureApiVersion}
                          placeholder='2023-08-01-preview'
                          onChange={e => accessStore.update(access => (access.azureApiVersion = e.currentTarget.value))}
                        />
                      </ListItem>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {!shouldHideBalanceQuery && !clientConfig?.isApp ? (
            <ListItem
              title={Locale.Settings.Usage.Title}
              subTitle={
                showUsage
                  ? loadingUsage
                    ? Locale.Settings.Usage.IsChecking
                    : Locale.Settings.Usage.SubTitle(usage?.used ?? '[?]', usage?.subscription ?? '[?]')
                  : Locale.Settings.Usage.NoAccess
              }
            >
              {!showUsage || loadingUsage ? (
                <div />
              ) : (
                <IconButton
                  icon={<ResetIcon></ResetIcon>}
                  text={Locale.Settings.Usage.Check}
                  onClick={() => checkUsage(true)}
                />
              )}
            </ListItem>
          ) : null}

          <ListItem
            title={Locale.Settings.Access.CustomModel.Title}
            subTitle={Locale.Settings.Access.CustomModel.SubTitle}
          >
            <Input
              value={config.customModels}
              placeholder='model1,model2,model3'
              onChange={e => config.update(config => (config.customModels = e.currentTarget.value))}
            />
          </ListItem>
        </List>

        <List>
          <ModelConfigList
            modelConfig={config.modelConfig}
            updateConfig={updater => {
              const modelConfig = { ...config.modelConfig };
              updater(modelConfig);
              config.update(config => (config.modelConfig = modelConfig));
            }}
          />
        </List>

        {shouldShowPromptModal && <UserPromptModal onClose={() => setShowPromptModal(false)} />}

        <DangerItems />
      </div>
    </ErrorBoundary>
  );
}
