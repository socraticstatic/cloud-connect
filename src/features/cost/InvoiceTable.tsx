export function InvoiceTable({ lines, total }: {
  lines: { item: string; kind: 'circuit' | 'usage'; amount: number; note: string }[];
  total: number;
}) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Monthly consumption invoice</caption>
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
          <th className="py-2 font-medium">Item</th><th className="font-medium">Kind</th>
          <th className="text-right font-medium">Amount</th><th className="font-medium pl-4">Note</th>
        </tr>
      </thead>
      <tbody>
        {lines.map(l => (
          <tr key={l.item} className="border-b border-slate-100">
            <td className="py-2 text-slate-900">{l.item}</td>
            <td><span className={`rounded-full border px-2 py-0.5 text-[11px] ${
              l.kind === 'circuit' ? 'text-[#0057b8] border-[#0057b8]/25' : 'text-slate-600 border-slate-300'}`}>
              {l.kind}</span></td>
            <td className="text-right tabular-nums text-slate-900">${l.amount.toLocaleString()}</td>
            <td className="pl-4 text-slate-500">{l.note}</td>
          </tr>
        ))}
      </tbody>
      <tfoot><tr>
        <td className="py-2 font-semibold text-slate-900">Total</td><td />
        <td className="text-right font-semibold tabular-nums text-slate-900">${total.toLocaleString()}</td><td />
      </tr></tfoot>
    </table>
  );
}
