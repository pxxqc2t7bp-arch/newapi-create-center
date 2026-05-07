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
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Crop as CropIcon } from 'lucide-react';
import { EditableValue, GlassSlider } from "@/components/ui/controls";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  ratio: string;
  timestamp: Date;
}


function UnifiedEditorInner({ image, onClose, onConfirm, onSave }: { image: GeneratedImage, onClose: () => void, onConfirm: (prompt: string) => void, onSave: (url: string) => void }) {
  const [mode, setMode] = useState<"inpaint" | "adjust" | "crop">("inpaint");

  // Inpaint State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [editPrompt, setEditPrompt] = useState(image.prompt);

  // Photo Edit State
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [blur, setBlur] = useState(0);

  // Crop State
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImage = async () => {
    const imageToCrop = imgRef.current;
    if (!imageToCrop || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imageToCrop.naturalWidth / imageToCrop.width;
    const scaleY = imageToCrop.naturalHeight / imageToCrop.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(
      imageToCrop,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    onSave(canvas.toDataURL('image/jpeg', 0.9));
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
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
  };

  const applyFilters = () => {
    if (mode !== "adjust") return;
    const canvas = filterCanvasRef.current;
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
  }, [brightness, contrast, saturate, blur, image.url, mode]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-slate-50 flex flex-col"
    >
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
         {/* Sidebar */}
         <div className="w-full md:w-[340px] bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col overflow-y-auto custom-scrollbar shrink-0 shadow-lg relative z-10 md:h-full max-h-[50vh] md:max-h-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 shrink-0">
              <button onClick={onClose} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                <span className="font-medium text-sm">返回图库</span>
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6 shrink-0 flex-wrap">
              <button 
                onClick={() => setMode("inpaint")}
                className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 min-w-[70px]", mode === "inpaint" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <Edit2 className="w-4 h-4" />
                局部修改
              </button>
              <button 
                onClick={() => setMode("adjust")}
                className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 min-w-[70px]", mode === "adjust" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <Settings2 className="w-4 h-4" />
                参数调整
              </button>
              <button 
                onClick={() => setMode("crop")}
                className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 min-w-[70px]", mode === "crop" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <CropIcon className="w-4 h-4" />
                图像裁切
              </button>
            </div>

            {mode === "inpaint" ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="shrink-0 mb-6">
                  <h3 className="font-medium text-slate-800 mb-2 text-sm">1. 涂抹需要修改的区域</h3>
                  <p className="text-xs text-slate-500 mb-4">在右侧图像上涂抹想要重新生成的部分。</p>
                  
                  <div className="space-y-4 bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">画笔粗细</span>
                        <EditableValue value={brushSize} onChange={setBrushSize} min={5} max={100} unit="px" />
                      </div>
                      <GlassSlider value={brushSize} onChange={setBrushSize} min={5} max={100} colorClass="text-blue-500" />
                    </div>
                    <button 
                      onClick={clearCanvas}
                      className="w-full py-2 flex items-center justify-center gap-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-red-500 transition-colors bg-white shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />清除涂抹区域
                    </button>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 shrink-0 mb-6" />

                <div className="flex-1 flex flex-col min-h-0">
                  <h3 className="font-medium text-slate-800 mb-2 text-sm shrink-0">2. 重新描述该区域</h3>
                  <p className="text-xs text-slate-500 mb-4 shrink-0">输入提示词告诉 AI 涂抹区域应该变成什么样。</p>
                  <textarea
                     className="w-full flex-1 min-h-[120px] px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all custom-scrollbar placeholder:text-slate-400 leading-relaxed mb-6"
                     value={editPrompt}
                     onChange={(e) => setEditPrompt(e.target.value)}
                     placeholder="例如：把这里变成一只戴着墨镜的狗..."
                  />
                </div>
              </div>
            ) : mode === "adjust" ? (
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="font-medium text-slate-800 mb-4 text-sm shrink-0">编辑参数</h3>
                
                <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-2">
                  <div className="bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-700">亮度 (Brightness)</span>
                      <EditableValue value={brightness} onChange={setBrightness} min={0} max={200} unit="%" />
                    </div>
                    <GlassSlider value={brightness} onChange={setBrightness} min={0} max={200} colorClass="text-green-500" />
                  </div>

                  <div className="bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-700">对比度 (Contrast)</span>
                      <EditableValue value={contrast} onChange={setContrast} min={0} max={200} unit="%" />
                    </div>
                    <GlassSlider value={contrast} onChange={setContrast} min={0} max={200} colorClass="text-green-500" />
                  </div>

                  <div className="bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-700">饱和度 (Saturation)</span>
                      <EditableValue value={saturate} onChange={setSaturate} min={0} max={200} unit="%" />
                    </div>
                    <GlassSlider value={saturate} onChange={setSaturate} min={0} max={200} colorClass="text-green-500" />
                  </div>

                  <div className="bg-white/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-700">模糊 (Blur)</span>
                      <EditableValue value={blur} onChange={setBlur} min={0} max={20} unit="px" />
                    </div>
                    <GlassSlider value={blur} onChange={setBlur} min={0} max={20} colorClass="text-green-500" />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3 shrink-0">
                   <button onClick={() => {
                     setBrightness(100);
                     setContrast(100);
                     setSaturate(100);
                     setBlur(0);
                   }} className="flex-1 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                     重置
                   </button>
                   <button onClick={() => {
                     if (filterCanvasRef.current) {
                       onSave(filterCanvasRef.current.toDataURL('image/jpeg', 0.9));
                     }
                   }} className="flex-[2] py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-500/20">
                     保存修改
                   </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="font-medium text-slate-800 mb-4 text-sm shrink-0">图像裁切</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">请在右侧拖动选择框或调整四角控制点进行裁切。</p>
                <div className="flex-1"></div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3 shrink-0">
                   <button onClick={() => {
                     setCrop(undefined);
                     setCompletedCrop(undefined);
                   }} className="flex-1 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                     重置
                   </button>
                   <button onClick={() => {
                     getCroppedImage();
                   }} className="flex-[2] py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20">
                     保存裁切
                   </button>
                </div>
              </div>
            )}
         </div>
         
         {/* Canvas Area */}
         <div className="flex-1 relative bg-slate-100 overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            {mode === "inpaint" && (
              <button 
                onClick={() => onConfirm(editPrompt)} 
                className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-3.5 bg-blue-600 text-white text-base font-medium rounded-full hover:bg-blue-700 transition-colors shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 z-20 hover:-translate-y-0.5 border border-blue-500"
              >
                 <Sparkles className="w-5 h-5" />
                 开始生成修改
              </button>
            )}

            {mode === "inpaint" ? (
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
                  onTouchStart={(e) => { e.preventDefault(); startDrawing(e); }}
                  onTouchMove={(e) => { e.preventDefault(); draw(e); }}
                  onTouchEnd={stopDrawing}
                />
              </div>
            ) : mode === "adjust" ? (
              <div className="relative shadow-2xl rounded-sm overflow-hidden flex items-center justify-center" style={{ maxHeight: '100%', maxWidth: '100%' }}>
                <canvas 
                  ref={filterCanvasRef}
                  className="max-w-full max-h-full object-contain"
                  style={{ maxHeight: 'calc(100vh - 8rem)' }}
                />
              </div>
            ) : (
              <div className="relative shadow-2xl rounded-sm overflow-hidden flex items-center justify-center" style={{ maxHeight: 'calc(100vh - 8rem)', maxWidth: '100%' }}>
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  className="max-w-full max-h-full"
                >
                  <img
                    ref={imgRef}
                    src={image.url}
                    crossOrigin="anonymous"
                    className="block max-w-full max-h-[calc(100vh-8rem)] object-contain select-none"
                    alt="Crop area"
                  />
                </ReactCrop>
              </div>
            )}
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
  onDelete
}: { 
  image: GeneratedImage; 
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow right click save
    };
    
    // Zoom with Ctrl + scroll
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.005;
        // Restrict scale between 0.1 (10%) and 5.0 (500%)
        setZoomLevel(prev => Math.min(Math.max(0.1, prev + delta), 5));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with left mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart) return;
    e.stopPropagation();
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setDragStart(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.5, 0.1));
  };

  const resetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
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
      <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden" onClick={onClose}>
        <div
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`, 
            transition: isDragging ? 'none' : 'transform 0.2s ease-out', 
            transformOrigin: 'center' 
          }}
          className={cn(
            "flex items-center justify-center max-w-full max-h-full",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (zoomLevel === 1) {
              setZoomLevel(2);
            } else {
              setZoomLevel(1);
              setPan({ x: 0, y: 0 });
            }
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <motion.img
            layoutId={`img-${image.id}`}
            src={image.url}
            alt={image.prompt}
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm pointer-events-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full text-white/90 shadow-2xl z-20" onClick={(e) => e.stopPropagation()}>
         <div className="flex flex-col max-w-[300px] mr-4 hidden md:flex">
           <span className="text-sm font-medium truncate" title={image.prompt}>{image.prompt}</span>
           <span className="text-[10px] text-white/50">{image.ratio === "custom" ? "自定义" : image.ratio} • {image.timestamp.toLocaleTimeString()}</span>
         </div>
         <div className="w-px h-6 bg-white/20 hidden md:block" />
         
         <div className="flex items-center gap-1">
           <button onClick={handleZoomOut} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white" title="缩小">
             <ZoomOut className="w-4 h-4" />
           </button>
           <button onClick={resetZoom} className="px-3 py-1 font-mono text-sm hover:bg-white/20 rounded-lg transition-colors min-w-[60px] text-center" title="重置缩放">
             {Math.round(zoomLevel * 100)}%
           </button>
           <button onClick={handleZoomIn} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white" title="放大">
             <ZoomIn className="w-4 h-4" />
           </button>
         </div>

         <div className="w-px h-6 bg-white/20" />

         <button onClick={onEdit} className="flex flex-col items-center gap-1 hover:text-white text-white/70 transition-colors py-1 px-3 rounded-xl hover:bg-white/10" title="高级编辑">
           <Edit2 className="w-4 h-4" />
           <span className="text-[10px]">编辑</span>
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
  const [steps, setSteps] = useState(20);
  const [seed, setSeed] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
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
      const randomSeed = Math.floor(Math.random() * 10000);
      const usedSeed = seed === -1 ? randomSeed : seed;
      const newImage = {
        id: Date.now().toString(),
        url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt || "beautiful abstract digital art")}?width=1024&height=1024&nologo=true&seed=${usedSeed}`,
        prompt: prompt || "beautiful abstract digital art",
        ratio,
        timestamp: new Date()
      };
      setImages((prev) => [newImage, ...prev]);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 h-full overflow-hidden relative">
      {/* Main Generation Canvas */}
      <div className="flex-1 glass-panel border-white/40 flex flex-col min-h-0 overflow-hidden relative bg-slate-900/5 backdrop-blur-sm shadow-2xl">
        {/* Header */}
        <div className="h-16 absolute top-0 w-full flex items-center justify-between px-6 z-20 bg-gradient-to-b from-white/90 via-white/80 to-transparent">
          <div className="flex items-center gap-3">
            <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">生成结果</h2>
            {isGenerating && (
              <span className="text-[10px] md:text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold shadow-sm border border-primary/20">
                生成中...
              </span>
            )}
          </div>
          <div className="flex gap-2.5">
            {!showRightPanel && (
              <button 
                onClick={() => setShowRightPanel(true)} 
                className="h-8 px-4 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-2xl flex items-center gap-2 justify-center text-slate-600 text-xs transition-all border border-white/60 shadow-lg active:scale-95"
                title="打开配置"
              >
                <Settings2 className="w-3.5 h-3.5 opacity-70" />
                <span>配置</span>
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
              className="h-8 px-4 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-2xl flex items-center gap-2 justify-center text-slate-600 text-xs transition-all border border-white/60 shadow-lg active:scale-95"
            >
              <Download className="w-3.5 h-3.5 opacity-70" />
              <span>下载</span>
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
              className="w-8 h-8 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-2xl flex items-center justify-center text-slate-600 transition-all border border-white/60 shadow-lg active:scale-90"
            >
              <Share className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>

        {/* Result Canvas */}
        <div className="flex-1 overflow-y-auto pt-20 p-4 md:p-8 custom-scrollbar bg-slate-50/20 shadow-[inset_0_0_80px_rgba(0,0,0,0.03)]">
          <div className="columns-1 sm:columns-2 xl:columns-3 2xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
            
            {isGenerating && (
              <div className="break-inside-avoid glass-panel rounded-3xl overflow-hidden border-2 border-primary/30 flex flex-col items-center justify-center gap-6 relative min-h-[300px] shadow-2xl bg-white/40 backdrop-blur-md">
                <div className="w-16 h-16 border-4 border-slate-200/50 rounded-full border-t-primary animate-spin" />
                <div className="text-center px-6">
                  <p className="font-bold text-primary tracking-tight text-lg">正在生成中...</p>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">AI 正在根据您的创意进行艺术创作...</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100">
                  <div className="h-full bg-primary/80 w-[78%] transition-all duration-300 animate-pulse" />
                </div>
              </div>
            )}

            {images.map(image => (
              <motion.div 
                layoutId={`card-${image.id}`} 
                key={image.id} 
                className="break-inside-avoid glass-panel rounded-3xl overflow-hidden group relative flex flex-col shadow-lg hover:shadow-2xl transition-all duration-500 border-white/60 bg-white/40 backdrop-blur-md"
              >
                <div className="relative overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer" onClick={() => setFullscreenImage(image)}>
                  <motion.img
                    layoutId={`img-${image.id}`}
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Overlay for interaction feedback */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  {/* Overlay Tool Actions (Top Right) */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditingImage(image); }} className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/80 text-slate-700 hover:text-primary hover:bg-white transition-all backdrop-blur-3xl shadow-xl border border-white/40 active:scale-90" title="高级编辑">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      toast.success("开始生成变体...");
                      handleGenerate();
                    }} className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/80 text-slate-700 hover:text-purple-600 hover:bg-white transition-all backdrop-blur-3xl shadow-xl border border-white/40 active:scale-90" title="变体生成">
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toast.success("开始下载图片"); window.open(image.url, '_blank'); }} className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/80 text-slate-700 hover:text-primary hover:bg-white transition-all backdrop-blur-3xl shadow-xl border border-white/40 active:scale-90" title="下载图片">
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setImages(prev => prev.filter(img => img.id !== image.id));
                        toast.error("图片已删除");
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/80 text-slate-400 hover:text-red-500 hover:bg-white transition-all backdrop-blur-3xl shadow-xl border border-white/40 active:scale-90" title="删除图片"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-5 bg-white/5 border-t border-white/10 flex flex-col gap-3 backdrop-blur-3xl">
                   <p className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2 tracking-tight" title={image.prompt}>
                     {image.prompt}
                   </p>
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{image.ratio === "custom" ? "自定义" : image.ratio} • {image.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {images.length === 0 && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center gap-6 text-slate-300">
              <div className="w-24 h-24 rounded-full bg-white/40 border border-white/60 flex items-center justify-center shadow-inner">
                <ImageIcon className="w-10 h-10 opacity-30" />
              </div>
              <p className="text-sm font-medium">在右侧输入画面描述，开启您的生成艺术之旅</p>
            </div>
          )}
        </div>
      </div>

      {/* Parameter Panel */}
      <div className={cn(
        "flex-shrink-0 flex flex-col h-full overflow-hidden mb-0 transition-all duration-500 md:relative absolute right-0 top-0 bottom-0 z-40 md:z-auto border-l md:border-l-0 border-white/20 shadow-2xl bg-white/10 backdrop-blur-2xl relative",
        showRightPanel ? "w-full sm:w-[340px] md:w-[340px] opacity-100 translate-x-0" : "w-0 border-none opacity-0 translate-x-10 pointer-events-none"
      )}>
        <div className="px-6 py-5 border-b border-white/10 flex-shrink-0 flex items-center justify-between bg-white/5 backdrop-blur-3xl relative z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner ring-1 ring-primary/20">
              <Settings2 className="w-4.5 h-4.5" />
            </div>
            <h2 className="font-bold text-slate-800 text-base tracking-tight">图像配置</h2>
          </div>
          <button 
            onClick={() => setShowRightPanel(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white/20 transition-all border border-transparent hover:border-white/20 active:scale-90"
            title="收起侧边栏"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative mb-24">
          {/* Prompt Area */}
          <div className="flex flex-col shrink-0 border-b border-white/10 relative">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-3xl relative z-10 sticky top-0">
              <h3 className="font-bold text-slate-800 text-[13px] tracking-wide uppercase opacity-70">画面描述</h3>
              <button 
                onClick={() => setShowChatHistory(!showChatHistory)}
                className={cn(
                  "p-2 rounded-xl transition-all flex items-center justify-center border",
                  showChatHistory 
                    ? "text-primary bg-primary/10 border-primary/20 shadow-inner" 
                    : "text-slate-400 border-transparent hover:bg-white/20 hover:text-slate-700"
                )}
                title="历史记录"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="relative">
                <textarea
                  className="w-full bg-white/30 border border-white/60 focus:bg-white/50 focus:border-primary/50 focus:shadow-2xl focus:ring-0 rounded-2xl p-4 text-[13px] leading-relaxed text-slate-700 resize-none h-32 shadow-inner custom-scrollbar transition-all duration-500 outline-none placeholder:text-slate-300"
                  placeholder="描述你想要的震撼场景，例如：一只赛博朋克风格的机器猫..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-400 tabular-nums">
                  {prompt.length}/1000
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block flex items-center justify-between">
                  <span>反向提示词 (Negative)</span>
                  <span className="text-[9px] opacity-60 font-medium normal-case">(可选)</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-white/30 border border-white/60 focus:bg-white/50 focus:border-primary/50 focus:shadow-xl focus:ring-0 rounded-xl px-4 py-3 text-[12px] text-slate-700 outline-none shadow-inner transition-all duration-500 placeholder:text-slate-300"
                  placeholder="不想出现在画面中的元素..."
                />
              </div>
            </div>
          </div>

          {/* Section: Image Reference */}
          <div className="flex flex-col shrink-0 border-b border-white/10 relative">
            <div className="flex items-center px-6 py-4 bg-white/5 backdrop-blur-3xl sticky top-0 z-10 border-b border-white/10">
              <ImagePlus className="w-4 h-4 text-slate-400 mr-2.5" />
              <h3 className="font-bold text-slate-800 text-[13px] tracking-wide uppercase opacity-70">参考图像</h3>
            </div>
            <div className="p-6">
              <button 
                onClick={() => toast("打开文件选择器...")}
                className="w-full border-2 border-dashed border-slate-200 bg-white/20 backdrop-blur-xl rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/40 hover:border-primary/50 transition-all duration-500 cursor-pointer group focus:outline-none focus:ring-4 focus:ring-primary/10 hover:shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-primary/30 group-hover:-translate-y-1">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-white transition-all" />
                </div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">拖拽或点击上传图片</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium italic">作为 AI 绘图的视觉参考</p>
              </button>
            </div>
          </div>

          {/* Section: Generation Options */}
          <div className="flex flex-col shrink-0 pb-6">
            <div className="flex items-center px-6 py-4 bg-white/5 backdrop-blur-3xl sticky top-0 z-10 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-slate-400 mr-2.5" />
              <h3 className="font-bold text-slate-800 text-[13px] tracking-wide uppercase opacity-70">生成参数</h3>
            </div>
            <div className="p-6 flex flex-col gap-6">
              {/* Aspect Ratio */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">画面比例 (Aspect Ratio)</label>
                <div className="grid grid-cols-3 gap-3">
                  {ratios.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRatio(r.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 py-3 rounded-2xl transition-all duration-500 cursor-pointer font-bold shadow-sm backdrop-blur-xl border-2",
                        ratio === r.id
                          ? "bg-primary text-white border-white/30 shadow-[0_8px_20px_rgba(var(--primary-rgb),0.3)] -translate-y-0.5"
                          : "bg-white/20 border-white/60 text-slate-500 hover:bg-white/40 hover:text-slate-800 hover:border-white active:scale-95"
                      )}
                    >
                      <div className={cn("border-2 border-current rounded-[4px] transition-all", r.iconClass)} />
                      <span className="text-[11px] tracking-tight">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">画面分辨率</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {resolutionOptions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setResolution(r.id)}
                      className={cn(
                        "flex items-center justify-center py-3 rounded-2xl transition-all duration-500 cursor-pointer font-bold shadow-sm backdrop-blur-xl border-2",
                        resolution === r.id
                          ? "bg-primary text-white border-white/30 shadow-[0_8px_20px_rgba(var(--primary-rgb),0.3)] -translate-y-0.5"
                          : "bg-white/20 border-white/60 text-slate-500 hover:bg-white/40 hover:text-slate-800 hover:border-white active:scale-95"
                      )}
                    >
                      <span className="text-xs">{r.label}</span>
                    </button>
                  ))}
                </div>
                
                {resolution === "custom" && (
                  <div className="flex items-center gap-4 animate-in fade-in zoom-in-95 duration-500 mb-4 px-1">
                    <div className="flex-1">
                      <input 
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="w-full bg-white/40 border border-white/60 focus:bg-white/60 focus:border-primary/40 rounded-2xl px-4 py-3 text-xs text-slate-700 outline-none shadow-sm transition-all shadow-inner"
                        placeholder="宽"
                      />
                    </div>
                    <span className="text-slate-300 font-black">×</span>
                    <div className="flex-1">
                      <input 
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="w-full bg-white/40 border border-white/60 focus:bg-white/60 focus:border-primary/40 rounded-2xl px-4 py-3 text-xs text-slate-700 outline-none shadow-sm transition-all shadow-inner"
                        placeholder="高"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Settings */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 group transition-colors"
                >
                  高级设置 (Seed, Steps)
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  ) : (
                    <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-5 flex flex-col gap-6">
                    <div className="bg-white/30 backdrop-blur-2xl p-5 rounded-3xl border border-white/60 shadow-xl">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[13px] font-bold text-slate-700">随机种子 (Seed)</h4>
                        <span className="text-[10px] bg-white/40 px-2 py-0.5 rounded-full text-slate-500 font-bold border border-white/40 tabular-nums">{seed === -1 ? "RANDOM" : seed}</span>
                      </div>
                      <input
                        type="number"
                        className="w-full bg-white/40 border border-white/60 focus:bg-white/60 focus:border-primary/50 focus:shadow-xl focus:ring-0 rounded-2xl px-4 py-3 text-sm text-slate-700 transition-all outline-none shadow-inner"
                        placeholder="输入固定种子数..."
                        value={seed === -1 ? "" : seed}
                        onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : -1)}
                      />
                    </div>
                    <div className="bg-white/30 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 shadow-xl transition-all hover:bg-white/40 group/card">
                      <div className="flex justify-between items-center mb-5">
                        <h4 className="text-sm font-bold text-slate-700 tracking-tight">采样步数 (Steps)</h4>
                        <EditableValue value={Math.round(steps)} onChange={setSteps} min={1} max={50} />
                      </div>
                      <GlassSlider value={steps} onChange={setSteps} min={1} max={50} colorClass="text-primary" />
                      <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        <span>Fast</span>
                        <span>Quality</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer Action Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/95 via-white/80 to-transparent backdrop-blur-xl border-t border-white/10 z-30">
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full h-14 bg-primary text-white rounded-[24px] shadow-[0_12px_24px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_16px_32px_rgba(var(--primary-rgb),0.5)] hover:-translate-y-1 hover:brightness-110 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group px-4 overflow-hidden relative disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {isGenerating ? (
              <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5 flex-shrink-0 group-hover:rotate-12 transition-transform duration-500" />
            )}
            <span className="text-base font-bold tracking-tight">{isGenerating ? "正在艺术创作中..." : "开始生图"}</span>
          </button>
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
          <UnifiedEditorInner 
            image={editingImage} 
            onClose={() => setEditingImage(null)} 
            onConfirm={(prompt) => {
               setEditingImage(null);
               setPrompt(prompt);
               handleGenerate();
               toast.success("已提交涂抹修改任务");
            }}
            onSave={(newUrl) => {
               const newImg: GeneratedImage = {
                 ...editingImage,
                 id: Math.random().toString(36).substring(7),
                 url: newUrl,
                 timestamp: new Date()
               };
               setImages((prev) => [newImg, ...prev]);
               setEditingImage(null);
               toast.success("已保存图片修改");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
