import {
  AlertCircle,
  BrainCircuit,
  Calculator,
  Loader2,
  Plus,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';
import { useAcademicData } from '../hooks/useAcademicData.js';
import { predictGpa } from '../services/api.js';

const gradeScale = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  F: 0,
};

const initialFutureCourses = [
  createFutureCourse('Algorithms', 3, 'A-'),
  createFutureCourse('Software Engineering', 3, 'B+'),
  createFutureCourse('Data Analytics', 4, 'A'),
];

export default function GpaPrediction() {
  const { gpa } = useAcademicData();
  const [currentCumulativeGpa, setCurrentCumulativeGpa] = useState(gpa);
  const [completedCredits, setCompletedCredits] = useState(42);
  const [futureCourses, setFutureCourses] = useState(initialFutureCourses);
  const [errors, setErrors] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const preview = useMemo(
    () => calculatePreview(currentCumulativeGpa, completedCredits, futureCourses),
    [currentCumulativeGpa, completedCredits, futureCourses],
  );

  function updateCourse(id, field, value) {
    setFutureCourses((current) =>
      current.map((course) =>
        course.id === id
          ? {
              ...course,
              [field]: value,
              expectedGradePoints: field === 'expectedGrade' ? gradeScale[value] : course.expectedGradePoints,
            }
          : course,
      ),
    );
    setPrediction(null);
    setApiError(null);
  }

  function addCourse() {
    setFutureCourses((current) => [...current, createFutureCourse('', 3, 'A')]);
  }

  function removeCourse(id) {
    setFutureCourses((current) => (current.length === 1 ? current : current.filter((course) => course.id !== id)));
    setPrediction(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validatePredictionForm(currentCumulativeGpa, completedCredits, futureCourses);
    setErrors(nextErrors);
    setApiError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await predictGpa({
        currentCumulativeGpa: Number(currentCumulativeGpa),
        completedCredits: Number(completedCredits),
        futureCourses: futureCourses.map((course) => ({
          name: course.name.trim(),
          credits: Number(course.credits),
          expectedGrade: course.expectedGrade,
          expectedGradePoints: gradeScale[course.expectedGrade],
        })),
      });
      setPrediction(response.data);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Could not generate GPA prediction.');
    } finally {
      setLoading(false);
    }
  }

  const visiblePrediction = prediction || preview;
  const explanation = prediction?.explanation;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Forecast"
        title="GPA Prediction"
        description="Enter expected future grades to predict semester GPA, cumulative GPA, and receive an AI explanation."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Predicted Semester"
          value={visiblePrediction.predictedSemesterGpa.toFixed(2)}
          helper={prediction ? 'Calculated by backend' : 'Live local preview'}
          tone="ocean"
        />
        <MetricCard
          label="Predicted Cumulative"
          value={visiblePrediction.predictedCumulativeGpa.toFixed(2)}
          helper="After future courses"
          tone="mint"
        />
        <MetricCard
          label="Future Credits"
          value={visiblePrediction.futureCredits.toFixed(1)}
          helper="Planned academic load"
          tone="amber"
        />
        <MetricCard
          label="GPA Change"
          value={formatDelta(visiblePrediction.predictedCumulativeGpa - Number(currentCumulativeGpa || 0))}
          helper="Projected cumulative movement"
          tone="slate"
        />
      </div>

      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
        <Panel>
          <div className="grid gap-4 border-b border-slate-200 pb-5 md:grid-cols-2">
            <label>
              <FieldLabel>Current cumulative GPA</FieldLabel>
              <NumberInput
                error={errors.currentCumulativeGpa}
                max="4"
                min="0"
                onChange={setCurrentCumulativeGpa}
                step="0.01"
                value={currentCumulativeGpa}
              />
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
              <h3 className="text-lg font-semibold text-ink">Expected Future Grades</h3>
              <p className="mt-1 text-sm text-slate-500">Add planned courses, credits, and expected grades.</p>
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
            {futureCourses.map((course, index) => (
              <FutureCourseRow
                key={course.id}
                course={course}
                errors={errors[course.id] || {}}
                index={index}
                onRemove={removeCourse}
                onUpdate={updateCourse}
                removable={futureCourses.length > 1}
              />
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ocean/10 text-ocean">
              <Calculator size={21} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Prediction Engine</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                The backend calculates GPA and asks AI to explain the projected impact.
              </p>
            </div>
          </div>

          {apiError && <StatusMessage message={apiError} tone="error" />}
          {prediction?.explanationError && <StatusMessage message={prediction.explanationError} tone="warning" />}

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <SummaryItem label="Current GPA" value={Number(currentCumulativeGpa || 0).toFixed(2)} />
            <SummaryItem label="Completed" value={`${Number(completedCredits || 0).toFixed(1)} cr`} />
            <SummaryItem label="Future quality" value={visiblePrediction.futureQualityPoints.toFixed(1)} />
            <SummaryItem label="Total credits" value={visiblePrediction.cumulativeCredits.toFixed(1)} />
          </dl>

          <button
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading}
            type="submit"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <TrendingUp size={18} />}
            Predict GPA
          </button>
        </Panel>
      </form>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel>
          <SectionHeading
            icon={BrainCircuit}
            label="AI Explanation"
            title={explanation?.summary || 'Run a prediction to generate an AI explanation'}
            helper={explanation?.cumulativeImpact || 'The explanation will summarize credit weight, GPA movement, and risk areas.'}
          />

          {explanation ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <ExplanationList title="Key Drivers" items={explanation.keyDrivers} />
              <ExplanationList title="Risks" items={explanation.risks} />
              <ExplanationList title="Recommendations" items={explanation.recommendations} />
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
              Backend prediction works with the entered grades. AI explanation appears here when `OPENAI_API_KEY` is configured.
            </div>
          )}
        </Panel>

        <Panel>
          <SectionHeading
            icon={Target}
            label="Target Check"
            title={visiblePrediction.predictedCumulativeGpa >= 3.8 ? 'On track for 3.80' : 'Below 3.80 target'}
            helper={`Projected cumulative GPA is ${Math.abs(3.8 - visiblePrediction.predictedCumulativeGpa).toFixed(2)} away from 3.80.`}
          />
          <div className="mt-5 h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-mint"
              style={{ width: `${Math.min(100, (visiblePrediction.predictedCumulativeGpa / 4) * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">Progress is measured against the 4.00 GPA scale.</p>
        </Panel>
      </div>
    </section>
  );
}

function FutureCourseRow({ course, errors, index, onRemove, onUpdate, removable }) {
  return (
    <section className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_130px_130px_48px]">
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
      <label>
        <FieldLabel>Expected grade</FieldLabel>
        <select
          className="min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
          onChange={(event) => onUpdate(course.id, 'expectedGrade', event.target.value)}
          value={course.expectedGrade}
        >
          {Object.keys(gradeScale).map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button
          aria-label="Remove future course"
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

function FieldLabel({ children }) {
  return <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{children}</span>;
}

function TextInput({ error, onChange, value, ...props }) {
  return (
    <div>
      <input
        className={inputClassName(error)}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
        {...props}
      />
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

function SectionHeading({ helper, icon: Icon, label, title }) {
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

function ExplanationList({ items, title }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-semibold text-ink">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Sparkles className="mt-1 shrink-0 text-ocean" size={14} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function StatusMessage({ message, tone }) {
  const toneClass =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';

  return (
    <div className={`mt-5 flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${toneClass}`}>
      <AlertCircle className="mt-0.5 shrink-0" size={16} />
      <span>{message}</span>
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

function validatePredictionForm(currentCumulativeGpa, completedCredits, futureCourses) {
  const errors = {};
  const cumulative = Number(currentCumulativeGpa);
  const credits = Number(completedCredits);

  if (!Number.isFinite(cumulative) || cumulative < 0 || cumulative > 4) {
    errors.currentCumulativeGpa = 'Use a GPA from 0 to 4.';
  }

  if (!Number.isFinite(credits) || credits < 0) {
    errors.completedCredits = 'Credits must be 0 or greater.';
  }

  futureCourses.forEach((course) => {
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

function calculatePreview(currentCumulativeGpa, completedCredits, futureCourses) {
  const futureCredits = futureCourses.reduce((sum, course) => sum + validNumber(course.credits), 0);
  const futureQualityPoints = futureCourses.reduce(
    (sum, course) => sum + validNumber(course.credits) * gradeScale[course.expectedGrade],
    0,
  );
  const semesterGpa = futureCredits ? futureQualityPoints / futureCredits : 0;
  const cumulativeCredits = validNumber(completedCredits) + futureCredits;
  const cumulativeQualityPoints = validNumber(currentCumulativeGpa) * validNumber(completedCredits) + futureQualityPoints;

  return {
    predictedSemesterGpa: semesterGpa,
    predictedCumulativeGpa: cumulativeCredits ? cumulativeQualityPoints / cumulativeCredits : semesterGpa,
    futureCredits,
    futureQualityPoints,
    cumulativeCredits,
  };
}

function createFutureCourse(name, credits, expectedGrade) {
  return {
    id: crypto.randomUUID(),
    name,
    credits,
    expectedGrade,
    expectedGradePoints: gradeScale[expectedGrade],
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

function validNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function formatDelta(value) {
  if (!Number.isFinite(value)) {
    return '0.00';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}
