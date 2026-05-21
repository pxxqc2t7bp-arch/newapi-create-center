import { Bell, Contrast, Globe } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const topNavLinks = [
  { name: "首页", isExternal: true, href: "https://llm.yslinkai.com" },
  { name: "控制台", isExternal: true, href: "https://llm.yslinkai.com/console" },
  { name: "创作中心", path: "/creation/chat" },
  { name: "文档", isExternal: true, href: "https://dcna1vlqsigm.feishu.cn/docx/VI4EdqdUNojZcZxDrPAcG8PVn4b", target: "_blank" },
];

export function TopNav() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 w-full h-[44px] z-50 bg-[var(--lg-bg-chrome)] backdrop-blur-[var(--lg-blur-lg)] saturate-[var(--lg-saturate)] border-b border-[var(--lg-edge-highlight)] flex justify-between items-center px-6">
      <div className="flex items-center gap-8 h-full">
        <a href="https://llm.yslinkai.com" className="text-base font-semibold text-[var(--lg-text-primary)] flex items-center gap-2">
          {/* Simple logo placeholder */}
          <div className="w-6 h-6 bg-gradient-to-br from-[var(--apple-blue)] to-[#4090ff] rounded-md flex items-center justify-center text-white text-[10px] font-black shadow-md drop-shadow-sm">
            云
          </div>
          <span className="tracking-tight drop-shadow-sm">云枢智链</span>
        </a>
        <div className="hidden md:flex items-center h-full gap-2">
          {topNavLinks.map((link) => {
            const isActive = link.path && location.pathname.startsWith("/creation");

            if (link.isExternal) {
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.target}
                  rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="px-3 h-[44px] flex items-center text-[13px] font-medium transition-colors relative text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)]"
                >
                  {link.name}
                </a>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.path!}
                className={cn(
                  "px-3 h-[44px] flex items-center text-[13px] font-medium transition-colors relative",
                  isActive
                    ? "text-[var(--lg-text-primary)]"
                    : "text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)]"
                )}
              >
                {link.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--apple-blue)] rounded-t-sm" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--lg-text-secondary)] hover:bg-[var(--lg-bg-control-hover)] hover:text-[var(--lg-text-primary)] transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--lg-text-secondary)] hover:bg-[var(--lg-bg-control-hover)] hover:text-[var(--lg-text-primary)] transition-colors">
          <Contrast className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--lg-text-secondary)] hover:bg-[var(--lg-bg-control-hover)] hover:text-[var(--lg-text-primary)] transition-colors">
          <Globe className="w-4 h-4" />
        </button>
        <div className="w-7 h-7 rounded-full ml-3 overflow-hidden border border-[var(--lg-edge-highlight)] cursor-pointer shadow-sm">
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
            alt="User avatar"
            className="w-full h-full object-cover bg-white"
          />
        </div>
      </div>
    </nav>
  );
}
