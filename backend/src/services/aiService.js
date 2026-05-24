import OpenAI from 'openai';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const analysisSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    performanceAnalysis: {
      type: 'object',
      additionalProperties: false,
      properties: {
        summary: { type: 'string' },
        gpaStanding: { type: 'string' },
        trend: { type: 'string' },
        strengths: {
          type: 'array',
          items: { type: 'string' },
        },
        risks: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['summary', 'gpaStanding', 'trend', 'strengths', 'risks'],
    },
    weakSubjects: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          subject: { type: 'string' },
          grade: { type: 'string' },
          gradePoints: { type: 'number' },
          credits: { type: 'number' },
          riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
          reason: { type: 'string' },
        },
        required: ['subject', 'grade', 'gradePoints', 'credits', 'riskLevel', 'reason'],
      },
    },
    academicInsights: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          insight: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['title', 'insight', 'priority'],
      },
    },
    studyRecommendations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          subject: { type: 'string' },
          recommendation: { type: 'string' },
          actionItems: {
            type: 'array',
            items: { type: 'string' },
          },
          weeklyHours: { type: 'number' },
        },
        required: ['subject', 'recommendation', 'actionItems', 'weeklyHours'],
      },
    },
  },
  required: ['performanceAnalysis', 'weakSubjects', 'academicInsights', 'studyRecommendations'],
};

const predictionExplanationSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    cumulativeImpact: { type: 'string' },
    keyDrivers: {
      type: 'array',
      items: { type: 'string' },
    },
    risks: {
      type: 'array',
      items: { type: 'string' },
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['summary', 'cumulativeImpact', 'keyDrivers', 'risks', 'recommendations'],
};

export async function generatePerformanceAnalysis(payload) {
  const analysis = await generateAcademicAnalysis(payload);
  return analysis.performanceAnalysis;
}

export async function detectWeakSubjects(payload) {
  const analysis = await generateAcademicAnalysis(payload);
  return analysis.weakSubjects;
}

export async function generateAcademicInsights(payload) {
  const analysis = await generateAcademicAnalysis(payload);
  return analysis.academicInsights;
}

export async function generateStudyRecommendations(payload) {
  const analysis = await generateAcademicAnalysis(payload);
  return analysis.studyRecommendations;
}

export async function generateAcademicAnalysis(payload) {
  const normalizedPayload = normalizeAcademicPayload(payload);
  const openai = createOpenAiClient();

  const response = await openai.responses.create({
    model: env.openaiModel,
    instructions: [
      'You are an academic performance advisor for a GPA calculator application.',
      'Return practical, student-friendly academic guidance.',
      'Use only the supplied academic data. Do not invent courses, grades, or history.',
      'Respond as structured JSON matching the provided schema.',
    ].join(' '),
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify(normalizedPayload),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'academic_ai_analysis',
        strict: true,
        schema: analysisSchema,
      },
    },
  });

  return parseStructuredResponse(response);
}

export async function generatePredictionExplanation(payload) {
  const openai = createOpenAiClient();

  const response = await openai.responses.create({
    model: env.openaiModel,
    instructions: [
      'You are an academic advisor explaining a GPA prediction.',
      'Use only the supplied GPA projection data.',
      'Explain the credit-weighted impact clearly and practically.',
      'Respond as structured JSON matching the provided schema.',
    ].join(' '),
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify(payload),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'gpa_prediction_explanation',
        strict: true,
        schema: predictionExplanationSchema,
      },
    },
  });

  return parseStructuredResponse(response);
}

function createOpenAiClient() {
  if (!env.openaiApiKey) {
    throw new AppError('OPENAI_API_KEY is not configured', 500);
  }

  return new OpenAI({
    apiKey: env.openaiApiKey,
  });
}

function normalizeAcademicPayload(payload) {
  const courses = Array.isArray(payload?.courses) ? payload.courses : [];

  if (courses.length === 0) {
    throw new AppError('At least one course is required for AI analysis', 400, {
      courses: 'Provide an array of courses with name, credits, grade, and gradePoints.',
    });
  }

  return {
    student: payload.student || null,
    semesterGpa: normalizeOptionalNumber(payload.semesterGpa ?? payload.gpa),
    cumulativeGpa: normalizeOptionalNumber(payload.cumulativeGpa),
    targetGpa: normalizeOptionalNumber(payload.targetGpa),
    gpaHistory: Array.isArray(payload.gpaHistory) ? payload.gpaHistory : [],
    courses: courses.map((course, index) => normalizeCourse(course, index)),
  };
}

function normalizeCourse(course, index) {
  const name = course?.name || course?.courseName || course?.subject || `Subject ${index + 1}`;
  const credits = Number(course?.credits);
  const gradePoints = Number(course?.gradePoints ?? course?.grade_points);
  const errors = {};

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
    name: String(name).trim(),
    credits,
    grade: String(course?.grade || course?.letterGrade || 'N/A').trim(),
    gradePoints,
  };
}

function normalizeOptionalNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseStructuredResponse(response) {
  const outputText = response.output_text;

  if (!outputText) {
    throw new AppError('OpenAI returned an empty AI response', 502);
  }

  try {
    return JSON.parse(outputText);
  } catch {
    throw new AppError('OpenAI returned invalid JSON', 502);
  }
}
