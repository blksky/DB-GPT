import NodeStatus from '@/dbpages/components/SqlFlow/components/SqlNodes/NodeStatus';
import { INodeData } from '@/dbpages/components/SqlFlow/ModelType';
import { Graph, Node } from '@antv/x6';
import { Flex } from 'antd';
import classNames from 'classnames';
import { FC, useLayoutEffect, useRef, useState } from 'react';

function SvgPolygon(props: any = {}) {
  const svgRef = useRef<any>();
  const [svgOpt, setSvgOpt] = useState<{
    viewBox: string;
    points: string;
    filterPoints: string;
    width: number;
    height: number;
  }>({
    viewBox: '',
    points: '',
    filterPoints: '',
    width: 0,
    height: 0,
  });
  useLayoutEffect(() => {
    const { offsetWidth, offsetHeight } = svgRef.current.parentNode;
    const filterWidth: number = offsetWidth + 40;
    const filterHeight: number = offsetHeight + 40;
    svgOpt.width = offsetWidth;
    svgOpt.height = offsetHeight;
    svgOpt.viewBox = `0,0,${offsetWidth},${offsetHeight}`;
    svgOpt.points = `0,${offsetHeight / 2} ${offsetWidth / 2},0 ${offsetWidth},${offsetHeight / 2} ${offsetWidth / 2},${offsetHeight}`;
    svgOpt.filterPoints = `0,${filterHeight / 2} ${filterWidth / 2},0 ${filterWidth},${filterHeight / 2} ${filterWidth / 2},${filterHeight}`;
    setSvgOpt({ ...svgOpt });
    // svgRef.current.setAttribute('viewBox', `0,0,${node.getSize().width},${node.getSize().height}`);
  }, []);

  return (
    <svg
      ref={svgRef}
      width='100%'
      height='100%'
      version='1.1'
      viewBox={svgOpt.viewBox}
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <polygon
        stroke='#91e5ff'
        strokeWidth={20}
        strokeLinejoin='round'
        strokeLinecap='round'
        className='polygon-shadow'
        points={svgOpt.points}
      />
      <polygon strokeLinejoin='round' strokeLinecap='round' className='polygon' points={svgOpt.points} />
    </svg>
  );
}

const DecisionNode: FC<{ node: Node; graph: Graph }> = ({ node }) => {
  const { label, stepData } = node.getData() as INodeData;

  return (
    <Flex align='center' justify='center' className={classNames('sql-flow-node decision-node', stepData?.status)}>
      <SvgPolygon className={classNames('decision-node-svg', stepData?.status)} />
      <Flex gap={10} align='center' justify='center' className='decision-node-content'>
        {label}
      </Flex>
      <NodeStatus stepData={stepData} />
    </Flex>
  );
};

export default DecisionNode;
