import React, { useEffect, useMemo, useRef } from 'react';
import DeleteIcon from '../icons/delete.svg';
import DragIcon from '../icons/drag.svg';
import { IconButton } from './button';
import styles from './home.module.less';

import Locale from '../chatLocales';

import { EnumChatStoreType, getEmptySession, useAppConfig, useChatPathStore } from '../store';

import { DEFAULT_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH, NARROW_SIDEBAR_WIDTH, Path } from '../constant';

import { getChatStoreMethod } from '@/dbpages/components/Chat/store/ModelType';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { isIOS, useMobileScreen } from '../utils';
import { showConfirm } from './ui-lib';

// const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
//   loading: () => null,
// });

// @ts-ignore
const ChatList: any = React.lazy(() => import('./chat-list').then(res => ({ default: res.ChatList })));

function useHotKey(props: { chatType?: EnumChatStoreType }) {
  const chatStore = getChatStoreMethod(props.chatType)();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        if (e.key === 'ArrowUp') {
          chatStore.nextSession(-1);
        } else if (e.key === 'ArrowDown') {
          chatStore.nextSession(1);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
  const lastUpdateTime = useRef(Date.now());

  const toggleSideBar = () => {
    config.update(config => {
      if (config.sidebarWidth < MIN_SIDEBAR_WIDTH) {
        config.sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
      } else {
        config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
      }
    });
  };

  const onDragStart = (e: MouseEvent) => {
    // Remembers the initial width each time the mouse is pressed
    startX.current = e.clientX;
    startDragWidth.current = config.sidebarWidth;
    const dragStartTime = Date.now();

    const handleDragMove = (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 20) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit(startDragWidth.current + d);
      config.update(config => {
        if (nextWidth < MIN_SIDEBAR_WIDTH) {
          config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
        } else {
          config.sidebarWidth = nextWidth;
        }
      });
    };

    const handleDragEnd = () => {
      // In useRef the data is non-responsive, so `config.sidebarWidth` can't get the dynamic sidebarWidth
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', handleDragEnd);

      // if user click the drag icon, should toggle the sidebar
      const shouldFireClick = Date.now() - dragStartTime < 300;
      if (shouldFireClick) {
        toggleSideBar();
      }
    };

    window.addEventListener('pointermove', handleDragMove);
    window.addEventListener('pointerup', handleDragEnd);
  };

  const isMobileScreen = useMobileScreen();
  const shouldNarrow = false; // !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const barWidth = shouldNarrow ? NARROW_SIDEBAR_WIDTH : limit(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
    const sideBarWidth = '0px'; // isMobileScreen ? 'var(--max-screen-width, 100vw)' : `${barWidth}px`;
    document.documentElement.style.setProperty('--sidebar-width', sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragStart,
    shouldNarrow,
  };
}

export function SideBar(props: {
  className?: string;
  dragSize?: boolean;
  chatType?: EnumChatStoreType;
  onNewSession?: () => void;
}) {
  const chatStore = getChatStoreMethod(props.chatType)();

  // drag side bar
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const config = useAppConfig();
  const { navigateChat } = useChatPathStore();
  const isMobileScreen = useMobileScreen();
  const isIOSMobile = useMemo(() => isIOS() && isMobileScreen, [isMobileScreen]);

  useHotKey(props);

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${shouldNarrow && styles['narrow-sidebar']}`}
      style={{
        // #3016 disable transition on ios mobile screen
        transition: isMobileScreen && isIOSMobile ? 'none' : undefined,
      }}
    >
      <div className={styles['sidebar-header']} data-tauri-drag-region>
        <div className={styles['sidebar-title']} data-tauri-drag-region>
          智能问数
        </div>
        <div className={styles['sidebar-sub-title']}>洞悉数据，助力决策，让业务增长无忧</div>
        {/*<div className={styles['sidebar-logo'] + ' no-dark'}>*/}
        {/*  <ChatGptIcon />*/}
        {/*</div>*/}
      </div>
      <div className={styles['sidebar-top-actions']}>
        <Button
          size='large'
          type='primary'
          block={true}
          className={styles['sidebar-top-action']}
          icon={<PlusCircleOutlined />}
          onClick={() => {
            if (props.onNewSession) {
              props.onNewSession();
            } else {
              chatStore.newSession(undefined, undefined, getEmptySession(props.chatType));
            }
          }}
        >
          新建对话
        </Button>
      </div>

      <div
        className={styles['sidebar-body']}
        onClick={e => {
          if (e.target === e.currentTarget) {
            navigateChat(Path.Home);
          }
        }}
      >
        <React.Suspense>
          <ChatList narrow={shouldNarrow} chatType={props.chatType} />
        </React.Suspense>
      </div>

      <div className={styles['sidebar-tail']}>
        <div className={styles['sidebar-actions']}>
          <div className={styles['sidebar-action'] + ' ' + styles.mobile}>
            <IconButton
              icon={<DeleteIcon />}
              onClick={async () => {
                if (await showConfirm(Locale.Home.DeleteChat)) {
                  chatStore.deleteSession(chatStore.currentSessionIndex);
                }
              }}
            />
          </div>
          {/*<div className={styles['sidebar-action']}>*/}
          {/*  <a onClick={() => navigateChat(Path.Settings)}>*/}
          {/*    <IconButton icon={<SettingsIcon />} shadow />*/}
          {/*  </a>*/}
          {/*</div>*/}
        </div>
      </div>
      {props.dragSize && (
        <div className={styles['sidebar-drag']} onPointerDown={e => onDragStart(e as any)}>
          <DragIcon />
        </div>
      )}
    </div>
  );
}
