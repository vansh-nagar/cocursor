import React from "react";

const BentoGlowSvg2 = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 440 875"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMin slice"
    >
      <g filter="url(#filter0_f_9_77)">
        <path
          d="M467 2C189.8 190 63.5121 327 38 499C2.2563 739.981 50.4 934.9 262 708.5C473.6 482.1 401.833 443.5 339.5 452.5"
          stroke="#E75900"
          strokeWidth="150"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_9_77"
          x="-147.75"
          y="-160.071"
          width="756.847"
          height="1143.84"
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
            result="effect1_foregroundBlur_9_77"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default BentoGlowSvg2;
