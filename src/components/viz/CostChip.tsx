const CHIP_TONE = {
  controlled: 'text-[#0057b8] bg-[#0057b8]/8 border-[#0057b8]/20',
  public: 'text-[#b45309] bg-[#b45309]/8 border-[#b45309]/20',
  saving: 'text-[#00a862] bg-[#00a862]/8 border-[#00a862]/20',
} as const;

export function CostChip({ perGb, tone }: { perGb: number; tone: keyof typeof CHIP_TONE }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums ${CHIP_TONE[tone]}`}>
      ${perGb.toFixed(2)}/GB
    </span>
  );
}
