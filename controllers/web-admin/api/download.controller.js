const Download = require('../../../models/web-admin/download.model');

exports.getDownload = (req, res) => {
  Download.find({ status: true })
  .then(result => {
    res.json({
      message: 'Success',
      download: result
    });
  })
  .catch(err => console.log(err));
}
