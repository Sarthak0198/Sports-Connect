export const apiSuccess = (res, data = null, message = 'Success', status = 200, meta = null) => {
  const payload = {
    success: true,
    message,
    data
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(status).json(payload);
};

export const apiError = (res, message = 'An error occurred', status = 500, details = null) => {
  const payload = {
    success: false,
    error: {
      message,
      status
    }
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(status).json(payload);
};
