import { DatabaseTypeCode } from '@/dbpages/constants';
import i18n from '@/dbpages/i18n';
import { IBaseInfo } from '@/dbpages/typings';
import { Form, Input } from 'antd';
import classnames from 'classnames';
import { ForwardedRef, forwardRef, useContext, useEffect, useImperativeHandle } from 'react';
import { Context } from '../index';
import styles from './index.module.less';

export interface IBaseInfoRef {
  getBaseInfo: () => IBaseInfo;
}

interface IProps {
  className?: string;
}

const BaseInfo = forwardRef((props: IProps, ref: ForwardedRef<IBaseInfoRef>) => {
  const { className } = props;
  const { tableDetails, databaseType } = useContext(Context);
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      name: tableDetails.name,
      comment: tableDetails.comment,
      charset: tableDetails.charset,
      engine: tableDetails.engine,
      incrementValue: tableDetails.incrementValue,
    });
  }, [tableDetails]);

  function getBaseInfo(): IBaseInfo {
    return form.getFieldsValue();
  }

  useImperativeHandle(ref, () => ({
    getBaseInfo,
  }));

  return (
    <div className={classnames(className, styles.baseInfo)}>
      <div className={styles.formBox}>
        <Form
          layout='vertical'
          form={form}
          initialValues={{ remember: true }}
          autoComplete='off'
          className={styles.form}
        >
          <Form.Item label={`${i18n('editTable.label.tableName')}:`} name='name'>
            <Input autoComplete='off' />
          </Form.Item>
          <Form.Item label={`${i18n('editTable.label.comment')}:`} name='comment'>
            <Input autoComplete='off' />
          </Form.Item>
          {databaseType === DatabaseTypeCode.MYSQL && (
            <>
              <Form.Item label={`${i18n('editTable.label.characterSet')}:`} name='charset'>
                <Input autoComplete='off' />
              </Form.Item>
              <Form.Item label={`${i18n('editTable.label.engine')}:`} name='engine'>
                <Input autoComplete='off' />
              </Form.Item>
              <Form.Item label={`${i18n('editTable.label.incrementValue')}:`} name='incrementValue'>
                <Input autoComplete='off' />
              </Form.Item>
            </>
          )}
        </Form>
      </div>
    </div>
  );
});

export default BaseInfo;
