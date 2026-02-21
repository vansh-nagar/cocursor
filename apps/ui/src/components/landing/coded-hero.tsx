"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { 
  FileCode, 
  Search, 
  GitBranch, 
  Settings, 
  Play, 
  Terminal as TerminalIcon, 
  MessageSquare,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  FileJson,
  Layout,
  Globe,
  Terminal,
  Send,
  X
} from "lucide-react";

const Cursor = ({ name, color }: { name: string; color: string }) => (
  <div className="flex flex-col items-start gap-1">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M1 1L15 5.66667L8.66667 8.33333L6 14.6667L1 1Z" fill={color} stroke="white" strokeWidth="1" />
    </svg>
    <div className="px-1.5 py-0.5 text-[9px] text-white rounded-[2px] font-medium shadow-sm" style={{ backgroundColor: color }}>
      {name}
    </div>
  </div>
);

const CodedHero = () => {
  const [activeTab, setActiveTab] = useState("page.tsx");
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { role: "peer", text: "Hey Vansh, I just pushed the new sync logic. Can you review it?", name: "Saara" },
    { role: "user", text: "Checking it now! The real-time cursor feels super smooth.", name: "Vansh" }
  ]);
  const [messageInput, setMessageInput] = useState("");
  const [terminalLines, setTerminalLines] = useState([
    { type: "cmd", text: "npm run dev" },
    { type: "out", text: "> cocursor-v1@1.0.0 dev" },
    { type: "out", text: "> next dev --turbo" },
    { type: "out", text: "Ready in 412ms" },
  ]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim()) return;
    setChatMessages([...chatMessages, { role: "user", text: messageInput, name: "Vansh" }]);
    setMessageInput("");
    
    // Auto-reply simulation
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: "peer", text: "That looks intentional! The interactivity is working perfectly. 🔥", name: "Saara" }]);
    }, 1000);
  };

  const tabs = ["page.tsx", "globals.css", "layout.tsx"];

  return (
    <div className="w-full h-full bg-[#0a0a0a] border border-[#222] shadow-2xl overflow-hidden font-sans flex text-neutral-400 select-none">
      
      {/* 1. Activity Bar (Interactive) */}
      <div className="w-12 border-r border-[#222] bg-[#050505] flex flex-col items-center py-4 gap-6 shrink-0">
        <div 
          className={cn("cursor-pointer transition-colors", isExplorerOpen ? "text-[#FA6000]" : "opacity-40 hover:opacity-100")}
          onClick={() => setIsExplorerOpen(!isExplorerOpen)}
        >
          <FileCode size={20} />
        </div>
        <Search size={20} className="opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
        <GitBranch size={20} className="opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
        <div className="mt-auto flex flex-col gap-6 items-center border-t border-[#222] pt-6 w-full">
          <div 
            className={cn("cursor-pointer transition-colors", isChatOpen ? "text-[#FA6000]" : "opacity-40 hover:opacity-100")}
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageSquare size={20} />
          </div>
          <Settings size={20} className="opacity-40 hover:opacity-100 cursor-pointer transition-opacity mb-4" />
        </div>
      </div>

      {/* 2. Explorer Sidebar (Toggleable) */}
      <AnimatePresence initial={false}>
        {isExplorerOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 192, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-[#222] bg-[#080808] flex-col shrink-0 hidden md:flex overflow-hidden"
          >
            <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex justify-between items-center whitespace-nowrap">
              Explorer
              <ChevronDown size={14} />
            </div>
            <div className="flex flex-col text-[11px] gap-0.5 whitespace-nowrap">
              <div className="flex items-center px-4 py-1 gap-2 hover:bg-white/5 cursor-pointer transition-colors">
                <ChevronDown size={12} />
                <span className="font-semibold text-neutral-300">src</span>
              </div>
              {tabs.map(tab => (
                <div 
                  key={tab}
                  className={cn(
                    "flex items-center px-8 py-1 gap-2 hover:bg-white/5 cursor-pointer transition-all",
                    activeTab === tab ? "text-neutral-300 bg-[#FA6000]/10 border-r-2 border-r-[#FA6000]" : "opacity-60"
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  <FileCode size={12} className={cn(tab.endsWith('.css') ? "text-blue-400" : "text-yellow-500")} />
                  <span>{tab}</span>
                </div>
              ))}
              <div className="flex items-center px-4 py-1 gap-2 hover:bg-white/5 cursor-pointer transition-colors">
                <ChevronRight size={12} />
                <span className="font-semibold">public</span>
              </div>
              <div className="flex items-center px-4 py-1 gap-2 hover:bg-white/5 cursor-pointer transition-colors">
                 <FileJson size={12} className="text-yellow-500" />
                <span>package.json</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Editor Group */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0d0d0d]">
        
        {/* Nav Bar (Tabs) */}
        <div className="h-10 border-b border-[#222] bg-[#050505] flex items-center px-1 sm:px-2 gap-0 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <div 
              key={tab}
              className={cn(
                "px-2 sm:px-4 h-full flex items-center border-r border-[#222] text-[9px] sm:text-[11px] transition-all cursor-pointer whitespace-nowrap gap-1 sm:gap-2",
                activeTab === tab ? "bg-[#0d0d0d] text-neutral-200 border-t-2 border-t-[#FA6000]" : "text-neutral-500 hover:bg-white/5"
              )}
              onClick={() => setActiveTab(tab)}
            >
              <span className={cn("text-[8px] sm:text-[10px]", activeTab === tab ? "text-[#FA6000]" : "text-neutral-600")}>●</span>
              {tab}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 pr-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FA6000] hover:bg-[#E55800] transition-colors rounded text-[10px] text-white font-medium cursor-pointer shadow-lg active:scale-95">
               <Play size={10} fill="currentColor" />
               Run App
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          <div className="flex-1 py-4 font-mono text-[11px] leading-relaxed overflow-hidden">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -5 }}
                 transition={{ duration: 0.15 }}
               >
                 {activeTab === "page.tsx" && (
                   <>
                    {[
                      { num: 1, text: <><span className="text-purple-400">import</span> {"{"} motion {"}"} <span className="text-purple-400">from</span> <span className="text-emerald-300">"motion/react"</span>;</> },
                      { num: 2, text: <><span className="text-purple-400">import</span> {"{"} useIDE {"}"} <span className="text-purple-400">from</span> <span className="text-emerald-300">"@/hooks"</span>;</> },
                      { num: 3, text: "" },
                      { num: 4, text: <><span className="text-purple-400">export default function</span> <span className="text-blue-300">Home</span>() {"{"}</> },
                      { num: 5, text: <>  <span className="text-purple-400">const</span> {"{"} sync {"}"} = <span className="text-yellow-100">useIDE</span>();</> },
                      { num: 6, text: "" },
                      { num: 7, text: <>  <span className="text-purple-400">return</span> (</> },
                      { num: 8, text: <>    &lt;<span className="text-orange-300">main</span> <span className="text-emerald-200">className</span>=<span className="text-emerald-300">"p-8"</span>&gt;</> },
                      { num: 9, text: <>      &lt;<span className="text-orange-300">h1</span>&gt;Building with Cocursor&lt;/<span className="text-orange-300">h1</span>&gt;</> },
                      { num: 10, text: <>      &lt;<span className="text-orange-300">Editor</span> /&gt;</> },
                      { num: 11, text: <>    &lt;/<span className="text-orange-300">main</span>&gt;</> },
                      { num: 12, text: <>  );</> },
                      { num: 13, text: <>{"}"}</> },
                    ].map((line, i) => (
                        <div key={i} className="flex gap-2 sm:gap-4 px-2 sm:px-4 hover:bg-white/5 transition-colors">
                          <span className="w-4 sm:w-8 text-neutral-700 text-right select-none text-[8px] sm:text-[11px]">{line.num}</span>
                          <div className="flex-1 whitespace-pre text-[8px] sm:text-[11px]">{line.text}</div>
                        </div>
                    ))}
                   </>
                 )}
                 {activeTab === "globals.css" && (
                   <>
                    {[
                      { num: 1, text: <><span className="text-blue-300">@tailwind</span> base;</> },
                      { num: 2, text: <><span className="text-blue-300">@tailwind</span> components;</> },
                      { num: 3, text: <><span className="text-blue-300">@tailwind</span> utilities;</> },
                      { num: 4, text: "" },
                      { num: 5, text: <><span className="text-yellow-200">:root</span> {"{"}</> },
                      { num: 6, text: <>  <span className="text-cyan-400">--primary</span>: <span className="text-orange-400">#FA6000</span>;</> },
                      { num: 7, text: <>  <span className="text-cyan-400">--bg</span>: <span className="text-neutral-500">#0a0a0a</span>;</> },
                      { num: 8, text: <>{"}"}</> },
                    ].map((line, i) => (
                        <div key={i} className="flex gap-2 sm:gap-4 px-2 sm:px-4 hover:bg-white/5 transition-colors">
                          <span className="w-4 sm:w-8 text-neutral-700 text-right select-none text-[8px] sm:text-[11px]">{line.num}</span>
                          <div className="flex-1 whitespace-pre text-[8px] sm:text-[11px]">{line.text}</div>
                        </div>
                    ))}
                   </>
                 )}
                 {activeTab === "layout.tsx" && (
                    <div className="px-12 py-8 text-neutral-500 italic">
                       // Click tabs to explore files...
                    </div>
                 )}
               </motion.div>
             </AnimatePresence>

             {/* Animated Cursors */}
             <motion.div
               animate={{ x: [120, 300, 250, 400, 180], y: [60, 80, 150, 100, 60] }}
               transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
               className="absolute z-50 pointer-events-none"
             >
               <Cursor name="Saara" color="#EC4899" />
             </motion.div>
          </div>

          {/* 4. Terminal Section (Interactive prompt) */}
          <div className="h-24 sm:h-32 border-t border-[#222] bg-[#050505] flex flex-col tracking-tight">
            <div className="px-3 sm:px-4 py-1 sm:py-1.5 border-b border-[#222] flex items-center justify-between text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-500">
               <div className="flex gap-4">
                 <span className="text-neutral-200 border-b border-[#FA6000] pb-0.5">Terminal</span>
                 <span className="cursor-pointer hover:text-neutral-300 transition-colors">Output</span>
               </div>
               <Terminal size={10} className="sm:size-3" />
            </div>
            <div className="flex-1 p-2 sm:p-3 font-mono text-[8px] sm:text-[10px] leading-tight text-neutral-400 overflow-y-auto no-scrollbar">
               {terminalLines.map((line, i) => (
                 <div key={i} className={cn("mb-1", line.type === "cmd" ? "flex gap-2" : "opacity-60")}>
                    {line.type === "cmd" && <><span className="text-emerald-500">➜</span> <span className="text-blue-400">~</span></>}
                    {line.text}
                 </div>
               ))}
               <div className="flex gap-2">
                 <span className="text-emerald-500">➜</span>
                 <span className="text-blue-400">~</span>
                 <span className="animate-pulse">|</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Chat Panel (Interactive) */}
      <AnimatePresence initial={false}>
        {isChatOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-[#222] bg-[#080808] flex-col shrink-0 hidden lg:flex overflow-hidden"
          >
             <div className="p-4 border-b border-[#222] flex items-center justify-between shrink-0">
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#FA6000] whitespace-nowrap">Peer Chat</div>
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
             </div>
             <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto no-scrollbar">
                {chatMessages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={cn(
                      "max-w-[90%] p-2 text-[10px] rounded-sm leading-relaxed border shadow-sm",
                      msg.role === "user" 
                        ? "self-end bg-[#FA6000] text-white border-[#E55800]" 
                        : "self-start bg-neutral-900 border-[#222] text-neutral-300"
                    )}
                  >
                    <div className="font-bold opacity-60 mb-0.5 text-[8px] uppercase">{msg.name}</div>
                    {msg.text}
                  </motion.div>
                ))}
             </div>
             <form onSubmit={handleSendMessage} className="p-3 bg-[#050505] border-t border-[#222] flex gap-2">
                <input 
                  type="text" 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 bg-neutral-900 border border-[#222] rounded-sm px-2 py-1 text-[10px] text-neutral-300 focus:outline-none focus:border-[#FA6000]/50"
                />
                <button 
                  type="submit"
                  className="size-7 bg-[#FA6000] hover:bg-[#E55800] rounded-sm flex items-center justify-center transition-colors shadow-lg active:scale-95"
                >
                   <Send size={12} className="text-white" />
                </button>
             </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CodedHero;
