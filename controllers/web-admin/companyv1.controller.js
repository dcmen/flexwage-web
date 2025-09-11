const mongoose = require("mongoose");

const CycleModel = require("../../models/cycle");
const XeroDeductionCategoryModel = require("../../models/xero/xero_deduction_type");
const XeroPayrollCalendarModel = require("../../models/xero/xero_payroll_calendar");
const XeroTaxModel = require("../../models/xero/xero_tax_account");
const XeroAccountTypeModel = require("../../models/xero/xero_account_type");
const XeroAccountModel = require("../../models/xero/xero_account");
const KeypayDeductionCategoryModel = require("../../models/keypay/keypay_deduction_category");
const KeypayPayrollScheduleModel = require("../../models/keypay/keypay_pay_schedule");
const StaffModel = require("../../models/staff");
const UnregisteredStaffModel = require("../../models/keypay/unregistered_staff");
const ActiveCodeModel = require("../../models/activation_code");

const getCycles = async (req, res) => {
  try {
    //get cycles
    const cycles = await CycleModel.find().sort({ position: 1 });
    return res.status(200).send({ success: true, result: cycles });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ success: false, result: null });
  }
}

const getPayrollData = async (req, res) => {
  const { companyId, code } = req.query;

  //get list account
  const queryAllAccounts = XeroAccountModel.aggregate([
    { $match: { company_id: mongoose.Types.ObjectId(companyId) } },
    { $sort: { Code: 1 } },
  ]);

  let deductionCategoryPromise = [];
  if (code == "KEYPAY") {
    //get KeypayDeductionCategory
    deductionCategoryPromise = KeypayDeductionCategoryModel.find({
      company_id: companyId,
    });
  } else if (code == "XERO" || code == "RECKON") {
    //get XERODeductionType
    deductionCategoryPromise = XeroDeductionCategoryModel.aggregate([
      { $match: { company_id: mongoose.Types.ObjectId(companyId) } },
      { $sort: { Name: 1 } },
    ]);
  }

  const [xeroAccounts, deductionCategory] = await Promise.all([queryAllAccounts, deductionCategoryPromise]);
  return res.status(200).send({ success: true, result: {
    xeroAccounts,
    deductionCategory
  } });
}

const getTotalRegistered = async (req, res) => {
  const { companyId } = req.query;
  const registeredStaffs = await StaffModel.aggregate([
    { $match: { company_id: mongoose.Types.ObjectId(companyId) } },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ]);
  
  let totalRegisteredStaffs = 0;
  if (registeredStaffs?.length > 0) {
    totalRegisteredStaffs = registeredStaffs[0].count;
  }

  return res.status(200).send({ totalRegisteredStaffs });
}

const getTotalUnregistered = async (req, res) => {
  const { companyId } = req.query;
  const totalUnregistered = await UnregisteredStaffModel.count({
    company_id: mongoose.Types.ObjectId(companyId),
  });
  return res.status(200).send({ totalUnregistered});
}

const getTotalUnacceptedInvitations = async (req, res) => {
  const { companyId } = req.query;
  const unacceptedInvitations = await UnregisteredStaffModel.aggregate([
    {
      $match: {
        $and: [
          {
            company_id: mongoose.Types.ObjectId(companyId),
          },
        ],
      },
    },
    {
      $lookup: {
        from: "activation_codes",
        let: {
          company_id: "$company_id",
          system_employee_id: "$system_employee_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$company_infor._id", "$$company_id"],
                  },
                  {
                    $eq: [
                      "$staff_infor.system_employee_id",
                      "$$system_employee_id",
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "activation_codes",
      },
    },
    { $addFields: { is_invited: { $size: "$activation_codes" } } },
    { $match: { is_invited: { $gt: 0 } } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);

  let total = 0;
  if (unacceptedInvitations[0]) {
    total = unacceptedInvitations[0].count;
  }
  return res.status(200).send({totalUnacceptedInvitations: total});
}


module.exports = {
  getCycles,
  getPayrollData,
  getTotalRegistered,
  getTotalUnregistered,
  getTotalUnacceptedInvitations
};