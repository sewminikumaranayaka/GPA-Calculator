export default function CourseTable({ courses }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Course</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Credits</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Grade</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="px-4 py-3 text-sm font-medium text-ink dark:text-slate-100">{course.name}</td>
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{course.credits}</td>
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{course.grade}</td>
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{course.gradePoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
