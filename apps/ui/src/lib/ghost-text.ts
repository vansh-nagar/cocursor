"use client";

import {
  Prec,
  StateEffect,
  StateField,
  type Extension,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  WidgetType,
  keymap,
  type ViewUpdate,
} from "@codemirror/view";

/**
 * Inline AI completions ("ghost text").
 *
 * Debounced request after typing stops; Tab accepts, Escape dismisses, and any
 * edit or cursor move cancels both the suggestion and the in-flight request.
 */

const DEBOUNCE_MS = 320;
const MIN_PREFIX = 3;

interface Suggestion {
  text: string;
  pos: number;
}

const setSuggestion = StateEffect.define<Suggestion | null>();

class GhostWidget extends WidgetType {
  constructor(private readonly text: string) {
    super();
  }

  eq(other: GhostWidget) {
    return other.text === this.text;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-ghost-text";
    // First line inline; the rest as a block so multi-line suggestions read
    // correctly rather than collapsing onto the caret's line.
    const [first, ...rest] = this.text.split("\n");
    span.textContent = first;
    if (rest.length) {
      const block = document.createElement("span");
      block.className = "cm-ghost-text-rest";
      block.textContent = "\n" + rest.join("\n");
      span.appendChild(block);
    }
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

const suggestionField = StateField.define<Suggestion | null>({
  create: () => null,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSuggestion)) return effect.value;
    }
    // Any edit or selection change invalidates it.
    if (tr.docChanged || tr.selection) return null;
    return value;
  },
});

const suggestionDecorations = EditorView.decorations.compute(
  [suggestionField],
  (state) => {
    const suggestion = state.field(suggestionField);
    if (!suggestion || suggestion.pos > state.doc.length) {
      return Decoration.none;
    }
    return Decoration.set([
      Decoration.widget({
        widget: new GhostWidget(suggestion.text),
        side: 1,
      }).range(suggestion.pos),
    ]) as DecorationSet;
  },
);

export const ghostTextTheme = EditorView.baseTheme({
  ".cm-ghost-text": {
    opacity: 0.42,
    fontStyle: "italic",
    pointerEvents: "none",
  },
  ".cm-ghost-text-rest": {
    whiteSpace: "pre-wrap",
  },
});

export interface GhostTextOptions {
  filePath: string;
  /** Returns the text to insert at the cursor, or "" for no suggestion. */
  fetchCompletion: (args: {
    prefix: string;
    suffix: string;
    filePath: string;
    signal: AbortSignal;
  }) => Promise<string>;
}

export function ghostText({
  filePath,
  fetchCompletion,
}: GhostTextOptions): Extension {
  const plugin = ViewPlugin.fromClass(
    class {
      private timer: ReturnType<typeof setTimeout> | null = null;
      private controller: AbortController | null = null;

      constructor(private readonly view: EditorView) {}

      update(update: ViewUpdate) {
        // Only a real edit triggers a request. Cursor movement just clears.
        if (!update.docChanged) {
          if (update.selectionSet) this.cancel();
          return;
        }
        this.schedule();
      }

      private cancel() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
        this.controller?.abort();
        this.controller = null;
      }

      private schedule() {
        this.cancel();
        this.timer = setTimeout(() => void this.request(), DEBOUNCE_MS);
      }

      private async request() {
        const { state } = this.view;
        const pos = state.selection.main.head;

        if (!state.selection.main.empty) return;

        const prefix = state.doc.sliceString(0, pos);
        if (prefix.trim().length < MIN_PREFIX) return;

        const suffix = state.doc.sliceString(pos);

        this.controller = new AbortController();
        try {
          const completion = await fetchCompletion({
            prefix,
            suffix,
            filePath,
            signal: this.controller.signal,
          });

          // Discard if the user moved or typed while the request was in flight.
          if (
            !completion ||
            this.view.state.selection.main.head !== pos ||
            this.view.state.doc.length !== state.doc.length
          ) {
            return;
          }

          this.view.dispatch({
            effects: setSuggestion.of({ text: completion, pos }),
          });
        } catch {
          // Aborted or failed: no suggestion, no error surfaced to the user.
        } finally {
          this.controller = null;
        }
      }

      destroy() {
        this.cancel();
      }
    },
  );

  return [
    suggestionField,
    suggestionDecorations,
    ghostTextTheme,
    plugin,
    // Highest precedence so Tab accepts a suggestion before indentWithTab
    // inserts a tab character.
    Prec.highest(
      keymap.of([
        {
          key: "Tab",
          run(view) {
            const suggestion = view.state.field(suggestionField, false);
            if (!suggestion) return false;

            view.dispatch({
              changes: {
                from: suggestion.pos,
                insert: suggestion.text,
              },
              selection: {
                anchor: suggestion.pos + suggestion.text.length,
              },
              effects: setSuggestion.of(null),
            });
            return true;
          },
        },
        {
          key: "Escape",
          run(view) {
            if (!view.state.field(suggestionField, false)) return false;
            view.dispatch({ effects: setSuggestion.of(null) });
            return true;
          },
        },
      ]),
    ),
  ];
}
