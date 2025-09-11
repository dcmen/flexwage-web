var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var System = require("../models/system");

exports.saveSystem = function(req, res, next) {

      var conditionSystem = {
        "system_name": req.body.company.system_name
      }
      System.findOne(conditionSystem, function (err, system) {
            if (err) {
              return res.json({success: false, msg: 'Fail: Check System'});
            }
            if(system === null){
              var newSystem = new System({
                system_name: req.body.company.system_name,
                version: req.body.title,
                created_date: new Date()
              });
              newSystem.save(function(err, system) {
                    if (err) {
                      return res.json({success: false, msg: 'Fail: Add System'});
                    }
                    req.local_system_id = system._id;
                    next();
              });
           } else {
              req.local_system_id = system._id;
              next();
           }
      });  
  };