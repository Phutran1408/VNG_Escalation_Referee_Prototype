import { useState } from "react";
import Header, { type DomainMode } from "./components/Header";
import EnterpriseApp from "./domains/enterprise/EnterpriseApp";
import AcademicApp from "./domains/academic/AcademicApp";

export default function App() {
  const [domain, setDomain] = useState<DomainMode>("academic");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased font-sans flex flex-col">
      {/* Header with Dual-Domain Option Switcher */}
      <Header currentDomain={domain} onDomainChange={setDomain} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {domain === "enterprise" ? <EnterpriseApp /> : <AcademicApp />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            AI Escalation Referee Prototype · Spec A (The Escalation Referee) · OrganizationAI
          </span>
          <span className="font-mono-data text-[11px] text-slate-400">
            Hỗ trợ 2 ngữ cảnh: 🏢 Doanh nghiệp (Enterprise HR) & 🎓 Trường học (Student Leave)
          </span>
        </div>
      </footer>
    </div>
  );
}
