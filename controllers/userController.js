'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var User = require("../models/user");
var StaffModel = require("../models/staff");
var CompanyModel = require("../models/company");
const JSON = require('circular-json');
function getToken (headers) {
        if (headers && headers.authorization) {
            var parted = headers.authorization.split(' ');
            if (parted.length === 2) {
                return parted[1];
            } else {
                return null;
            }
        } else {
            return null;
        }
};

exports.signup = async function(req, res) {
  // if(!req.body.company_id){
  //     return res.json({success: false, result: null, message: 'The field "company_id" is required.', code: 201, errorCode: "REGISTER_REQUIRE_COMPANY_ID"});
  // }
  if(!req.body.first_name){
    return res.json({success: false, result: null, message: 'The field "first_name" is required.', code: 201, errorCode: "REGISTER_REQUIRE_FIRSTNAME"});
  }
  if(!req.body.last_name){
    return res.json({success: false, result: null, message: 'The field "last_name" is required.', code: 201, errorCode: "REGISTER_REQUIRE_LASTNAME"});
  }
  if(!req.body.mobile){
    return res.json({success: false, result: null, message: 'The field "mobile" is required.', code: 201, errorCode: "REGISTER_REQUIRE_MOBILE"});
  }
  if(!req.body.email){
    return res.json({success: false, result: null, message: 'The field "email" is required.', code: 201, errorCode: "REGISTER_REQUIRE_EMAIL"});
  }

  if(!req.body.password){
    return res.json({success: false, result: null, message: 'The field "password" is required.', code: 201, errorCode: "REGISTER_REQUIRE_PASSWORD"});
  }

  if(!validateEmail(req.body.email)){
    return res.json({success: false, result: null, message: 'Your email is invalid.', code: 201, errorCode: "REGISTER_INVALID_EMAIL"});
  }

  var newUser = new User();
  if(req.body.company_id){
    newUser.company_id = new mongoose.Types.ObjectId(req.body.company_id);//new Schema.Types.ObjectId(req.body.company_id);
  }
  newUser.first_name = req.body.first_name;
  newUser.last_name = req.body.last_name;
  newUser.fullname = req.body.first_name.trim() + " " + req.body.last_name.trim(),
  newUser.mobile = req.body.mobile;
  newUser.email = req.body.email;
  newUser.password = req.body.password;
  newUser.birth_date = req.body.birth_date;
  newUser.address = req.body.address;

  if(req.body.staff_id){
    newUser.staff_id = new mongoose.Types.ObjectId(req.body.staff_id);
  }
  if(req.body.role){
    newUser.role = req.body.role;
  }
  if(req.file && req.file.filename){
    newUser.avatar_path = req.file.filename
  }

  //check email/mobile
  var conditionStaff = {
    $or : [ 
            { "email": req.body.email },
            { "mobile" : req.body.mobile }
          ]
  }
  var staffObject = await User.findOne(conditionStaff);
  if(staffObject != null) {
      if(staffObject.email === req.body.email){
          return res.json({success: false, result: null, message: 'Email already exists in system.', code: 201, errorCode: "REGISTER_EMAIL_EXISTS"});
      } else {
          return res.json({success: false, result: null, message: 'Mobile number already exists in system.', code: 201, errorCode: "REGISTER_PHONE_EXISTS"});
      }
  }

  //check staff id
  if(req.body.staff_id){
      var conditionStaff = {
        "staff_id": new mongoose.Types.ObjectId(req.body.staff_id)
      }
      var staffObject = await User.findOne(conditionStaff);
      if(staffObject != null){
          return res.json({success: false, result: null, message: 'This staff is mapped to another users.', code: 201, errorCode: "REGISTER_STAFF_MAPPED_ANOTHER_USER"});
      }
  }
  
  //check role -> Each company should have one employer
  if(req.body.company_id && req.body.role && req.body.role == 1){
      var conditionStaff = {
        "company_id": new mongoose.Types.ObjectId(req.body.company_id),
        "role" : 1
      }
      var staffObject = await User.findOne(conditionStaff);
      if(staffObject != null){
          return res.json({success: false, result: null, message: 'This company is mapped to another employer.', code: 201, errorCode: "REGISTER_COMPANY_MAPPED_ANOTHER_EMPLOYER"});
      }
  }

  newUser.save(function(err) {
    if (err) {
      return res.json({success: false, msg: err});
    }
    res.json({success: true, msg: 'Successful created new user.'});
  });   
};

exports.getProfile = async function (req, res){
    var userId = req.user_id;
    var userObject = await User.findOne({_id : userId});
    if(userObject != null){
      if(userObject.company_id != null){
          var company = await CompanyModel.findOne({_id: userObject.company_id});
          userObject.company_infor = company;
      }
      if(userObject.staff_id != null){
          var staff = await StaffModel.findOne({_id: userObject.staff_id});
          userObject.staff_infor = staff;
      }
    }
    return res.json({success: true, result: userObject, message: 'Get user Informations successfully.', code: 200});
};

exports.checkUserByPhoneOrEmail = async function (req, res){
  if(!req.body.email){
    return res.json({success: false, result: null, message: 'The field "email" is required.', code: 201, errorCode: "REGISTER_REQUIRE_EMAIL"});
  }

  if(!req.body.mobile){
    return res.json({success: false, result: null, message: 'The field "mobile" is required.', code: 201, errorCode: "REGISTER_REQUIRE_MOBILE"});
  }
  
  var usersOfCheckingBoth = await User.findOne({ email: req.body.email, mobile: req.body.mobile });
  var staff = null;
  if(usersOfCheckingBoth != null){
      if(usersOfCheckingBoth.company_id != null){
          var company = await CompanyModel.findOne({_id: usersOfCheckingBoth.company_id});
          usersOfCheckingBoth.company_infor = company;
      }
      if(usersOfCheckingBoth.staff_id != null){
            staff = await StaffModel.findOne({_id: usersOfCheckingBoth.staff_id});
          usersOfCheckingBoth.staff_infor = staff;
      }

      return res.json({success: true, result: usersOfCheckingBoth, message: 'Data is available on system.', code: 200});
  } else {
      var userOfCheckingEmailOrPhone = await User.findOne({
          $or : [
                    { email: req.body.email},
                    { mobile: req.body.mobile}
                ]
      });
      if(userOfCheckingEmailOrPhone != null){
          if(userOfCheckingEmailOrPhone.email === req.body.email){
              return res.json({success: false, result: null, message: 'This email is already existed in system.', code: 201, errorCode: "REGISTER_EMAIL_EXISTS"});
          } else {
              return res.json({success: false, result: null, message: 'This mobile is already existed in system.', code: 201, errorCode: "REGISTER_PHONE_EXISTS"});
          }
      } else {
          return res.json({success: true, result: null, message: 'Data is valid.', code: 200});
      }
  }
};

exports.searchCompanyFromAbnName = function(req, res){

  if(!req.query.search_term){
    return res.json({success: false, result: null, message: 'The field "search_term" is required.', code: 201, errorCode: "REGISTER_REQUIRE_COMPANY_SERCHTERM"});
  }

  CompanyModel.find({
    $or : [
              { abn: req.query.search_term},
              { company_name: new RegExp(req.query.search_term, 'i')},
          ]
    }, function(err, companys) {
          return res.json({success: true, result: companys, message: '', code: 200});
    });
};

exports.searchEmployeesFromCompany = async function(req, res){
  if(!req.query.company_id){
      return res.json({success: false, result: null, message: 'The field "company_id" is required.', code: 201, errorCode: "REGISTER_REQUIRE_EMPLOYEE_COMPANY_ID"});
  }      
  if(!req.query.search_term){
    return res.json({success: false, result: null, message: 'The field "search_term" is required.', code: 201, errorCode: "REGISTER_REQUIRE_COMPANY_SERCHTERM"});
  }

  var staffsArray = await User.find({
        company_id: req.query.company_id,
        staff_id: {$ne: null}
  }, {"staff_id":1, "_id" : 0});
  
  var staffIds = new Array();
  for(var i = 0; i < staffsArray.length; i++){
      staffIds.push(staffsArray[i].staff_id);
  }

  var staffs = await StaffModel.find({
      company_id: req.query.company_id,
      _id: { $nin : staffIds },
      $or : [
                { mobile: req.query.search_term},
                { fullname: new RegExp(req.query.search_term, 'i')},
            ]
  });

  return res.json({success: true, result: staffs, message: '', code: 200});
};

exports.checkAuthorization = function(req, res, next) {
  passport.authenticate('jwt', { session: false}, function(err, user, info) {
      if(err){
          return res.status(403).send({success: false, result: null, message: 'Unauthorized request.', code: 403});
      } else {
          if (!user){
            return res.status(403).send({success: false, result: null, message: 'Unauthorized request.', code: 403});
          }
          req.user_id = user.id;
          req.staff_id = user.staff_id;
          req.company_id = user.company_id;
          next()
      }
  })(req, res, next);
};

exports.signin = function(req, res) {

  if(!req.body.email){
    return res.json({success: false, result: null, message: 'The field "email" is required.', code: 201, errorCode: "REGISTER_REQUIRE_EMAIL"});
  }

  if(!req.body.password){
    return res.json({success: false, result: null, message: 'The field "password" is required.', code: 201, errorCode: "REGISTER_REQUIRE_PASSWORD"});
  }
  User.findOne({
      $or : [
                { email: req.body.email},
                { mobile: req.body.email},
            ]
  }, function(err, user) {
    if (!user) {
        return res.json({success: false, result: null, message: 'Login failed: Email or password incorrect.', code: 201, errorCode: "LOGIN_ACCOUNT_INCORRECT"});
    } else {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.sign(user.toJSON(), config.SECRET_KEY, {
              expiresIn: 604800 // 1 week
            });
            return res.json({success: true, result: { token: 'JWT ' + token }, message: 'Login successfull.fully.', code: 200, errorCode: "LOGIN_SUCCESSFULLY"});
        } else {
            return res.json({success: false, result: null, message: 'Login failed: Email or password incorrect.', code: 201, errorCode: "LOGIN_ACCOUNT_INCORRECT"});
        }
      });
    }
  });
};

async function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
exports.sendmail = function(req, res) {
  var header = null;
  if (req.headers && req.headers.authorization) {
      var parted = req.headers.authorization.split(' ');
      if (parted.length === 2) {
        header = parted[1];
      } else {
        return res.json({success: true, result: null, message: 'Miss authorization headers', code: 200, errorCode: "MISS_HEADER"});
      }
  }
  // return res.json({success: true, result: header, message: 'Miss authorization header', code: 200, errorCode: "MISS_HEADER"});
  // return res.json({success: true, result: post_data, message: 'Send mail successfully..', code: 200, errorCode: "SEND_EMAIL_SUCCESSFULLY"});
  // res.header('Access-Control-Allow-Origin', "*");
  // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  // res.header('Access-Control-Allow-Headers', 'Content-Type');
  mail(header, req.body.yourName, req.body.yourSubject, req.body.email, req.body.message);
  res.status(200).json({
    message: "Success"
  })
}

function mail(header, name, subjectMail, froMail, mess){
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(header);
  const msg = {
    to: 'phucnguyennbo@gmail.com',
    cc: 'ngolephucnguyen@gmail.com', 
    from: froMail,
    subject:'[CashD] Contact Form '+' '+''+name,
    html: 'You just got a request from '+'<strong>'+name+'</strong>'+'<br>'+
          '<strong>Email: </strong>'+froMail+'<br>'+
          '<strong>Subject: </strong>'+subjectMail+'<br>'+
          '<strong>Content: </strong>'+mess+'<br><br>'+
          '<hr>'+
          '<strong>Regards.</strong><br>',
    template_id:'52ee0636-e2b6-4ef4-bc6e-9395c39e989b',
    body:mess
  };
  sgMail.send(msg);
}
