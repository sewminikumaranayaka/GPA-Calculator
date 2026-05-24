import { Plus } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Panel from '../components/Panel.jsx';
import { useAcademicData } from '../hooks/useAcademicData.js';

const gradeScale = {
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  D: 1.0,
  F: 0,
};

export default function GpaCalculator() {
  const { setCourses, gpa } = useAcademicData();
  const [form, setForm] = useState({ name: '', credits: 3, grade: 'A' });

  function handleSubmit(event) {
    event.preventDefault();
    setCourses((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: form.name.trim() || 'Untitled Course',
        credits: Number(form.credits),
        grade: form.grade,
        gradePoints: gradeScale[form.grade],
      },
    ]);
    setForm({ name: '', credits: 3, grade: 'A' });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Calculator"
        title="GPA Calculator"
        description="Add course results and instantly calculate weighted GPA using credit hours and grade points."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel>
          <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-semibold text-ink">Add Course Result</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <label className="sm:col-span-3">
                <span className="text-sm font-medium text-slate-700">Course name</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Machine Learning"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700">Credits</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                  min="1"
                  type="number"
                  value={form.credits}
                  onChange={(event) => setForm({ ...form, credits: event.target.value })}
                />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700">Grade</span>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                  value={form.grade}
                  onChange={(event) => setForm({ ...form, grade: event.target.value })}
                >
                  {Object.keys(gradeScale).map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 font-medium text-white transition hover:bg-slate-700">
                  <Plus size={18} aria-hidden="true" />
                  Add
                </button>
              </div>
            </div>
          </form>
        </Panel>

        <Panel>
          <p className="text-sm font-medium uppercase tracking-wide text-ocean">Calculated GPA</p>
          <p className="mt-3 text-5xl font-semibold text-ink">{gpa}</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            This calculation uses the active local course list. Backend persistence is ready to connect through the services layer.
          </p>
        </Panel>
      </div>
    </section>
  );
}
