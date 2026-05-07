import {
  Upload,
  Search,
  SortAsc,
  LayoutGrid,
  List,
  CheckCircle2,
  MoreHorizontal,
  PlayCircle,
  X,
  Maximize2,
  Plus,
  MessageSquare,
  Download,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock Data
const assets = [
  {
    id: "1",
    title: "Abstract Glass Spheres Render.png",
    type: "IMAGE",
    tag: "4K",
    size: "12.4 MB",
    resolution: "3840x2160",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    selected: true,
  },
  {
    id: "2",
    title: "Vintage Audio Workspace.jpg",
    type: "IMAGE",
    tag: "",
    size: "4.2 MB",
    resolution: "1920x1080",
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop",
    selected: false,
  },
  {
    id: "3",
    title: "Tech_Circuit_Flythrough.mp4",
    type: "VIDEO",
    tag: "00:15",
    size: "85 MB",
    resolution: "1080p",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop",
    selected: false,
  },
  {
    id: "4",
    title: "Minimalist_Dunes_Background.jpg",
    type: "IMAGE",
    tag: "",
    size: "6.1 MB",
    resolution: "2560x1440",
    url: "https://images.unsplash.com/photo-1506501139174-099022df5260?q=80&w=2671&auto=format&fit=crop",
    selected: false,
  },
];

export function AssetsView() {
  const [selectedAsset, setSelectedAsset] = useState<typeof assets[0] | null>(assets[0]);
  const [filter, setFilter] = useState("全部");

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-transparent">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 px-8 py-6 h-full overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              素材广场
            </h1>
            <p className="text-slate-500 mt-2">
              发现并管理您的创作资源，无缝集成到AI工作流中。
            </p>
          </div>
          <button className="h-11 px-6 bg-primary text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2 relative overflow-hidden group active:scale-95">
            <Upload className="w-5 h-5" />
            上传素材
          </button>
        </div>

        {/* Toolbar */}
        <div className="glass-panel p-2 mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索图片、视频或标签..."
              className="w-full h-10 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            />
          </div>

          <div className="w-px h-6 bg-slate-200" />

          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/50">
            {["全部", "图片", "视频", "文档"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-5 py-1.5 rounded-full text-sm transition-all",
                  filter === f
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5 font-medium"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <button className="h-10 w-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
              <SortAsc className="w-5 h-5" />
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full text-primary bg-primary/10 transition-colors">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-10">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={cn(
                "glass-panel overflow-hidden cursor-pointer group transition-all duration-300 relative",
                selectedAsset?.id === asset.id
                  ? "ring-2 ring-primary shadow-md transform -translate-y-1"
                  : "hover:border-slate-300 hover:shadow-md hover:-translate-y-1"
              )}
            >
              <div
                className={cn(
                  "absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md rounded-full shadow-sm p-0.5",
                  selectedAsset?.id === asset.id
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                )}
              >
                {selectedAsset?.id === asset.id ? (
                  <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>

              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                {asset.type === "VIDEO" && (
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent z-10 transition-colors" />
                )}
                {asset.type === "VIDEO" && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                  </div>
                )}
                <img
                  src={asset.url}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-2 left-2 flex gap-1 z-20">
                  <span className="bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full border border-white/20">
                    {asset.type}
                  </span>
                  {asset.tag && (
                    <span className="bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full border border-white/20">
                      {asset.tag}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white/50 backdrop-blur-sm z-20 relative">
                <h3 className="font-semibold text-sm text-slate-800 truncate">
                  {asset.title}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-500">
                    {asset.size} · {asset.resolution}
                  </p>
                  <MoreHorizontal className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Drawer (Details) */}
      <aside
        className={cn(
          "h-full border-l border-slate-200/60 bg-white/70 backdrop-blur-xl flex flex-col flex-shrink-0 z-30 transition-all duration-300",
          selectedAsset ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        <div className="h-[60px] px-6 flex items-center justify-between border-b border-slate-200/50 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">素材详情</h2>
          <button
            onClick={() => setSelectedAsset(null)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {/* Preview Image */}
          <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative">
            <img
              src={selectedAsset?.url}
              alt="Preview"
              className="w-full h-auto object-contain"
            />
            <button className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-black/60 transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="font-semibold text-base text-slate-800 break-words leading-tight">
              {selectedAsset?.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5">上传于 2023年10月24日</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["3D Render", "Abstract", "Glassmorphism"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 border border-slate-200"
              >
                {tag}
              </span>
            ))}
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 hover:bg-slate-50 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full h-px bg-slate-200/60" />

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">文件类型</span>
              <span className="text-slate-800">{selectedAsset?.type === 'IMAGE' ? 'PNG Image' : 'MP4 Video'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">分辨率</span>
              <span className="text-slate-800">
                {selectedAsset?.resolution} (16:9)
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">文件大小</span>
              <span className="text-slate-800">{selectedAsset?.size}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">色彩空间</span>
              <span className="text-slate-800">RGB (sRGB)</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-slate-200/50 bg-white/50 backdrop-blur-md flex flex-col gap-3 flex-shrink-0">
          <button className="w-full h-10 flex items-center justify-center gap-2 bg-primary text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]">
            <MessageSquare className="w-4 h-4" />
            在 AI 聊天中使用
          </button>
          <div className="flex gap-3">
            <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 rounded-xl text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors active:scale-[0.98]">
              <Download className="w-4 h-4" />
              下载
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 border border-red-100 rounded-xl shadow-sm hover:bg-red-100 transition-colors active:scale-[0.98]">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
