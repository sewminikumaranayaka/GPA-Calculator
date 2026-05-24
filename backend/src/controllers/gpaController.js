import {
  calculateCumulativeGpa,
  calculateSemesterGpa,
  calculateStoredCumulativeGpa,
  calculateStoredSemesterGpa,
  listGpaHistory,
  saveGpaHistory,
} from '../services/gpaService.js';

export async function calculateSemester(request, response, next) {
  try {
    const result = calculateSemesterGpa(request.body);
    response.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function calculateCumulative(request, response, next) {
  try {
    const result = calculateCumulativeGpa(request.body);
    response.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getStoredSemester(request, response, next) {
  try {
    const result = await calculateStoredSemesterGpa(request.user.id, request.params.semesterId);
    response.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getStoredCumulative(request, response, next) {
  try {
    const semesterId = request.query.semesterId || request.params.semesterId;
    const result = await calculateStoredCumulativeGpa(request.user.id, semesterId);
    response.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getGpaHistory(request, response, next) {
  try {
    const history = await listGpaHistory(request.user.id);
    response.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
}

export async function createGpaHistory(request, response, next) {
  try {
    const result = await saveGpaHistory(request.user.id, request.body);
    response.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
