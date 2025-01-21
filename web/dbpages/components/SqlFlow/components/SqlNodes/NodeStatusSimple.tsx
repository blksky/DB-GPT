import { EnumStepStatus, IStepData } from '@/dbpages/components/SqlFlow/ModelType';
import { LoadingOutlined } from '@ant-design/icons';
import { FC } from 'react';
import ICON_ERROR from '../../images/icon-flow-error.png';
import ICON_SUCCESS from '../../images/icon-flow-success.png';

const NodeStatusSimple: FC<{ stepData?: IStepData }> = ({ stepData }) => {
  if (!stepData || stepData.status === EnumStepStatus.initial) return null;
  const { status } = stepData;
  let icon;
  if (status === EnumStepStatus.running) {
    icon = <LoadingOutlined className='simple-process' />;
  } else if (status === EnumStepStatus.success) {
    icon = <img alt='' className='simple-success' src={ICON_SUCCESS} />;
  } else if (status === EnumStepStatus.failed) {
    icon = <img alt='' className='simple-error' src={ICON_ERROR} />;
  }
  return <div className='sql-flow-node-simple-status'>{icon}</div>;
};

export default NodeStatusSimple;
