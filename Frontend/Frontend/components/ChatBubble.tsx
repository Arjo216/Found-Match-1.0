// components/ChatBubble.tsx
import React from "react";

type ChatBubbleProps = {
  text: string;
  fromMe?: boolean;
  timestamp?: string; // Added timestamp support for professional messaging
};

export default function ChatBubble({ text, fromMe, timestamp }: ChatBubbleProps) {
  return (
    <div className={`flex w-full mb-4 ${fromMe ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${fromMe ? "items-end" : "items-start"}`}>
        
        {/* The Message Bubble */}
        <div 
          className={`inline-block px-5 py-3 text-sm md:text-base leading-relaxed shadow-lg transition-all ${
            fromMe 
              ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-2xl rounded-tr-sm shadow-[0_4px_20px_rgba(8,145,178,0.25)]" 
              : "glass bg-slate-800/80 border border-white/5 text-slate-200 rounded-2xl rounded-tl-sm"
          }`}
        >
          {text}
        </div>

        {/* Optional Timestamp / Status Indicator */}
        {timestamp && (
          <span className={`text-[10px] font-medium text-slate-500 mt-1.5 px-1 tracking-wide uppercase ${fromMe ? "mr-1" : "ml-1"}`}>
            {timestamp}
          </span>
        )}
        
      </div>
    </div>
  );
}