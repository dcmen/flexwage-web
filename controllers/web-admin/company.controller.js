const mongoose = require("mongoose");
const request = require("request");
const requestPromise = require("request-promise");
const Excel = require("exceljs");
const CompanyModel = require("../../models/company");
const SystemModel = require("../../models/system");
const StaffModel = require("../../models/staff");
const PayPeriod = require("../../models/pay_period");
const System = require("../../models/system");
const Timesheet = require("../../models/timesheet");
const CompanyBrandModel = require("../../models/company_brand");
const PayPeriodOriginationModel = require("../../models/pay_period_origination");
const KeypayDeductionCategoryModel = require("../../models/keypay/keypay_deduction_category");
const KeypayPayrollScheduleModel = require("../../models/keypay/keypay_pay_schedule");
const UnregisteredStaffModel = require("../../models/keypay/unregistered_staff");
const XeroDeductionCategoryModel = require("../../models/xero/xero_deduction_type");
const XeroPayrollCalendarModel = require("../../models/xero/xero_payroll_calendar");
const XeroTaxModel = require("../../models/xero/xero_tax_account");
const XeroAccountTypeModel = require("../../models/xero/xero_account_type");
const XeroAccountModel = require("../../models/xero/xero_account");
const BankInfoModel = require("../../models/bank_infor");
const CommontController = require("../web-admin/commonController");
const SettingModel = require("../../models/setting");
const LenderModel = require("../../models/lender");
const LenderLinkCompanyModel = require("../../models/lender_link_company");
const LenderFinancialModel = require("../../models/web-admin/lender_financial");
const CycleModel = require("../../models/cycle");
const DeductionModel = require("../../models/deduction");
const PayDeductionModel = require("../../models/pay_deduction");
const DeductionFilePeriodModel = require("../../models/deduction_file_period");
const DeductionFileStaffModel = require("../../models/deduction_file_staff");
const PayCalculateModel = require("../../models/pay_calculate");
const moment = require("moment");
var querystring = require("querystring");
const { forEach, result, rest, toLength } = require("lodash");
const localhost = require("../../config/http");
const config = require("../../config/config");
const urlDeputy = `https://once.deputy.com/my/oauth/login?client_id=${config.DEPUTY_CLIENT_ID}&redirect_uri=${config.DEPUTY_REDIRECT_URL}&response_type=code&scope=longlife_refresh_token`;
const urlKeyPay = `https://api.yourpayroll.com.au/oauth/authorise?client_id=${(config.KEYPAY_CLIENT_ID).trim()}&response_type=code&redirect_uri=${config.KEYPAY_REDIRECT_URL}`;
const urlXero = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${config.XERO_CLIENT_ID}&redirect_uri=${config.XERO_REDIRECT_URL}&scope=offline_access openid profile email accounting.settings accounting.transactions payroll.employees payroll.payruns payroll.payslip payroll.timesheets payroll.settings&state=shapeeclound`;
const urlReckon = `https://identity.reckon.com/connect/authorize?client_id=${config.RECKON_CLIENT_ID}&response_type=code&scope=openid+read+write+offline_access&redirect_uri=${config.RECKON_REDIRECT_URL}&state=random_state&nonce=random_nonce`;
const urlSystem = {
  urlDeputy,
  urlKeyPay,
  urlXero,
  urlReckon,
};
const { socket, socketHttp } = require("../web-admin/socket");
const CURRENT_ENV = process.env.TYPE.toLowerCase();
const API_URL = `https://${CURRENT_ENV === "prod" ? '' : CURRENT_ENV + '.'}web.cashd.com.au`;
const baseService = require("../../service/baseService");

exports.getCompany = async (req, res) => {
  var companiesJson = await getCompanies(req.session.token, 0, 2,"","","","COMPANY_NAME",1,"",req);
  let companies = [];
  let payrolls = [];
  let groups = [];
  if (companiesJson) {
    let responsive = JSON.parse(companiesJson);
    if (responsive.success) {
      companies = responsive?.result?.companies;
      payrolls = responsive?.result?.systems;
      groups = responsive?.result?.groups;
      if (req.session.role !== "Admin") {
        req.session.companyIds = responsive?.result?.company_ids;
      }
    } else {
      return res.redirect('/');
    }
  }
  var now = Date.now();
  var result = res.render("company/table-company", {
    cache: true,
    title: "Company Management",
    pageName: "company-management",
    csrfToken: req.csrfToken(),
    payrolls: payrolls,
    groups: groups,
    isFirstLogin: req.session.is_first_login
  });
  return result;
};

exports.getDataCompany = async (req, res) => {
  let sortColum = req.body["order[0][column]"];
  let value = req.body["order[0][dir]"] == "asc" ? 1 : -1;
  const nameFiled = [
    "GROUP",
    "COMPANY_NAME",
    "SYSTEM",
    "CONNECTION",
    "ADDRESS",
    "ABN",
    "EMAIL_COMPANY",
    "PHONE_COMPANY"
  ];

  let group_id = "", system_id = "", is_connected = "", sort_style = nameFiled[sortColum - 1] , sort_value = value;

  if (req.body.groupId != '0') {
    group_id = req.body.groupId;
  }

  if (req.body.payroll != '0') {
    system_id = req.body.payroll;
  }

  if (req.body.connection != '0') {
    let isTrue = req.body.connection === 'true' ? true : false
    if (!isTrue) {
      is_connected = true;
    } else {
      is_connected = false;
    }
  }

  var resJson = await getCompanies(req.session.token, +req.body.page, +req.body.pageSize, group_id, system_id, is_connected, sort_style, sort_value, req.body.companyName, req);
  let result = (JSON.parse(resJson)).result;
  return res.send(
    JSON.stringify({
      result: result.companies,
      recordsTotal: result.companyCount,
      recordsFiltered: result.companyCount,
    })
  );
};

exports.changeStatus = async (req, res) => {
  const companyId = req.params.id,
    status = req.body.status;
  await CompanyModel.findOneAndUpdate(
    { _id: companyId },
    { is_active: status }
  );
  return res.send({ success: true, result: null, code: 200 });
};

exports.getEditCompany = (req, res) => {
  let idCompany = req.params.id;
  CompanyModel.findById({ _id: idCompany, is_active: 0 })
    .then((data) => {
      res.render("company/edit-company", {
        title: "Edit Company",
        company: data,
        pageName: "company-management",
        csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditCompany = (req, res) => {
  let idCompany = req.params.id;
  CompanyModel.findOneAndUpdate({ _id: idCompany, is_active: 0 }, req.body, {
    upset: false,
  })
    .then((data) => res.redirect("/admin/company-management"))
    .catch((err) => console.log(err));
};

exports.updateLenderInCompany = async (req, res) => {
  let companyId = req.params.id,
    lenderId = req.params.lender_id;
  if (req.body.actionText == "add") {
    await CompanyModel.findOneAndUpdate(
      { _id: companyId },
      { lender_id: lenderId }
    );
  } else {
    await CompanyModel.update({ _id: companyId }, { $unset: { lender_id: 1 } });
  }
  return res.send();
};

exports.deActive = (req, res) => {
  const idCompany = req.params.id;
  CompanyModel.findOne({ _id: idCompany })
    .then((company) => {
      company.is_active = 1;
      company.save();
      res.redirect("/admin/company-management");
    })
    .catch((err) => console.log(err));
};

exports.getWatchCompany = async (req, res) => {
  let messages = req.flash("error");
  if (messages.length > 0) {
    messages = messages[0];
  } else {
    messages = null;
  }
  const idCompany = (req.session.company_id = req.params.id);
  let isEmployer = false, tokenPayroll = {accessToken: null, endPointUrl: null};
  let deductionCategory = [];
  const result = await getCompany(idCompany);

  const systemId = result.system_id;
  const is_monoova_live_mode = result.is_monoova_live_mode
    ? result.is_monoova_live_mode
    : false;
  //get lender link company
  const lenderLinkCompanyPromise = LenderLinkCompanyModel.aggregate([
    {
      $match: {
        $and: [
          { company_id: mongoose.Types.ObjectId(idCompany) },
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
    {
      $lookup: {
        from: "lender_financials",
        let: {
          lender_id: "$lender_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$lender_id", "$$lender_id"],
                  },
                  {
                    $eq: ["$type", "CAPITAL_LOAN"],
                  },
                ],
              },
            },
          },
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
                        {
                          $eq: ["$is_monoova_live_mode", is_monoova_live_mode],
                        },
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
        ],
        as: "lender_finacials",
      },
    },
    {
      $lookup: {
        from: "deductions",
        let: {
          lender_id: "$lender_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$lender_id", "$$lender_id"],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "pay_deductions",
              let: {
                deduction_id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$deduction_id", "$$deduction_id"],
                        },
                        {
                          $eq: ["$is_monoova_live_mode", is_monoova_live_mode],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "pay_deduction",
            },
          },
          {
            $unwind: "$pay_deduction",
          },
        ],
        as: "deductions",
      },
    },
    {
      $addFields: {
        total_amount: { $sum: "$lender_finacials.amount" },
      },
    },
    {
      $addFields: {
        total_deduction: { $sum: "$deductions.total_deduction" },
      },
    },
  ]);
  //get system by systemID
  const resultSystemPromise = System.findById({ _id: systemId });
  const staffPromise = StaffModel.findOne({company_id: idCompany, user_id: req.session.user._id});

  const [lenderLinkCompany, resultSystem, staff] = await Promise.all([lenderLinkCompanyPromise, resultSystemPromise, staffPromise]);

  if (idCompany && staff) {
    if (staff.is_allow_login_other_system === 1) {
      isEmployer = true;
      req.session.staff_id = staff._id;
    }
    //get access token payroll
    const url = `/api/users/getPayrollAccessToken?staff_id=${staff._id}`
    const response = await baseService.getInstance().get(url, req.session.token, req);
    if (response) {
      var body = JSON.parse(response.body);
      if (body?.result?.access_token != null) {
        tokenPayroll.accessToken = body.result.access_token;
        if (resultSystem.code === "DEPUTY" && body.result.end_point_url) {
          tokenPayroll.endPointUrl = body.result.end_point_url;
        }
      }
    }
  }
  if (resultSystem.code == "KEYPAY") {
    //get KeypayDeductionCategory
    deductionCategory = KeypayDeductionCategoryModel.find({
      company_id: idCompany,
    });
  } else if (resultSystem.code == "XERO" || resultSystem.code == "RECKON") {
    //get XERODeductionType
    deductionCategory = XeroDeductionCategoryModel.aggregate([
      { $match: { company_id: mongoose.Types.ObjectId(idCompany) } },
      { $sort: { Name: 1 } },
    ]);
  }
  //get cycles
  const cycles = CycleModel.find().sort({ position: 1 });
  //get company brand
  const companyBrand = CompanyBrandModel.find({ company_id: idCompany });
  //get total registered
  const totalRegisterdStaffs = StaffModel.aggregate([
    { $match: { company_id: mongoose.Types.ObjectId(idCompany) } },
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
  //get total unregistered
  const totalUnregisteredStaffs = UnregisteredStaffModel.count({
    company_id: mongoose.Types.ObjectId(idCompany),
  });
  //get total invitation sent
  const totalInvitationStaff = UnregisteredStaffModel.aggregate([
    {
      $match: {
        $and: [
          {
            company_id: mongoose.Types.ObjectId(idCompany),
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
  //get all xero tax
  const queryAllXeroTax = XeroTaxModel.find({});
  //get all xero account type
  const queryAllXeroAccountType = XeroAccountTypeModel.find({});
  //get list account
  const queryAllAccounts = XeroAccountModel.aggregate([
    { $match: { company_id: mongoose.Types.ObjectId(idCompany) } },
    { $sort: { Code: 1 } },
  ]);
  //get bank info
  const queryBankInfo = BankInfoModel.aggregate([
    {
      $match: {
        $and: [
          { _id: mongoose.Types.ObjectId(result.bank_account_id) },
          { is_cashd_admin: 0 },
        ],
      },
    },
  ]);
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
          { company_id: idCompany },
          { lender_id: lenderLinkCompany[0]?.lender_id },
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

  //get setting
  const querySettingPromise = SettingModel.findOne();

  //banks 
  const banksPromise = BankInfoModel.find({company_id: idCompany, is_cashd_admin: 0 });

  const directDebitFormPromise = baseService.getInstance().get(`/api/users/getFormDirectDebit/${idCompany}`, req.session.token, req);

  const [
    resultDeductionCategory,
    resultCycles,
    resultCompanyBrand,
    checkTotalRegistered,
    totalUnregistered,
    checkTotalInvitation,
    xeroTaxs,
    xeroAccountTypes,
    xeroAccounts,
    bankInfo,
    totalAmountLenderFinancial,
    totalDebitReconcile,
    querySetting,
    banks,
    directDebitForm
  ] = await Promise.all([
    deductionCategory,
    cycles,
    companyBrand,
    totalRegisterdStaffs,
    totalUnregisteredStaffs,
    totalInvitationStaff,
    queryAllXeroTax,
    queryAllXeroAccountType,
    queryAllAccounts,
    queryBankInfo,
    queryTotalAmountLenderFinancial,
    queryTotalDebitReconcile,
    querySettingPromise,
    banksPromise,
    directDebitFormPromise
  ]);
  let totalRegistered, totalInvitation;
  //check totalRegistered
  if (checkTotalRegistered.length > 0) {
    totalRegistered = checkTotalRegistered[0].count;
  } else {
    totalRegistered = 0;
  }
  // check totalInvitation
  if (checkTotalInvitation.length > 0) {
    totalInvitation = checkTotalInvitation[0].count;
  } else {
    totalInvitation = 0;
  }
  //
  if (bankInfo.length > 0) {
    if (bankInfo[0].bank_bsb_number_encryption) {
      bankInfo[0].bank_bsb_number_encryption =
        await CommontController.decryptionKeyClient(
          querySetting.encryption_key,
          bankInfo[0].bank_bsb_number_encryption
        );
    }
    if (bankInfo && bankInfo[0].bank_account_number_encryption) {
      bankInfo[0].bank_account_number_encryption =
        await CommontController.decryptionKeyClient(
          querySetting.encryption_key,
          bankInfo[0].bank_account_number_encryption
        );
    }
  }

  if (banks.length > 0) {
    for(let i = 0; i < banks.length; i++) {
      if (banks[i].bank_bsb_number_encryption) {
        banks[i]._doc.bank_bsb_number_encryption =
          await CommontController.decryptionKeyClient(
            querySetting.encryption_key,
            banks[i].bank_bsb_number_encryption
          );
      }
      if (banks[i].bank_account_number_encryption) {
        banks[i]._doc.bank_account_number_encryption =
          await CommontController.decryptionKeyClient(
            querySetting.encryption_key,
            banks[i].bank_account_number_encryption
          );
      }
    }
  }

  if (lenderLinkCompany[0]?.lenders?.length > 0) {
    if (lenderLinkCompany[0].lenders[0].test_receivables_account_number) {
       let testReceivablesNumberPromise =
        CommontController.decryptionKeyClient(
          querySetting.encryption_key,
          lenderLinkCompany[0].lenders[0].test_receivables_account_number
        );
        let testReceivablesBsbPromise =
        CommontController.decryptionKeyClient(
          querySetting.encryption_key,
          lenderLinkCompany[0].lenders[0].test_receivables_account_bsb
        );
        const [test_receivables_account_number, test_receivables_account_bsb] = await Promise.all([testReceivablesNumberPromise, testReceivablesBsbPromise]);
        lenderLinkCompany[0].lenders[0].test_receivables_account_number = test_receivables_account_number;
        lenderLinkCompany[0].lenders[0].test_receivables_account_bsb = test_receivables_account_bsb;
    }
    if (lenderLinkCompany[0].lenders[0].live_receivables_account_number) {
        let liveReceivablesNumberPromise =
        CommontController.decryptionKeyClient(
          querySetting.encryption_key,
          lenderLinkCompany[0].lenders[0].live_receivables_account_number
        );
        let liveReceivablesBsbPromise =
        CommontController.decryptionKeyClient(
          querySetting.encryption_key,
          lenderLinkCompany[0].lenders[0].live_receivables_account_bsb
        );
        const [live_receivables_account_number, live_receivables_account_bsb] = await Promise.all([liveReceivablesNumberPromise, liveReceivablesBsbPromise]);
        lenderLinkCompany[0].lenders[0].live_receivables_account_number = live_receivables_account_number;
        lenderLinkCompany[0].lenders[0].live_receivables_account_bsb = live_receivables_account_bsb;
    }
  }

  let directDebitFormResult = JSON.parse(directDebitForm.body);
  if (directDebitFormResult?.result) {
    directDebitFormResult.result.account_number = await CommontController.decryptionKeyClient(
      querySetting.encryption_key,
      directDebitFormResult.result.account_number
    );
    directDebitFormResult.result.bsb = await CommontController.decryptionKeyClient(
      querySetting.encryption_key,
      directDebitFormResult.result.bsb
    );
  }

  //render data
  return req.session.save((err) => {
    if (err) console.log(err);
    res.render("company/watch-company", {
      title: "Watch Company",
      company: result,
      companyJSON: JSON.stringify(result),
      moment,
      urlApi: API_URL,
      system: resultSystem,
      urlSystem: urlSystem,
      role: req.session.role,
      cycles: resultCycles,
      deductionCate: resultDeductionCategory,
      companyBrands: resultCompanyBrand,
      totalRegistered: totalRegistered,
      totalUnregistered: totalUnregistered,
      totalInvitation: totalInvitation,
      pageName: "company-management",
      csrfToken: req.csrfToken(),
      errorMessage: messages,
      stringUrl: localhost.API_HTTPS + "/api/timesheets/createABAForDeduction",
      xeroAccountTypes: xeroAccountTypes,
      xeroTaxs: xeroTaxs,
      xeroAccounts: xeroAccounts,
      bankInfo: bankInfo[0],
      lenderLinkCompany,
      key: querySetting.encryption_key,
      totalAmountLenderFinancial,
      totalDebitReconcile,
      company_id: idCompany,
      timezoneServer: Math.abs(new Date().getTimezoneOffset()) * 60 * 1000,
      banks: banks,
      isEmployer,
      tokenPayroll,
      directDebitForm: directDebitFormResult.result
    });
  });
};

exports.getWatchCompanyV1 = async (req, res) => {
  let messages = req.flash("error");
  if (messages.length > 0) {
    messages = messages[0];
  } else {
    messages = null;
  }
  const idCompany = (req.session.company_id = req.params.id);

  const companiesPromise = CompanyModel.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(idCompany) },
    }
  ]);

  const directDebitFormPromise = baseService.getInstance().get(`/api/users/getFormDirectDebit/${idCompany}`, req.session.token, req);

  const lenderLinkCompanyPromise = LenderLinkCompanyModel.aggregate([
      {
        $match: {
          $and: [
            { company_id: mongoose.Types.ObjectId(idCompany) },
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
      }
  ]);

    //get setting
    const querySettingPromise = SettingModel.findOne();

    //get all xero tax
    const queryAllXeroTax = XeroTaxModel.find({});
    //get all xero account type
    const queryAllXeroAccountType = XeroAccountTypeModel.find({});

    const [
      lenderLinkCompany, 
      directDebitForm, 
      setting, 
      companies, 
      xeroTaxs, 
      xeroAccountTypes
    ] = await Promise.all([
      lenderLinkCompanyPromise, 
      directDebitFormPromise, 
      querySettingPromise, 
      companiesPromise, 
      queryAllXeroTax, 
      queryAllXeroAccountType
    ]);

    //setup
    const systemId = companies[0].system_id;

  const resultSystemPromise = System.findById({ _id: systemId });

  //banks 
  const banksPromise = BankInfoModel.find({company_id: idCompany, is_cashd_admin: 0 });
  //get bank info
  const bankInfoPromise = BankInfoModel.aggregate([
      {
        $match: {
          $and: [
            { _id: mongoose.Types.ObjectId(companies[0].bank_account_id) },
            { is_cashd_admin: 0 },
          ],
        },
      },
  ]);

  const [
    resultSystem,
    banks,
    bankInfo
  ] = await Promise.all([
    resultSystemPromise,
    banksPromise,
    bankInfoPromise
  ]);

  return req.session.save((err) => {
    if (err) console.log(err);
    res.render("company/watch-company-v1", {
      title: "Watch Company",
      pageName: "company-management",
      csrfToken: req.csrfToken(),
      errorMessage: messages,
      stringUrl: localhost.API_HTTPS + "/api/timesheets/createABAForDeduction",
      company: companies[0],
      system: resultSystem,
      companyJSON: JSON.stringify(companies[0]),
      moment,
      urlApi: API_URL,
      urlSystem: urlSystem,
      role: req.session.role,
      isEmployer: false,
      company_id: idCompany,
      timezoneServer: Math.abs(new Date().getTimezoneOffset()) * 60 * 1000,
      cycles: [],
      deductionCate: [],
      companyBrands: [],
      totalRegistered: 0,
      totalUnregistered: 0,
      totalInvitation: 0,
      xeroAccountTypes: xeroAccountTypes,
      xeroTaxs: xeroTaxs,
      xeroAccounts: [],
      bankInfo: bankInfo[0],
      lenderLinkCompany: lenderLinkCompany,
      key: setting.encryption_key,
      totalAmountLenderFinancial: 0,
      totalDebitReconcile: 0,
      banks: banks,
      tokenPayroll: "",
      directDebitForm: directDebitForm.result
    });
  });
}

exports.getAllTotalsCompany = async (req, res) => {
  const {companyId} = req.body;
  // get staffs
  const staffsPromise = StaffModel.find({company_id: mongoose.Types.ObjectId(companyId), is_active: 1});

  // get PayPeriod
  const date = Date.now();
  const today = new Date(date);
  const payProdsPromise = PayPeriod.aggregate([
    {
      $match: {
        company_id: new mongoose.Types.ObjectId(companyId),
        start_date: { $lte: today },
        end_date: { $gte: today },
      },
    },
    {
      $lookup: {
        from: "pay_calculates",
        let: { pay_period_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$pay_period_id", "$$pay_period_id"],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "staffs",
              let: { staff_id: "$staff_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$staff_id"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "staff",
            },
          },
          { $unwind: "$staff" },
          {
            $lookup: {
              from: "pay_deductions",
              let: {
                pay_period_id: "$pay_period_id",
                staff_id: "$staff_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$pay_period_id", "$$pay_period_id"],
                        },
                        {
                          $eq: ["$staff_id", "$$staff_id"],
                        },
                      ],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "deductions",
                    let: { deduction_id: "$deduction_id" },
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
                    ],
                    as: "deduction",
                  },
                },
                { $unwind: "$deduction" },
              ],
              as: "pay_deductions",
            },
          },
        ],
        as: "pay_calculates",
      },
    },
    { $unwind: "$pay_calculates" },
  ]);

  const [
    staffs,
    payProds
  ] = await Promise.all([
    staffsPromise,
    payProdsPromise
  ]);

  let sumPayPeriod = 0;
  if (payProds.length > 0) {
    for (let index = 0; index < payProds.length; index++) {
      const element = payProds[index];
      let sumTotalDeduction = 0;
      if (
        element.pay_calculates != null &&
        element.pay_calculates.pay_deductions.length > 0
      ) {
        element.pay_calculates.pay_deductions.forEach((param) => {
          sumTotalDeduction =
            sumTotalDeduction + param.deduction.total_deduction;
        });
      }
      sumPayPeriod = sumPayPeriod + sumTotalDeduction;
    }
  }

  return res.send({
    totalActiveEmployees: staffs.length,
    totalDrawnPeriod: convertNumber(sumPayPeriod),
  });

}

exports.getWatchStaff = async (req, res) => {
  let bankInfo;
  //get pay period origination
  const payPeriodOrigination = PayPeriodOriginationModel.find({});
  //get staff
  const staffs = StaffModel.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(req.params.id) },
    },
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
      $lookup: {
        from: "companies",
        localField: "company_id",
        foreignField: "_id",
        as: "company",
      },
    },
    { $unwind: "$company" },
    {
      $lookup: {
        from: "systems",
        localField: "company.system_id",
        foreignField: "_id",
        as: "system",
      },
    },
    { $unwind: "$system" },
  ]);

  const [resultStaff, resultPayPeriodOrigination] = await Promise.all([
    staffs,
    payPeriodOrigination,
  ]);

  const staff = resultStaff[0];

  let checkPayPeriod;
  if (staff.pay_period_origination_id) {
    checkPayPeriod = resultPayPeriodOrigination.some(
      (item) =>
        item._id.toString() == staff.pay_period_origination_id.toString()
    );
  }

  if (staff.system.code == "KEYPAY" 
  || staff.system.code == "XERO" 
  || staff.system.code === "RECKON" 
  || staff.system.code === "ASTUTE" 
  || staff.system.code === "HR3") {
    let bank = await BankInfoModel.findOne({ _id: staff.bank_account_id });
    if (bank) {
      bankInfo = {
        bank_name: bank?.bank_name ? bank?.bank_name : null,
        bank_bsb_number: bank?.bank_bsb_number_encryption
          ? await CommontController.decryptionKeyClient(
              staff.encryption_key,
              bank.bank_bsb_number_encryption
            )
          : null,
        bank_account_name: bank?.bank_account_name
          ? bank?.bank_account_name
          : null,
      };
      if (bank?.bank_account_number_encryption) {
        bankInfo.bank_account_number =
          await CommontController.decryptionKeyClient(
            staff.encryption_key,
            bank.bank_account_number_encryption
          );
      } else {
        bankInfo.bank_account_number = bank?.bank_account_number
          ? bank?.bank_account_number
          : null;
      }
    }
  } else {
    bankInfo = {
      bank_name: staff.bank_name ? staff.bank_name : null,
      bank_bsb_number: staff.bank_bsb_number_encryption
        ? await CommontController.decryptionKeyClient(
            staff.encryption_key,
            staff.bank_bsb_number_encryption
          )
        : null,
      bank_account_name: staff.bank_account_name
        ? staff.bank_account_name
        : null,
    };
    if (staff?.bank_account_number_encryption) {
      bankInfo.bank_account_number =
        await CommontController.decryptionKeyClient(
          staff.encryption_key,
          staff.bank_account_number_encryption
        );
    } else {
      bankInfo.bank_account_number = staff.bank_account_number
        ? staff.bank_account_number
        : null;
    }
  }

  if (staff.system.code === "XERO" || staff.system.code === "RECKON") {
    //Xero pay_calendar_type
    if (staff.xero_pay_calendar_id != null) {
      staff.payroll_system_name = (
        await XeroPayrollCalendarModel.findOne({
          _id: staff.xero_pay_calendar_id,
        })
      ).Name;
    }
  } else if (staff.system.code === "KEYPAY") {
    //KeyPay pay_calendar_type
    if (staff.keypay_pay_schedule_id != null) {
      staff.payroll_system_name = (
        await KeypayPayrollScheduleModel.findOne({
          _id: staff.keypay_pay_schedule_id,
        })
      ).name;
    }
  }

  staff.bank_info = bankInfo;
  if (staff.time_accrue_wages) {
    staff.time_accrue_wages = convertMinuteToStringTime(staff.time_accrue_wages);
  }

  return res.render("company/watch-staff", {
    title: "staff-company",
    csrfToken: req.csrfToken(),
    pageName: "staff-company",
    moment,
    checkPayPeriod: checkPayPeriod,
    staff,
    url: API_URL,
    payPeriodOriginations: resultPayPeriodOrigination,
  });
};

exports.getEditStaff = async (req, res) => {
  let staff = await StaffModel.findById({ _id: req.params.id });
  let companies = await CompanyModel.find();
  res.render("company/edit-staff-company", {
    title: "edit-staff-company",
    csrfToken: req.csrfToken(),
    pageName: "edit-staff-company",
    moment,
    staff,
    companies,
  });
};

exports.postEditStaff = async (req, res) => {};

exports.postLimitCompany = async (req, res) => {
  let id = req.body._id;
  let { limit_number_of_employee } = req.body || -1;
  let { limit_money } = req.body || -1;
  let { limit_allowable_percent_drawdown } = req.body || -1;
  let { transaction_fee } = req.body || -1;
  const { transaction_fee_type } = req.body;
  const { min_withdrawal, threshold_amount, recipients_float_alert } = req.body;
  let company = await CompanyModel.findById({ _id: id });
  const form = {};
  const formStaff = {};
  if (limit_number_of_employee < 0) {
    return res.send({
      status: 202,
      data: {},
      error: "Total # employees invalidate",
    });
  }
  if (limit_money < 0) {
    return res.send({
      status: 202,
      data: {},
      error: "Total $ per company invalidate",
    });
  }
  if (limit_allowable_percent_drawdown < 0) {
    return res.send({
      status: 202,
      data: {},
      error: "Allowable % drawdown invalidate",
    });
  }
  if (transaction_fee < 0) {
    return res.send({
      status: 202,
      data: {},
      error: "Transaction fee invalidate",
    });
  }
  if (company === undefined) {
    return res.send({ status: 202, data: {}, error: "Company not found." });
  }
  if (limit_number_of_employee != company.limit_number_of_employee) {
    form.limit_number_of_employee = limit_number_of_employee;
    let avg = limit_money / limit_number_of_employee;
    const number = convertNumber(avg);
    formStaff.limit_money = number;
  }
  if (limit_money != company.limit_money) {
    form.limit_money = limit_money;
    let avg = limit_money / limit_number_of_employee;
    const number = convertNumber(avg);
    formStaff.limit_money = number;
  }
  if (
    limit_allowable_percent_drawdown != company.limit_allowable_percent_drawdown
  ) {
    form.limit_allowable_percent_drawdown = limit_allowable_percent_drawdown;
    formStaff.limit_allowable_percent_drawdown =
      limit_allowable_percent_drawdown;
  }
  form.transaction_fee_value = transaction_fee;
  form.transaction_fee_type = transaction_fee_type;
  form.min_withdrawal = min_withdrawal;
  formStaff.min_withdrawal = min_withdrawal;
  form.is_financial_setup = true;
  if (threshold_amount) {
    form.threshold_amount = threshold_amount;
  }
  if (recipients_float_alert && JSON.parse(recipients_float_alert)) {
    form.recipients_float_alert = JSON.parse(recipients_float_alert);
  }
  if (Object.keys(formStaff).length > 0) {
    let staffs = await StaffModel.find({ company_id: id });
    staffs.forEach((item) => {
      StaffModel.findOneAndUpdate(
        {
          _id: item._id,
        },
        formStaff,
        { new: true }
      )
        .then()
        .catch((err) => console.log(err));
    });
  }
  if (Object.keys(form).length > 0) {
    await CompanyModel.findOneAndUpdate(
      {
        _id: id,
      },
      form,
      { new: true }
    )
      .then(async (data) => {
        var result = await getCompany(data._id);
        return res.send({ status: 200, data: result, error: null });
      })
      .catch((err) => console.log(err));
  } else {
    var result = await getCompany(id);
    return res.send({ status: 200, data: result, error: null });
  }
};

exports.postLimitStaff = async (req, res) => {
  let id = req.body._id;
  let newObject = {...req.body};
  delete newObject._id;
  delete newObject._csrf;
  await StaffModel.findOneAndUpdate(
    {
      _id: id,
    },
    { ...newObject },
    { new: true }
  )
    .then((data) => {
      return res.send({ status: 200, data: data, error: null }
      )})
    .catch((err) => console.log(err));
};

exports.postMonoovaMode = async (req, res) => {
  let { _id, lenderId } = req.body;
  let is_monoova_live_mode = req.body.is_monoova_live_mode == "true";

  const checkKeyLender = await LenderModel.findById(lenderId);
  if (checkKeyLender) {
    if (!checkKeyLender.is_cashd && checkKeyLender.parent_id) {
      const parentLender = await LenderModel.findById(checkKeyLender.parent_id);
      if (is_monoova_live_mode) {
        if (parentLender?.live_api_key) {
          await updateMonoovaMode(_id, is_monoova_live_mode);
        } else {
          return res.send({
            status: 204,
            success: false,
            lenderLinkCompany: null,
            messages: "Monoova key not found.",
          });
        }
      } else {
        if (parentLender?.test_api_key) {
          await updateMonoovaMode(_id, is_monoova_live_mode);
        } else {
          return res.send({
            status: 204,
            success: false,
            lenderLinkCompany: null,
            messages: "Monoova key not found.",
          });
        }
      }
    } else {
      if (is_monoova_live_mode) {
        if (checkKeyLender.live_api_key) {
          await updateMonoovaMode(_id, is_monoova_live_mode);
        } else {
          return res.send({
            status: 204,
            success: false,
            lenderLinkCompany: null,
            messages: "Monoova key not found.",
          });
        }
      } else {
        if (checkKeyLender.test_api_key) {
          await updateMonoovaMode(_id, is_monoova_live_mode);
        } else {
          return res.send({
            status: 204,
            success: false,
            lenderLinkCompany: null,
            messages: "Monoova key not found.",
          });
        }
      }
    }
  } else {
    return res.send({
      status: 204,
      success: false,
      lenderLinkCompany: null,
      messages: "Lender not found.",
    });
  }
  return res.send({ status: 200, success: true });
};

async function updateMonoovaMode(id, status) {
  await CompanyModel.findByIdAndUpdate(id, {
    is_monoova_live_mode: status,
    is_banking_setup: true,
  });
}

exports.postValidateBank = async (req, res) => {
  let id = req.params.id;
  let is_validate_bank_account = req.body.is_validate_bank_account || false;
  await CompanyModel.update(
    { _id: id },
    {
      $set: {
        is_validate_bank_account: is_validate_bank_account,
      },
    }
  )
    .then((data) => res.send({ status: 200, error: null }))
    .catch((err) => console.log(err));
};

exports.postPaymentVerifyMode = async (req, res) => {
  let id = req.body._id;
  let is_verify_code_by_sms = req.body.is_verify_code_by_sms || false;
  await CompanyModel.update(
    { _id: id },
    {
      $set: {
        is_verify_code_by_sms: is_verify_code_by_sms,
      },
    }
  )
    .then((data) => res.send({ status: 200, error: null }))
    .catch((err) => console.log(err));
};

async function accuredAmount(currentPeriods) {
  //Tính tiền tích lũy, limit
  var startDate = new Date(currentPeriods.start_date);
  var endDate = new Date(currentPeriods.end_date);
  // var diffTime = Math.abs(today.getTime() - startDate.getTime());
  // var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  var totalDaysOfPayroll = 0;
  for (var m = 0; startDate <= endDate; ) {
    if (startDate.getDay() > 0 && startDate.getDay() < 6) totalDaysOfPayroll++;
    startDate.setDate(startDate.getDate() + 1);
  }
  if (
    currentPeriods.hasOwnProperty("currentPayCalculate") &&
    Object.keys(currentPeriods.currentPayCalculate).length > 0
  ) {
    //get timesheet to get number of worked day of this pay period
    var numberOfWorkedday = await Timesheet.countDocuments({
      staff_id: currentPeriods.pay_calculates.staff_id,
      pay_period_id: currentPeriods._id,
    });
    if (
      currentPeriods.currentPayCalculate.hasOwnProperty("total_by_type") &&
      currentPeriods.currentPayCalculate.total_by_type === "SALARY"
    ) {
      return (
        (currentPeriods.currentPayCalculate.total_amount * numberOfWorkedday) /
        totalDaysOfPayroll
      ).toFixed(2);
    } else {
      return (
        currentPeriods.currentPayCalculate.mount_per_day * numberOfWorkedday
      ).toFixed(2);
    }
  } else {
    return 0;
  }
}

async function getCompany(idCompany) {
  let date = Date.now();
  let today = new Date(date);
  let companiesPromise = CompanyModel.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(idCompany) },
    },
    {
      $lookup: {
        from: "staffs",
        localField: "_id",
        foreignField: "company_id",
        as: "staffs",
      },
    },
  ]);
  // get PayPeriod
  let payprodsPromise = PayPeriod.aggregate([
    {
      $match: {
        company_id: new mongoose.Types.ObjectId(idCompany),
        start_date: { $lte: today },
        end_date: { $gte: today },
      },
    },
    {
      $lookup: {
        from: "pay_calculates",
        let: { pay_period_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$pay_period_id", "$$pay_period_id"],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "staffs",
              let: { staff_id: "$staff_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$_id", "$$staff_id"],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "staff",
            },
          },
          { $unwind: "$staff" },
          {
            $lookup: {
              from: "pay_deductions",
              let: {
                pay_period_id: "$pay_period_id",
                staff_id: "$staff_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$pay_period_id", "$$pay_period_id"],
                        },
                        {
                          $eq: ["$staff_id", "$$staff_id"],
                        },
                      ],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "deductions",
                    let: { deduction_id: "$deduction_id" },
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
                    ],
                    as: "deduction",
                  },
                },
                { $unwind: "$deduction" },
              ],
              as: "pay_deductions",
            },
          },
        ],
        as: "pay_calculates",
      },
    },
    { $unwind: "$pay_calculates" },
  ]);

  const [companies, payprods] = await Promise.all([
    companiesPromise,
    payprodsPromise,
  ]);
  var result = companies[0];
  var activeEmployees = 0;
  result.staffs.forEach((element) => {
    if (element.is_active == 1) activeEmployees++;
  });
  result.activeEmployees = activeEmployees;
  var sumPayPeriod = 0;
  var sumAccuredAmount = 0;
  if (payprods.length > 0) {
    payprods.forEach(async (item) => {
      var sumTotalDeduction = 0;
      if (
        item.pay_calculates != null &&
        item.pay_calculates.pay_deductions.length > 0
      ) {
        item.pay_calculates.pay_deductions.forEach((param) => {
          sumTotalDeduction =
            sumTotalDeduction + param.deduction.total_deduction;
        });
      }
      sumPayPeriod = sumPayPeriod + sumTotalDeduction;
      var number = await accuredAmount(item);
      sumAccuredAmount = sumAccuredAmount + number;
    });
  }
  result.total_drawn_period = convertNumber(sumPayPeriod);
  result.accured_amount = sumAccuredAmount;

  if (result.make_repayment_time) {
    result.make_repayment_time = convertMinuteToStringTime(result.make_repayment_time);
  }

  if (result.remind_write_deduction_time) {
    result.remind_write_deduction_time = convertMinuteToStringTime(result.remind_write_deduction_time);
  }

  return result;
}

function convertNumber(number) {
  const arr = number.toString().split(".");
  if (arr) {
    const quotient = arr[0];
    let newStr = null;
    if (arr[1]) {
      const remainder = arr[1].slice(0, 2);
      newStr = quotient + "." + remainder;
    }
    return Number(newStr !== null ? newStr : quotient);
  } else {
    return number;
  }
}

exports.setupPayroll = async (req, res) => {
  let company;
  const companyId = req.body.companyId;
  let body = {
    is_payroll_setup: true,
    deduction_file_method: req.body.deductionFileMethod,
    is_prevent_timesheet_request: req.body.isAllowTimesheetRequest == 'true' ? true : false
  };
  if (req.body.sendMailDate && (req.body.deduction_repayment_type === 'DIRECT_DEBIT_AUTO_PAY' || req.body.deduction_repayment_type === 'DIRECT_DEBIT_BY_APPROVAL')) {
    let array = req.body.sendMailTime.split(':');
    let minute = Number(array[0]) * 60 + Number(array[1]);
    body['remind_write_deduction_date'] = +req.body.sendMailDate;
    body['remind_write_deduction_time'] = minute;
  }

  if (req.body.systemCode == "KEYPAY") {
    company = await CompanyModel.findOneAndUpdate(
      { _id: companyId },
      {
        $set: {
          keypay_deduction_category_id: req.body.salaryAdvance,
          keypay_deduction_category_fee_id: req.body.fee,
          ...body
        },
      },
      { new: true}
    );
  } else if (req.body.systemCode == "XERO" || req.body.systemCode == "RECKON") {
    let form = {
      deduction_type_xero_id: req.body.salaryAdvance,
      deduction_type_xero_fee_id: req.body.fee,
      ...body
    };
    if (req.body.systemCode == "RECKON") {
      form["is_system_approve_process"] = req.body.isSystemApproveProcess == 'true' ? true : false;
    }
    company = await CompanyModel.findOneAndUpdate(
      { _id: companyId },
      {
        $set: form,
      },
      { new: true}
    );
  } else {
    if (req.body.systemCode == "ASTUTE") {
      body.is_system_approve_process = req.body.isSystemApproveProcess == 'true' ? false : true;
    }
    company = await CompanyModel.findOneAndUpdate(
      { _id: companyId },
      {
        $set: {
          is_enterprise: req.body.isEnterprise,
          ...body
        },
      },
      { new: true}
    );
  }

  if (company) {
    company._doc.remind_write_deduction_time = convertMinuteToStringTime(company.remind_write_deduction_time);
    socket.emit("deductionProcessControl", {
      companyId: company._id,
      company,
    });
    socketHttp.emit("deductionProcessControl", {
      companyId: company._id,
      company,
    });
  }
  return res.send({ success: true, result: null });
};

exports.setupBank = async (req, res) => {
  let bankId;
  const companyId = req.body.companyId;
  const queryGetSetting = SettingModel.findOne();
  // const queryGetBankInfo = BankInfoModel.find({
  //   company_id: mongoose.Types.ObjectId(companyId),
  // });
  const [setting] = await Promise.all([queryGetSetting]);
  const bodyBankInfo = JSON.parse(req.body.bodyBankInfo);
  let bank_account_number_encryption = await CommontController.encryption(
    setting.encryption_key,
    bodyBankInfo.bank_account_number
  );
  let bank_bsb_number_encryption = await CommontController.encryption(
    setting.encryption_key,
    bodyBankInfo.bank_bsb_number
  );

  if (bodyBankInfo.id == "0") {
    var bank = await BankInfoModel.create({
      bank_name: bodyBankInfo.bank_name,
      bank_account_name: bodyBankInfo.bank_account_name,
      bank_account_number_encryption: bank_account_number_encryption,
      bank_bsb_number_encryption: bank_bsb_number_encryption,
      bank_user_id: bodyBankInfo.bank_user_id,
      bank_apca_id: bodyBankInfo.bank_apca_id,
      bank_description: bodyBankInfo.bank_description,
      bank_company_name: bodyBankInfo.bank_company_name,
      is_cashd_admin: 0,
      company_id: mongoose.Types.ObjectId(companyId)
    });
    await CompanyModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(companyId)}, {bank_account_id:bank._id});
    bankId = bank._id;
  } else {
    await BankInfoModel.findOneAndUpdate(
      { company_id: companyId, _id:  mongoose.Types.ObjectId(bodyBankInfo.id) },
      {
        $set: {
          bank_name: bodyBankInfo.bank_name,
          bank_user_id: bodyBankInfo.bank_user_id,
          bank_apca_id: bodyBankInfo.bank_apca_id,
          bank_description: bodyBankInfo.bank_description,
          bank_company_name: bodyBankInfo.bank_company_name,
          bank_account_name: bodyBankInfo.bank_account_name,
          bank_account_number_encryption: bank_account_number_encryption,
          bank_bsb_number_encryption: bank_bsb_number_encryption,
        },
      }
    );
    await CompanyModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(companyId)}, {bank_account_id: mongoose.Types.ObjectId(bodyBankInfo.id)});
    bankId = bodyBankInfo.id;
  }

  const banks = await BankInfoModel.find({company_id: companyId, is_cashd_admin: 0 });

  if (banks.length > 0) {
    for(let i = 0; i < banks.length; i++) {
      if (banks[i].bank_bsb_number_encryption) {
        banks[i]._doc.bank_bsb_number_encryption =
          await CommontController.decryptionKeyClient(
            setting.encryption_key,
            banks[i].bank_bsb_number_encryption
          );
      }
      if (banks[i].bank_account_number_encryption) {
        banks[i]._doc.bank_account_number_encryption =
          await CommontController.decryptionKeyClient(
            setting.encryption_key,
            banks[i].bank_account_number_encryption
          );
      }
    }
  }

  return res.send({ success: true, result: banks, bankId });
};

exports.getDeductionScheduler = async (req, res) => {
  const companyId = req.body.companyId;
  let result, count;

  if (req.body.systemCode == "KEYPAY") {
    result = KeypayPayrollScheduleModel.aggregate([
      {
        $match: { company_id: mongoose.Types.ObjectId(companyId) },
      },
      { $skip: +req.body.page * +req.body.pageSize },
      { $limit: +req.body.pageSize },
    ]);
    count = KeypayPayrollScheduleModel.count({
      company_id: mongoose.Types.ObjectId(companyId),
    });
  } else if (req.body.systemCode == "XERO" || req.body.systemCode == "RECKON") {
    result = XeroPayrollCalendarModel.aggregate([
      {
        $match: { company_id: mongoose.Types.ObjectId(companyId) },
      },
      { $skip: +req.body.page * +req.body.pageSize },
      { $limit: +req.body.pageSize },
    ]);
    count = XeroPayrollCalendarModel.count({
      company_id: mongoose.Types.ObjectId(companyId),
    });
  } else {
    result = PayPeriodOriginationModel.aggregate([
      {
        $match: { company_id: mongoose.Types.ObjectId(companyId) },
      },
      {
        $lookup: {
          from: "cycles",
          localField: "cycle_id",
          foreignField: "_id",
          as: "cycle",
        },
      },
      { $unwind: "$cycle" },
      { $skip: +req.body.page * +req.body.pageSize },
      { $limit: +req.body.pageSize },
    ]);
    count = PayPeriodOriginationModel.count({
      company_id: mongoose.Types.ObjectId(companyId),
    });
  }

  const [data, totalItem] = await Promise.all([result, count]);

  return res.send({
    result: data,
    recordsTotal: totalItem,
    recordsFiltered: totalItem,
  });
};

exports.updateDeductionScheduler = async (req, res) => {
  const scheduleId = req.body.scheduleId;
  const systemCode = req.body.systemCode;
  let result;

  if (systemCode == "KEYPAY") {
    result = await KeypayPayrollScheduleModel.findOneAndUpdate(
      { _id: scheduleId },
      {
        $set: {
          schedule_sub_date: req.body.scheduleSubDate,
          schedule_minute_time: req.body.time,
        },
      },
      {
        new: true,
        upsert: true,
        rawResult: true, // Return the raw result from the MongoDB driver
      }
    );
  } else if (systemCode == "XERO" || systemCode == "RECKON") {
    result = await XeroPayrollCalendarModel.findOneAndUpdate(
      { _id: scheduleId },
      {
        $set: {
          schedule_sub_date: req.body.scheduleSubDate,
          schedule_minute_time: req.body.time,
        },
      },
      {
        new: true,
        upsert: true,
        rawResult: true, // Return the raw result from the MongoDB driver
      }
    );
  } else {
    result = await PayPeriodOriginationModel.findOneAndUpdate(
      { _id: scheduleId },
      {
        $set: {
          schedule_sub_date: req.body.scheduleSubDate,
          schedule_minute_time: req.body.time,
        },
      },
      {
        new: true,
        upsert: true,
        rawResult: true, // Return the raw result from the MongoDB driver
      }
    );
  }

  return res.send(result.value);
};

exports.getListAccounts = async (req, res) => {
  let { searchKey } = req.body;
  let where = { company_id: mongoose.Types.ObjectId(req.body.companyId) };
  if (searchKey !== "") {
    where = {
      $and: [
        { company_id: mongoose.Types.ObjectId(req.body.companyId) },
        {
          $or: [
            { Code: new RegExp(searchKey, "i") },
            { Name: new RegExp(searchKey, "i") },
            { Type: new RegExp(searchKey, "i") },
          ],
        },
      ],
    };
  }
  const queryGetAllXeroAccount = XeroAccountModel.aggregate([
    { $match: where },
    {
      $lookup: {
        from: "xero_tax_accounts",
        localField: "TaxType",
        foreignField: "type",
        as: "xero_tax_info",
      },
    },
    { $unwind: "$xero_tax_info" },
    { $sort: { Code: 1 } },
    { $skip: +req.body.page * +req.body.pageSize },
    { $limit: +req.body.pageSize },
  ]);

  const queryCountAll = XeroAccountModel.count(where);

  const [result, count] = await Promise.all([
    queryGetAllXeroAccount,
    queryCountAll,
  ]);
  return res.send({
    result: result,
    totalItem: count,
    totalPage: Math.ceil(count / req.body.pageSize),
  });
};

exports.addNewAccount = (req, res) => {
  let method;
  if (req.body.checkStatus == "add") {
    method = "PUT";
  } else {
    method = "POST";
  }
  const options = {
    method: method,
    url: "https://api.xero.com/api.xro/2.0/Accounts",
    headers: {
      Authorization: `Bearer ${req.body.accToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Xero-tenant-id": req.body.tenantId,
    },
    body: req.body.data,
  };

  request(options, async (error, response, body) => {
    if (error) console.log(error);
    const parseBody = JSON.parse(body);
    try {
      if (
        response.statusCode == 200 &&
        parseBody.Accounts &&
        parseBody.Accounts.length > 0
      ) {
        if (req.body.checkStatus == "add") {
          const queryCreateAccount = XeroAccountModel.create({
            company_id: mongoose.Types.ObjectId(req.body.companyId),
            AccountID: parseBody.Accounts[0].AccountID,
            Code: parseBody.Accounts[0].Code,
            Name: parseBody.Accounts[0].Name,
            Status: parseBody.Accounts[0].Status,
            Type: parseBody.Accounts[0].Type,
            Description: parseBody.Accounts[0].Description,
            TaxType: parseBody.Accounts[0].TaxType,
            Class: parseBody.Accounts[0].Class,
            ShowInExpenseClaims: parseBody.Accounts[0].ShowInExpenseClaims,
            EnablePaymentsToAccount:
              parseBody.Accounts[0].EnablePaymentsToAccount,
            AddToWatchlist: parseBody.Accounts[0].AddToWatchlist,
            HasAttachments: parseBody.Accounts[0].HasAttachments,
          });
          //get list account
          const queryAllAccounts = XeroAccountModel.aggregate([
            {
              $match: {
                company_id: mongoose.Types.ObjectId(req.body.companyId),
              },
            },
            { $sort: { Code: 1 } },
          ]);
          const [result] = await Promise.all([
            queryAllAccounts,
            queryCreateAccount,
          ]);
          return res.send({
            status: response.statusCode,
            listAccounts: result,
            result: parseBody,
          });
        } else {
          const queryUpdateXeroAccount = XeroAccountModel.findOneAndUpdate(
            { AccountID: parseBody.Accounts[0].AccountID },
            {
              $set: {
                Code: parseBody.Accounts[0].Code,
                Name: parseBody.Accounts[0].Name,
                Status: parseBody.Accounts[0].Status,
                Type: parseBody.Accounts[0].Type,
                Description: parseBody.Accounts[0].Description,
                TaxType: parseBody.Accounts[0].TaxType,
                Class: parseBody.Accounts[0].Class,
                ShowInExpenseClaims: parseBody.Accounts[0].ShowInExpenseClaims,
                EnablePaymentsToAccount:
                  parseBody.Accounts[0].EnablePaymentsToAccount,
                AddToWatchlist: parseBody.Accounts[0].AddToWatchlist,
                HasAttachments: parseBody.Accounts[0].HasAttachments,
              },
            },
            {
              new: true,
              upsert: true,
              rawResult: true, // Return the raw result from the MongoDB driver
            }
          );
          //get list account
          const queryAllAccounts = XeroAccountModel.aggregate([
            {
              $match: {
                company_id: mongoose.Types.ObjectId(req.body.companyId),
              },
            },
            { $sort: { Code: 1 } },
          ]);
          let [result] = await Promise.all([
            queryAllAccounts,
            queryUpdateXeroAccount,
          ]);
          return res.send({
            status: response.statusCode,
            listAccounts: result,
          });
        }
      }
      return res.send({ status: response.statusCode, result: parseBody });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getDeductionCate = async (req, res) => {
  let { searchKey } = req.body;
  let where = { company_id: mongoose.Types.ObjectId(req.body.companyId) };
  if (searchKey !== "") {
    where = {
      $and: [
        { company_id: mongoose.Types.ObjectId(req.body.companyId) },
        {
          $or: [
            { DeductionCategory: new RegExp(searchKey, "i") },
            { Name: new RegExp(searchKey, "i") },
            { AccountCode: new RegExp(searchKey, "i") },
          ],
        },
      ],
    };
  }
  const queryGetAllXeroAccount = XeroDeductionCategoryModel.aggregate([
    { $match: where },
    { $sort: { Name: 1 } },
    { $skip: +req.body.page * +req.body.pageSize },
    { $limit: +req.body.pageSize },
  ]);

  const queryCountAll = XeroDeductionCategoryModel.count(where);

  const [result, count] = await Promise.all([
    queryGetAllXeroAccount,
    queryCountAll,
  ]);

  return res.send({
    result: result,
    totalItem: count,
    totalPage: Math.ceil(count / req.body.pageSize),
  });
};

exports.addNewCategory = async (req, res) => {
  const getAllDeductionType = await XeroDeductionCategoryModel.find({
    company_id: mongoose.Types.ObjectId(req.body.companyId),
  });
  const parseReqBody = JSON.parse(req.body.bodyCategory);
  const deductionTypes = parseReqBody.DeductionTypes[0];

  let [...newDeductionTypes] = getAllDeductionType;
  if (req.body.checkStatus != "add") {
    getAllDeductionType.forEach((type, index) => {
      if (type.DeductionTypeID == deductionTypes.DeductionTypeID) {
        newDeductionTypes.splice(index, 1);
      }
    });
  }
  newDeductionTypes.push(deductionTypes);

  let bodyDeductionTypes = {
    DeductionTypes: newDeductionTypes,
  };

  const options = {
    method: "POST",
    url: "https://api.xero.com/payroll.xro/1.0/PayItems",
    headers: {
      Authorization: `Bearer ${req.body.accToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Xero-tenant-id": req.body.tenantId,
    },
    body: JSON.stringify(bodyDeductionTypes),
  };
  request(options, async (error, response, body) => {
    if (error) console.log(error);

    const parseBody = JSON.parse(body);
    if (
      response.statusCode == 200 &&
      parseBody.PayItems.DeductionTypes &&
      parseBody.PayItems.DeductionTypes.length > 0
    ) {
      if (req.body.checkStatus == "add") {
        const newDeductionCate = parseBody.PayItems.DeductionTypes.pop();
        const result = await XeroDeductionCategoryModel.create({
          company_id: mongoose.Types.ObjectId(req.body.companyId),
          DeductionTypeID: newDeductionCate.DeductionTypeID,
          DeductionCategory: newDeductionCate.DeductionCategory,
          AccountCode: newDeductionCate.AccountCode,
          Name: newDeductionCate.Name,
          ReducesTax: newDeductionCate.ReducesTax,
          ReducesSuper: newDeductionCate.ReducesSuper,
          IsExemptFromW1: newDeductionCate.IsExemptFromW1,
        });
        return res.send({ status: response.statusCode, result: result });
      } else {
        const result = await XeroDeductionCategoryModel.findOneAndUpdate(
          { DeductionTypeID: deductionTypes.DeductionTypeID },
          {
            $set: {
              DeductionCategory: deductionTypes.DeductionCategory,
              AccountCode: deductionTypes.AccountCode,
              Name: deductionTypes.Name,
              ReducesTax: deductionTypes.ReducesTax,
              ReducesSuper: deductionTypes.ReducesSuper,
              IsExemptFromW1: deductionTypes.IsExemptFromW1,
            },
          },
          {
            new: true,
            upsert: true,
            rawResult: true, // Return the raw result from the MongoDB driver
          }
        );
        return res.send({ status: response.statusCode, result: result.value });
      }
    }
    return res.send({ status: response.statusCode, result: parseBody });
  });
};

const promisifiedRequest = function (options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (response) {
        return resolve(JSON.parse(body).result);
      }
      if (error) {
        return reject(error);
      }
    });
  });
};

exports.updateLender = async (req, res) => {
  console.log(req.body);
  let result = null;
  let {
    id,
    idLender,
    lenderName,
    liveAccountNumber,
    liveApiKey,
    testAccountNumber,
    testApiKey,
    fundingType,
  } = req.body;
  let company = await CompanyModel.findOne({ _id: id });
  let setting = await SettingModel.findOne();
  if (company.lenders.length > 0) {
    let lender = await LenderModel.findOne({ _id: idLender });
    if (lender != null && fundingType == "SELF_FINANCED") {
      lender.live_account_number =
        liveAccountNumber != "" ? liveAccountNumber : null;
      lender.live_api_key =
        liveApiKey != ""
          ? await CommontController.encryption(
              setting.encryption_key,
              liveApiKey
            )
          : null;
      lender.test_account_number =
        testAccountNumber != "" ? testAccountNumber : null;
      lender.test_api_key =
        testApiKey != ""
          ? await CommontController.encryption(
              setting.encryption_key,
              testApiKey
            )
          : null;
      LenderModel.findOneAndUpdate(
        { _id: lender._id },
        {
          $set: {
            funding_type: "SELF_FINANCED",
            live_account_number: lender.live_account_number,
            live_api_key: lender.live_api_key,
            test_account_number: lender.test_account_number,
            test_api_key: lender.test_api_key,
          },
        },
        function (err) {
          if (err) {
            return res.json({ success: err, msg: "Fail: Update Lender" });
          }
          result = company;
        }
      );
    } else {
      LenderModel.findOneAndUpdate(
        { _id: idLender },
        {
          $set: {
            funding_type: "CASHD_FINANCED",
            live_account_number: null,
            live_api_key: null,
            test_account_number: null,
            test_api_key: null,
          },
        },
        function (err) {
          if (err) {
            return res.json({ success: err, msg: "Fail: Update Lender" });
          }
          result = company;
        }
      );
    }
  } else {
    let lender = new LenderModel();
    (lender.lender_name = lenderName), (lender.interest_rate = "");
    lender.start_date = Date.now();
    lender.is_cashd = false;
    lender.parent_id = null;
    lender.funding_type = fundingType;
    if (fundingType == "SELF_FINANCED") {
      lender.live_account_number =
        liveAccountNumber != "" ? liveAccountNumber : null;
      lender.live_api_key =
        liveApiKey != ""
          ? await CommontController.encryption(
              setting.encryption_key,
              liveApiKey
            )
          : null;
      lender.test_account_number =
        testAccountNumber != "" ? testAccountNumber : null;
      lender.test_api_key =
        testApiKey != ""
          ? await CommontController.encryption(
              setting.encryption_key,
              testApiKey
            )
          : null;
    }
    let item = await lender.save();
    company.lenders.push(item._id);
    result = await company.save();
  }
  return res.status(200).send({ result: result, status: 200 });
};

exports.setKYC = async (req, res) => {
  await CompanyModel.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body }
  );
  return res.json({ success: true, code: 200, result: null });
};

exports.addChatType = async (req, res) => {
  var { id, type } = req.body;
  await CompanyModel.findByIdAndUpdate(id, { chat_type: type });
  return res.status(200).send({ success: true });
};

exports.undoDeduction = async (req, res) => {
  let result = {};
  const { payPeriodId, idCompany, codeSystem } = req.body;
  switch (codeSystem) {
    case "XERO":
      result = await checkDeductionInXero(payPeriodId, idCompany);
      break;
    case "ASTUTE":
    case "DEPUTY":
      result.status = true;
      break;
    case "KEYPAY":
      result = await checkDeductionInKeypay(payPeriodId, idCompany);
      break;
    case "RECKON":
      result = await checkDeductionInReckon(payPeriodId, idCompany);
      break;
    default:
      break;
  }
  if (result?.status) {
    await PayPeriod.findOneAndUpdate(
      {
        _id: [payPeriodId],
        company_id: [idCompany],
      },
      {
        $set: {
          is_write_deductions_back_system: false,
        },
      }
    );
    await PayDeductionModel.updateMany(
      {
        pay_period_id: [payPeriodId],
        company_id: [idCompany],
      },
      {
        $set: {
          is_write_back_system: 0,
        },
      }
    );
    await PayCalculateModel.updateMany(
      { pay_period_id: [payPeriodId] },
      { $set: { deduction_status: 0 } }
    );
    const deductionFilePeriod = await DeductionFilePeriodModel.find({
      pay_period_id: payPeriodId,
    });
    if (deductionFilePeriod.length > 0) {
      for (let index = 0; index < deductionFilePeriod.length; index++) {
        const element = deductionFilePeriod[index];
        await DeductionFileStaffModel.findOneAndDelete({
          deduction_period_id: element._id,
        });
      }
      await DeductionFilePeriodModel.deleteMany({ pay_period_id: payPeriodId });
    }
    return res.send({
      success: true,
      result: null,
      message: "Undo deduction file successfully.",
    });
  } else {
    return res.send({
      success: false,
      result: null,
      message: result.message,
    });
  }
};

exports.createWalletFileExcel = async (req, res) => {
  const data = JSON.parse(req.body.json);
  const header = [...data.header];
  const { systemCode } = req.body;
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("My Sheet");

  // Title
  if (systemCode == "KEYPAY") {
    worksheet.mergeCells("A1:J1");
  } else {
    worksheet.mergeCells("A1:H1");
  }
  worksheet.getCell("A1").value = data.title;
  worksheet.getCell("A1").font = {
    size: 16,
    bold: true,
    color: { argb: "0073e6" },
    name: "Times New Roman",
  };

  const headerRow = worksheet.addRow(header);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0073e6" },
      bgColor: { argb: "0073e6" },
      alignment: { vertical: "middle", horizontal: "center" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.font = {
      name: "Times New Roman",
      size: 12,
      color: { argb: "FFFFFF" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // body
  let number = 3;
  data.body.forEach((item) => {
    worksheet.getCell(`A${number}`).value = item.no;
    worksheet.getCell(`A${number}`).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getCell(`B${number}`).value = item.employeeName;
    worksheet.getCell(`C${number}`).value = item.payPeriods;
    worksheet.getCell(`D${number}`).value = item.availableBalance;
    worksheet.getCell(`E${number}`).value = item.salary;
    worksheet.getCell(`F${number}`).value = item.cashDLimit;
    worksheet.getCell(`G${number}`).value = item.cashDWithdraws;
    worksheet.getCell(`H${number}`).value = item.salaryBalance;
    if (systemCode == "KEYPAY") {
      worksheet.getCell(`I${number}`).value = item.ave;
      worksheet.getCell(`J${number}`).value = item.payslips;
    }
    number++;
  });

  worksheet.getColumn(1).width = 5;
  worksheet.getColumn(2).width = 30;
  worksheet.getColumn(2).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getColumn(3).width = 30;
  worksheet.getColumn(3).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getColumn(4).width = 20;
  worksheet.getColumn(4).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getColumn(5).width = 20;
  worksheet.getColumn(5).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getColumn(6).width = 20;
  worksheet.getColumn(6).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getColumn(7).width = 20;
  worksheet.getColumn(7).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getColumn(8).width = 20;
  worksheet.getColumn(8).alignment = { vertical: "middle", horizontal: "left" };
  if (systemCode == "KEYPAY") {
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(9).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(10).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
  }

  worksheet.getRow(1).height = 50;
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  headerRow.eachCell((cell) => {
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  workbook.xlsx.writeBuffer().then((data) => {
    let base64data = data.toString("base64");
    return res.json({ code: 200, data: base64data });
  });
};

exports.createWalletFilePDF = async (req, res) => {
  const puppeteer = require("puppeteer");
  const data = JSON.parse(req.body.json);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const { systemCode } = req.body;
  let tbody = "",
    thString = "";
  const { title, header, body } = data;
  header.forEach((item) => {
    thString += `<th>${item}</th>`;
  });
  body.forEach((item) => {
    tbody += `<tr>
            <td style="text-align: center;">${item.no}</td>
            <td>${item.employeeName}</td>
            <td>${item.payPeriods}</td>
            <td>${item.availableBalance}</td>
            <td>${item.salary}</td>
            <td>${item.cashDLimit}</td>
            <td>${item.cashDWithdraws}</td>
            <td>${item.salaryBalance}</td>
            ${
              systemCode == "KEYPAY"
                ? "<td>" + item.ave + "</td><td>" + item.payslips + "</td>"
                : ""
            }
            </tr>`;
  });
  let html = `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Document</title>
              <style>
                  table {
                    font-family: arial, sans-serif;
                    border-collapse: collapse;
                    width: 100%;
                  }
                  
                  td, th {
                    border: 1px solid #dddddd;
                    text-align: left;
                    padding: 8px;
                    font-size: 12px;
                  }
      
                  th {
                    font-weight: bold;
                    text-align: center;
                  }
                  
                  tr:nth-child(even) {
                    background-color: #dddddd;
                  }
                  .header-text {
                      display: flex;
                      justify-content: space-between;
                  }
                  h5 {
                      margin: 10px 0;
                  }
                  h3 {
                    margin-top: 0;
                  }
                  table {
                    page-break-inside: auto;
                    border-collapse: collapse;
                    }
                    tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                    }
                    thead {
                    display: table-header-group;
                    }
                    tfoot {
                    display: table-footer-group;
                    }
                    @media print {
                    table {
                    page-break-after: auto;
                    }
                    tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                    }
                    td {
                    page-break-inside: avoid;
                    page-break-after: auto;
                    }
                    thead {
                      display: table-header-group;
                    }
                    tfoot {
                      display: table-footer-group;
                    }
                    }
              </style>
          </head>
          <body>
              <div>
                  <h3 style="text-align: center;">${title}</h3>
              </div>
              <div style="margin-top: 20px;">
                  <table style="width:100%">
                      <tr>
                        ${thString}
                      </tr>
                      ${tbody}
                    </table>
              </div>
          </body>
          </html>`;
  await page.setContent(html, {
    waitUntil: "domcontentloaded",
  });
  let base64data = (
    await page.pdf({
      margin: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30,
      },
      format: "a4",
    })
  ).toString("base64");
  await browser.close();
  return res.json({ code: 200, data: base64data });
};

exports.createDeductionFileExcel = async (req, res) => {
  const data = JSON.parse(req.body.json);
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("My Sheet");
  const header2 = ["Capital", "Fee", "Total", "Capital", "Fee", "Total"];
  const header = [
    "#",
    "Employees Name",
    "Employees Type",
    "Sent Amount",
    "Unsent Amount",
  ];

  // Title
  worksheet.mergeCells("A1:I1");
  worksheet.getCell("A1").value = data.title;
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
  worksheet.mergeCells("A5:A6");
  worksheet.mergeCells("B5:B6");
  worksheet.mergeCells("C5:C6");
  worksheet.mergeCells("D5:F5");
  worksheet.mergeCells("G5:I5");

  // Body
  worksheet.getColumn(1).width = 5;
  worksheet.getColumn(2).width = 30;
  worksheet.getColumn(2).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getColumn(3).width = 30;
  worksheet.getColumn(3).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getColumn(4).width = 15;
  worksheet.getColumn(4).alignment = {
    vertical: "middle",
    horizontal: "right",
  };
  worksheet.getColumn(4).font = { color: { argb: "32cd32" } };
  worksheet.getColumn(5).width = 15;
  worksheet.getColumn(5).alignment = {
    vertical: "middle",
    horizontal: "right",
  };
  worksheet.getColumn(5).font = { color: { argb: "32cd32" } };
  worksheet.getColumn(6).width = 15;
  worksheet.getColumn(6).alignment = {
    vertical: "middle",
    horizontal: "right",
  };
  worksheet.getColumn(6).font = { color: { argb: "32cd32" } };
  worksheet.getColumn(7).width = 15;
  worksheet.getColumn(7).alignment = {
    vertical: "middle",
    horizontal: "right",
  };
  worksheet.getColumn(7).font = { color: { argb: "FF0000" } };
  worksheet.getColumn(8).width = 15;
  worksheet.getColumn(8).alignment = {
    vertical: "middle",
    horizontal: "right",
  };
  worksheet.getColumn(8).font = { color: { argb: "FF0000" } };
  worksheet.getColumn(9).width = 15;
  worksheet.getColumn(9).alignment = {
    vertical: "middle",
    horizontal: "right",
  };
  worksheet.getColumn(9).font = { color: { argb: "FF0000" } };

  // Style header
  worksheet.getRow(1).height = 50;
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(2).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(3).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(4).alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getCell("A1").font = {
    size: 16,
    bold: true,
    color: { argb: "0073e6" },
    name: "Times New Roman",
  };

  worksheet.getCell("A2").value = "Company: " + data.companyName;
  worksheet.getCell("A3").value = "Pay Period: " + data.payPeriod;
  worksheet.getCell("A4").value = "Date Report: " + data.dateReport;

  worksheet.getCell("G2").value = "Schedule Name: " + data.scheduleName;
  worksheet.getCell("G2").font = { color: { argb: "000000" } };
  worksheet.getCell("G3").value = "Sent Amount: " + data.sentAmount;
  worksheet.getCell("G3").font = { color: { argb: "000000" } };
  worksheet.getCell("G4").value = "Unsent Amount: " + data.unsentAmount;
  worksheet.getCell("G4").font = { color: { argb: "000000" } };

  ["A", "B", "C", "D", "G"].forEach((item, index) => {
    var cell = worksheet.getCell(item + "5");
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0073e6" },
      bgColor: { argb: "0073e6" },
      alignment: { vertical: "middle", horizontal: "center" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.font = {
      name: "Times New Roman",
      size: 12,
      color: { argb: "FFFFFF" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.value = header[index];
  });

  ["D", "E", "F", "G", "H", "I"].forEach((item, index) => {
    var cell = worksheet.getCell(item + "6");
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0073e6" },
      bgColor: { argb: "0073e6" },
      alignment: { vertical: "middle", horizontal: "center" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.font = {
      name: "Times New Roman",
      size: 12,
      color: { argb: "FFFFFF" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.value = header2[index];
  });

  // body data
  let number = 7;
  data.body.forEach((item) => {
    worksheet.getCell(`A${number}`).value = item.no;
    worksheet.getCell(`A${number}`).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getCell(`B${number}`).value = item.employeesName;
    worksheet.getCell(`C${number}`).value = item.employeesType;
    worksheet.getCell(`D${number}`).value = item.capitalSent;
    worksheet.getCell(`E${number}`).value = item.feeSent;
    worksheet.getCell(`F${number}`).value = item.totalSent;
    worksheet.getCell(`G${number}`).value = item.capitalUnsent;
    worksheet.getCell(`H${number}`).value = item.feeUnsent;
    worksheet.getCell(`I${number}`).value = item.totalUnsent;
    number++;
  });

  workbook.xlsx.writeBuffer().then((data) => {
    let base64data = data.toString("base64");
    return res.json({ code: 200, data: base64data, success: true });
  });
};

exports.createDeductionFilePDF = async (req, res) => {
  const puppeteer = require("puppeteer");
  const data = JSON.parse(req.body.json);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const { title, body } = data;
  let tbody = "";
  body.forEach((item) => {
    tbody += `<tr>
            <td>${item.no}</td>
            <td>${item.employeesName}</td>
            <td>${item.employeesType}</td>
            <td>${item.capitalSent}</td>
            <td>${item.feeSent}</td>
            <td>${item.totalSent}</td>
            <td>${item.capitalUnsent}</td>
            <td>${item.feeUnsent}</td>
            <td>${item.totalUnsent}</td>
            </tr>`;
  });
  let html = `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
            table {
                font-family: arial, sans-serif;
                border-collapse: collapse;
                width: 100%;
            }
    
            td,
            th {
                border: 1px solid #dddddd;
                text-align: left;
                padding: 8px;
                font-size: 12px;
            }
    
            thead th {
                font-weight: bold;
                text-align: center;
            }
    
            .header-text {
                display: flex;
                justify-content: space-between;
            }
    
            h5 {
                margin: 10px 0;
            }
    
            h3 {
                margin-top: 0;
            }
    
            table {
                page-break-inside: auto;
                border-collapse: collapse;
            }
    
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
    
            thead {
                display: table-header-group;
            }
    
            tfoot {
                display: table-footer-group;
            }
    
            tbody tr td:first-child {
                text-align: center;
            }
    
            tbody tr td:nth-of-type(n+4) {
                text-align: right;
            }
    
            @media print {
                table {
                    page-break-after: auto;
                }
    
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
    
                td {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
    
                thead {
                    display: table-header-group;
                }
    
                tfoot {
                    display: table-footer-group;
                }
            }
            .div-text {
                display: inline-block;
                padding-top: 10px;
            }
            .text-left {
                width: 70%;
            }
            </style>
        </head>
        
        <body>
            <div>
                <h3 style="text-align: center;">${title}</h3>
            </div>
            <div>
                <div>
                    <div class="div-text text-left">Company: ${data.companyName}</div>
                    <div class="div-text text-right">Schedule Name: ${data.scheduleName}</div>
                </div>
                <div>
                    <div class="div-text text-left">Pay Period: ${data.payPeriod}</div>
                    <div class="div-text text-right">Sent Amount: ${data.sentAmount}</div>
                </div>
                <div>
                    <div class="div-text text-left">Date Report: ${data.dateReport}</div>
                    <div class="div-text text-right">Unsent Amount: ${data.unsentAmount}</div>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <table style="width:100%">
                    <thead class="thead-light">
                        <tr>
                            <th style="vertical-align: middle; text-align: center;" rowspan="2" scope="col">
                                #
                            </th>
                            <th style="vertical-align: middle; text-align: center;" rowspan="2">Employee
                                Name
                            </th>
                            <th style="vertical-align: middle; text-align: center;" rowspan="2">Employee
                                Type
                            </th>
                            <th style="vertical-align: middle; text-align: center;padding-top: 4px; padding-bottom: 4px;"
                                colspan="3">Sent
                                Amount
                            </th>
                            <th style="vertical-align: middle; text-align: center;padding-top: 4px; padding-bottom: 4px;"
                                colspan="3">Unsent
                                Amount
                            </th>
                        </tr>
                        <tr>
                            <th style="padding-top: 3px; padding-bottom: 3px;text-align: center;">Capital</th>
                            <th style="padding-top: 3px; padding-bottom: 3px;text-align: center;">Fee</th>
                            <th style="padding-top: 3px; padding-bottom: 3px;text-align: center;">Total</th>
                            <th style="padding-top: 3px; padding-bottom: 3px;text-align: center;">Capital</th>
                            <th style="padding-top: 3px; padding-bottom: 3px;text-align: center;">Fee</th>
                            <th style="padding-top: 3px; padding-bottom: 3px;text-align: center;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tbody}
                    </tbody>
                </table>
            </div>
        </body>
        </html>`;
  await page.setContent(html, {
    waitUntil: "domcontentloaded",
  });
  let base64data = (
    await page.pdf({
      margin: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30,
      },
      format: "a4",
    })
  ).toString("base64");
  await browser.close();
  return res.json({ code: 200, data: base64data, success: true });
};

exports.addDeductionsBackToKeyPayOnePayPeriodByEmployee = async (req, res) => {
  const url = "/api/timesheets/keypay/addDeductionsBackToKeyPayOnePayPeriodByEmployee";
  const body = {
    deduction_staff_id: req.body.staff_id,
    pay_period_id: req.body.pay_period_id,
    type: req.body.type ? req.body.type : "AUTO", // AUTO/ MANUALLY
  };
  const response = await baseService.getInstance().post(url, body, req.session.token, req);
  return res.send(response.body);
};

exports.setKYC = async (req, res) => {
  await CompanyModel.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body }
  );
  return res.json({ success: true, code: 200, result: null });
};

async function checkDeductionInXero(payPeriodId, idCompany) {
  var company = await CompanyModel.findById(idCompany);
  var newAccessToken = null;
  if (company.system_refresh_token != null) {
    let headers = {
      Authorization: company.system_base64_authentication,
      "Content-Type": "application/x-www-form-urlencoded",
    };
    let body = {
      grant_type: "refresh_token",
      refresh_token: company.system_refresh_token,
    };
    var formData = querystring.stringify(body);
    let urlRefreshToken = "https://identity.xero.com/connect/token";
    var refreshTokenResult = await new Promise((resolve, reject) => {
      request(
        {
          url: urlRefreshToken,
          method: "POST",
          headers: headers,
          body: formData,
        },
        function (error, res, body) {
          if (!error) {
            resolve(body);
          } else {
            reject(error);
          }
        }
      );
    }).catch((error) => {
      return {status: false, message: "Can not connect to server. Please try again."};
    });

    if (refreshTokenResult != null) {
      var refreshTokenJson = null;
      try {
        refreshTokenJson = JSON.parse(refreshTokenResult);
      } catch (e) {
        refreshTokenJson = null;
      }
      if (refreshTokenJson != null && refreshTokenJson.refresh_token != null) {
        //Update new refresh token for company
        await CompanyModel.findOneAndUpdate(
          { _id: company._id },
          {
            $set: {
              system_refresh_token: refreshTokenJson.refresh_token,
            },
          }
        );

        newAccessToken = refreshTokenJson.access_token;
      } else {
        return {status: false, message: "Can not connect to server. Please try again."};
      }
    } else {
      return {status: false, message: "Can not connect to server. Please try again."};
    }
  }

  let oAuth = "Bearer " + newAccessToken;
  let tenantId = company.system_tenant_id;

  let headers = {
    Authorization: oAuth,
    "Xero-tenant-id": tenantId,
  };

  //Get Period pay
  var payPeriods = await PayPeriod.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(payPeriodId) },
    },
    {
      $lookup: {
        from: "xero_pay_calendars",
        localField: "xero_pay_calendar_id",
        foreignField: "_id",
        as: "xero_pay_calendar",
      },
    },
    { $unwind: "$xero_pay_calendar" },
  ]);

  var currentPeriod = null;
  if (payPeriods.length > 0) {
    currentPeriod = payPeriods[0];
  } else {
    return {status: false, message: "Can not connect to server. Please try again."};
  }

  var midDate = new Date(
    (new Date(currentPeriod.start_date).getTime() +
      new Date(currentPeriod.end_date).getTime()) /
      2
  );
  //Get Payrun period
  var month = midDate.getUTCMonth() + 1;
  var day = midDate.getUTCDate();
  var year = midDate.getUTCFullYear();

  let urlPayrun =
    'https://api.xero.com/payroll.xro/1.0/PayRuns?where=PayrollCalendarID=GUID("' +
    currentPeriod.xero_pay_calendar.PayrollCalendarID +
    '") AND PayRunPeriodStartDate<=DateTime(' +
    year +
    "," +
    month +
    "," +
    day +
    ") AND PayRunPeriodEndDate>=DateTime(" +
    year +
    "," +
    month +
    "," +
    day +
    ")";
  var payrunResult = await new Promise((resolve, reject) => {
    request(
      { url: urlPayrun, headers: headers, Accept: "application/json" },
      function (error, res, body) {
        if (!error) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  }).catch((error) => {
    return {status: false, message: "Can not connect to server. Please try again."};
  });

  try {
    var payrunResultJson = JSON.parse(payrunResult);
    if (payrunResultJson?.PayRuns?.length === 0) {
      return {status: true, message: null};
    } else {
      let payrun = payrunResultJson.PayRuns[0];
      if (payrun.PayRunStatus == 'DRAFT') {
        return {status: false, message: "You cannot undo data of this pay period. It should be removed on payroll system first."}
      }
      if (payrun.PayRunStatus == 'POSTED') {
        return {status: false, message: "You cannot undo data of this pay period. It has already finished on payroll system."}
      }
    }
  } catch (error) {
    return {status: false, message: "Can not connect to server. Please try again."};
  }
}

async function checkDeductionInKeypay(payPeriodId, idCompany) {
  //var systemObj = await SystemModel.findOne({ code: "KEYPAY" });
  const company = await CompanyModel.findById(idCompany);
  if (company != null && company.system_refresh_token != null) {
    let headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    let bodyData = {
      grant_type: "refresh_token",
      client_id: config.KEYPAY_CLIENT_ID,
      client_secret: config.KEYPAY_CLIENT_SECRET,
      refresh_token: company.system_refresh_token,
    };
    var formData = querystring.stringify(bodyData);
    let urlRefreshToken = "https://api.yourpayroll.com.au/oauth/token";
    var refreshTokenResult = await new Promise((resolve, reject) => {
      request(
        {
          url: urlRefreshToken,
          method: "POST",
          headers: headers,
          body: formData,
        },
        function (error, res, body) {
          if (!error) {
            resolve(body);
          } else {
            reject(error);
          }
        }
      );
    }).catch((error) => {
      return {status: false, message: "Can not connect to server. Please try again."};
    });
    var refreshTokenJson = null;
    try {
      refreshTokenJson = JSON.parse(refreshTokenResult);
    } catch (e) {
      refreshTokenJson = null;
    }
    if (refreshTokenJson != null && refreshTokenJson.refresh_token != null) {
      //Update new refresh token for company
      await CompanyModel.findOneAndUpdate(
        { _id: company._id },
        {
          $set: {
            system_refresh_token: refreshTokenJson.refresh_token,
          },
        }
      );
      var newAccessToken = refreshTokenJson.access_token;

      //Get Period pay
      var payPeriods = await PayPeriod.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(payPeriodId) },
        },
        {
          $lookup: {
            from: "keypay_pay_schedules",
            localField: "keypay_pay_schedule_id",
            foreignField: "_id",
            as: "keypay_pay_schedule",
          },
        },
        { $unwind: "$keypay_pay_schedule" },
      ]);

      var currentPeriod = null;
      if (payPeriods.length > 0) {
        currentPeriod = payPeriods[0];
      } else {
        return {status: false, message: "You cannot undo data of this pay period. It should be removed on payroll system first."};
      }

      var startDatePayrun = new Date(currentPeriod.start_date)

      //Get Payrun
        var urlPayRuns = "https://api.yourpayroll.com.au/api/v2/business/" + 
        company.system_company_id + 
        "/payrun?$filter=PayPeriodStarting eq datetime'" + 
        startDatePayrun.toISOString().substr(0,19) + 
        "' and PayCycle/Id eq " + 
        currentPeriod.keypay_pay_schedule.payScheduleId

      let headers = {
        Authorization: "Bearer " + newAccessToken,
        Accept: "application/json",
      };
      var payrunResult = await requestApi(urlPayRuns, headers, "KEYPAY");
      try {
        var payrunResultJson = JSON.parse(payrunResult);
        if (payrunResultJson.length == 0) {
          return {status: true, message: null};
        } else {
          if (payrunResultJson[0].isFinalised == false) {
            return {status: false, message: "You cannot undo data of this pay period. It should be removed on payroll system first."}
          }
          if (payrunResultJson[0].isFinalised == true) {
            return {status: false, message: "You cannot undo data of this pay period. It has already finished on payroll system."}
          }
        }
      } catch (error) {
        return {status: false, message: "Can not connect to server. Please try again."};
      }
    } else {
      return {status: false, message: "Can not connect to server. Please try again."};
    }
  } else {
    return {status: false, message: "Can not connect to server. Please try again."};
  }
}

async function checkDeductionInReckon(payPeriodId, idCompany) {
  //var systemObj = await SystemModel.findOne({ code: "RECKON" });
  var company = await CompanyModel.findById(idCompany);
  if (company.system_refresh_token != null) {
    let headers = {
      Authorization: "Basic " + Buffer.from(config.RECKON_CLIENT_ID + ":" + config.RECKON_CLIENT_SECRET).toString('base64'),
      "Content-Type" : "application/x-www-form-urlencoded"
    }
    let body = {
        grant_type: "refresh_token",
        refresh_token: company.system_refresh_token
    }
    var formData = querystring.stringify(body);
    let urlRefreshToken = "https://identity.reckon.com/connect/token";
    var refreshTokenResult = await new Promise((resolve, reject) => {
                    request({url: urlRefreshToken, method: 'POST', headers: headers, body: formData}, function (error, res, body) {
                        if (!error) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
            }).catch((error) => {
              return {status: false, message: "Can not connect to server. Please try again."};
            });
    var refreshTokenJson = null
    try {
        refreshTokenJson = JSON.parse(refreshTokenResult);
    } catch (e) {
        refreshTokenJson = null
    }

    var mainUrl = "https://api.reckon.com/r1/"
    if(refreshTokenJson != null && refreshTokenJson.refresh_token != null) {
      //Update new refresh token for company
      await CompanyModel.findOneAndUpdate({"_id": company._id}, 
                                    { $set: {
                                            system_refresh_token: refreshTokenJson.refresh_token
                                        }});
      var newAccessToken = refreshTokenJson.access_token

      //Get Period pay
            var payPeriods = await PayPeriod.aggregate([
                {
                    $match : { "_id": mongoose.Types.ObjectId(payPeriodId)}
                },
                {$lookup:
                    {
                        from: "xero_pay_calendars",
                        localField: 'xero_pay_calendar_id',
                        foreignField: '_id',
                        as: 'xero_pay_calendar'
                    }
                },
                {$unwind : "$xero_pay_calendar"}
            ]);

            var currentPeriod = null
            if(payPeriods.length > 0){
                currentPeriod = payPeriods[0]
            } else {
              return {status: false, message: "Can not connect to server. Please try again."};
            }

            //Get Payrun
            var urlPayRuns = mainUrl + company.system_company_id + 
            "/payroll/payruns?$filter= PayStartingDate eq " + 
            new Date(currentPeriod.start_date).toISOString().substr(0,10) +
            " and PayEndingDate eq " + 
            new Date(currentPeriod.end_date).toISOString().substr(0,10) + 
            " and (Status eq '1' or Status eq '8')";
            let headers = {
                Authorization: "Bearer " + newAccessToken,
                "Accept" : "application/json"
            }
            let payrunResultJson = await requestApi(urlPayRuns, headers, "RECKON");

            if (payrunResultJson == null || payrunResultJson.length == 0) {
              return {status: true, message: null};
            } else {
              let payrun = payrunResultJson[0];
              if (payrun.Status == 1) {
                return {status: false, message: "You cannot undo data of this pay period. It should be removed on payroll system first."}
              }
              if (payrun.Status == 8) {
                return {status: false, message: "You cannot undo data of this pay period. It has already finished on payroll system."}
              }
            }
    } else {
        return {status: false, message: "Can not connect to server. Please try again."};
    }
  } else {
    return {status: false, message: "Can not connect to server. Please try again."};
  }
}

async function requestApi(url, headers, code) {
  var result = await new Promise((resolve, reject) => {
    request({ url: url, headers: headers }, function (error, res, body) {
      if (!error) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  }).catch((error) => {
    console.error(error);
  });
  if (code != "RECKON") {
    return result;
  } else {
    if(result != null && result.length > 0){
      try{
          return JSON.parse(result)
      } catch (e) {
          // Instead of error, return str
          console.log("JSON - TRY CATCH");
          console.log(result);
          return e;
      }
    } else {
        return null
    } 
  }
}

exports.setupRepaymentType = async(req, res) => {
  if(!req.body.companyId){
    return res.status(400).json({success: false, result: null, message: 'The field "company_id" is required.', code: 400, errorCode: "REQUIRE_COMPANY_ID"});
  }

if (!req.body.deductionPaymentTypes) {
    return res.status(400).json({success: false, result: null, message: 'The field "deduction_repayment_type" is required.', code: 400, errorCode: "REQUIRE_DEDUCTION_PAYMENT_TYPE"});
}
  const body = {
    deduction_repayment_type: req.body.deductionPaymentTypes,
    company_id: req.body.companyId
  };

  if (req.body.makeRepaymentDate) {
    let array = req.body.makePaymentTime.split(':');
    let minute = Number(array[0]) * 60 + Number(array[1]);
    body['make_repayment_date'] = req.body.makeRepaymentDate;
    body['make_repayment_time'] = minute;
  }

  const response = await baseService.getInstance().post("/api/users/changeDeductionRepaymentMethod", body, req.session.token, req);
  let responseBody = JSON.parse(response.body);
  if (responseBody.success && responseBody.result) {
    if (responseBody.result.make_repayment_time) {
      let make_repayment_time = convertMinuteToStringTime(responseBody.result.make_repayment_time);
      responseBody.result.make_repayment_time = make_repayment_time;
    }
    socket.emit('repayment', {
      companyId: req.body.companyId,
      company: responseBody.result
    });
    socketHttp.emit('repayment', {
      companyId: req.body.companyId,
      company: responseBody.result
    });
  }
  return res.send(responseBody);
}

exports.getBanks = async(req, res) => {
  let id = req.params.id;
  //get company
  const company = await CompanyModel.findById(id);
  //get setting
  const querySetting = await SettingModel.findOne();
  //get banks
  let banks = await BankInfoModel.find({company_id: id, is_cashd_admin: 0 });
  if (banks.length > 0) {
    for(let i = 0; i < banks.length; i++) {
      if (banks[i].bank_bsb_number_encryption) {
        banks[i]._doc.bank_bsb_number_encryption =
          await CommontController.decryptionKeyClient(
            querySetting.encryption_key,
            banks[i].bank_bsb_number_encryption
          );
      }
      if (banks[i].bank_account_number_encryption) {
        banks[i]._doc.bank_account_number_encryption =
          await CommontController.decryptionKeyClient(
            querySetting.encryption_key,
            banks[i].bank_account_number_encryption
          );
      }
    }
  }
  return res.send({success: true, result: banks, code: 200, bankId: company.bank_account_id});
}

async function getCompanies(token, page, pageSize, group_id, system_id, is_connected, sort_style, sort_value, keyword, req) {
  let url = `/api/users/getCompanies?page=${page}&pageSize=${pageSize}&group_id=${group_id}&system_id=${system_id}&is_connected=${is_connected}&sort_style=${sort_style}&sort_value=${sort_value}&keyword=${keyword}`;
  const results = await baseService.getInstance().get(url, token, req);
  return results.body;
}

exports.paymentNow = async(req, res) => {
  if(!req.body.payPeriodId){
    return res.status(400).json({success: false, result: null, message: 'The field "pay_period_id" is required.', code: 400, errorCode: "REQUIRE_PAY_PERIOD_ID"});
  }

  let company = await CompanyModel.findById({_id: req.body.idCompany});

  if (company?.deduction_repayment_type === "DIRECT_DEBIT_AUTO_PAY" || req.body.isEmployer == 'true') {
    const body = {
      pay_period_id: req.body.payPeriodId
    };

    const response = await baseService.getInstance().post("/api/timesheets/makeDirectDebitRepayment", body, req.session.token, req);
    let resultBody = JSON.parse(response.body);
    if (resultBody.success) {
      socket.emit('repayment', {
        companyId: req.body.idCompany,
        payPeriodId: req.body.payPeriodId
      });
      socketHttp.emit('repayment', {
        companyId: req.body.idCompany,
        payPeriodId: req.body.payPeriodId
      });
    }
    return res.send(resultBody);
  } else if (company?.deduction_repayment_type === "DIRECT_DEBIT_BY_APPROVAL") {
    const body = {
      deduction_repayment_type: company.deduction_repayment_type,
      pay_period_id: req.body.payPeriodId
    };

    const response = await baseService.getInstance().post("/api/timesheets/requestDDRepaymentByApprove", body, req.session.token, req);
    const resultBody = JSON.parse(response.body);
    if (resultBody.success) {
      socket.emit('repayment', {
        companyId: req.body.idCompany,
        payPeriodId: req.body.payPeriodId
      });
      socketHttp.emit('repayment', {
        companyId: req.body.idCompany,
        payPeriodId: req.body.payPeriodId
      });
      resultBody.message = "Sent Payment Request successfully";
    }
    return res.send(resultBody);
  } else {
    return res.send({
      success: false,
      result: null,
      message: 'Payment failed.',
      code: 400
    });
  }
}

exports.addDirectDebit = async (req, res) => {
  const querySetting = await SettingModel.findOne();
  let account_number = await CommontController.encryptKeyClient(
    querySetting.encryption_key,
    req.body.accountNumber
  );
  let bsb = await CommontController.encryptKeyClient(
    querySetting.encryption_key,
    req.body.bsb
  );

  const body = {
    company_id: req.body.companyId,
    company_name: req.body.companyName,
    bank_account_name: req.body.nameOnAccount,
    bsb: bsb,
    account_number: account_number,
    authorized: req.body.authorized == 'true' ? true : false,
    time_off_set: req.body.timeOffset,
    bank_name: req.body.bankName ? req.body.bankName : null
  };

  if (req.body.bankId !== '0') {
    body["bank_id"] = req.body.bankId;
  }

  const response = await baseService.getInstance().post("/api/users/addFormDirectDebit", body, req.session.token, req);
  let resultBody = JSON.parse(response.body);
  if (resultBody.success) {
    resultBody.result.account_number = await CommontController.decryptionKeyClient(
      querySetting.encryption_key,
      resultBody.result.account_number
    );
    resultBody.result.bsb = await CommontController.decryptionKeyClient(
      querySetting.encryption_key,
      resultBody.result.bsb
    );
    socket.emit('action form DD', {
      action: req.body.action,
      companyId: req.body.companyId,
      result: resultBody.result
    });
    socketHttp.emit('action form DD', {
      action: req.body.action,
      companyId: req.body.companyId,
      result: resultBody.result
    });
  }
  return res.send(resultBody);
}

exports.getDirectDebitForm = async (req, res) => {
  const querySetting = await SettingModel.findOne();
  const url = `/api/users/getFormDirectDebit/${req.params.companyId}`
  const response = await baseService.getInstance().get(url, req.session.token, req);
  let resultBody = JSON.parse(response.body);
  if (resultBody && resultBody.result) {
    resultBody.result.account_number = await CommontController.decryptionKeyClient(
      querySetting.encryption_key,
      resultBody.body.accountNumber
    );
    resultBody.result.bsb = await CommontController.decryptionKeyClient(
      querySetting.encryption_key,
      resultBody.body.bsb
    );
  }
  return res.send(resultBody);
}

exports.createDirectDebitRequestFilePDF = async (req, res) => {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let form;
  const url = `/api/users/getFormDirectDebit/${req.body.companyId}`;
  const response = await baseService.getInstance().get(url, req.session.token, req);
  try {
    form = JSON.parse(response.body).result;
  } catch (error) {
    console.error(error);
  }

  const html = '';
  await page.setContent(html, {
    waitUntil: "domcontentloaded",
  });
  let base64data = (
    await page.pdf({
      margin: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30,
      },
      format: "a4",
    })
  ).toString("base64");
  await browser.close();
  return res.json({ code: 200, data: base64data, success: true });
}

exports.sendMailPayment = async (req, res) => {
  const body = {
    payRate: req.body.payRate,
    amount: req.body.amount,
    companyId: req.body.companyId,
    payPeriodId: req.body.payPeriodId
  };
  var date = new Date(req.body.endDate);
  date.setDate(date.getDate() + Number(req.body.date))
  let newDate = moment(date).format('YYYY-MM-DD');
  let dateString = moment(newDate + " " + req.body.timeMarkRePayment).format('DD/MM/YYYY HH:mm');
  let dateDb = moment(newDate + " " + req.body.timeMarkRePayment).format('YYYY-MM-DD HH:mm');
  body['dueOfPaymentString'] = dateString;
  body['dueOfPayment'] = dateDb;

  const url = `/api/timesheets/sendMailRepayment`;
  const response = await baseService.getInstance().post(url, body, req.session.token, req);
  let resultBody = JSON.parse(response.body);
  if (resultBody.success) {
    socket.emit('repayment', {
      companyId: req.body.companyId,
      payPeriodId: req.body.payPeriodId
    });
    socketHttp.emit('repayment', {
      companyId: req.body.companyId,
      payPeriodId: req.body.payPeriodId
    });
  }
  return res.send(resultBody);
}

exports.getDDHistories = async (req, res) => {
  const url = `/api/users/getFormDirectDebitHistories/${req.params.companyId}?page=${req.body.page}&pageSize=${req.body.pageSize}`;
  const response = await baseService.getInstance().get(url, req.session.token, req);
  return res.send(response.body);
}

exports.actionDDRequestForm = async(req, res) => {
  let status = "";
  if (req.body.action === "APPROVE" || req.body.action === "ADMIN_CANCEL") {
    if (req.session.user.is_admin) {
      status = req.body.action == "ADMIN_CANCEL" ? "CANCEL" : "APPROVE" ;
    } else {
      return res.send({success: false, result: null, message: 'You don\'t have permission to make this feature(Only admin).', code: 200});
    }
  } else {
    status = req.body.action;
  }

  const url = "/api/users/formDirectDebitAction";
  const response = await baseService.getInstance().post(url, {
    status: status,
    company_id: req.params.companyId
  }, req.session.token, req);

  const body = JSON.parse(response.body);
  if (body.success) {
    socket.emit('action form DD', {
      action: req.body.action == "ADMIN_CANCEL" ? "CANCEL" : req.body.action,
      companyId: req.params.companyId,
      result: body.result
    });
    socketHttp.emit('action form DD', {
      action: req.body.action == "ADMIN_CANCEL" ? "CANCEL" : req.body.action,
      companyId: req.params.companyId,
      result: body.result
    });
  }
  return res.send(body);
}

function convertMinuteToStringTime(minute) {
  let h = Math.floor(minute / 60);
  let m = minute % 60;
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  return `${h}:${m}`;
}

exports.getBSB = async (req, res) => {
  const url = `/api/bsb/australia${req.query.bsb ? "?bsb=" + req.query.bsb : ""}`;
  const response = await baseService.getInstance().get(url, req.session.token, req);
  return res.send(response.body);
} 