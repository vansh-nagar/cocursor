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
  Edge,
  Node,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkFlowsDetails } from "@/hooks/use-workflows";
import { nodeComponents } from "@/config/node-components";
import { Button } from "../ui/button";
import { Plus, SaveIcon } from "lucide-react";
import NodeSelector from "./node-selector";

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

  const [nodes, setNodes] = useState<Node[]>(data.nodes as Node[]);
  const [edges, setEdges] = useState<Edge[]>(data.edges as Edge[]);

  const [open, setOpen] = useState(false);

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
    <div className="  h-full  pt-14 ">
      <ReactFlow
        proOptions={{
          hideAttribution: true,
        }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        fitView
      >
        <Background />
        <Controls />

        <MiniMap
          pannable // allow dragging the viewport from the minimap
          zoomable // allow zooming by scroll inside the minimap
        />
        <Panel position="top-right">
          <div className="  flex gap-2">
            <Button>
              <SaveIcon /> Save
            </Button>
            <NodeSelector open={open} onOpenChange={() => {}}>
              <Button
                onClick={() => {
                  setOpen(true);
                }}
                variant="outline"
                size="icon"
              >
                <Plus />
              </Button>
            </NodeSelector>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
