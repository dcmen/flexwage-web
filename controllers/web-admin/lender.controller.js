const mongoose = require('mongoose');
var request = require('request');
var CryptoJS = require("crypto-js");
const moment = require("moment");
let asyncRequest = require('async-request')

const LenderFinancialModel = require('../../models/web-admin/lender_financial');
const LenderModel = require('../../models/lender');
const SettingModel = require('../../models/setting');
const CommonController = require('./commonController');
const LenderLinkCompanyModel = require('../../models/lender_link_company');
const CompanyModel = require('../../models/company');

exports.getLenders = async (req, res) => {
  const setting = await SettingModel.findOne();
  return res.render('lenders/index', {
    title: 'Lenders',
    pageName: 'lenders',
    csrfToken: req.csrfToken(),
    key: setting.encryption_key,
  });
}

exports.addLender = async (req, res) => {
  const lenderSupper = await LenderModel.find({
    is_supper_lender: true
  });
  const setting = await SettingModel.findOne();
  return res.render('lenders/add-lender', {
    title: 'Lender',
    pageName: 'lender',
    lenderSupper: lenderSupper,
    csrfToken: req.csrfToken(),
    key: setting.encryption_key
  });
}

exports.addLenderSupper = async (req, res) => {
  const setting = await SettingModel.findOne();
  return res.render('lenders/add-supper-lender', {
    title: 'Lender supper',
    pageName: 'supper-lender',
    key: setting.encryption_key,
    csrfToken: req.csrfToken()
  });
}

exports.newLender = async (req, res) => {
  const setting = await SettingModel.findOne();
  var lender = {};
  let lenderObject = new LenderModel();
  let where = {};
  let checkLender;

  for (var key in req.body) {
    if (!req.body[key]) {
      return res.status(400).send({
        success: false,
        result: null,
        message: key,
        code: 400,
        errorCode: 'INVALID PARAMS',
      });
    }
  }

  var {
    fundingType,
    interest,
    interestRateType,
    lenderName,
    accountType,
    parentId,
    isCashd,
    isTypeCashd
  } = req.body;

  lender.lender_name = lenderName;
  if (req.body.accountNameTest && req.body.accountNumberTest && req.body.bsbTest) {
    lender.test_receivables_account_name = req.body.accountNameTest;
    lender.test_receivables_account_number = await CommonController.encryptKeyClient(setting.encryption_key, req.body.accountNumberTest);
    lender.test_receivables_account_bsb = await CommonController.encryptKeyClient(setting.encryption_key, req.body.bsbTest);
    where = {
      "test_receivables_account_number": lender.test_receivables_account_number,
      "test_receivables_account_bsb": lender.test_receivables_account_bsb,
    };
  }
  if (req.body.accountNameLive && req.body.accountNumberLive && req.body.bsbLive) {
    lender.live_receivables_account_name = req.body.accountNameLive;
    lender.live_receivables_account_number = await CommonController.encryptKeyClient(setting.encryption_key, req.body.accountNumberLive);
    lender.live_receivables_account_bsb = await CommonController.encryptKeyClient(setting.encryption_key, req.body.bsbLive);
    where = {
      ...where,
      "live_receivables_account_number": lender.live_receivables_account_number,
      "live_receivables_account_bsb": lender.test_receivables_account_bsb
    };
  }

  lender.funding_type = fundingType;
  lender.interest_rate_value = interest;
  lender.interest_rate_type = interestRateType;
  lender.monoova_account_type = accountType;
  lender.start_date = Date.now();
  lender.is_cashd = isCashd;
  lender.status = 1;
  lender.parent_id = parentId == 'null' ? null : parentId;
  if (parentId == 'null') {
    if (req.body.liveMonoovaAccountNumber) {
      lender.live_account_number = req.body.liveMonoovaAccountNumber;
      lender.live_api_key = await CommonController.encryptKeyClient(setting.encryption_key, req.body.liveApiKey);
      lender.live_fee_account_number = req.body.liveMonoovaFeeAccountNumber;
      where = {
        ...where,
        live_api_key: lender.live_api_key
      };
    }
    lender.test_account_number = req.body.testMonoovaAccountNumber;
    lender.test_api_key = await CommonController.encryptKeyClient(setting.encryption_key, req.body.testApiKey);
    where = {
      ...where,
      test_api_key: lender.test_api_key
    };
    checkLender = await LenderModel.findOne(where);
  } else {
    if (lender.live_receivables_account_name || lender.test_receivables_account_name) {
      where = {
        ...where,
        $or: [{
            parent_id: lender.parent_id
          },
          {
            _id: lender.parent_id
          }
        ]
      };
      checkLender = await LenderModel.findOne(where);
    }
  }
  if (checkLender) {
    return res.status(200).send({
      success: false,
      result: null,
      message: "This lender information has already registered on CashD.",
      code: 200,
      errorCode: null,
    });
  }

  for (const key in lender) {
    lenderObject[key] = lender[key];
  }

  var result = await lenderObject.save();
  if (result) {
    return res.status(200).send({
      success: true,
      result: result,
      message: null,
      code: 200,
      errorCode: null,
    });
  } else {
    return res.status(200).send({
      success: false,
      result: null,
      message: "Add lender failed",
      code: 200,
      errorCode: null,
    });
  }
}

exports.newSupperLender = async (req, res) => {
  const setting = await SettingModel.findOne();
  var lender = {};
  let lenderObject = new LenderModel();
  let where = {is_supper_lender: false,};
  let checkLender;

  for (var key in req.body) {
    if (!req.body[key]) {
      console.log(key);
      return res.status(400).send({
        success: false,
        result: null,
        message: key,
        code: 400,
        errorCode: 'INVALID PARAMS',
      });
    }
  }

  var {
    fundingType,
    interest,
    interestRateType,
    lenderName,
    accountType,
  } = req.body;

  lender.lender_name = lenderName;
  if (req.body.accountNameTest && req.body.accountNumberTest && req.body.bsbTest) {
    lender.test_receivables_account_name = req.body.accountNameTest;
    lender.test_receivables_account_number = await CommonController.encryptKeyClient(setting.encryption_key, req.body.accountNumberTest);
    lender.test_receivables_account_bsb = await CommonController.encryptKeyClient(setting.encryption_key, req.body.bsbTest);
    where = {
      ...where,
      "test_receivables_account_number": lender.test_receivables_account_number,
      "test_receivables_account_bsb": lender.test_receivables_account_bsb,
    };
  }
  if (req.body.accountNameLive && req.body.accountNumberLive && req.body.bsbLive) {
    lender.live_receivables_account_name = req.body.accountNameLive;
    lender.live_receivables_account_number = await CommonController.encryptKeyClient(setting.encryption_key, req.body.accountNumberLive);
    lender.live_receivables_account_bsb = await CommonController.encryptKeyClient(setting.encryption_key, req.body.bsbLive);
    where = {
      ...where,
      "live_receivables_account_number": lender.live_receivables_account_number,
      "live_receivables_account_bsb": lender.test_receivables_account_bsb
    };
  }

  lender.funding_type = fundingType;
  lender.interest_rate_value = interest;
  lender.interest_rate_type = interestRateType;
  lender.monoova_account_type = accountType;
  lender.start_date = Date.now();
  lender.is_cashd = false;
  lender.status = 1;
  lender.parent_id = null;
  lender.is_supper_lender = true;
  if (req.body.liveMonoovaAccountNumber) {
    lender.live_account_number = req.body.liveMonoovaAccountNumber;
    lender.live_api_key = await CommonController.encryptKeyClient(setting.encryption_key, req.body.liveApiKey);
    lender.live_fee_account_number = req.body.liveMonoovaFeeAccountNumber;
    where = {
      ...where,
      live_api_key: lender.live_api_key
    };
  }
  if (req.body.testMonoovaAccountNumber) {
    lender.test_account_number = req.body.testMonoovaAccountNumber;
    lender.test_api_key = await CommonController.encryptKeyClient(setting.encryption_key, req.body.testApiKey);
    where = {
      ...where,
      test_api_key: lender.test_api_key
    };
  } else {
    return res.status(200).send({
      success: false,
      result: null,
      message: "Add lender failed",
      code: 200,
      errorCode: null,
    });
  }
  checkLender = await LenderModel.findOne(where);
  if (checkLender) {
    return res.status(200).send({
      success: false,
      result: null,
      message: "This lender information has already registered on CashD.",
      code: 200,
      errorCode: null,
    });
  }

  for (const key in lender) {
    lenderObject[key] = lender[key];
  }

  var result = await lenderObject.save();
  if (result) {
    return res.status(200).send({
      success: true,
      result: result,
      message: null,
      code: 200,
      errorCode: null,
    });
  } else {
    return res.status(200).send({
      success: false,
      result: null,
      message: "Add lender failed",
      code: 200,
      errorCode: null,
    });
  }
}

exports.getListLenders = async (req, res) => {
  const setting = await SettingModel.findOne();
  let where;
  let {
    searchKey,
    is_supper_lender
  } = req.body;
  if (is_supper_lender == 'true') {
    where = {
      "is_supper_lender": true
    }
  } else {
    where = {
      $and: [{
          $or: [{
              "lender_name": new RegExp(searchKey, 'i')
            },
            {
              "funding_type": new RegExp(searchKey, 'i')
            }
          ]
        },
        {
          $or: [{
              "is_supper_lender": false
            },
            {
              "is_supper_lender": null
            }
          ]
        }
      ]
    }
  }
  let lenders = await LenderModel.aggregate([{
      $match: where
    },
    {
      $lookup: {
        from: "lenders",
        localField: "parent_id",
        foreignField: "_id",
        as: "lender_parent"
      }
    },
    {
      $lookup: {
        from: "lender_financials",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                    $eq: ["$lender_id", "$$lender_id"]
                  },
                  {
                    $eq: ["$type", 'CAPITAL_LOAN']
                  }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "monoova_transactions",
              "let": {
                "monoova_transaction_id": "$monoova_transaction_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$_id", "$$monoova_transaction_id"]
                      },
                      {
                        "$eq": ["$is_monoova_live_mode", false]
                      }
                    ]
                  }
                }
              }],
              as: 'monoova_transaction'
            }
          },
          {
            $unwind: "$monoova_transaction"
          }
        ],
        as: 'test_lender_finacials'
      }
    },
    {
      $lookup: {
        from: "lender_financials",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                    $eq: ["$lender_id", "$$lender_id"]
                  },
                  {
                    $eq: ["$type", 'CAPITAL_LOAN']
                  }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "monoova_transactions",
              "let": {
                "monoova_transaction_id": "$monoova_transaction_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$_id", "$$monoova_transaction_id"]
                      },
                      {
                        "$eq": ["$is_monoova_live_mode", true]
                      }
                    ]
                  }
                }
              }],
              as: 'monoova_transaction'
            }
          },
          {
            $unwind: "$monoova_transaction"
          }
        ],
        as: 'live_lender_finacials'
      }
    },
    {
      $lookup: {
        from: "lender_link_companies",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
          $match: {
            $expr: {
              $and: [{
                  $eq: ["$lender_id", "$$lender_id"]
                },
                {
                  $eq: ["$is_active", true]
                }
              ]
            }
          }
        }, ],
        as: 'lender_link_companies'
      }
    },
    {
      $lookup: {
        from: "companies",
        localField: "lender_link_companies.company_id",
        foreignField: "_id",
        as: "companies"
      }
    },
    {
      $lookup: {
        from: "deductions",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                  $eq: ["$lender_id", "$$lender_id"]
                }]
              }
            }
          },
          {
            $lookup: {
              from: "pay_deductions",
              "let": {
                "deduction_id": "$_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$deduction_id", "$$deduction_id"]
                      },
                      {
                        "$eq": ["$is_monoova_live_mode", false]
                      }
                    ]
                  }
                }
              }],
              as: 'pay_deduction'
            }
          },
          {
            $unwind: "$pay_deduction"
          }
        ],
        as: 'test_deductions'
      }
    },
    {
      $lookup: {
        from: "deductions",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                  $eq: ["$lender_id", "$$lender_id"]
                }]
              }
            }
          },
          {
            $lookup: {
              from: "pay_deductions",
              "let": {
                "deduction_id": "$_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$deduction_id", "$$deduction_id"]
                      },
                      {
                        "$eq": ["$is_monoova_live_mode", true]
                      }
                    ]
                  }
                }
              }],
              as: 'pay_deduction'
            }
          },
          {
            $unwind: "$pay_deduction"
          }
        ],
        as: 'live_deductions'
      }
    },
    {
      $addFields: {
        'total_amount_test': {
          $sum: "$test_lender_finacials.amount"
        },
      }
    },
    {
      $addFields: {
        'total_amount_live': {
          $sum: "$live_lender_finacials.amount"
        },
      }
    },
    {
      $addFields: {
        'total_deduction_test': {
          $sum: "$test_deductions.total_deduction"
        },
      }
    },
    {
      $addFields: {
        'total_deduction_live': {
          $sum: "$live_deductions.total_deduction"
        },
      }
    },
    {
      $skip: +req.body.page * +req.body.pageSize
    },
    {
      $limit: +req.body.pageSize
    }
  ]);
  let totalItems = await LenderModel.countDocuments(where);
  let result = await decryptionLender(lenders, setting);
  return res.json({
    success: true,
    result,
    totalItems: totalItems,
    message: null,
    code: 200,
    errorCode: null
  });
}

exports.getListLenderCompany = async (req, res) => {
  let condition = {};
  const ObjectId = mongoose.Types.ObjectId;
  const company = await CompanyModel.findById(req.session.company_id);
  const setting = await SettingModel.findOne();
  const is_monoova_live_mode = company.is_monoova_live_mode == true;
  const lendersInActive = await LenderLinkCompanyModel.find({
    is_active: true
  });
  let {
    searchKey
  } = req.body;
  let whereLender = {};

  if (lendersInActive.length > 0) {
    let newArr = [];
    lendersInActive.forEach(element => {
      newArr.push(ObjectId(element.lender_id));
    });
    whereLender = {
      _id: {
        $nin: newArr
      }
    };
  }

  // where query
  where = {
    $and: [{
        $or: [{
            "lender_name": new RegExp(searchKey, 'i')
          },
          {
            "funding_type": new RegExp(searchKey, 'i')
          }
        ]
      },
      {
        "is_cashd": false,
      },
      {
        "is_supper_lender": false,
      },
      {
        "status": 1
      },
      whereLender
    ]
  };

  // get lender
  let lenders = await LenderModel.aggregate([{
      $match: where
    },
    {
      $lookup: {
        from: "lender_financials",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                    $eq: ["$lender_id", "$$lender_id"]
                  },
                  {
                    $eq: ["$type", 'CAPITAL_LOAN']
                  }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "monoova_transactions",
              "let": {
                "monoova_transaction_id": "$monoova_transaction_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$_id", "$$monoova_transaction_id"]
                      },
                      {
                        '$eq': ['$is_monoova_live_mode', is_monoova_live_mode]
                      }
                    ]
                  }
                }
              }],
              as: 'monoova_transaction'
            }
          },
          {
            $unwind: "$monoova_transaction"
          }
        ],
        as: 'lender_finacials'
      }
    },
    {
      $lookup: {
        from: "deductions",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                  $eq: ["$lender_id", "$$lender_id"]
                }]
              }
            }
          },
          {
            $lookup: {
              from: "pay_deductions",
              "let": {
                "deduction_id": "$_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$deduction_id", "$$deduction_id"]
                      },
                      {
                        '$eq': ['$is_monoova_live_mode', is_monoova_live_mode]
                      }
                    ]
                  }
                }
              }],
              as: 'pay_deduction'
            }
          },
          {
            $unwind: "$pay_deduction"
          }
        ],
        as: 'deductions'
      }
    },
    {
      $addFields: {
        'total_amount': {
          $sum: "$lender_finacials.amount"
        },
      }
    },
    {
      $addFields: {
        'total_deduction': {
          $sum: "$deductions.total_deduction"
        },
      }
    },
    {
      $skip: +req.body.page * +req.body.pageSize
    },
    {
      $limit: +req.body.pageSize
    }
  ]);
  let totalItems = await LenderModel.countDocuments(where);
  let result = await decryptionLender(lenders, setting);
  return res.json({
    success: true,
    result,
    totalItems: totalItems,
    message: null,
    code: 200,
    errorCode: null
  });
}

async function decryptionLender(lenders, setting) {
  let arrLender = [];
  for (const lender of lenders) {
    if (lender.test_receivables_account_number) {
      lender.test_receivables_account_number = await CommonController.decryptionKeyClient(setting.encryption_key, lender.test_receivables_account_number);
      lender.test_receivables_account_bsb = await CommonController.decryptionKeyClient(setting.encryption_key, lender.test_receivables_account_bsb);
    }
    if (lender.live_receivables_account_number) {
      lender.live_receivables_account_number = await CommonController.decryptionKeyClient(setting.encryption_key, lender.live_receivables_account_number);
      lender.live_receivables_account_bsb = await CommonController.decryptionKeyClient(setting.encryption_key, lender.live_receivables_account_bsb);
    }
    arrLender.push(lender);
  }
  return arrLender;
}

exports.deleteLender = async (req, res) => {
  try {
    await LenderModel.findOneAndUpdate({
      _id: req.params.id
    }, {
      status: 2
    });
    await LenderLinkCompanyModel.findOneAndUpdate({
      lender_id: req.params.id,
      is_active: true
    }, {
      is_active: false
    });
    return res.json({
      success: true,
      result: null,
      totalItems: null,
      message: null,
      code: 200,
      errorCode: null,
    });
  } catch (error) {
    return res.json({
      success: false,
      result: null,
      totalItems: null,
      message: "The lender does not exist!",
      code: 200,
      errorCode: null,
    });
  }
}

exports.getInfoLender = async (req, res) => {
  let messages = req.flash("error");
  const setting = await SettingModel.findOne();
  const lender = await LenderModel.findOne({
    _id: req.params.id
  });
  if (lender.test_receivables_account_number && lender.test_receivables_account_bsb) {
    lender.test_receivables_account_number = await CommonController.decryptionKeyClient(setting.encryption_key, lender.test_receivables_account_number);
    lender.test_receivables_account_bsb = await CommonController.decryptionKeyClient(setting.encryption_key, lender.test_receivables_account_bsb);
  }
  if (lender.live_receivables_account_number && lender.live_receivables_account_bsb) {
    lender.live_receivables_account_number = await CommonController.decryptionKeyClient(setting.encryption_key, lender.live_receivables_account_number);
    lender.live_receivables_account_bsb = await CommonController.decryptionKeyClient(setting.encryption_key, lender.live_receivables_account_bsb);
  }
  if (lender.live_api_key) {
    lender.live_api_key = await CommonController.decryptionKeyClient(setting.encryption_key, lender.live_api_key);
  }
  if (lender.test_api_key) {
    lender.test_api_key = await CommonController.decryptionKeyClient(setting.encryption_key, lender.test_api_key);
  }
  const lenderSupper = await LenderModel.find({
    is_supper_lender: true
  });
  return res.render('lenders/edit-lender', {
    title: 'Lender',
    pageName: 'lender',
    lender,
    lenderSupper,
    csrfToken: req.csrfToken(),
    messages,
    key: setting.encryption_key,
    is_edit_supper: req.query.is_supper == '1' ? 1 : 0
  });
}

exports.getLender = async (req, res) => {
  const lender = await LenderModel.findOne({
    _id: req.params.id
  });
  const setting = await SettingModel.findOne();
  if (lender.test_receivables_account_number) {
    lender.test_receivables_account_number = await CommonController.decryptionKeyClient(setting.encryption_key, lender.test_receivables_account_number);
    lender.test_receivables_account_bsb = await CommonController.decryptionKeyClient(setting.encryption_key, lender.test_receivables_account_bsb);
  }
  if (lender.live_receivables_account_name) {
    lender.live_receivables_account_number = await CommonController.decryptionKeyClient(setting.encryption_key, lender.live_receivables_account_number);
    lender.live_receivables_account_bsb = await CommonController.decryptionKeyClient(setting.encryption_key, lender.live_receivables_account_bsb);
  }
  if (lender.live_account_number) {
    lender.live_api_key = await CommonController.decryptionKeyClient(setting.encryption_key, lender.live_api_key);
  }
  if (lender.test_api_key) {
    lender.test_api_key = await CommonController.decryptionKeyClient(setting.encryption_key, lender.test_api_key);
  }

  return res.render('lenders/lender', {
    title: 'Lender',
    pageName: 'lender',
    lender,
    csrfToken: req.csrfToken(),
    key: setting.encryption_key
  });
}

exports.editLender = async (req, res) => {
  const setting = await SettingModel.findOne();
  const idObj = new mongoose.Types.ObjectId(req.params.id);
  let where = {
    "_id": {
      "$nin": [idObj]
    }
  };
  let checkLender;
  const form = {
    ...req.body
  };
  try {
    if (form.test_receivables_account_number && form.test_receivables_account_bsb) {
      form.test_receivables_account_number = await CommonController.encryptKeyClient(setting.encryption_key, req.body.test_receivables_account_number);
      form.test_receivables_account_bsb = await CommonController.encryptKeyClient(setting.encryption_key, req.body.test_receivables_account_bsb);
      where = {
        ...where,
        "test_receivables_account_number": form.test_receivables_account_number,
        "test_receivables_account_bsb": form.test_receivables_account_bsb,
      };
    } else {
      form.test_receivables_account_name = null;
      form.test_receivables_account_number = null;
      form.test_receivables_account_bsb = null;
    }
    if (form.live_receivables_account_name && form.live_receivables_account_bsb) {
      form.live_receivables_account_number = await CommonController.encryptKeyClient(setting.encryption_key, form.live_receivables_account_number);
      form.live_receivables_account_bsb = await CommonController.encryptKeyClient(setting.encryption_key, form.live_receivables_account_bsb);
      where = {
        ...where,
        "live_receivables_account_number": form.live_receivables_account_number,
        "live_receivables_account_bsb": form.test_receivables_account_bsb
      };
    } else {
      form.live_receivables_account_name = null;
      form.live_receivables_account_number = null;
      form.live_receivables_account_bsb = null;
    }
    if (form.monoova_account_type == "NEW_ACCOUNT" && form.is_supper_lender == 'false') {
      form.parent_id = null;
      if (form.live_account_number) {
        form.live_api_key = await CommonController.encryptKeyClient(setting.encryption_key, req.body.live_api_key);
        where = {
          ...where,
          live_api_key: form.live_api_key
        };
      }
      form.test_api_key = await CommonController.encryptKeyClient(setting.encryption_key, req.body.test_api_key);
      where = {
        ...where,
        test_api_key: form.test_api_key
      };
      checkLender = await LenderModel.findOne(where);
    } else if (form.is_supper_lender == 'false') {
      form.live_account_number = null;
      form.live_api_key = null;
      form.live_fee_account_number = 0;
      form.test_account_number = null;
      form.test_api_key = null;
      where = {
        ...where,
        $or: [{
            parent_id: form.parent_id
          },
          {
            _id: form.parent_id
          }
        ]
      };
      checkLender = await LenderModel.findOne(where);
    }
    console.log(checkLender);
    if (checkLender) {
      return res.status(200).send({
        success: false,
        result: null,
        message: "This lender information has already registered on CashD.",
        code: 200,
        errorCode: null,
      });
    }

    await LenderModel.findOneAndUpdate({
      "_id": req.params.id
    }, {
      $set: form
    });
    return res.json({
      success: true,
      result: null,
      message: "Update lender successfully",
      code: 200,
      errorCode: null
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      result: null,
      message: "This lender information has already registered on CashD.",
      code: 200,
      errorCode: null
    });
  }
}

exports.updateLenderLinkCompany = async (req, res) => {
  const {
    newLenderId,
    oldLenderId,
    companyId,
    actionText
  } = req.body;
  let lenderId;
  let existLenderLinkCompany;
  if (actionText == 'add') {
    lenderId = newLenderId;
  } else {
    lenderId = oldLenderId;
  }
  if (newLenderId) {
    existLenderLinkCompany = await LenderLinkCompanyModel.findOne({
      lender_id: newLenderId,
      is_active: true
    });
  }
  if (existLenderLinkCompany && actionText != 'remove') {
    return res.status(400).send('Lender does not exist');
  }
  //find lender 
  const oldLenderLinkCompany = await LenderLinkCompanyModel.findOne({
    lender_id: lenderId,
    company_id: companyId
  });
  //check lender link company exist
  if (oldLenderLinkCompany) {
    let isActive = false;
    //edit action
    if (actionText == 'edit') {
      const checkNewLenderLinkCompany = await LenderLinkCompanyModel.findOne({
        lender_id: newLenderId,
        company_id: companyId
      });

      if (!checkNewLenderLinkCompany) {
        //create new lender link company
        const newLenderLinkCompany = new LenderLinkCompanyModel({
          'lender_id': newLenderId,
          'company_id': companyId,
          'is_active': true
        });
        const saveNewLenderLinkCompany = newLenderLinkCompany.save();
        const updateLender = LenderModel.findOneAndUpdate({
          _id: newLenderId
        }, {
          is_active: true
        });
        await Promise.all([saveNewLenderLinkCompany, updateLender]);
      } else {
        lenderId = newLenderId;
        isActive = true;
        //update lender link company
        const updateLenderLink = LenderLinkCompanyModel.update({
          lender_id: oldLenderId,
          company_id: companyId
        }, {
          $set: {
            is_active: false
          }
        });
        //update lender
        const updateLender = LenderModel.findOneAndUpdate({
          _id: oldLenderId
        }, {
          is_active: false
        });
        await Promise.all([updateLenderLink, updateLender]);
      }
      //add action
    } else if (actionText == 'add') {
      isActive = true;
      //remove action
    } else {
      isActive = false;
    }
    //update lender link company
    const updateLenderLink = LenderLinkCompanyModel.update({
      lender_id: lenderId,
      company_id: companyId
    }, {
      $set: {
        is_active: isActive
      }
    });
    //update lender
    const updateLender = LenderModel.findOneAndUpdate({
      _id: lenderId
    }, {
      is_active: isActive
    });
    await Promise.all([updateLenderLink, updateLender]);
    //add new lender
  } else {
    //create new lender link company
    const newLenderLinkCompany = new LenderLinkCompanyModel({
      'lender_id': newLenderId,
      'company_id': companyId,
      'is_active': true
    });
    const saveNewLender = newLenderLinkCompany.save();
    const updateLender = LenderModel.findOneAndUpdate({
      _id: newLenderId
    }, {
      is_active: true
    });
    await Promise.all([saveNewLender, updateLender]);
  }

  return res.send({
    success: true
  });
}

exports.getFinancialDetail = async (req, res) => {
  if (req.body.lenderId) {
    let lenderFinancial = await LenderFinancialModel.find({
      lender_id: req.body.lenderId
    }).skip(+req.body.page * +req.body.pageSize).limit(+req.body.pageSize);
    let totalItems = await LenderFinancialModel.countDocuments({
      lender_id: req.body.lenderId
    });
    return res.send({
      success: true,
      result: lenderFinancial,
      code: 200,
      messages: null,
      errorCode: null,
      totalItems
    });
  } else {
    return res.send({
      success: true,
      result: [],
      code: 200,
      messages: null,
      errorCode: null,
      totalItems: 0
    });
  }
}

exports.checkKeyMonoovaTest = async (req, res) => {
  let apiKey = decryptApiKey(req.body.apiKey, req.body.key);
  var options = {
    'method': 'POST',
    'url': `https://${apiKey}:@api.m-pay.com.au/financial/v2/transaction/validate`,
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "totalAmount": "10",
      "paymentSource": "mAccount",
      "mAccount": {
        "token": req.body.accountNumber
      }
    })

  };
  request(options, function (error, response) {
    if (error) console.log(error);
    return res.send(response.body);
  });
}

exports.checkKeyMonoovaLive = async (req, res) => {
  let apiKey = decryptApiKey(req.body.apiKey, req.body.key);
  var options = {
    'method': 'POST',
    'url': `https://${apiKey}:@api.mpay.com.au/financial/v2/transaction/validate`,
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "totalAmount": "10",
      "paymentSource": "mAccount",
      "mAccount": {
        "token": req.body.accountNumber
      }
    })

  };
  request(options, function (error, response) {
    if (error) console.log(error);
    return res.send(response.body);
  });
  //return res.send({status: "Ok"});
}

exports.changeStatus = async (req, res) => {
  await LenderModel.findOneAndUpdate({
    _id: req.params.id
  }, {
    status: req.body.status
  });
  return res.send({
    success: true,
    result: null,
    code: 200
  });
}

exports.getLenderLinkCompany = async (req, res) => {
  const _id = req.body._id;
  const is_monoova_live_mode = req.body.is_monoova_live_mode == 'true';

  const querySettingPromise = SettingModel.findOne();
  const lenderLinkCompanyPromise = LenderLinkCompanyModel.aggregate([{
      $match: {
        $and: [{
            "company_id": mongoose.Types.ObjectId(_id)
          },
          {
            "is_active": true
          },
        ]
      }
    },
    {
      $lookup: {
        from: "lenders",
        localField: "lender_id",
        foreignField: "_id",
        as: "lenders"
      }
    },
    {
      $lookup: {
        from: "lender_financials",
        let: {
          "lender_id": "$lender_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                    $eq: ["$lender_id", "$$lender_id"]
                  },
                  {
                    $eq: ["$type", 'CAPITAL_LOAN']
                  }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "monoova_transactions",
              "let": {
                "monoova_transaction_id": "$monoova_transaction_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$_id", "$$monoova_transaction_id"]
                      },
                      {
                        '$eq': ['$is_monoova_live_mode', is_monoova_live_mode]
                      }
                    ]
                  }
                }
              }],
              as: 'monoova_transaction'
            }
          },
          {
            $unwind: "$monoova_transaction"
          }
        ],
        as: 'lender_finacials'
      }
    },
    {
      $lookup: {
        from: "deductions",
        let: {
          "lender_id": "$lender_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                  $eq: ["$lender_id", "$$lender_id"]
                }]
              }
            }
          },
          {
            $lookup: {
              from: "pay_deductions",
              "let": {
                "deduction_id": "$_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$deduction_id", "$$deduction_id"]
                      },
                      {
                        '$eq': ['$is_monoova_live_mode', is_monoova_live_mode]
                      }
                    ]
                  }
                }
              }],
              as: 'pay_deduction'
            }
          },
          {
            $unwind: "$pay_deduction"
          }
        ],
        as: 'deductions'
      }
    },
    {
      $addFields: {
        'total_amount': {
          $sum: "$lender_finacials.amount"
        },
      }
    },
    {
      $addFields: {
        'total_deduction': {
          $sum: "$deductions.total_deduction"
        },
      }
    }
  ]);

  const [querySetting, lenderLinkCompany] = await Promise.all([querySettingPromise, lenderLinkCompanyPromise]);

  if (lenderLinkCompany[0]?.lenders?.length > 0) {
    if (lenderLinkCompany[0].lenders[0].test_receivables_account_number) {
      const testNumberPromise = CommonController.decryptionKeyClient(querySetting.encryption_key, lenderLinkCompany[0].lenders[0].test_receivables_account_number);
      const testBsbPromise = CommonController.decryptionKeyClient(querySetting.encryption_key, lenderLinkCompany[0].lenders[0].test_receivables_account_bsb);
      const [testNumber, testBsb] = await Promise.all([testNumberPromise, testBsbPromise]);
      lenderLinkCompany[0].lenders[0].test_receivables_account_number = testNumber;
      lenderLinkCompany[0].lenders[0].test_receivables_account_bsb = testBsb;
    }
    if (lenderLinkCompany[0].lenders[0].live_receivables_account_number) {
      const liveNumberPromise = await CommonController.decryptionKeyClient(querySetting.encryption_key, lenderLinkCompany[0].lenders[0].live_receivables_account_number);
      const liveBsbPromise = await CommonController.decryptionKeyClient(querySetting.encryption_key, lenderLinkCompany[0].lenders[0].live_receivables_account_bsb);
      const [liveNumber, liveBsb] = await Promise.all([liveNumberPromise, liveBsbPromise]);
      lenderLinkCompany[0].lenders[0].live_receivables_account_number = liveNumber;
      lenderLinkCompany[0].lenders[0].live_receivables_account_bsb = liveBsb;
    }
  }
  if (lenderLinkCompany[0]) {
    return res.status(200).json({
      success: true,
      code: 200,
      result: [{
        ...lenderLinkCompany[0].lenders[0],
        total_amount: lenderLinkCompany[0].total_amount,
        total_deduction: lenderLinkCompany[0].total_deduction
      }]
    });
  } else {
    return res.status(200).json({
      success: true,
      code: 200,
      result: []
    });
  }
}

exports.getAllmWallet = async (req, res) => {
  const setting = await SettingModel.findOne();
  let where;
  let {
    searchKey,
    is_supper_lender
  } = req.body;
  if (is_supper_lender == 'true') {
    where = {
      "is_supper_lender": true
    }
  } else {
    where = {
      $and: [{
          $or: [{
              "lender_name": new RegExp(searchKey, 'i')
            },
            {
              "funding_type": new RegExp(searchKey, 'i')
            }
          ]
        },
        {
          $or: [{
              "is_supper_lender": false
            },
            {
              "is_supper_lender": null
            }
          ]
        }
      ]
    }
  }
  let lenders = await LenderModel.aggregate([{
      $match: where
    },
    {
      $lookup: {
        from: "lenders",
        localField: "parent_id",
        foreignField: "_id",
        as: "lender_parent"
      }
    },
    {
      $lookup: {
        from: "lender_financials",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                    $eq: ["$lender_id", "$$lender_id"]
                  },
                  {
                    $eq: ["$type", 'CAPITAL_LOAN']
                  }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "monoova_transactions",
              "let": {
                "monoova_transaction_id": "$monoova_transaction_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$_id", "$$monoova_transaction_id"]
                      },
                      {
                        "$eq": ["$is_monoova_live_mode", false]
                      }
                    ]
                  }
                }
              }],
              as: 'monoova_transaction'
            }
          },
          {
            $unwind: "$monoova_transaction"
          }
        ],
        as: 'test_lender_finacials'
      }
    },
    {
      $lookup: {
        from: "lender_financials",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                    $eq: ["$lender_id", "$$lender_id"]
                  },
                  {
                    $eq: ["$type", 'CAPITAL_LOAN']
                  }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "monoova_transactions",
              "let": {
                "monoova_transaction_id": "$monoova_transaction_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$_id", "$$monoova_transaction_id"]
                      },
                      {
                        "$eq": ["$is_monoova_live_mode", true]
                      }
                    ]
                  }
                }
              }],
              as: 'monoova_transaction'
            }
          },
          {
            $unwind: "$monoova_transaction"
          }
        ],
        as: 'live_lender_finacials'
      }
    },
    {
      $lookup: {
        from: "lender_link_companies",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
          $match: {
            $expr: {
              $and: [{
                  $eq: ["$lender_id", "$$lender_id"]
                },
                {
                  $eq: ["$is_active", true]
                }
              ]
            }
          }
        }, ],
        as: 'lender_link_companies'
      }
    },
    {
      $lookup: {
        from: "companies",
        localField: "lender_link_companies.company_id",
        foreignField: "_id",
        as: "companies"
      }
    },
    {
      $lookup: {
        from: "deductions",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                  $eq: ["$lender_id", "$$lender_id"]
                }]
              }
            }
          },
          {
            $lookup: {
              from: "pay_deductions",
              "let": {
                "deduction_id": "$_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$deduction_id", "$$deduction_id"]
                      },
                      {
                        "$eq": ["$is_monoova_live_mode", false]
                      }
                    ]
                  }
                }
              }],
              as: 'pay_deduction'
            }
          },
          {
            $unwind: "$pay_deduction"
          }
        ],
        as: 'test_deductions'
      }
    },
    {
      $lookup: {
        from: "deductions",
        let: {
          "lender_id": "$_id"
        },
        pipeline: [{
            $match: {
              $expr: {
                $and: [{
                  $eq: ["$lender_id", "$$lender_id"]
                }]
              }
            }
          },
          {
            $lookup: {
              from: "pay_deductions",
              "let": {
                "deduction_id": "$_id"
              },
              "pipeline": [{
                $match: {
                  "$expr": {
                    "$and": [{
                        "$eq": ["$deduction_id", "$$deduction_id"]
                      },
                      {
                        "$eq": ["$is_monoova_live_mode", true]
                      }
                    ]
                  }
                }
              }],
              as: 'pay_deduction'
            }
          },
          {
            $unwind: "$pay_deduction"
          }
        ],
        as: 'live_deductions'
      }
    },
    {
      $addFields: {
        'total_amount_test': {
          $sum: "$test_lender_finacials.amount"
        },
      }
    },
    {
      $addFields: {
        'total_amount_live': {
          $sum: "$live_lender_finacials.amount"
        },
      }
    },
    {
      $addFields: {
        'total_deduction_test': {
          $sum: "$test_deductions.total_deduction"
        },
      }
    },
    {
      $addFields: {
        'total_deduction_live': {
          $sum: "$live_deductions.total_deduction"
        },
      }
    },
    {
      $skip: +req.body.page * +req.body.pageSize
    },
    {
      $limit: +req.body.pageSize
    }
  ]);
  let totalItems = await LenderModel.countDocuments(where);
  let result = await decryptionLender(lenders, setting);
  return res.json({
    success: true,
    result,
    totalItems: totalItems,
    message: null,
    code: 200,
    errorCode: null
  });
}

exports.addmWallet = async (req, res) => {
  let lender = await LenderModel.findById(req.params.id);
  let result;
  if (lender) {
    if (lender.live_account_number && lender.live_account_number != 'null') {
      result = await createWallet(req.body.key, ":@api.mpay.com.au", lender.live_api_key, lender.live_account_number, lender.lender_name, 'LIVE', req.params.id);
    }
    if (lender.test_account_number && lender.test_account_number != 'null') {
      result = await createWallet(req.body.key, ":@api.m-pay.com.au", lender.test_api_key, lender.test_account_number, lender.lender_name, 'TEST', req.params.id);
    }
    return res.status(200).send(result);
  } else {
    return res.status(400).send({
      success: false,
      messages: "Lender not found."
    });
  }
}

exports.paymentOnmWallet = async (req, res) => {
  let lender = await LenderModel.findById(req.params.id);
  let params;
  let modeBalance;
  if (lender) {
    if (req.body.mode == "TEST" && lender.wallet_test_identifier) {
      params = {link: ":@api.m-pay.com.au", accountNumber: lender.wallet_test_account_number, amount: req.body.amount, key: req.body.key, api_key: lender.test_api_key};
      modeBalance = "wallet_test_balance";
    }
    if (req.body.mode == "LIVE" && lender.wallet_live_identifier) {
      params = {link: ":@api.m-pay.com.au", accountNumber: lender.wallet_live_account_number, amount: req.body.amount, key: req.body.key, api_key: lender.live_api_key};
      modeBalance = "wallet_live_balance";
    }
    if (params) {
      const response = await paymentMWallet(params);
      if (response.success) {
        const responseBody = await getBalance(response.link, params.accountNumber);
        if (responseBody.success) {
          await LenderModel.findByIdAndUpdate(req.params.id, {[modeBalance]: responseBody.result.financials.actualBalance});
          return res.status(200).send({success: true, messages: "Deposit to mWallet successfully."});
        } else {
          return res.status(200).send(responseBody);
        }
      }
    } else {
      return res.status(200).send({
        success: false,
        messages: "Lender mode not found."
      });
    }
  } else {
    return res.status(200).send({
      success: false,
      messages: "Lender not found."
    });
  }
}

async function createWallet(key, link, data, account_number, lender_name, mode, idLender) {
  let api_key = await CommonController.decryption(key, data);
  var options = {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      "identifier": `${account_number}@cashd.com.au`,
      "pin": "2710",
      "name": lender_name,
      "nickName": lender_name,
      "email": `${account_number}@cashd.com.au`,
      "dateOfBirth": moment("1954-10-27").format("YYYY-MM-DDThh:mm:ss"),
      "accountNumber": `${account_number}`
    })
  };
  try {
    const response = await asyncRequest(`https://${api_key + link}/mWallet/v1/create`, options);
    const body = JSON.parse(response.body);
    let result;
    if (body.status == "Ok") {
      result = await updateMWallet({
        actualBalance: body.mWallet.financials.actualBalance,
        identifier: body.mWallet.authenticationEmail,
        lender_name: body.mWallet.name,
        accountNumber: body.mWallet.accountNumber,
        id: idLender,
        mode: mode
      });
    } else if (body.status == "TokenAlreadyRegistered") {
      result = await searchWallet(account_number, api_key + link, idLender, mode);
    } else {
      result = {messages: body.statusDescription, success: false};
    }
    return result; 
  } catch (error) {
    console.error(error);
    return {success: false, messages: "Can't connect to server. Try again!"};
  }
}

async function searchWallet(accountNumber, link, idLender, mode) {
  try {
    const response = await asyncRequest(`https://${link}/mWallet/v1/search?identifier=${accountNumber}@cashd.com.au`);
    const body = JSON.parse(response.body);
    if (body.status == "Ok") {
      return await updateMWallet({
        actualBalance: body.mWallets[0].financials.actualBalance,
        identifier: body.mWallets[0].authenticationEmail,
        lender_name: body.mWallets[0].name,
        accountNumber: body.mWallets[0].accountNumber,
        id: idLender,
        mode: mode
      });
    } else {
      return {success: false, messages: body.statusDescription};
    }
  } catch (error) {
    console.error(error);
    return {success: false, messages: "Can't connect to server. Try again!"};
  }
}

async function updateMWallet(values) {
  let params;
  if (values.mode == "TEST") {
    params = {
      wallet_test_identifier: values.identifier,
      wallet_test_name: values.lender_name,
      wallet_test_account_number: values.accountNumber,
      wallet_test_balance: values.actualBalance
    };
  } else {
    params = {
      wallet_test_identifier: values.identifier,
      wallet_test_name: values.lender_name,
      wallet_test_account_number: values.accountNumber,
      wallet_test_balance: values.actualBalance
    };
  }
  const lender = await LenderModel.findByIdAndUpdate(values.id, {...params, wallet_created_date: new Date()});
  if (lender) {
    return {success: true, messages: "Create mWallet successfully."};
  } else {
    return {success: true, messages: "Create mWallet failed."};
  }
}

async function paymentMWallet(params) {
  let api_key = await CommonController.decryption(params.key, params.api_key);
  const options = {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      "disbursements": [
        {
          "disbursementMethod": "mWallet",
          "toMWallet": params.accountNumber,
          "amount": `${params.amount}`
        }
      ]
    })
  };
  const response = await asyncRequest(`https://${api_key + params.link}/financial/v2/transaction/execute`, options);
  const body = JSON.parse(response.body);
  if (body.status == "Ok") {
    return {success: true, link: api_key + params.link};
  } else {
    return {success: false, messages: body.statusDescription};
  }
}

async function  getBalance(link, accountNumber) {
  const response = await asyncRequest(`https://${link}/mWallet/v1/financials/${accountNumber}/2710`);
  const body = JSON.parse(response.body);
  if (body.status == "Ok") {
    return {success: true, result: body};
  } else {
    return {success: false, messages: body.statusDescription};
  }
}

function decryptApiKey(data, key) {
  // decrypt api key
  var bytes = CryptoJS.AES.decrypt(data, key);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}