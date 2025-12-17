// components/Toast.tsx
import React from "react";

export function Toast({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: ()=>void }) {
  return (
    <div className="toast-center fade-in">
      <div className="flex items-center gap-4 bg-white rounded-full px-4 py-2 shadow-lg">
        <div className="text-sm text-gray-700">{message}</div>
        {actionLabel && (
          <button onClick={onAction} className="text-sm text-blue-600 px-3 py-1 rounded hover:bg-blue-50">{actionLabel}</button>
        )}
      </div>
    </div>
  );
}
