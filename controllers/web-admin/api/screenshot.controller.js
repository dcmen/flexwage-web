const Screenshot = require('../../../models/web-admin/screenshot.model');

exports.getScreenShot = (req, res) => {
  Screenshot.find({ status: true })
  .then(result => {
    res.json({
      message: 'Success',
      screenshot: result
    });
  })
  .catch(err => console.log(err));
}
