import { getLoginUserId } from '@/dbpages/common/constants';
import Iconfont from '@/dbpages/components/Iconfont';
import { getSchemaList, useConnectionStore } from '@/dbpages/store/connection';
import { fetchCreateGoldSql, fetchUpdateGoldSql } from '@/dbpages/store/goldSql';
import { EnumGoldSqlSrcType, IGoldSql } from '@/dbpages/typings/goldSql';
import { Flex, Form, Input, Modal, Select, Typography } from 'antd';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { databaseMap } from '../../../../constants';

type GoldSqlDialogProps = {
  title?: string;
  onSuccess?: () => void;
  getModelData: () => IGoldSql | undefined;
  buttonRender?: (onClick: () => void) => React.ReactNode;
};

const GoldSqlModify = forwardRef((props: GoldSqlDialogProps, ref) => {
  const [form] = Form.useForm();
  const refData = useRef<IGoldSql>({} as IGoldSql);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromValues, setFromValues] = useState<any>({});
  const [schemaListMap, setSchemaListMap] = useState<Map<string, string[]>>(new Map());
  const { connectionList } = useConnectionStore();

  const handleValuesChange = async (changedValues: any, allValues: any) => {
    console.log('changedValues', changedValues);

    if (Reflect.has(changedValues, 'db_id')) {
      const connectionItem = connectionList?.find(d => d.alias === changedValues.db_id);
      if (connectionItem) {
        const schemaList = await getSchemaList(connectionItem);
        schemaListMap.set(
          connectionItem.alias,
          schemaList.map(d => d.name),
        );
        setSchemaListMap(schemaListMap);
        allValues.schema_name = schemaList.length === 1 ? schemaList[0]?.name : undefined;
        form.setFieldsValue({ schema_name: allValues.schema_name });
      }
    }
    setFromValues(allValues);
  };

  const showModal = async (modelData?: IGoldSql) => {
    refData.current = modelData || props.getModelData() || ({} as IGoldSql);
    await handleValuesChange({ db_id: refData.current.db_id }, refData.current);
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleOk = async () => {
    form.validateFields().then(() => {
      const record: IGoldSql = {
        ...refData.current,
        ...fromValues,
        src_type: EnumGoldSqlSrcType.管理系统,
      };
      if (!record.id) {
        record.created_by = getLoginUserId();
      } else {
        record.updated_by = getLoginUserId();
      }
      const callback = (isSuccess: boolean | number) => {
        if (isSuccess) {
          props.onSuccess?.();
          setIsModalOpen(false);
        }
      };
      if (!record.id || record.id <= 0) {
        fetchCreateGoldSql(record).then(callback);
      } else {
        fetchUpdateGoldSql(record).then(callback);
      }
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useImperativeHandle(ref, () => {
    return {
      showModal,
    };
  });

  return (
    <>
      {props.buttonRender ? (
        props.buttonRender?.(showModal)
      ) : (
        <Typography.Link style={{ marginLeft: 10 }} onClick={() => showModal()}>
          添加至Gold SQL
        </Typography.Link>
      )}
      <Modal
        title={
          <Typography.Text ellipsis={true} style={{ maxWidth: '90%' }}>
            {props.title || (fromValues.id ? `编辑Gold SQL：${fromValues.question}` : '添加Gold SQL')}
          </Typography.Text>
        }
        styles={{ body: { padding: '10px 30px' } }}
        destroyOnClose={true}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          ref={form as any}
          layout='vertical'
          initialValues={fromValues}
          autoComplete='off'
          onValuesChange={handleValuesChange}
        >
          <Form.Item label='问题' name='question' rules={[{ required: true, message: '请输入问题' }]}>
            <Input placeholder='请输入问题' />
          </Form.Item>
          <Form.Item label='数据库' name='db_id' rules={[{ required: true, message: '请选择数据库' }]}>
            <Select
              placeholder='请选择数据库'
              options={connectionList?.map((d: any) => ({
                value: d.alias,
                label: (
                  <Flex align='center' gap={4} className='chatConnection'>
                    <Iconfont className='chatConnectionIcon' code={databaseMap[d.type]?.icon} />
                    {d.alias}
                  </Flex>
                ),
              }))}
            />
          </Form.Item>
          <Form.Item
            label='数据库Schema'
            name='schema_name'
            rules={[{ required: true, message: '请选择数据库Schema' }]}
          >
            <Select
              placeholder='请选择数据库'
              options={schemaListMap.get(fromValues.db_id)?.map((d: string) => ({ value: d, label: d }))}
            />
          </Form.Item>
          <Form.Item label='问题难度' name='difficulty' rules={[{ required: true, message: '请选择问题难度' }]}>
            <Select
              placeholder='请选择问题难度'
              options={[
                { label: '简单', value: 'simple' },
                { label: '中等', value: 'moderate' },
                { label: '困难', value: 'challanging' },
              ]}
            />
          </Form.Item>
          <Form.Item label='evidence' name='evidence' rules={[{ required: true, message: '请输入evidence' }]}>
            <Input placeholder='请输入evidence' />
          </Form.Item>
          <Form.Item label='SQL' name='sql' rules={[{ required: true, message: '请输入SQL' }]}>
            <Input.TextArea rows={4} placeholder='请输入SQL' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});

export default GoldSqlModify;
