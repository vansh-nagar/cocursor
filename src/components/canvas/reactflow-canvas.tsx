"use client";
import { useState, useCallback, useMemo } from "react";
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
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkFlowsDetails } from "@/hooks/use-workflows";
import { nodeComponents } from "@/config/node-components";
import { Button } from "../ui/button";
import { Plus, SaveIcon } from "lucide-react";
import NodeSelector from "./node-selector";
import { useUpdateWorkflow } from "@/hooks/use-workflows";
import { NodeType } from "@prisma/client";
import ExecuteWorkflowButton from "./execute-worflow-button";

export default function ReactFlowCanvas({
  workflowId,
}: {
  workflowId?: string;
}) {
  const updateWorkflow = useUpdateWorkflow();
  const { data } = useWorkFlowsDetails(workflowId || "");

  // map server DTOs → ReactFlow Node/Edge
  const initialNodes: Node[] =
    (data.nodes || []).map((n: any) => ({
      id: n.id,
      position: n.position,
      data: {
        ...n.data,
        label: n.data?.label ?? n.name ?? n.type ?? "Untitled",
      },
      type: (n.type ?? undefined) as string | undefined,
    })) ?? [];

  const initialEdges: Edge[] =
    (data.edges || []).map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      data: e.data ?? {},
    })) ?? [];

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const [open, setOpen] = useState(false);
  const { getNodes, getEdges } = useReactFlow();

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

  const handleSave = () => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    // 🔧 convert ReactFlow nodes → your schema format
    const formattedNodes = currentNodes.map((n) => ({
      id: n.id,
      type: (n.type as string) ?? "DEFAULT", // use enum default
      name: n.data?.label ?? "Untitled Node", // optional
      data: n.data ?? {},
      position: n.position,
    }));

    // 🔧 convert edges to prisma format
    const formattedEdges = currentEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? "main",
      targetHandle: e.targetHandle ?? "main",
      data: e.data ?? {},
    }));

    updateWorkflow.mutate({
      id: workflowId || "",
      nodes: formattedNodes,
      edges: formattedEdges,
    });
  };

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
  }, [nodes]);

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
        snapGrid={[10, 10]}
        snapToGrid={true}
        panOnScroll
        panOnDrag={false}
        selectionOnDrag={true}
      >
        <Background />
        <Controls />

        <MiniMap
          pannable // allow dragging the viewport from the minimap
          zoomable // allow zooming by scroll inside the minimap
        />
        <Panel position="top-right">
          <div className="  flex gap-2">
            <Button disabled={updateWorkflow.isPending} onClick={handleSave}>
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
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId || ""} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
