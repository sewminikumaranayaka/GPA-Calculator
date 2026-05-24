export default function CourseTable({ courses }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Course</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Credits</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Grade</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="px-4 py-3 text-sm font-medium text-ink">{course.name}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{course.credits}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{course.grade}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{course.gradePoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
