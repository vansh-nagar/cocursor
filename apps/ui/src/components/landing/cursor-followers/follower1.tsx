"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'

const createRng = (seed: number) => {
  let t = seed;

  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const Follower1 = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const seedKey = 'cocursor-follower1-seed';
    let seed = Math.floor(Math.random() * 1e9);

    if (typeof window !== 'undefined') {
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

    updatePosition();

    const interval = setInterval(updatePosition, 3000 + rng() * 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className='relative'
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
      <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-12" viewBox="0 0 60 58" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_3_42)">
<path d="M57.2089 0.0348175L1.18179 11.988C-0.20575 12.284 -0.436468 14.1498 0.837432 14.7725L24.5623 26.3716C24.9942 26.5827 25.2978 26.9866 25.3783 27.4571L30.2674 56.0169C30.5129 57.4512 32.4754 57.7196 33.1001 56.4044L58.8815 2.12147C59.4099 1.00864 58.422 -0.223973 57.2089 0.0348175Z" fill="white"/>
</g>
<defs>
<filter id="filter0_i_3_42" x="0" y="0" width="59.0273" height="59.2563" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_3_42"/>
</filter>
</defs>
</svg>
      <button
      className='border absolute top-8 -left-10 flex justify-center items-center px-2 py-1 rounded-full text-xs'
        type="button"
        aria-label="Follower action"
       
      >vansh</button>
    </motion.div>
  )
}

export default Follower1