const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
module.exports.validatorParams = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (Object.hasOwnProperty.call(req.body, key)) {
        const value = req.body[key];
        const window = new JSDOM('').window;
        const DOMPurify = createDOMPurify(window);
        const clean = DOMPurify.sanitize(value);
        req.body[key] = clean;
      }
    }
  }
  next();
}

module.exports.validatorQuery = (req, res, next) => {
  if (req.query) {
    for (const key in req.query) {
      if (Object.hasOwnProperty.call(req.query, key)) {
        const value = req.query[key];
        const window = new JSDOM('').window;
        const DOMPurify = createDOMPurify(window);
        const clean = DOMPurify.sanitize(value);
        req.query[key] = clean;
      }
    }
  }
  next();
}