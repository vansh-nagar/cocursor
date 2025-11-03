import { SidebarTrigger } from "../ui/sidebar";

const AppHeader = () => {
  return (
    <div>
      <header className=" flex h-14 items-center gap-2 bg-[#f3f4f6] dark:bg-background border-dashed border-b px-2 z-50  rounded-br-2xl">
        <SidebarTrigger />
      </header>
    </div>
  );
};

export default AppHeader;
