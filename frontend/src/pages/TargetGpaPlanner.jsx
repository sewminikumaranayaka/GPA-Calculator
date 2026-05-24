import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';
import { useAcademicData } from '../hooks/useAcademicData.js';
import { planTargetGpa } from '../services/api.js';

const initialCourses = [
  createCourse('Advanced Algorithms', 3),
  createCourse('Research Methods', 3),
  createCourse('Machine Learning', 4),
];

const classificationStyles = {
  achievable: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  difficult: 'border-amber-200 bg-amber-50 text-amber-700',
  impossible: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function TargetGpaPlanner() {
  const { gpa } = useAcademicData();
  const [currentGpa, setCurrentGpa] = useState(gpa);
  const [targetGpa, setTargetGpa] = useState(3.8);
  const [completedCredits, setCompletedCredits] = useState(42);
  const [courses, setCourses] = useState(initialCourses);
  const [errors, setErrors] = useState({});
  const [plan, setPlan] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const localPlan = useMemo(
    () => calculateLocalPlan(currentGpa, targetGpa, completedCredits, courses),
    [completedCredits, courses, currentGpa, targetGpa],
  );
  const visiblePlan = plan || localPlan;

  function updateCourse(id, field, value) {
    setCourses((current) => current.map((course) => (course.id === id ? { ...course, [field]: value } : course)));
    setPlan(null);
    setApiError(null);
  }

  function addCourse() {
    setCourses((current) => [...current, createCourse('', 3)]);
  }

  function removeCourse(id) {
    setCourses((current) => (current.length === 1 ? current : current.filter((course) => course.id !== id)));
    setPlan(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validatePlannerForm(currentGpa, targetGpa, completedCredits, courses);
    setErrors(nextErrors);
    setApiError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await planTargetGpa({
        currentGpa: Number(currentGpa),
        targetGpa: Number(targetGpa),
        completedCredits: Number(completedCredits),
        courses: courses.map((course) => ({
          name: course.name.trim(),
          credits: Number(course.credits),
        })),
      });
      setPlan(response.data);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Could not generate target GPA plan.');
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Planner"
        title="Target GPA Planner"
        description="Set a target GPA, calculate the semester grades required, and see whether the plan is achievable, difficult, or impossible."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Target GPA" value={Number(targetGpa || 0).toFixed(2)} helper="Desired cumulative GPA" tone="ocean" />
        <MetricCard
          label="Required Semester"
          value={visiblePlan.requiredSemesterGpa.toFixed(2)}
          helper={plan ? 'Calculated by backend' : 'Live local preview'}
          tone="amber"
        />
        <MetricCard
          label="Max Possible"
          value={visiblePlan.maxPossibleCumulativeGpa.toFixed(2)}
          helper="If every planned credit earns 4.00"
          tone="mint"
        />
        <MetricCard label="Status" value={formatClassification(visiblePlan.classification)} helper="Target difficulty" tone="slate" />
      </div>

      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
        <Panel>
          <div className="grid gap-4 border-b border-slate-200 pb-5 md:grid-cols-3">
            <label>
              <FieldLabel>Current GPA</FieldLabel>
              <NumberInput error={errors.currentGpa} max="4" min="0" onChange={setCurrentGpa} step="0.01" value={currentGpa} />
            </label>
            <label>
              <FieldLabel>Target GPA</FieldLabel>
              <NumberInput error={errors.targetGpa} max="4" min="0" onChange={setTargetGpa} step="0.01" value={targetGpa} />
            </label>
            <label>
              <FieldLabel>Completed credits</FieldLabel>
              <NumberInput
                error={errors.completedCredits}
                min="0"
                onChange={setCompletedCredits}
                step="0.5"
                value={completedCredits}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Planned Courses</h3>
              <p className="mt-1 text-sm text-slate-500">Add remaining courses and credit weights for the target plan.</p>
            </div>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={addCourse}
              type="button"
            >
              <Plus size={17} aria-hidden="true" />
              Add course
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {courses.map((course, index) => (
              <CourseInputCard
                key={course.id}
                course={course}
                errors={errors[course.id] || {}}
                index={index}
                onRemove={removeCourse}
                onUpdate={updateCourse}
                removable={courses.length > 1}
              />
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-ink text-white">
            <Target size={28} aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-ocean">Target Classification</p>
          <div className={`mt-3 rounded-lg border p-4 ${classificationStyles[visiblePlan.classification]}`}>
            <p className="text-3xl font-semibold">{formatClassification(visiblePlan.classification)}</p>
            <p className="mt-2 text-sm leading-6">{classificationMessage(visiblePlan)}</p>
          </div>

          {apiError && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 shrink-0" size={16} />
              <span>{apiError}</span>
            </div>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <SummaryItem label="Required grade" value={visiblePlan.requiredGrade} />
            <SummaryItem label="Planned credits" value={visiblePlan.plannedCredits.toFixed(1)} />
            <SummaryItem label="Completed" value={Number(completedCredits || 0).toFixed(1)} />
            <SummaryItem label="Gap" value={Math.max(0, Number(targetGpa || 0) - Number(currentGpa || 0)).toFixed(2)} />
          </dl>

          <button
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading}
            type="submit"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <TrendingUp size={18} />}
            Generate target plan
          </button>
        </Panel>
      </form>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Required Outcome Plan">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visiblePlan.gradePlan.map((course) => (
              <GradePlanCard key={course.name} course={course} />
            ))}
          </div>
        </Panel>

        <Panel title="Recommendation Cards">
          <div className="space-y-3">
            {visiblePlan.recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.title} recommendation={recommendation} />
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function CourseInputCard({ course, errors, index, onRemove, onUpdate, removable }) {
  return (
    <section className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_140px_48px]">
      <label>
        <FieldLabel>Course {index + 1}</FieldLabel>
        <TextInput
          error={errors.name}
          onChange={(value) => onUpdate(course.id, 'name', value)}
          placeholder="Course name"
          value={course.name}
        />
      </label>
      <label>
        <FieldLabel>Credits</FieldLabel>
        <NumberInput
          error={errors.credits}
          min="0"
          onChange={(value) => onUpdate(course.id, 'credits', value)}
          step="0.5"
          value={course.credits}
        />
      </label>
      <div className="flex items-end">
        <button
          aria-label="Remove planned course"
          className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!removable}
          onClick={() => onRemove(course.id)}
          type="button"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </section>
  );
}

function GradePlanCard({ course }) {
  const impactClasses = {
    high: 'bg-rose-100 text-rose-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-700',
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{course.name}</p>
          <p className="mt-1 text-xs text-slate-500">{course.credits} credits</p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${impactClasses[course.impact]}`}>
          {course.impact}
        </span>
      </div>
      <p className="mt-4 text-4xl font-semibold text-ocean">{course.requiredGrade}</p>
      <p className="mt-2 text-sm text-slate-500">{course.requiredGradePoints.toFixed(2)} required grade points</p>
    </article>
  );
}

function RecommendationCard({ recommendation }) {
  const priorityClass = {
    medium: 'bg-ocean/10 text-ocean',
    high: 'bg-amber-100 text-amber-700',
    critical: 'bg-rose-100 text-rose-700',
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 shrink-0 text-ocean" size={18} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-ink">{recommendation.title}</h4>
            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${priorityClass[recommendation.priority]}`}>
              {recommendation.priority}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.body}</p>
        </div>
      </div>
    </article>
  );
}

function FieldLabel({ children }) {
  return <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{children}</span>;
}

function TextInput({ error, onChange, value, ...props }) {
  return (
    <div>
      <input className={inputClassName(error)} onChange={(event) => onChange(event.target.value)} value={value} {...props} />
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function NumberInput({ error, onChange, value, ...props }) {
  return (
    <div>
      <input
        className={inputClassName(error)}
        onChange={(event) => onChange(event.target.value)}
        type="number"
        value={value}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 truncate font-semibold text-ink">{value}</dd>
    </div>
  );
}

function validatePlannerForm(currentGpa, targetGpa, completedCredits, courses) {
  const errors = {};

  if (!isGpa(currentGpa)) {
    errors.currentGpa = 'Use a GPA from 0 to 4.';
  }

  if (!isGpa(targetGpa)) {
    errors.targetGpa = 'Use a GPA from 0 to 4.';
  }

  if (!Number.isFinite(Number(completedCredits)) || Number(completedCredits) < 0) {
    errors.completedCredits = 'Credits must be 0 or greater.';
  }

  courses.forEach((course) => {
    const courseErrors = {};

    if (!course.name.trim()) {
      courseErrors.name = 'Course name is required.';
    }

    if (!Number.isFinite(Number(course.credits)) || Number(course.credits) <= 0 || Number(course.credits) > 10) {
      courseErrors.credits = 'Use 0.5 to 10 credits.';
    }

    if (Object.keys(courseErrors).length > 0) {
      errors[course.id] = courseErrors;
    }
  });

  return errors;
}

function calculateLocalPlan(currentGpa, targetGpa, completedCredits, courses) {
  const validCourses = courses.map((course) => ({
    name: course.name.trim() || 'Planned Course',
    credits: positiveNumber(course.credits),
  }));
  const plannedCredits = validCourses.reduce((sum, course) => sum + course.credits, 0);
  const currentQuality = positiveNumber(currentGpa) * positiveNumber(completedCredits);
  const totalCredits = positiveNumber(completedCredits) + plannedCredits;
  const requiredQuality = positiveNumber(targetGpa) * totalCredits - currentQuality;
  const requiredSemesterGpa = plannedCredits ? requiredQuality / plannedCredits : 0;
  const classification = classify(requiredSemesterGpa);
  const requiredGrade = gradeFor(requiredSemesterGpa);
  const maxPossibleCumulativeGpa = totalCredits
    ? (currentQuality + plannedCredits * 4) / totalCredits
    : positiveNumber(currentGpa);

  return {
    requiredSemesterGpa: round(requiredSemesterGpa),
    maxPossibleCumulativeGpa: round(maxPossibleCumulativeGpa),
    plannedCredits,
    classification,
    requiredGrade,
    gradePlan: validCourses.map((course) => ({
      ...course,
      requiredGrade,
      requiredGradePoints: Math.min(4, Math.max(0, round(requiredSemesterGpa))),
      impact: course.credits / plannedCredits >= 0.35 ? 'high' : course.credits / plannedCredits >= 0.2 ? 'medium' : 'low',
    })),
    recommendations: localRecommendations(classification, requiredSemesterGpa),
  };
}

function localRecommendations(classification, requiredSemesterGpa) {
  if (classification === 'impossible') {
    return [
      { title: 'Extend the timeline', body: 'The target is above what this credit plan can produce.', priority: 'critical' },
      { title: 'Add credit opportunities', body: 'Consider future semesters or approved retake options.', priority: 'high' },
    ];
  }

  if (classification === 'difficult') {
    return [
      { title: 'Aim for A-range grades', body: 'This plan requires very strong outcomes across planned courses.', priority: 'high' },
      { title: 'Protect high-credit modules', body: 'Credit-heavy courses should receive the most study time.', priority: 'high' },
    ];
  }

  return [
    {
      title: 'Maintain consistency',
      body: `A semester GPA near ${round(requiredSemesterGpa).toFixed(2)} keeps this target reachable.`,
      priority: 'medium',
    },
    { title: 'Build a grade buffer', body: 'Aim slightly above the plan to absorb exam variance.', priority: 'medium' },
  ];
}

function classificationMessage(plan) {
  if (plan.classification === 'impossible') {
    return 'This target requires more than a 4.00 semester GPA with the current credit plan.';
  }

  if (plan.classification === 'difficult') {
    return 'This target is possible, but it requires mostly A-range outcomes.';
  }

  return 'This target is realistic with steady performance across planned courses.';
}

function createCourse(name, credits) {
  return {
    id: crypto.randomUUID(),
    name,
    credits,
  };
}

function inputClassName(error) {
  return [
    'min-h-10 w-full rounded-md border bg-white px-3 text-sm text-ink outline-none transition focus:ring-2',
    error
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
      : 'border-slate-300 focus:border-ocean focus:ring-ocean/20',
  ].join(' ');
}

function isGpa(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 4;
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function classify(requiredSemesterGpa) {
  if (requiredSemesterGpa <= 3.3) {
    return 'achievable';
  }

  if (requiredSemesterGpa <= 4) {
    return 'difficult';
  }

  return 'impossible';
}

function gradeFor(requiredSemesterGpa) {
  if (requiredSemesterGpa > 4) {
    return 'Above A';
  }

  if (requiredSemesterGpa >= 3.7) {
    return 'A- / A';
  }

  if (requiredSemesterGpa >= 3.3) {
    return 'B+';
  }

  if (requiredSemesterGpa >= 3) {
    return 'B';
  }

  if (requiredSemesterGpa >= 2.3) {
    return 'C+';
  }

  return 'C or lower';
}

function formatClassification(classification) {
  return classification.charAt(0).toUpperCase() + classification.slice(1);
}

function round(value) {
  return Number(value.toFixed(2));
}
