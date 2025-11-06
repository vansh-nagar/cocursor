"use client";
import { useState, useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./custom-node";
import { useWorkFlowsDetails } from "@/hooks/use-workflows";
import InitialNode from "./initial-node";

export default function ReactFlowCanvas({
  workflowId,
}: {
  workflowId?: string;
}) {
  const { data: workflows } = useWorkFlowsDetails(workflowId || "");

  const [nodes, setNodes] = useState(workflows.nodes);
  const [edges, setEdges] = useState(workflows.edges);

  const nodeTypes = {
    CustomNode,
    InitialNode,
  };

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
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
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
