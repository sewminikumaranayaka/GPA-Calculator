import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  BrainCircuit,
  Calculator,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  Target,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/gpa-calculator', label: 'GPA Calculator', icon: Calculator },
  { to: '/performance-analysis', label: 'Performance Analysis', icon: BarChart3 },
  { to: '/gpa-prediction', label: 'GPA Prediction', icon: LineChart },
  { to: '/target-gpa-planner', label: 'Target GPA Planner', icon: Target },
  { to: '/study-recommendations', label: 'Study Recommendations', icon: BrainCircuit },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const ThemeIcon = isDark ? Sun : Moon;

  function handleSignOut() {
    ['token', 'authToken', 'gpa-intelligence-token', 'gpa-intelligence-user'].forEach((key) => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    });
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100 text-ink transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {sidebarOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/30 dark:bg-slate-950/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition duration-200 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white dark:bg-ocean">
              <GraduationCap size={24} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean">Academic AI</p>
              <h1 className="text-base font-semibold text-ink dark:text-slate-100">GPA Intelligence</h1>
            </div>
          </div>
          <button
            aria-label="Close sidebar"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                [
                  'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-ink text-white shadow-sm dark:bg-ocean'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                ].join(' ')
              }
            >
              <Icon aria-hidden="true" size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-sm font-semibold text-ink dark:text-slate-100">Current Semester</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Spring 2026 performance tracking</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              aria-label="Open sidebar"
              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">AI Academic Performance</p>
              <h2 className="truncate text-xl font-semibold text-ink dark:text-slate-100">Student Success Dashboard</h2>
            </div>

            <div className="hidden min-w-64 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 md:flex">
              <Search size={17} className="text-slate-400 dark:text-slate-500" aria-hidden="true" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Search courses, grades, insights</span>
            </div>

            <button
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              type="button"
            >
              <ThemeIcon size={20} />
            </button>

            <button
              aria-label="Notifications"
              className="relative rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              type="button"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber" />
            </button>

            <button
              aria-label="Sign out"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={handleSignOut}
              title="Sign out"
              type="button"
            >
              <LogOut size={17} aria-hidden="true" />
              <span className="hidden xl:inline">Sign out</span>
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-ink dark:text-slate-100">Avery Johnson</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Computer Science</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-ocean text-sm font-semibold text-white">
                AJ
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
