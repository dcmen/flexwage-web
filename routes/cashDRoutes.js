var express = require('express');
var router = express.Router();
var passport = require('passport');
require('../config/passport')(passport);

var userController = require("../controllers/userController");
var bookController = require("../controllers/bookController");
var systemController = require("../controllers/systemController");
var companyController = require("../controllers/companyController");
var payPeriodController = require("../controllers/payPeriodController");
var staffController = require("../controllers/staffsController");
var deductionController = require("../controllers/deductionController");
var getFileABA = require("../controllers/web-admin/aba.controller");

router.post('/syncTimesheetAndHistory', systemController.saveSystem, companyController.saveCompany, payPeriodController.savePayPeriod, deductionController.saveDeductions, staffController.saveStaffsInfor)
router.get('/getDashboardData', userController.checkAuthorization, payPeriodController.getDashboardData)


router.post('/book', userController.checkAuthorization, bookController.saveBooks);

// router.post('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
//   var token = getToken(req.headers);
//   if (token) {
//     console.log(req.body);
//     var newBook = new Book({
//       isbn: req.body.isbn,
//       title: req.body.title,
//       author: req.body.author,
//       publisher: req.body.publisher
//     });

//     newBook.save(function(err) {
//       if (err) {
//         return res.json({success: false, msg: 'Save book failed.'});
//       }
//       res.json({success: true, msg: 'Successful created new book.'});
//     });
//   } else {
//     return res.status(403).send({success: false, msg: 'Unauthorized.'});
//   }
// });

router.get('/book', userController.checkAuthorization, bookController.getBooks);

//dowload file ABA
router.get('/fileABA/download', getFileABA.getFileABA);

module.exports = router;
