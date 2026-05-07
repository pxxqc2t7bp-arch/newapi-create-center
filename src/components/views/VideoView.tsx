import {
  Undo,
  Redo,
  PlayCircle,
  ZoomIn,
  ZoomOut,
  Settings2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Image as ImageIcon,
  Film,
  Music,
  Upload,
  History,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function VideoView() {
  const { showChatHistory, setShowChatHistory } = useOutletContext<{ showChatHistory: boolean, setShowChatHistory: (v: boolean | ((prev: boolean) => boolean)) => void }>();
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    settings: true,
    motion: true,
  });
  const [sidebarSlot, setSidebarSlot] = useState<HTMLElement | null>(null);

  const [resolution, setResolution] = useState("1080p");
  const [customWidth, setCustomWidth] = useState("1920");
  const [customHeight, setCustomHeight] = useState("1080");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState("4s");
  const [customDuration, setCustomDuration] = useState("5");
  const [motionAmount, setMotionAmount] = useState(60);

  const ratios = [
    { id: "1:1", label: "1:1" },
    { id: "4:3", label: "4:3" },
    { id: "16:9", label: "16:9" },
    { id: "21:9", label: "21:9" },
  ];

  const durations = [
    { id: "2s", label: "2秒" },
    { id: "4s", label: "4秒" },
    { id: "8s", label: "8秒" },
    { id: "custom", label: "自定义" },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    setSidebarSlot(document.getElementById("sidebar-action-slot"));
  }, []);

  return (
    <div className="flex-1 flex p-6 pb-0 gap-6 h-full overflow-hidden bg-transparent">
      {sidebarSlot && createPortal(
        <button onClick={() => toast.success("开始生成视频...")} className="w-full h-11 bg-primary text-white rounded-xl shadow-md hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2">
          <PlayCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold whitespace-nowrap">生成视频</span>
        </button>,
        sidebarSlot
      )}
      {/* Center Main Stage */}
      <div className="flex-1 flex flex-col min-w-0 glass-panel overflow-hidden border-slate-200 shadow-xl relative bg-slate-900/5">
        {/* Top Header inside stage */}
        <div className="h-[52px] absolute top-0 w-full flex items-center justify-between px-6 z-20 bg-gradient-to-b from-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white drop-shadow-md">
              Project_Alpha_V1
            </span>
            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] text-white/90 border border-white/20">
              1080p · 24fps
            </span>
          </div>
          <div className="flex gap-2">
            {!showRightPanel && (
              <button 
                onClick={() => setShowRightPanel(true)} 
                className="h-8 px-3 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1.5 justify-center text-white text-xs hover:bg-black/60 transition-colors border border-white/10"
                title="打开配置"
              >
                <Settings2 className="w-3.5 h-3.5" />
                配置
              </button>
            )}
            <button className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10">
              <Undo className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10">
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Stage / Preview */}
        <div className="flex-1 p-8 flex items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-hidden z-10">
          <div className="w-full h-full flex flex-col items-center justify-center relative p-4">
            <div className="w-full h-full max-h-full aspect-video bg-black/80 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group mx-auto">
            {/* Mock video content */}
            <img
              src="https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=1920&h=1080"
              alt="Video Preview"
              className="w-full h-full object-cover opacity-80"
            />
            {/* Play controls overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-black/40 backdrop-blur-md rounded-full px-6 py-3 flex gap-6 items-center border border-white/10 shadow-2xl">
                <button className="text-white/80 hover:text-white transition-colors">
                  <div className="w-5 h-5 bg-current mask-[url(https://unpkg.com/lucide-static@0.447.0/icons/skip-back.svg)] mask-center" />
                </button>
                <button className="text-white hover:scale-105 transition-transform">
                  <PlayCircle className="w-12 h-12 fill-white" />
                </button>
                <button className="text-white/80 hover:text-white transition-colors">
                  <div className="w-5 h-5 bg-current mask-[url(https://unpkg.com/lucide-static@0.447.0/icons/skip-forward.svg)] mask-center" />
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Bottom Timeline */}
        <div className="h-[200px] w-full bg-slate-900/40 backdrop-blur-2xl flex flex-col border-t border-white/10 p-4 z-20">
          <div className="flex justify-between items-center mb-3 text-white/80">
            <div className="font-mono text-xs bg-black/40 px-3 py-1 rounded border border-white/10">
              00:00:02.14 / 00:00:04.00
            </div>
            <div className="flex items-center gap-3">
              <ZoomIn className="w-4 h-4 cursor-pointer hover:text-white" />
              <div className="w-32 h-1 bg-black/50 rounded-full relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-1/3 bg-white/70 rounded-full" />
              </div>
              <ZoomOut className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>

          <div className="flex-1 bg-black/50 rounded-xl border border-white/5 relative flex flex-col p-2 gap-2 overflow-hidden">
            {/* Playhead */}
            <div className="absolute top-0 bottom-0 left-[35%] w-[1px] bg-red-500 z-30">
              <div className="absolute top-0 -translate-x-1/2 w-3 h-4 bg-red-500 rounded-sm" />
            </div>

            {/* Track V1 */}
            <div className="h-[42px] bg-white/5 rounded-lg flex items-center px-3 relative hover:bg-white/10 transition-colors">
              <div className="w-12 flex items-center gap-1.5 text-white/50 border-r border-white/10 mr-2">
                <Film className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold">V1</span>
              </div>
              <div className="absolute left-16 top-1 bottom-1 w-[40%] bg-blue-500/30 border border-blue-500/50 rounded flex items-center overflow-hidden cursor-pointer hover:brightness-110">
                <div className="w-full flex items-center justify-between px-2 opacity-80">
                  <span className="text-[10px] text-white font-mono truncate">
                    Clip_1.mp4
                  </span>
                </div>
              </div>
            </div>

            {/* Track A1 */}
            <div className="h-[42px] bg-white/5 rounded-lg flex items-center px-3 relative hover:bg-white/10 transition-colors">
              <div className="w-12 flex items-center gap-1.5 text-white/50 border-r border-white/10 mr-2">
                <Music className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold">A1</span>
              </div>
              <div className="absolute left-16 top-1 bottom-1 w-[60%] bg-emerald-500/30 border border-emerald-500/50 rounded flex items-center justify-center cursor-pointer hover:brightness-110">
                 {/* Fake audio waveform */}
                <div className="w-full h-3 border-t border-b border-emerald-400/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Settings Panel */}
      <div className={cn(
        "flex-shrink-0 flex flex-col glass-panel overflow-hidden mb-6 transition-all duration-300",
        showRightPanel ? "w-[340px]" : "w-0 border-none mr-0 opacity-0 bg-transparent"
      )}>
        <div className="px-5 py-4 border-b border-white/40 flex-shrink-0 flex items-center justify-between bg-white/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-slate-800 text-[15px]">参数配置</h2>
          </div>
          <button 
            onClick={() => setShowRightPanel(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/50 transition-colors"
            title="收起侧边栏"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className={cn(
          "flex-1 flex flex-col min-h-0 transition-all duration-300",
          expandedSections.motion ? "overflow-y-auto glass-scrollbar" : "overflow-hidden"
        )}>
          {/* Section 1: Scene Details */}
          <div className="flex flex-col shrink-0 border-b border-white/40 relative">
            <div className="flex justify-between items-center px-5 py-3 border-b border-white/40 bg-white/30 backdrop-blur-md relative z-10">
              <h3 className="font-semibold text-slate-800 text-sm drop-shadow-sm">分镜详情</h3>
              <button 
                onClick={() => setShowChatHistory(!showChatHistory)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors flex items-center justify-center",
                  showChatHistory 
                    ? "text-primary bg-primary/10" 
                    : "text-slate-500 hover:bg-white/50"
                )}
                title="历史对话"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  上传参考图片
                </label>
                <button className="w-full border shadow-sm border-white/60 bg-white/40 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/60 hover:border-white transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <div className="flex items-center justify-center mb-1">
                    <Upload className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-700 group-hover:text-primary transition-colors">点击上传 (可选)</p>
                </button>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  提示词 (Prompt)
                </label>
                <textarea
                  className="w-full glass-input rounded-xl p-3 text-[12px] resize-none h-[88px] shadow-inner custom-scrollbar"
                  defaultValue="A cinematic tracking shot of an astronaut walking through a neon-lit cyberpunk market, rain falling softly."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  反向提示词
                </label>
                <textarea
                  className="w-full glass-input rounded-xl p-3 text-[12px] resize-none h-[68px] shadow-inner custom-scrollbar"
                  defaultValue="blurry, low quality, deformed, distorted, disfigured, text, watermark."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Video Settings */}
          <div className="flex flex-col shrink-0 border-b border-white/40 relative">
            <button
              onClick={() => toggleSection("settings")}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/40 transition-all duration-300 bg-white/30 backdrop-blur-md border-b border-white/40 relative z-10"
            >
              <span className="font-semibold text-slate-800 text-sm drop-shadow-sm">视频设置</span>
              {expandedSections.settings ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {expandedSections.settings && (
              <div className="px-5 pb-5 pt-1 border-t border-black/5 flex flex-col gap-5">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-2 block">画幅比例</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ratios.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setAspectRatio(r.id)}
                        className={cn(
                          "flex items-center justify-center py-2.5 rounded-[20px] transition-all duration-300 cursor-pointer font-medium shadow-sm backdrop-blur-md border",
                          aspectRatio === r.id
                            ? "bg-gradient-to-br from-primary/80 to-primary/90 text-white shadow-primary/20 border-white/20 ring-1 ring-primary/30"
                            : "bg-white/40 border-white/60 text-slate-600 hover:bg-white/60 hover:shadow-md hover:-translate-y-0.5 ring-1 ring-black/5"
                        )}
                      >
                        <span className="text-[13px]">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-2 block">分辨率</label>
                  <div className="grid grid-cols-4 p-1.5 bg-white/30 border border-white/60 rounded-[24px] mb-3 shadow-inner backdrop-blur-md">
                    {["480p", "720p", "1080p", "custom"].map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={cn(
                          "py-2 px-1 text-[11px] font-medium rounded-xl transition-all duration-300",
                          resolution === res
                            ? "bg-white text-primary shadow-sm border border-white/80 backdrop-blur-md"
                            : "text-slate-600 hover:bg-white/50 hover:text-slate-800"
                        )}
                      >
                        {res === "custom" ? "自定义" : res}
                      </button>
                    ))}
                  </div>
                  
                  {resolution === "custom" && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 mb-3 block">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">宽度 (W)</span>
                        <input 
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          className="w-full glass-input bg-white/30 border-white/60 backdrop-blur-md rounded-2xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/50 shadow-inner"
                          placeholder="如: 1920"
                        />
                      </div>
                      <span className="text-slate-300 font-medium mt-5">×</span>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">高度 (H)</span>
                        <input 
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          className="w-full glass-input bg-white/30 border-white/60 backdrop-blur-md rounded-2xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/50 shadow-inner"
                          placeholder="如: 1080"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-2 block">视频时长</label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {durations.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDuration(d.id)}
                        className={cn(
                          "flex items-center justify-center py-2.5 rounded-[20px] transition-all duration-300 cursor-pointer font-medium shadow-sm backdrop-blur-md border",
                          duration === d.id
                            ? "bg-gradient-to-br from-primary/80 to-primary/90 text-white shadow-primary/20 border-white/20 ring-1 ring-primary/30"
                            : "bg-white/40 border-white/60 text-slate-600 hover:bg-white/60 hover:shadow-md hover:-translate-y-0.5 ring-1 ring-black/5"
                        )}
                      >
                        <span className="text-[13px]">{d.label}</span>
                      </button>
                    ))}
                  </div>

                  {duration === "custom" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200 mb-3 block">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">时长 (秒)</span>
                        <input 
                          type="number"
                          value={customDuration}
                          onChange={(e) => setCustomDuration(e.target.value)}
                          className="w-full glass-input bg-white/30 border-white/60 backdrop-blur-md rounded-2xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/50 shadow-inner"
                          placeholder="如: 5"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-2 block">帧率 (Frame Rate)</label>
                  <div className="grid grid-cols-3 p-1.5 bg-white/30 border border-white/60 rounded-[24px] shadow-inner backdrop-blur-md">
                    <button className="py-2 px-1 text-[11px] font-medium bg-white text-primary rounded-xl shadow-sm border border-white/80 transition-all">24fps</button>
                    <button className="py-2 px-1 text-[11px] font-medium text-slate-600 rounded-xl hover:bg-white/50 hover:text-slate-800 transition-all">30fps</button>
                    <button className="py-2 px-1 text-[11px] font-medium text-slate-600 rounded-xl hover:bg-white/50 hover:text-slate-800 transition-all">60fps</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Motion Control */}
          <div className="flex flex-col shrink-0 relative">
            <button
              onClick={() => toggleSection("motion")}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/40 transition-all duration-300 bg-white/30 backdrop-blur-md border-b border-white/40 relative z-10 rounded-b-xl"
            >
              <span className="font-semibold text-slate-800 text-sm drop-shadow-sm">运动控制</span>
              {expandedSections.motion ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {expandedSections.motion && (
              <div className="px-5 pb-5 pt-3 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium text-slate-600">运镜幅度</span>
                    <span className="bg-white/60 shadow-sm border border-white/80 text-primary px-2.5 py-1 text-[11px] rounded-[10px] font-mono font-bold backdrop-blur-md">{(motionAmount / 100).toFixed(1)}</span>
                  </div>
                  <div className="relative w-full h-2 bg-white/20 backdrop-blur-md border border-white/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] rounded-full flex items-center mb-2">
                    <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary/70 to-primary/90 backdrop-blur-xl rounded-full pointer-events-none transition-all duration-75 shadow-sm" style={{ width: `${motionAmount}%` }} />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="1" 
                      value={motionAmount} 
                      onChange={(e) => setMotionAmount(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 peer" 
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-gradient-to-b from-white to-white/90 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,1),inset_0_-1px_1px_rgba(0,0,0,0.05)] border border-white/60 pointer-events-none z-10 transition-transform duration-75 peer-hover:scale-110 peer-active:scale-95"
                      style={{ left: `calc(${motionAmount}% - 9px)` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
