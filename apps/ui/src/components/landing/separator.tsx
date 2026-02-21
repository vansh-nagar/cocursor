"use client";

import React from "react";
import { motion } from "motion/react";

const SectionSeparator = () => {
  return (
    <div className="relative w-full flex justify-center items-center py-20 overflow-hidden">
      {/* The main line with gradient fade */}
      <div className="absolute w-full h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent opacity-50" />
      
      {/* The shorter glowing accent line */}
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: "40%", opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true }}
        className="absolute h-px bg-linear-to-r from-transparent via-orange-500/50 to-transparent"
      />

      {/* Center blur glow */}
      <div className="absolute w-24 h-24 bg-orange-600/10 blur-3xl rounded-full" />
      
      {/* Center dot/icon */}
      <div className="relative z-10 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(250,96,0,0.8)]" />
    </div>
  );
};

export default SectionSeparator;
