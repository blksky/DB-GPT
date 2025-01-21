import { INodeData } from '@/dbpages/components/SqlFlow/ModelType';
import { Graph, Node } from '@antv/x6';
import { Flex } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

const GroupNode: FC<{ node: Node; graph: Graph }> = ({ node }) => {
  const { label, className } = node.getData() as INodeData;
  return (
    <Flex justify='center' align='center' className={classNames('sql-flow-node', 'group-node', className)}>
      <div className='group-node-label'>{label}</div>
    </Flex>
  );
};

export default GroupNode;
