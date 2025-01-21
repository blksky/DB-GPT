import NodeStatus from '@/dbpages/components/SqlFlow/components/SqlNodes/NodeStatus';
import { INodeData } from '@/dbpages/components/SqlFlow/ModelType';
import { Graph, Node } from '@antv/x6';
import { Flex } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

const KnowledgeNode: FC<{ node: Node; graph: Graph }> = ({ node }) => {
  const { label, stepData } = node.getData() as INodeData;
  return (
    <Flex justify='center' align='center' className={classNames('sql-flow-node knowledge-node', stepData?.status)}>
      {label}
      <NodeStatus stepData={stepData} />
    </Flex>
  );
};

export default KnowledgeNode;
