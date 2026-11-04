import React from "react";
import Sidebar from "./_components/Sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fb] mt-20">
      <Sidebar></Sidebar>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
};

export default layout;
