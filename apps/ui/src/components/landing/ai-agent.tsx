"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Search,
  GitBranch,
  Terminal,
  ShieldCheck,
  Code2,
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Cpu,
} from "lucide-react";

interface Capability {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  detail: React.ReactNode;
}

const AiAgent = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const animationRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const capabilities: Capability[] = [
    {
      id: "interpret",
      label: "Interpret",
      icon: <Brain className="w-5 h-5" />,
      description: "Understand complex user intent and context",
      detail: (
        <div className="flex flex-col gap-2.5 w-full">
          <div className="flex items-center gap-2 text-sm text-foreground/90 font-medium">
            <Code2 className="w-4 h-4 text-primary" />
            <span>Parsing intent...</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {[85, 65, 90].map((width, i) => (
              <div
                key={i}
                className="h-1.5 bg-muted/50 rounded-full overflow-hidden relative"
                style={{ width: `${width}%` }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent w-1/2"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "analyze",
      label: "Analyze",
      icon: <Search className="w-5 h-5" />,
      description: "Deep codebase scanning and pattern recognition",
      detail: (
        <div className="grid grid-cols-4 gap-1 h-28 items-end">
          {[40, 70, 50, 90].map((h, i) => (
            <motion.div
              key={i}
              className="bg-primary/20 rounded-sm w-full"
              animate={{ height: [h + "%", h * 0.5 + "%", h + "%"] }}
              transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </div>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      icon: <GitBranch className="w-5 h-5" />,
      description: "Strategic execution path generation",
      detail: (
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-8 h-0.5 bg-muted" />
          <motion.div
            className="w-2 h-2 rounded-full border border-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="w-8 h-0.5 bg-muted" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      ),
    },
    {
      id: "execute",
      label: "Execute",
      icon: <Terminal className="w-5 h-5" />,
      description: "Active code generation and modifications",
      detail: (
        <div className="w-full border-border/60 font-mono text-[10px] text-muted-foreground shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-foreground/80">
              <span className="text-primary opacity-70">❯</span>
              <span className="font-medium">npm run build</span>
            </div>
            <div className="pl-3 opacity-60">
              <span>Building project...</span>
            </div>
            <motion.div
              className="pl-3 text-green-500/80 flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Build complete</span>
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      id: "validate",
      label: "Validate",
      icon: <ShieldCheck className="w-5 h-5" />,
      description: "Security checks and error verification",
      detail: (
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    let lastTime = performance.now();
    const speed = 0.0003;

    const animate = (time: number) => {
      if (!activeNode) {
        const delta = time - lastTime;
        setAngle((prev) => (prev + delta * speed) % (Math.PI * 2));
      }
      lastTime = time;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [activeNode]);

  const radius = 180;

  const getNodePosition = (index: number) => {
    const nodeAngle = angle + (index * (Math.PI * 2)) / capabilities.length;
    if (activeNode === capabilities[index].id) {
      return {
        x: Math.cos(nodeAngle) * radius,
        y: Math.sin(nodeAngle) * radius,
        scale: 1.2,
        zIndex: 50,
      };
    }
    return {
      x: Math.cos(nodeAngle) * radius,
      y: Math.sin(nodeAngle) * radius,
      scale: 1,
      zIndex: 10,
    };
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).classList.contains("orbit-track")
    ) {
      setActiveNode(null);
    }
  };

  return (
    <div className="relative flex justify-center py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      <div className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] relative z-10 px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          <div
            className="relative flex items-center justify-center min-h-[320px] sm:min-h-[400px] md:min-h-[500px]"
            onClick={handleContainerClick}
          >
            <div
              className="relative w-[90vw] max-w-[320px] sm:max-w-[400px] md:max-w-[500px] h-[90vw] max-h-[320px] sm:max-h-[400px] md:max-h-[500px] flex items-center justify-center"
              ref={containerRef}
            >
              <motion.div
                className="absolute inset-0 rounded-full border border-border opacity-20 orbit-track cursor-pointer"
                style={{
                  width: radius * 2,
                  height: radius * 2,
                  left: "50%",
                  top: "50%",
                  x: "-50%",
                  y: "-50%",
                }}
                animate={{
                  opacity: activeNode ? 0.1 : 0.2,
                  scale: activeNode ? 0.95 : 1,
                }}
              />

              <motion.div
                className="absolute inset-0 rounded-full border border-dashed border-primary/20 opacity-20 pointer-events-none"
                style={{
                  width: radius * 1.5,
                  height: radius * 1.5,
                  left: "50%",
                  top: "50%",
                  x: "-50%",
                  y: "-50%",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />

              <motion.div
                className="absolute z-20 flex flex-col items-center justify-center p-6 pointer-events-none"
                animate={{
                  scale: activeNode ? 0.8 : 1,
                  opacity: activeNode ? 0.5 : 1,
                  filter: activeNode ? "blur(2px)" : "blur(0px)",
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-2 bg-primary/10 rounded-full"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.2, 0.4] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />
                  <div
                    style={{
                      background:
                        "linear-gradient(180deg, #FF5700 0%, #EF5200 100%)",
                      backgroundBlendMode: "plus-lighter, normal",
                      boxShadow:
                        "0px 42px 107px rgba(255, 88, 0, 0.34), 0px 24.7206px 32.2574px rgba(255, 88, 0, 0.1867), 0px 10.2677px 13.3981px rgba(255, 88, 0, 0.22), 0px 3.71362px 4.84582px rgba(255, 88, 0, 0.153301), inset 0px 1px 18px 2px #FFEDDB, inset 0px 1px 4px 2px #FFEDDB",
                    }}
                    className="relative w-16 h-16 bg-background border border-primary/50 rounded-full flex items-center justify-center shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)]"
                  >
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {activeNode && (
                  <motion.div
                    layout
                    className="absolute z-40 left-1/2 top-full lg:right-[-320px] lg:left-auto lg:top-1/2 lg:-translate-y-1/2 w-[90vw] max-w-xs sm:max-w-sm md:max-w-md lg:w-80 backdrop-blur-md border p-4 rounded-2xl"
                    initial={{ opacity: 0, x: -40, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      opacity: { duration: 0.2 },
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {capabilities.map(
                        (cap) =>
                          cap.id === activeNode && (
                            <motion.div
                              key={cap.id}
                              className="space-y-4"
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 aspect-square rounded-xl flex items-center justify-center text-primary border">
                                  {cap.icon}
                                </div>
                                <div>
                                  <h4 className=" text-lg text-foreground">
                                    {cap.label}
                                  </h4>
                                  <p className="text-xs text-muted-foreground tracking-wider text-primary">
                                    {cap.description}
                                  </p>
                                </div>
                              </div>
                              <div className="py-4 px-4 bg-muted/40 rounded-xl border border-border/50">
                                {cap.detail}
                              </div>
                            </motion.div>
                          ),
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {capabilities.map((cap, index) => {
                const pos = getNodePosition(index);
                const isActive = activeNode === cap.id;

                return (
                  <motion.div
                    key={cap.id}
                    className="absolute flex items-center justify-center cursor-pointer"
                    style={{
                      x: pos.x,
                      y: pos.y,
                      zIndex: pos.zIndex,
                    }}
                    animate={{
                      scale: isActive ? 1.3 : 1,
                      opacity: activeNode && !isActive ? 0.2 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNode(isActive ? null : cap.id);
                    }}
                  >
                    <motion.div
                      className={`
                        relative w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-300
                        ${isActive ? "bg-background border-primary ring-4 ring-primary/20 shadow-[0_0_40px_-5px_rgba(var(--primary),0.6)]" : "bg-background hover:bg-muted border-border shadow-lg hover:scale-110"}
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {cap.icon}
                      </div>

                      {!isActive && !activeNode && (
                        <motion.span
                          className="absolute border-dashed -bottom-8 text-xs font-semibold text-muted-foreground whitespace-nowrap bg-background/80 px-2 py-0.5 rounded-full border border-border shadow-sm backdrop-blur-sm"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {cap.label}
                        </motion.span>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center mt-10 lg:mt-0 lg:pl-8 px-2 sm:px-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-4 sm:mb-5">
              Supercharged Intelligence
            </h2>
            <p className="text-muted-foreground max-w-md text-base sm:text-lg">
              Our AI agent autonomously navigates your codebase to understand,
              plan, and execute complex tasks with precision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAgent;
