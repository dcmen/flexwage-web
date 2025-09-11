var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var StaffModel = require("../models/staff");
var PayPeriodModel = require("../models/pay_period");
var PayCalculateModel = require("../models/pay_calculate");
var PayDeductionModel = require("../models/pay_deduction");
var DeductionModel = require("../models/deduction");

exports.saveStaffsInfor = async function(req, res, next) {

      var staffs = req.body.staff;

      var test = new Array();

      for(var i = 0; i < staffs.length; i++){
            var staff = staffs[i];
            var currentPayPeriods = staff.current_pay_periods;
            var lastPayPeriods = staff.last_pay_periods;
            var calcLastPayPeriods = staff.calc_last_pay_periods;
            var netpay = staff.netpay;

            //Đồng bộ nhân viên
            var conditionStaff = {
              "company_id": req.local_company_id,
              "alpha_sort" : staff.alpha_sort.trim()
            }
            var staffObject = await StaffModel.findOne(conditionStaff);
            if(staffObject === null){
                  var newStaff = new StaffModel({
                    company_id: req.local_company_id,
                    first_name: staff.first_name.trim(),
                    last_name: staff.last_name.trim(),
                    fullname: staff.first_name.trim() + " " + staff.last_name.trim(),
                    alpha_sort: staff.alpha_sort.trim(),
                    mobile: staff.mobile.trim(),
                    phone: staff.phone.trim(),
                    male_femal: staff.male_femal,
                    salary_wag: staff.salary_wag,
                    salary: staff.salary,
                    hours_per: staff.hours_per,
                    hours_day: staff.hours_day,
                    address: staff.address.trim(),
                    suburb: staff.suburb.trim(),
                    country: staff.country.trim(),
                    start_date: staff.start_date,
                    birth_date: staff.birth_date
                  });
                  staffObject = await newStaff.save();        
            } else {
                await StaffModel.findOneAndUpdate({"_id": staffObject._id}, 
                  { $set: {
                    first_name: staff.first_name.trim(),
                    last_name: staff.last_name.trim(),
                    fullname: staff.first_name.trim() + " " + staff.last_name.trim(),
                    mobile: staff.mobile.trim(),
                    phone: staff.phone.trim(),
                    male_femal: staff.male_femal,
                    salary_wag: staff.salary_wag,
                    salary: staff.salary,
                    hours_per: staff.hours_per,
                    hours_day: staff.hours_day,
                    address: staff.address.trim(),
                    suburb: staff.suburb.trim(),
                    country: staff.country.trim(),
                    start_date: staff.start_date,
                    birth_date: staff.birth_date
                    }});
            }

            //Đồng bộ kỳ thanh toán hiện tại
            var periodObject = null;
            if(currentPayPeriods.type_period == 1) {// 1 is Period, 2 is auto create
                  var conditionPayPeriod = {
                    "company_id": req.local_company_id,
                    "start_date": currentPayPeriods.start_date.trim(),
                    "end_date": currentPayPeriods.end_date.trim(),
                    "type_period": currentPayPeriods.type_period
                  }
                  periodObject = await PayPeriodModel.findOne(conditionPayPeriod);
                  if(periodObject == null){
                    var newPayPeriod = new PayPeriodModel({
                      company_id: req.local_company_id,
                      start_date: currentPayPeriods.start_date.trim(),
                      end_date: currentPayPeriods.end_date.trim(),
                      type_period: currentPayPeriods.type_period,
                      ppaynum: currentPayPeriods.ppaynum
                    });
                    periodObject = await newPayPeriod.save();     
                  }
            }

            //Đồng bộ cách tính số tiền tích lỹ, giới hạn
            if(periodObject != null){
                if(lastPayPeriods != null){
                    var existedDefaultPayCalculate = null;
                    if(req.local_default_current_period_id != null) {
                        var conditionPayCalculate = {
                          "pay_period_id": req.local_default_current_period_id,
                          "staff_id": staffObject._id
                        }
                        existedDefaultPayCalculate = await PayCalculateModel.findOne(conditionPayCalculate);
                    }
                    if(existedDefaultPayCalculate != null){
                        //Update to default current
                        await PayCalculateModel.findOneAndUpdate({"_id": existedDefaultPayCalculate._id}, {$set: {pay_period_id: periodObject._id}});
                    }

                    //Update Pay Calculate
                    var conditionPayCalculate = {
                      "pay_period_id": periodObject._id,
                      "staff_id": staffObject._id
                    }
                    var payCalculate = await PayCalculateModel.findOne(conditionPayCalculate);
                    if(payCalculate == null) {
                        var newPayCalculate = new PayCalculateModel({
                          pay_period_id: periodObject._id,
                          staff_id: staffObject._id,
                          total_hours: calcLastPayPeriods.total_hours,
                          total_amount: calcLastPayPeriods.total_amount,
                          mount_per_day: calcLastPayPeriods.mount_per_day,
                          total_by_type:  calcLastPayPeriods.total_by_type,
                          cal_from_period_ppaynum: lastPayPeriods.ppaynum,
                          cal_from_period_startdate: lastPayPeriods.pstartdate,
                          cal_from_period_enddate: lastPayPeriods.penddate,
                          netpay: netpay
                        });
                        payCalculate = await newPayCalculate.save();     
                    } else {
                        //Nếu tồn tại thì update lại total hours, total mount...
                        await PayCalculateModel.findOneAndUpdate({"_id": payCalculate._id}, 
                              {$set: {
                                  total_hours: calcLastPayPeriods.total_hours,
                                  total_amount: calcLastPayPeriods.total_amount,
                                  mount_per_day: calcLastPayPeriods.mount_per_day,
                                  total_by_type:  calcLastPayPeriods.total_by_type,
                                  cal_from_period_ppaynum: lastPayPeriods.ppaynum,
                                  cal_from_period_startdate: lastPayPeriods.pstartdate,
                                  cal_from_period_enddate: lastPayPeriods.penddate,
                                  netpay: netpay
                              }});
                    }

                }
            } else if (req.local_default_current_period_id != null){
                      if(lastPayPeriods != null){
                          //Update Pay Calculate
                          var conditionPayCalculate = {
                            "pay_period_id": req.local_default_current_period_id,
                            "staff_id": staffObject._id
                          }
                          var payCalculate = await PayCalculateModel.findOne(conditionPayCalculate);
                          if(payCalculate == null) {
                              var newPayCalculate = new PayCalculateModel({
                                pay_period_id: req.local_default_current_period_id,
                                staff_id: staffObject._id,
                                total_hours: calcLastPayPeriods.total_hours,
                                total_amount: calcLastPayPeriods.total_amount,
                                mount_per_day: calcLastPayPeriods.mount_per_day,
                                total_by_type:  calcLastPayPeriods.total_by_type,
                                cal_from_period_ppaynum: lastPayPeriods.ppaynum,
                                cal_from_period_startdate: lastPayPeriods.pstartdate,
                                cal_from_period_enddate: lastPayPeriods.penddate,
                                netpay: netpay
                              });
                              payCalculate = await newPayCalculate.save();     
                          } else {
                              //Nếu tồn tại thì update lại total hours, total mount...
                              await PayCalculateModel.findOneAndUpdate({"_id": payCalculate._id}, 
                                { $set: {
                                  total_hours: calcLastPayPeriods.total_hours,
                                  total_amount: calcLastPayPeriods.total_amount,
                                  mount_per_day: calcLastPayPeriods.mount_per_day,
                                  total_by_type:  calcLastPayPeriods.total_by_type,
                                  cal_from_period_ppaynum: lastPayPeriods.ppaynum,
                                  cal_from_period_startdate: lastPayPeriods.pstartdate,
                                  cal_from_period_enddate: lastPayPeriods.penddate,
                                  netpay: netpay
                                  }});    
                          }
                  }
            }

            //Đồng bộ khấu trừ cho từng nhân viên
            var deducttionCurrentPeriod = staff.deducttion_current_period;
            var periodId = null;
            if(periodObject != null){
                periodId = periodObject._id;
            } else {
                periodId = req.local_default_current_period_id;
            }
            var conditionPayDeduction = {
              "pay_period_id": periodId,
              "staff_id": staffObject._id
            }
            var allPayDeductions = await PayDeductionModel.find(conditionPayDeduction);
            
            if(deducttionCurrentPeriod != null && deducttionCurrentPeriod.length){
              for(var j = 0; j < deducttionCurrentPeriod.length; j++) {
                    var itemDeducttionCurrentPeriod = deducttionCurrentPeriod[j];
                    var existedPayDeduction = await checkPayDeductionsForSync(req.local_company_id, staffObject._id, periodId, itemDeducttionCurrentPeriod);
                    
                    if(existedPayDeduction != null) {
                        for(var k = 0; k < allPayDeductions.length; k++) {
                              var payDeduction = allPayDeductions[k];
                              if(payDeduction != null && payDeduction.deduction_id.equals(existedPayDeduction.deduction_id)
                                                        && payDeduction.pdid == existedPayDeduction.pdid){
                                    allPayDeductions.splice(k, 1)
                                    k--;
                                    break;
                              }
                        }
                    }
              }
            }

            //Xóa những khấu trừ đã xóa từ Local
            if(allPayDeductions.length > 0){
                var ids = new Array();
                for(var key in allPayDeductions) {
                    if (allPayDeductions.hasOwnProperty(key)) {
                        var payDeduction = allPayDeductions[key];
                        ids.push(payDeduction._id);
                    }
                }
                if(ids.length > 0){
                    await PayDeductionModel.deleteMany({_id: {$in: ids}, pdid: {$ne: 0}})
                }
            }
      }

      return res.json({success: true, msg: 'Sync DB successfully.'});

  };

  async function checkPayDeductionsForSync(companyId, staffId, periodId, deduction){
        var conditionDeduction = {
          "company_id": companyId,
          "decode" : deduction.decode,
          "code" : deduction.code
        }
        var existedDeduction = await DeductionModel.findOne(conditionDeduction);
        var existedPayDeduction = null;
        if(existedDeduction != null){
            var conditionPayDeduction = {
              "pay_period_id": periodId,
              "staff_id" : staffId,
              "deduction_id" : existedDeduction._id,
              "pdid" : deduction.pdid
            }
            var existedPayDeduction = await PayDeductionModel.findOne(conditionPayDeduction);
            if(existedPayDeduction == null){
                var newPayDeduction = new PayDeductionModel({
                    pay_period_id: periodId,
                    staff_id: staffId,
                    deduction_id: existedDeduction._id,
                    pdid: deduction.pdid,
                    date: deduction.date
                });
                await newPayDeduction.save();
            }
        }
        return existedPayDeduction;
  }