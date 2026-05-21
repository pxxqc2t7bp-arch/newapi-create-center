import { useNavigate } from "react-router-dom";

export function PromptsView() {
  const navigate = useNavigate();

  const prompts = [
    { title: "未来城市概念设计", prompt: "A cinematic tracking shot of a futuristic city with flying cars and neon lights, realistic, 8k, unreal engine 5", type: "image", icon: "🎨" },
    { title: "营销文案生成", prompt: "为一款主打环保和可持续发展的运动鞋写一段吸引人的小红书风格营销文案。", type: "chat", icon: "📝" },
    { title: "短视频分镜设计", prompt: "A cinematic slow pan sweeping across a cyberpunk coffee shop with rain outside window", type: "video", icon: "🎬" },
  ];

  const handleUsePrompt = (promptData: typeof prompts[0]) => {
    switch (promptData.type) {
      case "chat":
        navigate("/creation/chat", { state: { initialPrompt: promptData.prompt } });
        break;
      case "image":
        navigate("/creation/image", { state: { initialPrompt: promptData.prompt } });
        break;
      case "video":
        navigate("/creation/video", { state: { initialPrompt: promptData.prompt } });
        break;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] text-[var(--lg-text-primary)]">
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
        <div className="w-full max-w-5xl 2xl:max-w-6xl flex flex-col p-6 sm:p-10 transition-all duration-300 gap-8 h-full">
          <div className="flex items-center justify-between flex-shrink-0 pt-4">
            <h1 className="text-3xl font-semibold tracking-tight">提示词库</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--lg-text-secondary)]">快速选用优质 Prompt 开始流创作</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((p, idx) => (
              <div 
                key={idx} 
                onClick={() => handleUsePrompt(p)}
                className="liquid-glass rounded-2xl p-6 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-all hover:border-[var(--apple-blue)] border border-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--lg-bg-control)] flex items-center justify-center text-xl">
                    {p.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                </div>
                <p className="text-sm text-[var(--lg-text-secondary)] line-clamp-3">
                  {p.prompt}
                </p>
                <div className="mt-auto pt-4 flex justify-end">
                  <span className="text-xs font-medium px-3 py-1 bg-[var(--lg-bg-control)] rounded-full text-[var(--apple-blue)]">去使用</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
