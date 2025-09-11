const Feature = require('../../../models/web-admin/feature.model');

function getFeatures(res, code) {
  Feature.find({ code: code , status: true})
  .then(result => {
    res.json({
      message: 'Success',
      features: result
    });
  })
  .catch(err => console.log(err));
}

exports.getFeature = (req, res) => {
  getFeatures(res, 'feature-area');
}

exports.getHiw = (req, res) => {
  getFeatures(res, 'hiw-area');
}

exports.getAwesome = (req, res) => {
  getFeatures(res, 'awesome-area');
}
