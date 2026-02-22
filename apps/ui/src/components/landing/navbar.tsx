"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
  type Variants,
} from "motion/react";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

// --- Animation Variants ---
const cardVariants: Variants = {
  closed: { opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.15 } },
  open: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

const linkVariants: Variants = {
  closed: { y: 4, opacity: 0 },
  open: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.2, delay: i * 0.02 },
  }),
};

// --- Links Data ---
const mainLinks = [
  { href: "#hero", label: "Overview" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

const subLinks = [
  { href: "/docs", label: "Documentation" },
  { href: "/changelog", label: "Changelog" },
  { href: "/blog", label: "Blog" },
  { href: "#faq", label: "FAQs" },
];

const socialLinks = [
  { href: "https://x.com/cocursor", label: "Twitter" },
  { href: "https://github.com/cocursor", label: "GitHub" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 150 && !isOpen);
  });

  const handleLinkClick = () => setIsOpen(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <motion.nav
        animate={hidden ? "hidden" : "visible"}
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        className="fixed w-full top-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-4 sm:pt-6">
          {/* Header Bar */}
          <motion.div 
            animate={{
              backgroundColor: isScrolled || isOpen ? "rgba(10, 10, 10, 0.95)" : "rgba(10, 10, 10, 0)",
              borderColor: isScrolled || isOpen ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0)",
              backdropFilter: isScrolled || isOpen ? "blur(32px)" : "blur(0px)",
            }}
            className="pointer-events-auto flex justify-between items-center transition-all border rounded-3xl py-4 px-6 shadow-2xl"
          >
            <Link href="/" className="flex items-center gap-2 group">
              <svg className="w-9 h-9 sm:w-10 sm:h-10 transition-transform scale-130" viewBox="0 0 87 91" fill="white">
                <path d="M47.1643 21.4431L1.51616 34.7167C0.385676 35.0454 0.305338 36.6102 1.39625 37.0521L21.7132 45.2821C22.083 45.4319 22.358 45.7495 22.4525 46.1357L28.1896 69.5876C28.4777 70.7653 30.1174 70.8716 30.5564 69.741L48.6718 23.0781C49.0431 22.1215 48.1526 21.1557 47.1643 21.4431Z" />
                <path d="M39.811 69.2416L85.4341 55.8831C86.564 55.5523 86.6415 53.9874 85.5497 53.5476L65.2175 45.3554C64.8473 45.2063 64.5717 44.8891 64.4765 44.5029L58.6954 21.0619C58.4051 19.8847 56.7653 19.7815 56.3284 20.9129L38.3004 67.6093C37.9309 68.5666 38.8231 69.5308 39.811 69.2416Z" />
              </svg>
            </Link>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6">
                {mainLinks.map(link => (
                  <Link key={link.label} href={link.href} className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors font-medium">
                    {link.label}
                  </Link>
                ))}
              </div>
              
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col gap-1.5 focus:outline-none cursor-pointer p-2 transition-transform active:scale-95"
              >
                <motion.span animate={isOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }} className="w-5 h-[1.5px] bg-white block rounded-full" />
                <motion.span animate={isOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }} className="w-5 h-[1.5px] bg-white block rounded-full" />
              </button>
            </div>
          </motion.div>

          {/* Floating Menu Card */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                variants={cardVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="pointer-events-auto mt-2 bg-[#0a0a0a]/98 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-8 sm:p-14">
                  <div className="space-y-12">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-8 font-mono font-bold">
                        Navigation
                      </p>
                      <div className="space-y-4">
                        {mainLinks.map((link, i) => (
                          <motion.div key={link.label} custom={i} variants={linkVariants} initial="closed" animate="open">
                            <Link href={link.href} onClick={handleLinkClick} className="text-5xl sm:text-7xl font-serif font-medium text-white hover:text-orange-500 transition-colors tracking-tight block">
                              {link.label}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-12 border-t border-white/5">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/10 mb-5 font-bold">Resources</p>
                        <div className="space-y-2.5">
                          {subLinks.map((link, i) => (
                            <motion.div key={link.label} custom={i + 3} variants={linkVariants} initial="closed" animate="open">
                              <Link href={link.href} onClick={handleLinkClick} className="text-sm text-white/30 hover:text-white transition-colors">
                                {link.label}
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/10 mb-5 font-bold">Social</p>
                        <div className="space-y-2.5">
                          {socialLinks.map((link, i) => (
                            <motion.div key={link.label} custom={i + 6} variants={linkVariants} initial="closed" animate="open">
                              <a href={link.href} target="_blank" rel="noreferrer" className="text-sm text-white/30 hover:text-white transition-colors">
                                {link.label}
                              </a>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end items-start md:items-end space-y-8">
                    <SignedIn>
                      <div className="text-left md:text-right">
                         <p className="text-[10px] text-white/10 mb-3 font-mono tracking-widest">SESSION_ACTIVE</p>
                         <Link href="/room" onClick={handleLinkClick} className="text-4xl font-serif font-medium text-orange-500 hover:text-orange-400 tracking-tight block">
                           Launch Workspace →
                         </Link>
                      </div>
                      <SignOutButton>
                        <button className="text-[10px] text-white/20 hover:text-red-500 font-mono uppercase cursor-pointer tracking-[0.2em] border border-white/5 px-4 py-2 rounded-full hover:border-red-500/20 transition-all">
                          Terminate Session
                        </button>
                      </SignOutButton>
                    </SignedIn>
                    <SignedOut>
                      <div className="text-left md:text-right">
                         <p className="text-[10px] text-white/10 mb-3 font-mono tracking-widest">STATUS: GUEST</p>
                         <Link href="/sign-in" onClick={handleLinkClick} className="text-4xl font-serif font-medium text-orange-500 hover:text-orange-400 tracking-tight block">
                           Join Cocursor →
                         </Link>
                      </div>
                    </SignedOut>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;
