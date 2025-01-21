import { EnumSqlEdgeType } from '@/dbpages/components/SqlFlow/ModelType';
import { Edge, Shape } from '@antv/x6';

class CommonEdge extends Shape.Edge {}

class VirtualEdge extends Shape.Edge {}

class CircleEdge extends Shape.Edge {}

const COMMON_EDGE_PARAMS: any = {
  connector: {
    name: 'rounded',
    args: {
      radius: 10,
    },
  },
  attrs: {
    line: {
      // sourceMarker: {
      //   name: 'circle',
      //   r: 2.5,
      // },
      targetMarker: {
        name: 'classic',
        size: 8,
      },
      stroke: '#000000',
      strokeWidth: 2,
    },
  },
  zIndex: 1,
  router: {
    name: 'manhattan',
    args: {
      excludeHiddenNodes: true,
      padding: {
        left: 30,
      },
    },
  },
};

CommonEdge.config({ ...COMMON_EDGE_PARAMS });

VirtualEdge.config({
  ...COMMON_EDGE_PARAMS,
  attrs: {
    ...COMMON_EDGE_PARAMS.attrs,
    line: {
      ...COMMON_EDGE_PARAMS.attrs.line,
      stroke: 'rgb(96,96,96)',
      strokeWidth: 1,
      strokeDasharray: 5,
      targetMarker: {
        name: 'ellipse',
        args: {
          rx: 3,
          ry: 3,
        },
      },
    },
  },
});

CircleEdge.config({
  ...COMMON_EDGE_PARAMS,
  connector: {
    name: 'rounded',
    args: {
      radius: 30,
    },
  },
});

Edge.registry.register(EnumSqlEdgeType.COMMON_EDGE, CommonEdge, true);

Edge.registry.register(EnumSqlEdgeType.VIRTUAL_EDGE, VirtualEdge, true);

Edge.registry.register(EnumSqlEdgeType.CIRCLE_EDGE, CircleEdge, true);
