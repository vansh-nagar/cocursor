"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import OrangeButton, { WhiteButton } from "../button/orange-button";
import BentoTextSection from "../bento-text-section";

const ChatAnimation = () => {
  const [key, setKey] = useState(0);

  const userMessage =
    "Create a responsive pricing card component with 3 plans.";
  const aiMessage =
    "I've started building the responsive pricing card component. Setting up the layout structure, defining the three plan tiers, and implementing base styling with proper spacing and typography.";

  useEffect(() => {
    const interval = setInterval(() => {
      setKey((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div key={key} className="">
      <motion.div
        className="flex gap-2 sm:gap-3 z-10 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <img
          className="h-8 w-8 sm:h-10 sm:w-10 shrink-0"
          src="/image/pfp.png"
          alt=""
        />
        <div className="flex gap-2 flex-col flex-1 min-w-0">
          <motion.div
            className="flex justify-between items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex gap-2 sm:gap-3 items-center min-w-0">
              <span className="text-sm sm:text-base truncate">Vansh Nagar</span>
            </div>
            <span className="text-xs shrink-0">4:33</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
          >
            <WhiteButton 
              className="text-left px-2 py-2 bg-white text-xs sm:text-xs"
            >
              {userMessage}
            </WhiteButton>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
      >
        <img
          className="w-8 h-8 sm:w-10 sm:h-10 shrink-0"
          src="/image/cursor.png"
          alt=""
        />
        <div className="flex gap-2 flex-col flex-1 min-w-0">
          <motion.div
            className="flex justify-between items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.0 }}
          >
            <div className="flex gap-2 sm:gap-3 items-center min-w-0">
              <span className="text-sm sm:text-base truncate">Cocursor</span>
            </div>
            <span className="text-xs shrink-0">4:35</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.2, ease: "easeOut" }}
          >
            <OrangeButton 
              className="text-left px-2 py-2 text-xs sm:text-xs"
            >
              {aiMessage}
            </OrangeButton>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const BentoChat = () => {
  return (
    <div
      className="rounded-3xl border relative overflow-hidden p-4 sm:p-6 md:p-8 flex flex-col justify-between"
    >
      <ChatAnimation />

      <BentoTextSection
        title="Talk Through Problems, Ship Solutions"
        description="Ask questions, debug issues, and build faster all from a simple conversation."
      />
    </div>
  );
};

export default BentoChat;
