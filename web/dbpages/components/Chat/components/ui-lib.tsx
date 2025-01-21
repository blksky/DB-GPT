import styles from './ui-lib.module.less';

import Locale from '../chatLocales';

import React, { useState } from 'react';

import { CompressOutlined, ExpandOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Modal as AntModal, Button, Col, Input, Row, Space, message } from 'antd';
import { createRoot } from 'react-dom/client';

export function Popover(props: { children: JSX.Element; content: JSX.Element; open?: boolean; onClose?: () => void }) {
  return (
    <div className={styles.popover}>
      {props.children}
      {props.open && (
        <div className={styles['popover-content']}>
          <div className={styles['popover-mask']} onClick={props.onClose}></div>
          {props.content}
        </div>
      )}
    </div>
  );
}

export function Card(props: { children: JSX.Element[]; className?: string }) {
  return <div className={styles.card + ' ' + props.className}>{props.children}</div>;
}

export function ListItem(props: {
  title: string;
  subTitle?: string;
  children?: JSX.Element | JSX.Element[];
  icon?: JSX.Element;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div className={styles['list-item'] + ` ${props.className || ''}`} onClick={props.onClick}>
      <div className={styles['list-header']}>
        {props.icon && <div className={styles['list-icon']}>{props.icon}</div>}
        <div className={styles['list-item-title']}>
          <div>{props.title}</div>
          {props.subTitle && <div className={styles['list-item-sub-title']}>{props.subTitle}</div>}
        </div>
      </div>
      {props.children}
    </div>
  );
}

export function List(props: { children: React.ReactNode; id?: string }) {
  return (
    <div className={styles.list} id={props.id}>
      {props.children}
    </div>
  );
}

interface ModalProps {
  title: string;
  children?: any;
  actions?: React.ReactNode[];
  defaultMax?: boolean;
  footer?: React.ReactNode;
  onClose?: () => void;
}

export function Modal(props: ModalProps) {
  const [isMax, setMax] = useState(!!props.defaultMax);

  return (
    <AntModal
      open={true}
      width={isMax ? '100%' : 800}
      title={
        <Row>
          <Col flex='none'>{props.title}</Col>
          <Col flex='auto'>
            <Button
              type='text'
              className='ant-modal-close'
              onClick={() => setMax(!isMax)}
              style={{ position: 'absolute', right: '20px', top: '-3px' }}
            >
              <span className='ant-modal-close-x'>{isMax ? <CompressOutlined /> : <ExpandOutlined />}</span>
            </Button>
          </Col>
        </Row>
      }
      footer={
        <Space>
          {props.footer}
          {props.actions?.map((action, i) => <div key={i}>{action}</div>)}
        </Space>
      }
      onCancel={props.onClose}
    >
      {props.children}
    </AntModal>
  );
}

export function showModal(props: ModalProps) {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const root = createRoot(div);
  const closeModal = () => {
    props.onClose?.();
    root.unmount();
    div.remove();
  };

  root.render(<Modal {...props} onClose={closeModal} />);
}

export type ToastProps = {
  content: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  onClose?: () => void;
};

export function showToast(content: string, action?: ToastProps['action'], delay = 3000) {
  if (action) {
    message.info(
      <Space>
        <span>{content}</span>
        <Button onClick={() => action?.onClick()}>{action.text}</Button>
      </Space>,
    );
  } else {
    message.info(content);
  }
}

export function showConfirm(content: any) {
  return new Promise<boolean>(resolve => {
    AntModal.confirm({
      content,
      title: Locale.UI.Confirm,
      okText: Locale.UI.Confirm,
      cancelText: Locale.UI.Cancel,
      onOk() {
        resolve(true);
      },
    });
  });
}

export function showPrompt(content: any, value = '', rows = 3) {
  return new Promise<string>(resolve => {
    let userInput = value;
    AntModal.confirm({
      icon: <InfoCircleOutlined />,
      title: content,
      okText: Locale.UI.Confirm,
      cancelText: Locale.UI.Cancel,
      content: <Input.TextArea value={value} rows={rows} onChange={e => (userInput = e.target.value)} />,
      onOk() {
        resolve(userInput);
      },
    });
  });
}

export function showImageModal(img: string) {
  showModal({
    title: Locale.Export.Image.Modal,
    children: (
      <div>
        <img
          src={img}
          alt='preview'
          style={{
            maxWidth: '100%',
          }}
        ></img>
      </div>
    ),
  });
}
