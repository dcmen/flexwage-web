const Header = require('../../../models/web-admin/heading.model');

exports.getHeader = (req, res) => {
  Header.find()
    .then(headers => {
      res.json({
        message: 'Success',
        header: headers
      });
    })
    .catch(err => console.log(err));
}
