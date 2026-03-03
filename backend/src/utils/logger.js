// backend/src/utils/logger.js
// --------------------------------------------------
// PURPOSE:
// Centralized logging functions.

export const logInfo = (...args) => {
  console.log('[INFO]', ...args);
};

export const logWarn = (...args) => {
  console.warn('[WARN]', ...args);
};

export const logError = (...args) => {
  console.error('[ERROR]', ...args);
};