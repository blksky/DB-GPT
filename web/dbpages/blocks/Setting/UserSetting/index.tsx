import { changeUsernameAndPwd } from '@/dbpages/service/user';
import { getCookie } from '@/dbpages/utils';
import { Button, Form, Input } from 'antd';
import { useRef } from 'react';
import styles from './index.module.less';

// 用户设置
export default function UserSetting() {
  const refUserId = useRef(getCookie('CHAT2DB.USER_ID'));

  const onFinish: any = async values => {
    await changeUsernameAndPwd({ ...values, userId: Number(refUserId.current) });
    window.location.reload();
  };

  const onFinishFailed: any = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      <div className={styles.title}>账户设置</div>
      <Form
        name='basic'
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete='off'
      >
        <Form.Item label='用户名' name='userName' rules={[{ required: true, message: '请输入用户名!' }]}>
          <Input />
        </Form.Item>

        <Form.Item label='密码' name='password' rules={[{ required: true, message: '请输入密码!' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type='primary' htmlType='submit'>
            确认修改用户名和密码
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
