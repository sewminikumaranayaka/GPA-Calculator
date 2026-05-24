import { generateStudyRecommendationEngine } from '../services/recommendationService.js';

export function createStudyRecommendations(request, response, next) {
  try {
    const recommendations = generateStudyRecommendationEngine(request.body);
    response.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
}
