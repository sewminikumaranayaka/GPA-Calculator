export default function Panel({ title, children, className = '' }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-soft ${className}`}>
      {title && <h3 className="mb-4 text-base font-semibold text-ink">{title}</h3>}
      {children}
    </section>
  );
}
