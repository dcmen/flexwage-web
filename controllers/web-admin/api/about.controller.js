const About = require('../../../models/web-admin/about.model');

exports.getAbout = (req, res) => {
  About.findOne({ status: true })
  .then(result => {
    res.json({
      message: 'Success',
      about: result
    });
  })
  .catch(err => console.log(err));
}

