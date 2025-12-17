// pages/chat/[matchId].tsx
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import ChatBubble from "../../components/ChatBubble";
import { api } from "../../lib/api";

type Msg = { from: string; text: string };

export default function ChatPage() {
  const router = useRouter();

  // router.query.matchId can be string | string[] | undefined
  const rawMatchId = router.query.matchId;
  const matchId = Array.isArray(rawMatchId) ? rawMatchId[0] : rawMatchId;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Helper: scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // open websocket + fetch initial messages once matchId is available
  useEffect(() => {
    if (!matchId) return; // wait for router to provide matchId

    let cancelled = false;

    // 1) load existing messages via REST fallback
    (async () => {
      try {
        const res = await api.get(`/chat/${encodeURIComponent(matchId)}`);
        if (!cancelled) setMessages(res.data || []);
      } catch (e) {
        // ignore - fallback silently if endpoint missing
        // console.warn("failed to fetch chat history", e);
      }
    })();

    // 2) build websocket url based on NEXT_PUBLIC_API_URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
    const wsBase = apiUrl.replace(/^https?:/, `${wsProtocol}:`);
    const wsUrl = `${wsBase}/ws/chat/${encodeURIComponent(String(matchId))}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // optionally: you can send an initial "joined" message here
        // ws.send(JSON.stringify({ type: "join", matchId }));
        // console.log("ws open", wsUrl);
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          const from = data.from || "peer";
          const txt = typeof data.text === "string" ? data.text : String(data.text ?? "");
          setMessages((prev) => [...prev, { from, text: txt }]);
        } catch (err) {
          // if server sends raw string
          setMessages((prev) => [...prev, { from: "peer", text: String(ev.data) }]);
        }
      };

      ws.onerror = (err) => {
        // console.error("ws error", err);
      };

      ws.onclose = () => {
        // console.log("ws closed");
        wsRef.current = null;
      };
    } catch (e) {
      // opening socket failed (maybe server doesn't support websockets)
      // console.warn("ws init failed", e);
    }

    return () => {
      cancelled = true;
      try {
        wsRef.current?.close();
      } catch (e) {}
      wsRef.current = null;
    };
  }, [matchId]);

  const send = async () => {
    if (!text) return;

    // prefer websocket if open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ text }));
        setMessages((prev) => [...prev, { from: "me", text }]);
      } catch (e) {
        // fallback to REST below
      }
    } else {
      // fallback POST to backend if websocket unavailable
      try {
        // endpoint assumed: POST /chat/:matchId/send  (adjust if different)
        await api.post(`/chat/${encodeURIComponent(String(matchId))}/send`, { text });
        setMessages((prev) => [...prev, { from: "me", text }]);
      } catch (e) {
        // handle error (optional)
        // console.error("failed to send via REST", e);
        alert("Failed to send message");
      }
    }

    setText("");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold">Chat</h1>

      <div className="mt-6 lg:flex gap-6">
        <div className="lg:flex-1 bg-white rounded p-4 shadow flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((m, i) => (
              <ChatBubble key={i} text={m.text} fromMe={m.from === "me"} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-2">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
