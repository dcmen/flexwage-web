const moment = require("moment");
var ObjectID = require("mongodb").ObjectID;
const mongoose = require("mongoose");
var fs = require("fs");
const localhost = require("../../config/http");
const request = require("request");
const path = require("path");
const Excel = require("exceljs");

const StaffModel = require("../../models/staff");
const CompanyModel = require("../../models/company");
const UserModel = require("../../models/user");
const UnregisteredStaffModel = require("../../models/keypay/unregistered_staff");
const SuburbModel = require("../../models/suburb");
const StateModel = require("../../models/state");
const CountryModel = require("../../models/country");
const commonController = require('../web-admin/commonController');
const GroupModel = require('../../models/group');
const CURRENT_ENV = process.env.TYPE.toLowerCase();
const API_URL = `https://${CURRENT_ENV === "prod" ? '' : CURRENT_ENV + '.'}web.cashd.com.au`;
const baseService = require("../../service/baseService");

exports.getStaffs = async (req, res) => {
  let listUsers = [],
    messages = req.flash("success");
  if (req.session.role !== "Admin") {
    let companyIds = req.session.companyIds.map(item => mongoose.Types.ObjectId(item));
    const result = await StaffModel.aggregate([
      {
        $match: {company_id: {$in: companyIds}},
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $match: { "user.is_block": { $ne: 1 }, "user.is_admin": { $ne: 1 }, "user.is_admin_invitation_sent": { $nin: [true] }}},
      { $unwind: "$user" },
    ]);
    result.forEach((item) => {
      listUsers.push(item.user);
    });
  } else {
    listUsers = await UserModel.find({
      $and: [{ is_block: { $ne: 1 } }, { is_admin: { $ne: 1 } }],
    });
  }

  res.render("staff/table-staff", {
    title: "Staff Management",
    listUsers: listUsers,
    moment: moment,
    messages: messages,
    pageName: "staff-management",
    csrfToken: req.csrfToken(),
  });
};

exports.getStaff = async (req, res) => {
  const messages = req.flash("errors");
  const userId = req.params.id;
  const user = await UserModel.findOne({ _id: userId });
  let country, state, suburb;

  user.mobile = user.mobile.replace("+" + user.mobile_country_code, "");

  if (user.address_country_id != null && user.address_country_id != 0) {
    country = await CountryModel.findOne({ id_key: user.address_country_id });
  }
  if (user.address_line_state_id != null && user.address_line_state_id != 0) {
    state = await StateModel.findOne({ id_key: user.address_line_state_id });
  }
  if (user.address_line_suburb_id != null && user.address_line_suburb_id != 0) {
    suburb = await SuburbModel.findOne({ _id: user.address_line_suburb_id });
  }
  user._doc.country = country != null ? country.name : null;
  user._doc.state = state != null ? state.iso2 : null;
  user._doc.suburb = suburb != null ? suburb.name : null;

  res.render("staff/edit-staff", {
    title: "Edit Staff",
    staff: user,
    moment: moment,
    messages: messages,
    pageName: "staff-management",
    csrfToken: req.csrfToken(),
    url: API_URL,
    countryCode: commonController.mobileCountryCode()
  });
};

exports.postStaff = async (req, res) => {
  const staff = await StaffModel.findOne({ user_id: req.params.id });
  const url = localhost.API_HTTPS + "/api/users";

  if (req.body.mobile.toString().indexOf(0) == 0) {
    req.body.mobile = req.body.mobile.slice(1);
  }
  const formDataObj = {
    staff_id: staff._id.toString(),
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    mobile: "+" + req.body.countryCode[1] + req.body.mobile,
    mobile_country_code: req.body.countryCode[1],
    // 'address': req.body.address,
    address_line_1: req.body.address_line_1 ? req.body.address_line_1 : "",
    address_line_2: req.body.address_line_2 ? req.body.address_line_2 : "",
    address_line_3: req.body.address_line_3 ? req.body.address_line_3 : "",
    address_line_city: req.body.address_line_city
      ? req.body.address_line_city
      : "",
    address_line_suburb_id: req.body.address_line_suburb_id
      ? req.body.address_line_suburb_id
      : "",
    address_line_state_id: req.body.address_line_state_id
      ? req.body.address_line_state_id
      : "",
    address_country_id: req.body.address_country_id
      ? req.body.address_country_id
      : "",
    postcode: req.body.postcode ? req.body.postcode : "",
  };
  if (req.file && req.file.filename) {
    formDataObj.avatar = {
      value: fs.createReadStream(req.file.path),
      options: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      },
    };
  }
  const options = {
    url,
    headers: {
      Authorization: req.session.token,
    },
    formData: formDataObj,
  };
  request.post(options, function (error, response, body) {
    if (error) return console.error("error:", error); // Print the error if one occurred
    if (req.file) {
      //Remove old image
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    const bodyParse = JSON.parse(body);
    if (bodyParse.success) {
      req.flash("success", "Edited successfully.");
      res.redirect("/admin/staff-management");
    } else {
      req.flash("errors", "Edit user staff failed");
      res.redirect("back");
    }
  });
};

exports.getWatchStaff = async (req, res) => {
  const { id } = req.params;
  const queryUser = UserModel.findOne({ _id: id });
  var country = null,
    state = null,
    suburb = null;

  const queryStaffs = StaffModel.aggregate([
    {
      $lookup: {
        from: "companies",
        localField: "company_id",
        foreignField: "_id",
        as: "company",
      },
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
    { $unwind: "$company" },
    {
      $match: {
        user_id: mongoose.Types.ObjectId(id),
      },
    },
  ]);

  const [user, staffs] = await Promise.all([queryUser, queryStaffs]);

  if (user.address_country_id != null && user.address_country_id != 0) {
    country = await CountryModel.findOne({
      id_key: user.address_country_id,
    });
  }
  if (user.address_line_state_id != null && user.address_line_state_id != 0) {
    state = await StateModel.findOne({
      id_key: user.address_line_state_id,
    });
  }
  if (user.address_line_suburb_id != null && user.address_line_suburb_id != 0) {
    suburb = await SuburbModel.findOne({
      _id: user.address_line_suburb_id,
    });
  }
  user._doc.country = country != null ? country.name : null;
  user._doc.state = state != null ? state.ios2 : null;
  user._doc.suburb = suburb != null ? suburb.name : null;
  let address =
    user.address_line_1 != null ? user.address_line_1 + " " : ''  +
    user.address_line_2 != null ? user.address_line_2 + " " : '' +
    (country?.id_key == 14 ? ( user._doc.suburb != null ? user._doc.suburb + " " : '' )  : (user.address_line_city != null ? user.address_line_city + " " :  '')) +
    user._doc.state != null ? user._doc.state : '' +
    user.postcode != null ? user.postcode + " " : '' +
    user._doc.country != null ? user._doc.country + "" : '' ;
  user._doc.address = address;

  res.render("staff/watch-staff", {
    title: "Watch Staff",
    staffs: staffs,
    moment,
    userCashD: user,
    pageName: "staff-management",
    url: API_URL,
    csrfToken: req.csrfToken(),
  });
};

exports.blockUser = async (req, res) => {
  await UserModel.update(
    { _id: req.params.id },
    {
      $set: { is_block: 1 },
    }
  );
  req.flash("success", "Blocked successfully.");
  res.redirect("/admin/staff-management");
};

exports.getBlockUsers = async (req, res) => {
  let listUsers = [],
    messages = req.flash("success");
  if (req.session.role !== "Admin") {
    let companyIds = req.session.companyIds.map(item => mongoose.Types.ObjectId(item));
    const result = await StaffModel.aggregate([
      {
        $match: {company_id: {$in: companyIds}},
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $match: { "user.is_block": 1 } },
      { $unwind: "$user" },
    ]);
    result.forEach((item) => {
      listUsers.push(item.user);
    });
  } else {
    listUsers = await UserModel.find({ is_block: 1 });
  }

  res.render("staff/block-user", {
    title: "Unblock User",
    listUsers: listUsers,
    moment: moment,
    messages: messages,
    pageName: "block-user",
    csrfToken: req.csrfToken(),
  });
};

exports.unBlockUser = async (req, res) => {
  await UserModel.update(
    { _id: req.params.id },
    {
      $set: { is_block: 0 },
    }
  );
  req.flash("success", "Unblocked successfully.");
  // res.locals.message = req.flash();
  res.redirect("/admin/block-user");
};

exports.inviteStaff = async (req, res) => {
  //get token
  const token = req.session.token;
  let url = `/api/users/sendInvitationsToEmployee`;
  const dataStaffInvited = JSON.parse(req.body.dataStaffInvited);

  const data = {
    system_cashd_code: dataStaffInvited.systemCode,
    system_company: dataStaffInvited.company,
    system_employees_list: dataStaffInvited.staffList,
    invite_all: dataStaffInvited.statusInvite,
  };

  const response = await baseService.getInstance().post(url, data, token, req);
  return res.send(response.body);
};

exports.getRegisterStaff = async (req, res) => {
  const idCompany = req.body.company_id;
  const companyBrandId = req.body.companyBrandId;
  var page = +req.body.page,
    pageSize = +req.body.pageSize;
  let totalRegisterStaffsPromise, query, staffsPromise;
  if (companyBrandId) {
    query = {
      $and: [
        { company_id: mongoose.Types.ObjectId(idCompany) },
        {
          $or: [{ company_brand_id: mongoose.Types.ObjectId(companyBrandId) }],
        },
      ],
    };
  } else {
    var array = [
      { company_id: mongoose.Types.ObjectId(idCompany) },
      {
        $or: [
          { fullname: new RegExp(req.body.searchKey, "i") },
          { email: new RegExp(req.body.searchKey, "i") },
          { phone: new RegExp(req.body.searchKey, "i") },
        ],
      },
    ];
    if (req.body.isActive == 1 || req.body.isActive == 2) {
      array = [...array, { is_active: +req.body.isActive }];
    }
    query = { $and: array };
  }

  let sort;
  if (!req.body.isSetUpPayPeriods) {
    if (req.body["order[0][dir]"] == "asc") {
      if (req.body["order[0][column]"] == "1") {
        sort = { first_name: 1 };
      } else {
        sort = { last_name: 1 };
      }
    } else {
      if (req.body["order[0][column]"] == "1") {
        sort = { first_name: -1 };
      } else {
        sort = { last_name: -1 };
      }
    }
  } else {
    sort = { created_date: 1 };
  }
  const registeredStaffsPromise = StaffModel.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "keypay_locations",
        let: { keypay_location_ids: "$keypay_location_ids" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ["$_id", "$$keypay_location_ids"],
                  },
                ],
              },
            },
          },
        ],
        as: "keypay_locations",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "pay_period_originations",
        localField: "pay_period_origination_id",
        foreignField: "_id",
        as: "pay_period_originations",
      },
    },
    {
      $lookup: {
        from: "keypay_pay_schedules",
        localField: "keypay_pay_schedule_id",
        foreignField: "_id",
        as: "keypay_pay_schedules",
      },
    },
    {
      $lookup: {
        from: "xero_pay_calendars",
        localField: "xero_pay_calendar_id",
        foreignField: "_id",
        as: "xero_pay_calendars",
      },
    },
    {
      $lookup: {
        from: "business_units",
        localField: "business_unit_id",
        foreignField: "_id",
        as: "business_units",
      },
    },
    { $unwind: "$user" },
    { $sort: sort },
    { $skip: page * pageSize },
    { $limit: pageSize },
  ]);
  const currentStaffPromise = StaffModel.findOne({
    user_id: req.session.user._id,
  });
  if (page === 0) {
    totalRegisterStaffsPromise = StaffModel.aggregate([
      { $match: query },
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
          ids: { $push: "$_id" },
        },
      },
    ]);
    if (req.body.isSetUpPayPeriods) {
      staffsPromise = StaffModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "pay_period_originations",
            localField: "pay_period_origination_id",
            foreignField: "_id",
            as: "pay_period_originations",
          },
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
          $group: {
            _id: null,
            ids: {
              $push: {
                $cond: [
                  { $arrayElemAt: ["$pay_period_originations", 0] },
                  "$$REMOVE",
                  "$_id",
                ],
              },
            },
          },
        },
      ]);
    }
  }
  const [registeredStaffs, currentStaff, totalRegisterStaffs, staffs] =
    await Promise.all([
      registeredStaffsPromise,
      currentStaffPromise,
      totalRegisterStaffsPromise,
      staffsPromise,
    ]);
  return res.send(
    JSON.stringify({
      result: registeredStaffs,
      totalItems:
        totalRegisterStaffs?.length > 0 ? totalRegisterStaffs[0].count : 0,
      currentStaff: currentStaff,
      staffIds: staffs?.length > 0 ? staffs[0].ids : [],
    })
  );
};

exports.changeRole = async (req, res) => {
  const staffId = req.params.id,
    role = req.body.role;
  await StaffModel.findOneAndUpdate({ _id: staffId }, { role: role });
  return res.send({success: true, result: null});
};

exports.getUnregisterStaff = async (req, res) => {
  const idCompany = req.body.company_id;
  var page = +req.body.page,
    pageSize = +req.body.pageSize;
  const query = {
    $and: [
      { company_id: mongoose.Types.ObjectId(idCompany) },
      {
        $or: [
          { fullname: new RegExp(req.body.searchKey, "i") },
          { email: new RegExp(req.body.searchKey, "i") },
          { phone: new RegExp(req.body.searchKey, "i") },
        ],
      },
    ],
  };

  if (req.body.startDate && req.body.startDate !== "") {
    query.$and.push({start_date: { $gte: req.body.startDate +'T00:00:00', $lte: req.body.endDate +'T23:59:59'}});
  }

  let matchInvited = {};

  let sort;
  if (req.body["order[0][dir]"] == "asc") {
    if (req.body["order[0][column]"] == "1") {
      sort = { first_name: 1 };
    } else {
      sort = { last_name: 1 };
    }
  } else {
    if (req.body["order[0][column]"] == "1") {
      sort = { first_name: -1 };
    } else {
      sort = { last_name: -1 };
    }
  }

  if (req.body.is_invited == 1) {
    matchInvited = { is_invited: 1 };
  }

  const unregisteredStaffsPromise = UnregisteredStaffModel.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "keypay_locations",
        let: { keypay_location_ids: "$keypay_location_ids" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ["$_id", "$$keypay_location_ids"],
                  },
                ],
              },
            },
          },
        ],
        as: "keypay_locations",
      },
    },
    { $sort: sort },
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
    { $match: matchInvited },
    { $skip: page * pageSize },
    { $limit: pageSize },
  ]);

  let totalUnRegisteredStaffsPromise = [];
  if (page == 0) {
    totalUnRegisteredStaffsPromise = UnregisteredStaffModel.aggregate([
      { $match: query },
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
      { $match: matchInvited },
    ]);
  }

  const [unregisteredStaffs, totalUnRegisteredStaffs] = await Promise.all([
    unregisteredStaffsPromise,
    totalUnRegisteredStaffsPromise,
  ]);

  return res.send(
    JSON.stringify({
      result: unregisteredStaffs,
      recordsTotal: totalUnRegisteredStaffs.length,
      recordsFiltered: totalUnRegisteredStaffs.length,
    })
  );
};

function deleteImg(path) {
  try {
    fs.unlink(path, (err) => {
      if (err) console.log("Couldn't delete" + path + "image");
    });
  } catch (error) {
    console.log(error);
  }
}

exports.sentPayPeriod = async (req, res) => {
  const parseData = JSON.parse(req.body.data);
  const staffIdArr = parseData.staffIdArr;
  const payPeriodId = parseData.payPeriodId;

  const convertObjectIdArr = staffIdArr.map(function (id) {
    return mongoose.Types.ObjectId(id);
  });

  const result = await StaffModel.update(
    { _id: { $in: convertObjectIdArr } },
    {
      $set: { pay_period_origination_id: mongoose.Types.ObjectId(payPeriodId) },
    },
    { multi: true }
  );

  return res.send(result);
};

exports.savePayCycle = async (req, res) => {
  const staffId = req.body.staffId;
  const result = await StaffModel.update(
    { _id: staffId },
    {
      $set: {
        pay_period_origination_id: req.body.payPeriodId,
      },
    }
  );
  return res.send(result);
};

exports.getListStaffInvite = async (req, res) => {
  let list = JSON.parse(req.body.match_by_list);
  var page = +req.body.page,
    pageSize = +req.body.pageSize;
  if (list) {
    let query;

    if (req.body.isHudson == 'true' && list.length > 0) {
      let employeesUnregistered = [];
      let totalEmployeesRegistered = 0;

      for(let m = 0;  m < list.length; m+=10) {
        let itemTask = list.slice(m, m + 10).map(async item => {
          query = {
            $and: [
              { company_id: mongoose.Types.ObjectId(req.body.company_id) },
              { system_employee_id: item['Payroll Employee ID'] || "" }
            ],
          };
          const totalEmployeesRegisteredPromise = await StaffModel.countDocuments(query);

          if (totalEmployeesRegisteredPromise == 0)  {
            const newItem = {
              company_id: req.body.company_id,
              first_name: item['First Name'],
              last_name: item['Last Name'],
              fullname: `${item['First Name']} ${item['Last Name']}`,
              email: item['Email'],
              mobile: item['Mobile Phone'] || "",
              system_user_id: "",
              system_employee_id: item['Payroll Employee ID'],
              business_unit: item['Business Unit'],
              salary_wag: 2
            };
            employeesUnregistered.push(newItem);
          } else {
            totalEmployeesRegistered += totalEmployeesRegisteredPromise; 
          }
        })
        await Promise.all(itemTask)
      }

      employeesUnregistered.sort(compareValues("fullname"));

      let newEmployees = [...employeesUnregistered];
      let employeeUnregisteredInPage = newEmployees.splice(page * pageSize, pageSize);     
      return res.send(
        JSON.stringify({
          result: employeeUnregisteredInPage,
          totalItems: employeesUnregistered.length,
          totalEmployeesRegistered,
          allStaffUnregistered: employeesUnregistered,
        })
      );
    } else {
      let regex = list.map(function (e) { return new RegExp(e +"$", "i"); });
      query = {
        $and: [
          { company_id: mongoose.Types.ObjectId(req.body.company_id) },
          { email: { $in: regex } },
        ],
      };

      const staffUnregisteredPromise = UnregisteredStaffModel.aggregate([
        {
          $match: query,
        },
        { $sort: { fullname: 1 } },
        { $skip: page * pageSize },
        { $limit: pageSize },
      ]);
  
      const allStaffUnregisteredPromise = UnregisteredStaffModel.aggregate([
        {
          $match: query,
        },
      ]);
  
      const employeesRegisteredPromise = StaffModel.aggregate([
        {
          $match: query,
        }
      ]);
  
      const totalUnRegisterdStaffsPromise = UnregisteredStaffModel.countDocuments(query);
  
      const [staffUnregistered, totalStaffs, allStaffUnregistered, employeesRegistered] =
        await Promise.all([
          staffUnregisteredPromise,
          totalUnRegisterdStaffsPromise,
          allStaffUnregisteredPromise,
          employeesRegisteredPromise
        ]);
  
      return res.send(
        JSON.stringify({
          result: staffUnregistered,
          totalItems: totalStaffs,
          totalEmployeesRegistered: employeesRegistered.length,
          allStaffUnregistered,
          employeesRegistered
        })
      );
    }

  } else {
    return res.send(JSON.stringify({ result: [], totalItems: 0, totalEmployeesRegistered: 0}));
  }
};

exports.changeStatusStaffs = async (req, res) => {
  const staffs = JSON.parse(req.body.staffList);
  const action = req.body.action;
  if (staffs) {
    staffs.forEach(async (item) => {
      await StaffModel.findByIdAndUpdate(item._id, { is_active: action });
    });
  }
  return res.send({ success: true, result: [] });
};

exports.exportDataStaffRegistered = async (req, res) => {
  const idCompany = req.body.company_id;
  let query;

  var array = [
    { company_id: mongoose.Types.ObjectId(idCompany) },
    {
      $or: [
        { fullname: new RegExp(req.body.searchKey, "i") },
        { email: new RegExp(req.body.searchKey, "i") },
        { phone: new RegExp(req.body.searchKey, "i") },
      ],
    },
  ];
  if (req.body.isActive == 1 || req.body.isActive == 2) {
    array = [...array, { is_active: +req.body.isActive }];
  }
  query = { $and: array };

  const registeredStaffs = await StaffModel.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "keypay_locations",
        let: { keypay_location_ids: "$keypay_location_ids" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ["$_id", "$$keypay_location_ids"],
                  },
                ],
              },
            },
          },
        ],
        as: "keypay_locations",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "pay_period_originations",
        localField: "pay_period_origination_id",
        foreignField: "_id",
        as: "pay_period_originations",
      },
    },
    {
      $lookup: {
        from: "keypay_pay_schedules",
        localField: "keypay_pay_schedule_id",
        foreignField: "_id",
        as: "keypay_pay_schedules",
      },
    },
    {
      $lookup: {
        from: "xero_pay_calendars",
        localField: "xero_pay_calendar_id",
        foreignField: "_id",
        as: "xero_pay_calendars",
      },
    },
    { $unwind: "$user" },
    { $sort: { fullname: 1 } },
  ]);
  const bodyTable = [];
  if (registeredStaffs?.length > 0) {
    registeredStaffs.forEach((item, index) => {
      let cell = {
        no: index + 1,
        firstName: item.first_name ? item.first_name : "N/A",
        lastName: item.last_name ? item.last_name : "N/A",
        email: item.email,
        employmentType:
          item.is_allow_login_other_system === 1
            ? "Employer"
            : item.role == "SUPERVISOR"
            ? "Supervisor"
            : "Employee",
        employeeType: checkSalaryWag(req.body.systemCode, item.salary_wag),
        scheduleName: getScheduleName(req.body.systemCode, item),
        suburb: item.suburb ? item.suburb : "N/A",
        startDate: item.start_date
          ? moment(item.start_date).format("DD-MM-YYYY")
          : "N/A",
      };
      bodyTable.push(cell);
    });
    // create data excel
    const header = [
      "#",
      "First Name",
      "Last Name",
      "Email",
      "Employment Type",
      "Pay Type",
      "Schedule Name",
      "Suburb",
      "Start Date",
    ];
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");

    // Title
    worksheet.mergeCells("A1:I1");
    worksheet.getCell("A1").value = "List Of Registered Staff Members";
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
    bodyTable.forEach((item) => {
      worksheet.getCell(`A${number}`).value = item.no;
      worksheet.getCell(`A${number}`).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getCell(`B${number}`).value = item.firstName;
      worksheet.getCell(`C${number}`).value = item.lastName;
      worksheet.getCell(`D${number}`).value = item.email;
      worksheet.getCell(`E${number}`).value = item.employmentType;
      worksheet.getCell(`F${number}`).value = item.employeeType;
      worksheet.getCell(`G${number}`).value = item.scheduleName;
      worksheet.getCell(`H${number}`).value = item.suburb;
      worksheet.getCell(`I${number}`).value = item.startDate;
      number++;
    });

    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(2).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(3).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(4).width = 40;
    worksheet.getColumn(4).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(5).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(6).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(7).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(8).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(9).alignment = {
      vertical: "middle",
      horizontal: "left",
    };

    worksheet.getRow(1).height = 50;
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    headerRow.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    workbook.xlsx.writeBuffer().then((data) => {
      let base64data = data.toString("base64");
      return res.json({ code: 200, data: base64data, success: true });
    });
  } else {
    return res.json({ code: 202, data: [], success: false });
  }
};

exports.exportDataStaffInvited = async (req, res) => {
  const idCompany = req.body.company_id;
  let match = { is_invited: 1 };
  const query = {
    $and: [
      { company_id: mongoose.Types.ObjectId(idCompany) },
      {
        $or: [
          { fullname: new RegExp(req.body.searchKey, "i") },
          { email: new RegExp(req.body.searchKey, "i") },
          { phone: new RegExp(req.body.searchKey, "i") },
        ],
      },
    ],
  };
  if (req.body.isAll == "ALL") {
    match = {};
  }
  if (req.body.startDate && req.body.startDate !== "") {
    query.$and.push({start_date: { $gte: req.body.startDate +'T00:00:00', $lte: req.body.endDate +'T23:59:59'}});
  }
  const unregisteredStaffs = await UnregisteredStaffModel.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "keypay_locations",
        let: { keypay_location_ids: "$keypay_location_ids" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ["$_id", "$$keypay_location_ids"],
                  },
                ],
              },
            },
          },
        ],
        as: "keypay_locations",
      },
    },
    { $sort: { fullname: 1 } },
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
    { $match: match },
  ]);
  let bodyTable = [];
  if (unregisteredStaffs?.length > 0) {
    unregisteredStaffs.forEach((item, index) => {
      let cell = {
        no: index + 1,
        firstName: item.first_name ? item.first_name : "N/A",
        lastName: item.last_name ? item.last_name : "N/A",
        email: item.email,
        employmentType: "Employee",
        employeeType: checkSalaryWag(req.body.systemCode, item.salary_wag),
        suburb: item.suburb ? item.suburb : "N/A",
        startDate: item.start_date
          ? moment(item.start_date).format("DD-MM-YYYY")
          : "N/A",
      };
      bodyTable.push(cell);
    });
    // create data excel
    const header = [
      "#",
      "First Name",
      "Last Name",
      "Email",
      "Employment Type",
      "Pay Type",
      "Suburb",
      "Start Date",
    ];
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");

    // Title
    worksheet.mergeCells("A1:H1");
    worksheet.getCell("A1").value = "List Of Registered Staff Members";
    worksheet.getCell("A1").font = {
      size: 16,
      bold: true,
      color: { argb: "0073e6" },
      name: "Times New Roman",
    };
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
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
    bodyTable.forEach((item) => {
      worksheet.getCell(`A${number}`).value = item.no;
      worksheet.getCell(`A${number}`).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getCell(`B${number}`).value = item.firstName;
      worksheet.getCell(`C${number}`).value = item.lastName;
      worksheet.getCell(`D${number}`).value = item.email;
      worksheet.getCell(`E${number}`).value = item.employmentType;
      worksheet.getCell(`F${number}`).value = item.employeeType;
      worksheet.getCell(`G${number}`).value = item.suburb;
      worksheet.getCell(`H${number}`).value = item.startDate;
      number++;
    });

    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(2).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(3).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(4).width = 40;
    worksheet.getColumn(4).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(5).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(6).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(7).alignment = {
      vertical: "middle",
      horizontal: "left",
    };
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(8).alignment = {
      vertical: "middle",
      horizontal: "left",
    };

    worksheet.getRow(1).height = 50;

    headerRow.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    workbook.xlsx.writeBuffer().then((data) => {
      let base64data = data.toString("base64");
      return res.json({ code: 200, data: base64data, success: true });
    });
  } else {
    return res.json({ code: 202, data: [], success: false });
  }
};

exports.paySetUp = async (req, res) => {
  let days = req.body.working_days_of_week;
  let rawData = {
    company_id: req.body.company_id,
    system_employee_id: req.body.system_employee_id,
    working_days_of_week: JSON.parse(days),
    weeks_checking_payslip_history: req.body.weeks_checking_payslip_history
  };
  if (req.body.time_accrue_wages) {
    rawData.time_accrue_wages = Number(req.body.time_accrue_wages);
  }
  const url = "/api/users/changeSettingForEmployee";
  const token = req.session.token;
  const response = await baseService.getInstance().post(url, rawData, token, req);
  return res.send(JSON.parse(response.body));
}

exports.staffSupport = async(req, res) => {
  const url = "/api/users/changeInternalSupport";
  const token = req.session.token;
  const body = {
    is_support: req.body.is_support,
    owner_staff_id: req.body.owner_staff_id
  };

  const response = await baseService.getInstance().post(url, body, token, req);
  return res.send(JSON.parse(response.body));
}

function checkSalaryWag(systemCode, salaryWag) {
  let employeeType;
  if (systemCode === "DEPUTY") {
    employeeType = "Timesheet";
  } else {
    if (salaryWag === 2) {
      employeeType = "Timesheet";
    } else if (salaryWag === 3) {
      employeeType = "Salary & TimeSheet";
    } else {
      employeeType = "Salary";
    }
  }
  return employeeType;
}

function getScheduleName(systemCode, item) {
  let scheduleName;
  if (systemCode == "DEPUTY") {
    scheduleName =
      item.pay_period_originations.length > 0
        ? item.pay_period_originations[0].name
        : "N/A";
  } else if (systemCode == "KEYPAY") {
    scheduleName =
      item.keypay_pay_schedules.length > 0
        ? item.keypay_pay_schedules[0].name
        : "N/A";
  } else {
    scheduleName =
      item.xero_pay_calendars.length > 0
        ? item.xero_pay_calendars[0].Name
        : "N/A";
  }
  return scheduleName;
}

//function sort
function compareValues(key, order = 'asc') {
  return function(a, b) {
    if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      return 0;
    }

    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order == 'desc') ? (comparison * -1) : comparison
    );
  };
}
