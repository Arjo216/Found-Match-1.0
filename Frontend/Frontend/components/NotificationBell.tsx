// components/NotificationBell.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Lock, FileText, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";

type Notification = {
  id: string;
  sender_name: string;
  type: "encrypted_message" | "vault_asset";
  timestamp: string;
};

// Mock data to preview the UI - replace with live DB fetching
const mockNotifications: Notification[] = [
  { id: "1", sender_name: "Asha Patel", type: "vault_asset", timestamp: "2 mins ago" },
  { id: "2", sender_name: "Apex Capital", type: "encrypted_message", timestamp: "1 hr ago" }
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // api.post(`/notifications/${id}/read`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] font-black text-white flex items-center justify-center border-2 border-slate-950 animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {/* The Solid Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            // 🛡️ FIX: Changed from bg-slate-900/90 to solid bg-slate-950 to prevent Kanban text bleeding!
            className="absolute right-0 mt-3 w-80 md:w-96 bg-slate-950 border border-slate-700 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.95)] overflow-hidden z-[99999]"
          >
            <div className="p-4 border-b border-white/10 bg-slate-900 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> Secure Activity
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                {notifications.length} New
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 mb-2 text-slate-700" />
                  Your Deal Room is caught up.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-slate-900 transition-colors flex gap-4 items-start group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${notif.type === 'vault_asset' ? 'bg-cyan-900/30 border-cyan-800 text-cyan-400' : 'bg-purple-900/30 border-purple-800 text-purple-400'}`}>
                      {notif.type === 'vault_asset' ? <FileText className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 font-medium leading-snug">
                        You have a new <span className="font-bold text-white">{notif.type === 'vault_asset' ? 'Encrypted Asset' : 'Secure Message'}</span> waiting in your Deal Room.
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">From: {notif.sender_name}</span>
                        <span className="text-xs text-slate-600">{notif.timestamp}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1"
                      title="Clear Notification"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 bg-slate-900 border-t border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" /> End-to-End Encrypted Transit
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}