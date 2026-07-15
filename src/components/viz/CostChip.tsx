import { Globe } from 'lucide-react';

const CHIP_TONE = {
  controlled: 'text-[#0057b8] bg-[#0057b8]/8 border-[#0057b8]/20',
  // De-amber: public egress is neutral slate + a globe icon, never warm.
  public: 'text-[#475569] bg-[#f8fafc] border-[#cbd5e1]',
  saving: 'text-[#00a862] bg-[#00a862]/8 border-[#00a862]/20',
} as const;

export function CostChip({ perGb, tone }: { perGb: number; tone: keyof typeof CHIP_TONE }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums ${CHIP_TONE[tone]}`}>
      {tone === 'public' && <Globe size={12} className="text-[#64748b]" aria-hidden="true" />}
      ${perGb.toFixed(2)}/GB
    </span>
  );
}
