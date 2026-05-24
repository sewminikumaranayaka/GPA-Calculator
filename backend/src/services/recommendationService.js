import { AppError } from '../utils/AppError.js';

const defaultAvailability = {
  monday: 1.5,
  tuesday: 1,
  wednesday: 1.5,
  thursday: 1,
  friday: 1,
  saturday: 2,
  sunday: 1,
};

const dayLabels = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function generateStudyRecommendationEngine(payload) {
  const normalized = normalizeRecommendationPayload(payload);
  const weakSubjects = analyzeWeakSubjects(normalized);
  const studyPriorities = generateStudyPriorities(weakSubjects, normalized);
  const weeklyStudyPlan = createWeeklyStudyPlan(studyPriorities, normalized);
  const personalizedRecommendations = createPersonalizedRecommendations(
    studyPriorities,
    weakSubjects,
    weeklyStudyPlan,
    normalized,
  );

  return {
    summary: buildSummary(studyPriorities, weakSubjects, normalized),
    weakSubjects,
    studyPriorities,
    weeklyStudyPlan,
    personalizedRecommendations,
  };
}

function normalizeRecommendationPayload(payload) {
  const courses = Array.isArray(payload?.courses) ? payload.courses : [];
  const errors = {};

  if (courses.length === 0) {
    errors.courses = 'At least one course is required.';
  }

  const weeklyStudyHours = normalizeWeeklyStudyHours(payload?.weeklyStudyHours);
  const targetGpa = normalizeOptionalNumber(payload?.targetGpa) ?? 3.8;
  const currentGpa = normalizeOptionalNumber(payload?.currentGpa ?? payload?.semesterGpa ?? payload?.gpa);
  const availability = normalizeAvailability(payload?.availability, weeklyStudyHours);

  if (targetGpa < 0 || targetGpa > 4) {
    errors.targetGpa = 'Target GPA must be between 0 and 4.';
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }

  return {
    currentGpa,
    targetGpa,
    weeklyStudyHours,
    availability,
    learningPreference: String(payload?.learningPreference || 'balanced').trim().toLowerCase(),
    courses: courses.map(normalizeCourse),
  };
}

function normalizeCourse(course, index) {
  const name = String(course?.name || course?.courseName || course?.subject || `Subject ${index + 1}`).trim();
  const credits = Number(course?.credits);
  const gradePoints = Number(course?.gradePoints ?? course?.grade_points);
  const errors = {};

  if (!name) {
    errors.name = 'Course name is required.';
  }

  if (!Number.isFinite(credits) || credits <= 0 || credits > 10) {
    errors.credits = 'Credits must be greater than 0 and no more than 10.';
  }

  if (!Number.isFinite(gradePoints) || gradePoints < 0 || gradePoints > 4) {
    errors.gradePoints = 'Grade points must be between 0 and 4.';
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(`Invalid course at index ${index}`, 400, errors);
  }

  return {
    name,
    credits,
    grade: String(course?.grade || course?.letterGrade || 'N/A').trim(),
    gradePoints,
    assessmentType: String(course?.assessmentType || 'mixed').trim().toLowerCase(),
  };
}

function analyzeWeakSubjects(normalized) {
  return normalized.courses
    .map((course) => {
      const gapToTarget = Math.max(0, normalized.targetGpa - course.gradePoints);
      const creditWeight = course.credits / getTotalCredits(normalized.courses);
      const weaknessScore = roundScore(gapToTarget * 45 + creditWeight * 35 + getGradeRisk(course.gradePoints) * 20);

      return {
        subject: course.name,
        grade: course.grade,
        gradePoints: course.gradePoints,
        credits: course.credits,
        riskLevel: getRiskLevel(weaknessScore, course.gradePoints),
        weaknessScore,
        reason: buildWeaknessReason(course, normalized.targetGpa),
      };
    })
    .filter((subject) => subject.gradePoints < normalized.targetGpa || subject.riskLevel !== 'low')
    .sort((first, second) => second.weaknessScore - first.weaknessScore);
}

function generateStudyPriorities(weakSubjects, normalized) {
  const sourceSubjects = weakSubjects.length
    ? weakSubjects
    : [...normalized.courses]
        .sort((first, second) => first.gradePoints - second.gradePoints)
        .slice(0, 2)
        .map((course) => ({
          subject: course.name,
          grade: course.grade,
          gradePoints: course.gradePoints,
          credits: course.credits,
          riskLevel: 'low',
          weaknessScore: 25,
          reason: 'This subject is stable, but scheduled review will protect the current grade.',
        }));

  const totalScore = sourceSubjects.reduce((sum, subject) => sum + subject.weaknessScore, 0) || 1;

  return sourceSubjects.slice(0, 5).map((subject, index) => {
    const weeklyHours = Math.max(1, roundToHalf((subject.weaknessScore / totalScore) * normalized.weeklyStudyHours));

    return {
      rank: index + 1,
      subject: subject.subject,
      priority: getPriorityLabel(index, subject.riskLevel),
      weeklyHours,
      focus: getFocusArea(subject.gradePoints),
      rationale: `${subject.subject} receives ${weeklyHours} weekly study hours because it combines ${subject.riskLevel} risk with ${subject.credits} credit impact.`,
      actions: buildActions(subject, normalized.learningPreference),
    };
  });
}

function createWeeklyStudyPlan(studyPriorities, normalized) {
  const sessions = Object.entries(normalized.availability).flatMap(([day, hours]) => {
    if (hours <= 0) {
      return [];
    }

    const subject = pickSubjectForDay(studyPriorities, day);
    return [
      {
        day: dayLabels[day],
        subject: subject.subject,
        durationHours: hours,
        focus: subject.focus,
        activity: pickActivity(subject, day),
      },
    ];
  });

  return {
    totalHours: roundToHalf(sessions.reduce((sum, session) => sum + session.durationHours, 0)),
    sessions,
  };
}

function createPersonalizedRecommendations(studyPriorities, weakSubjects, weeklyStudyPlan, normalized) {
  const recommendations = [
    {
      title: 'Start with the highest GPA impact',
      category: 'priority',
      priority: 'high',
      recommendation: studyPriorities[0]
        ? `Put ${studyPriorities[0].subject} first this week and complete its first study block before adding lower-priority work.`
        : 'Keep a light weekly review cycle across all subjects to preserve current performance.',
    },
    {
      title: 'Use active recall before rereading',
      category: 'method',
      priority: 'medium',
      recommendation: 'Convert lecture notes into short question sets, then check gaps against examples, tutorials, or past papers.',
    },
    {
      title: 'Review progress every Sunday',
      category: 'routine',
      priority: 'medium',
      recommendation: `Use the ${weeklyStudyPlan.totalHours} planned weekly hours as a baseline and move unfinished tasks into the next available block.`,
    },
  ];

  if (weakSubjects.some((subject) => subject.riskLevel === 'high')) {
    recommendations.unshift({
      title: 'Book support for high-risk subjects',
      category: 'support',
      priority: 'high',
      recommendation: 'Use office hours, peer study, or lab support for the subjects marked high risk before the next assessment window.',
    });
  }

  if (normalized.currentGpa && normalized.currentGpa < normalized.targetGpa) {
    recommendations.push({
      title: 'Close the target GPA gap',
      category: 'goal',
      priority: 'high',
      recommendation: `Your current GPA is ${normalized.currentGpa.toFixed(2)} against a ${normalized.targetGpa.toFixed(2)} target, so protect high-credit subjects first.`,
    });
  }

  return recommendations;
}

function buildSummary(studyPriorities, weakSubjects, normalized) {
  const topSubject = studyPriorities[0]?.subject || 'your current courses';

  return {
    targetGpa: normalized.targetGpa,
    currentGpa: normalized.currentGpa,
    weeklyStudyHours: normalized.weeklyStudyHours,
    weakSubjectCount: weakSubjects.length,
    topPriority: topSubject,
    message: `Focus first on ${topSubject}, then distribute ${normalized.weeklyStudyHours} weekly hours across the remaining priority subjects.`,
  };
}

function normalizeWeeklyStudyHours(value) {
  const hours = Number(value);
  if (!Number.isFinite(hours) || hours <= 0) {
    return 10;
  }

  return Math.min(40, Math.max(2, roundToHalf(hours)));
}

function normalizeAvailability(value, weeklyStudyHours) {
  if (!value || typeof value !== 'object') {
    return scaleAvailability(defaultAvailability, weeklyStudyHours);
  }

  const availability = Object.fromEntries(
    Object.keys(defaultAvailability).map((day) => [day, Math.max(0, Number(value[day] ?? 0))]),
  );
  const total = Object.values(availability).reduce((sum, hours) => sum + hours, 0);

  return total > 0 ? scaleAvailability(availability, weeklyStudyHours) : scaleAvailability(defaultAvailability, weeklyStudyHours);
}

function scaleAvailability(availability, weeklyStudyHours) {
  const total = Object.values(availability).reduce((sum, hours) => sum + hours, 0) || 1;

  return Object.fromEntries(
    Object.entries(availability).map(([day, hours]) => [day, roundToHalf((hours / total) * weeklyStudyHours)]),
  );
}

function normalizeOptionalNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getTotalCredits(courses) {
  return courses.reduce((sum, course) => sum + course.credits, 0) || 1;
}

function getGradeRisk(gradePoints) {
  if (gradePoints < 2) {
    return 1;
  }

  if (gradePoints < 2.7) {
    return 0.7;
  }

  if (gradePoints < 3.3) {
    return 0.45;
  }

  return 0.2;
}

function getRiskLevel(score, gradePoints) {
  if (score >= 65 || gradePoints < 2.3) {
    return 'high';
  }

  if (score >= 40 || gradePoints < 3.0) {
    return 'medium';
  }

  return 'low';
}

function getPriorityLabel(index, riskLevel) {
  if (index === 0 || riskLevel === 'high') {
    return 'high';
  }

  if (index <= 2 || riskLevel === 'medium') {
    return 'medium';
  }

  return 'low';
}

function getFocusArea(gradePoints) {
  if (gradePoints < 2.3) {
    return 'foundation repair and guided practice';
  }

  if (gradePoints < 3.3) {
    return 'past-paper practice and error correction';
  }

  return 'exam readiness and concept retention';
}

function buildWeaknessReason(course, targetGpa) {
  if (course.gradePoints < 2.3) {
    return `${course.name} is below the safe pass range and needs foundation review before new material compounds.`;
  }

  if (course.gradePoints < targetGpa) {
    return `${course.name} is below the ${targetGpa.toFixed(2)} target and carries ${course.credits} credits of GPA impact.`;
  }

  return `${course.name} is near the target but still benefits from scheduled review because it has ${course.credits} credits.`;
}

function buildActions(subject, learningPreference) {
  const baseActions = [
    `Review one weak topic in ${subject.subject} and write a five-question self-test.`,
    'Complete timed practice, then log every mistake with the corrected method.',
    'End the week by summarizing the hardest concept in plain language.',
  ];

  if (learningPreference === 'visual') {
    return [`Create a one-page concept map for ${subject.subject}.`, ...baseActions.slice(1)];
  }

  if (learningPreference === 'practice') {
    return [`Complete a short problem set for ${subject.subject} before reviewing notes.`, ...baseActions.slice(1)];
  }

  return baseActions;
}

function pickSubjectForDay(studyPriorities, day) {
  const indexByDay = {
    monday: 0,
    tuesday: 1,
    wednesday: 0,
    thursday: 2,
    friday: 1,
    saturday: 0,
    sunday: 2,
  };

  return studyPriorities[indexByDay[day] % studyPriorities.length] || studyPriorities[0];
}

function pickActivity(subject, day) {
  if (day === 'sunday') {
    return 'Weekly review, progress check, and next-week planning';
  }

  if (subject.priority === 'high') {
    return 'Deep work block with practice questions and error review';
  }

  return 'Focused revision, flashcards, and short practice';
}

function roundScore(value) {
  return Math.round(Math.min(100, Math.max(0, value)));
}

function roundToHalf(value) {
  return Math.round(value * 2) / 2;
}
