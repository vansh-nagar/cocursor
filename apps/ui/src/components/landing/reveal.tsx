"use client";

import React from "react";
import { motion } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
}

const Reveal = ({ children, width = "100%" }: RevealProps) => {
  return (
    <div style={{ position: "relative", width, overflow: "visible" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        viewport={{ once: true }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Reveal;
