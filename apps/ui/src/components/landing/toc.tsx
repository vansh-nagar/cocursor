"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "motion/react";

const sections = [
  { id: "hero", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "workspace", label: "Workspace" },
  { id: "collab", label: "Collaboration" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQs" },
];

const TOC = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const currentSection = sectionElements.reduce((acc, el, idx) => {
        if (!el) return acc;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 400) {
          return sections[idx].id;
        }
        return acc;
      }, sections[0].id);

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="fixed right-10 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col items-center">
      {/* Scrollable Container */}
      <div className="relative flex flex-col items-center">
        {/* Dot and Line flex group */}
        <div className="flex flex-col gap-10 relative">
          {/* Background Track Line - Bound exactly between first and last dot centers */}
          <div className="absolute top-[4px] bottom-[4px] left-1/2 -translate-x-1/2 w-px bg-white/10 z-0" />
          
          {/* Animated Progress Line */}
          <motion.div 
            className="absolute top-[4px] bottom-[4px] left-1/2 -translate-x-1/2 w-px bg-orange-500 shadow-[0_0_8px_rgba(250,96,0,0.4)] origin-top z-0"
            style={{ scaleY }}
          />

          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <div key={section.id} className="relative flex items-center justify-center">
                <button
                  onClick={() => scrollToSection(section.id)}
                  className="group relative flex items-center justify-center w-2 h-2 cursor-pointer outline-none z-10"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.6 : 1,
                      backgroundColor: isActive ? "#FA6000" : "#262626",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-full h-full rounded-full ring-[6px] ring-black/50 sm:ring-black group-hover:bg-white/40 transition-colors"
                  />

                  {/* Label on Hover */}
                  <div className="absolute right-8 px-2 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 whitespace-nowrap font-mono">
                      {section.label}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current Section Text */}
      <div className="mt-10 overflow-hidden h-24 flex items-start justify-center">
        <AnimatePresence mode="wait">
          <motion.p 
            key={activeSection}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 0.3 }}
            exit={{ y: -10, opacity: 0 }}
            className="text-[9px] uppercase tracking-[0.4em] font-mono text-white vertical-text"
            style={{ writingMode: 'vertical-rl' }}
          >
            {sections.find(s => s.id === activeSection)?.label}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TOC;
