import React from "react";

export default function ChatBubble({ text, fromMe }: { text: string; fromMe?: boolean }) {
  return (
    <div className={`max-w-[75%] mb-2 ${fromMe ? "ml-auto text-right" : "mr-auto text-left"}`}>
      <div className={`${fromMe ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"} inline-block px-4 py-2 rounded-xl`}>
        {text}
      </div>
    </div>
  );
}
