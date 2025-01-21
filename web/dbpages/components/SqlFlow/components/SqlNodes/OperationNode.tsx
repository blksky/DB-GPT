import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import Iconfont from '@/dbpages/components/Iconfont';
import { INodeData } from '@/dbpages/components/SqlFlow/ModelType';
import NodeStatus from '@/dbpages/components/SqlFlow/components/SqlNodes/NodeStatus';
import { IconFont as IconFontUtil } from '@/dbpages/utils/IconFontUtil';
import { Graph, Node } from '@antv/x6';
import { Descriptions, Flex, Tooltip } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';
import { databaseMap } from '../../../../constants';

const OperationNode: FC<{ node: Node; graph: Graph }> = ({ node }) => {
  const { label, stepData, isDatabase, databaseType = 'SQLITE', isModel } = node.getData() as INodeData;
  let nodeIcon;
  if (isDatabase && databaseType) {
    const { database, database_type = 'SQLITE' } = stepData?.result || {};
    const title = database && (
      <Descriptions title='数据库信息' column={1} className='sql-flow-node-description'>
        <Descriptions.Item label='database'>{database}</Descriptions.Item>
        <Descriptions.Item label='database_type'>{database_type}</Descriptions.Item>
      </Descriptions>
    );
    nodeIcon = (
      <Tooltip title={title} color={Constants.TOOLTIP_COLOR}>
        <Iconfont className='sql-flow-node-icon database-icon' code={databaseMap[databaseType]?.icon} />
      </Tooltip>
    );
  } else if (isModel) {
    const { prompt_tokens, completion_tokens, total_tokens } = stepData?.result || {};
    const title = (
      <Descriptions title='模型信息' column={1} className='sql-flow-node-description'>
        <Descriptions.Item label='model'>gpt-4o-0806</Descriptions.Item>
        <Descriptions.Item label='prompt_tokens'>{prompt_tokens}</Descriptions.Item>
        <Descriptions.Item label='completion_tokens'>{completion_tokens}</Descriptions.Item>
        <Descriptions.Item label='total_tokens'>{total_tokens}</Descriptions.Item>
      </Descriptions>
    );
    nodeIcon = (
      <Tooltip title={title} color={Constants.TOOLTIP_COLOR}>
        <IconFontUtil className='sql-flow-node-icon modal-icon' type='icon-chat-model' />
      </Tooltip>
    );
  }

  return (
    <Flex
      gap={10}
      justify='center'
      align='center'
      className={classNames('sql-flow-node operation-node', stepData?.status)}
    >
      {nodeIcon}
      {label}
      <NodeStatus stepData={stepData} />
    </Flex>
  );
};

export default OperationNode;
