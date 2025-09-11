const Banner = require('../../../models/web-admin/banner.model');

exports.getBanner = (req, res, next) => {
  Banner.find({ status: true })
  .then(result => {
    res.json({
      message: 'Success',
      banner: result
    });
  })
  .catch(err => console.log(err));
}
