import { register } from '@antv/x6-react-shape';
import { EnumSqlNodeType } from '../../ModelType';
import DatabaseNode from './DatabaseNode';
import DatabaseSimpleNode from './DatabaseSimpleNode';
import DecisionNode from './DecisionNode';
import GroupNode from './GroupNode';
import KnowledgeNode from './KnowledgeNode';
import OperationNode from './OperationNode';
import PipelineNode from './PipelineNode';
import PipelineSimpleNode from './PipelineSimpleNode';
import ResultNode from './ResultNode';

import './index.less';

register({
  shape: EnumSqlNodeType.DATABASE_NODE,
  width: 70,
  height: 70,
  effect: ['data'],
  component: DatabaseNode,
});

register({
  shape: EnumSqlNodeType.KNOWLEDGE_NODE,
  width: 130,
  height: 70,
  effect: ['data'],
  component: KnowledgeNode,
});

register({
  shape: EnumSqlNodeType.PIPELINE_NODE,
  width: 130,
  height: 70,
  effect: ['data'],
  component: PipelineNode,
});

register({
  shape: EnumSqlNodeType.OPERATION_NODE,
  width: 130,
  height: 70,
  effect: ['data'],
  component: OperationNode,
});

register({
  shape: EnumSqlNodeType.DECISION_NODE,
  width: 130,
  height: 70,
  effect: ['data'],
  component: DecisionNode,
});

register({
  shape: EnumSqlNodeType.GROUP_NODE,
  width: 130,
  height: 70,
  effect: ['data'],
  component: GroupNode,
});

register({
  shape: EnumSqlNodeType.RESULT_NODE,
  width: 100,
  height: 100,
  effect: ['data'],
  component: ResultNode,
});

register({
  shape: EnumSqlNodeType.DATABASE_SIMPLE_NODE,
  width: 70,
  height: 70,
  effect: ['data'],
  component: DatabaseSimpleNode,
});

register({
  shape: EnumSqlNodeType.PIPELINE_SIMPLE_NODE,
  width: 70,
  height: 70,
  effect: ['data'],
  component: PipelineSimpleNode,
});
