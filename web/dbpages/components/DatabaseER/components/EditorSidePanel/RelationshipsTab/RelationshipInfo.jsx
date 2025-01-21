import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { IconDeleteStroked, IconLoopTextStroked, IconMore } from '@douyinfe/semi-icons';
import { Button, Col, Popover, Row, Select, Table, Tooltip } from '@douyinfe/semi-ui';
import { Alert, Button as AntButton, Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import { Action, Cardinality, Constraint, ObjectType } from '../../../data/constants';
import { useDiagram, useUndoRedo } from '../../../hooks';
import i18n from '../../../i18n/i18n';

const columns = [
  {
    title: i18n.t('primary'),
    dataIndex: 'primary',
  },
  {
    title: i18n.t('foreign'),
    dataIndex: 'foreign',
  },
];

export default function RelationshipInfo({ data, afterDelete }) {
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { tables, setRelationships, deleteRelationship } = useDiagram();
  const { t } = useTranslation();

  const swapKeys = () => {
    setUndoStack(prev => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: {
          startTableId: data.startTableId,
          startFieldId: data.startFieldId,
          endTableId: data.endTableId,
          endFieldId: data.endFieldId,
        },
        redo: {
          startTableId: data.endTableId,
          startFieldId: data.endFieldId,
          endTableId: data.startTableId,
          endFieldId: data.startFieldId,
        },
        message: t('edit_relationship', {
          refName: data.name,
          extra: '[swap keys]',
        }),
      },
    ]);
    setRedoStack([]);
    setRelationships(prev =>
      prev.map((e, idx) =>
        idx === data.id
          ? {
              ...e,
              name: `${tables[e.startTableId].name}_${tables[e.startTableId].fields[e.startFieldId].name}_fk`,
              startTableId: e.endTableId,
              startFieldId: e.endFieldId,
              endTableId: e.startTableId,
              endFieldId: e.startFieldId,
            }
          : e,
      ),
    );
  };

  const changeCardinality = value => {
    setUndoStack(prev => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: { cardinality: data.cardinality },
        redo: { cardinality: value },
        message: t('edit_relationship', {
          refName: data.name,
          extra: '[cardinality]',
        }),
      },
    ]);
    setRedoStack([]);
    setRelationships(prev => prev.map((e, idx) => (idx === data.id ? { ...e, cardinality: value } : e)));
  };

  const changeConstraint = (key, value) => {
    const undoKey = `${key}Constraint`;
    setUndoStack(prev => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: { [undoKey]: data[undoKey] },
        redo: { [undoKey]: value },
        message: t('edit_relationship', {
          refName: data.name,
          extra: '[constraint]',
        }),
      },
    ]);
    setRedoStack([]);
    setRelationships(prev => prev.map((e, idx) => (idx === data.id ? { ...e, [undoKey]: value } : e)));
  };

  const handleRelationConfirm = confirm => {
    if (!confirm) {
      deleteRelationship(data.id);
      afterDelete?.();
      return;
    }
    setUndoStack(prev => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.RELATIONSHIP,
        rid: data.id,
        undo: { shouldConfirm: data.shouldConfirm },
        redo: { shouldConfirm: false },
        message: t('edit_relationship', {
          refName: data.name,
          extra: '[shouldConfirm]',
        }),
      },
    ]);
    setRedoStack([]);
    setRelationships(prev => prev.map((e, idx) => (idx === data.id ? { ...e, shouldConfirm: false } : e)));
  };

  return (
    <>
      {data.shouldConfirm && (
        <Alert
          type='warning'
          className='mb-3'
          message={
            <Flex gap={5} justify='space-between'>
              <span>该关系是通过AI自动生成，您还未确认！</span>
              <Flex gap={5}>
                <Tooltip content='确认该关联关系' position='bottom'>
                  <AntButton type='primary' size='small' onClick={() => handleRelationConfirm(true)}>
                    <CheckOutlined />
                  </AntButton>
                </Tooltip>
                <Tooltip content='移除该关联关系' position='bottom'>
                  <AntButton danger={true} size='small' onClick={() => handleRelationConfirm(false)}>
                    <CloseOutlined />
                  </AntButton>
                </Tooltip>
              </Flex>
            </Flex>
          }
        />
      )}
      <div className='flex justify-between items-center mb-3'>
        <div className='me-3'>
          <span className='font-semibold'>{t('primary')}: </span>
          {tables[data.endTableId].name}
        </div>
        <div className='mx-1'>
          <span className='font-semibold'>{t('foreign')}: </span>
          {tables[data.startTableId].name}
        </div>
        <div className='ms-1'>
          <Popover
            content={
              <div className='p-2 popover-theme'>
                <Table
                  columns={columns}
                  dataSource={[
                    {
                      key: '1',
                      foreign: `${tables[data.startTableId]?.name}(${
                        tables[data.startTableId].fields[data.startFieldId]?.name
                      })`,
                      primary: `${tables[data.endTableId]?.name}(${
                        tables[data.endTableId].fields[data.endFieldId]?.name
                      })`,
                    },
                  ]}
                  pagination={false}
                  size='small'
                  bordered
                />
                <div className='mt-2'>
                  <Button icon={<IconLoopTextStroked />} block onClick={swapKeys}>
                    {t('swap')}
                  </Button>
                </div>
              </div>
            }
            trigger='click'
            position='rightTop'
            showArrow
          >
            <Button icon={<IconMore />} type='tertiary' />
          </Popover>
        </div>
      </div>
      <div className='font-semibold my-1'>{t('cardinality')}:</div>
      <Select
        optionList={Object.values(Cardinality).map(v => ({
          label: t(v),
          value: v,
        }))}
        value={data.cardinality}
        className='w-full'
        onChange={changeCardinality}
      />
      <Row gutter={6} className='my-3'>
        <Col span={12}>
          <div className='font-semibold'>{t('on_update')}:</div>
          <Select
            optionList={Object.values(Constraint).map(v => ({
              label: v,
              value: v,
            }))}
            value={data.updateConstraint}
            className='w-full'
            onChange={value => changeConstraint('update', value)}
          />
        </Col>
        <Col span={12}>
          <div className='font-semibold'>{t('on_delete')}:</div>
          <Select
            optionList={Object.values(Constraint).map(v => ({
              label: v,
              value: v,
            }))}
            value={data.deleteConstraint}
            className='w-full'
            onChange={value => changeConstraint('delete', value)}
          />
        </Col>
      </Row>
      <Button
        block={true}
        type='danger'
        icon={<IconDeleteStroked />}
        onClick={() => {
          deleteRelationship(data.id);
          afterDelete?.();
        }}
      >
        {t('delete')}
      </Button>
    </>
  );
}
