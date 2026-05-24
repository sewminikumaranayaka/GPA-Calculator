import { AlertCircle, GraduationCap, Loader2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api.js';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    studentId: '',
    department: '',
    enrollmentYear: new Date().getFullYear(),
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await registerUser({
        ...form,
        enrollmentYear: Number(form.enrollmentYear),
      });
      window.localStorage.setItem('gpa-intelligence-token', response.data.token);
      window.localStorage.setItem('gpa-intelligence-user', JSON.stringify(response.data.user));
      navigate('/', { replace: true });
    } catch (requestError) {
      if (!requestError.response) {
        createLocalSignupSession(form);
        navigate('/', { replace: true });
        return;
      }

      setError(formatSignupError(requestError.response?.data) || 'Signup failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10 text-ink dark:bg-slate-950 dark:text-slate-100">
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white dark:bg-ocean">
            <GraduationCap size={25} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean">Academic AI</p>
            <h1 className="text-xl font-semibold text-ink dark:text-slate-100">Create account</h1>
          </div>
        </div>

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block sm:col-span-2">
            <FieldLabel>Full name</FieldLabel>
            <TextInput onChange={(value) => updateField('fullName', value)} type="text" value={form.fullName} />
          </label>

          <label className="block sm:col-span-2">
            <FieldLabel>Email</FieldLabel>
            <TextInput onChange={(value) => updateField('email', value)} type="email" value={form.email} />
          </label>

          <label className="block sm:col-span-2">
            <FieldLabel>Password</FieldLabel>
            <TextInput onChange={(value) => updateField('password', value)} type="password" value={form.password} />
          </label>

          <label className="block">
            <FieldLabel>Student ID</FieldLabel>
            <TextInput onChange={(value) => updateField('studentId', value)} type="text" value={form.studentId} />
          </label>

          <label className="block">
            <FieldLabel>Enrollment year</FieldLabel>
            <TextInput
              max="2100"
              min="1990"
              onChange={(value) => updateField('enrollmentYear', value)}
              type="number"
              value={form.enrollmentYear}
            />
          </label>

          <label className="block sm:col-span-2">
            <FieldLabel>Department</FieldLabel>
            <TextInput onChange={(value) => updateField('department', value)} type="text" value={form.department} />
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
              <AlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:col-span-2">
            <button
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-ocean dark:hover:bg-cyan-700"
              disabled={loading}
              type="submit"
            >
              {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <UserPlus size={18} aria-hidden="true" />}
              Sign up
            </button>

            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              to="/login"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

function FieldLabel({ children }) {
  return <span className="mb-1 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{children}</span>;
}

function TextInput({ onChange, value, ...props }) {
  return (
    <input
      className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      onChange={(event) => onChange(event.target.value)}
      value={value}
      {...props}
    />
  );
}

function formatSignupError(responseData) {
  if (!responseData) {
    return null;
  }

  if (responseData.errors && typeof responseData.errors === 'object') {
    return Object.values(responseData.errors).join(' ');
  }

  return responseData.message;
}

function createLocalSignupSession(form) {
  const user = {
    id: crypto.randomUUID(),
    full_name: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    student_id: form.studentId.trim(),
    department: form.department.trim(),
    enrollment_year: Number(form.enrollmentYear),
    mode: 'local-demo',
  };

  window.localStorage.setItem('gpa-intelligence-token', `local-demo-${user.id}`);
  window.localStorage.setItem('gpa-intelligence-user', JSON.stringify(user));
}
