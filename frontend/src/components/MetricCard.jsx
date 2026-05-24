export default function MetricCard({ label, value, helper, tone = 'ocean' }) {
  const toneClasses = {
    ocean: 'bg-ocean/10 text-ocean',
    mint: 'bg-mint/10 text-emerald-700',
    amber: 'bg-amber/15 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      <div className={`mb-4 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${toneClasses[tone] || toneClasses.ocean}`}>
        {label}
      </div>
      <p className="text-3xl font-semibold text-ink dark:text-slate-100">{value}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
    </article>
  );
}
