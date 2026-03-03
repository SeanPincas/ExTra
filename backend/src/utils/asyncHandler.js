// backend/src/utils/asyncHandler.js
// --------------------------------------------------
// PURPOSE:
// Express does NOT automatically catch errors
// thrown inside async route handlers.

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};