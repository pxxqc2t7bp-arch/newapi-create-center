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
  Download,
  Share2,
  Scissors,
  Crop,
  Layers,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EditableValue, GlassSlider } from "@/components/ui/controls";
import { motion, AnimatePresence } from "motion/react";

export function VideoView() {
  const { showChatHistory, setShowChatHistory } = useOutletContext<{ showChatHistory: boolean, setShowChatHistory: (v: boolean | ((prev: boolean) => boolean)) => void }>();
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    settings: true,
    motion: true,
  });

  const [resolution, setResolution] = useState("1080p");
  const [customWidth, setCustomWidth] = useState("1920");
  const [customHeight, setCustomHeight] = useState("1080");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState("5s");
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
    { id: "5s", label: "5秒" },
    { id: "8s", label: "8秒" },
    { id: "custom", label: "自定义" },
  ];

  // Use a more reliable public video source
  const [videoUrl, setVideoUrl] = useState("https://vjs.zencdn.net/v/oceans.mp4");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  // Clips state
  const [videoClips, setVideoClips] = useState([
    { id: 'v1', startTime: 0, duration: 5, sourceStart: 0, name: 'Main_Sequence.mp4', track: 'V1' }
  ]);
  const [audioClips, setAudioClips] = useState([
    { id: 'a1', startTime: 0.5, duration: 8, sourceStart: 0, name: 'BGM_Cinematic.mp3', track: 'A1' }
  ]);

  const timelineRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoError = () => {
    toast.error("视频源加载失败，尝试切换备用源...");
    // Fallback if needed
    if (videoUrl !== "https://www.w3schools.com/html/mov_bbb.mp4") {
       setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
    }
  };

  // Calculate total project duration based on settings or clips
  const selectedDurationValue = duration === "custom" 
    ? parseFloat(customDuration) || 5 
    : parseFloat(duration.replace("s", "")) || 5;

  const projectDuration = Math.max(
    selectedDurationValue,
    ...videoClips.map(c => c.startTime + c.duration),
    ...audioClips.map(c => c.startTime + c.duration)
  );

  const formatTime = (time: number) => {
    const totalSeconds = Math.floor(time);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const ms = Math.floor((time % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Sync video content with current timeline position
  const syncVideoToTimeline = useCallback((time: number) => {
    if (!videoRef.current) return;
    
    // Find active clip at this time
    const activeClip = videoClips.find(c => time >= c.startTime && time < c.startTime + c.duration);
    
    if (activeClip) {
      const offsetInClip = time - activeClip.startTime;
      const contentDuration = videoRef.current.duration || 4;
      const contentTime = (activeClip.sourceStart + offsetInClip) % contentDuration;
      
      // Update if difference is significant or if we are seeking manually
      if (Math.abs(videoRef.current.currentTime - contentTime) > 0.1 || !isPlaying) {
        videoRef.current.currentTime = contentTime;
      }
      
      if (isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      // Pause video if no clip is active
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [videoClips, isPlaying]);

  const hasActiveVideo = videoClips.some(c => currentTime >= c.startTime && currentTime < c.startTime + c.duration);

  const handleSeek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(projectDuration, time));
    syncVideoToTimeline(clampedTime);
    setCurrentTime(clampedTime);
  }, [projectDuration, syncVideoToTimeline]);

  const handleTimelineInteraction = useCallback((clientX: number) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    
    // Label width is 56px (w-14)
    const labelWidth = 56;
    const x = Math.max(0, clientX - rect.left + scrollLeft - labelWidth);
    const totalWidth = timelineRef.current.scrollWidth - labelWidth;
    
    const percentage = x / totalWidth;
    handleSeek(percentage * projectDuration);
  }, [projectDuration, handleSeek]);

  const handleSplit = () => {
    // Split logic for video clips
    const newClips = [...videoClips];
    const clipIndex = newClips.findIndex(c => currentTime > c.startTime && currentTime < c.startTime + c.duration);
    
    if (clipIndex !== -1) {
      const clip = newClips[clipIndex];
      const firstPartDuration = currentTime - clip.startTime;
      const secondPartDuration = clip.duration - firstPartDuration;
      
      const newClip1 = { ...clip, duration: firstPartDuration };
      const newClip2 = { 
        ...clip, 
        id: Math.random().toString(36).substr(2, 9), 
        startTime: currentTime, 
        duration: secondPartDuration,
        sourceStart: clip.sourceStart + firstPartDuration
      };
      
      newClips.splice(clipIndex, 1, newClip1, newClip2);
      setVideoClips(newClips);
      toast.success("分镜已拆分");
    } else {
      toast.error("当前位置没有可拆分的素材");
    }
  };

  const updateClipPos = (id: string, type: 'video' | 'audio', newStart: number) => {
    const setter = type === 'video' ? setVideoClips : setAudioClips;
    setter(prev => prev.map(c => c.id === id ? { ...c, startTime: Math.max(0, newStart) } : c));
  };

  const updateClipDuration = (id: string, type: 'video' | 'audio', delta: number, side: 'left' | 'right') => {
    const setter = type === 'video' ? setVideoClips : setAudioClips;
    setter(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (side === 'left') {
        const potentialNewStart = c.startTime + delta;
        const boundedNewStart = Math.max(0, potentialNewStart);
        const actualDelta = boundedNewStart - c.startTime;
        const newDuration = Math.max(0.1, c.duration - actualDelta);
        
        // If duration hit limit, don't update sourceStart incorrectly
        if (newDuration <= 0.1 && actualDelta > 0) return c;

        return { 
          ...c, 
          startTime: boundedNewStart, 
          duration: newDuration,
          sourceStart: (c.sourceStart || 0) + actualDelta
        };
      } else {
        return { ...c, duration: Math.max(0.1, c.duration + delta) };
      }
    }));
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingPlayhead) {
        handleTimelineInteraction(e.clientX);
      }
    };
    const handleGlobalMouseUp = () => {
      setIsDraggingPlayhead(false);
    };

    if (isDraggingPlayhead) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingPlayhead, handleTimelineInteraction]);

  useEffect(() => {
    if (isPlaying && timelineRef.current) {
      const timeline = timelineRef.current;
      const playheadPos = (currentTime / projectDuration) * timeline.scrollWidth;
      const scrollThreshold = timeline.clientWidth * 0.8;
      
      if (playheadPos > timeline.scrollLeft + scrollThreshold) {
        timeline.scrollTo({
          left: playheadPos - timeline.clientWidth * 0.2,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime, isPlaying, projectDuration]);

  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(null);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      
      setCurrentTime(prev => {
        const nextTime = Math.min(projectDuration, prev + deltaTime);
        
        if (nextTime >= projectDuration) {
          if (videoRef.current) videoRef.current.pause();
          setIsPlaying(false);
          syncVideoToTimeline(projectDuration);
          return projectDuration;
        }
        
        syncVideoToTimeline(nextTime);
        return nextTime;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [projectDuration, syncVideoToTimeline]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, animate]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // If we're at the end, jump to start
        if (currentTime >= projectDuration) {
          handleSeek(0);
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    // We handle the timeline progression via animate ref now
    // but we can still use this to ensure video doesn't drift too much
    // if needed. For now, empty or basic check.
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      // We don't overwrite setVideoDuration if we want it to be dynamic based on clips
      // but we might want the first clip to take the video duration if it's new
    }
  };

  const handleSkip = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(projectDuration, videoRef.current.currentTime + amount));
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex-1 flex p-4 md:p-6 gap-4 md:gap-6 h-full overflow-hidden bg-transparent">
      {/* Center Main Stage */}
      <div className="flex-1 flex flex-col min-w-0 glass-panel overflow-hidden border-white/40 shadow-2xl relative bg-slate-900/5 backdrop-blur-sm">
        {/* Top Header inside stage */}
        <div className="h-[52px] absolute top-0 w-full flex items-center justify-between px-6 z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white drop-shadow-lg text-sm md:text-base">
              Project_Alpha_V1
            </span>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-2xl rounded-full text-[10px] text-white/90 border border-white/10 shadow-sm">
              1080p · 24fps
            </span>
          </div>
          <div className="flex gap-2.5">
            {!showRightPanel && (
              <button 
                onClick={() => setShowRightPanel(true)} 
                className="h-8 px-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-2xl flex items-center gap-2 justify-center text-white text-xs transition-all border border-white/10 shadow-lg active:scale-95"
                title="打开配置"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>配置</span>
              </button>
            )}
            <div className="flex bg-black/40 backdrop-blur-2xl rounded-full p-0.5 border border-white/10 shadow-xl">
              <button 
                onClick={() => toast.info("撤销操作")}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => toast.info("重做操作")}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-[1px] h-4 bg-white/20 mx-0.5 self-center" />
            <button 
              onClick={() => toast.success("视频正在准备下载...")}
              className="h-8 px-4 rounded-full bg-primary/90 backdrop-blur-2xl flex items-center gap-2 justify-center text-white text-xs hover:bg-primary transition-all border border-white/20 shadow-[0_4px_12px_rgba(var(--primary-rgb),0.3)] active:scale-95 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载</span>
            </button>
            <button 
              onClick={() => toast.info("生成分享链接...")}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-2xl flex items-center justify-center text-white transition-all border border-white/10 shadow-lg active:scale-90"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Video Stage / Preview */}
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center relative bg-black/40 overflow-hidden z-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]">
          <div className="w-full h-full flex flex-col items-center justify-center relative max-w-5xl mx-auto">
            <div className="w-full h-full max-h-full aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 relative group mx-auto">
              <video
                ref={videoRef}
                src={videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={handleVideoError}
                className={cn(
                  "w-full h-full object-contain transition-opacity duration-300",
                  hasActiveVideo ? "opacity-100" : "opacity-0"
                )}
              />
              {/* Black screen placeholder when no clip is active */}
              {!hasActiveVideo && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-pulse" />
                  </div>
                  <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">End of Scene</span>
                </div>
              )}
              {/* Play controls overlay */}
              <div className={cn(
                "absolute inset-0 bg-black/50 transition-all duration-500 flex items-center justify-center pointer-events-none group-hover:opacity-100",
                isPlaying ? "opacity-0 scale-105" : "opacity-100 scale-100"
              )}>
                <div className="bg-white/5 backdrop-blur-3xl rounded-full px-8 py-4 flex gap-8 items-center border border-white/20 shadow-2xl pointer-events-auto ring-1 ring-white/10">
                  <button 
                    onClick={() => handleSkip(-1)}
                    className="text-white/50 hover:text-white transition-all p-3 hover:bg-white/10 rounded-full active:scale-90 flex items-center justify-center"
                    title="后退1秒"
                  >
                    <div className="w-5 h-5 bg-current mask-[url(https://unpkg.com/lucide-static@0.447.0/icons/chevrons-left.svg)] mask-center" />
                    <span className="text-[10px] ml-1 font-bold">1s</span>
                  </button>
                  <button 
                    onClick={handlePlayPause}
                    className="text-white hover:scale-110 transition-all p-0.5 bg-primary rounded-full shadow-[0_8px_32px_rgba(var(--primary-rgb),0.5)] active:scale-95 group/play border-4 border-white/10"
                  >
                    {isPlaying ? (
                      <div className="w-14 h-14 flex items-center justify-center">
                        <div className="flex gap-1.5 h-6">
                          <div className="w-2 h-full bg-white rounded-full"></div>
                          <div className="w-2 h-full bg-white rounded-full"></div>
                        </div>
                      </div>
                    ) : (
                      <PlayCircle className="w-14 h-14 fill-white text-primary" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleSkip(1)}
                    className="text-white/50 hover:text-white transition-all p-3 hover:bg-white/10 rounded-full active:scale-90 flex items-center justify-center"
                    title="前进1秒"
                  >
                    <span className="text-[10px] mr-1 font-bold">1s</span>
                    <div className="w-5 h-5 bg-current mask-[url(https://unpkg.com/lucide-static@0.447.0/icons/chevrons-right.svg)] mask-center" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Timeline */}
        <div className="h-[240px] md:h-[260px] w-full bg-slate-950/80 backdrop-blur-3xl flex flex-col border-t border-white/10 p-4 z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
          {/* Timeline Toolbar */}
          <div className="flex justify-between items-center mb-4 text-white/80 shrink-0">
            <div className="flex items-center gap-2">
              <div className="font-mono text-[11px] bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 tabular-nums shadow-inner mr-4">
                <span className="text-primary font-bold tracking-wider">{formatTime(currentTime)}</span>
                <span className="text-white/20">|</span>
                <span className="text-white/50 tracking-wider font-medium">{formatTime(projectDuration)}</span>
              </div>
              <div className="flex bg-white/5 backdrop-blur-2xl rounded-xl p-0.5 border border-white/10">
                <button 
                  onClick={handleSplit}
                  className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>分割</span>
                </button>
                <button 
                  onClick={() => toast.info("拖拽素材边缘即可裁剪")}
                  className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>裁剪</span>
                </button>
                <div className="w-[1px] h-4 bg-white/10 mx-1 self-center" />
                <button 
                  onClick={() => toast.info("自动对齐已开启")}
                  className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>拼接</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/50 hover:text-white transition-all active:scale-90"
                >
                   {isMuted ? <div className="w-4 h-4 bg-white/60 mask-[url(https://unpkg.com/lucide-static@0.447.0/icons/volume-x.svg)]" /> : <div className="w-4 h-4 bg-white/60 mask-[url(https://unpkg.com/lucide-static@0.447.0/icons/volume-2.svg)]" />}
                </button>
                <div className="w-24 group/vol h-1">
                  <div className="relative w-full h-full bg-white/10 rounded-full overflow-hidden group-hover/vol:h-1.5 transition-all">
                    <div 
                      className="absolute left-0 top-0 h-full bg-primary/80" 
                      style={{ width: `${isMuted ? 0 : volume}%` }}
                    />
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        if (isMuted) setIsMuted(false);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <button 
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
                  className="p-1 px-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="w-24 h-1 bg-white/10 rounded-full relative overflow-hidden group/zoom">
                   <motion.div 
                     className="absolute left-0 top-0 h-full bg-primary/40 rounded-full"
                     animate={{ width: `${(zoom / 3) * 100}%` }}
                   />
                </div>
                <button 
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
                  className="p-1 px-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-black/60 rounded-2xl border border-white/5 relative flex flex-col gap-0 overflow-x-auto overflow-y-hidden custom-scrollbar shadow-[inset_0_4px_32px_rgba(0,0,0,0.8)]" ref={timelineRef}>
            <div className="h-full relative transition-all duration-300 ease-out" style={{ width: `${zoom * 100}%`, minWidth: '100%' }}>
              {/* Time Ruler */}
              <div 
                className="h-8 border-b border-white/10 flex items-end relative select-none bg-white/[0.03] cursor-pointer"
                onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const labelWidth = 56;
                   const x = Math.max(0, e.clientX - rect.left - labelWidth);
                   const actualWidth = rect.width - labelWidth;
                   const percentage = x / actualWidth;
                   handleSeek(percentage * projectDuration);
                }}
              >
                <div className="w-14 sticky left-0 top-0 bottom-0 z-50 bg-slate-900 border-r border-white/10 flex items-center justify-center">
                  <span className="text-[10px] font-black text-white/20 tracking-tighter">TIME</span>
                </div>
                <div className="flex-1 h-full relative" style={{ marginLeft: '0px' }}>
                  {Array.from({ length: Math.ceil(projectDuration * 4) + 1 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute bottom-0 flex flex-col items-center" 
                      style={{ 
                        left: `${(i / (projectDuration * 4)) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className={cn(
                        "w-[1px] transition-colors", 
                        i % 4 === 0 ? "h-3.5 bg-white/70" : i % 2 === 0 ? "h-2 bg-white/40" : "h-1 bg-white/20"
                      )} />
                      {i % 4 === 0 && (
                        <div className="absolute top-0.5 text-[11px] font-mono font-black text-white/70 tracking-tighter whitespace-nowrap">{(i / 4).toFixed(0)}s</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracks Container */}
              <div className="flex flex-col gap-0 relative h-[calc(100%-40px)]">
                {/* Interaction & Background Area */}
                <div 
                  className="absolute inset-y-0 right-0 left-14 cursor-text z-0"
                  onMouseDown={(e) => {
                    handleTimelineInteraction(e.clientX);
                    setIsDraggingPlayhead(true);
                  }}
                />

                {/* Track V1 */}
                <div className="h-[56px] flex items-center relative z-10 border-b border-white/5">
                  <div className="sticky left-0 top-0 bottom-0 w-14 bg-slate-900/90 backdrop-blur-3xl flex flex-col items-center justify-center gap-1 text-white/30 border-r border-white/10 z-30 group/track-label">
                    <Film className="w-3 h-3 group-hover/track-label:text-primary transition-colors" />
                    <span className="text-[9px] font-black tracking-tighter">V1</span>
                  </div>
                  <div className="flex-1 h-full relative">
                    <AnimatePresence>
                      {videoClips.map((clip) => (
                        <motion.div 
                          key={clip.id}
                          layout
                          drag="x"
                          dragConstraints={{ left: 0, right: Infinity }}
                          dragElastic={0.01}
                          onDrag={(_, info) => {
                            const container = timelineRef.current?.querySelector('.flex-1.h-full.relative');
                            if (!container) return;
                            const pixelsPerSec = (container as HTMLElement).offsetWidth / projectDuration;
                            const delta = info.delta.x / pixelsPerSec;
                            const newStart = Math.max(0, clip.startTime + delta);
                            updateClipPos(clip.id, 'video', newStart);
                          }}
                          className="absolute top-1 bottom-1 bg-primary/30 border border-white/20 rounded-xl flex items-center overflow-visible cursor-grab active:cursor-grabbing hover:bg-primary/40 transition-colors shadow-[0_8px_20px_rgba(0,0,0,0.3)] group/item ring-1 ring-white/10 backdrop-blur-md"
                          style={{ 
                            left: `${(clip.startTime / projectDuration) * 100}%`,
                            width: `${(clip.duration / projectDuration) * 100}%`
                          }}
                        >
                          {/* Trimming Handles */}
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-2.5 bg-primary/40 rounded-l-lg cursor-col-resize hover:bg-primary transition-all flex items-center justify-center opacity-0 group-hover/item:opacity-100"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              let lastX = e.clientX;
                              const onMove = (moveEvent: MouseEvent) => {
                                const container = timelineRef.current?.querySelector('.flex-1.h-full.relative');
                                if (!container) return;
                                const totalWidth = (container as HTMLElement).offsetWidth;
                                const deltaX = moveEvent.clientX - lastX;
                                lastX = moveEvent.clientX; // Update anchor for incremental change
                                const deltaSec = (deltaX / totalWidth) * projectDuration;
                                updateClipDuration(clip.id, 'video', deltaSec, 'left');
                              };
                              const onUp = () => {
                                document.removeEventListener('mousemove', onMove);
                                document.removeEventListener('mouseup', onUp);
                              };
                              document.addEventListener('mousemove', onMove);
                              document.addEventListener('mouseup', onUp);
                            }}
                          >
                             <div className="w-[1px] h-3 bg-white/50" />
                          </div>
                          
                          <div className="w-full h-full flex items-center justify-between px-3 truncate pointer-events-none">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                 <video src={videoUrl} className="w-full h-full object-cover scale-150 grayscale group-hover/item:grayscale-0" />
                              </div>
                              <span className="text-[11px] text-white/95 font-bold truncate tracking-tight">{clip.name}</span>
                            </div>
                            <span className="text-[9px] text-white/40 font-mono font-black tabular-nums">{clip.duration.toFixed(1)}s</span>
                          </div>

                          <div 
                            className="absolute right-0 top-0 bottom-0 w-2.5 bg-primary/40 rounded-r-lg cursor-col-resize hover:bg-primary transition-all flex items-center justify-center opacity-0 group-hover/item:opacity-100"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              let lastX = e.clientX;
                              const onMove = (moveEvent: MouseEvent) => {
                                const container = timelineRef.current?.querySelector('.flex-1.h-full.relative');
                                if (!container) return;
                                const totalWidth = (container as HTMLElement).offsetWidth;
                                const deltaX = moveEvent.clientX - lastX;
                                lastX = moveEvent.clientX; // Update anchor for incremental change
                                const deltaSec = (deltaX / totalWidth) * projectDuration;
                                updateClipDuration(clip.id, 'video', deltaSec, 'right');
                              };
                              const onUp = () => {
                                document.removeEventListener('mousemove', onMove);
                                document.removeEventListener('mouseup', onUp);
                              };
                              document.addEventListener('mousemove', onMove);
                              document.addEventListener('mouseup', onUp);
                            }}
                          >
                             <div className="w-[1px] h-3 bg-white/50" />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Track A1 */}
                <div className="h-[48px] flex items-center relative z-10 border-b border-white/5">
                  <div className="sticky left-0 top-0 bottom-0 w-14 bg-slate-900/90 backdrop-blur-3xl flex flex-col items-center justify-center gap-1 text-white/30 border-r border-white/10 z-30 group/track-label">
                    <Music className="w-3 h-3 group-hover/track-label:text-emerald-500 transition-colors" />
                    <span className="text-[9px] font-black tracking-tighter">A1</span>
                  </div>
                  <div className="flex-1 h-full relative">
                    {audioClips.map((clip) => (
                      <motion.div 
                        key={clip.id}
                        layout
                        drag="x"
                        dragConstraints={{ left: 0, right: Infinity }}
                        onDrag={(_, info) => {
                          const container = timelineRef.current?.querySelector('.flex-1.h-full.relative');
                          if (!container) return;
                          const pixelsPerSec = (container as HTMLElement).offsetWidth / projectDuration;
                          const delta = info.delta.x / pixelsPerSec;
                          const newStart = Math.max(0, clip.startTime + delta);
                          updateClipPos(clip.id, 'audio', newStart);
                        }}
                        className="absolute top-1 bottom-1 bg-emerald-500/20 border border-white/20 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-emerald-500/30 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md"
                        style={{ 
                          left: `${(clip.startTime / projectDuration) * 100}%`,
                          width: `${(clip.duration / projectDuration) * 100}%`
                        }}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-400" />
                        <div className="w-full h-full flex items-center px-4 pointer-events-none">
                          <div className="w-full h-4 bg-[url('https://www.w3schools.com/howto/img_wave.png')] bg-repeat-x bg-center opacity-20 grayscale invert scale-y-110" />
                        </div>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] text-emerald-400/80 font-black tracking-tight uppercase pointer-events-none">{clip.name}</div>
                        <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-400" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Playhead Indicator Line */}
                <motion.div 
                  className="absolute top-0 bottom-0 w-[1.5px] bg-red-600 z-[100] transition-none pointer-events-none shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                  style={{ 
                    left: `calc(56px + ${(currentTime / projectDuration) * 100}% - ${(currentTime / projectDuration) * 56}px)` 
                  }}
                >
                  <div className="absolute top-0 -translate-x-1/2 -translate-y-2 w-4 h-[28px] bg-red-600 rounded-b-lg shadow-[0_8px_20px_rgba(220,38,38,0.5)] flex items-center justify-center border border-white/30 pointer-events-auto cursor-grab active:cursor-grabbing"
                       onMouseDown={(e) => {
                         e.stopPropagation();
                         setIsDraggingPlayhead(true);
                       }}
                  >
                    <div className="w-[1px] h-3 bg-white/60"></div>
                  </div>
                  <div className="absolute bottom-0 -translate-x-1/2 w-4 h-2 bg-red-600 rounded-t-lg shadow-[0_-8px_20px_rgba(220,38,38,0.5)] border border-white/20" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Settings Panel */}
      <div className={cn(
        "flex-shrink-0 flex flex-col glass-panel overflow-hidden transition-all duration-500 h-full border-white/40 shadow-2xl bg-white/10 backdrop-blur-2xl relative",
        showRightPanel ? "w-[340px] opacity-100 translate-x-0" : "w-0 border-none opacity-0 translate-x-10 pointer-events-none"
      )}>
        <div className="px-6 py-5 border-b border-white/20 flex-shrink-0 flex items-center justify-between bg-white/5 backdrop-blur-3xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner ring-1 ring-primary/20">
              <Settings2 className="w-4.5 h-4.5" />
            </div>
            <h2 className="font-bold text-slate-800 text-base tracking-tight">参数配置</h2>
          </div>
          <button 
            onClick={() => setShowRightPanel(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white/20 transition-all border border-transparent hover:border-white/20 active:scale-90"
            title="收起侧边栏"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto glass-scrollbar p-0 pb-24">
            {/* Section 1: Scene Details */}
            <div className="flex flex-col shrink-0 border-b border-white/10 relative">
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-3xl relative z-10 sticky top-0">
                <h3 className="font-bold text-slate-800 text-[13px] tracking-wide uppercase opacity-70">分镜详情</h3>
                <button 
                  onClick={() => setShowChatHistory(!showChatHistory)}
                  className={cn(
                    "p-2 rounded-xl transition-all flex items-center justify-center border",
                    showChatHistory 
                      ? "text-primary bg-primary/10 border-primary/20 shadow-inner" 
                      : "text-slate-400 border-transparent hover:bg-white/20 hover:text-slate-700"
                  )}
                  title="历史对话"
                >
                  <History className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" /> 上传参考图片
                  </label>
                  <button className="w-full border-2 border-dashed border-slate-200 bg-white/20 backdrop-blur-xl rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/40 hover:border-primary/50 transition-all duration-500 cursor-pointer group focus:outline-none focus:ring-4 focus:ring-primary/10 hover:shadow-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-primary/30 group-hover:-translate-y-1">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-white transition-all" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">拖拽或点击上传</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium italic">支持 JPG, PNG, WEBP (Max 20MB)</p>
                  </button>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block">
                    提示词 (Prompt)
                  </label>
                  <textarea
                    className="w-full bg-white/30 border border-white/60 focus:bg-white/50 focus:border-primary/50 focus:shadow-2xl focus:ring-0 rounded-2xl p-4 text-[13px] leading-relaxed text-slate-700 resize-none h-32 shadow-inner custom-scrollbar transition-all duration-500 outline-none placeholder:text-slate-300"
                    placeholder="描述你想要的震撼场景..."
                    defaultValue="A cinematic tracking shot of an astronaut walking through a neon-lit cyberpunk market, rain falling softly."
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block">
                    反向提示词 (Negative)
                  </label>
                  <textarea
                    className="w-full bg-white/30 border border-white/60 focus:bg-white/50 focus:border-primary/50 focus:shadow-2xl focus:ring-0 rounded-2xl p-4 text-[13px] leading-relaxed text-slate-700 resize-none h-20 shadow-inner custom-scrollbar transition-all duration-500 outline-none placeholder:text-slate-300"
                    placeholder="不希望出现的负面元素..."
                    defaultValue="blurry, low quality, deformed, distorted, disfigured, text, watermark."
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Video Settings */}
            <div className="flex flex-col shrink-0 border-b border-white/10 relative">
              <button
                onClick={() => toggleSection("settings")}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/20 transition-all duration-500 bg-white/5 backdrop-blur-3xl border-b border-white/10 relative z-10 sticky top-0"
              >
                <div className="flex items-center gap-3">
                  <Film className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-800 text-[13px] tracking-wide uppercase opacity-70">视频设置</span>
                </div>
                {expandedSections.settings ? (
                  <ChevronUp className="w-5 h-5 text-slate-300" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-300" />
                )}
              </button>
              {expandedSections.settings && (
                <div className="px-6 pb-8 pt-5 flex flex-col gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">画幅比例 (Aspect Ratio)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {ratios.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setAspectRatio(r.id)}
                          className={cn(
                            "flex items-center justify-center py-3 rounded-2xl transition-all duration-500 cursor-pointer font-bold shadow-sm backdrop-blur-xl border-2",
                            aspectRatio === r.id
                              ? "bg-primary text-white border-white/30 shadow-[0_8px_20px_rgba(var(--primary-rgb),0.3)] -translate-y-0.5"
                              : "bg-white/20 border-white/60 text-slate-500 hover:bg-white/40 hover:text-slate-800 hover:border-white active:scale-95"
                          )}
                        >
                          <span className="text-[13px]">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">分辨率与帧率</label>
                    <div className="grid grid-cols-4 p-1.5 bg-black/5 border border-white/40 rounded-2xl mb-4 shadow-inner">
                      {["480p", "720p", "1080p", "custom"].map((res) => (
                        <button
                          key={res}
                          onClick={() => setResolution(res)}
                          className={cn(
                            "py-2 px-1 text-[11px] font-bold rounded-xl transition-all duration-500",
                            resolution === res
                              ? "bg-white text-primary shadow-lg scale-105 ring-1 ring-black/5"
                              : "text-slate-400 hover:text-slate-700"
                          )}
                        >
                          {res === "custom" ? "自定义" : res}
                        </button>
                      ))}
                    </div>
                    
                    {resolution === "custom" && (
                      <div className="flex items-center gap-4 animate-in fade-in zoom-in-95 duration-500 mb-4">
                        <div className="flex-1">
                          <input 
                            type="number"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(e.target.value)}
                            className="w-full bg-white/40 border border-white/60 focus:bg-white/60 focus:border-primary/40 rounded-2xl px-4 py-3 text-xs text-slate-700 outline-none shadow-sm transition-all"
                            placeholder="宽"
                          />
                        </div>
                        <span className="text-slate-300 font-black">×</span>
                        <div className="flex-1">
                          <input 
                            type="number"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(e.target.value)}
                            className="w-full bg-white/40 border border-white/60 focus:bg-white/60 focus:border-primary/40 rounded-2xl px-4 py-3 text-xs text-slate-700 outline-none shadow-sm transition-all"
                            placeholder="高"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">视频时长 (Duration)</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {durations.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setDuration(d.id)}
                          className={cn(
                            "flex items-center justify-center py-3 rounded-2xl transition-all duration-500 cursor-pointer font-bold shadow-sm backdrop-blur-xl border-2",
                            duration === d.id
                              ? "bg-primary text-white border-white/30 shadow-[0_8px_20px_rgba(var(--primary-rgb),0.3)] -translate-y-0.5"
                              : "bg-white/20 border-white/60 text-slate-500 hover:bg-white/40 hover:text-slate-800 hover:border-white active:scale-95"
                          )}
                        >
                          <span className="text-[13px]">{d.label}</span>
                        </button>
                      ))}
                    </div>
                    {duration === "custom" && (
                      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex-1 relative group">
                          <input 
                            type="number"
                            value={customDuration}
                            onChange={(e) => setCustomDuration(e.target.value)}
                            step="0.1"
                            min="0.1"
                            className="w-full bg-white/40 border border-white/60 focus:bg-white/60 focus:border-primary/40 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none shadow-inner transition-all pr-12"
                            placeholder="输入秒数"
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 group-focus-within:text-primary transition-colors">sec</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Motion Control */}
            <div className="flex flex-col shrink-0 relative mb-4">
              <button
                onClick={() => toggleSection("motion")}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/20 transition-all duration-500 bg-white/5 backdrop-blur-3xl border-b border-white/10 relative z-10 sticky top-0"
              >
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-800 text-[13px] tracking-wide uppercase opacity-70">运动控制</span>
                </div>
                {expandedSections.motion ? (
                  <ChevronUp className="w-5 h-5 text-slate-300" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-300" />
                )}
              </button>
              {expandedSections.motion && (
                <div className="px-6 pb-10 pt-6 flex flex-col gap-6">
                  <div className="bg-white/30 backdrop-blur-2xl p-6 rounded-3xl border border-white/60 shadow-xl transition-all duration-500 hover:shadow-2xl hover:bg-white/40 group/card">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-sm font-bold text-slate-700 tracking-tight">运镜幅度 (Motion)</span>
                      <EditableValue value={Math.round(motionAmount)} onChange={setMotionAmount} min={0} max={100} unit="%" />
                    </div>
                    <GlassSlider value={motionAmount} onChange={setMotionAmount} min={0} max={100} colorClass="text-primary" />
                    <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      <span>Low</span>
                      <span>Strong</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer Action Button */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/95 via-white/80 to-transparent backdrop-blur-xl border-t border-white/40 z-30">
            <button 
              onClick={() => toast.success("开始生成视频...")} 
              className="w-full h-14 bg-primary text-white rounded-[24px] shadow-[0_12px_24px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_16px_32px_rgba(var(--primary-rgb),0.5)] hover:-translate-y-1 hover:brightness-110 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group px-4 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <PlayCircle className="w-6 h-6 flex-shrink-0 group-hover:rotate-12 transition-transform duration-500" />
              <span className="text-base font-bold tracking-tight">开始生成视频</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
