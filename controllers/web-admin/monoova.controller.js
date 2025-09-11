const request = require("request");
const mongoose = require("mongoose");

const MonoovaTransactionModel = require("../../models/monoova_transaction");
const LenderLinkCompanyModel = require("../../models/lender_link_company");
const PayDeductionModel = require("../../models/pay_deduction");
const CompanyModel = require("../../models/company");
const LenderFinancialModel = require("../../models/web-admin/lender_financial");

const { API_HTTPS } = require("../../config/http");
const baseService = require("../../service/baseService");

exports.getReconciles = async (req, res) => {
  const companyId = req.session.company_id;
  const is_monoova_live_mode = (await CompanyModel.findById(companyId))
    .is_monoova_live_mode;
  //get lender link company
  const lenderLinkCompany = await LenderLinkCompanyModel.aggregate([
    {
      $match: {
        $and: [
          { company_id: mongoose.Types.ObjectId(companyId) },
          { is_active: true },
        ],
      },
    },
    {
      $lookup: {
        from: "lenders",
        localField: "lender_id",
        foreignField: "_id",
        as: "lenders",
      },
    },
  ]);
  const condition = {
    $or: [
      { 
        pay_period_id: {$ne: null}, company_id: mongoose.Types.ObjectId(companyId), lender_id:{$ne: null} 
      },
      {
        lender_id: lenderLinkCompany[0]?.lender_id,
        monoova_transaction_id: {$ne: null}
      },
    ],
    is_validate_small_transaction: null,
	  is_monoova_live_mode: is_monoova_live_mode
  };

  //query total amount lender financial
  const queryTotalAmountLenderFinancial = LenderFinancialModel.aggregate([
    { $match: { lender_id: lenderLinkCompany[0]?.lender_id } },
    {
      $lookup: {
        from: "monoova_transactions",
        let: {
          monoova_transaction_id: "$monoova_transaction_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", "$$monoova_transaction_id"],
                  },
                  { $eq: ["$is_monoova_live_mode", is_monoova_live_mode] },
                ],
              },
            },
          },
        ],
        as: "monoova_transaction",
      },
    },
    {
      $unwind: "$monoova_transaction",
    },
    {
      $group: {
        _id: null,
        total_amount: { $sum: "$amount" },
      },
    },
  ]);
  //query total debit reconcile
  const queryTotalDebitReconcile = PayDeductionModel.aggregate([
    {
      $match: {
        $or: [
          { company_id: mongoose.Types.ObjectId(companyId) },
          { lender_id: lenderLinkCompany[0]?.lender_id, monoova_transaction_id: {$ne: null} },
        ],
        is_validate_small_transaction: null,
        is_monoova_live_mode: is_monoova_live_mode,
      },
    },
    {
      $lookup: {
        from: "deductions",
        let: {
          deduction_id: "$deduction_id",
          transaction_id: "$transaction_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", "$$deduction_id"],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "monoova_transactions",
              let: { transaction_id: "$$transaction_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$transactionId", "$$transaction_id"],
                        },
                      ],
                    },
                  },
                },
                {
                  $addFields: {
                    total_debit_amount: { $sum: { $ifNull: ["$debit", 0] } },
                    total_debit_amount_fee: {
                      $sum: { $ifNull: ["$fee_debit", 0] },
                    },
                  },
                },
              ],
              as: "monoova_transactions",
            },
          },
          {
            $addFields: {
              child_monoova_amount: {
                $sum: "$monoova_transactions.total_debit_amount",
              },
              child_monoova_amount_fee: {
                $sum: "$monoova_transactions.total_debit_amount_fee",
              },
            },
          },
        ],
        as: "deductions",
      },
    },
    {
      $addFields: {
        monoova_amount: {
          $sum: "$deductions.child_monoova_amount",
        },
        monoova_amount_fee: {
          $sum: "$deductions.child_monoova_amount_fee",
        },
        cashd_amount: {
          $sum: "$deductions.amount",
        },
        cashd_amount_fee: {
          $sum: "$deductions.fee_amount",
        },
      },
    },
    {
      $group: {
        _id: null,
        main_monoova_amount: { $sum: "$monoova_amount" },
        main_monoova_amount_fee: { $sum: "$monoova_amount_fee" },
        main_cashd_amount: { $sum: "$cashd_amount" },
        main_cashd_amount_fee: { $sum: "$cashd_amount_fee" },
      },
    },
  ]);

  //get reconciles
  const queryReconciles = PayDeductionModel.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "deductions",
        let: {
          deduction_id: "$deduction_id",
          transaction_id: "$transaction_id",
          pay_period_id: "$pay_period_id",
          staff_id: "$staff_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", "$$deduction_id"],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "monoova_transactions",
              let: { transaction_id: "$$transaction_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$transactionId", "$$transaction_id"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "monoova_transactions",
            },
          },
          {
            $lookup: {
              from: "pay_periods",
              let: { pay_period_id: "$$pay_period_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$pay_period_id"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "pay_periods",
            },
          },
        ],
        as: "deductions",
      },
    },
    {
      $lookup: {
        from: "monoova_transactions",
        localField: "monoova_transaction_id",
        foreignField: "_id",
        as: "monoova_transactions",
      },
    },
    {
      $sort: { date: -1 },
    },
    { $skip: +req.body.page * +req.body.pageSize },
    { $limit: +req.body.pageSize },
  ]);
  //total item
  const queryTotal = PayDeductionModel.countDocuments(condition);
  const [
    reconcileList,
    total,
    totalAmountLenderFinancial,
    totalDebitReconcile,
  ] = await Promise.all([
    queryReconciles,
    queryTotal,
    queryTotalAmountLenderFinancial,
    queryTotalDebitReconcile,
  ]);
  return res
    .status(200)
    .send({
      result: reconcileList,
      total: total,
      totalAmountLenderFinancial,
      totalDebitReconcile,
    });
};

exports.getReconcilesTabMonoova = async (req, res) => {
  const companyId = req.session.company_id;
  const is_monoova_live_mode = (await CompanyModel.findById(companyId))
    .is_monoova_live_mode;
  //get lender link company
  const lenderLinkCompany = await LenderLinkCompanyModel.aggregate([
    {
      $match: {
        $and: [
          { company_id: mongoose.Types.ObjectId(companyId) },
          { is_active: true },
        ],
      },
    },
    {
      $lookup: {
        from: "lenders",
        localField: "lender_id",
        foreignField: "_id",
        as: "lenders",
      },
    },
  ]);

  const condition = {
    $or: [
      { pay_period_id: {$ne: null}, company_id: mongoose.Types.ObjectId(companyId), lender_id:{$ne: null}},
      {
        lender_id: lenderLinkCompany[0]?.lender_id,
        monoova_transaction_id: {$ne: null}
      },
    ],
    is_monoova_live_mode: is_monoova_live_mode,
    is_validate_small_transaction: null,
  };

  // get total
  const queryReconcilesTotal = await PayDeductionModel.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "deductions",
        let: {
          deduction_id: "$deduction_id",
          transaction_id: "$transaction_id",
          pay_period_id: "$pay_period_id",
          staff_id: "$staff_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", "$$deduction_id"],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "monoova_transactions",
              let: { transaction_id: "$$transaction_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$transactionId", "$$transaction_id"],
                        },
                        {
                          uniqueReference: new RegExp("$$reg", "g"),
                        },
                      ],
                    },
                  },
                },
              ],
              as: "monoova_transactions",
            },
          },
          {
            $lookup: {
              from: "pay_periods",
              let: { pay_period_id: "$$pay_period_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$pay_period_id"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "pay_periods",
            },
          },
        ],
        as: "deductions",
      },
    },
    {
      $lookup: {
        from: "monoova_transactions",
        localField: "monoova_transaction_id",
        foreignField: "_id",
        as: "monoova_transactions",
      },
    },
    {
      $sort: { date: -1 },
    },
    {
      $project: {
        _id: true,
        result: {
          $cond: {
            if: { $arrayElemAt: ["$monoova_transactions", 0] },
            then: { $arrayElemAt: ["$monoova_transactions", 0] },
            else: { $arrayElemAt: ["$deductions", 0] },
          },
        },
      },
    },
    {
      $project: {
        _id: true,
        monoova_transaction: {
          $cond: {
            if: { $arrayElemAt: ["$result.monoova_transactions", 0] },
            then: { $arrayElemAt: ["$result.monoova_transactions", 0] },
            else: "$result",
          },
        },
      },
    },
    { $skip: (+req.body.page + 1) * +req.body.pageSize },
    {
      $group: {
        _id: null,
        balance_total: {
          $sum: {
            $subtract: [
              "$monoova_transaction.credit",
              {
                $sum: [
                  [
                    "$monoova_transaction.debit",
                    "$monoova_transaction.fee_debit",
                  ],
                ],
              },
            ],
          },
        },
      },
    },
  ]);

  //total item
  let balance_total = 0;
  const total = await PayDeductionModel.countDocuments(condition);
  if (total > ((+req.body.page + 1)* +req.body.pageSize)) {
    balance_total = queryReconcilesTotal[0].balance_total;
  }

  //get reconciles
  const queryReconciles = await PayDeductionModel.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "deductions",
        let: {
          deduction_id: "$deduction_id",
          transaction_id: "$transaction_id",
          pay_period_id: "$pay_period_id",
          staff_id: "$staff_id",
          reg: "***" + "$transaction_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", "$$deduction_id"],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "monoova_transactions",
              let: { transaction_id: "$$transaction_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$transactionId", "$$transaction_id"],
                        },
                        {
                          uniqueReference: new RegExp("$$reg", "g"),
                        },
                      ],
                    },
                  },
                },
              ],
              as: "monoova_transactions",
            },
          },
          {
            $lookup: {
              from: "pay_periods",
              let: { pay_period_id: "$$pay_period_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$pay_period_id"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "pay_periods",
            },
          },
        ],
        as: "deductions",
      },
    },
    {
      $lookup: {
        from: "monoova_transactions",
        localField: "monoova_transaction_id",
        foreignField: "_id",
        as: "monoova_transactions",
      },
    },
    {
      $sort: { date: -1 },
    },
    {
      $project: {
        _id: true,
        result: {
          $cond: {
            if: { $arrayElemAt: ["$monoova_transactions", 0] },
            then: { $arrayElemAt: ["$monoova_transactions", 0] },
            else: { $arrayElemAt: ["$deductions", 0] },
          },
        },
      },
    },
    {
      $project: {
        _id: true,
        monoova_transaction: {
          $cond: {
            if: { $arrayElemAt: ["$result.monoova_transactions", 0] },
            then: { $arrayElemAt: ["$result.monoova_transactions", 0] },
            else: "$result",
          },
        },
      },
    },
    { $skip: +req.body.page * +req.body.pageSize },
    { $limit: +req.body.pageSize },
  ]);

  if (queryReconciles && queryReconciles.length > 0) {
    queryReconciles.reverse().forEach((item) => {
      if (item.monoova_transaction) {
        let newTotal = 0;
        if (balance_total > 0) {
          newTotal = balance_total - (item.monoova_transaction?.credit === 0 ? item.monoova_transaction?.credit + (item.monoova_transaction?.fee_debit + item.monoova_transaction?.debit) : item.monoova_transaction?.credit - (item.monoova_transaction?.fee_debit + item.monoova_transaction?.debit));
          item.monoova_transaction.balance = newTotal;
        } else {
          newTotal = item.monoova_transaction?.credit - (item.monoova_transaction?.fee_debit + item.monoova_transaction?.debit);
          item.monoova_transaction.balance = newTotal;
        }
        balance_total = newTotal;
      }
    });
  }

  return res
    .status(200)
    .send({ result: queryReconciles.reverse(), total: total });
};

exports.updateReconcile = async (req, res) => {
  const { monoovaId, actionBtn } = req.body;
  let isReconciled = true;
  if (actionBtn == "cancel") {
    isReconciled = false;
  }
  await MonoovaTransactionModel.findOneAndUpdate(
    { _id: monoovaId },
    { is_reconciled: isReconciled }
  );

  return res.send();
};

exports.syncMonoovaTransactions = async (req, res) => {
  const token = req.session.token,
    companyId = req.params.id,
    url = '/api/timesheets/syncMonoovaTransactionsByCompanyId';

  const response = await baseService.getInstance().post(url, { company_id: companyId }, token, req);
  return res.send(response.body);
};

exports.getPayCycleSummary = async(req, res) => {
  const companyId = req.body.companyId;
  const payPeriodsId = req.body.payPeriodsId;
  const is_monoova_live_mode = (await CompanyModel.findById(companyId)).is_monoova_live_mode;
  const condition = {
    company_id: mongoose.Types.ObjectId(companyId), 
    is_monoova_live_mode: is_monoova_live_mode,
    is_validate_small_transaction: null,
  };
  let deduction = 0, totalFeesPaid = 0, totalWithdrawal = 0, totalFessEarned = 0;

  if (payPeriodsId !== "") {
    condition.pay_period_id = mongoose.Types.ObjectId(payPeriodsId);
  }

  //get reconciles
  const queryReconciles = PayDeductionModel.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "deductions",
        let: {
          deduction_id: "$deduction_id",
          transaction_id: "$transaction_id",
          pay_period_id: "$pay_period_id",
          staff_id: "$staff_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", "$$deduction_id"],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "monoova_transactions",
              let: { transaction_id: "$$transaction_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$transactionId", "$$transaction_id"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "monoova_transactions",
            },
          },
          {
            $lookup: {
              from: "pay_periods",
              let: { pay_period_id: "$$pay_period_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$pay_period_id"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "pay_periods",
            },
          },
        ],
        as: "deductions",
      },
    },
    {
      $lookup: {
        from: "monoova_transactions",
        localField: "monoova_transaction_id",
        foreignField: "_id",
        as: "monoova_transactions",
      },
    },
    {
      $sort: { date: -1 },
    },
    { $skip: +req.body.page * +req.body.pageSize },
    { $limit: +req.body.pageSize },
  ]);
  //query total
  const queryTotals = PayDeductionModel.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "deductions",
        let: {
          deduction_id: "$deduction_id",
          transaction_id: "$transaction_id",
          pay_period_id: "$pay_period_id",
          staff_id: "$staff_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", "$$deduction_id"],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "monoova_transactions",
              let: { transaction_id: "$$transaction_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$transactionId", "$$transaction_id"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "monoova_transactions",
            },
          },
          {
            $lookup: {
              from: "pay_periods",
              let: { pay_period_id: "$$pay_period_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$pay_period_id"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "pay_periods",
            },
          },
        ],
        as: "deductions",
      },
    },
    {
      $lookup: {
        from: "monoova_transactions",
        localField: "monoova_transaction_id",
        foreignField: "_id",
        as: "monoova_transactions",
      },
    },
    {
      $sort: { date: -1 },
    }
  ]);

  const [
    reconcileList,
    totals
  ] = await Promise.all([
    queryReconciles,
    queryTotals
  ]);

  totals.forEach((item) => {
    let monoovaTransactions; 
    if (item.deductions.length > 0) {
      monoovaTransactions = item.deductions[0].monoova_transactions;
      totalWithdrawal += item.deductions[0].amount + item.deductions[0].fee_amount;
    } else {
      monoovaTransactions = item.monoova_transactions;
    } 
    if (monoovaTransactions?.length > 0) {
      deduction += monoovaTransactions[0].debit;
      totalFeesPaid += monoovaTransactions[0].fee_debit;
    }
  });

  return res
    .status(200)
    .send({
      result: reconcileList,
      total: totals.length,
      deduction,
      totalFeesPaid,
      totalWithdrawal
    });
}
