"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Power, Activity } from "lucide-react";

interface VoiceProps {
  profileId?: string;
}

export default function VoiceInterrogation({ profileId = "demo-founder-123" }: VoiceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{ role: string; content: string }[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // --- PRE-WARM: Force permission request on load ---
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log("Microphone access pre-warmed.");
        stream.getTracks().forEach(track => track.stop()); // Stop immediately
      })
      .catch(e => console.log("Pre-warm failed, user will be prompted on click."));
  }, []);

  const toggleConnection = async () => {
    if (isConnected) {
      wsRef.current?.close();
      setIsConnected(false);
      return;
    }

    // Initialize Audio Engine
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    await audioContextRef.current.resume();

    const ws = new WebSocket(`ws://localhost:8000/ws/voice/interrogation/${profileId}`);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => setIsConnected(true);
    ws.onmessage = async (event) => {
        if (typeof event.data === "string") {
            const data = JSON.parse(event.data);
            if (data.type === "transcript") setTranscript(prev => [...prev, { role: data.role, content: data.content }]);
        } else if (event.data instanceof ArrayBuffer) {
            setIsSpeaking(true);
            const buffer = await audioContextRef.current!.decodeAudioData(event.data);
            const source = audioContextRef.current!.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current!.destination);
            source.onended = () => setIsSpeaking(false);
            source.start(0);
        }
    };
    wsRef.current = ws;
  };

    const startRecording = async () => {
    try {
      // Direct hardware request
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(audioBlob);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Critical Permission Error:", err);
      // Give the user a direct link to the settings page
      alert("Microphone denied. Copy/paste this into your browser: chrome://settings/content/microphone and ensure localhost:3000 is in the 'Allow' list.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // ... (Keep the rest of your return/UI code the same)
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-6 bg-black border border-neutral-800 rounded-xl shadow-2xl font-mono text-neutral-300">
      <div className="flex items-center justify-between w-full mb-6 pb-4 border-b border-neutral-800">
        <h2 className="text-xl font-bold tracking-wider text-white">AI VC INTERROGATION</h2>
        <button onClick={toggleConnection} className={`px-4 py-2 rounded-md font-bold text-sm ${isConnected ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
          {isConnected ? "DISCONNECT" : "CONNECT SYSTEM"}
        </button>
      </div>
      <div className="w-full h-80 overflow-y-auto mb-6 p-4 bg-neutral-900/50 rounded-lg border border-neutral-800 space-y-4 flex flex-col">
        {transcript.map((msg, idx) => (
          <div key={idx} className={`px-4 py-3 rounded-lg text-sm ${msg.role === "founder" ? "bg-blue-900/30 self-end" : "bg-emerald-900/30 self-start"}`}>
            {msg.content}
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        disabled={!isConnected || isSpeaking}
        className={`w-20 h-20 rounded-full ${isRecording ? "bg-red-500" : "bg-blue-600"}`}
      >
        {isRecording ? <Square size={32} /> : <Mic size={32} />}
      </button>
    </div>
  );
}