import { predictGpa } from '../services/predictionService.js';

export async function createGpaPrediction(request, response, next) {
  try {
    const prediction = await predictGpa(request.body);
    response.json({ success: true, data: prediction });
  } catch (error) {
    next(error);
  }
}
