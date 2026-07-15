export function EgressSplit({ priv, pub }: { priv: number; pub: number }) {
  const total = priv + pub || 1;
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const seg = (w: number, color: string, label: string, amount: number) => (
    <div className="h-6 rounded first:rounded-l-md last:rounded-r-md min-w-[4px]"
         style={{ width: `${(w / total) * 100}%`, background: color }}
         role="img" aria-label={`${label} ${fmt(amount)}`} />
  );
  return (
    <div>
      <div className="flex gap-[2px]">
        {priv > 0 && seg(priv, '#00a862', 'Private committed', priv)}
        {pub > 0 && seg(pub, '#b45309', 'Public uncommitted', pub)}
      </div>
      <div className="mt-2 flex gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-[#00a862]" /> Private committed · <b className="tabular-nums">{fmt(priv)}</b>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-[#b45309]" /> Public uncommitted · <b className="tabular-nums">{fmt(pub)}</b>
        </span>
      </div>
    </div>
  );
}
