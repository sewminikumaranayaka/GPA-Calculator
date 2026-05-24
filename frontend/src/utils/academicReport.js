const gpaTrend = [
  { term: 'Y1 S1', semesterGpa: 3.22, cumulativeGpa: 3.22 },
  { term: 'Y1 S2', semesterGpa: 3.36, cumulativeGpa: 3.29 },
  { term: 'Y2 S1', semesterGpa: 3.48, cumulativeGpa: 3.36 },
  { term: 'Y2 S2', semesterGpa: 3.58, cumulativeGpa: 3.43 },
  { term: 'Current', semesterGpa: null, cumulativeGpa: null },
];

export function buildAcademicReportData(courses, gpa) {
  const numericGpa = Number(gpa);
  const credits = courses.reduce((sum, course) => sum + Number(course.credits), 0);
  const qualityPoints = courses.reduce(
    (sum, course) => sum + Number(course.credits) * Number(course.gradePoints),
    0,
  );
  const projectedCumulativeGpa = calculateProjectedCumulativeGpa(numericGpa);
  const weakSubjects = getWeakSubjects(courses);
  const strongestSubject = getStrongestSubject(courses);
  const trendData = gpaTrend.map((term) =>
    term.term === 'Current'
      ? { ...term, semesterGpa: numericGpa, cumulativeGpa: projectedCumulativeGpa }
      : term,
  );
  const subjectData = courses.map((course) => ({
    name: compactSubjectName(course.name),
    fullName: course.name,
    grade: course.grade,
    credits: Number(course.credits),
    performance: Number(course.gradePoints),
    qualityPoints: Number((Number(course.credits) * Number(course.gradePoints)).toFixed(1)),
  }));

  return {
    completedSubjects: courses.length,
    courses,
    credits,
    gpa: numericGpa,
    projectedCumulativeGpa,
    qualityPoints,
    strongestSubject,
    subjectData,
    trendData,
    weakSubjects,
  };
}

export function calculateProjectedCumulativeGpa(currentGpa) {
  const previousCredits = 42;
  const previousGpa = 3.43;
  const currentCredits = 10;

  return ((previousGpa * previousCredits) + (currentGpa * currentCredits)) / (previousCredits + currentCredits);
}

export function getWeakSubjects(courses) {
  return [...courses]
    .sort((first, second) => Number(first.gradePoints) - Number(second.gradePoints))
    .slice(0, Math.min(3, courses.length));
}

export function getStrongestSubject(courses) {
  return [...courses].sort((first, second) => Number(second.gradePoints) - Number(first.gradePoints))[0] || null;
}

export function compactSubjectName(name) {
  const words = name.split(' ').filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 10);
  }

  return words.map((word) => word[0]).join('').slice(0, 8).toUpperCase();
}
