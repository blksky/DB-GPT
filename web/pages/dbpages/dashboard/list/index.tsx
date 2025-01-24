import {
  createChart,
  createDashboard,
  deleteDashboard,
  getDashboardList,
  updateDashboard,
} from '@/dbpages/service/dashboard';
import { IDashboardItem } from '@/dbpages/typings/index';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Dropdown, Flex, Form, Input, Modal, Row, message } from 'antd';
import { useEffect, useState } from 'react';
import i18n from '../../../../dbpages/i18n';
import { DASHBOARD_LIST } from './ModelType';

import { getUserId } from '@/utils';
import { useRouter } from 'next/router';
import Iconfont from '../../../../dbpages/components/Iconfont';
import styles from './index.module.less';

function DashboardList() {
  const router = useRouter();
  const [dashboardList, setDashboardList] = useState<IDashboardItem[]>([]);
  const [curDashboard, setCurDashboard] = useState<IDashboardItem>();
  const [openAddDashboard, setOpenAddDashboard] = useState(false);
  const [biList, setBiList] = useState<{ id: string; editing?: boolean }[]>(DASHBOARD_LIST);
  const [messageApi] = message.useMessage();
  const [form] = Form.useForm(); // 创建一个表单实例

  useEffect(() => {
    // 获取列表数据
    queryDashboardList();
  }, []);

  // useEffect(() => {
  //   const { chartIds } = curDashboard || {};
  //   if (!curDashboard) {
  //     return;
  //   }
  //   if (!chartIds || !chartIds.length) {
  //     initCreateChart(curDashboard);
  //   }
  // }, [curDashboard]);

  const queryDashboardList = async () => {
    const res = await getDashboardList({});
    const { data } = res.data;
    if (Array.isArray(data) && data.length > 0) {
      setDashboardList(data);
      // const _curDashboard = await getDashboardById({ id: data[0].id });
      // setCurDashboard(_curDashboard);
    }
  };

  const initCreateChart = async (dashboard?: IDashboardItem) => {
    if (!dashboard) return;

    const chartId = await createChart({});
    const newDashboard = {
      ...dashboard,
      content: JSON.stringify([[chartId]]),
      chartIds: [chartId],
    };
    updateDashboard(newDashboard);
    setCurDashboard(newDashboard);
  };

  const handleDetail = (data: any) => {
    router.push(`/dbpages/dashboard/detail/${data.id}?name=${encodeURIComponent(data.name)}&type=1`);
  };

  const getDropdownItems: any = (data: any) => [
    {
      key: 'Edit',
      label: i18n('dashboard.edit'),
      onClick: () => {
        const { id, name, description } = data;
        setOpenAddDashboard(true);
        form.setFieldsValue({
          id,
          name,
          description,
        });
      },
    },
    {
      key: 'Delete',
      label: i18n('dashboard.delete'),
      onClick: async () => {
        await deleteDashboard({ id: data.id });
        messageApi.open({
          type: 'success',
          content: '删除报表成功！',
        });
        queryDashboardList();
      },
    },
  ];

  return (
    <div className={styles.box}>
      <Flex gap={24} align='center' className={styles.boxTitleWrapper}>
        <div className={styles.boxTitle}>{i18n('dashboard.title')}</div>
        <Button type='primary' icon={<PlusOutlined />} onClick={() => setOpenAddDashboard(true)}>
          新增报表
        </Button>
      </Flex>
      <Row gutter={[24, 24]}>
        {dashboardList.map((d, index) => {
          const urlInfo = biList[index];
          if (!urlInfo) return null;
          return (
            <Col key={d.id}>
              <Card
                hoverable={true}
                style={{ width: 250 }}
                className={styles.boxCard}
                title={
                  <Flex justify='space-between'>
                    <span>{d.name}</span>
                    <div
                      onClick={e => {
                        e.stopPropagation?.();
                        e.preventDefault?.();
                      }}
                    >
                      <Dropdown menu={{ items: getDropdownItems(d) }}>
                        <div className={styles.moreButton}>
                          <Iconfont code='&#xe601;' />
                        </div>
                      </Dropdown>
                    </div>
                  </Flex>
                }
                onClick={() => handleDetail({ id: urlInfo.id, name: d.name })}
              >
                <img alt='example' src={urlInfo.icon} />
              </Card>
            </Col>
          );
        })}
      </Row>
      <Modal
        title={form.getFieldValue('id') ? i18n('dashboard.modal.editTitle') : i18n('dashboard.modal.addTitle')}
        open={openAddDashboard}
        onOk={async () => {
          try {
            await form.validateFields();
            const formValue = form.getFieldsValue(true);
            const { id } = formValue;
            formValue.user_id = getUserId();

            if (id) {
              await updateDashboard(formValue);
            } else {
              await createDashboard(formValue);
            }
            queryDashboardList();
            setOpenAddDashboard(false);
            form.resetFields();
          } catch (errorInfo) {
            form.resetFields();
          }
        }}
        onCancel={() => {
          setOpenAddDashboard(false);
          form.resetFields();
        }}
        okText={i18n('common.button.confirm')}
        cancelText={i18n('common.button.cancel')}
      >
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} form={form} autoComplete={'off'}>
          <Form.Item
            label={'name'}
            name={'name'}
            rules={[{ required: true, message: i18n('dashboard.modal.name.placeholder') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label={'description'} name={'description'}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default DashboardList;
