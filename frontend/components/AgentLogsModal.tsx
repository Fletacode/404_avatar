"use client";

import { useState, useEffect } from "react";
import { CloseIcon } from "./CloseIcon";

interface AgentLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentLogsModal({ isOpen, onClose }: AgentLogsModalProps) {
  const [logs, setLogs] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/agent-logs");
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
      } else {
        setLogs(data.message || "Failed to load logs");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs("Error fetching logs: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      
      if (autoRefresh) {
        const interval = setInterval(fetchLogs, 2000); // 2초마다 새로고침
        return () => clearInterval(interval);
      }
    }
  }, [isOpen, autoRefresh]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Agent Worker 로그</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">자동 새로고침</span>
            </label>
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "로딩..." : "새로고침"}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-black text-green-400 p-4 rounded-lg overflow-auto font-mono text-sm">
            {logs ? (
              <pre className="whitespace-pre-wrap">{logs}</pre>
            ) : (
              <div className="text-gray-500">로그가 없습니다. Agent가 아직 시작되지 않았을 수 있습니다.</div>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
