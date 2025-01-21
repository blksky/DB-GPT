import {
  EnumSqlEdgeType,
  EnumSqlNodeType,
  EnumStepStatus,
  IFlowData,
  INodeData,
} from '@/dbpages/components/SqlFlow/ModelType';
import { Cell, Graph } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { FC, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import './components/SqlEdges';
import './components/SqlNodes';

export type SqlFlowProps = {
  ref?: any;
  flowData?: IFlowData;
  schemaData: { nodeData: any; edgeData: any };
  onNodeClick?: (node: INodeData) => void;
};

const SqlFlow: FC<SqlFlowProps> = forwardRef((props, ref) => {
  const refContainer = useRef<any>();
  const refGraph = useRef<Graph>();

  useImperativeHandle(ref, () => {
    return {
      resize: () => {
        refGraph.current?.zoomToFit({ padding: 10, maxScale: 1 });
      },
      selectNode: (nodeId?: string) => {
        refGraph.current?.resetSelection(nodeId);
      },
    };
  });

  const initData = () => {
    const graph = refGraph.current;
    if (!graph) {
      return;
    }

    const cells: Cell[] = [];
    const { nodeData, edgeData } = props.schemaData;
    const childToAdd: any[] = [];
    [...nodeData, ...edgeData].forEach((item: any) => {
      if (item.data) {
        item.data.id = item.id;
      }
      if (
        [EnumSqlEdgeType.COMMON_EDGE, EnumSqlEdgeType.VIRTUAL_EDGE, EnumSqlEdgeType.CIRCLE_EDGE].includes(item.shape)
      ) {
        cells.push(graph.createEdge(item));
      } else if (item.shape === EnumSqlNodeType.GROUP_NODE) {
        cells.push(graph.createNode({ ...item }));
      } else {
        childToAdd.push(item);
        const node = graph.createNode(item);
        const parentNode = graph.getCellById(item.parentId);
        cells.push(node);
        if (parentNode) {
          parentNode.addChild(node);
        }
      }
    });
    graph?.resetCells(cells);
    childToAdd.forEach(d => {
      const node = graph?.getCellById(d.id);
      const parentNode = graph?.getCellById(d.parentId);
      if (node && parentNode) {
        parentNode.addChild(node);
      }
    });
    graph?.zoomToFit({ padding: 10, maxScale: 1 });
  };

  const initGraph = () => {
    const graph = new Graph({
      autoResize: true,
      container: refContainer.current,
      connecting: {
        router: 'orth',
      },
      // panning: {
      //   enabled: true,
      //   eventTypes: ['leftMouseDown'],
      // },
      mousewheel: {
        enabled: true,
        modifiers: 'ctrl',
        factor: 1.1,
        maxScale: 1.5,
        minScale: 0.5,
      },
      interacting: () => ({ nodeMovable: false }),
    });
    graph.use(new Selection({ rubberEdge: false, rubberNode: false, rubberband: false }));
    graph.on('node:change:data', ({ node }) => {
      const edges = graph.getIncomingEdges(node);
      const { stepData } = node.getData() as INodeData;
      edges?.forEach(edge => {
        if (stepData?.status === EnumStepStatus.running && edge.shape !== EnumSqlEdgeType.VIRTUAL_EDGE) {
          edge.attr('line/stroke', 'orange');
          edge.attr('line/strokeDasharray', 5);
          edge.attr('line/style/animation', 'running-line 30s infinite linear');
        } else if (edge.shape !== EnumSqlEdgeType.VIRTUAL_EDGE) {
          edge.attr('line/strokeDasharray', '');
          edge.attr('line/style/animation', '');
          if (stepData?.status === EnumStepStatus.success) {
            edge.attr('line/stroke', '#40a60e');
          } else if (stepData?.status === EnumStepStatus.failed) {
            edge.attr('line/stroke', '#ff4d4f');
          }
        }
      });
    });
    graph.on('node:click', ({ node }) => {
      props.onNodeClick?.(node.getData());
    });

    refGraph.current = graph;
  };

  useEffect(() => {
    initGraph();
    initData();
  }, []);

  useEffect(() => {
    if (props.flowData) {
      const graph = refGraph.current;
      if (!graph) {
        return;
      }
      const nodes = graph.getNodes();
      props.flowData.step_list?.forEach(d => {
        const node = nodes.find(n => n.id === d.step_id);
        if (node) {
          const nodeData = node.getData();
          node.setData({ ...nodeData, stepData: d });
        }
      });
    }
  }, [props.flowData]);

  return <div ref={refContainer} style={{ width: '100%', height: '100%' }} />;
});

export default SqlFlow;
