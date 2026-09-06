import { useState } from "react";
import Header, { type DomainMode } from "./components/Header";
import LocalAgentBar from "./components/LocalAgentBar";
import PolicyModal from "./components/PolicyModal";
import EnterpriseApp from "./domains/enterprise/EnterpriseApp";
import AcademicApp from "./domains/academic/AcademicApp";
import { DEFAULT_LLM_CONFIG, type LocalLlmConfig } from "./core/agent/localLlmClient";

export default function App() {
  const [domain, setDomain] = useState<DomainMode>("enterprise");
  const [llmConfig, setLlmConfig] = useState<LocalLlmConfig>(DEFAULT_LLM_CONFIG);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col">
      {/* Clean Modern Navbar */}
      <Header
        currentDomain={domain}
        onDomainChange={setDomain}
        onOpenPolicy={() => setIsPolicyOpen(true)}
      />

      {/* Discreet AI Engine Bar */}
      <LocalAgentBar config={llmConfig} onChangeConfig={setLlmConfig} />

      {/* Main App Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {domain === "enterprise" ? (
          <EnterpriseApp llmConfig={llmConfig} />
        ) : (
          <AcademicApp llmConfig={llmConfig} />
        )}
      </main>

      {/* Policy Modal */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        domain={domain}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            AI Escalation Referee · Hệ thống phân xử &amp; phê duyệt đơn tự động
          </span>
          <span className="font-mono-data text-[11px] text-slate-400">
            Engine: {llmConfig.model} · Local Inference
          </span>
        </div>
      </footer>
    </div>
  );
}
