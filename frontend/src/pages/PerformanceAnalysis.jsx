import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Lightbulb,
  Loader2,
  RefreshCw,
  Target,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';
import { useAcademicData } from '../hooks/useAcademicData.js';
import { getAiAcademicAnalysis } from '../services/api.js';

export default function PerformanceAnalysis() {
  const { courses, gpa } = useAcademicData();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const payload = useMemo(
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

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAiAcademicAnalysis(payload);
      setAnalysis(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'AI analysis is unavailable. Start the backend and configure OPENAI_API_KEY.',
      );
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [payload]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const weakSubjects = analysis?.weakSubjects || [];
  const strengths = analysis?.performanceAnalysis?.strengths || [];
  const risks = analysis?.performanceAnalysis?.risks || [];
  const recommendations = analysis?.studyRecommendations || [];
  const topWeakSubject = weakSubjects[0]?.subject || getLowestCourse(courses)?.name || 'None';

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Performance Analysis"
        description="AI-reviewed subject performance, trend signals, weak areas, and practical study recommendations."
        action={
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={loadAnalysis}
            type="button"
          >
            {loading ? <Loader2 className="animate-spin" size={17} /> : <RefreshCw size={17} />}
            Refresh AI
          </button>
        }
      />

      {loading && <LoadingState />}

      {!loading && error && <ErrorState message={error} />}

      {!loading && !error && analysis && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Current GPA" value={gpa} helper="Sent to AI analysis" tone="ocean" />
            <MetricCard label="Weak Subjects" value={String(weakSubjects.length)} helper="Detected by AI" tone="amber" />
            <MetricCard label="Improvement Signals" value={String(strengths.length)} helper="Positive trend markers" tone="mint" />
            <MetricCard label="Needs Focus" value={topWeakSubject} helper="Highest priority area" tone="slate" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Panel>
              <SectionHeading
                icon={BrainCircuit}
                label="AI Performance Summary"
                title={analysis.performanceAnalysis.summary}
                helper={analysis.performanceAnalysis.gpaStanding}
              />
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-ink">Trend</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{analysis.performanceAnalysis.trend}</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TrendCard
                  icon={ArrowUpRight}
                  title="Improvement Trends"
                  tone="success"
                  items={strengths}
                  emptyText="No improvement trends were detected yet."
                />
                <TrendCard
                  icon={ArrowDownRight}
                  title="Decline Trends"
                  tone="warning"
                  items={risks}
                  emptyText="No decline trends were detected yet."
                />
              </div>
            </Panel>

            <Panel>
              <SectionHeading
                icon={Target}
                label="Weak Subject Detection"
                title="Priority Subjects"
                helper="AI-ranked courses with the largest performance risk."
              />
              <div className="mt-5 space-y-3">
                {weakSubjects.length > 0 ? (
                  weakSubjects.map((subject) => <WeakSubjectCard key={subject.subject} subject={subject} />)
                ) : (
                  <EmptyCard message="No weak subjects detected from the current course list." />
                )}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <Panel>
              <SectionHeading
                icon={Lightbulb}
                label="Academic Insights"
                title="What the AI Noticed"
                helper="Short signals generated from your grades and credits."
              />
              <div className="mt-5 space-y-3">
                {analysis.academicInsights.map((insight) => (
                  <InsightCard key={insight.title} insight={insight} />
                ))}
              </div>
            </Panel>

            <Panel>
              <SectionHeading
                icon={BrainCircuit}
                label="Recommendations"
                title="AI-Generated Study Plan"
                helper="Concrete actions to improve weak areas and protect current strengths."
              />
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {recommendations.map((recommendation) => (
                  <RecommendationCard
                    key={`${recommendation.subject}-${recommendation.recommendation}`}
                    recommendation={recommendation}
                  />
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}
    </section>
  );
}

function LoadingState() {
  return (
    <Panel>
      <div className="flex min-h-72 flex-col items-center justify-center text-center">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-ocean/10 text-ocean">
          <Loader2 className="animate-spin" size={28} aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-ink">Generating AI analysis</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Reviewing weak subjects, improvement signals, decline risks, and study recommendations.
        </p>
        <div className="mt-6 grid w-full max-w-2xl gap-3 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ErrorState({ message }) {
  return (
    <Panel>
      <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
        <AlertCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
        <div>
          <h3 className="text-sm font-semibold">AI analysis could not load</h3>
          <p className="mt-1 text-sm leading-6">{message}</p>
        </div>
      </div>
    </Panel>
  );
}

function SectionHeading({ helper, icon: Icon, label, title }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ocean/10 text-ocean">
        <Icon size={21} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-ocean">{label}</p>
        <h3 className="mt-1 text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{helper}</p>
      </div>
    </div>
  );
}

function TrendCard({ emptyText, icon: Icon, items, title, tone }) {
  const toneClasses = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
  };

  return (
    <article className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon size={18} aria-hidden="true" />
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>{emptyText}</li>}
      </ul>
    </article>
  );
}

function WeakSubjectCard({ subject }) {
  const riskClasses = {
    high: 'bg-rose-100 text-rose-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-700',
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-ink">{subject.subject}</h4>
          <p className="mt-1 text-xs text-slate-500">
            {subject.credits} credits · {subject.grade} · {Number(subject.gradePoints).toFixed(1)} points
          </p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${riskClasses[subject.riskLevel]}`}>
          {subject.riskLevel}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{subject.reason}</p>
    </article>
  );
}

function InsightCard({ insight }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-ink">{insight.title}</h4>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">{insight.priority}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{insight.insight}</p>
    </article>
  );
}

function RecommendationCard({ recommendation }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-ocean">{recommendation.subject}</p>
          <h4 className="mt-1 text-sm font-semibold text-ink">{recommendation.recommendation}</h4>
        </div>
        <span className="rounded-md bg-mint/10 px-2 py-1 text-xs font-semibold text-emerald-700">
          {recommendation.weeklyHours}h/wk
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
        {recommendation.actionItems.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function EmptyCard({ message }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">{message}</div>;
}

function getLowestCourse(courses) {
  return [...courses].sort((first, second) => Number(first.gradePoints) - Number(second.gradePoints))[0] || null;
}
