/** Wire protocol shared with apps/collab-api. Keep both sides in step. */

export interface SerializedUpdate {
  changes: unknown;
  clientID: string;
}

export type ClientMessage =
  | { type: "join"; roomId: string; userName?: string }
  | { type: "message"; roomId: string; message: string }
  | { type: "offer"; roomId: string; offer: RTCSessionDescriptionInit }
  | { type: "answer"; roomId: string; answer: RTCSessionDescriptionInit }
  | { type: "candidate"; roomId: string; candidate: RTCIceCandidateInit }
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

export type ServerMessage =
  | { type: "toast"; message: string; variant?: "success" | "error" | "info" }
  | { type: "joined"; roomId: string; peerId: string }
  | { type: "join-rejected"; reason: string }
  | { type: "user-count"; count: number }
  | { type: "send-offer"; message: string }
  | { type: "offer"; offer: RTCSessionDescriptionInit }
  | { type: "answer"; answer: RTCSessionDescriptionInit }
  | { type: "candidate"; candidate: RTCIceCandidateInit }
  | { type: "message"; message: string; fromPeerId: string; sentAt: number }
  | { type: "doc-opened"; path: string; version: number; doc: string }
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

/**
 * Signalling server URL.
 *
 * Was hardcoded to ws://localhost:8080, which browsers block as mixed content
 * from any HTTPS page.
 */
export function collabWsUrl(): string {
  const configured = process.env.NEXT_PUBLIC_COLLAB_WS_URL;
  if (configured) return configured;

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    // No explicit URL on an HTTPS origin: ws:// would be blocked outright.
    console.warn(
      "[collab] NEXT_PUBLIC_COLLAB_WS_URL is not set; collaboration is disabled.",
    );
    return "";
  }
  return "ws://localhost:8080";
}

/**
 * ICE servers for a peer-to-peer-only call.
 *
 * Calls carry no relay by design: audio, video and files go straight from one
 * browser to the other, so the feature costs nothing to run and needs no
 * infrastructure beyond this signalling socket. STUN is only used to learn
 * each peer's public address — the media itself never touches those servers.
 *
 * Several STUN hosts are listed because a single unreachable one otherwise
 * delays gathering until the handshake has already timed out. A TURN relay can
 * still be configured for calls between two networks that cannot see each
 * other, but nothing requires it and it is empty in every default setup.
 */
export function iceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun.cloudflare.com:3478",
      ],
    },
  ];

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  if (turnUrl) {
    servers.push({
      urls: turnUrl,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
    });
  }
  return servers;
}
