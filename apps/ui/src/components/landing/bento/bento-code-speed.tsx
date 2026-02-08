"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import BentoTextSection from "../bento-text-section";
import BentoGlowSvg1 from "../svg/bento-glow-svg-1";

const BentoCodeSpeed = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        repeat: -1,
        defaults: { ease: "power2.inOut" },
      });
      tlRef.current = tl;

      gsap.set(".ghost-text", { width: 0 });
      gsap.set(".suggestion-text", {
        color: "rgba(157, 180, 204, 0.55)",
        fontStyle: "italic",
        textShadow: "0 0 10px rgba(125, 211, 252, 0.25)",
      });
      gsap.set(".tab-hint", { opacity: 0 });
      gsap.set(".tab-key", { boxShadow: "none" });
      gsap.set(".cursor", { opacity: 1 });

      tl.to(".ghost-text", { width: "100%", duration: 1.4, ease: "none" }, 0.4)
        .to(".tab-hint", { opacity: 0.9, duration: 0.3 }, 1.1)
        .addLabel("awaitTab", 1.9)
        .addPause("awaitTab")
        .to(
          ".tab-key",
          {
            backgroundColor: "rgba(255,255,255,0.25)",
            boxShadow: "0 0 8px rgba(125,211,252,0.4)",
            duration: 0.15,
            yoyo: true,
            repeat: 1,
          },
          "awaitTab+=0.05",
        )
        .to(
          ".suggestion-text",
          {
            color: "#c9d1d9",
            fontStyle: "normal",
            textShadow: "none",
            duration: 0.2,
          },
          "awaitTab+=0.12",
        )
        .to(".tab-hint", { opacity: 0, duration: 0.3 }, 2.3)
        .to(
          ".suggestion-text",
          {
            color: "rgba(157, 180, 204, 0.55)",
            fontStyle: "italic",
            textShadow: "0 0 10px rgba(125, 211, 252, 0.25)",
            duration: 0.2,
          },
          4.1,
        )
        .to(".ghost-text", { width: 0, duration: 0.2 }, 4.3);
    },
    { scope: rootRef },
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      event.preventDefault();
      const tl = tlRef.current;
      if (!tl) return;
      if (tl.paused()) {
        tl.play();
      } else {
        tl.restart();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleTabClick = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (tl.paused()) {
      tl.play();
    } else {
      tl.restart();
    }
  };

  return (
    <div
      ref={rootRef}
      className="rounded-3xl sm:rounded-[40px] md:rounded-[48px] lg:rounded-[56px] border relative overflow-hidden flex flex-col justify-between min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-0"
    >
      <div className="px-4 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pt-8 flex-1">
        <motion.div
          className="editor relative h-full min-h-[220px] sm:min-h-[260px] overflow-hidden rounded-4xl border border-white/10 bg-[#0d1117] p-4 sm:p-5 md:p-6"
          initial={{ opacity: 0.9, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between gap-2 text-xs text-[#8b949e]">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span>index.html</span>
          </div>

          <div className="mt-4 font-mono text-[11px] sm:text-xs leading-5 text-[#c9d1d9]">
            <div>
              <span className="text-[#ffa657]">&lt;!doctype html&gt;</span>
            </div>
            <div>
              <span className="text-[#ffa657]">&lt;html</span>{" "}
              <span className="text-[#79c0ff]">lang</span>
              <span className="text-[#ffa657]">=</span>
              <span className="text-[#a5d6ff]">"en"</span>
              <span className="text-[#ffa657]">&gt;</span>
            </div>
            <div className="pl-4">
              <span className="text-[#ffa657]">&lt;head&gt;</span>
            </div>

            <div className="pl-4">
              <span className="text-[#ffa657]">&lt;meta</span>{" "}
              <span className="text-[#79c0ff]">charset</span>
              <span className="text-[#ffa657]">=</span>
              <span className="text-[#a5d6ff]">"utf-8"</span>
              <span className="text-[#ffa657]">&gt;</span>
            </div>

            <div className="pl-4">
              <span className="suggestion-text ghost-text">
                &lt;script&gt;const plan = "Pro";&lt;/script&gt;
              </span>
              <span className="cursor ml-1 inline-block" />
            </div>

            <div className="pl-4">
              <span className="text-[#ffa657]">&lt;title&gt;</span>
              <span className="text-[#a5d6ff]">AI Pricing Card</span>
              <span className="text-[#ffa657]">&lt;/title&gt;</span>
            </div>
            <div className="pl-4">
              <span className="text-[#ffa657]">&lt;/head&gt;</span>
            </div>
            <div className="pl-8">
              <span className="text-[#ffa657]">&lt;body&gt;</span>
            </div>
            <div className="pl-12">
              <span className="text-[#ffa657]">&lt;main</span>{" "}
              <span className="text-[#79c0ff]">class</span>
              <span className="text-[#ffa657]">=</span>
              <span className="text-[#a5d6ff]">"card"</span>
              <span className="text-[#ffa657]">&gt;</span>
            </div>
            <div className="pl-16">
              <span className="text-[#ffa657]">&lt;h1&gt;</span>
              <span className="text-[#a5d6ff]">Pro Plan</span>
              <span className="text-[#ffa657]">&lt;/h1&gt;</span>
            </div>
            <div className="pl-16">
              <span className="text-[#ffa657]">&lt;p&gt;</span>
              <span className="text-[#a5d6ff]">
                Unlimited projects &amp; priority support
              </span>
              <span className="text-[#ffa657]">&lt;/p&gt;</span>
            </div>
            <div className="pl-12">
              <span className="text-[#ffa657]">&lt;/main&gt;</span>
            </div>
            <div className="pl-8">
              <span className="text-[#ffa657]">&lt;/body&gt;</span>
            </div>

            <div className="pl-4">
              <span className="text-[#ffa657]">&lt;/html&gt;</span>
            </div>
          </div>

          <div className="tab-hint absolute right-4 bottom-4 z-10 flex items-center gap-2 text-[10px] text-[#9da7b3]">
            <span className="ping-dot" aria-hidden />
            <span>Tab to accept</span>
            <button
              type="button"
              onClick={handleTabClick}
              className="tab-key rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[#c9d1d9] hover:bg-white/20"
              aria-label="Press Tab to accept"
            >
              Tab
            </button>
          </div>
        </motion.div>
      </div>

      <BentoTextSection
        className="px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8"
        title="Write code at the speed of thought"
        description="Inline AI suggestions appear as you type. Accept full lines, functions, or patterns instantly no breaking your flow."
      />
      <BentoGlowSvg1 className="absolute bottom-0 -z-10 w-full h-auto" />
      <style jsx>{`
        .editor {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
        }
        .cursor {
          width: 6px;
          height: 14px;
          background: #c9d1d9;
        }
        .ghost-text {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
        }
        .ping-dot {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #7dd3fc;
          box-shadow: 0 0 8px rgba(125, 211, 252, 0.6);
        }
        .ping-dot::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 9999px;
          border: 1px solid rgba(125, 211, 252, 0.6);
          animation: ping 1.6s ease-out infinite;
        }
        @keyframes ping {
          0% {
            transform: scale(0.5);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BentoCodeSpeed;
