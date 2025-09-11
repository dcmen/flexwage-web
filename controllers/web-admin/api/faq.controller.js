const Faq = require('../../../models/web-admin/faq.model');

exports.getFaq = (req, res) => {
  Faq.find({ code: 'faq-area', status: true })
  .then(result => {
    res.json({
      message: 'Success',
      faqs: result
    });
  })
  .catch(err => console.log(err));
}
