"use client";

import React from "react";
import { motion } from "motion/react";

const SectionSeparator = () => {
  return (
    <div className="relative w-full flex justify-center items-center py-12 sm:py-24 overflow-hidden pointer-events-none">
      {/* Background full-width line */}
      <div className="absolute w-full h-px bg-linear-to-r from-transparent via-white/[0.05] to-transparent" />
      
      {/* Animated center wipe */}
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: "40%", opacity: 1 }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="absolute h-px bg-linear-to-r from-transparent via-white/[0.15] to-transparent"
      />

      {/* Center technical mark */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="w-1 h-1 rotate-45 border border-white/20 bg-black" />
   </div>
    </div>
  );
};

export default SectionSeparator;
