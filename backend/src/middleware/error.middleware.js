// backend/src/middlewares/error.middleware.js
// --------------------------------------------------
// PURPOSE:
// This is Express GLOBAL error middleware.

import { logError } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log the full error for developers
  console.error("FULL ERROR:", err);


  // Default values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send standardized JSON response
  res.status(statusCode).json({
    success: false,
    message
  });
};