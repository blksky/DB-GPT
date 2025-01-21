import { INodeData, IStepData } from '@/dbpages/components/SqlFlow/ModelType';
// import { IconFont } from '@/pages/dbpages/utils/IconFontUtil';
import Iconfont from '@/dbpages/components/Iconfont';
import NodeStatus from '@/dbpages/components/SqlFlow/components/SqlNodes/NodeStatus';
import { Graph, Node } from '@antv/x6';
import { Flex } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';
import { databaseMap } from '../../../../constants';

const DatabaseNode: FC<{ node: Node; graph: Graph }> = ({ node }) => {
  const { label, stepData, databaseType = 'SQLITE' } = node.getData() as INodeData;
  const { status } = (stepData || {}) as IStepData;
  return (
    <Flex
      vertical={true}
      align='center'
      justify='center'
      className={classNames('sql-flow-node database-node process', status)}
    >
      {/*<IconFont type="icon-chat-database" />*/}
      <Iconfont className='database-node-icon' code={databaseMap[databaseType]?.icon} />
      <div>{label}</div>
      <NodeStatus stepData={stepData} />
    </Flex>
  );
};

export default DatabaseNode;
