import {
  History,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Wand2,
  Download,
  Share,
  MoreHorizontal,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  ImagePlus,
  Upload,
  X,
  Trash2,
  Edit2,
  Sparkles
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  ratio: string;
  timestamp: Date;
}

function ImageEditorInner({ image, onClose, onConfirm }: { image: GeneratedImage, onClose: () => void, onConfirm: (prompt: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [editPrompt, setEditPrompt] = useState(image.prompt);

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
       // Only resize if different to avoid clearing canvas on scroll/minor updates
       // Wait, resizing a canvas clears it. So we should match it exactly to the image's layout size.
       const tempCanvas = document.createElement('canvas');
       tempCanvas.width = canvas.width;
       tempCanvas.height = canvas.height;
       const tempCtx = tempCanvas.getContext('2d');
       if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

       canvas.width = width;
       canvas.height = height;

       const ctx = canvas.getContext('2d');
       if (ctx) {
         ctx.lineCap = 'round';
         ctx.lineJoin = 'round';
         ctx.drawImage(tempCanvas, 0, 0, width, height);
       }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // text-red-500 semantic
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-slate-50 flex flex-col"
    >
      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar */}
         <div className="w-[340px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0 shadow-lg relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <button onClick={onClose} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                <span className="font-medium text-sm">返回图库</span>
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100">
                <Edit2 className="w-3.5 h-3.5" />
                涂抹修改
              </div>
            </div>

            <div>
              <h3 className="font-medium text-slate-800 mb-3 text-sm">1. 涂抹需要修改的区域</h3>
              <p className="text-xs text-slate-500 mb-4">在右侧图像上涂抹想要重新生成的部分。</p>
              
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">画笔粗细</span>
                    <span className="text-xs text-slate-500">{brushSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <button 
                  onClick={clearCanvas}
                  className="w-full py-2 flex items-center justify-center gap-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />清除涂抹区域
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100" />

            <div className="flex-1 flex flex-col">
              <h3 className="font-medium text-slate-800 mb-3">2. 重新描述该区域</h3>
              <p className="text-xs text-slate-500 mb-4">输入提示词告诉 AI 涂抹区域应该变成什么样。</p>
              <textarea
                 className="w-full flex-1 min-h-[120px] px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all custom-scrollbar placeholder:text-slate-400 leading-relaxed mb-6"
                 value={editPrompt}
                 onChange={(e) => setEditPrompt(e.target.value)}
                 placeholder="例如：把这里变成一只戴着墨镜的狗..."
              />
              

            </div>
         </div>
         
         {/* Canvas Area */}
         <div className="flex-1 relative bg-slate-100 overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Floating Actions */}

            <button 
              onClick={() => onConfirm(editPrompt)} 
              className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-3.5 bg-blue-600 text-white text-base font-medium rounded-full hover:bg-blue-700 transition-colors shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 z-20 hover:-translate-y-0.5 border border-blue-500"
            >
               <Sparkles className="w-5 h-5" />
               开始生成修改
            </button>

            <div className="relative shadow-2xl rounded-sm overflow-hidden" style={{ maxHeight: '100%', maxWidth: '100%' }}>
              <img 
                src={image.url} 
                className="block max-w-full max-h-[calc(100vh-8rem)] object-contain select-none" 
                draggable={false}
                onLoad={handleResize}
              />
              <canvas 
                ref={canvasRef}
                className="absolute inset-0 cursor-crosshair touch-none"
                style={{ width: '100%', height: '100%' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
         </div>
      </div>
    </motion.div>,
    document.body
  );
}

function PhotoEditorInner({ image, onClose, onSave }: { image: GeneratedImage, onClose: () => void, onSave: (url: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [blur, setBlur] = useState(0);

  const applyFilters = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) blur(${blur}px)`;
      ctx.drawImage(img, 0, 0);
    };
    img.src = image.url;
  };

  useEffect(() => {
    applyFilters();
  }, [brightness, contrast, saturate, blur, image.url]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-slate-50 flex flex-col"
    >
      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar */}
         <div className="w-[340px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0 shadow-lg relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <button onClick={onClose} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                <span className="font-medium text-sm">返回图库</span>
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-100">
                <Settings2 className="w-3.5 h-3.5" />
                图片编辑
              </div>
            </div>

            <div>
              <h3 className="font-medium text-slate-800 mb-4 text-sm">编辑参数</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">亮度 (Brightness)</span>
                    <span className="text-xs text-slate-500">{brightness}%</span>
                  </div>
                  <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full accent-green-500" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">对比度 (Contrast)</span>
                    <span className="text-xs text-slate-500">{contrast}%</span>
                  </div>
                  <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full accent-green-500" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">饱和度 (Saturation)</span>
                    <span className="text-xs text-slate-500">{saturate}%</span>
                  </div>
                  <input type="range" min="0" max="200" value={saturate} onChange={(e) => setSaturate(parseInt(e.target.value))} className="w-full accent-green-500" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">模糊 (Blur)</span>
                    <span className="text-xs text-slate-500">{blur}px</span>
                  </div>
                  <input type="range" min="0" max="20" value={blur} onChange={(e) => setBlur(parseInt(e.target.value))} className="w-full accent-green-500" />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <button onClick={() => {
                   setBrightness(100);
                   setContrast(100);
                   setSaturate(100);
                   setBlur(0);
                 }} className="flex-1 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                   重置
                 </button>
                 <button onClick={() => {
                   if (canvasRef.current) {
                     onSave(canvasRef.current.toDataURL('image/jpeg', 0.9));
                   }
                 }} className="flex-[2] py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-500/20">
                   保存修改
                 </button>
              </div>
            </div>
         </div>
         
         {/* Canvas Area */}
         <div className="flex-1 relative bg-slate-100 overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="relative shadow-2xl rounded-sm overflow-hidden flex items-center justify-center" style={{ maxHeight: '100%', maxWidth: '100%' }}>
              <canvas 
                ref={canvasRef}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: 'calc(100vh - 8rem)' }}
              />
            </div>
         </div>
      </div>
    </motion.div>,
    document.body
  );
}

function FullscreenOverlay({ 
  image, 
  onClose, 
  onEdit,
  onPhotoEdit,
  onDelete
}: { 
  image: GeneratedImage; 
  onClose: () => void;
  onEdit: () => void;
  onPhotoEdit: () => void;
  onDelete: () => void;
}) {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow right click save
    };
    return () => {};
  }, []);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-8 select-none"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-20"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image Container with Zoom */}
      <div className="flex-1 w-full h-full flex items-center justify-center overflow-auto hidden-scrollbar" onClick={onClose}>
        <motion.img
          layoutId={`img-${image.id}`}
          src={image.url}
          alt={image.prompt}
          style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out', transformOrigin: 'center' }}
          className="max-w-full max-h-full object-contain shadow-2xl rounded-sm cursor-zoom-in"
          onClick={(e) => {
            e.stopPropagation();
            if (zoomLevel === 1) setZoomLevel(2);
            else setZoomLevel(1);
          }}
          draggable={false}
        />
      </div>

      {/* Top Action Bar: Zoom Controls */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full text-white/90 shadow-2xl z-20" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleZoomOut} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white" title="缩小">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={resetZoom} className="px-3 py-1 font-mono text-sm hover:bg-white/20 rounded-lg transition-colors min-w-[70px] text-center" title="重置缩放">
          {Math.round(zoomLevel * 100)}%
        </button>
        <button onClick={handleZoomIn} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white" title="放大">
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full text-white/90 shadow-2xl z-20" onClick={(e) => e.stopPropagation()}>
         <div className="flex flex-col max-w-[300px] mr-4 hidden md:flex">
           <span className="text-sm font-medium truncate" title={image.prompt}>{image.prompt}</span>
           <span className="text-[10px] text-white/50">{image.ratio === "custom" ? "自定义" : image.ratio} • {image.timestamp.toLocaleTimeString()}</span>
         </div>
         <div className="w-px h-6 bg-white/20 hidden md:block" />
         
         <button onClick={onPhotoEdit} className="flex flex-col items-center gap-1 hover:text-white text-white/70 transition-colors py-1 px-3 rounded-xl hover:bg-white/10" title="图片编辑">
           <Settings2 className="w-4 h-4" />
           <span className="text-[10px]">控制</span>
         </button>
         <button onClick={onEdit} className="flex flex-col items-center gap-1 hover:text-white text-white/70 transition-colors py-1 px-3 rounded-xl hover:bg-white/10" title="涂抹修改">
           <Edit2 className="w-4 h-4" />
           <span className="text-[10px]">修改</span>
         </button>
         <button onClick={() => {
           toast.success("提示词复制成功");
           navigator.clipboard.writeText(image.prompt).catch(() => {});
         }} className="flex flex-col items-center gap-1 hover:text-white text-white/70 transition-colors py-1 px-3 rounded-xl hover:bg-white/10" title="复制咒语">
           <Sparkles className="w-4 h-4" />
           <span className="text-[10px]">复制</span>
         </button>
         <button onClick={() => window.open(image.url, '_blank')} className="flex flex-col items-center gap-1 hover:text-white text-white/70 transition-colors py-1 px-3 rounded-xl hover:bg-white/10" title="下载图片">
           <Download className="w-4 h-4" />
           <span className="text-[10px]">下载</span>
         </button>
         <div className="w-px h-6 bg-white/20" />
         <button onClick={onDelete} className="flex flex-col items-center gap-1 hover:text-red-400 text-white/70 transition-colors py-1 px-3 rounded-xl hover:bg-white/10" title="删除图片">
           <Trash2 className="w-4 h-4" />
           <span className="text-[10px]">删除</span>
         </button>
      </div>
    </motion.div>
  );
}

export function ImageView() {
  const { showChatHistory, setShowChatHistory } = useOutletContext<{ showChatHistory: boolean, setShowChatHistory: (v: boolean | ((prev: boolean) => boolean)) => void }>();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [ratio, setRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
  const [filteringImage, setFilteringImage] = useState<GeneratedImage | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([
    {
      id: "1",
      url: "https://image.pollinations.ai/prompt/cyberpunk%20robotic%20cat%20neon%20lights%20future%20city?width=1024&height=1024&nologo=true&seed=123",
      prompt: "一只赛博朋克风格的机器猫，霓虹灯光，未来城市背景",
      ratio: "1:1",
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: "2",
      url: "https://image.pollinations.ai/prompt/beautiful%20abstract%20digital%20art%20fluid%20colors?width=1024&height=1024&nologo=true&seed=456",
      prompt: "美丽的抽象数字艺术，流动的色彩",
      ratio: "16:9",
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      id: "3",
      url: "https://image.pollinations.ai/prompt/breathtaking%20mountain%20landscape%20at%20sunset%20golden%20hour?width=1024&height=1536&nologo=true&seed=789",
      prompt: "令人惊叹的日落山地风景，黄金时刻，高度详细",
      ratio: "2:3",
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: "4",
      url: "https://image.pollinations.ai/prompt/cute%20little%20anime%20girl%20reading%20a%20book%20under%20a%20tree%20ghibli%20style?width=1024&height=1024&nologo=true&seed=101",
      prompt: "一个可爱的动漫小女孩在树下看书，吉卜力风格",
      ratio: "1:1",
      timestamp: new Date(Date.now() - 1000 * 60 * 60)
    },
    {
      id: "5",
      url: "https://image.pollinations.ai/prompt/epic%20space%20battle%20with%20lasers%20and%20spaceships?width=1536&height=1024&nologo=true&seed=222",
      prompt: "史诗般的太空战，巨大的宇宙飞船和激光",
      ratio: "16:9",
      timestamp: new Date(Date.now() - 1000 * 60 * 90)
    },
    {
      id: "6",
      url: "https://image.pollinations.ai/prompt/cozy%20coffee%20shop%20interior%20raining%20outside?width=1024&height=1024&nologo=true&seed=333",
      prompt: "舒适的咖啡店内部，外面下着雨",
      ratio: "1:1",
      timestamp: new Date(Date.now() - 1000 * 60 * 120)
    },
    {
      id: "7",
      url: "https://image.pollinations.ai/prompt/magical%20forest%20with%20glowing%20mushrooms?width=1024&height=1536&nologo=true&seed=444",
      prompt: "发光蘑菇的神奇森林",
      ratio: "2:3",
      timestamp: new Date(Date.now() - 1000 * 60 * 150)
    },
    {
      id: "8",
      url: "https://image.pollinations.ai/prompt/futuristic%20sports%20car%20in%20tokyo%20neon?width=1536&height=1024&nologo=true&seed=555",
      prompt: "未来派跑车在东京霓虹灯街道上",
      ratio: "16:9",
      timestamp: new Date(Date.now() - 1000 * 60 * 180)
    }
  ]);
  const [sidebarSlot, setSidebarSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSidebarSlot(document.getElementById("sidebar-action-slot"));
  }, []);

  const [resolution, setResolution] = useState("1024x1024");
  const [customWidth, setCustomWidth] = useState("1024");
  const [customHeight, setCustomHeight] = useState("1024");

  const resolutionOptions = [
    { id: "1024x1024", label: "1024x1024" },
    { id: "1920x1080", label: "1920x1080" },
    { id: "1080x1920", label: "1080x1920" },
    { id: "custom", label: "自定义" },
  ];

  const historyItems = [
    { title: "赛博朋克机器猫" },
    { title: "写实风格的风景摄影" },
    { title: "未来城市夜景，霓虹灯" },
    { title: "一只可爱的金毛幼犬" },
    { title: "星空下的露营帐篷" },
    { title: "3D卡通风格宇航员" },
  ];

  const ratios = [
    { id: "1:1", label: "1:1", iconClass: "w-[18px] h-[18px]" },
    { id: "4:3", label: "4:3", iconClass: "w-[22px] h-[16px]" },
    { id: "3:4", label: "3:4", iconClass: "w-[16px] h-[22px]" },
    { id: "3:2", label: "3:2", iconClass: "w-[24px] h-[14px]" },
    { id: "16:9", label: "16:9", iconClass: "w-[28px] h-[16px]" },
    { id: "2:3", label: "2:3", iconClass: "w-[14px] h-[24px]" },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      const newImage = {
        id: Date.now().toString(),
        url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt || "beautiful abstract digital art")}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 10000)}`,
        prompt: prompt || "beautiful abstract digital art",
        ratio,
        timestamp: new Date()
      };
      setImages((prev) => [newImage, ...prev]);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-row-reverse gap-6 p-6 h-full overflow-hidden">
      {/* Parameter Panel */}
      <div className={cn(
        "flex-shrink-0 flex flex-col glass-panel h-full overflow-hidden mb-0 transition-all duration-300",
        showRightPanel ? "w-[340px]" : "w-0 border-none mr-0 opacity-0 bg-transparent"
      )}>
        <div className="px-5 py-4 border-b border-white/40 flex-shrink-0 flex items-center justify-between bg-white/20 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-slate-800 text-[15px]">图像配置</h2>
          </div>
          <button 
            onClick={() => setShowRightPanel(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/50 transition-colors"
            title="收起侧边栏"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          {/* Prompt Area */}
          <div className="p-6 border-b border-black/5 flex flex-col gap-4 bg-white/40 mb-1">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">画面描述</h3>
              <button 
                onClick={() => setShowChatHistory(!showChatHistory)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  showChatHistory 
                    ? "text-primary bg-primary/10" 
                    : "text-slate-500 hover:bg-white/50"
                )}
                title="历史记录"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <textarea
                className="w-full h-24 glass-input rounded-xl p-3 text-sm resize-none custom-scrollbar"
                placeholder="输入具体的画面描述，例如：一只赛博朋克风格的机器猫，霓虹灯光，未来城市背景..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                {prompt.length}/1000
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-slate-700">反向提示词</h4>
                <span className="text-xs text-slate-400">可选</span>
              </div>
              <input
                type="text"
                className="w-full glass-input rounded-lg px-3 py-2 text-sm"
                placeholder="不想出现在画面中的元素..."
              />
            </div>
          </div>

          {/* Upload Reference Image */}
          <div className="p-6 border-b border-black/5 flex flex-col gap-4 bg-white/40 mb-1">
            <h3 className="font-semibold text-slate-800">上传参考图片</h3>
            <button 
              onClick={() => toast("打开文件选择器...")}
              className="border-2 border-dashed border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 hover:border-slate-300 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex items-center justify-center mb-2">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors stroke-[2]" />
              </div>
              <p className="text-[15px] font-medium text-slate-800 mb-1.5">点击或拖拽上传图片</p>
            </button>
          </div>

        {/* Scrollable Parameters Area */}
        <div className="flex flex-col min-h-0 pb-6">
          <div className="p-6 pb-3 shrink-0">
            <h3 className="font-semibold text-slate-800">生成参数</h3>
          </div>
          <div className="px-6 pt-2 flex flex-col gap-6">
            {/* Aspect Ratio */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">画面比例</h4>
              <div className="grid grid-cols-3 gap-2">
                {ratios.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRatio(r.id)}
                    className={cn(
                      "glass-input flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                      ratio === r.id
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "border-2 border-current rounded-[4px]",
                        r.iconClass
                      )}
                    />
                    <span className="text-xs">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">画面分辨率</h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {resolutionOptions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setResolution(r.id)}
                    className={cn(
                      "glass-input flex items-center justify-center p-2.5 rounded-xl border transition-all",
                      resolution === r.id
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <span className="text-xs font-medium">{r.label}</span>
                  </button>
                ))}
              </div>
              
              {resolution === "custom" && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">宽度 (W)</span>
                    <input 
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="w-full glass-input rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder="如: 1024"
                    />
                  </div>
                  <span className="text-slate-300 font-medium mt-5">×</span>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">高度 (H)</span>
                    <input 
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      className="w-full glass-input rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder="如: 1024"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Style Presets */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-slate-700">风格预设</h4>
                <button className="text-xs text-primary hover:underline">
                  查看全部
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["写实摄影", "赛博朋克", "二次元", "水墨风", "3D渲染", "极简主义"].map(
                  (style, i) => (
                    <button
                      key={style}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs transition-colors border",
                        i === 0
                          ? "bg-primary text-white border-primary"
                          : "glass-input text-slate-600 hover:text-slate-900 border-transparent"
                      )}
                    >
                      {style}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="pt-4 border-t border-slate-200/50">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex justify-between items-center text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                高级设置 (Seed, 采样步数)
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm text-slate-600">Seed</h4>
                      <span className="text-xs text-slate-400">随机: -1</span>
                    </div>
                    <input
                      type="number"
                      className="w-full glass-input rounded-lg px-3 py-2 text-sm"
                      placeholder="输入种子数..."
                      defaultValue="-1"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm text-slate-600">采样步数 (Steps)</h4>
                      <span className="text-xs text-primary font-medium">20</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      defaultValue="20"
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                      <span>1</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {sidebarSlot && createPortal(
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full h-11 bg-primary text-white rounded-xl shadow-md hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:brightness-100"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
          ) : (
            <Wand2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold whitespace-nowrap">{isGenerating ? "生成中..." : "开始生图"}</span>
        </button>,
        sidebarSlot
      )}

      {/* Main Generation Canvas */}
      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="h-16 border-b border-slate-200/50 flex items-center justify-between px-6 bg-white/40">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">生成结果</h2>
            {isGenerating && (
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                进行中...
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!showRightPanel && (
              <button 
                onClick={() => setShowRightPanel(true)} 
                className="glass-input px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
                title="打开配置"
              >
                <Settings2 className="w-4 h-4" />
                配置
              </button>
            )}
            <button 
              onClick={() => {
                if (images.length === 0) {
                  toast.error("没有可下载的图片");
                  return;
                }
                toast.success(`已开始批量下载 ${images.length} 张图片`);
              }}
              className="glass-input px-4 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              批量下载
            </button>
            <button 
              onClick={() => {
                if (images.length === 0) {
                  toast.error("没有可分享的内容");
                  return;
                }
                navigator.clipboard.writeText(window.location.href);
                toast.success("分享链接已复制到剪贴板！");
              }}
              className="glass-input px-4 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              分享
            </button>
          </div>
        </div>

        {/* Result Canvas */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          <div className="columns-1 sm:columns-2 xl:columns-3 2xl:columns-4 gap-6 space-y-6">
            
            {isGenerating && (
              <div className="break-inside-avoid glass-panel overflow-hidden border-2 border-primary/30 flex flex-col items-center justify-center gap-4 relative min-h-[300px] shadow-sm">
                <div className="w-16 h-16 border-4 border-slate-200 rounded-full border-t-primary animate-spin" />
                <div className="text-center">
                  <p className="font-semibold text-primary">正在生成中...</p>
                  <p className="text-xs text-slate-500 mt-1">AI 正在绘制您的画面...</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200">
                  <div className="h-full bg-primary w-[78%] transition-all duration-300" />
                </div>
              </div>
            )}

            {images.map(image => (
              <motion.div layoutId={`card-${image.id}`} key={image.id} className="break-inside-avoid glass-panel overflow-hidden group relative flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 border-white/80">
                <div className="relative overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer" onClick={() => setFullscreenImage(image)}>
                  <motion.img
                    layoutId={`img-${image.id}`}
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Overlay for interaction feedback */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"></div>

                  {/* Overlay Tool Actions (Top Right) */}
                  <div className="absolute top-2 bottom-2 right-2 flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none custom-scrollbar overflow-y-auto pb-1">
                    <button onClick={(e) => { e.stopPropagation(); setFilteringImage(image); }} className="w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-xl bg-white/90 text-slate-700 hover:text-green-600 hover:bg-white transition-colors backdrop-blur-md shadow-sm pointer-events-auto" title="图片编辑">
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingImage(image); }} className="w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-xl bg-white/90 text-slate-700 hover:text-blue-600 hover:bg-white transition-colors backdrop-blur-md shadow-sm pointer-events-auto" title="涂抹修改">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      toast.success("开始生成变体...");
                      handleGenerate();
                    }} className="w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-xl bg-white/90 text-slate-700 hover:text-purple-600 hover:bg-white transition-colors backdrop-blur-md shadow-sm pointer-events-auto" title="变体生成">
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toast.success("开始下载图片"); }} className="w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-xl bg-white/90 text-slate-700 hover:text-blue-600 hover:bg-white transition-colors backdrop-blur-md shadow-sm pointer-events-auto" title="下载图片">
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setImages(prev => prev.filter(img => img.id !== image.id));
                        toast.error("图片已删除");
                      }}
                      className="w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-xl bg-white/90 text-slate-700 hover:text-red-500 hover:bg-white transition-colors backdrop-blur-md shadow-sm pointer-events-auto" title="删除图片"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white/60 border-t border-slate-200/50 flex flex-col gap-2 backdrop-blur-md">
                   <p className="text-sm font-medium text-slate-800 line-clamp-2" title={image.prompt}>
                     {image.prompt}
                   </p>
                   <div className="flex justify-between items-center mt-1">
                     <span className="text-xs text-slate-500 font-medium">{image.ratio === "custom" ? "自定义" : image.ratio} • {image.timestamp.toLocaleTimeString()}</span>
                   </div>
                </div>
              </motion.div>
            ))}
            
            {images.length === 0 && !isGenerating && (
              <div className="hidden"></div>
            )}

          </div>
          
          {images.length === 0 && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
              <ImageIcon className="w-16 h-16 opacity-30 mx-auto" />
              <p>在左侧输入画面描述，开始生成您的第一张作品</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {fullscreenImage && (
          <FullscreenOverlay 
            image={fullscreenImage} 
            onClose={() => setFullscreenImage(null)}
            onEdit={() => {
              setEditingImage(fullscreenImage);
              setFullscreenImage(null);
            }}
            onPhotoEdit={() => {
              setFilteringImage(fullscreenImage);
              setFullscreenImage(null);
            }}
            onDelete={() => {
              setImages(prev => prev.filter(img => img.id !== fullscreenImage.id));
              setFullscreenImage(null);
              toast.error("图片已删除");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingImage && (
          <ImageEditorInner 
            image={editingImage} 
            onClose={() => setEditingImage(null)} 
            onConfirm={(prompt) => {
               setEditingImage(null);
               setPrompt(prompt);
               handleGenerate();
               toast.success("已提交涂抹修改任务");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {filteringImage && (
          <PhotoEditorInner 
            image={filteringImage} 
            onClose={() => setFilteringImage(null)} 
            onSave={(newUrl) => {
               const newImg: GeneratedImage = {
                 ...filteringImage,
                 id: Math.random().toString(36).substring(7),
                 url: newUrl,
                 timestamp: new Date()
               };
               setImages((prev) => [newImg, ...prev]);
               setFilteringImage(null);
               toast.success("已保存图片修改");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
