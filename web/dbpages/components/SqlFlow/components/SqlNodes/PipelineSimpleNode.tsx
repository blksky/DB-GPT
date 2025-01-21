import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import Iconfont from '@/dbpages/components/Iconfont';
import { Graph, Node } from '@antv/x6';
import { Descriptions, Flex, Tooltip } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';
import { databaseMap } from '../../../../constants';
import { INodeData, IStepData } from '../../ModelType';
import NodeStatusSimple from './NodeStatusSimple';

const PipelineSimpleNode: FC<{ node: Node; graph: Graph }> = ({ node }) => {
  const { label, databaseType, stepData } = node.getData() as INodeData;
  const { status } = (stepData || {}) as IStepData;
  let nodeIcon;
  if (databaseType) {
    const { database, database_type } = stepData?.result || {};
    const title = database && (
      <Descriptions title='数据库信息' column={1} className='sql-flow-node-description'>
        <Descriptions.Item label='database'>{database}</Descriptions.Item>
        <Descriptions.Item label='database_type'>{database_type}</Descriptions.Item>
      </Descriptions>
    );
    nodeIcon = (
      <Tooltip title={title} color={Constants.TOOLTIP_COLOR}>
        <Iconfont className='pipeline-simple-node-icon database-icon' code={databaseMap[databaseType]?.icon} />
      </Tooltip>
    );
  }
  return (
    <Flex gap={5} justify='center' align='center' className={classNames('sql-flow-node pipeline-simple-node', status)}>
      {nodeIcon}
      {label}
      <NodeStatusSimple stepData={stepData} />
    </Flex>
  );
};

export default PipelineSimpleNode;
