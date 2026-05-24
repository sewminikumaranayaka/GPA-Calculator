import {
  detectWeakSubjects,
  generateAcademicAnalysis,
  generateAcademicInsights,
  generatePerformanceAnalysis,
  generateStudyRecommendations,
} from '../services/aiService.js';

export async function analyzeAcademics(request, response, next) {
  try {
    const analysis = await generateAcademicAnalysis(request.body);
    response.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
}

export async function analyzePerformance(request, response, next) {
  try {
    const analysis = await generatePerformanceAnalysis(request.body);
    response.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
}

export async function getWeakSubjects(request, response, next) {
  try {
    const weakSubjects = await detectWeakSubjects(request.body);
    response.json({ success: true, data: weakSubjects });
  } catch (error) {
    next(error);
  }
}

export async function getAcademicInsights(request, response, next) {
  try {
    const insights = await generateAcademicInsights(request.body);
    response.json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
}

export async function getStudyRecommendations(request, response, next) {
  try {
    const recommendations = await generateStudyRecommendations(request.body);
    response.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
}
