import { useState, useEffect } from "react";
import { checkOllamaConnection, type LocalLlmConfig } from "../core/agent/localLlmClient";

interface Props {
  config: LocalLlmConfig;
  onChangeConfig: (cfg: LocalLlmConfig) => void;
}

export default function LocalAgentBar({ config, onChangeConfig }: Props) {
  const [checking, setChecking] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([config.model]);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    refreshStatus();
  }, []);

  async function refreshStatus() {
    setChecking(true);
    try {
      const res = await checkOllamaConnection(config.baseUrl);
      setIsOnline(res.online);
      if (res.online && res.models.length > 0) {
        setAvailableModels(res.models);
        if (!res.models.includes(config.model)) {
          onChangeConfig({ ...config, model: res.currentModel });
        }
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Model status indicator */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            {isOnline ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            )}
          </span>

          <span className="text-slate-400 font-medium">Mô hình phân xử:</span>

          {isOnline ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span>{config.model}</span>
              <span className="text-[10px] text-slate-400 font-mono-data">(Local Ollama)</span>
            </span>
          ) : (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <span>Quy tắc nội bộ</span>
              <span className="text-[10px] text-slate-400 font-mono-data">(Ollama offline)</span>
            </span>
          )}
        </div>

        {/* Right: Toggle & Controls */}
        <div className="flex items-center gap-3">
          {isOnline && availableModels.length > 1 && (
            <div className="flex items-center gap-1.5">
              <label className="text-slate-400 text-[11px]">Đổi model:</label>
              <select
                value={config.model}
                onChange={(e) => onChangeConfig({ ...config, model: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono-data cursor-pointer"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => onChangeConfig({ ...config, enabled: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-[11px] select-none">AI Reasoning</span>
          </label>

          <button
            type="button"
            onClick={refreshStatus}
            disabled={checking}
            className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Kiểm tra lại kết nối Ollama"
          >
            {checking ? "…" : "🔄"}
          </button>
        </div>
      </div>
    </div>
  );
}
