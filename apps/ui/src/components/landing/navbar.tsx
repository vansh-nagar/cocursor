import React from "react";
import OrangeButton from "./button/orange-button";

const Navbar = () => {
  return (
    <div className=" flex justify-between items-center fixed inset-x-14">
      <div>
        <svg
          width="60"
          height="91"
          viewBox="0 0 87 91"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M47.1643 21.4431L1.51616 34.7167C0.385676 35.0454 0.305338 36.6102 1.39625 37.0521L21.7132 45.2821C22.083 45.4319 22.358 45.7495 22.4525 46.1357L28.1896 69.5876C28.4777 70.7653 30.1174 70.8716 30.5564 69.741L48.6718 23.0781C49.0431 22.1215 48.1526 21.1557 47.1643 21.4431Z"
            fill="white"
            stroke="white"
            stroke-width="1.14286"
          />
          <path
            d="M39.811 69.2416L85.4341 55.8831C86.564 55.5523 86.6415 53.9874 85.5497 53.5476L65.2175 45.3554C64.8473 45.2063 64.5717 44.8891 64.4765 44.5029L58.6954 21.0619C58.4051 19.8847 56.7653 19.7815 56.3284 20.9129L38.3004 67.6093C37.9309 68.5666 38.8231 69.5308 39.811 69.2416Z"
            fill="white"
            stroke="white"
            stroke-width="1.14286"
          />
        </svg>
      </div>
      <div className="flex  items-center gap-6 text-sm">
        <span>Docs</span>
        <span>Features</span>
        <button>
          <OrangeButton>Login</OrangeButton>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
