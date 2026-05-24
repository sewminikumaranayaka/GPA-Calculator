import { BookOpenCheck, Clock3, ShieldAlert } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';

const recommendations = [
  {
    title: 'Prioritize Statistics Revision',
    detail: 'Use two focused weekly sessions for probability, hypothesis testing, and past-paper review.',
    priority: 'High',
    icon: ShieldAlert,
  },
  {
    title: 'Protect Database Momentum',
    detail: 'Keep one SQL optimization practice block before each lab assessment.',
    priority: 'Medium',
    icon: BookOpenCheck,
  },
  {
    title: 'Balance Study Load',
    detail: 'Reserve 45-minute review slots after lectures to reduce end-of-week catch-up pressure.',
    priority: 'Medium',
    icon: Clock3,
  },
];

export default function StudyRecommendations() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="AI Guidance"
        title="Study Recommendations"
        description="Review prioritized actions generated from GPA trends, subject performance, and academic workload."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {recommendations.map(({ title, detail, priority, icon: Icon }) => (
          <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-ocean/10 text-ocean">
                <Icon size={23} aria-hidden="true" />
              </div>
              <span className="rounded-md bg-amber/15 px-2 py-1 text-xs font-semibold text-amber-700">
                {priority}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
            <button className="mt-5 w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Mark as planned
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
