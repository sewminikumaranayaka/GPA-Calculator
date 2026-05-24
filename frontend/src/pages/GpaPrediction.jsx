import { TrendingUp } from 'lucide-react';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';

const scenarios = [
  ['Conservative', '3.54', 'Mostly B+ to A- outcomes'],
  ['Expected', '3.68', 'Current performance continues'],
  ['Ambitious', '3.82', 'Two additional A outcomes'],
];

export default function GpaPrediction() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Forecast"
        title="GPA Prediction"
        description="Compare projected GPA outcomes based on upcoming course performance and credit weight."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {scenarios.map(([label, value, helper], index) => (
          <MetricCard
            key={label}
            label={label}
            value={value}
            helper={helper}
            tone={index === 1 ? 'ocean' : index === 2 ? 'mint' : 'amber'}
          />
        ))}
      </div>

      <Panel title="Prediction Drivers">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Credit weight', 'High-credit modules have the largest impact on the final semester GPA.'],
            ['Grade volatility', 'Statistics has the widest possible swing between expected and ambitious cases.'],
            ['Study consistency', 'Sustained weekly practice keeps the expected GPA above 3.60.'],
          ].map(([title, body]) => (
            <article key={title} className="rounded-lg bg-slate-50 p-4">
              <TrendingUp className="mb-3 text-ocean" size={22} aria-hidden="true" />
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}
