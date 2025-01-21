import Chat from '@/dbpages/components/Chat/components/chat';
import { ChatSession, createMessage, EnumChatStoreType } from '@/dbpages/components/Chat/store';
import { Breadcrumb, Button, Flex, Typography } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.less';

import '@/dbpages/components/Chat/';
import { getChatStoreMethod } from '@/dbpages/components/Chat/store/ModelType';
import '@/dbpages/components/Chat/styles/globals.less';
import '@/dbpages/components/Chat/styles/highlight.less';
import '@/dbpages/components/Chat/styles/markdown.less';

// const BI_URL = 'http://localhost:8080';
const BI_URL = 'https://dw-kg.jd.com';
const BI_URL_USER = '&username=admin&password=DataEase@123456';
const BI_EDIT_URL = `${BI_URL}/#/dashboard?hidePreview=true&hideBack=true&defaultSide=true&resourceId=`;
const BI_PREVIEW_URL = `${BI_URL}/#/preview?dvId=`;

export const EnumFrameMessageType = {
  INIT: 'INIT',
  REPORT_CREATE: 'REPORT_CREATE',
  REPORT_DESTROY: 'REPORT_DESTROY',
  CHANGE_THEME: 'CHANGE_THEME',
};

function DashboardDetail() {
  const router = useRouter();
  const params = router.query || {};
  const refChat = useRef<any>();
  const refFrame = useRef<any>();
  const isEdit = params.type === '1';
  const backUrl = window.location.origin + `/dashboard/detail/${params.id}/${encodeURIComponent(params.name)}/0`;

  const chatStore = getChatStoreMethod(EnumChatStoreType.CHAT_SCOPE)();

  const postFrameMessage = (frameMessage: { type: string; options?: Record<string, any> }) => {
    const iframeWindow = refFrame.current?.contentWindow;
    iframeWindow?.postMessage(frameMessage, new URL(refFrame.current?.src).origin);
  };
  const handleSendMessage = async (msg: string) => {
    if (msg.includes('主题') && msg.includes('换')) {
      postFrameMessage({ type: EnumFrameMessageType.CHANGE_THEME });
      return '已完成主题切换';
    }
    return null;
  };

  useEffect(() => {
    if (!params.id) return;
    const sessionId = chatStore.newSession(
      // @ts-ignore
      { name: '智能报表', hideContext: false, context: [] },
      params.id,
    );

    const session = chatStore.currentSession();
    session.onSendMessage = handleSendMessage;

    const removeSession = () => {
      const { sessions } = getChatStoreMethod(EnumChatStoreType.CHAT_SCOPE).getState();
      chatStore.deleteSession(sessions.findIndex((d: ChatSession) => d.id === sessionId));
    };
    window.addEventListener('beforeunload', removeSession);
    return removeSession;
  }, []);

  const handleEdit = () => {
    router.push(`/dashboard/detail/${params.id}/${encodeURIComponent(params.name)}/1`);
    // navigate(`/dashboard/detail/${params.id}/${encodeURIComponent(params.name)}/1`);
  };

  const windowTitleRender = (windowTitle: React.ReactElement) => {
    return <div className='window-header'>{windowTitle}</div>;
  };
  const renderHello = () => {
    const questions = ['换个主题风格', '添加最近七天的销售分布饼图', '添加最近七天的销售柱状图'];
    const handleQuestion = (question: string) => {
      refChat.current?.doSubmit?.(question);
    };
    return createMessage({
      role: 'assistant',
      isHello: true,
      content: (
        <Flex vertical={true}>
          <Typography.Text style={{ fontSize: '14px' }}>您好，智能助理【智能报表】将与您对话，试着问：</Typography.Text>
          {questions.map(d => (
            <Typography.Link key={d} style={{ fontSize: '14px' }} onClick={() => handleQuestion(d)}>
              {d}
            </Typography.Link>
          ))}
        </Flex>
      ),
    });
  };
  const initFrameMessage = () => {
    window.addEventListener(
      'message',
      ({ data }) => {
        const { type, options } = data;
        if (type === EnumFrameMessageType.REPORT_CREATE) {
        }
      },
      false,
    );
  };

  const frameUrl = isEdit
    ? `${BI_EDIT_URL}${params.id}${BI_URL_USER}&backUrl=${encodeURIComponent(backUrl)}`
    : `${BI_PREVIEW_URL}${params.id}${BI_URL_USER}`;

  useEffect(() => {
    initFrameMessage();
  }, []);

  return (
    <div className={styles.box}>
      <Flex gap={24} align='center' className={styles.boxTitleWrapper}>
        <Breadcrumb
          items={[
            {
              title: <Link to='/dbpages/dashboard'>智能报表</Link>,
            },
            {
              title: params.name,
            },
          ]}
        />
        {!isEdit && (
          <Button type='primary' onClick={handleEdit}>
            编辑报表
          </Button>
        )}
      </Flex>
      <Flex gap={12} className={styles.boxContent}>
        <iframe ref={refFrame} src={frameUrl} />
        {isEdit && (
          <div className={styles.boxChat}>
            <Chat
              ref={refChat}
              scopeData={params.id}
              windowTitleRender={windowTitleRender}
              renderHello={renderHello}
              chatType={EnumChatStoreType.CHAT_SCOPE}
            />
          </div>
        )}
      </Flex>
    </div>
  );
}

export default DashboardDetail;
