import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';
import { useAcademicData } from '../hooks/useAcademicData.js';
import { calculateSemesterGpa } from '../services/api.js';

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

const initialRows = [
  createSubject('Programming Fundamentals', 3, 'A'),
  createSubject('Database Systems', 3, 'B+'),
  createSubject('Statistics for Computing', 4, 'A-'),
];

export default function GpaCalculator() {
  const { setCourses } = useAcademicData();
  const [subjects, setSubjects] = useState(initialRows);
  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');

  const preview = useMemo(() => summarizeSubjects(subjects), [subjects]);

  function updateSubject(id, field, value) {
    setSubjects((current) =>
      current.map((subject) =>
        subject.id === id
          ? {
              ...subject,
              [field]: value,
              gradePoints: field === 'grade' ? gradeScale[value] : subject.gradePoints,
            }
          : subject,
      ),
    );
    setResult(null);
    setServerErrors(null);
  }

  function addSubject() {
    setSubjects((current) => [...current, createSubject('', 3, 'A')]);
  }

  function removeSubject(id) {
    setSubjects((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((subject) => subject.id !== id);
    });
    setResult(null);
    setServerErrors(null);
  }

  function resetCalculator() {
    setSubjects([createSubject('', 3, 'A')]);
    setErrors({});
    setServerErrors(null);
    setResult(null);
    setStatus('idle');
  }

  async function handleCalculate(event) {
    event.preventDefault();

    const nextErrors = validateSubjects(subjects);
    setErrors(nextErrors);
    setServerErrors(null);

    if (Object.keys(nextErrors).length > 0) {
      setStatus('idle');
      return;
    }

    const payloadCourses = subjects.map((subject) => ({
      courseName: subject.name.trim() || 'Untitled Subject',
      credits: Number(subject.credits),
      grade: subject.grade,
      gradePoints: gradeScale[subject.grade],
    }));

    setStatus('loading');

    try {
      const response = await calculateSemesterGpa(payloadCourses);
      setResult(response.data);
      setCourses(
        payloadCourses.map((course) => ({
          id: crypto.randomUUID(),
          name: course.courseName,
          credits: course.credits,
          grade: course.grade,
          gradePoints: course.gradePoints,
        })),
      );
      setStatus('success');
    } catch (error) {
      setServerErrors(
        error.response?.data?.errors ||
          error.response?.data?.message ||
          'Could not calculate GPA. Check that the backend API is running.',
      );
      setStatus('error');
    }
  }

  const visibleResult = result || preview;
  const totalCredits = visibleResult.totalCredits.toFixed(1);
  const qualityPoints = visibleResult.qualityPoints.toFixed(1);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Calculator"
        title="GPA Calculator"
        description="Build a semester, validate credits and grades, then calculate a credit-weighted GPA through the backend API."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Semester GPA"
          value={visibleResult.gpa.toFixed(2)}
          helper={result ? 'Calculated by backend API' : 'Live local preview'}
          tone="ocean"
        />
        <MetricCard
          label="Credits"
          value={totalCredits}
          helper="Total attempted credits"
          tone="mint"
        />
        <MetricCard
          label="Quality Points"
          value={qualityPoints}
          helper="Credits multiplied by grade points"
          tone="amber"
        />
        <MetricCard
          label="Subjects"
          value={String(subjects.length)}
          helper="Rows included in this semester"
          tone="slate"
        />
      </div>

      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" onSubmit={handleCalculate}>
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Semester Subjects</h3>
              <p className="mt-1 text-sm text-slate-500">Enter each subject once with its credit value and final grade.</p>
            </div>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={addSubject}
              type="button"
            >
              <Plus size={17} aria-hidden="true" />
              Add subject
            </button>
          </div>

          <div className="mt-5 space-y-3 lg:hidden">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={subject.id}
                errors={errors[subject.id] || {}}
                index={index}
                onRemove={removeSubject}
                onUpdate={updateSubject}
                subject={subject}
                removable={subjects.length > 1}
              />
            ))}
          </div>

          <div className="mt-5 hidden overflow-x-auto lg:block">
            <table className="min-w-full table-fixed divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-[42%] px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500">Subject</th>
                  <th className="w-[18%] px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500">Credits</th>
                  <th className="w-[18%] px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500">Grade</th>
                  <th className="w-[14%] px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500">Points</th>
                  <th className="w-[8%] px-3 py-3 text-right text-xs font-semibold uppercase text-slate-500">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((subject, index) => (
                  <SubjectRow
                    key={subject.id}
                    errors={errors[subject.id] || {}}
                    index={index}
                    onRemove={removeSubject}
                    onUpdate={updateSubject}
                    removable={subjects.length > 1}
                    subject={subject}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ocean/10 text-ocean">
              <Calculator size={21} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Calculate</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Results are sent to the backend GPA endpoint after local validation.
              </p>
            </div>
          </div>

          {status === 'success' && (
            <StatusMessage tone="success" message="Semester GPA calculated and synced with the dashboard data." />
          )}

          {status === 'error' && (
            <StatusMessage tone="error" message={formatServerErrors(serverErrors)} />
          )}

          {Object.keys(errors).length > 0 && (
            <StatusMessage tone="error" message="Fix the highlighted subject fields before calculating." />
          )}

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <SummaryItem label="Formula" value="Weighted" />
            <SummaryItem label="Scale" value="4.00" />
            <SummaryItem label="Best grade" value="A / A+" />
            <SummaryItem label="API path" value="/gpa/semester" />
          </dl>

          <div className="mt-6 flex flex-col gap-3">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={status === 'loading'}
              type="submit"
            >
              {status === 'loading' ? (
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              ) : (
                <Calculator size={18} aria-hidden="true" />
              )}
              Calculate semester GPA
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={resetCalculator}
              type="button"
            >
              <RotateCcw size={17} aria-hidden="true" />
              Reset
            </button>
          </div>
        </Panel>
      </form>
    </section>
  );
}

function SubjectRow({ errors, index, onRemove, onUpdate, removable, subject }) {
  return (
    <tr className="align-top">
      <td className="px-3 py-4">
        <TextInput
          ariaLabel={`Subject ${index + 1} name`}
          error={errors.name}
          onChange={(value) => onUpdate(subject.id, 'name', value)}
          placeholder={`Subject ${index + 1}`}
          value={subject.name}
        />
      </td>
      <td className="px-3 py-4">
        <TextInput
          ariaLabel={`Subject ${index + 1} credits`}
          error={errors.credits}
          min="0"
          onChange={(value) => onUpdate(subject.id, 'credits', value)}
          step="0.5"
          type="number"
          value={subject.credits}
        />
      </td>
      <td className="px-3 py-4">
        <GradeSelect
          ariaLabel={`Subject ${index + 1} grade`}
          onChange={(value) => onUpdate(subject.id, 'grade', value)}
          value={subject.grade}
        />
      </td>
      <td className="px-3 py-4 text-sm font-semibold text-slate-700">{gradeScale[subject.grade].toFixed(1)}</td>
      <td className="px-3 py-4 text-right">
        <RemoveButton disabled={!removable} onClick={() => onRemove(subject.id)} />
      </td>
    </tr>
  );
}

function SubjectCard({ errors, index, onRemove, onUpdate, removable, subject }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-ink">Subject {index + 1}</h4>
        <RemoveButton disabled={!removable} onClick={() => onRemove(subject.id)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <FieldLabel>Name</FieldLabel>
          <TextInput
            ariaLabel={`Subject ${index + 1} name`}
            error={errors.name}
            onChange={(value) => onUpdate(subject.id, 'name', value)}
            placeholder="Course title"
            value={subject.name}
          />
        </label>
        <label>
          <FieldLabel>Credits</FieldLabel>
          <TextInput
            ariaLabel={`Subject ${index + 1} credits`}
            error={errors.credits}
            min="0"
            onChange={(value) => onUpdate(subject.id, 'credits', value)}
            step="0.5"
            type="number"
            value={subject.credits}
          />
        </label>
        <label>
          <FieldLabel>Grade</FieldLabel>
          <GradeSelect
            ariaLabel={`Subject ${index + 1} grade`}
            onChange={(value) => onUpdate(subject.id, 'grade', value)}
            value={subject.grade}
          />
        </label>
      </div>
    </section>
  );
}

function TextInput({ ariaLabel, error, onChange, type = 'text', value, ...props }) {
  return (
    <div>
      <input
        aria-label={ariaLabel}
        className={[
          'min-h-10 w-full rounded-md border bg-white px-3 text-sm text-ink outline-none transition focus:ring-2',
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
            : 'border-slate-300 focus:border-ocean focus:ring-ocean/20',
        ].join(' ')}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function GradeSelect({ ariaLabel, onChange, value }) {
  return (
    <select
      aria-label={ariaLabel}
      className="min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {Object.keys(gradeScale).map((grade) => (
        <option key={grade} value={grade}>
          {grade}
        </option>
      ))}
    </select>
  );
}

function RemoveButton({ disabled, onClick }) {
  return (
    <button
      aria-label="Remove subject"
      className="inline-grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-slate-500"
      disabled={disabled}
      onClick={onClick}
      title="Remove subject"
      type="button"
    >
      <Trash2 size={17} aria-hidden="true" />
    </button>
  );
}

function FieldLabel({ children }) {
  return <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{children}</span>;
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 truncate font-semibold text-ink">{value}</dd>
    </div>
  );
}

function StatusMessage({ message, tone }) {
  const isSuccess = tone === 'success';

  return (
    <div
      className={[
        'mt-5 flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
        isSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700',
      ].join(' ')}
    >
      {isSuccess ? <CheckCircle2 className="mt-0.5 shrink-0" size={16} /> : <AlertCircle className="mt-0.5 shrink-0" size={16} />}
      <span>{message}</span>
    </div>
  );
}

function validateSubjects(subjects) {
  return subjects.reduce((allErrors, subject) => {
    const subjectErrors = {};
    const credits = Number(subject.credits);

    if (!subject.name.trim()) {
      subjectErrors.name = 'Subject name is required.';
    }

    if (!Number.isFinite(credits) || credits <= 0 || credits > 10) {
      subjectErrors.credits = 'Use 0.5 to 10 credits.';
    }

    if (Object.keys(subjectErrors).length > 0) {
      return { ...allErrors, [subject.id]: subjectErrors };
    }

    return allErrors;
  }, {});
}

function summarizeSubjects(subjects) {
  const totals = subjects.reduce(
    (summary, subject) => {
      const credits = Number(subject.credits);

      if (!Number.isFinite(credits) || credits <= 0) {
        return summary;
      }

      return {
        totalCredits: summary.totalCredits + credits,
        qualityPoints: summary.qualityPoints + credits * gradeScale[subject.grade],
      };
    },
    { totalCredits: 0, qualityPoints: 0 },
  );

  return {
    ...totals,
    gpa: totals.totalCredits ? totals.qualityPoints / totals.totalCredits : 0,
  };
}

function createSubject(name, credits, grade) {
  return {
    id: crypto.randomUUID(),
    name,
    credits,
    grade,
    gradePoints: gradeScale[grade],
  };
}

function formatServerErrors(serverErrors) {
  if (!serverErrors) {
    return 'The backend API could not calculate this GPA.';
  }

  if (typeof serverErrors === 'string') {
    return serverErrors;
  }

  return Object.values(serverErrors).join(' ');
}
