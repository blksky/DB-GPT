import Iconfont from '@/dbpages/components/Iconfont';
import { INodeData, IStepData } from '@/dbpages/components/SqlFlow/ModelType';
import NodeStatus from '@/dbpages/components/SqlFlow/components/SqlNodes/NodeStatus';
import { Graph, Node } from '@antv/x6';
import { Flex } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';
import { databaseMap } from '../../../../constants';

const DatabaseSimpleNode: FC<{ node: Node; graph: Graph }> = ({ node }) => {
  const { label, databaseType, stepData } = node.getData() as INodeData;
  const { status } = (stepData || {}) as IStepData;
  return (
    <Flex vertical={true} align='center' className={classNames('sql-flow-node database-simple-node process', status)}>
      {databaseType && <Iconfont className='database-simple-node-icon' code={databaseMap[databaseType]?.icon} />}
      <div>{label}</div>
      <NodeStatus stepData={stepData} />
    </Flex>
  );
};

export default DatabaseSimpleNode;
