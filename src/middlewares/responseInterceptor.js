function responseInterceptor(req, res, next) {
  const oldWrite = res.write,
    oldEnd = res.end;

  const chunks = [];

  res.write = function(chunk) {
    chunks.push(chunk);

    return oldWrite.apply(res, arguments);
  };

  res.end = function(chunk) {
    if (chunk) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks).toString('utf-8');

    // Store the response details
    req.responseBody = body;
    req.responseStatus = res.statusCode;
    req.responseHeaders = res.getHeaders();

    oldEnd.apply(res, arguments);
  };

  next();
}

module.exports = {
  responseInterceptor
};
