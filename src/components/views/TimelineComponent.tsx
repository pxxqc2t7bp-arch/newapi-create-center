import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Film, Music, Scissors, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackClip {
  id: string;
  start: number;
  duration: number;
  sourceStart: number;
  maxDuration: number;
  name: string;
  type: 'video' | 'audio';
}

const SCALE_FACTOR = 40; // width per second

export default function TimelineComponent({
  currentTime = 0,
  isPlaying = false,
  onSeek,
  onPlayToggle,
  onProjectDurationChange,
  isTrimming,
  videoClip,
  audioClip,
  onTrimChange,
  onApplyTrim,
  onCancelTrim,
  onResetTrim
}: {
  currentTime?: number;
  isPlaying?: boolean;
  onSeek?: (time: number) => void;
  onPlayToggle?: () => void;
  onProjectDurationChange?: (duration: number) => void;
  isTrimming?: boolean;
  videoClip?: TrackClip;
  audioClip?: TrackClip;
  onTrimChange?: (type: 'video' | 'audio', start: number, duration: number) => void;
  onApplyTrim?: () => void;
  onCancelTrim?: () => void;
  onResetTrim?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const vClip = videoClip || { id: 'v1', start: 0, duration: 5, sourceStart: 0, maxDuration: 10, name: 'AI_Video_01.mp4', type: 'video' };
  const aClip = audioClip || { id: 'a1', start: 0, duration: 5, sourceStart: 0, maxDuration: 10, name: 'Original_Audio', type: 'audio' };

  const projectDuration = Math.max(vClip.start + vClip.duration, aClip.start + aClip.duration);

  useEffect(() => {
    if (onProjectDurationChange) {
      onProjectDurationChange(projectDuration);
    }
  }, [projectDuration, onProjectDurationChange]);

  const handleDragEdge = (e: React.MouseEvent, type: 'video'|'audio', side: 'left'|'right') => {
    if (!isTrimming) return;
    e.stopPropagation();
    let startX = e.clientX;
    const pxPerSec = SCALE_FACTOR;

    const clip = type === 'video' ? vClip : aClip;

    const onMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      startX = moveEvent.clientX;
      const deltaSec = deltaX / pxPerSec;
      
      let newStart = clip.start;
      let newDuration = clip.duration;

      if (side === 'left') {
        const potentialNewStart = clip.start + deltaSec;
        const boundedNewStart = Math.max(0, potentialNewStart);
        const effectiveDelta = boundedNewStart - clip.start;
        const potentialNewDuration = clip.duration - effectiveDelta;
        
        if (potentialNewDuration > 0.5) {
          newStart = boundedNewStart;
          newDuration = potentialNewDuration;
        }
      } else {
        const potentialNewDuration = clip.duration + deltaSec;
        if (potentialNewDuration > 0.5 && potentialNewDuration <= clip.maxDuration - clip.sourceStart) {
          newDuration = Math.max(0.5, potentialNewDuration);
        }
      }

      if (onTrimChange) {
        onTrimChange(type, newStart, newDuration);
        // Sync the other track to match
        const otherType = type === 'video' ? 'audio' : 'video';
        onTrimChange(otherType, newStart, newDuration);
      }
    };
    
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const formatTime = (time: number) => {
    const s = Math.floor(time);
    const ms = Math.floor((time % 1) * 10);
    return `00:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const px = (sec: number) => sec * SCALE_FACTOR * zoomLevel;
  
  const renderTrackItem = (clip: TrackClip, isVideo: boolean) => {
    const isSelected = isTrimming;

    const displayStart = isTrimming ? clip.sourceStart : clip.start;
    const displayDuration = isTrimming ? clip.maxDuration : clip.duration;
    
    return (
      <div className="h-20 relative flex items-center mb-2 px-4 group">
        {/* Track Label */}
        <div className="w-24 shrink-0 flex items-center gap-2 text-[12px] text-[var(--lg-text-secondary)] font-medium bg-[var(--lg-bg-surface)] p-2 rounded-lg border border-[var(--lg-edge-shadow)] transition-colors shadow-sm relative z-20">
          {isVideo ? <Film className="w-4 h-4 text-[var(--apple-blue)]" /> : <Music className="w-4 h-4" />}
          {isVideo ? '视频轨道' : '音频轨道'}
        </div>
        
        {/* Track Content */}
        <div className="flex-1 relative h-[52px] bg-[var(--apple-pearl)] rounded-lg border border-[var(--lg-edge-shadow)] mx-2 overflow-hidden shadow-inner">
          {/* Unused space before clip */}
          {((isTrimming ? 0 : clip.start) > 0 || clip.sourceStart > 0) && (
             <div 
               className="absolute top-0 bottom-0 bg-black/10 border-r border-[var(--lg-edge-shadow)] overflow-hidden"
               style={{ left: px(Math.max(0, (isTrimming ? 0 : clip.start) - clip.sourceStart)), width: px(clip.sourceStart) }}
             >
                <div className="w-full h-full bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent_100%)] bg-[length:10px_10px]" />
             </div>
          )}

          <div 
            className={cn(
              "absolute top-0 bottom-0 rounded-md transition-all flex items-center overflow-hidden border border-[var(--lg-edge-highlight)]",
              isVideo ? "bg-[var(--apple-blue)] text-white shadow-md" : "bg-white text-[var(--lg-text-primary)] shadow-sm",
              isSelected && "ring-2 ring-[var(--apple-blue)] shadow-[0_4px_12px_rgba(0,102,204,0.3)] z-10"
            )}
            style={{ left: px(displayStart), width: px(displayDuration) }}
          >
            {/* Audio Waveform */}
            {!isVideo && (
               <div className="absolute inset-0 opacity-[0.2]" style={{ WebkitMaskImage: "url('https://www.w3schools.com/howto/img_wave.png')", WebkitMaskRepeat: "repeat", WebkitMaskSize: "20px 100%", WebkitMaskPosition: "center", backgroundColor: "var(--apple-blue)" }} />
            )}

            {/* Left Handle */}
            {isSelected && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-3 hover:bg-white/80 cursor-col-resize flex items-center justify-center z-20 bg-white/60 backdrop-blur-md border-r border-black/10 transition-colors"
                onMouseDown={(e) => handleDragEdge(e, clip.type, 'left')}
              >
                <div className="w-0.5 h-4 bg-black/60 rounded-full shadow-sm" />
              </div>
            )}

            <div className="h-full px-5 text-[11px] font-semibold flex items-center justify-between w-full pointer-events-none z-10">
              <span className="truncate mr-2 drop-shadow-sm">{clip.name}</span>
              <span className={cn("opacity-90 font-mono", isVideo ? "text-white" : "text-[var(--lg-text-secondary)]")}>{clip.duration.toFixed(1)}s</span>
            </div>

            {/* Right Handle */}
            {isSelected && (
              <div 
                className="absolute right-0 top-0 bottom-0 w-3 hover:bg-white/80 cursor-col-resize flex items-center justify-center z-20 bg-white/60 backdrop-blur-md border-l border-black/10 transition-colors"
                onMouseDown={(e) => handleDragEdge(e, clip.type, 'right')}
              >
                <div className="w-0.5 h-4 bg-black/60 rounded-full shadow-sm" />
              </div>
            )}
            
            {/* Visual indicator of true trimmed area inside full clip when trimming */}
            {isSelected && (
              <div 
                className="absolute top-0 bottom-0 pointer-events-none border-t border-b border-[var(--apple-blue)] bg-white/10"
                style={{
                  left: px(clip.start - clip.sourceStart),
                  width: px(clip.duration)
                }}
              />
            )}
          </div>
          
          {/* Unused space after clip */}
          {(clip.duration + clip.sourceStart < clip.maxDuration) && (
             <div 
               className="absolute top-0 bottom-0 bg-black/10 border-l border-[var(--lg-edge-shadow)] overflow-hidden"
               style={{ left: px((isTrimming ? 0 : clip.start) + clip.duration), width: px(clip.maxDuration - clip.duration - clip.sourceStart) }}
             >
                <div className="w-full h-full bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent_100%)] bg-[length:10px_10px]" />
             </div>
          )}
        </div>
      </div>
    );
  };

  const maxTimelineSec = Math.max(8, Math.ceil(projectDuration) + 2);
  const timelineWidth = Math.max(px(maxTimelineSec), containerRef.current?.offsetWidth || 800) - 100; // Account for label

  return (
    <div className="w-full h-full flex flex-col liquid-glass rounded-[24px] border border-[var(--lg-edge-highlight)] shadow-sm overflow-hidden bg-white/70 backdrop-blur-xl min-h-[220px]">
      
      {/* Top Toolbar */}
      <div className="h-16 border-b border-[var(--lg-edge-shadow)] flex items-center justify-between px-6 shrink-0 relative bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onPlayToggle} 
            className="w-9 h-9 rounded-full bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-focus)] flex items-center justify-center transition-all shadow-md active:scale-95 text-white"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
          <div className="font-mono text-[14px] font-semibold tracking-wider text-[var(--lg-text-primary)]">
            {formatTime(currentTime)} <span className="text-[var(--lg-text-secondary)] opacity-60 font-medium">/ {formatTime(projectDuration)}</span>
          </div>
        </div>

        {/* Trim tools center */}
        {isTrimming && (
           <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <button onClick={onApplyTrim} className="h-9 px-5 rounded-[9999px] bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-focus)] text-white text-[13px] font-bold shadow-md transition-all active:scale-95">应用裁切</button>
              <button onClick={onCancelTrim} className="h-9 px-4 rounded-[9999px] lg-button-glass text-[13px] font-bold bg-white/50 border border-[var(--lg-edge-highlight)] shadow-sm">取消</button>
              <button onClick={onResetTrim} className="w-9 h-9 rounded-full lg-button-glass bg-white/50 border border-[var(--lg-edge-highlight)] shadow-sm flex items-center justify-center" title="重置">
                <RotateCcw className="w-4 h-4" />
              </button>
           </div>
        )}

        {/* Zoom Control */}
        <div className="flex items-center gap-1.5 lg-card py-1 px-2 rounded-full min-h-0 bg-white/50 shadow-sm border border-[var(--lg-edge-highlight)]">
           <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.2))} className="p-1 hover:bg-black/5 rounded-full text-[var(--lg-text-secondary)] transition-colors">
              <ZoomOut className="w-4 h-4" />
           </button>
           <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={zoomLevel} 
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-20 accent-[var(--apple-blue)] cursor-pointer h-1.5 bg-black/10 rounded-full appearance-none outline-none"
           />
           <button onClick={() => setZoomLevel(z => Math.min(2, z + 0.2))} className="p-1 hover:bg-black/5 rounded-full text-[var(--lg-text-secondary)] transition-colors">
              <ZoomIn className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative" ref={containerRef}>
        
        <div className="flex-1 overflow-x-auto custom-scrollbar relative py-4">
          <div style={{ width: timelineWidth + 120 }}>
            {/* Time Scale Ruler */}
            <div 
              className="h-8 mb-4 flex items-end cursor-pointer px-4 relative z-0 group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - 120; // 120 = 96 (label) + 8 (margin) + 16 (padding)
                if (x >= 0 && onSeek) {
                  const clickTime = x / SCALE_FACTOR / zoomLevel;
                  const playableStart = isTrimming ? vClip.start : 0;
                  const playableEnd = isTrimming ? vClip.start + vClip.duration : vClip.maxDuration;
                  if (clickTime >= playableStart && clickTime <= playableEnd) {
                      onSeek(clickTime);
                  }
                }
              }}
            >
              <div className="w-[104px] shrink-0" /> {/* Spacer for labels */}
              <div className="flex-1 relative h-full">
                <div className="absolute bottom-0 left-0 right-0 h-[10px] bg-black/5 transition-colors group-hover:bg-black/10 rounded-t-sm" />
                {Array.from({ length: maxTimelineSec + 1 }).map((_, i) => (
                  <div key={i} className="absolute bottom-0 pointer-events-none" style={{ left: px(i) }}>
                    <div className="bg-black/30 w-px h-3" />
                    <span className="absolute -left-2 top-[-18px] text-[10px] text-[var(--lg-text-secondary)] font-semibold">{formatTime(i)}</span>
                  </div>
                ))}
                {/* Minor ticks */}
                {zoomLevel >= 0.8 && Array.from({ length: maxTimelineSec * 5 }).map((_, i) => {
                  if (i % 5 === 0) return null;
                  return (
                    <div key={`m-${i}`} className="absolute bottom-0 pointer-events-none" style={{ left: px(i * 0.2) }}>
                      <div className="bg-black/15 w-px h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracks */}
            <div className="flex flex-col relative z-0 gap-2">
              {renderTrackItem(vClip, true)}
              {renderTrackItem(aClip, false)}

              {/* Apple Playhead Line */}
              <div 
                className="absolute top-[-36px] bottom-0 w-px bg-[var(--apple-blue)] z-50 pointer-events-none transition-none shadow-sm"
                style={{ left: px(currentTime) + 120 }}
              >
                <div className="absolute top-[36px] -left-[5px] w-[11px] h-[11px] bg-[var(--apple-blue)] rounded-full shadow-[0_2px_4px_rgba(0,102,204,0.3)] border-[2px] border-white/50">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
