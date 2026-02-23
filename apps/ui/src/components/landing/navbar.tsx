"use client";

import React, { useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  type Variants,
} from "motion/react";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "../ui/button";

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
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full top-0 left-0 right-0 z-50 px-2 sm:px-6 md:px-8 lg:px-12 pt-4 sm:pt-6"
    >
      <div 
        className={`max-w-screen-2xl mx-auto flex justify-between items-center py-3 px-4 sm:py-4 sm:px-6 rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
          isScrolled 
            ? "bg-black/80 border-white/10 backdrop-blur-xl shadow-2xl" 
            : "bg-transparent border-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 87 91" fill="white">
            <path d="M47.1643 21.4431L1.51616 34.7167C0.385676 35.0454 0.305338 36.6102 1.39625 37.0521L21.7132 45.2821C22.083 45.4319 22.358 45.7495 22.4525 46.1357L28.1896 69.5876C28.4777 70.7653 30.1174 70.8716 30.5564 69.741L48.6718 23.0781C49.0431 22.1215 48.1526 21.1557 47.1643 21.4431Z" />
            <path d="M39.811 69.2416L85.4341 55.8831C86.564 55.5523 86.6415 53.9874 85.5497 53.5476L65.2175 45.3554C64.8473 45.2063 64.5717 44.8891 64.4765 44.5029L58.6954 21.0619C58.4051 19.8847 56.7653 19.7815 56.3284 20.9129L38.3004 67.6093C37.9309 68.5666 38.8231 69.5308 39.811 69.2416Z" />
          </svg>
          <span className="text-white text-xl hidden sm:block">Cocursor</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {mainLinks.map(link => (
            <a key={link.label} href={link.href} className="text-sm text-zinc-400 hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in" className="text-sm text-zinc-400 hover:text-white transition-colors mr-2">
              Login
            </Link>
            <Link href="/sign-up" className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-medium px-4 py-2 transition-all rounded-none">
              Join Now
            </Link>
          </SignedOut>
          <SignedIn>
           
            <SignOutButton>
              <Button className="text-xs bg-orange-600 hover:bg-orange-700 text-white ml-2 transition-colors cursor-pointer border border-white/5 px-4 py-2">
                Logout
              </Button>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
