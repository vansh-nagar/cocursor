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
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./custom-node";
import { useWorkFlowsDetails } from "@/hooks/use-workflows";
import InitialNode from "./initial-node";

// const initialNodes = [
//   {
//     id: "n3",
//     type: "InitialNode",
//     position: { x: 400, y: 200 },
//     data: { label: "Node 2" },
//   },
// ];
// const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

export default function ReactFlowCanvas({
  workflowId,
}: {
  workflowId?: string;
}) {
  const { data } = useWorkFlowsDetails(workflowId || "");

  const [nodes, setNodes] = useState(data.edges);
  const [edges, setEdges] = useState(data.nodes);

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
        <MiniMap
          pannable // allow dragging the viewport from the minimap
          zoomable // allow zooming by scroll inside the minimap
        />
      </ReactFlow>
    </div>
  );
}
