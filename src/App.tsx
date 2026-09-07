import { useState } from "react";
import Header, { type DomainMode, type UserRole } from "./components/Header";
import LocalAgentBar from "./components/LocalAgentBar";
import PolicyModal from "./components/PolicyModal";
import StandardFormModal from "./components/StandardFormModal";
import ApplicantPortal from "./components/ApplicantPortal";
import ReviewerPortal from "./components/ReviewerPortal";
import { DEFAULT_LLM_CONFIG, type LocalLlmConfig } from "./core/agent/localLlmClient";

export default function App() {
  const [domain, setDomain] = useState<DomainMode>("enterprise");
  const [userRole, setUserRole] = useState<UserRole>("reviewer");
  const [llmConfig, setLlmConfig] = useState<LocalLlmConfig>({
    ...DEFAULT_LLM_CONFIG,
    model: "qwen3-vl:4b", // Sử dụng model 4b mặc định
  });
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isStandardFormOpen, setIsStandardFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col">
      {/* Clean Modern Navbar */}
      <Header
        currentDomain={domain}
        onDomainChange={setDomain}
        userRole={userRole}
        onRoleChange={setUserRole}
        onOpenPolicy={() => setIsPolicyOpen(true)}
        onOpenStandardForm={() => setIsStandardFormOpen(true)}
      />

      {/* Discreet AI Engine Bar */}
      <LocalAgentBar config={llmConfig} onChangeConfig={setLlmConfig} />

      {/* Main App Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {userRole === "applicant" ? (
          <ApplicantPortal key={domain} domain={domain} />
        ) : (
          <ReviewerPortal
            key={domain}
            domain={domain}
            llmConfig={llmConfig}
          />
        )}
      </main>

      {/* Policy Modal */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        domain={domain}
      />

      {/* Standard Form Modal */}
      <StandardFormModal
        isOpen={isStandardFormOpen}
        onClose={() => setIsStandardFormOpen(false)}
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
