"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Mic,
  Video,
  FileText,
  FileArchive,
  FileType,
  Image as ImageIcon,
  Check,
  MicOff,
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";

const steps = [
  {
    id: "messaging",
    label: "MESSAGING",
    title: "Real-Time Chat",
    description: "Instant messaging between peers",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    id: "voice",
    label: "VOICE CHAT",
    title: "Voice Communication",
    description: "Crystal-clear peer-to-peer audio",
    icon: <Mic className="w-5 h-5" />,
  },
  {
    id: "video",
    label: "VIDEO CALLS",
    title: "Video Sessions",
    description: "High-quality peer video calls",
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: "files",
    label: "FILE SHARING",
    title: "File Transfer",
    description: "Send files instantly between peers",
    icon: <FileText className="w-5 h-5" />,
  },
];

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const smoothTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
};

const MessagingPanel = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={smoothTransition}
    className="h-full flex flex-col items-center justify-center p-8"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, ...smoothTransition }}
      className="relative w-full max-w-sm space-y-3"
    >
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, ...smoothTransition }}
        className="flex items-start gap-2"
      >
        <div className="w-8 h-8 rounded-full bg-background border border-border overflow-hidden shrink-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&h=128&facepad=2"
            alt="Peer 1"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="bg-background border border-border rounded-sm px-4 py-2.5">
          <p className="text-foreground text-sm">Ready to start the session?</p>
          <span className="text-muted-foreground text-xs">2:34 PM</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, ...smoothTransition }}
        className="flex items-start gap-2 justify-end"
      >
        <div className="bg-background border border-border rounded-sm px-4 py-2.5">
          <p className="text-foreground text-sm">Yes, let's do it!</p>
          <span className="text-muted-foreground text-xs text-right block">
            2:34 PM
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-background border border-border overflow-hidden shrink-0">
          <img
            src="/image/pfp.png"
            alt="You"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>
    </motion.div>
  </motion.div>
);

const VoicePanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={smoothTransition}
      className="h-full flex flex-col items-center justify-center p-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, ...smoothTransition }}
        className="relative"
      >
        {/* Audio waveform */}
        <div className="flex items-center justify-center gap-1 h-20 mb-4">
          {[...Array(16)].map((_, i) => {
            const height = [
              12, 24, 18, 32, 28, 40, 36, 48, 44, 38, 30, 26, 20, 16, 12, 10,
            ];
            return (
              <motion.div
                key={i}
                className="w-1 bg-foreground rounded-full"
                animate={{
                  height: [
                    height[i],
                    height[i] * 0.6,
                    height[i] * 1.2,
                    height[i] * 0.8,
                    height[i],
                  ],
                }}
                transition={{
                  duration: 1 + Math.random() * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

  
      </motion.div>
    </motion.div>
  );
};

const VideoPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={smoothTransition}
      className="h-full p-8 flex items-center justify-center"
    >
      <div className="w-full max-w-md mb-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, ...smoothTransition }}
          className="relative aspect-video bg-background mb-2 rounded-xl border border-border overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-background border border-border overflow-hidden">
              <img
                src="/image/pfp.png"
                alt="Peer 1"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </motion.div>

        {/* Peer thumbnails */}
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, ...smoothTransition }}
              className="aspect-video bg-background rounded-lg border border-border flex items-center justify-center relative overflow-hidden"
            >
              <div className="w-6 h-6 rounded-full bg-background border border-border overflow-hidden">
                <img
                  src={
                    i === 0
                      ? "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=128&h=128&facepad=2"
                      : i === 1
                        ? "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&h=128&facepad=2"
                        : "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=128&h=128&facepad=2"
                  }
                  alt={`Peer ${i + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {i === 2 && (
                <div className="absolute bottom-1.5 right-1.5 p-1  bg-background border border-border rounded-full flex items-center justify-center">
                  <MicOff size={10} className="text-destructive" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const FilesPanel = () => {
  const files = [
    {
      name: "project-files.zip",
      size: "2.4 MB",
      progress: 100,
      icon: <FileArchive className="w-5 h-5" />,
    },
    {
      name: "presentation.pdf",
      size: "1.8 MB",
      progress: 68,
      icon: <FileType className="w-5 h-5" />,
    },
    {
      name: "screenshot.png",
      size: "856 KB",
      progress: 35,
      icon: <ImageIcon className="w-5 h-5" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={smoothTransition}
      className="h-full p-8 flex items-center justify-center"
    >
      <div className="w-full max-w-md space-y-3">
        {files.map((file, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.15, ...smoothTransition }}
            className="bg-background border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-foreground">
                {file.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">
                  {file.name}
                </p>
                <p className="text-muted-foreground text-xs">{file.size}</p>
              </div>
              {file.progress === 100 ? (
                <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                </div>
              ) : (
                <span className="text-foreground text-xs font-medium shrink-0">
                  {file.progress}%
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                initial={{ width: 0 }}
                animate={{ width: `${file.progress}%` }}
                transition={{
                  delay: 0.3 + i * 0.2,
                  duration: 1.2,
                  ease: "easeOut",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const AnimationPreview = ({ activeStep }: { activeStep: number }) => {
  const panels = [MessagingPanel, VoicePanel, VideoPanel, FilesPanel];
  const ActivePanel = panels[activeStep];

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden">
      <AnimatePresence mode="wait">
        <ActivePanel key={activeStep} />
      </AnimatePresence>
    </div>
  );
};

const PeerCoding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isHovering) {
      intervalRef.current = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovering]);

  return (
    <div className="relative flex justify-center py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      <div className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] relative z-10">
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 items-start"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="lg:col-span-2 relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-5">
              Real-Time Peer
              <br />
              Connections
            </h2>

            <div className="space-y-2">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  onMouseEnter={() => setActiveStep(index)}
                  className="relative"
                  transition={springTransition}
                >
                  {activeStep === index && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-2xl border border-orange-500/30 overflow-hidden"
                      transition={springTransition}
                    >
                      <style>{`
                        @keyframes stripe-move {
                          0% { background-position: 0 0; }
                          100% { background-position: 50px 50px; }
                        }
                        .active-stripe-bg {
                          background-image: repeating-linear-gradient(
                            45deg,
                            rgba(250, 96, 0, 0.05),
                            rgba(250, 96, 0, 0.05) 10px,
                            transparent 10px,
                            transparent 20px
                          );
                          background-size: 50px 50px;
                          animation: stripe-move 2s linear infinite;
                        }
                      `}</style>
                      <div className="absolute inset-0 active-stripe-bg" />
                      <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent" />
                    </motion.div>
                  )}

                  <div
                    className={`relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors duration-300 ${
                      activeStep !== index ? "hover:bg-transparent" : ""
                    }`}
                  >
                    <motion.div
                      className={`relative z-10 w-12 h-12  rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        activeStep === index
                          ? "bg-[#FA6000] text-white"
                          : "bg-accent text-zinc-500"
                      }`}
                      animate={
                        activeStep === index ? { scale: [1, 1.05, 1] } : {}
                      }
                      transition={{ duration: 0.3 }}
                    >
                      {step.icon}
                    </motion.div>

                    <div className="pt-1 relative z-10">
                      <p
                        className={`font-medium transition-colors duration-300 ${
                          activeStep === index ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          activeStep === index
                            ? "text-zinc-400"
                            : "text-zinc-600"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimationPreview activeStep={activeStep} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerCoding;
