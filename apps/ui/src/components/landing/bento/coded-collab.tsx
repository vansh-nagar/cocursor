"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

const CodeLine = ({ num, children, isEditing }: { num: number; children: React.ReactNode; isEditing?: boolean }) => (
  <div className={`flex gap-3 px-4 py-0.5 transition-colors font-mono text-[10px] sm:text-xs leading-tight ${isEditing ? 'bg-orange-500/10' : 'hover:bg-white/5'}`}>
    <span className="w-6 text-neutral-700 text-right select-none">{num}</span>
    <div className="flex-1 whitespace-pre">{children}</div>
  </div>
);

const CodedCollab = () => {
  const [line1, setLine1] = useState("const sync = () => {");
  const [line2, setLine2] = useState("  return \"Cocursor\";");
  const [line3, setLine3] = useState("};");
  const [line4, setLine4] = useState("");
  
  const [saaraPos, setSaaraPos] = useState({ x: 40, y: 20 });
  const [vanshPos, setVanshPos] = useState({ x: 120, y: 80 });
  
  const [editingLine, setEditingLine] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const simulate = async () => {
      if (!isMounted) return;

      // Initial state
      setLine1("const sync = () => {");
      setLine2("  return \"Cocursor\";");
      setLine3("};");
      setLine4("");
      setEditingLine(null);

      await new Promise(r => setTimeout(r, 2000));

      // 1. Saara moves to line 2 to change "Cocursor" to "Fast"
      setSaaraPos({ x: 100, y: 24 });
      setEditingLine(2);
      
      const line2Base = "  return \"";
      const words = ["Cocursor", "Fast"];
      
      // Backspace "Cocursor"
      for (let i = words[0].length; i >= 0; i--) {
        if (!isMounted) return;
        setLine2(line2Base + words[0].slice(0, i) + "\";");
        await new Promise(r => setTimeout(r, 80));
      }
      
      // Type "Fast"
      for (let i = 1; i <= words[1].length; i++) {
        if (!isMounted) return;
        setLine2(line2Base + words[1].slice(0, i) + "\";");
        await new Promise(r => setTimeout(r, 120));
      }
      
      setEditingLine(null);
      await new Promise(r => setTimeout(r, 1000));

      // 2. Vansh moves to line 4 to add a comment
      setVanshPos({ x: 40, y: 68 });
      setEditingLine(4);
      
      const comment = "// Vansh: LGTM! 🚀";
      for (let i = 1; i <= comment.length; i++) {
        if (!isMounted) return;
        setLine4(comment.slice(0, i));
        await new Promise(r => setTimeout(r, 100));
      }
      
      setEditingLine(null);
      await new Promise(r => setTimeout(r, 3000));

      if (isMounted) simulate();
    };

    simulate();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="w-full aspect-16/10 bg-[#0d0d0d] rounded-2xl border border-[#222] shadow-xl overflow-hidden font-mono flex flex-col relative group">
      <div className="flex-1 py-6 relative overflow-hidden bg-[#0d0d0d]">
        <CodeLine num={1}><span className="text-purple-400">const</span> <span className="text-blue-300">sync</span> = () =&gt; {"{"}</CodeLine>
        <CodeLine num={2} isEditing={editingLine === 2}>
           <span className="text-purple-400">{line2.startsWith("  return") ? "  return" : ""}</span> 
           <span className="text-emerald-300">{line2.slice(line2.indexOf('"'))}</span>
        </CodeLine>
        <CodeLine num={3}>{"};"}</CodeLine>
        <CodeLine num={4} isEditing={editingLine === 4}>
           <span className="text-neutral-500">{line4}</span>
        </CodeLine>
        <CodeLine num={5}>{" "}</CodeLine>

        {/* Saara Cursor */}
        <motion.div
           animate={{ x: saaraPos.x, y: saaraPos.y }}
           transition={{ duration: 0.5, ease: "easeInOut" }}
           className="absolute z-20 pointer-events-none"
        >
          <div className="flex flex-col items-start">
             <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M1 1L15 5.66667L8.66667 8.33333L6 14.6667L1 1Z" fill="#FA6000" stroke="white" strokeWidth="0.5" /></svg>
             <div className="bg-[#FA6000] text-white text-[8px] px-1 rounded-[1px] font-medium shadow-lg">Saara</div>
          </div>
        </motion.div>

        {/* Vansh Cursor */}
        <motion.div
          animate={{ x: vanshPos.x, y: vanshPos.y }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute z-20 pointer-events-none"
        >
          <div className="flex flex-col items-start">
             <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M1 1L15 5.66667L8.66667 8.33333L6 14.6667L1 1Z" fill="#000DFF" stroke="white" strokeWidth="0.5" /></svg>
             <div className="bg-[#000DFF] text-white text-[8px] px-1 rounded-[1px] font-medium shadow-lg">Vansh</div>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default CodedCollab;
