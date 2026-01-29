import React from "react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="40"
        height="42"
        viewBox="0 0 70 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M37.9483 1.56942L1.21991 12.2904C0.310324 12.5559 0.245684 13.8198 1.12343 14.1767L17.4704 20.824C17.7679 20.945 17.9892 21.2015 18.0652 21.5135L22.6813 40.4554C22.9131 41.4066 24.2324 41.4925 24.5856 40.5793L39.1612 2.89005C39.46 2.11738 38.7435 1.33728 37.9483 1.56942Z"
          stroke="white"
          strokeWidth={2}
        />
        <path
          d="M32.0318 40.1759L68.7401 29.3864C69.6492 29.1192 69.7115 27.8552 68.8331 27.5L52.4738 20.8832C52.176 20.7628 51.9542 20.5066 51.8776 20.1947L47.2262 1.26155C46.9926 0.310744 45.6732 0.227345 45.3217 1.14117L30.8164 38.8575C30.5191 39.6307 31.237 40.4095 32.0318 40.1759Z"
          stroke="white"
          strokeWidth={2}
        />
      </svg>
      <span className="font-semibold text-xl">COCURSOR</span>
    </div>
  );
};

export default Logo;
