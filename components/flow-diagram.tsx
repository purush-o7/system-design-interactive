"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeTypes,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  FlowServerNode,
  FlowDatabaseNode,
  FlowCacheNode,
  FlowClientNode,
  FlowLoadBalancerNode,
  FlowQueueNode,
  FlowGatewayNode,
  type FlowNodeData,
} from "@/components/flow-diagram-nodes";

// Must be defined outside component for XYFlow stability
const nodeTypes: NodeTypes = {
  serverNode: FlowServerNode,
  databaseNode: FlowDatabaseNode,
  cacheNode: FlowCacheNode,
  clientNode: FlowClientNode,
  loadBalancerNode: FlowLoadBalancerNode,
  queueNode: FlowQueueNode,
  gatewayNode: FlowGatewayNode,
};

export type FlowNodeType = keyof typeof nodeTypes;
export type FlowNode = Node<FlowNodeData, string>;
export type FlowEdge = Edge & {
  packetLabel?: string;
  packetColor?: string;
};

interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  onConnect?: OnConnect;
  allowConnect?: boolean;
  allowDrag?: boolean;
  fitView?: boolean;
  minHeight?: number;
  interactive?: boolean;
  className?: string;
}

function FlowDiagramInner({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: externalOnNodesChange,
  onEdgesChange: externalOnEdgesChange,
  onConnect: externalOnConnect,
  allowConnect = false,
  allowDrag = true,
  fitView = true,
  minHeight = 320,
  interactive = true,
  className,
}: FlowDiagramProps) {
  const isMobile = useIsMobile();
  const colors = useThemeColors();

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when props change
  useMemo(() => {
    // This is intentional - we want to sync with external state
  }, [initialNodes, initialEdges]);

  const handleConnect = useCallback(
    (params: Parameters<OnConnect>[0]) => {
      if (externalOnConnect) {
        externalOnConnect(params);
      } else {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [externalOnConnect, setEdges]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      style: { stroke: colors.violet, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: colors.violet },
      animated: true,
    }),
    [colors.violet]
  );

  return (
    <div
      className={cn("w-full rounded-lg overflow-hidden", className)}
      style={{ minHeight }}
    >
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        onNodesChange={externalOnNodesChange ?? onNodesChange}
        onEdgesChange={externalOnEdgesChange ?? onEdgesChange}
        onConnect={allowConnect ? handleConnect : undefined}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView={fitView}
        nodesDraggable={allowDrag && !isMobile}
        nodesConnectable={allowConnect}
        elementsSelectable={interactive}
        panOnDrag={interactive}
        zoomOnScroll={interactive}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
      >
        <Background
          gap={20}
          size={1}
          color={colors.border}
          className="!opacity-30"
        />
        {isMobile && <Controls showInteractive={false} className="!bg-background !border-border !shadow-md" />}
      </ReactFlow>
    </div>
  );
}

export function FlowDiagram(props: FlowDiagramProps) {
  return (
    <ReactFlowProvider>
      <FlowDiagramInner {...props} />
    </ReactFlowProvider>
  );
}
