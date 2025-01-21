import { ChatContext } from '@/app/chat-context';
import { ChatContentContext } from '@/pages/chat';
import { SettingOutlined } from '@ant-design/icons';
import { Col, Flex, Form, InputNumber, Modal, Row, Select, Slider, Tooltip } from 'antd';
import React, { memo, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ModelIcon from '../content/ModelIcon';

const ModelSwitcher: React.FC = () => {
  const { modelList } = useContext(ChatContext);
  const {
    appInfo,
    modelValue,
    setModelValue,
    temperatureValue,
    maxNewTokensValue,
    setTemperatureValue,
    setMaxNewTokensValue,
  } = useContext(ChatContentContext);

  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { t } = useTranslation();

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.model) {
      setModelValue(allValues.model);
    }
    if (changedValues.temperature) {
      setTemperatureValue(allValues.temperature);
    }
    if (changedValues.maxNewTokens) {
      setMaxNewTokensValue(allValues.maxNewTokens);
    }
  };

  // 左边工具栏动态可用key
  const paramKey: string[] = useMemo(() => {
    return appInfo.param_need?.map(i => i.type) || [];
  }, [appInfo.param_need]);

  if (!paramKey.includes('model')) {
    return (
      <Tooltip title={t('model_tip')}>
        <div className='flex w-8 h-8 items-center justify-center rounded-md hover:bg-[rgb(221,221,221,0.6)]'>
          <SettingOutlined className='text-xl cursor-not-allowed opacity-30' />
        </div>
      </Tooltip>
    );
  }

  return (
    <>
      <Modal width={720} title='模型设置' footer={null} open={isModalOpen} onCancel={() => setIsModalOpen(false)}>
        <Form
          form={form}
          autoComplete='off'
          labelAlign='left'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={{ model: modelValue, temperature: temperatureValue, maxNewTokens: maxNewTokensValue }}
          onValuesChange={handleValuesChange}
          style={{ paddingTop: 20 }}
        >
          <Form.Item label='模型' name='model'>
            <Select
              value={modelValue}
              placeholder={t('choose_model')}
              options={modelList.map(item => ({
                value: item,
                label: (
                  <Flex align='center'>
                    <ModelIcon model={item} />
                    <span className='ml-2'>{item}</span>
                  </Flex>
                ),
              }))}
            />
          </Form.Item>
          <Form.Item label='温度' name='temperature'>
            <Row gutter={24}>
              <Col span={18}>
                <Form.Item noStyle={true} name='temperature'>
                  <Slider className='w-full' min={0} max={1} step={0.01} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item noStyle={true} name='temperature'>
                  <InputNumber className='w-full' min={0} max={1} step={0.01} />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item label='最大输出token' name='maxNewTokens'>
            <Row gutter={24}>
              <Col span={18}>
                <Form.Item noStyle={true} name='maxNewTokens'>
                  <Slider className='w-full' min={1} max={20480} step={1} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item noStyle={true} name='maxNewTokens'>
                  <InputNumber className='w-full' min={1} max={20480} step={1} />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
      <Select
        value={modelValue}
        placeholder={t('choose_model')}
        className='h-8 rounded-3xl'
        open={false}
        onClick={() => setIsModalOpen(true)}
      >
        {modelList.map(item => (
          <Select.Option key={item}>
            <div className='flex items-center'>
              <ModelIcon model={item} />
              <span className='ml-2'>{item}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </>
  );
};

export default memo(ModelSwitcher);
