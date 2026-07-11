import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import LMCCRequirementsPage from './components/pages/LMCCRequirementsPage';
import { Printer, LayoutTemplate } from 'lucide-react';

function DesignDisclaimer({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-fw-heading/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-fw-secondary bg-fw-base">
        <div className="h-1 bg-fw-primary" />
        <div className="px-10 py-10">
          <div className="flex items-start gap-5 mb-7">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-fw-accent border border-fw-active/30 flex items-center justify-center">
              <LayoutTemplate className="w-6 h-6 text-fw-link" />
            </div>
            <div>
              <p className="text-figma-xs font-semibold text-fw-link uppercase tracking-[0.08em] mb-1.5">Product Design Assets</p>
              <h2 className="text-figma-2xl font-bold text-fw-heading tracking-[-0.03em] leading-tight">
                Not part of the AT&T Cloud Connect portal
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-figma-base text-fw-body leading-relaxed mb-9">
            <p>
              These are <strong className="font-semibold text-fw-heading">product design assets for the AT&T AWS LMCC Interconnect</strong> — not a shipping product, live system, or official AT&T interface.
            </p>
            <p>
              They translate the LMCC Product Notes (04092026) into interactive format so stakeholders can review flow logic, copy, error states, and billing behavior before engineering begins. Every word, status label, and data constraint traces directly to the product specification.
            </p>
            <p className="text-fw-bodyLight">
              Data shown is illustrative. No real connections, accounts, or billing records are created or modified.
            </p>
          </div>

          <button
            onClick={onDismiss}
            className="w-full py-3.5 rounded-xl bg-fw-primary text-white text-figma-base font-semibold hover:bg-fw-linkHover transition-colors"
          >
            I understand — view the design assets
          </button>
        </div>
      </div>
    </div>
  );
}

function DemoApp() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-fw-wash">
      {!dismissed && <DesignDisclaimer onDismiss={() => setDismissed(true)} />}
      <div className="h-12 bg-fw-base border-b border-fw-secondary flex items-center px-6 gap-3 shrink-0 no-print">
        <span className="text-base font-bold tracking-[-0.03em] text-brand-accent">AT&T</span>
        <span className="text-base font-bold text-fw-heading tracking-[-0.03em]">
          Cloud Connect
        </span>
        <span className="h-4 border-l border-fw-secondary" />
        <span className="text-figma-xs text-fw-bodyLight">LMCC Product Design Assets</span>
        <div className="ml-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-fw-secondary text-figma-xs font-medium text-fw-body hover:border-fw-active hover:text-fw-link transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <LMCCRequirementsPage />
      </div>
    </div>
  );
}

createRoot(document.getElementById('demo-root')!).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>
);
