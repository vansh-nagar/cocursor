import toposort from "toposort";

import { Edge, Node } from "@prisma/client";

export const topologicalSort = (nodes: Node[], edges: Edge[]): Node[] => {
  if (edges.length === 0) return nodes;

  const edgesArr: [string, string][] = edges.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  const connectedNodeIds = new Set<string>();
  for (const conn of edges) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edgesArr.push([node.id, node.id]);
    }
  }

  let sortedNodeIds: string[] = [];
  try {
    sortedNodeIds = toposort(edgesArr);
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error(
        "Cycle detected in workflow nodes. Please check your workflow configuration."
      );
    }
    // rethrow unexpected errors to avoid leaving sortedNodeIds undefined
    throw error;
  }

  const nodemap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodemap.get(id)!).filter(Boolean);
};
