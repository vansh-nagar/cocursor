"use client";

import {
  collab,
  getSyncedVersion,
  receiveUpdates,
  sendableUpdates,
} from "@codemirror/collab";
import { ChangeSet, StateEffect, StateField, type Extension } from "@codemirror/state";
import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  WidgetType,
  type ViewUpdate,
} from "@codemirror/view";
import type { ClientMessage, ServerMessage, SerializedUpdate } from "./collab-protocol";

export interface RemoteCursor {
  peerId: string;
  userName: string;
  anchor: number;
  head: number;
}

/** Applies remote cursor positions to the view. */
export const setRemoteCursors = StateEffect.define<RemoteCursor[]>();

class CursorWidget extends WidgetType {
  constructor(private readonly name: string) {
    super();
  }

  eq(other: CursorWidget) {
    return other.name === this.name;
  }

  toDOM() {
    const wrap = document.createElement("span");
    wrap.className = "cm-remote-cursor";

    const caret = document.createElement("span");
    caret.className = "cm-remote-cursor-caret";

    const label = document.createElement("span");
    label.className = "cm-remote-cursor-label";
    label.textContent = this.name;

    wrap.append(caret, label);
    return wrap;
  }
}

/**
 * Remote cursors, held in a StateField so they survive and are remapped
 * through every local edit — otherwise a peer's caret drifts as you type.
 */
const remoteCursorField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);

    for (const effect of tr.effects) {
      if (!effect.is(setRemoteCursors)) continue;

      const docLength = tr.state.doc.length;
      decorations = Decoration.set(
        effect.value
          .filter((c) => c.head >= 0 && c.head <= docLength)
          .map((c) =>
            Decoration.widget({
              widget: new CursorWidget(c.userName),
              side: 1,
            }).range(c.head),
          ),
        true,
      );
    }

    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export const remoteCursorTheme = EditorView.baseTheme({
  ".cm-remote-cursor": {
    position: "relative",
    display: "inline-block",
    width: 0,
  },
  ".cm-remote-cursor-caret": {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "2px",
    background: "#FA6000",
  },
  ".cm-remote-cursor-label": {
    position: "absolute",
    top: "-1.2em",
    left: 0,
    padding: "0 4px",
    fontSize: "10px",
    lineHeight: "1.2em",
    whiteSpace: "nowrap",
    color: "#fff",
    background: "#FA6000",
    borderRadius: "2px",
    pointerEvents: "none",
  },
});

export interface PeerSyncOptions {
  path: string;
  roomId: string;
  startVersion: number;
  clientID: string;
  send: (message: ClientMessage) => boolean;
  subscribe: (listener: (message: ServerMessage) => void) => () => void;
}

/**
 * Two-way document sync against the collab-api authority.
 *
 * Operational transform via @codemirror/collab: the server owns the document
 * and version, we push updates based on a version, and rebase when it says we
 * are behind. This replaces the previous "send the whole file over the socket"
 * approach, which destroyed cursor position and lost concurrent edits.
 */
export function peerSync(options: PeerSyncOptions): Extension {
  const { path, roomId, startVersion, clientID, send, subscribe } = options;

  const plugin = ViewPlugin.fromClass(
    class {
      private pushing = false;
      private disposed = false;
      private unsubscribe: () => void;
      private lastCursor = { anchor: -1, head: -1 };
      private cursors = new Map<string, RemoteCursor>();

      constructor(private readonly view: EditorView) {
        this.unsubscribe = subscribe((message) => {
          if (this.disposed) return;

          if (message.type === "doc-updates" && message.path === path) {
            const updates = message.updates.map((u: SerializedUpdate) => ({
              changes: ChangeSet.fromJSON(u.changes),
              clientID: u.clientID,
            }));
            this.view.dispatch(receiveUpdates(this.view.state, updates));
            return;
          }

          if (message.type === "presence" && message.path === path) {
            this.cursors.set(message.peerId, {
              peerId: message.peerId,
              userName: message.userName,
              anchor: message.anchor,
              head: message.head,
            });
            this.view.dispatch({
              effects: setRemoteCursors.of([...this.cursors.values()]),
            });
            return;
          }

          if (message.type === "peer-left") {
            this.cursors.delete(message.peerId);
            this.view.dispatch({
              effects: setRemoteCursors.of([...this.cursors.values()]),
            });
          }
        });
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.transactions.length) {
          void this.push();
        }

        if (update.selectionSet) {
          const { anchor, head } = update.state.selection.main;
          if (anchor !== this.lastCursor.anchor || head !== this.lastCursor.head) {
            this.lastCursor = { anchor, head };
            send({ type: "presence", roomId, path, anchor, head });
          }
        }
      }

      private async push() {
        if (this.pushing || this.disposed) return;

        const updates = sendableUpdates(this.view.state);
        if (updates.length === 0) return;

        this.pushing = true;
        try {
          send({
            type: "doc-push",
            roomId,
            path,
            version: getSyncedVersion(this.view.state),
            updates: updates.map((u) => ({
              changes: u.changes.toJSON(),
              clientID: u.clientID,
            })),
          });
        } finally {
          this.pushing = false;
        }

        // Anything typed while that was in flight.
        if (sendableUpdates(this.view.state).length) void this.push();
      }

      destroy() {
        this.disposed = true;
        this.unsubscribe();
      }
    },
  );

  return [
    collab({ startVersion, clientID }),
    remoteCursorField,
    remoteCursorTheme,
    plugin,
  ];
}
