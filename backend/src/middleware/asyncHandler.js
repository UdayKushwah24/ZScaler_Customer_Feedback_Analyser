// Express 4 does not forward a rejected promise from an async route
// handler to the error middleware automatically. Wrapping handlers here
// keeps controllers free of repetitive try/catch blocks while still
// guaranteeing errors reach the centralized handler in app.js.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
