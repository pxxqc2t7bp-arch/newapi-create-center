import {
  Settings2,
  ChevronRight,
  Upload,
  PlayCircle,
  Pause,
  Download,
  Share2,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Loader2,
  Maximize,
  Scissors,
  Play
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import TimelineComponent from "./TimelineComponent";
import { fetchModels, createGeneration, getTask, cancelTask } from "../../api/creation/services";
import { CreationModel, modelSupportsTextToVideo, modelSupportsImageToVideo } from "../../types/creation/model";
import { toast } from "sonner";

type PreviewState = "empty" | "generating" | "completed";

export function VideoView() {
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [previewState, setPreviewState] = useState<PreviewState>("empty");
  const [generationProgress, setGenerationProgress] = useState(0);

  const [generateMode, setGenerateMode] = useState<"text" | "image">("text");
  
  const ratios = [
    { id: "1:1", label: "1:1" },
    { id: "4:3", label: "4:3" },
    { id: "16:9", label: "16:9" },
    { id: "21:9", label: "21:9" },
  ];

  const durations = [
    { id: "5s", label: "5秒" },
    { id: "10s", label: "10秒" },
  ];

  const styles = ["写实", "电影感", "动漫", "科技感"];

  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState("5s");
  const [videoStyle, setVideoStyle] = useState("电影感");

  // Timeline & Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [projectDuration, setProjectDuration] = useState(5.0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<number | null>(null);

  // Playback mock simulation
  const lastTimeRef = useRef<number>(0);
  const reqRef = useRef<number>(0);

  // Trim state
  const [isTrimming, setIsTrimming] = useState(false);
  const [vClip, setVClip] = useState({ id: 'v1', start: 0, duration: 5, sourceStart: 0, maxDuration: 5, name: 'AI_Video_01.mp4', type: 'video' as const });
  const [aClip, setAClip] = useState({ id: 'a1', start: 0, duration: 5, sourceStart: 0, maxDuration: 5, name: 'Original_Audio', type: 'audio' as const });
  const initialVClip = useRef(vClip);
  
  const [prompt, setPrompt] = useState("");
  const [models, setModels] = useState<CreationModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [sourceImageId, setSourceImageId] = useState<string>("");

  useEffect(() => {
    fetchModels('video').then(data => {
      setModels(data);
      if (data.length > 0) setSelectedModelId(data[0].id);
    }).catch(err => {
      console.error(err);
    });
    return () => {
      if (progressInterval.current) window.clearInterval(progressInterval.current);
    };
  }, []);
  
  useEffect(() => {
    // Basic setup if we just loaded or are generating
    if (previewState === "empty") {
       setProjectDuration(0);
       setIsPlaying(false);
       setCurrentTime(0);
    } else if (previewState === "completed") {
       setProjectDuration(vClip.start + vClip.duration);
    }
  }, [previewState, vClip]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const step = (time: number) => {
        const delta = (time - lastTimeRef.current) / 1000;
        setCurrentTime(prev => {
          const next = prev + delta;
          if (next >= projectDuration) {
            setIsPlaying(false);
            if (videoRef.current) videoRef.current.pause();
            return 0; // stop at end or loop
          }
          if (videoRef.current && Math.abs(videoRef.current.currentTime - (vClip.sourceStart + (next - vClip.start))) > 0.1) {
             videoRef.current.currentTime = vClip.sourceStart + (next - vClip.start);
          }
          return next;
        });
        lastTimeRef.current = time;
        reqRef.current = requestAnimationFrame(step);
      };
      reqRef.current = requestAnimationFrame(step);
    } else {
      if (videoRef.current) videoRef.current.pause();
    }
    return () => {
       if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isPlaying, projectDuration, vClip]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("必须填写视频画面描述");
      return;
    }
    const model = models.find(m => m.id === selectedModelId);
    if (!model) {
      toast.error("未选择可用模型");
      return;
    }

    if (generateMode === 'text' && !modelSupportsTextToVideo(model)) {
      toast.error("当前模型不支持文生视频，请切换支持的模型");
      return;
    }
    if (generateMode === 'image' && !modelSupportsImageToVideo(model)) {
      toast.error("当前模型不支持图生视频，请切换支持的模型");
      return;
    }
    if (generateMode === 'image' && !sourceImageId) {
      toast.error("图生视频必须选择参考图像");
      return;
    }

    setPreviewState("generating");
    setGenerationProgress(0);

    try {
      const task = await createGeneration({
        modelId: selectedModelId,
        prompt: prompt,
        mode: generateMode === 'text' ? 'text-to-video' : 'image-to-video',
        inputAssetIds: sourceImageId ? [sourceImageId] : []
      });

      const startTime = Date.now();
      const MAX_WAIT = 10 * 60 * 1000; // 10 minutes

      if (progressInterval.current) window.clearInterval(progressInterval.current);
      progressInterval.current = window.setInterval(async () => {
        try {
           const statusResult = await getTask(task.id);
           if (statusResult.status === 'succeeded') {
             window.clearInterval(progressInterval.current!);
             setPreviewState("completed");
             setIsTrimming(false);
             const dur = duration === "5s" ? 5 : 10;
             const newClip = { id: 'v1', start: 0, duration: dur, sourceStart: 0, maxDuration: dur, name: 'AI_Video_Generated.mp4', type: 'video' as const };
             setVClip(newClip);
             setAClip({ ...newClip, name: 'Original_Audio', type: 'audio' as const });
             initialVClip.current = newClip;
             toast.success("视频生成成功");
           } else if (statusResult.status === 'failed') {
             window.clearInterval(progressInterval.current!);
             setPreviewState("empty");
             toast.error(statusResult.message || "任务生成失败");
           } else if (statusResult.status === 'cancelled') {
             window.clearInterval(progressInterval.current!);
             setPreviewState("empty");
             toast.error("任务被取消");
           } else {
             // Fake progress while waiting for polling to finish
             setGenerationProgress(prev => {
                const next = prev + 5;
                return next > 95 ? 95 : next;
             });
           }

           if (Date.now() - startTime > MAX_WAIT) {
             window.clearInterval(progressInterval.current!);
             setPreviewState("empty");
             toast.error("视频生成超时，请稍后重试");
             cancelTask(task.id).catch(() => {});
           }
        } catch (e: any) {
           window.clearInterval(progressInterval.current!);
           setPreviewState("empty");
           // toast.error("查询任务状态失败");
        }
      }, 5000); // query every 5s for videos
    } catch (e) {
      setPreviewState("empty");
    }
  };

  const handleCancelGenerate = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setPreviewState("empty");
    setGenerationProgress(0);
  };

  const handlePlayToggle = () => {
    if (currentTime >= projectDuration && !isPlaying) {
      setCurrentTime(0);
      if (videoRef.current) videoRef.current.currentTime = vClip.sourceStart;
    }
    if (!isPlaying && videoRef.current) {
        videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrimChange = (type: 'video' | 'audio', start: number, duration: number) => {
    const newClip = { ...(type === 'video' ? vClip : aClip), start, duration };
    if (type === 'video') setVClip(newClip); else setAClip(newClip);
    
    if (videoRef.current && type === 'video') {
      videoRef.current.currentTime = newClip.sourceStart + start; // Simple sync
    }
  };

  const applyTrim = () => {
    setIsTrimming(false);
    initialVClip.current = vClip;
  };

  const resetTrim = () => {
    setVClip(initialVClip.current);
    setAClip({ ...initialVClip.current, name: 'Original_Audio', type: 'audio' as const });
  };

  const cancelTrim = () => {
    resetTrim();
    setIsTrimming(false);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="flex-1 flex p-4 md:p-6 gap-4 md:gap-6 h-full overflow-hidden bg-transparent">
      
      {/* Center Layout for Preview and Timeline */}
      <div className="flex-1 flex flex-col min-w-0 gap-6 overflow-hidden relative">
        
        {/* Top Header inside center */}
        <div className="h-[52px] w-full flex items-center justify-between shrink-0 mb-[-12px] z-10 px-2">
          <div className="flex items-center gap-3">
             <span className="font-semibold text-[var(--lg-text-primary)] tracking-wide text-lg drop-shadow-sm">
              AI_Video_01
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[var(--lg-bg-control)] border border-[var(--lg-edge-highlight)] text-[11px] font-bold tracking-widest text-[var(--lg-text-secondary)] shadow-sm">
              {aspectRatio} · {duration} · 1080P · 24fps
            </span>
          </div>
          <div className="flex gap-2">
            {!showRightPanel && (
              <button 
                onClick={() => setShowRightPanel(true)} 
                className="lg-icon-button"
                title="打开配置"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}
            <button className="lg-icon-button" title="重新生成">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="lg-icon-button" title="全屏">
              <Maximize className="w-4 h-4" />
            </button>
            <button className="lg-button-glass text-[var(--lg-text-primary)] text-sm gap-2 px-5 bg-white/50 hover:bg-white/80">
              <Download className="w-4 h-4" />
              导出
            </button>
          </div>
        </div>

        {/* Center Preview Stage */}
        <div className="flex-1 rounded-[24px] overflow-hidden relative shadow-2xl bg-black border border-white/10 flex items-center justify-center lg-card p-0">
            {previewState === "empty" && (
                <div className="w-[480px] max-w-full lg-card p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 scale-105 border-white/20">
                    <div className="w-16 h-16 rounded-full bg-[var(--lg-bg-control)] flex items-center justify-center mb-6 border border-[var(--lg-edge-highlight)] shadow-lg">
                        <Sparkles className="w-8 h-8 text-[#fff]" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 tracking-tight">开始生成你的 AI 视频</h2>
                    <p className="text-[var(--lg-text-secondary)] text-sm mb-8 leading-relaxed">
                        输入一段文字，或上传一张图片，即可生成短视频。支持文生视频与图生视频。
                    </p>
                    <div className="flex gap-4 w-full justify-center">
                       <button onClick={() => setGenerateMode('text')} className="lg-button-primary">输入提示词生成</button>
                       <button onClick={() => setGenerateMode('image')} className="lg-button-glass">上传图片生成</button>
                    </div>
                </div>
            )}

            {previewState === "generating" && (
                <div className="w-[420px] max-w-full lg-card p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                    <Loader2 className="w-12 h-12 text-[var(--apple-blue-on-dark)] animate-spin mb-6 drop-shadow-md" />
                    <h2 className="text-xl font-bold mb-6 tracking-tight">AI 正在生成视频…</h2>
                    
                    <div className="w-full space-y-5 mb-8 text-left">
                       <div className="flex justify-between text-sm font-medium">
                         <span className={generationProgress < 30 ? "text-white drop-shadow" : "text-white/50"}>正在理解视频描述</span>
                         {generationProgress < 30 && <span className="text-white drop-shadow">{generationProgress}%</span>}
                       </div>
                       <div className="flex justify-between text-sm font-medium">
                         <span className={generationProgress >= 30 && generationProgress < 75 ? "text-white drop-shadow" : "text-white/50"}>正在生成视频画面</span>
                         {generationProgress >= 30 && generationProgress < 75 && <span className="text-white drop-shadow">{generationProgress}%</span>}
                       </div>
                       <div className="flex justify-between text-sm font-medium">
                         <span className={generationProgress >= 75 ? "text-white drop-shadow" : "text-white/50"}>正在合成最终结果</span>
                         {generationProgress >= 75 && <span className="text-white drop-shadow">{generationProgress}%</span>}
                       </div>

                       <div className="w-full h-1.5 bg-[var(--lg-bg-control)] rounded-full overflow-hidden mt-4 shadow-inner">
                          <div 
                            className="h-full bg-[var(--apple-blue-on-dark)] transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(41,151,255,0.5)]"
                            style={{ width: `${generationProgress}%` }}
                          />
                       </div>
                    </div>

                    <button onClick={handleCancelGenerate} className="lg-button-glass text-sm text-red-300 hover:text-red-200 border-red-500/20">
                        取消生成
                    </button>
                </div>
            )}

            {previewState === "completed" && (
                <div className="w-full h-full relative group animate-in fade-in duration-700 bg-black">
                    {/* Video Player */}
                    <video 
                        ref={videoRef}
                        src="https://vjs.zencdn.net/v/oceans.mp4" 
                        className={cn("w-full h-full object-cover transition-all duration-300", isTrimming ? "scale-95 rounded-2xl ring-1 ring-white/20 shadow-2xl" : "")}
                        loop={false}
                    />

                    {/* Meta info overlay */}
                    {/* Removed top left overlay to avoid duplication with top header */}

                    {/* Trimming active overlay */}
                    {isTrimming && (
                      <div className="absolute left-6 bottom-8 lg-card p-4 rounded-2xl flex flex-col gap-1 border border-[var(--lg-edge-highlight)] bg-black/40 animate-in fade-in slide-in-from-bottom-4 shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-40 backdrop-blur-2xl">
                          <div className="text-xs font-medium text-white/70 tracking-widest uppercase">裁切预览 <span className="font-mono text-white/90 text-sm ml-2">{formatTime(vClip.start)} - {formatTime(vClip.start + vClip.duration)}</span></div>
                          <div className="w-full h-px bg-white/10 my-1" />
                          <div className="text-sm font-bold text-white tracking-wide">裁切后时长：<span className="font-mono text-[var(--apple-blue-on-dark)] ml-1">{vClip.duration.toFixed(1)}s</span></div>
                      </div>
                    )}

                    {/* Playback Controls Floating Bar */}
                    {!isTrimming && (
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center gap-5 z-20 group-hover:opacity-100 opacity-0 transition-opacity duration-300 px-6 py-3 bg-black/60 backdrop-blur-xl shadow-2xl border border-white/10 text-white rounded-full">
                          <button onClick={handlePlayToggle} className="text-white hover:scale-110 transition-transform active:scale-95 drop-shadow-md">
                              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                          </button>
                          
                          <div className="flex items-center gap-1.5 text-xs font-mono font-medium opacity-90 min-w-[90px] justify-center tracking-wider">
                              {formatTime(currentTime)} <span className="opacity-50">/</span> {formatTime(projectDuration)}
                          </div>

                          <div className="w-32 h-1.5 bg-white/20 rounded-full relative overflow-hidden cursor-pointer" onClick={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             const x = e.clientX - rect.left;
                             const ratio = x / rect.width;
                             const newTime = ratio * projectDuration;
                             setCurrentTime(newTime);
                             if (videoRef.current) videoRef.current.currentTime = vClip.sourceStart + newTime;
                          }}>
                              <div className="absolute top-0 bottom-0 left-0 bg-white" style={{ width: `${projectDuration > 0 ? (currentTime / projectDuration) * 100 : 0}%` }} />
                          </div>

                          <div className="w-px h-4 bg-white/20 drop-shadow-sm" />

                          <button onClick={() => setIsTrimming(true)} className="text-white/80 hover:text-white transition-colors flex items-center gap-2 font-bold text-xs" title="裁切片段">
                              <Scissors className="w-4 h-4"/>
                          </button>
                          <button className="text-white/80 hover:text-white transition-colors">
                              <Settings2 className="w-4 h-4" />
                          </button>
                          <button className="text-white/80 hover:text-white transition-colors">
                              <Maximize className="w-4 h-4" />
                          </button>
                      </div>
                    )}
                </div>
            )}
        </div>

        {/* Trim tool bar moved inside timeline */}
        {/* Removed here */}

        {/* Bottom Timeline */}
        <div className={cn(
          "h-[220px] w-full shrink-0 transition-all duration-500 rounded-[24px] overflow-hidden", 
          previewState === "empty" ? "opacity-30 pointer-events-none" : "opacity-100"
        )}>
          <TimelineComponent 
            currentTime={currentTime}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            onSeek={(t) => { setCurrentTime(t); if(videoRef.current) videoRef.current.currentTime = vClip.sourceStart + t; }}
            onProjectDurationChange={setProjectDuration}
            isTrimming={isTrimming}
            videoClip={vClip}
            audioClip={aClip}
            onTrimChange={handleTrimChange}
            onApplyTrim={applyTrim}
            onCancelTrim={cancelTrim}
            onResetTrim={resetTrim}
          />
        </div>
      </div>

      {/* Right Side Settings Panel */}
      <div className={cn(
        "flex-shrink-0 flex flex-col liquid-glass transition-all duration-500 h-full relative z-20 border border-[var(--lg-edge-highlight)] rounded-[24px] shadow-sm",
        showRightPanel ? "w-[340px] opacity-100 translate-x-0" : "w-0 border-none opacity-0 translate-x-10 pointer-events-none"
      )}>
        <div className="px-6 py-5 border-b border-[var(--lg-edge-highlight)] flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[var(--lg-text-primary)] drop-shadow-sm" />
            <h2 className="font-semibold text-[17px] text-[var(--lg-text-primary)] tracking-tight">参数配置</h2>
          </div>
          <button 
            onClick={() => setShowRightPanel(false)}
            className="lg-icon-button w-8 h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            
            {/* Generate Mode Switch */}
            <div className="lg-segmented w-full">
               <button 
                 onClick={() => setGenerateMode('text')} 
                 className="flex-1 lg-segment-btn" 
                 aria-selected={generateMode === 'text'}
               >
                 文生视频
               </button>
               <button 
                 onClick={() => setGenerateMode('image')} 
                 className="flex-1 lg-segment-btn" 
                 aria-selected={generateMode === 'image'}
               >
                 图生视频
               </button>
            </div>

            {/* Prompt Area */}
            {generateMode === 'image' && (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <label className="text-[11px] font-bold text-[var(--lg-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" /> 上传参考图片
                </label>
                <button className="w-full h-32 lg-card p-0 rounded-2xl flex flex-col items-center justify-center border border-dashed border-[var(--lg-edge-highlight)] hover:border-[var(--apple-blue)] transition-all group shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[var(--lg-bg-control)] flex items-center justify-center mb-2 group-hover:bg-[var(--apple-blue)] transition-colors shadow-sm">
                    <Upload className="w-5 h-5 text-[var(--lg-text-secondary)] group-hover:text-white" />
                  </div>
                  <span className="text-[13px] font-semibold group-hover:text-[var(--apple-blue)] transition-colors text-[var(--lg-text-primary)]">拖拽或点击上传</span>
                  <span className="text-[10px] text-[var(--lg-text-secondary)] mt-1 font-medium">支持 JPG, PNG, WEBP (Max 20MB)</span>
                </button>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[var(--lg-text-secondary)] uppercase tracking-widest">
                提示词 (Prompt)
              </label>
              <textarea
                className="w-full glass-input rounded-2xl p-4 text-[14px] leading-relaxed resize-none h-32 custom-scrollbar placeholder:text-[var(--lg-text-secondary)] shadow-sm font-medium"
                placeholder="描述你想要的画面，避免使用默认提示词..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-3">
               <label className="text-[11px] font-bold text-[var(--lg-text-secondary)] uppercase tracking-widest block">画幅比例 (Aspect Ratio)</label>
               <div className="grid grid-cols-2 gap-2">
                 {ratios.map((r) => (
                   <button
                     key={r.id}
                     onClick={() => setAspectRatio(r.id)}
                     className={cn(
                       "py-3 rounded-[14px] text-[14px] font-semibold transition-all duration-300 border",
                       aspectRatio === r.id 
                         ? "bg-[var(--lg-bg-elevated)] border-[var(--lg-edge-highlight)] text-[var(--apple-blue)] shadow-sm" 
                         : "bg-[var(--lg-bg-control)] border-[var(--lg-edge-highlight)] text-[var(--lg-text-secondary)] hover:bg-[var(--lg-bg-control-hover)] hover:text-[var(--lg-text-primary)]"
                     )}
                   >
                     {r.label}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[11px] font-bold text-[var(--lg-text-secondary)] uppercase tracking-widest block">视频时长 (Duration)</label>
               <div className="grid grid-cols-2 gap-2">
                 {durations.map((d) => (
                   <button
                     key={d.id}
                     onClick={() => setDuration(d.id)}
                     className={cn(
                       "py-3 rounded-[14px] text-[14px] font-semibold transition-all duration-300 border",
                       duration === d.id 
                         ? "bg-[var(--apple-blue)] border-transparent text-white shadow-sm" 
                         : "bg-[var(--lg-bg-control)] border-[var(--lg-edge-highlight)] text-[var(--lg-text-secondary)] hover:bg-[var(--lg-bg-control-hover)] hover:text-[var(--lg-text-primary)]"
                     )}
                   >
                     {d.label}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[11px] font-bold text-[var(--lg-text-secondary)] uppercase tracking-widest block">视频风格 (Style)</label>
               <div className="grid grid-cols-2 gap-2">
                 {styles.map((s) => (
                   <button
                     key={s}
                     onClick={() => setVideoStyle(s)}
                     className={cn(
                        "py-3 rounded-[14px] text-[14px] font-semibold transition-all duration-300 border",
                       videoStyle === s
                         ? "bg-[var(--lg-bg-elevated)] border-[var(--lg-edge-highlight)] text-[var(--apple-blue)] shadow-sm" 
                         : "bg-[var(--lg-bg-control)] border-[var(--lg-edge-highlight)] text-[var(--lg-text-secondary)] hover:bg-[var(--lg-bg-control-hover)] hover:text-[var(--lg-text-primary)]"
                     )}
                   >
                     {s}
                   </button>
                 ))}
               </div>
            </div>
        </div>

        {/* Action Bottom */}
        <div className="p-6 shrink-0 border-t border-[var(--lg-edge-highlight)] bg-white/50 backdrop-blur-3xl z-10">
           <button 
             onClick={handleGenerate} 
             className="w-full lg-button-primary h-14 text-[17px] tracking-wide font-bold shadow-[0_8px_30px_rgba(0,102,204,0.4)] hover:-translate-y-[1px] hover:shadow-[0_12px_40px_rgba(0,102,204,0.6)]"
             disabled={previewState === "generating"}
           >
              {previewState === "generating" ? <Loader2 className="w-5 h-5 animate-spin drop-shadow-sm"/> : <PlayCircle className="w-5 h-5 drop-shadow-sm" />}
              <span className="ml-2 drop-shadow-sm">{previewState === "generating" ? "正在生成..." : "开始生成视频"}</span>
           </button>
        </div>
      </div>
    </div>
  );
}
