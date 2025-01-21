import NodeStatus from '@/dbpages/components/SqlFlow/components/SqlNodes/NodeStatus';
import { INodeData } from '@/dbpages/components/SqlFlow/ModelType';
import { IconFont } from '@/dbpages/utils/IconFontUtil';
import { Graph, Node } from '@antv/x6';
import { Flex } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

const ResultNode: FC<{ node: Node; graph: Graph }> = ({ node }) => {
  const { label, stepData } = node.getData() as INodeData;
  return (
    <Flex
      gap={3}
      vertical={true}
      justify='center'
      align='center'
      className={classNames('sql-flow-node result-node', stepData?.status)}
    >
      <IconFont className='result-node-icon' type='icon-chat-sql' />
      {label}
      <NodeStatus stepData={stepData} />
    </Flex>
  );
};

export default ResultNode;
