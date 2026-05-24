export default function Panel({ title, children, className = '' }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:shadow-none ${className}`}>
      {title && <h3 className="mb-4 text-base font-semibold text-ink dark:text-slate-100">{title}</h3>}
      {children}
    </section>
  );
}
