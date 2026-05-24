import { planTargetGpa } from '../services/plannerService.js';

export function createTargetGpaPlan(request, response, next) {
  try {
    const plan = planTargetGpa(request.body);
    response.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
}
