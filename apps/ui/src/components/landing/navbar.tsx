"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import OrangeButton from "./button/orange-button";
import { SignedIn, SignedOut, SignOutButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed w-[100vw] top-0 left-0 right-0 z-50 "
    >
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-12 py-2 bg-background/10 backdrop-blur-lg">
        <Link href="/" className="flex items-center">
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12"
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
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm mix-blend-difference">
          <Link href="/docs" className="hover:text-primary transition-colors">
            Docs
          </Link>
          <Link
            href="/features"
            className="hover:text-primary transition-colors"
          >
            Features
          </Link>
          <SignedOut>
            <Link href="/sign-in">
              <OrangeButton className="py-1.5 px-4 cursor-pointer">
                Login
              </OrangeButton>
            </Link>
          </SignedOut>

          <SignedIn>
            <SignOutButton>
              <OrangeButton className="py-1.5 px-4 cursor-pointer">
                Logout
              </OrangeButton>
            </SignOutButton>
          </SignedIn>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 justify-center items-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-1" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMenuOpen ? "-rotate-45 -translate-y-1" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "max-h-64 opacity-100 bg-background/10 backdrop-blur-lg"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4">
          <Link
            href="/docs"
            className="block py-2 hover:text-primary transition-colors text-base"
            onClick={() => setIsMenuOpen(false)}
          >
            Docs
          </Link>
          <Link
            href="/features"
            className="block py-2 hover:text-primary transition-colors text-base"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/sign-in"
            className="block py-2 hover:text-primary transition-colors text-base"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
