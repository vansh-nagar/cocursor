"use client";

import { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { Loader2, Sparkles, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/**
 * The Ctrl+I inline prompt.
 *
 * Anchored at the cursor, it sends the selection plus surrounding context to
 * the inline-edit endpoint and previews the result as a diff the user accepts
 * or rejects, rather than writing straight into the buffer.
 */
export function InlinePrompt({
  view,
  filePath,
  onClose,
}: {
  view: EditorView;
  filePath: string;
  onClose: () => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // The range this edit applies to, captured before the input steals focus.
  const rangeRef = useRef(view.state.selection.main);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async () => {
    if (!instruction.trim() || loading) return;

    const { from, to } = rangeRef.current;
    const doc = view.state.doc;

    setLoading(true);
    try {
      const res = await fetch("/api/inline-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction,
          selection: doc.sliceString(from, to),
          prefix: doc.sliceString(0, from),
          suffix: doc.sliceString(to),
          filePath,
        }),
      });

      if (!res.ok) throw new Error("The edit could not be generated");

      const data: { result?: string } = await res.json();
      if (!data.result) throw new Error("No edit was returned");

      setProposal(data.result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Inline edit failed");
    } finally {
      setLoading(false);
    }
  };

  const accept = () => {
    if (proposal === null) return;
    const { from, to } = rangeRef.current;
    view.dispatch({
      changes: { from, to, insert: proposal },
      selection: { anchor: from + proposal.length },
    });
    view.focus();
    onClose();
  };

  const reject = () => {
    view.focus();
    onClose();
  };

  return (
    <div className="absolute left-1/2 top-4 z-30 w-[min(560px,90%)] -translate-x-1/2 rounded-md border bg-background shadow-lg">
      <div className="flex items-center gap-2 p-2">
        <Sparkles className="size-4 shrink-0 text-[#FA6000]" />
        <Input
          ref={inputRef}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              proposal === null ? void submit() : accept();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              reject();
            }
          }}
          placeholder={
            rangeRef.current.empty
              ? "Describe what to insert here..."
              : "Describe how to change the selection..."
          }
          className="h-8 flex-1 text-sm"
          disabled={loading}
        />
        {loading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <Button
            size="sm"
            className="h-8 bg-[#FA6000] hover:bg-[#E55800] text-white"
            onClick={() => (proposal === null ? void submit() : accept())}
            disabled={!instruction.trim()}
          >
            {proposal === null ? "Generate" : "Accept"}
          </Button>
        )}
        <Button size="icon" variant="ghost" className="size-8" onClick={reject}>
          <X className="size-4" />
        </Button>
      </div>

      {proposal !== null && (
        <div className="border-t">
          <pre className="max-h-64 overflow-auto p-3 text-xs leading-relaxed">
            <code>{proposal}</code>
          </pre>
          <div className="flex items-center justify-end gap-2 border-t p-2">
            <Button size="sm" variant="outline" onClick={reject}>
              Discard
            </Button>
            <Button
              size="sm"
              className="bg-[#FA6000] hover:bg-[#E55800] text-white"
              onClick={accept}
            >
              <Check className="mr-1 size-3.5" />
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
