"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

const createRng = (seed: number) => {
  let t = seed;

  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const Follower2 = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const seedKey = "cocursor-follower2-seed";
    let seed = Math.floor(Math.random() * 1e9);

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(seedKey);
      if (stored) {
        const parsed = Number(stored);
        seed = Number.isFinite(parsed) ? parsed : seed;
      } else {
        window.localStorage.setItem(seedKey, seed.toString());
      }
    }

    const rng = createRng(seed);

    const updatePosition = () => {
      setPosition({
        x: rng() * 120 - 60,
        y: rng() * 120 - 60,
      });
    };

    setTimeout(updatePosition, 1000);

    const interval = setInterval(updatePosition, 3000 + rng() * 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="relative"
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        stiffness: 70,
        damping: 20,
        mass: 1,
      }}
    >
      <svg
        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-12"
        viewBox="0 0 60 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_i_3_39)">
          <path
            d="M0.0672983 1.93903L16.6854 56.7638C17.0969 58.1215 18.9754 58.1947 19.4889 56.873L29.0538 32.2574C29.2278 31.8094 29.6048 31.473 30.0669 31.3532L58.115 24.0819C59.5235 23.7167 59.6261 21.7387 58.2631 21.2266L2.00605 0.0970361C0.85276 -0.336033 -0.292496 0.751979 0.0672983 1.93903Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_i_3_39"
            x="0"
            y="0"
            width="59.2305"
            height="59.8243"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="shape"
              result="effect1_innerShadow_3_39"
            />
          </filter>
        </defs>
      </svg>

      <button
        type="button"
        className="border absolute top-8 -right-10 flex justify-center items-center px-2 py-1 rounded-full text-xs"
        aria-label="Follower action"
      >
        saara
      </button>
    </motion.div>
  );
};

export default Follower2;
