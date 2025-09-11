const Funfact = require('../../../models/web-admin/funfact.model');

exports.getFunFact = (req, res) => {
  Funfact.find({ status: true })
  .then(result => {
    res.json({
      message: 'Success',
      funfact: result
    });
  })
  .catch(err => console.log(err));
}
