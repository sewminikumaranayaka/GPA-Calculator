import {
  AlertTriangle,
  ArrowUpRight,
  BookOpenCheck,
  Download,
  GraduationCap,
  Loader2,
  Target,
  TrendingUp,
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import GpaReportPdf from '../components/GpaReportPdf.jsx';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';
import { useAcademicData } from '../hooks/useAcademicData.js';
import { getAiAcademicAnalysis } from '../services/api.js';
import { buildAcademicReportData } from '../utils/academicReport.js';

const chartMargins = { top: 12, right: 18, left: -18, bottom: 0 };

export default function Dashboard() {
  const { courses, gpa } = useAcademicData();
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const report = useMemo(() => buildAcademicReportData(courses, gpa), [courses, gpa]);
  const aiPayload = useMemo(
    () => ({
      semesterGpa: Number(gpa),
      cumulativeGpa: Number(gpa),
      targetGpa: 3.8,
      courses: courses.map((course) => ({
        name: course.name,
        credits: Number(course.credits),
        grade: course.grade,
        gradePoints: Number(course.gradePoints),
      })),
    }),
    [courses, gpa],
  );

  const loadAiAnalysis = useCallback(async () => {
    try {
      const response = await getAiAcademicAnalysis(aiPayload);
      setAiAnalysis(response.data);
    } catch {
      setAiAnalysis(null);
    }
  }, [aiPayload]);

  useEffect(() => {
    loadAiAnalysis();
  }, [loadAiAnalysis]);

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Academic Performance Dashboard"
        description="Track GPA movement, subject strength, credit load, and focus areas from one responsive workspace."
        action={<PdfExportButton aiAnalysis={aiAnalysis} report={report} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Semester GPA" value={gpa} helper="Current weighted GPA" tone="ocean" />
        <MetricCard
          label="Cumulative GPA"
          value={report.projectedCumulativeGpa.toFixed(2)}
          helper="Projected with current term"
          tone="mint"
        />
        <MetricCard label="Credits" value={report.credits.toFixed(1)} helper="Current semester load" tone="amber" />
        <MetricCard label="Subjects" value={String(report.completedSubjects)} helper="Included in calculation" tone="slate" />
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
              <LineChart data={report.trendData} margin={chartMargins}>
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
              <p className="mt-2 text-5xl font-semibold text-ink">{report.projectedCumulativeGpa.toFixed(2)}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Weighted projection using prior academic history and the active semester subjects.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <InsightPill icon={Target} label="Target Distance" value={`${Math.max(0, 3.8 - report.projectedCumulativeGpa).toFixed(2)} GPA`} />
            <InsightPill icon={BookOpenCheck} label="Quality Points" value={report.qualityPoints.toFixed(1)} />
            <InsightPill
              icon={ArrowUpRight}
              label="Strongest Subject"
              value={report.strongestSubject ? report.strongestSubject.name : 'No subjects'}
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
              <BarChart data={report.subjectData} margin={chartMargins}>
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
            {report.weakSubjects.map((subject) => (
              <WeakSubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function PdfExportButton({ aiAnalysis, report }) {
  const fileName = `gpa-report-${new Date().toISOString().slice(0, 10)}.pdf`;

  return (
    <PDFDownloadLink
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      document={<GpaReportPdf aiAnalysis={aiAnalysis} report={report} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <>
          {loading ? <Loader2 className="animate-spin" size={17} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
          {loading ? 'Preparing PDF' : 'Export PDF'}
        </>
      )}
    </PDFDownloadLink>
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
