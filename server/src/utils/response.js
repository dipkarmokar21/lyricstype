/**
 * Standard API response helpers
 */
export function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created(res, data) {
  return success(res, data, 201);
}

export function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

