"use client";

import { useTheme } from "next-themes";

export default function NavBar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className=" fixed  top-0 inset-x-0  z-50 border-b bg-background/10 backdrop-blur-xs h-16 flex justify-between items-center px-4 sm:px-32  ">
      <p className=" cursor-pointer">
        <img
          src="/logo/only-logo.svg"
          alt=""
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          className="dark:invert hidden dark:block w-10   "
        />
        <img
          src="/logo/only-logo.svg"
          alt=""
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          className="dark:hidden  block w-10"
        />
      </p>
    </div>
  );
}
