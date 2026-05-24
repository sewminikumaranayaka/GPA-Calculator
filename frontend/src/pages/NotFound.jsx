import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-ocean">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Page not found</h1>
        <p className="mt-3 text-slate-500">The requested academic workspace does not exist.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-ink px-4 py-2 font-medium text-white transition hover:bg-slate-700"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
