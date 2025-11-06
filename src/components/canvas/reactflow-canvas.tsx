"use client";
import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./custom-node";
import { useWorkFlowsDetails } from "@/hooks/use-workflows";
import InitialNode from "./initial-node";
import { Spinner } from "../ui/spinner";

export default function ReactFlowCanvas({
  workflowId,
}: {
  workflowId?: string;
}) {
  const { data: workflows, isLoading } = useWorkFlowsDetails(workflowId || "");

  const [nodes, setNodes] = useState(workflows.nodes);
  const [edges, setEdges] = useState(workflows.edges);

  useEffect(() => {
    if (workflows) {
      setNodes(workflows.nodes as Node[]);
      setEdges(workflows.edges as Edge[]);
    }
  }, [workflows]);

  if (isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  const nodeTypes = {
    CustomNode,
    InitialNode,
  };

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );

  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  return (
    <div className="  h-full  ">
      <ReactFlow
        proOptions={{
          hideAttribution: true,
        }}
        nodes={nodes}
        // edges={edges}
        onNodesChange={onNodesChange}
        // onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
