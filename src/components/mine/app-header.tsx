import { SidebarTrigger } from "../ui/sidebar";

const AppHeader = () => {
  return (
    <div>
      <header className=" flex h-14 items-center gap-2 bg-[#171717] border-b px-2">
        <SidebarTrigger />
      </header>
    </div>
  );
};

export default AppHeader;
