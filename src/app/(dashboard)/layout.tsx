import SidebarComponent from "@/components/mine/sidebar-component";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>

      <SidebarComponent />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default layout;
