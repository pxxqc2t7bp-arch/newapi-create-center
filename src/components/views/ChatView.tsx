import {
  Sparkles,
  ChevronDown,
  History,
  Settings2,
  Paperclip,
  ArrowUp,
  Image as ImageIcon,
  ChevronRight,
  Globe,
  Terminal,
  StopCircle,
  FileText
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ChatView() {
  const { showChatHistory, setShowChatHistory } = useOutletContext<{ showChatHistory: boolean, setShowChatHistory: (v: boolean | ((prev: boolean) => boolean)) => void }>();
  const [messages, setMessages] = useState([
    {
      role: "user",
      content: '帮我构思一个关于未来城市的概念设计，以"水晶与光"为主题。',
    },
    {
      role: "ai",
      content:
        "这是一个非常吸引人的主题。围绕“水晶与光”，我们可以构思一个名为“折射之都” (Prisma) 的未来城市。\n\n**核心概念：**\n这座城市不再依赖传统的钢筋混凝土，而是主要由一种新型的智能晶体材料构建。这些晶体不仅提供结构支撑，还能吸收、储存和折射环境光线与太阳能。",
      action: { type: "image", label: "生成相关概念图", desc: "使用 AI 生图工具将此概念可视化" },
    },
  ]);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: inputValue }]);
    setInputValue("");
    
    // Simulate AI response for testing scroll
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "这是一个模拟的回复。您可以继续发送消息来测试如果对话多了能否自动滚动显示滚轮功能。模型的参数也可以在右侧面板进行调整。" },
      ]);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-transparent min-h-0 relative py-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative px-6 min-h-0">
        {/* Chat Scrollable Area */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-8 pb-10 custom-scrollbar bg-white rounded-[24px] shadow-sm border border-slate-200 min-h-0 relative">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-20 animate-in fade-in duration-500">
              <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mb-6 shadow-md text-white">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">
                今天想创作什么？
              </h1>
              <p className="text-slate-500 text-center max-w-md text-sm">
                从提示词、图像概念、视频分镜或可复用素材开始。
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full mx-auto mt-8 px-6 lg:px-12">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] flex gap-4",
                      msg.role === "user" ? "items-start flex-row-reverse" : "items-start"
                    )}
                  >
                    {msg.role === "ai" ? (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm mt-1 text-white">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 mt-1">
                        <img
                          src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
                          alt="User"
                          className="w-full h-full object-cover bg-primary/10"
                        />
                      </div>
                    )}

                    <div
                      className={cn(
                        "px-5 py-4 rounded-2xl",
                        msg.role === "user"
                          ? "bg-slate-100 text-slate-800 rounded-tr-sm"
                          : "bg-white border border-slate-100 shadow-sm rounded-tl-sm"
                      )}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {msg.action && (
                        <div className="mt-4 p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-slate-800">
                              {msg.action.label}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {msg.action.desc}
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              toast.success("已复制提示词并跳转到图像生成");
                            }}
                            className="px-4 py-1.5 rounded-full text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                          >
                            去生图
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 w-full mt-4 flex relative">
          <div className="w-full bg-[#f7f8fa] border border-slate-200 shadow-sm rounded-3xl flex flex-col pt-3 pb-2 px-4 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30">
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 text-[15px] text-slate-800 placeholder-slate-400 outline-none custom-scrollbar"
              placeholder="随便问..."
              rows={3}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowChatHistory(!showChatHistory)}
                  className={cn(
                    "transition-colors rounded-lg p-1.5",
                    showChatHistory 
                      ? "text-primary bg-primary/10" 
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                  )} 
                  title="历史记录"
                >
                  <History className="w-[18px] h-[18px]" />
                </button>
                <button onClick={() => toast("打开文件上传...")} className="text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-200 p-1.5" title="附加文件">
                  <Paperclip className="w-[18px] h-[18px]" />
                </button>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mx-2">
                   {!showRightPanel && (
                    <button onClick={() => setShowRightPanel(true)} className="px-2 py-1.5 rounded-md flex items-center gap-1.5 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 bg-white shadow-sm">
                      <Settings2 className="w-3.5 h-3.5" /> 参数微调
                    </button>
                   )}
                </div>
              </div>
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="px-5 py-2.5 rounded-full bg-blue-400 text-white flex items-center gap-2 flex-shrink-0 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:hover:bg-blue-400 transition-all shadow-sm font-medium text-sm"
              >
                <Sparkles className="w-4 h-4" /> 发送
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Settings Panel (Collapsible) */}
      <div
        className={cn(
          "h-full flex-shrink-0 bg-white border border-slate-200 shadow-sm transition-all duration-300 ease-in-out relative group overflow-hidden opacity-100 mr-6 rounded-[24px]",
          showRightPanel ? "w-[340px]" : "w-0 border-none mr-0 opacity-0 bg-transparent"
        )}
      >
        <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200/50 relative">
             <button
                onClick={() => setShowRightPanel(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                title="关闭配置面板"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Settings2 className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-slate-800 text-sm">参数微调</h2>
              </div>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Image Feature */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-[18px] h-[18px] text-slate-800" />
                  <span className="font-bold text-slate-800 text-[15px]">图片地址</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-6 bg-slate-100 border border-slate-200 rounded-full relative cursor-pointer">
                    <div className="absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm border border-slate-200/50" />
                  </div>
                  <button className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors border border-slate-200/50">
                    <span className="text-[16px] leading-[0] font-light mt-[-1px]">+</span>
                  </button>
                </div>
              </div>
              <p className="text-[13px] text-slate-600">启用后可添加图片URL进行多模态对话</p>
              
              <div className="flex items-center gap-2 bg-[#f9fafb] border border-slate-100 rounded-2xl px-3 py-2 shadow-sm">
                  <FileText className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  <input type="text" className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-[13px] text-slate-400 placeholder-slate-300 font-mono" placeholder="https://example.com/image1.jpg" defaultValue="https://example.com/image1.jpg" />
                  <button className="text-slate-300 hover:text-slate-500 flex-shrink-0 p-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
            </div>

            {/* Model Select */}
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 mt-2">
              <div className="flex gap-2 w-full">
                <button className="flex-shrink-0 w-[72px] bg-white border border-slate-200 px-3 py-2.5 rounded-xl flex items-center justify-between shadow-sm hover:bg-slate-50 transition-colors group/btn">
                  <span className="text-[13px] text-slate-700 pointer-events-none">自动</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 pointer-events-none" />
                </button>
                <button className="flex-1 min-w-0 bg-white border border-slate-200 px-3 py-2.5 rounded-xl flex items-center justify-between shadow-sm hover:bg-slate-50 transition-colors overflow-hidden group/btn">
                  <span className="text-[13px] text-slate-800 font-medium truncate pointer-events-none" title="doubao-seedance-1-5-pro-251215-noAu">
                    doubao-seedance-1-5-pro-251215-noAu
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1 pointer-events-none" />
                </button>
              </div>
            </div>

            <button className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-slate-100 font-medium">
              停止
            </button>

            <div className="flex flex-col gap-5 border-t border-slate-100 pt-5 mt-2">
              {/* Temperature */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center group">
                  <span className="font-semibold text-slate-700 text-[13px] cursor-help" title="控制输出的随机性和创造性">Temperature</span>
                  <span className="text-blue-600 font-medium text-xs bg-blue-50 px-1.5 py-0.5 rounded">0.7</span>
                </div>
                <input type="range" className="accent-blue-500 w-full cursor-pointer" defaultValue="70" />
                <p className="text-[10px] text-slate-500 leading-tight">控制输出的随机性和创造性</p>
              </div>

              {/* Top P */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center group">
                  <span className="font-semibold text-slate-700 text-[13px] cursor-help" title="核采样，控制词汇选择的多样性">Top P</span>
                  <span className="text-blue-600 font-medium text-xs bg-blue-50 px-1.5 py-0.5 rounded">0.9</span>
                </div>
                <input type="range" className="accent-blue-500 w-full cursor-pointer" defaultValue="90" />
                <p className="text-[10px] text-slate-500 leading-tight">核采样，控制词汇选择的多样性</p>
              </div>

              {/* Frequency Penalty */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center group">
                  <span className="font-semibold text-slate-700 text-[13px] cursor-help" title="频率惩罚，减少重复词汇的出现">Frequency Penalty</span>
                  <span className="text-blue-600 font-medium text-xs bg-blue-50 px-1.5 py-0.5 rounded">0</span>
                </div>
                <input type="range" min="-20" max="20" className="accent-blue-500 w-full cursor-pointer" defaultValue="0" />
                <p className="text-[10px] text-slate-500 leading-tight">频率惩罚，减少重复词汇的出现</p>
              </div>

              {/* Presence Penalty */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center group">
                  <span className="font-semibold text-slate-700 text-[13px] cursor-help" title="存在惩罚，鼓励讨论新话题">Presence Penalty</span>
                  <span className="text-blue-600 font-medium text-xs bg-blue-50 px-1.5 py-0.5 rounded">0</span>
                </div>
                <input type="range" min="-20" max="20" className="accent-blue-500 w-full cursor-pointer" defaultValue="0" />
                <p className="text-[10px] text-slate-500 leading-tight">存在惩罚，鼓励讨论新话题</p>
              </div>

              {/* Max Tokens */}
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700 text-[13px]">Max Tokens</span>
                </div>
                <input type="number" className="w-full bg-[#f7f8fa] border border-slate-200 focus:border-blue-300 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none transition-colors" defaultValue={2048} />
              </div>

              {/* Seed */}
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700 text-[13px]">Seed</span>
                </div>
                <input type="number" className="w-full bg-[#f7f8fa] border border-slate-200 focus:border-blue-300 focus:bg-white rounded-lg px-3 py-2 text-sm outline-none transition-colors placeholder-slate-400" placeholder="留空为随机" />
                <p className="text-[10px] text-slate-500 leading-tight">可选，用于复现结果</p>
              </div>

              {/* Stream Output */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100 mt-2">
                <span className="text-[13px] font-semibold text-slate-700">流式输出</span>
                <div className="w-10 h-5 bg-blue-500 rounded-full relative cursor-pointer shadow-sm">
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
