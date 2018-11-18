class HttpError extends Error {
  constructor(code, ...params) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
    this.code = code;
  }
}

export default HttpError;
