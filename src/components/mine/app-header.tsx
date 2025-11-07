"use client";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { useSidebar } from "../ui/sidebar";

const AppHeader = () => {
  const pathname = usePathname();
  const {} = useSidebar();

  return (
    <div>
      <header className="  flex h-14 items-center gap-2 bg-[#f3f4f6]  dark:bg-background border-dashed border-b px-2 z-50 fixed top-0 md:left-64 left-0 right-0 ">
        <SidebarTrigger />
        <h1 className="  text-sm  ">
          {pathname
            .split("/")
            .filter(Boolean)
            .map((part) => part.replace(/-/g, " "))
            .join(" > ")}
        </h1>
      </header>
    </div>
  );
};

export default AppHeader;
