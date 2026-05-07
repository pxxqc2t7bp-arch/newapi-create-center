import { Bell, Contrast, Globe } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const topNavLinks = [
  { name: "首页", path: "/" },
  { name: "控制台", path: "/dashboard" },
  { name: "模型广场", path: "/models" },
  { name: "创作中心", path: "/chat" },
  { name: "文档", path: "/docs" },
  { name: "关于", path: "/about" },
];

export function TopNav() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 w-full h-[52px] z-50 bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm flex justify-between items-center px-6">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-lg font-bold text-slate-900 flex items-center gap-2">
          {/* Simple logo placeholder */}
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-blue-400 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-md">
            云
          </div>
          <span className="tracking-tight">云枢智链</span>
        </Link>
        <div className="hidden md:flex items-center h-full gap-2">
          {topNavLinks.map((link) => {
            const isActive =
              link.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.path) ||
                  (link.name === "创作中心" &&
                    ["/chat", "/image", "/video", "/assets"].some((p) =>
                      location.pathname.startsWith(p)
                    ));

            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 h-[52px] flex items-center text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary border-b-2 border-primary font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-black/5 hover:text-slate-900 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-black/5 hover:text-slate-900 transition-colors">
          <Contrast className="w-5 h-5" />
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-black/5 hover:text-slate-900 transition-colors">
          <Globe className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full ml-2 overflow-hidden border border-black/10 cursor-pointer shadow-sm">
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
            alt="User avatar"
            className="w-full h-full object-cover bg-primary/10"
          />
        </div>
      </div>
    </nav>
  );
}
