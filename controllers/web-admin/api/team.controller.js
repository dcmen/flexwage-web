const Team = require('../../../models/web-admin/team.model');

exports.getTeam = (req, res) => {
  Team.find({ status: true})
  .then(result => {
    res.json({
      message: 'Success',
      team: result
    });
  })
  .catch(err => console.log(err));
}
