// ================================================================
// backend/src/utils/response.js
// PURPOSE:
// Standardize ALL API responses in ExTra backend
// So frontend always knows what to expect.
// ================================================================


// --------------------------------------------------
// SUCCESS RESPONSE
// --------------------------------------------------
export const successResponse = (
  res,
  data = {},
  message = "OK",
  status = 200
) => {

  // res = Express response object
  // status = HTTP status code
  // message = human readable message
  // data = actual returned data

  res.status(status).json({
    success: true,
    message,
    data
  });
};


// --------------------------------------------------
// ERROR RESPONSE
// --------------------------------------------------
export const errorResponse = (
  res,
  message = "Internal Server Error",
  status = 500
) => {

  res.status(status).json({
    success: false,
    message,
    data: null
  });
};
