import {
  AlertCircle,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';
import { useAcademicData } from '../hooks/useAcademicData.js';
import { generateStudyRecommendations } from '../services/api.js';

const priorityTone = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-700',
};

export default function StudyRecommendations() {
  const { courses, gpa } = useAcademicData();
  const [engine, setEngine] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const payload = useMemo(
    () => ({
      currentGpa: Number(gpa),
      targetGpa: 3.8,
      weeklyStudyHours: 10,
      learningPreference: 'practice',
      courses: courses.map((course) => ({
        name: course.name,
        credits: Number(course.credits),
        grade: course.grade,
        gradePoints: Number(course.gradePoints),
      })),
    }),
    [courses, gpa],
  );

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await generateStudyRecommendations(payload);
      setEngine(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Study recommendation engine is unavailable.');
      setEngine(null);
    } finally {
      setLoading(false);
    }
  }, [payload]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const weakSubjects = engine?.weakSubjects || [];
  const priorities = engine?.studyPriorities || [];
  const weeklyPlan = engine?.weeklyStudyPlan?.sessions || [];
  const recommendations = engine?.personalizedRecommendations || [];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="AI Guidance"
        title="Study Recommendations"
        description="AI-powered weak-subject detection, study priorities, weekly planning, and personalized next steps."
        action={
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={loadRecommendations}
            type="button"
          >
            {loading ? <Loader2 className="animate-spin" size={17} /> : <RefreshCw size={17} />}
            Refresh Plan
          </button>
        }
      />

      {loading && <LoadingState />}

      {!loading && error && <ErrorState message={error} />}

      {!loading && !error && engine && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Weekly Study Load" value={`${engine.summary.weeklyStudyHours}h`} helper="Recommended schedule" tone="ocean" />
            <MetricCard label="Weak Subjects" value={String(engine.summary.weakSubjectCount)} helper="Ranked by grade and credit risk" tone="rose" />
            <MetricCard label="Top Priority" value={engine.summary.topPriority} helper="Start here this week" tone="amber" />
            <MetricCard label="Target GPA" value={engine.summary.targetGpa.toFixed(2)} helper={`Current GPA ${gpa}`} tone="mint" />
          </div>

          <Panel>
            <SectionHeading
              icon={Sparkles}
              label="Recommendation Engine"
              title="Personalized Study Strategy"
              helper={engine.summary.message}
            />
          </Panel>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Panel>
              <SectionHeading
                icon={Target}
                label="Study Priorities"
                title="What to Work on First"
                helper="Priority is based on grade gap, credits, and risk level."
              />
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {priorities.map((priority) => (
                  <PriorityCard key={priority.subject} priority={priority} />
                ))}
              </div>
            </Panel>

            <Panel>
              <SectionHeading
                icon={ShieldAlert}
                label="Weak Subjects"
                title="Risk Analysis"
                helper="Subjects that need extra review to protect GPA outcomes."
              />
              <div className="mt-5 space-y-3">
                {weakSubjects.length > 0 ? (
                  weakSubjects.map((subject) => <WeakSubjectCard key={subject.subject} subject={subject} />)
                ) : (
                  <EmptyCard message="No weak subjects were detected. Keep a maintenance review rhythm." />
                )}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <Panel>
              <SectionHeading
                icon={CalendarDays}
                label="Weekly Plan"
                title={`${engine.weeklyStudyPlan.totalHours} Planned Hours`}
                helper="A balanced schedule generated from your priority subjects."
              />
              <div className="mt-5 space-y-3">
                {weeklyPlan.map((session) => (
                  <PlanSession key={`${session.day}-${session.subject}`} session={session} />
                ))}
              </div>
            </Panel>

            <Panel>
              <SectionHeading
                icon={BrainCircuit}
                label="Personalized Advice"
                title="Recommended Actions"
                helper="Practical guidance tailored to the current course list and GPA target."
              />
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {recommendations.map((recommendation) => (
                  <AdviceCard key={recommendation.title} recommendation={recommendation} />
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
        <h3 className="mt-5 text-lg font-semibold text-ink">Generating study plan</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Analyzing weak subjects, credit impact, weekly study capacity, and personalized priorities.
        </p>
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
          <h3 className="text-sm font-semibold">Recommendations could not load</h3>
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

function PriorityCard({ priority }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-ocean">Priority {priority.rank}</p>
          <h4 className="mt-1 text-base font-semibold text-ink">{priority.subject}</h4>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${priorityTone[priority.priority]}`}>
          {priority.priority}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
        <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1">
          <Clock3 size={14} aria-hidden="true" />
          {priority.weeklyHours}h/week
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1">
          <BookOpenCheck size={14} aria-hidden="true" />
          {priority.focus}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{priority.rationale}</p>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
        {priority.actions.map((action) => (
          <li key={action} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={16} aria-hidden="true" />
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function WeakSubjectCard({ subject }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-ink">{subject.subject}</h4>
          <p className="mt-1 text-xs text-slate-500">
            {subject.credits} credits | {subject.grade} | {Number(subject.gradePoints).toFixed(1)} points
          </p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${priorityTone[subject.riskLevel]}`}>
          {subject.riskLevel}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-ocean" style={{ width: `${subject.weaknessScore}%` }} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{subject.reason}</p>
    </article>
  );
}

function PlanSession({ session }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{session.day}</p>
          <p className="mt-1 text-sm text-slate-600">{session.subject}</p>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
          {session.durationHours}h
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{session.activity}</p>
    </article>
  );
}

function AdviceCard({ recommendation }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-ocean">{recommendation.category}</p>
          <h4 className="mt-1 text-sm font-semibold text-ink">{recommendation.title}</h4>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${priorityTone[recommendation.priority]}`}>
          {recommendation.priority}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{recommendation.recommendation}</p>
    </article>
  );
}

function EmptyCard({ message }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">{message}</div>;
}
