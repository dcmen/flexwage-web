const Pricing = require('../../../models/web-admin/pricing.model');

exports.getPricing = (req, res) => {
  Pricing.find({ status: true})
  .then(result => {
    res.json({
      message: 'Success',
      pricing: result
    });
  })
  .catch(err => console.log(err));
}
