import CourseTable from '../components/CourseTable.jsx';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';
import { useAcademicData } from '../hooks/useAcademicData.js';

export default function Dashboard() {
  const { courses, gpa } = useAcademicData();
  const credits = courses.reduce((sum, course) => sum + Number(course.credits), 0);

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Academic Performance Dashboard"
        description="Monitor GPA movement, credit completion, course outcomes, and AI-generated academic signals from one workspace."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Current GPA" value={gpa} helper="Weighted by course credits" />
        <MetricCard label="Credits" value={credits} helper="Active academic load" tone="mint" />
        <MetricCard label="Target GPA" value="3.80" helper="Planner benchmark" tone="amber" />
        <MetricCard label="Risk Level" value="Low" helper="Based on current trend" tone="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Current Courses">
          <CourseTable courses={courses} />
        </Panel>

        <Panel title="Semester Progress">
          <div className="space-y-5">
            {[
              ['Assignment completion', 86, 'bg-mint'],
              ['Attendance consistency', 92, 'bg-ocean'],
              ['Predicted target readiness', 74, 'bg-amber'],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{label}</span>
                  <span className="text-slate-500">{value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="AI Academic Signals">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-ink">Momentum</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Database Systems is carrying the strongest grade-point contribution.</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-ink">Focus Area</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Statistics has the most room for impact before the next GPA calculation.</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-ink">Planner Status</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">A 3.80 target remains realistic with two A-range course outcomes.</p>
          </div>
        </div>
      </Panel>
    </section>
  );
}
