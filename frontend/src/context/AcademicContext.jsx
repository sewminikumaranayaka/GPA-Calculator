import { createContext, useMemo, useState } from 'react';

export const AcademicContext = createContext(null);

const initialCourses = [
  { id: crypto.randomUUID(), name: 'Data Structures', credits: 3, grade: 'A', gradePoints: 4.0 },
  { id: crypto.randomUUID(), name: 'Database Systems', credits: 3, grade: 'A-', gradePoints: 3.7 },
  { id: crypto.randomUUID(), name: 'Statistics', credits: 4, grade: 'B+', gradePoints: 3.3 },
];

export function AcademicProvider({ children }) {
  const [courses, setCourses] = useState(initialCourses);

  const gpa = useMemo(() => {
    const totalCredits = courses.reduce((sum, course) => sum + Number(course.credits), 0);
    const weightedPoints = courses.reduce(
      (sum, course) => sum + Number(course.credits) * Number(course.gradePoints),
      0,
    );

    return totalCredits ? (weightedPoints / totalCredits).toFixed(2) : '0.00';
  }, [courses]);

  const value = useMemo(() => ({ courses, setCourses, gpa }), [courses, gpa]);

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}
