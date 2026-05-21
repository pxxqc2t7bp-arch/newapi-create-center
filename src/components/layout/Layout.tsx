import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

export function Layout() {
  const [showChatHistory, setShowChatHistory] = useState(true);

  if (typeof window !== 'undefined') {
    (window as any).__toggleChatHistory = () => setShowChatHistory(prev => !prev);
  }

  return (
    <div className="h-screen w-screen bg-[var(--apple-parchment)] flex flex-col font-sans text-[var(--lg-text-primary)] relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8), transparent 70%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.6), transparent 50%)",
        }}
      />

      <TopNav />

      <div className="flex-1 flex mt-[44px] w-full z-10 overflow-hidden min-h-0 relative">
        <Sidebar showChatHistory={showChatHistory} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-0 relative">
          <Outlet context={{ showChatHistory, setShowChatHistory }} />
        </main>
      </div>
    </div>
  );
}
