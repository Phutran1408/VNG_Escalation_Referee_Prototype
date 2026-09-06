import { useState, useEffect } from "react";
import { checkOllamaConnection, DEFAULT_LLM_CONFIG, type LocalLlmConfig } from "../core/agent/localLlmClient";

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
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: AI Status */}
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

          <span className="font-semibold text-slate-200">
            Lõi Agent SV2:
          </span>

          <span className="bg-slate-800 text-slate-300 font-mono-data px-2 py-0.5 rounded border border-slate-700">
            Hybrid (Rules Engine + Local Model)
          </span>

          {isOnline ? (
            <span className="text-emerald-400 font-medium">
              🟢 Ollama Online ({config.baseUrl})
            </span>
          ) : (
            <span className="text-amber-400 font-medium">
              ⚡ Local Rule Engine Fallback (Ollama Offline)
            </span>
          )}
        </div>

        {/* Right: Controls & Model Selector */}
        <div className="flex items-center gap-3">
          {/* Model selector */}
          {isOnline && (
            <div className="flex items-center gap-1.5">
              <label className="text-slate-400 text-[11px]">Model cục bộ:</label>
              <select
                value={config.model}
                onChange={(e) => onChangeConfig({ ...config, model: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono-data cursor-pointer"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Enable/disable toggle */}
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => onChangeConfig({ ...config, enabled: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-slate-700 text-indigo-500 focus:ring-indigo-400"
            />
            <span className="text-[11px]">Bật Local LLM</span>
          </label>

          {/* Refresh button */}
          <button
            type="button"
            onClick={refreshStatus}
            disabled={checking}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition-colors cursor-pointer"
            title="Kiểm tra lại kết nối Ollama"
          >
            {checking ? "Đang kiểm tra…" : "Kiểm tra"}
          </button>
        </div>
      </div>
    </div>
  );
}
