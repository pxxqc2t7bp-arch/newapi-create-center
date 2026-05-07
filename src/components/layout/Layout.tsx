import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

export function Layout() {
  const [showChatHistory, setShowChatHistory] = useState(true);

  return (
    <div className="h-screen w-screen bg-[#f5f5f7] flex flex-col font-sans text-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(0, 102, 204, 0.08) 0%, transparent 40%), radial-gradient(circle at 0% 100%, rgba(0, 102, 204, 0.05) 0%, transparent 40%)",
        }}
      />

      <TopNav />

      <div className="flex-1 flex mt-[52px] w-full z-10 overflow-hidden min-h-0 relative">
        <Sidebar showChatHistory={showChatHistory} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-0 relative">
          <Outlet context={{ showChatHistory, setShowChatHistory }} />
        </main>
      </div>
    </div>
  );
}
