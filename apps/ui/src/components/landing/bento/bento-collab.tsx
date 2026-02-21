"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import BentoTextSection from "../bento-text-section";
import BentoGlowSvg2 from "../svg/bento-glow-svg-2";

const useWander = (delayMs: number) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;
    let timeout: number | undefined;
    let interval: number | undefined;

    const update = () => {
      setPos({
        x: (Math.random() * 1.2 - 0.6) * 36,
        y: (Math.random() * 1.2 - 0.6) * 28,
      });
    };

    timeout = window.setTimeout(() => {
      update();
      interval = window.setInterval(update, 2600);
    }, delayMs);

    return () => {
      if (timeout) window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [delayMs]);

  return pos;
};

const BentoFollowerA = () => {
  const pos = useWander(200);
  return (
    <motion.div
      className="relative"
      animate={{ x: pos.x, y: pos.y }}
      transition={{ duration: 2.6, ease: "easeInOut" }}
    >
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 60 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M57.2089 0.0348175L1.18179 11.988C-0.20575 12.284 -0.436468 14.1498 0.837432 14.7725L24.5623 26.3716C24.9942 26.5827 25.2978 26.9866 25.3783 27.4571L30.2674 56.0169C30.5129 57.4512 32.4754 57.7196 33.1001 56.4044L58.8815 2.12147C59.4099 1.00864 58.422 -0.223973 57.2089 0.0348175Z"
          fill="white"
          stroke="black"
          strokeWidth="1"
          strokeOpacity="1"
        />
      </svg>
      <span
        className="absolute top-6 -left-6 px-2 py-0.5 text-[10px] rounded-full"
        style={{
          background:
            "linear-gradient(360deg, #FF8A33 0%, #FF4A4A 51.8%), #FF4A4A",
          boxShadow:
            "inset 1px -1px 5px rgba(255, 255, 255, 0.4), inset -1px -1px 5px rgba(255, 255, 255, 0.4)",
        }}
      >
        saara
      </span>
    </motion.div>
  );
};

const BentoFollowerB = () => {
  const pos = useWander(900);
  return (
    <motion.div
      className="relative"
      animate={{ x: pos.x, y: pos.y }}
      transition={{ duration: 2.6, ease: "easeInOut" }}
    >
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 60 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.0672983 1.93903L16.6854 56.7638C17.0969 58.1215 18.9754 58.1947 19.4889 56.873L29.0538 32.2574C29.2278 31.8094 29.6048 31.473 30.0669 31.3532L58.115 24.0819C59.5235 23.7167 59.6261 21.7387 58.2631 21.2266L2.00605 0.0970361C0.85276 -0.336033 -0.292496 0.751979 0.0672983 1.93903Z"
          fill="white"
          stroke="black"
          strokeWidth="1"
          strokeOpacity="1"
        />
      </svg>
      <span
        className="absolute top-6 -right-6 px-2 py-0.5 text-[10px] rounded-full"
        style={{
          background: "linear-gradient(360deg, #000DFF 0%, #8800FF 51.8%)",
          boxShadow:
            "inset 1px -1px 5px rgba(255, 255, 255, 0.4), inset -1px -1px 5px rgba(255, 255, 255, 0.4)",
        }}
      >
        vansh
      </span>
    </motion.div>
  );
};

import CodedCollab from "./coded-collab";

const BentoCollab = () => {
  return (
    <div className="border flex flex-col justify-between rounded-3xl relative p-4 sm:p-6 md:p-8 overflow-hidden min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-0">
      <div className="w-full mt-2 mb-6">
        <CodedCollab />
      </div>

      <BentoTextSection
        className=""
        title="Code Together, In Real Time"
        description="See live cursors, edits, and changes from your team instantly — like multiplayer for coding."
      />
    </div>
  );
};

export default BentoCollab;
