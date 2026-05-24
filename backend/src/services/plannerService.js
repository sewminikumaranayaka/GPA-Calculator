import { AppError } from '../utils/AppError.js';

const gradeBands = [
  { grade: 'A', points: 4.0 },
  { grade: 'A-', points: 3.7 },
  { grade: 'B+', points: 3.3 },
  { grade: 'B', points: 3.0 },
  { grade: 'B-', points: 2.7 },
  { grade: 'C+', points: 2.3 },
  { grade: 'C', points: 2.0 },
  { grade: 'D', points: 1.0 },
  { grade: 'F', points: 0 },
];

export function planTargetGpa(payload) {
  const normalized = normalizePlannerPayload(payload);
  const currentQualityPoints = normalized.currentGpa * normalized.completedCredits;
  const totalCreditsAfterPlan = normalized.completedCredits + normalized.plannedCredits;
  const requiredTotalQualityPoints = normalized.targetGpa * totalCreditsAfterPlan;
  const requiredFutureQualityPoints = requiredTotalQualityPoints - currentQualityPoints;
  const requiredSemesterGpa = normalized.plannedCredits
    ? requiredFutureQualityPoints / normalized.plannedCredits
    : 0;
  const classification = classifyRequirement(requiredSemesterGpa);
  const requiredGrade = gradeForRequirement(requiredSemesterGpa);
  const maxPossibleCumulativeGpa = totalCreditsAfterPlan
    ? (currentQualityPoints + normalized.plannedCredits * 4) / totalCreditsAfterPlan
    : normalized.currentGpa;

  return {
    currentGpa: normalized.currentGpa,
    targetGpa: normalized.targetGpa,
    completedCredits: normalized.completedCredits,
    plannedCredits: normalized.plannedCredits,
    requiredSemesterGpa: roundGpa(requiredSemesterGpa),
    maxPossibleCumulativeGpa: roundGpa(maxPossibleCumulativeGpa),
    classification,
    requiredGrade,
    gradePlan: normalized.courses.map((course) => ({
      ...course,
      requiredGrade,
      requiredGradePoints: Math.min(4, Math.max(0, roundGpa(requiredSemesterGpa))),
      impact: classifyImpact(course.credits, normalized.plannedCredits),
    })),
    recommendations: buildRecommendations(classification, requiredSemesterGpa, normalized),
  };
}

function normalizePlannerPayload(payload) {
  const errors = {};
  const currentGpa = Number(payload?.currentGpa);
  const targetGpa = Number(payload?.targetGpa);
  const completedCredits = Number(payload?.completedCredits);
  const courses = Array.isArray(payload?.courses) ? payload.courses : [];
  const plannedCredits = courses.reduce((sum, course) => sum + Number(course?.credits || 0), 0);

  if (!Number.isFinite(currentGpa) || currentGpa < 0 || currentGpa > 4) {
    errors.currentGpa = 'Current GPA must be between 0 and 4.';
  }

  if (!Number.isFinite(targetGpa) || targetGpa < 0 || targetGpa > 4) {
    errors.targetGpa = 'Target GPA must be between 0 and 4.';
  }

  if (!Number.isFinite(completedCredits) || completedCredits < 0) {
    errors.completedCredits = 'Completed credits must be 0 or greater.';
  }

  if (courses.length === 0) {
    errors.courses = 'At least one planned course is required.';
  }

  const normalizedCourses = courses.map((course, index) => normalizeCourse(course, index));

  if (plannedCredits <= 0) {
    errors.plannedCredits = 'Planned credits must be greater than 0.';
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }

  return {
    currentGpa,
    targetGpa,
    completedCredits,
    plannedCredits,
    courses: normalizedCourses,
  };
}

function normalizeCourse(course, index) {
  const name = String(course?.name || course?.courseName || `Course ${index + 1}`).trim();
  const credits = Number(course?.credits);

  if (!name || !Number.isFinite(credits) || credits <= 0 || credits > 10) {
    throw new AppError(`Invalid planned course at index ${index}`, 400, {
      courses: 'Each course needs a name and credits between 0.5 and 10.',
    });
  }

  return {
    name,
    credits,
  };
}

function classifyRequirement(requiredSemesterGpa) {
  if (requiredSemesterGpa <= 3.3) {
    return 'achievable';
  }

  if (requiredSemesterGpa <= 4) {
    return 'difficult';
  }

  return 'impossible';
}

function gradeForRequirement(requiredSemesterGpa) {
  if (requiredSemesterGpa > 4) {
    return 'Above A';
  }

  const grade = gradeBands.find((band) => requiredSemesterGpa >= band.points - 0.001);
  return grade?.grade || 'F';
}

function classifyImpact(courseCredits, plannedCredits) {
  const share = plannedCredits ? courseCredits / plannedCredits : 0;

  if (share >= 0.35) {
    return 'high';
  }

  if (share >= 0.2) {
    return 'medium';
  }

  return 'low';
}

function buildRecommendations(classification, requiredSemesterGpa, normalized) {
  const base = [
    {
      title: 'Prioritize high-credit courses',
      body: 'Higher-credit courses move the cumulative GPA more, so protect those outcomes first.',
      priority: 'high',
    },
  ];

  if (classification === 'achievable') {
    return [
      ...base,
      {
        title: 'Maintain steady performance',
        body: `A semester GPA around ${roundGpa(requiredSemesterGpa).toFixed(2)} can reach the target with consistent study habits.`,
        priority: 'medium',
      },
      {
        title: 'Use buffer grades',
        body: 'Aim slightly above the required grade plan to absorb assessment variance.',
        priority: 'medium',
      },
    ];
  }

  if (classification === 'difficult') {
    return [
      ...base,
      {
        title: 'Plan for A-range outcomes',
        body: 'This target requires near-top grades across most planned credits.',
        priority: 'high',
      },
      {
        title: 'Reduce avoidable credit risk',
        body: 'Start difficult modules early and use weekly checkpoints to avoid late-semester recovery pressure.',
        priority: 'high',
      },
    ];
  }

  return [
    ...base,
    {
      title: 'Revise the timeline',
      body: `The target cannot be reached within ${normalized.plannedCredits.toFixed(1)} planned credits on a 4.00 scale.`,
      priority: 'critical',
    },
    {
      title: 'Add future credit opportunities',
      body: 'Use additional semesters, retakes, or approved extra credits if your program allows them.',
      priority: 'high',
    },
  ];
}

function roundGpa(value) {
  return Number(value.toFixed(2));
}
