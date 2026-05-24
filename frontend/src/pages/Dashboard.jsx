import {
  AlertTriangle,
  ArrowUpRight,
  BookOpenCheck,
  GraduationCap,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';
import { useAcademicData } from '../hooks/useAcademicData.js';

const gpaTrend = [
  { term: 'Y1 S1', semesterGpa: 3.22, cumulativeGpa: 3.22 },
  { term: 'Y1 S2', semesterGpa: 3.36, cumulativeGpa: 3.29 },
  { term: 'Y2 S1', semesterGpa: 3.48, cumulativeGpa: 3.36 },
  { term: 'Y2 S2', semesterGpa: 3.58, cumulativeGpa: 3.43 },
  { term: 'Current', semesterGpa: null, cumulativeGpa: null },
];

const chartMargins = { top: 12, right: 18, left: -18, bottom: 0 };

export default function Dashboard() {
  const { courses, gpa } = useAcademicData();
  const numericGpa = Number(gpa);
  const credits = courses.reduce((sum, course) => sum + Number(course.credits), 0);
  const qualityPoints = courses.reduce(
    (sum, course) => sum + Number(course.credits) * Number(course.gradePoints),
    0,
  );
  const projectedCumulativeGpa = calculateProjectedCumulativeGpa(numericGpa);
  const completedSubjects = courses.length;
  const weakSubjects = getWeakSubjects(courses);
  const strongestSubject = getStrongestSubject(courses);
  const trendData = gpaTrend.map((term) =>
    term.term === 'Current'
      ? { ...term, semesterGpa: numericGpa, cumulativeGpa: projectedCumulativeGpa }
      : term,
  );
  const subjectData = courses.map((course) => ({
    name: compactSubjectName(course.name),
    fullName: course.name,
    grade: course.grade,
    credits: Number(course.credits),
    performance: Number(course.gradePoints),
    qualityPoints: Number((Number(course.credits) * Number(course.gradePoints)).toFixed(1)),
  }));

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Academic Performance Dashboard"
        description="Track GPA movement, subject strength, credit load, and focus areas from one responsive workspace."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Semester GPA" value={gpa} helper="Current weighted GPA" tone="ocean" />
        <MetricCard
          label="Cumulative GPA"
          value={projectedCumulativeGpa.toFixed(2)}
          helper="Projected with current term"
          tone="mint"
        />
        <MetricCard label="Credits" value={credits.toFixed(1)} helper="Current semester load" tone="amber" />
        <MetricCard label="Subjects" value={String(completedSubjects)} helper="Included in calculation" tone="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <Panel className="min-h-[380px]">
          <ChartHeader
            icon={TrendingUp}
            label="GPA Trend"
            title="Semester and Cumulative GPA"
            helper="Current semester is blended into the cumulative projection."
          />
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={chartMargins}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="term" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis
                  domain={[2.5, 4]}
                  tickCount={4}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip content={<TrendTooltip />} />
                <Line
                  type="monotone"
                  dataKey="semesterGpa"
                  name="Semester GPA"
                  stroke="#136f8f"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeGpa"
                  name="Cumulative GPA"
                  stroke="#2fbf9b"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ink text-white">
              <GraduationCap size={21} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase text-ocean">Cumulative GPA</p>
              <p className="mt-2 text-5xl font-semibold text-ink">{projectedCumulativeGpa.toFixed(2)}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Weighted projection using prior academic history and the active semester subjects.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <InsightPill icon={Target} label="Target Distance" value={`${Math.max(0, 3.8 - projectedCumulativeGpa).toFixed(2)} GPA`} />
            <InsightPill icon={BookOpenCheck} label="Quality Points" value={qualityPoints.toFixed(1)} />
            <InsightPill
              icon={ArrowUpRight}
              label="Strongest Subject"
              value={strongestSubject ? strongestSubject.name : 'No subjects'}
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel className="min-h-[390px]">
          <ChartHeader
            icon={BookOpenCheck}
            label="Subject Performance"
            title="Grade Points by Subject"
            helper="Bars show grade points on a 4.00 scale with credit-weighted contribution in the tooltip."
          />
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} margin={chartMargins}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 4]}
                  tickCount={5}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip content={<SubjectTooltip />} />
                <Bar dataKey="performance" name="Grade Points" fill="#136f8f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <ChartHeader
            icon={AlertTriangle}
            label="Focus Areas"
            title="Weak Subject Highlights"
            helper="Subjects with the largest opportunity to lift GPA."
          />

          <div className="mt-5 space-y-3">
            {weakSubjects.map((subject) => (
              <WeakSubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function ChartHeader({ helper, icon: Icon, label, title }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ocean/10 text-ocean">
        <Icon size={21} aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-ocean">{label}</p>
        <h3 className="mt-1 text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{helper}</p>
      </div>
    </div>
  );
}

function InsightPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-ocean shadow-sm">
        <Icon size={18} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

function WeakSubjectCard({ subject }) {
  const recoveryPoints = Math.max(0, 3.7 - Number(subject.gradePoints));

  return (
    <article className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-ink">{subject.name}</h4>
          <p className="mt-1 text-xs text-slate-600">
            {subject.credits} credits · Grade {subject.grade}
          </p>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-amber-700">
          {Number(subject.gradePoints).toFixed(1)}
        </span>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">Recovery gap</span>
          <span className="text-slate-500">{recoveryPoints.toFixed(1)} points</span>
        </div>
        <div className="h-2 rounded-full bg-white">
          <div
            className="h-2 rounded-full bg-amber"
            style={{ width: `${Math.min(100, (Number(subject.gradePoints) / 4) * 100)}%` }}
          />
        </div>
      </div>
    </article>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
      <p className="text-sm font-semibold text-ink">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 text-xs text-slate-600">
          <span className="font-semibold" style={{ color: item.stroke }}>
            {item.name}:
          </span>{' '}
          {Number(item.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

function SubjectTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const subject = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
      <p className="text-sm font-semibold text-ink">{subject.fullName}</p>
      <p className="mt-1 text-xs text-slate-600">Grade: {subject.grade}</p>
      <p className="mt-1 text-xs text-slate-600">Credits: {subject.credits}</p>
      <p className="mt-1 text-xs text-slate-600">Quality points: {subject.qualityPoints.toFixed(1)}</p>
    </div>
  );
}

function getWeakSubjects(courses) {
  return [...courses]
    .sort((first, second) => Number(first.gradePoints) - Number(second.gradePoints))
    .slice(0, Math.min(3, courses.length));
}

function getStrongestSubject(courses) {
  return [...courses].sort((first, second) => Number(second.gradePoints) - Number(first.gradePoints))[0] || null;
}

function calculateProjectedCumulativeGpa(currentGpa) {
  const previousCredits = 42;
  const previousGpa = 3.43;
  const currentCredits = 10;

  return ((previousGpa * previousCredits) + (currentGpa * currentCredits)) / (previousCredits + currentCredits);
}

function compactSubjectName(name) {
  const words = name.split(' ').filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 10);
  }

  return words.map((word) => word[0]).join('').slice(0, 8).toUpperCase();
}
