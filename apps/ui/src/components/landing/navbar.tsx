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
import { X } from "lucide-react";

// --- Scramble Text Hook ---
const useScrambleText = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const scramble = useCallback(
    (element: HTMLElement, duration = 0.4) => {
      const originalText = element.textContent || "";
      const letters = originalText.split("");
      let completed = 0;

      letters.forEach((_, i) => {
        const timeout = setTimeout(() => {
          let iterations = 0;
          const maxIter = Math.floor(Math.random() * 5) + 3;

          const interval = setInterval(() => {
            const current = letters.map((ch, j) => {
              if (j < completed) return originalText[j];
              if (j === i)
                return chars[Math.floor(Math.random() * chars.length)];
              return ch;
            });
            element.textContent = current.join("");
            iterations++;
            if (iterations >= maxIter) {
              clearInterval(interval);
              completed = Math.max(completed, i + 1);
              letters[i] = originalText[i];
              element.textContent = letters
                .map((ch, j) => (j <= i ? originalText[j] : ch))
                .join("");
            }
          }, 25);
          intervalsRef.current.push(interval);
        }, i * 30);
        intervalsRef.current.push(timeout);
      });

      setTimeout(() => {
        element.textContent = originalText;
      }, duration * 1000 + letters.length * 30 + 200);
    },
    [chars]
  );

  return { scramble };
};

// --- Scramble Span ---
const ScrambleSpan = ({
  children,
  isOpen,
  delay = 0,
}: {
  children: string;
  isOpen: boolean;
  delay?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const { scramble } = useScrambleText();

  useEffect(() => {
    if (isOpen && ref.current) {
      const timeout = setTimeout(() => scramble(ref.current!, 0.5), delay);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, delay, scramble]);

  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  );
};

// --- Animation Variants ---
const cardVariants: Variants = {
  closed: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const linkVariants: Variants = {
  closed: { y: 20, opacity: 0 },
  open: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
      delay: 0.1 + i * 0.06,
    },
  }),
};

const footerItemVariants: Variants = {
  closed: { opacity: 0 },
  open: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.3, delay: 0.35 + i * 0.05 },
  }),
};

// --- Links Data ---
const mainLinks = [
  { href: "/", label: "Index" },
  { href: "/wardrobe", label: "Wardrobe" },
  { href: "/genesis", label: "Genesis" },
];

const subLinksCol1 = [
  { href: "/lookbook", label: "Lookbook" },
  { href: "/touchpoint", label: "Touchpoint" },
  { href: "/unit", label: "Shell (A)" },
];

const subLinksCol2 = [
  { href: "/product", label: "01. Unbody" },
  { href: "/product", label: "02. Persona Null" },
  { href: "/product", label: "03. Second Host" },
  { href: "/product", label: "04. Shellcode" },
];

const accessLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/features", label: "Features" },
];

const socialLinks = [
  { href: "https://x.com/vansh1029", label: "Twitter / X" },
  { href: "https://github.com/vansh-nagar", label: "GitHub" },
];

// --- Component ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150 && !isOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const toggleMenu = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsOpen((prev) => !prev);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const handleLinkClick = useCallback(() => {
    if (isOpen) {
      setTimeout(() => setIsOpen(false), 200);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden && !isOpen ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed w-screen top-0 left-0 right-0 z-50"
    >
      {/* --- Header Bar --- */}
      <motion.div 
        animate={{
          backgroundColor: isScrolled ? "rgba(10, 10, 10, 0.8)" : "rgba(10, 10, 10, 0)",
          borderColor: isScrolled ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0)",
          backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3 }}
        className="relative z-60 flex justify-between bg-[#111111] rounded-3xl border-white/10 items-center mx-4 sm:mx-8 md:mx-12 my-4 py-4 px-6 sm:px-8"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 ">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10"
            viewBox="0 0 87 91"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M47.1643 21.4431L1.51616 34.7167C0.385676 35.0454 0.305338 36.6102 1.39625 37.0521L21.7132 45.2821C22.083 45.4319 22.358 45.7495 22.4525 46.1357L28.1896 69.5876C28.4777 70.7653 30.1174 70.8716 30.5564 69.741L48.6718 23.0781C49.0431 22.1215 48.1526 21.1557 47.1643 21.4431Z"
              fill="white"
              stroke="white"
              strokeWidth="1.14286"
            />
            <path
              d="M39.811 69.2416L85.4341 55.8831C86.564 55.5523 86.6415 53.9874 85.5497 53.5476L65.2175 45.3554C64.8473 45.2063 64.5717 44.8891 64.4765 44.5029L58.6954 21.0619C58.4051 19.8847 56.7653 19.7815 56.3284 20.9129L38.3004 67.6093C37.9309 68.5666 38.8231 69.5308 39.811 69.2416Z"
              fill="white"
              stroke="white"
              strokeWidth="1.14286"
            />
          </svg>
          <span className="text-white font-semibold text-lg tracking-tight hidden sm:block">
            Cocursor
          </span>
        </Link>

        {/* Hamburger / Close */}
        <button
          className="relative w-8 h-8 flex flex-col justify-center items-center gap-[6px] focus:outline-none cursor-pointer"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <motion.span
            animate={isOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
            className="block w-6 h-[2px] bg-white origin-center"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
            className="block w-6 h-[2px] bg-white origin-center"
          />
        </button>
      </motion.div>

      {/* --- Floating Menu Card --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Card */}
            <motion.div
              variants={cardVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{ transformOrigin: "top right" }}
              className="absolute top-20 sm:top-24 right-4 md:right-12 z-60 w-[calc(100vw-2rem)] sm:w-[380px] bg-[#111111]  border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[90vh]"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3 bg-[#111111] z-10">
                <div className="flex items-center gap-2">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 0.15 }}
                    className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-mono"
                  >
                    <ScrambleSpan isOpen={isOpen} delay={150}>
                      Navigation
                    </ScrambleSpan>
                  </motion.p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-8">
                {/* Section 1: Root */}
                <div className="space-y-3">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-mono">01. Root</p>
                  <div className="space-y-1">
                    {mainLinks.map((link: { href: string; label: string }, i: number) => (
                      <div key={link.label} className="overflow-hidden">
                        <motion.div custom={i} variants={linkVariants} initial="closed" animate="open" exit="closed">
                          <Link href={link.href} onClick={handleLinkClick} className="block text-3xl font-bold text-white hover:text-orange-500 transition-colors duration-200 tracking-tight">
                            {link.label}
                          </Link>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Section 2: Subroutine */}
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-mono">02. Subroutine</p>
                    <div className="space-y-1">
                      {subLinksCol1.map((link: { href: string; label: string }, i: number) => (
                        <motion.div key={link.label} custom={i + 3} variants={linkVariants} initial="closed" animate="open" exit="closed">
                          <Link href={link.href} onClick={handleLinkClick} className="block text-sm text-white/50 hover:text-white transition-colors duration-200">
                            {link.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Field Tests */}
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-mono">03. Field Tests</p>
                    <div className="space-y-1">
                      {subLinksCol2.map((link: { href: string; label: string }, i: number) => (
                        <motion.div key={link.label} custom={i + 6} variants={linkVariants} initial="closed" animate="open" exit="closed">
                          <Link href={link.href} onClick={handleLinkClick} className="block text-sm text-white/30 hover:text-white transition-colors duration-200 font-mono">
                            {link.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 4: Access */}
                <div className="space-y-3">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-mono">04. Access</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4">
                    <div className="space-y-1">
                      {accessLinks.map((link: { href: string; label: string }, i: number) => (
                        <motion.div key={link.label} custom={i + 10} variants={linkVariants} initial="closed" animate="open" exit="closed">
                          <Link href={link.href} onClick={handleLinkClick} className="block text-sm text-white/50 hover:text-white transition-colors duration-200">
                            {link.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <motion.div custom={12} variants={linkVariants} initial="closed" animate="open" exit="closed">
                        <SignedOut>
                          <Link href="/sign-in" onClick={handleLinkClick} className="block text-orange-500 hover:text-orange-400 transition-colors duration-200 text-sm font-medium underline underline-offset-4 decoration-orange-500/30">
                            Login →
                          </Link>
                        </SignedOut>
                        <SignedIn>
                          <Link href="/room" onClick={handleLinkClick} className="block text-orange-500 hover:text-orange-400 transition-colors duration-200 text-sm font-medium">
                            Dashboard →
                          </Link>
                        </SignedIn>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/5 bg-[#0e0e0e] flex justify-between items-end">
                <div>
                  <div className="flex gap-4">
                    {socialLinks.map((link: { href: string; label: string }, i: number) => (
                      <motion.a
                        key={link.label}
                        custom={i}
                        variants={footerItemVariants}
                        initial="closed"
                        animate="open"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-white/40 hover:text-white transition-colors font-mono uppercase tracking-wider"
                      >
                        {link.label}
                      </motion.a>
                    ))}
                  </div>
                </div>
                <SignedIn>
                  <SignOutButton>
                    <button className="text-[10px] text-white/20 hover:text-red-500 transition-colors font-mono uppercase cursor-pointer">
                      Sign Out
                    </button>
                  </SignOutButton>
                </SignedIn>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
