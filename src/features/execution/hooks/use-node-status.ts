import { Realtime } from "@inngest/realtime";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useState, useEffect } from "react";
import { NodeStatus } from "@/components/canvas/node-status-indicator";

interface NodeStatusPayload {
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<Realtime.Subscribe.Token>;
}

export function useNodeStatus({
  nodeId,
  channel,
  topic,
  refreshToken,
}: NodeStatusPayload) {
  const [status, setStatus] = useState<NodeStatus>("initial");
  const { data } = useInngestSubscription({ refreshToken, enabled: true });

  useEffect(() => {
    if (!data.length) return;

    const latestMessage = data
      .filter(
        (msg) =>
          msg.kind === "data" &&
          msg.channel === channel &&
          msg.topic === topic &&
          msg.data.nodeId === nodeId
      )
      .sort((a, b) => {
        if (a.kind === "data" && b.kind === "data") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return 0;
      })[0];

    // ✅ Check if latestMessage exists before accessing its properties
    if (latestMessage && latestMessage.kind === "data") {
      setStatus(latestMessage.data.status as NodeStatus);
    }
  }, [data, nodeId, channel, topic]);

  return status;
}
