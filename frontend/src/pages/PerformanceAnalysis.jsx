import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';

const subjectScores = [
  ['Database Systems', 91, 'A'],
  ['Data Structures', 88, 'A'],
  ['Statistics', 79, 'B+'],
  ['Software Engineering', 84, 'A-'],
];

export default function PerformanceAnalysis() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Performance Analysis"
        description="Understand academic trends across subjects, credits, and semester-level performance indicators."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Best Subject" value="DB Systems" helper="Highest current score" tone="mint" />
        <MetricCard label="Avg Marks" value="85.5%" helper="Across active subjects" />
        <MetricCard label="Needs Focus" value="Statistics" helper="Largest grade lift opportunity" tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Subject Performance">
          <div className="space-y-4">
            {subjectScores.map(([subject, score, grade]) => (
              <div key={subject}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{subject}</span>
                  <span className="text-slate-500">{score}% · {grade}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-ocean" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Academic Pattern">
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <p>Performance is strongest in structured technical subjects with consistent assessment practice.</p>
            <p>Mathematical subjects show a moderate variance, suggesting targeted revision could improve GPA stability.</p>
            <p className="rounded-lg bg-mint/10 p-4 font-medium text-emerald-700">
              Recommended next step: increase statistics revision by 2 hours weekly.
            </p>
          </div>
        </Panel>
      </div>
    </section>
  );
}
