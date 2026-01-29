"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

interface PreviewFrameProps {
  url: string;
  device: "desktop" | "tablet" | "mobile";
}

const deviceConfigs = {
  desktop: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  tablet: {
    width: 768,
    height: 1024,
    borderRadius: 8,
  },
  mobile: {
    width: 375,
    height: 812,
    borderRadius: 8,
  },
};

const PreviewFrame: React.FC<PreviewFrameProps> = ({ url, device }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const config = deviceConfigs[device];

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      
      if (device === "desktop") {
        setScale(1);
        return;
      }

      const padding = 40;
      const containerWidth = containerRef.current.clientWidth - padding;
      const containerHeight = containerRef.current.clientHeight - padding;
      
      const targetWidth = typeof config.width === "number" ? config.width : containerWidth;
      const targetHeight = typeof config.height === "number" ? config.height : containerHeight;

      const scaleW = containerWidth / targetWidth;
      const scaleH = containerHeight / targetHeight;
      const newScale = Math.min(scaleW, scaleH, 1);

      setScale(newScale);
    };

    calculateScale();
    
    const observer = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [device, config]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-background overflow-hidden relative"
    >
      <motion.div
        layout
        initial={false}
        animate={{
          width: config.width,
          height: config.height,
          borderRadius: config.borderRadius,
          scale: scale,
        }}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => setIsAnimating(false)}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        style={{
          transformOrigin: "center center",
          willChange: "transform, width, height",
        }}
        className="relative overflow-hidden"
      >
        <iframe
          src={url}
          className="w-full h-full border-0 bg-white"
          title="Preview"
          style={{ 
            pointerEvents: isAnimating ? 'none' : 'auto'
          }}
        />
      </motion.div>
    </div>
  );
};

export default PreviewFrame;
