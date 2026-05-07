import { Link, useLocation } from "react-router-dom";
import {
  MessageSquare,
  Image as ImageIcon,
  Film,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  History,
  PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mainNavItems = [
  { name: "AI 聊天", icon: MessageSquare, path: "/chat" },
  { name: "AI 生图", icon: ImageIcon, path: "/image" },
  { name: "AI 视频", icon: Film, path: "/video" },
  { name: "素材广场", icon: LayoutGrid, path: "/assets" },
];

const historyItems = [
  { name: "未来城市概念设计" },
  { name: "营销文案生成" },
  { name: "3D 角色动作参考" },
  { name: "品牌标识设计" },
  { name: "产品配图生成" },
  { name: "交互动画脚本" },
  { name: "节日活动策划" },
  { name: "短视频分镜设计" },
];

export function Sidebar({ showChatHistory = true }: { showChatHistory?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex-shrink-0 flex flex-col bg-white/80 backdrop-blur-xl border border-slate-200 transition-all duration-300 ease-in-out shadow-sm rounded-[24px] my-6 ml-6 h-[calc(100%-48px)]",
        isCollapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="w-full h-full flex flex-col py-4 px-3 overflow-hidden">
        {/* Header */}
        {!isCollapsed && (
          <div className="px-4 mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">创作中心</h2>
          </div>
        )}

        {/* Main Nav */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {mainNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center w-full px-4 h-10 rounded-lg gap-3 transition-colors duration-200 cursor-pointer overflow-hidden whitespace-nowrap",
                  isActive
                    ? "bg-white/80 text-primary shadow-sm ring-1 ring-black/5 font-semibold"
                    : "text-slate-600 hover:bg-white/50"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* History */}
        {!isCollapsed && showChatHistory && (
          <div className="mt-4 pt-4 border-t border-black/5 w-full flex flex-col gap-1 overflow-hidden flex-1 min-h-0">
            <div className="px-4 text-xs font-semibold text-slate-500 mb-2 flex-shrink-0">历史对话</div>
            <div className="flex-1 overflow-y-auto glass-scrollbar flex flex-col gap-1 pr-1 min-h-0">
              {historyItems.map((item, i) => (
                <button
                  key={i}
                  className="flex items-center w-full px-4 min-h-[32px] text-slate-500 hover:bg-white/50 rounded-lg transition-colors gap-3 whitespace-nowrap flex-shrink-0"
                >
                  <History className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="text-[13px] truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-auto pt-4 border-t border-black/5 w-full flex flex-col gap-2 flex-shrink-0">
          <div 
            id="sidebar-action-slot" 
            data-collapsed={isCollapsed}
            className="w-full empty:hidden flex flex-col gap-2 mb-2 data-[collapsed=true]:[&_button_span]:hidden data-[collapsed=true]:[&_button]:w-11 data-[collapsed=true]:[&_button]:px-0 data-[collapsed=true]:[&_button]:mx-auto"
          ></div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center px-4 h-10 text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all gap-3 overflow-hidden whitespace-nowrap justify-center sm:justify-start"
            title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            ) : (
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
            )}
            {!isCollapsed && <span className="text-sm">收起侧边栏</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
