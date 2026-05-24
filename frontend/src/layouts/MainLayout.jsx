import { NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  BrainCircuit,
  Calculator,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Menu,
  Search,
  Target,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/gpa-calculator', label: 'GPA Calculator', icon: Calculator },
  { to: '/performance-analysis', label: 'Performance Analysis', icon: BarChart3 },
  { to: '/gpa-prediction', label: 'GPA Prediction', icon: LineChart },
  { to: '/target-gpa-planner', label: 'Target GPA Planner', icon: Target },
  { to: '/study-recommendations', label: 'Study Recommendations', icon: BrainCircuit },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      {sidebarOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white">
              <GraduationCap size={24} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean">Academic AI</p>
              <h1 className="text-base font-semibold text-ink">GPA Intelligence</h1>
            </div>
          </div>
          <button
            aria-label="Close sidebar"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
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
                    ? 'bg-ink text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-ink',
                ].join(' ')
              }
            >
              <Icon aria-hidden="true" size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-ink">Current Semester</p>
            <p className="mt-1 text-sm text-slate-500">Spring 2026 performance tracking</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              aria-label="Open sidebar"
              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-500">AI Academic Performance</p>
              <h2 className="truncate text-xl font-semibold text-ink">Student Success Dashboard</h2>
            </div>

            <div className="hidden min-w-64 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search size={17} className="text-slate-400" aria-hidden="true" />
              <span className="text-sm text-slate-500">Search courses, grades, insights</span>
            </div>

            <button
              aria-label="Notifications"
              className="relative rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              type="button"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber" />
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-ink">Avery Johnson</p>
                <p className="text-xs text-slate-500">Computer Science</p>
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
