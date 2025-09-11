var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var Company = require("../models/company");

exports.saveCompany = function(req, res, next) {

      var conditionCompany = {
        "abn": req.body.company.abn.trim()
      }
      Company.findOne(conditionCompany, function (err, company) {
          if (err) {
              return res.json({success: false, msg: 'Fail: Check Company by abn'});
          }
          if(company === null){
                var newCompany= new Company({
                  company_name: req.body.company.company.trim(),
                  address: req.body.company.address.trim(),
                  suburb: req.body.company.suburb.trim(),
                  city: req.body.company.city.trim(),
                  state: req.body.company.state.trim(),
                  postcode: req.body.company.postcode.trim(),
                  abn: req.body.company.abn.trim(),
                  system_id: req.local_system_id
                });
                newCompany.save(function(err, company) {
                      if (err) {
                        return res.json({success: err, msg: 'Fail: Add Company'});
                      }
                      req.local_company_id = company._id;
                      next();
                });
            } else {

              Company.findOneAndUpdate({"_id": company._id},
                  { $set: {
                    company_name: req.body.company.company.trim(),
                    address: req.body.company.address.trim(),
                    suburb: req.body.company.suburb.trim(),
                    city: req.body.company.city.trim(),
                    state: req.body.company.state.trim(),
                    postcode: req.body.company.postcode.trim(),
                    system_id: req.local_system_id
                    }}, function(err, company) {
                        if (err) {
                          return res.json({success: err, msg: 'Fail: Add Company'});
                        }
                        req.local_company_id = company._id;
                        next();
                  });
            }
      });

  };