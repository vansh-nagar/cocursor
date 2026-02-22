"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(MotionPathPlugin);

export const BentoSvg = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useGSAP(
    () => {
      gsap.set([".follower", ".follower2", ".follower3", ".follower4"], {
        transformOrigin: "50% 50%",
      });
      gsap.set([".follower3", ".follower4"], { opacity: 0 });
      gsap.set(".ai-logo", { filter: "none" });
      gsap.set(".ai-logo path", { stroke: "#000000" });
      gsap.set(".ai-circle", { transformOrigin: "50% 50%" });

      gsap.to(".follower", {
        motionPath: {
          path: ".path",
          align: ".path",
          alignOrigin: [0.5, 0.5],
          autoRotate: false,
        },
        duration: 6,
        repeat: -1,
        ease: "none",
      });

      const splitDelay = 2;

      gsap
        .timeline({ repeat: -1 })
        .to(".follower2", {
          motionPath: {
            path: ".path2-main",
            align: ".path2-main",
            alignOrigin: [0.5, 0.5],
            autoRotate: false,
          },
          duration: splitDelay,
          ease: "none",
        })
        .addLabel("pulse", splitDelay - 0.25 + 0.2)
        .to(
          ".ai-logo",
          {
            filter:
              "drop-shadow(0 0 8px rgba(231, 89, 0, 0.4)) drop-shadow(0 0 20px rgba(231, 89, 0, 0.2))",
            scale: 1.05,
            transformOrigin: "50% 50%",
            duration: 0.85,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
          },
          "pulse",
        )
        .to(
          ".ai-logo path",
          {
            stroke: "#E75900",
            duration: 0.85,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
          },
          "pulse",
        )
        .to(
          ".ai-circle",
          {
            keyframes: [
              { scale: 0.75, ease: "sine.in" },
              { scale: 1, ease: "back.out(2.5)" },
            ],
            duration: 1.1,
          },
          "pulse",
        )
        .set([".follower3", ".follower4"], { opacity: 1 }, splitDelay)
        .to(
          ".follower3",
          {
            motionPath: {
              path: ".path2-branch-a",
              align: ".path2-branch-a",
              alignOrigin: [0.5, 0.5],
              autoRotate: false,
            },
            duration: 3,
            ease: "none",
          },
          splitDelay,
        )
        .to(
          ".follower4",
          {
            motionPath: {
              path: ".path2-branch-b",
              align: ".path2-branch-b",
              alignOrigin: [0.5, 0.5],
              autoRotate: false,
            },
            duration: 3,
            ease: "none",
          },
          splitDelay,
        )
        .set([".follower3", ".follower4"], { opacity: 0 })
        .set(".follower2", { opacity: 1 });
    },
    { scope: svgRef },
  );

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 441 356"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_f_146_4)">
        <rect
          x="126"
          y="87"
          width="169"
          height="169"
          rx="84.5"
          fill="#E75900"
        />
      </g>
      <g className="follower">
        <circle cx="185.5" cy="79.5074" r="3.5" fill="#E75900" />
        <g filter="url(#filter1_f_146_4)">
          <circle cx="185.5" cy="79.5074" r="3.5" fill="#E75900" />
        </g>
      </g>

      <circle
        className="follower2"
        cx="54.5"
        cy="172.507"
        r="3.5"
        fill="#E75900"
      />
      <g filter="url(#filter2_f_146_4)">
        <circle
          className="follower2"
          cx="54.5"
          cy="172.507"
          r="3.5"
          fill="#E75900"
        />
      </g>
      <circle
        className="follower3"
        cx="227"
        cy="172.007"
        r="3.5"
        fill="#E75900"
      />
      <g filter="url(#filter2_f_146_4)">
        <circle
          className="follower3"
          cx="227"
          cy="172.007"
          r="3.5"
          fill="#E75900"
        />
      </g>
      <circle
        className="follower4"
        cx="227"
        cy="172.007"
        r="3.5"
        fill="#E75900"
      />
      <g filter="url(#filter2_f_146_4)">
        <circle
          className="follower4"
          cx="227"
          cy="172.007"
          r="3.5"
          fill="#E75900"
        />
      </g>
      <path className="path2-main" d="M-30 172.007H227" stroke="#E75900" />
      <path
        className="path2-branch-a"
        d="M227 172.007L469.5 308.5"
        stroke="#E75900"
      />
      <path
        className="path2-branch-b"
        d="M227 172.007L469.5 32"
        stroke="#E75900"
      />
      <rect
        className="ai-circle"
        x="131"
        y="81.0074"
        width="179"
        height="179"
        rx="89.5"
        fill="#D9D9D9"
      />
      <path
        className="path"
        d="M318.5 170.5A98 98 0 1 0 122.5 170.5A98 98 0 1 0 318.5 170.5Z"
        stroke="#E75900"
        fill="none"
      />
      <g className="ai-logo">
        <path
          d="M220.5 157V144H207.5"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M240 157H201C197.411 157 194.5 159.91 194.5 163.5V189.5C194.5 193.09 197.411 196 201 196H240C243.59 196 246.5 193.09 246.5 189.5V163.5C246.5 159.91 243.59 157 240 157Z"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M188 176.5H194.5"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M246.5 176.5H253"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M230.25 173.25V179.75"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M210.75 173.25V179.75"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_146_4"
          x="26"
          y="-13"
          width="369"
          height="369"
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
            result="effect1_foregroundBlur_146_4"
          />
        </filter>
        <filter
          id="filter1_f_146_4"
          x="177.7"
          y="71.7074"
          width="15.6"
          height="15.6"
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
            stdDeviation="2.15"
            result="effect1_foregroundBlur_146_4"
          />
        </filter>
        <filter
          id="filter2_f_146_4"
          x="46.7"
          y="164.707"
          width="15.6"
          height="15.6"
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
            stdDeviation="2.15"
            result="effect1_foregroundBlur_146_4"
          />
        </filter>
      </defs>
    </svg>
  );
};
