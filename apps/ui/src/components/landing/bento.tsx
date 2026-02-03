import React from "react";
import OrangeButton, { WhiteButton } from "./button/orange-button";

const Bento = () => {
  return (
    <div className="h-screen flex justify-center items-center mt-10 mb-10 gap-10 ">
      <div className="w-[75vw] h-[90vh] grid  gap-8 grid-cols-3">
        <div
          className=" rounded-[56px] border relative overflow-hidden flex flex-col justify-between"
          style={{
            boxShadow: "inset 0px 11px 31.8px 1px rgba(250, 96, 0, 0.25)",
          }}
        >
          <img src="/image/bento-img1.png" className="px-8 p-8" />

          <div className="px-8 pb-8 flex-col">
            <div className="text-xl leading-5">
              Write code at the speed of thought
            </div>
            <div className="text-xs leading-3 mt-2">
              Inline AI suggestions appear as you type. Accept full lines,
              functions, or patterns instantly no breaking your flow.
            </div>
          </div>
          <svg
            className=" absolute bottom-0 -z-10"
            width="440"
            height="875"
            viewBox="0 0 440 875"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
        </div>
        <div className=" grid grid-rows-2 gap-8">
          <div
            style={{
              boxShadow: "inset 0px 11px 31.8px 1px rgba(250, 96, 0, 0.25)",
            }}
            className=" rounded-[56px]  border p-8 relative overflow-hidden"
          >
            <svg
              className=" absolute -top-10 -left-10 inset-x-0"
              width="440"
              height="355"
              viewBox="0 0 441 355"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_f_0_1)">
                <rect
                  x="136"
                  y="77"
                  width="169"
                  height="169"
                  rx="84.5"
                  fill="#E75900"
                />
              </g>
              <path
                d="M-33 164H224M224 164L673.5 354M224 164L466.5 23.9926"
                stroke="#E75900"
              />
              <circle cx="185.5" cy="70.5" r="3.5" fill="#E75900" />
              <g filter="url(#filter1_f_0_1)">
                <circle cx="185.5" cy="70.5" r="3.5" fill="#E75900" />
              </g>
              <path
                d="M319 161C319 215.124 275.124 259 221 259C166.876 259 123 215.124 123 161C123 106.876 166.876 63 221 63C275.124 63 319 106.876 319 161ZM124.851 161C124.851 214.102 167.898 257.149 221 257.149C274.102 257.149 317.149 214.102 317.149 161C317.149 107.898 274.102 64.8506 221 64.8506C167.898 64.8506 124.851 107.898 124.851 161Z"
                fill="#E75900"
              />
              <g filter="url(#filter2_f_0_1)">
                <circle cx="54.5" cy="163.5" r="3.5" fill="#E75900" />
              </g>
              <circle cx="54.5" cy="163.5" r="3.5" fill="#E75900" />
              <defs>
                <filter
                  id="filter0_f_0_1"
                  x="36"
                  y="-23"
                  width="369"
                  height="369"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="50"
                    result="effect1_foregroundBlur_0_1"
                  />
                </filter>
                <filter
                  id="filter1_f_0_1"
                  x="177.7"
                  y="62.7"
                  width="15.6"
                  height="15.6"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="2.15"
                    result="effect1_foregroundBlur_0_1"
                  />
                </filter>
                <filter
                  id="filter2_f_0_1"
                  x="46.7"
                  y="155.7"
                  width="15.6"
                  height="15.6"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="2.15"
                    result="effect1_foregroundBlur_0_1"
                  />
                </filter>
              </defs>
            </svg>

            <div className="flex justify-center">
              <div
                className="flex justify-center items-center"
                style={{
                  width: "179px",
                  height: "179px",
                  left: "131px",
                  top: "71px",
                  background: "#D9D9D9",
                  borderRadius: "999px",
                  zIndex: 0,
                }}
              >
                <div
                  className="flex justify-center items-center"
                  style={{
                    width: "150px",
                    height: "150px",
                    background: "#F4F4F4",
                    boxShadow:
                      "0.444584px 0.444584px 0.628737px -0.75px rgba(0, 0, 0, 0.26), 1.21072px 1.21072px 1.71222px -1.5px rgba(0, 0, 0, 0.247), 2.6583px 2.6583px 3.75941px -2.25px rgba(0, 0, 0, 0.23), 5.90083px 5.90083px 8.34503px -3px rgba(0, 0, 0, 0.192), 10px 10px 21.2132px -3.75px rgba(0, 0, 0, 0.055), inset 1px 1px 1px #FFFFFF, inset -1px -1px 0px rgba(0, 0, 0, 0.1)",
                    borderRadius: "999px",
                  }}
                >
                  <div
                    className=" rounded-full flex justify-center items-center"
                    style={{
                      width: "70px",
                      height: "70px",
                      background:
                        "linear-gradient(180deg, #FFFFFF 44%, #F6F7F9 81%, #FFFFFF 100%)",
                      backgroundBlendMode: "overlay, normal",
                      boxShadow:
                        "0px 1px 3px rgba(177,183,192,0.24), 0px 0px 0px 9px #FCFCFC, 0px 0px 0px 10px rgba(211,214,222,0.5), 0px 10px 3px rgba(127,137,163,0.23), inset 0px -6px 0px rgba(230,232,237,0.7)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-bot text-black"
                    >
                      <path d="M12 8V4H8"></path>
                      <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                      <path d="M2 14h2"></path>
                      <path d="M20 14h2"></path>
                      <path d="M15 13v2"></path>
                      <path d="M9 13v2"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xl leading-5 mt-8">
              Your Agent That Never Sleeps{" "}
            </div>
            <div className="text-xs leading-3 mt-2">
              Generate features, refactor code, and fix bugs with an AI that
              understands your project.
            </div>
          </div>
          <div
            style={{
              boxShadow: "inset 0px 11px 31.8px 1px rgba(250, 96, 0, 0.25)",
            }}
            className=" rounded-[56px] border relative overflow-hidden p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex gap-3">
                <img className="h-10 w-10" src="/image/pfp.png" alt="" />
                <div className="flex gap-2 flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <span>Vansh Nagar</span>
                    </div>
                    <span className="text-xs">4:33</span>
                  </div>
                  <WhiteButton className="text-left px-2 py-2 bg-white  text-xs">
                    Create a responsive pricing card component with 3 plans.
                  </WhiteButton>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <img className="w-10 h-10" src="/image/cursor.png" alt="" />{" "}
                <div className="flex gap-2 flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <span>Vansh Nagar</span>
                    </div>
                    <span className="text-xs">4:33</span>
                  </div>
                  <OrangeButton className="text-left px-2 py-2 text-xs">
                    Started working on the pricing card component.
                  </OrangeButton>
                </div>{" "}
              </div>

              <svg
                className=" absolute top-10  left-11 -z-10"
                width="14"
                height="119"
                viewBox="0 0 14 119"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="7"
                  y1="2.18557e-08"
                  x2="7"
                  y2="112"
                  stroke="#E75900"
                />
                <g filter="url(#filter0_f_0_1)">
                  <line x1="7" y1="37" x2="7" y2="57" stroke="#E75900" />
                </g>
                <g filter="url(#filter1_f_0_1)">
                  <line x1="7" y1="49" x2="7" y2="69" stroke="#E75900" />
                </g>
                <g filter="url(#filter2_f_0_1)">
                  <line x1="7" y1="35" x2="7" y2="55" stroke="#E75900" />
                </g>
                <g filter="url(#filter3_f_0_1)">
                  <line x1="7" y1="43" x2="7" y2="73" stroke="#E75900" />
                </g>
                <g filter="url(#filter4_f_0_1)">
                  <line x1="7" y1="92" x2="6.99999" y2="112" stroke="#E75900" />
                </g>
                <defs>
                  <filter
                    id="filter0_f_0_1"
                    x="0"
                    y="30.5"
                    width="14"
                    height="33"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="3.25"
                      result="effect1_foregroundBlur_0_1"
                    />
                  </filter>
                  <filter
                    id="filter1_f_0_1"
                    x="0"
                    y="42.5"
                    width="14"
                    height="33"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="3.25"
                      result="effect1_foregroundBlur_0_1"
                    />
                  </filter>
                  <filter
                    id="filter2_f_0_1"
                    x="0"
                    y="28.5"
                    width="14"
                    height="33"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="3.25"
                      result="effect1_foregroundBlur_0_1"
                    />
                  </filter>
                  <filter
                    id="filter3_f_0_1"
                    x="0"
                    y="36.5"
                    width="14"
                    height="43"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="3.25"
                      result="effect1_foregroundBlur_0_1"
                    />
                  </filter>
                  <filter
                    id="filter4_f_0_1"
                    x="0"
                    y="85.5"
                    width="14"
                    height="33"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="3.25"
                      result="effect1_foregroundBlur_0_1"
                    />
                  </filter>
                </defs>
              </svg>
            </div>

            <div>
              <div className="text-xl leading-5 mt-6">
                Talk Through Problems, Ship Solutions{" "}
              </div>
              <div className="text-xs leading-3 mt-2">
                Ask questions, debug issues, and build faster all from a simple
                conversation.
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                width: "173px",
                height: "173px",
                left: "295px",
                top: "-15px",
                background: "#E75900",
                filter: "blur(107.3px)",
                zIndex: 0,
              }}
            />
          </div>
        </div>
        <div
          style={{
            boxShadow: "inset 0px 11px 31.8px 1px rgba(250, 96, 0, 0.25)",
          }}
          className="border rounded-[56px] relative pl-8 pt-8 overflow-hidden"
        >
          <img
            src="
            /image/bento-img2.png"
            alt=""
          />

          <div className="pr-8">
            <div className="text-xl leading-5 mt-6">
              Code Together, In Real Time{" "}
            </div>
            <div className="text-xs leading-3 mt-2">
              See live cursors, edits, and changes from your team instantly —
              like multiplayer for coding.
            </div>
          </div>

          <svg
            className=" absolute top-0 left-0 -z-10"
            width="440"
            height="875"
            viewBox="0 0 440 875"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_f_9_77)">
              <path
                d="M467 2C189.8 190 63.5121 327 38 499C2.2563 739.981 50.4 934.9 262 708.5C473.6 482.1 401.833 443.5 339.5 452.5"
                stroke="#E75900"
                stroke-width="150"
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
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
        </div>
      </div>
    </div>
  );
};

export default Bento;
