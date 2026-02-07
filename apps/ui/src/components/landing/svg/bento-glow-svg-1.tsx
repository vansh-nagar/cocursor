import React from "react";

const BentoGlowSvg1 = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 440 875"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax slice"
    >
      <g filter="url(#filter0_f_5_68)">
        <path
          d="M219.011 766.467C-63.2577 733.252 -0.102409 147.501 15 -10.5L-123 948H553.185L648 413.5C550.338 643.5 501.28 799.681 219.011 766.467Z"
          fill="#E75900"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_5_68"
          x="-223"
          y="-110.5"
          width="971"
          height="1158.5"
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
          <feGaussianBlur
            stdDeviation="50"
            result="effect1_foregroundBlur_5_68"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default BentoGlowSvg1;
