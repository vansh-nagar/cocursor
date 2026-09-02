/** Messages a client may send. */
export type ClientMessage =
  | { type: "join"; roomId: string; userName?: string }
  | { type: "message"; roomId: string; message: string }
  | { type: "offer"; roomId: string; offer: unknown }
  | { type: "answer"; roomId: string; answer: unknown }
  | { type: "candidate"; roomId: string; candidate: unknown }
  // --- @codemirror/collab document sync ---
  | { type: "doc-open"; roomId: string; path: string; fallbackDoc: string }
  | {
      type: "doc-push";
      roomId: string;
      path: string;
      version: number;
      updates: SerializedUpdate[];
    }
  | { type: "doc-pull"; roomId: string; path: string; version: number }
  | {
      type: "presence";
      roomId: string;
      path: string;
      anchor: number;
      head: number;
    };

/** A CodeMirror update, serialized for the wire. */
export interface SerializedUpdate {
  changes: unknown;
  clientID: string;
  effects?: unknown[];
}

/** Messages the server may send. */
export type ServerMessage =
  | { type: "toast"; message: string; variant?: "success" | "error" | "info" }
  | { type: "joined"; roomId: string; peerId: string }
  | { type: "join-rejected"; reason: string }
  | { type: "user-count"; count: number }
  | { type: "send-offer"; message: string }
  | { type: "offer"; offer: unknown }
  | { type: "answer"; answer: unknown }
  | { type: "candidate"; candidate: unknown }
  | { type: "message"; message: string; fromPeerId: string; sentAt: number }
  | {
      type: "doc-opened";
      path: string;
      version: number;
      doc: string;
    }
  | {
      type: "doc-updates";
      path: string;
      version: number;
      updates: SerializedUpdate[];
    }
  | {
      type: "presence";
      path: string;
      peerId: string;
      userName: string;
      anchor: number;
      head: number;
    }
  | { type: "peer-left"; peerId: string };
