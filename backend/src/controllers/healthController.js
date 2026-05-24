export function getHealth(_request, response) {
  response.json({
    status: 'ok',
    service: 'gpa-intelligence-backend',
    timestamp: new Date().toISOString(),
  });
}
