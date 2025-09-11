var express = require('express');
var router = express.Router();
var passport = require('passport');
require('../config/passport')(passport);

var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/web-images/uploads')
    },
    filename: (req, file, cb) => {
      let extArray = file.mimetype.split("/");
      let extension = extArray[extArray.length - 1];
      cb(null, file.fieldname + '-' + Date.now() + "." + extension)
    }
});
var upload = multer({storage: storage});
var userController = require("../controllers/userController");

router.post('/checkUserByPhoneOrEmail', userController.checkUserByPhoneOrEmail)
router.get('/searchCompanyFromAbnName', userController.searchCompanyFromAbnName)
router.get('/searchEmployeesFromCompany', userController.searchEmployeesFromCompany)

router.post('/signup', upload.single('image'), userController.signup);//upload.array('images', 10)
router.post('/signin', userController.signin);
router.get('/', userController.checkAuthorization, userController.getProfile);

router.get('/signout', passport.authenticate('jwt', { session: false}), function(req, res) {
  req.logout();
  res.json({success: true, msg: 'Sign out successfully.'});
});

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sendmail', userController.sendmail);

module.exports = router;
