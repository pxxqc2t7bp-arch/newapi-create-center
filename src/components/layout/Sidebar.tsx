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
  { name: "AI 聊天", icon: MessageSquare, path: "/creation/chat" },
  { name: "AI 生图", icon: ImageIcon, path: "/creation/image" },
  { name: "AI 视频", icon: Film, path: "/creation/video" },
  { name: "素材广场", icon: LayoutGrid, path: "/creation/assets" },
  { name: "提示词库", icon: MessageSquare, path: "/creation/prompts" }, // Reusing MessageSquare as a placeholder for prompts
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
        "flex-shrink-0 flex flex-col liquid-glass transition-all duration-300 ease-in-out shadow-sm rounded-[24px] my-6 ml-6 h-[calc(100%-48px)] z-20 relative border border-[var(--lg-edge-highlight)]",
        isCollapsed ? "w-[80px]" : "w-[240px]"
      )}
    >
      <div className="w-full h-full flex flex-col py-6 px-3 overflow-hidden bg-white/50 backdrop-blur-md">
        {/* Header */}
        {!isCollapsed && (
          <div className="px-4 mb-6 text-center">
            <h2 className="text-lg font-semibold text-[var(--lg-text-primary)] tracking-tight drop-shadow-sm">创作中心</h2>
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
                  "flex items-center w-full px-4 h-11 rounded-[14px] gap-3 transition-colors duration-200 cursor-pointer overflow-hidden whitespace-nowrap",
                  isActive
                    ? "bg-[var(--lg-bg-elevated)] text-[var(--apple-blue)] shadow-sm font-semibold border border-[var(--lg-edge-highlight)]"
                    : "text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)] hover:bg-[var(--lg-bg-control)]"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-[14px] font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* History */}
        {!isCollapsed && showChatHistory && (
          <div className="mt-8 overflow-hidden flex-1 min-h-0 flex flex-col gap-2">
            <div className="px-4 text-[11px] font-bold text-[var(--lg-text-secondary)] tracking-widest uppercase mb-1">历史对话</div>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-0.5 pr-1 min-h-0">
              {historyItems.map((item, i) => (
                <button
                  key={i}
                  className="flex items-center w-full px-4 min-h-[36px] text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)] hover:bg-[var(--lg-bg-control)] rounded-[12px] transition-colors gap-3 whitespace-nowrap flex-shrink-0"
                >
                  <History className="w-[16px] h-[16px] flex-shrink-0 opacity-70" />
                  <span className="text-[13px] font-medium truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className={cn("pt-4 mt-auto flex flex-col gap-2 flex-shrink-0", isCollapsed ? "" : "border-t border-[var(--lg-edge-highlight)]")}>
          <div 
            id="sidebar-action-slot" 
            data-collapsed={isCollapsed}
            className="w-full empty:hidden flex flex-col gap-2 mb-2 data-[collapsed=true]:[&_button_span]:hidden data-[collapsed=true]:[&_button]:w-11 data-[collapsed=true]:[&_button]:px-0 data-[collapsed=true]:[&_button]:mx-auto"
          ></div>
          <button
            onClick={() => {
              if (typeof (window as any).__toggleChatHistory === 'function') {
                (window as any).__toggleChatHistory();
              }
            }}
            className="w-full flex items-center px-4 h-11 text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)] hover:bg-[var(--lg-bg-control)] rounded-[14px] transition-all gap-3 overflow-hidden whitespace-nowrap justify-center sm:justify-start lg-button-glass border-transparent hover:border-[var(--lg-edge-highlight)]"
            title={showChatHistory ? "收起历史对话" : "展开历史对话"}
          >
            <History className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-[14px] font-medium">{showChatHistory ? "收起历史对话" : "展开历史对话"}</span>}
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center px-4 h-11 text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)] hover:bg-[var(--lg-bg-control)] rounded-[14px] transition-all gap-3 overflow-hidden whitespace-nowrap justify-center sm:justify-start"
            title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            ) : (
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
            )}
            {!isCollapsed && <span className="text-[14px] font-medium">收起侧边栏</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
