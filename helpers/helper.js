const Header = require('../models/web-admin/heading.model');
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));

exports.updateHeader = (req, code) => {
  Header.findOne({ code: code })
  .then(result => {
    result.title = req.body.titleHeader !== null ? req.body.titleHeader : result.title;
    result.description = req.body.desHeader !== null ? req.body.desHeader : result.desHeader;
    result.imagePath = req.file === undefined ? result.imagePath : '/uploads/' + req.file.filename;
    result.code = code;
    result.status = req.body.status;
    result.save();
  })
  .catch(err => console.log(err));
}

exports.readFileSize = async (req, width, height) => {
  if (req.file === undefined) {
      next();
  } else {
    try {
      const dimensions = await sizeOf(req.file.path);
      if (dimensions.width > width || width > dimensions.width && dimensions.height > height || height > dimensions.height) {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      console.error(err);
    }
  }
}

