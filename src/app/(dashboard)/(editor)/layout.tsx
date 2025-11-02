import AppHeader from "@/components/mine/app-header";

import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppHeader />
      <main className=" flex-1">{children}</main>
    </>
  );
};

export default layout;
