var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var PayPeriod = require("../models/pay_period");
var PayCalculate = require("../models/pay_calculate");

exports.savePayPeriod = function(req, res, next) {

      if(req.body.default_current_pay_period != null){
            var conditionPayPeriod = {
              "company_id": req.local_company_id,
              "start_date": req.body.default_current_pay_period.start_date.trim(),
              "end_date": req.body.default_current_pay_period.end_date.trim(),
              "type_period": req.body.default_current_pay_period.type_period
            }
            PayPeriod.findOne(conditionPayPeriod, function (err, payPeriod) {
                if (err) {
                    return res.json({success: false, msg: 'Fail: Check PayPeriod'});
                }
                if(payPeriod == null){
                      var newPayPeriod = new PayPeriod({
                        company_id: req.local_company_id,
                        start_date: req.body.default_current_pay_period.start_date.trim(),
                        end_date: req.body.default_current_pay_period.end_date.trim(),
                        type_period: req.body.default_current_pay_period.type_period,
                        ppaynum: req.body.default_current_pay_period.ppaynum
                      });
                      newPayPeriod.save(function(err, payPeriod) {
                            if (err) {
                              return res.json({success: err, msg: 'Fail: Add PayPeriod'});
                            }
                            req.local_default_current_period_id = payPeriod._id;
                            next();
                      });
                  } else {
                    req.local_default_current_period_id = payPeriod._id;
                    next();
                  }
              });
      } else {
          req.local_default_current_period_id = null;
          next();
      }
  };

  exports.getDashboardData = async function(req, res, next) {
      var userId = req.user_id;
      var companyId = req.company_id;
      var staffId = req.staff_id;
      
  }