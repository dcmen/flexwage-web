const ConfigModel = require('../../../models/web-admin/config.model');

exports.getConfig = (req, res) => {
  ConfigModel.findOne()
    .then(result => {
      res.json({
        message: 'Success',
        config: result
      });
    });
}
