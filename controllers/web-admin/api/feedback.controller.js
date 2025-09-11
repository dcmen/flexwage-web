const Feedback = require('../../../models/web-admin/feedback.model');

exports.getFeedback = (req, res) => {
  Feedback.find({ status: true })
  .then(result => {
    res.json({
      message: 'Success',
      feedback: result
    });
  })
  .catch(err => console.log(err));
}
