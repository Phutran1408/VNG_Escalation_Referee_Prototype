import { useState } from "react";
import Header, { type DomainMode } from "./components/Header";
import LocalAgentBar from "./components/LocalAgentBar";
import EnterpriseApp from "./domains/enterprise/EnterpriseApp";
import AcademicApp from "./domains/academic/AcademicApp";
import { DEFAULT_LLM_CONFIG, type LocalLlmConfig } from "./core/agent/localLlmClient";

export default function App() {
  const [domain, setDomain] = useState<DomainMode>("academic");
  const [llmConfig, setLlmConfig] = useState<LocalLlmConfig>(DEFAULT_LLM_CONFIG);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased font-sans flex flex-col">
      {/* Header with Dual-Domain Option Switcher */}
      <Header currentDomain={domain} onDomainChange={setDomain} />

      {/* Local AI Agent Bar (Ollama + Rules Engine status) */}
      <LocalAgentBar config={llmConfig} onChangeConfig={setLlmConfig} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {domain === "enterprise" ? (
          <EnterpriseApp llmConfig={llmConfig} />
        ) : (
          <AcademicApp llmConfig={llmConfig} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            AI Escalation Referee Prototype · Spec A (The Escalation Referee) · OrganizationAI
          </span>
          <span className="font-mono-data text-[11px] text-slate-400">
            Lõi Agent: 🧠 Local Model ({llmConfig.model}) + 🛡️ Deterministic Rules Guardrails
          </span>
        </div>
      </footer>
    </div>
  );
}
