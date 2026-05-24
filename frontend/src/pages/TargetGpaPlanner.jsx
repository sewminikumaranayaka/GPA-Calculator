import { Target } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';
import { useAcademicData } from '../hooks/useAcademicData.js';

export default function TargetGpaPlanner() {
  const { gpa } = useAcademicData();
  const targetGpa = 3.8;
  const gap = Math.max(targetGpa - Number(gpa), 0).toFixed(2);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Planner"
        title="Target GPA Planner"
        description="Model the grades needed to reach a desired GPA and prioritize the courses with the highest impact."
      />

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Panel>
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-ink text-white">
            <Target size={30} aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-ocean">Target GPA</p>
          <p className="mt-2 text-5xl font-semibold text-ink">{targetGpa.toFixed(2)}</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Current GPA is {gpa}. The remaining gap is {gap} grade points.
          </p>
        </Panel>

        <Panel title="Required Outcome Plan">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Data Structures', 'A', 'High impact'],
              ['Statistics', 'A-', 'Medium impact'],
              ['Database Systems', 'A', 'High impact'],
            ].map(([course, grade, impact]) => (
              <article key={course} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-ink">{course}</p>
                <p className="mt-3 text-3xl font-semibold text-ocean">{grade}</p>
                <p className="mt-2 text-sm text-slate-500">{impact}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}
