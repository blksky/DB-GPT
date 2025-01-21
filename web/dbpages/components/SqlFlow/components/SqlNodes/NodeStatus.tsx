import { EnumStepStatus, IStepData } from '@/dbpages/components/SqlFlow/ModelType';
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';

const NodeStatus: FC<{ stepData?: IStepData }> = ({ stepData }) => {
  if (!stepData || !stepData.status || stepData.status === EnumStepStatus.initial) return null;
  const { status, start_time, end_time } = stepData;
  let icon;

  const timeCost = dayjs(end_time).diff(dayjs(start_time), 'milliseconds');

  if (status === EnumStepStatus.running) {
    icon = <LoadingOutlined className='process' />;
  } else if (status === EnumStepStatus.success) {
    icon = <CheckCircleFilled className='success' />;
  } else if (status === EnumStepStatus.failed) {
    icon = <CloseCircleFilled className='error' />;
  }
  return (
    <Flex gap={4} className='sql-flow-node-status'>
      {stepData.status !== EnumStepStatus.running && <div className='sql-flow-node-status-time'>{timeCost}ms</div>}
      {icon}
    </Flex>
  );
};

export default NodeStatus;
