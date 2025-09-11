var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var Deduction = require("../models/deduction");

exports.saveDeductions = async function(req, res, next) {

      var deductions = req.body.deductions;
      for(var key in deductions) {
        if (deductions.hasOwnProperty(key)) {
            var deduction = deductions[key];
            var conditionDeduction = {
              "company_id": req.local_company_id,
              "decode" : deduction.decode,
              "code" : deduction.code
            }
            let deductionDb = await Deduction.findOne(conditionDeduction);
            if(deductionDb === null){
                  var newDeduction= new Deduction({
                    company_id: req.local_company_id,
                    decode: deduction.decode,
                    code: deduction.code,
                    name: deduction.name,
                    type: deduction.type,
                    amount: deduction.amount,
                    resource_from: deduction.resource_from
                  });
                  await newDeduction.save();
            } else {
              await Deduction.findOneAndUpdate({"_id": deductionDb._id}, {$set: {name: deduction.name, type:deduction.type, amount:deduction.amount}})
            }
        }
      }
      next();
  };