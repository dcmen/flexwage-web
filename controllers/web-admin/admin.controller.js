const UserModel = require("../../models/user");
const request = require("request");
const moment = require("moment");
const localhost = require("../../config/http");
const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const CURRENT_ENV = process.env.TYPE.toLowerCase();
const API_URL = `https://${CURRENT_ENV === "prod" ? '' : CURRENT_ENV + '.'}web.cashd.com.au`;

const commonController = require("../web-admin/commonController");
const userController = require("./user.controller");
const baseService = require("../../service/baseService");

exports.getAdmins = async (req, res) => {
  if (!req.session.user.is_admin) {
    res.redirect("/admin/dashboard");
  }
  let messages = req.flash("success");
  const listUsers = await UserModel.find({is_block: {$ne: 1}, $or: [{is_admin: 1}, {$and: [{is_admin: 0}, {is_admin_invitation_sent: true}]}]});

  return res.render("admin/table-admin", {
    title: "Admin Management",
    listUsers: listUsers,
    user: req.session.user,
    moment: moment,
    messages: messages ? messages : "",
    pageName: "admin-management",
    csrfToken: req.csrfToken(),
  });
};

exports.getCreateAdmin = async (req, res) => {
  if (!req.session.user.is_admin) {
    res.redirect("/admin/dashboard");
  }

  const token = req.session.token;
  const url = `/api/users/getGroups?keyword=&page=0&pageSize=100000`;
  const messages = req.flash("errors");
  const response = await baseService.getInstance().get(url ,token, req);
  let results = JSON.parse(response.body);
  return res.render("admin/create-admin", {
    title: "Create Manager",
    moment: moment,
    messages: messages ? messages : "",
    pageName: "create-manager",
    csrfToken: req.csrfToken(),
    countryCode: commonController.mobileCountryCode(),
    groups: results.result,
  });
};

exports.blockAdmin = async (req, res) => {
  const user = await UserModel.findById(mongoose.Types.ObjectId(req.params.id));
  await UserModel.update(
    { _id: mongoose.Types.ObjectId(req.params.id) },
    {
      $set: { is_active: user.is_active === 2 ? 1 : 2 },
    }
  );
  req.flash(
    "success",
    `${user.is_active == 1 ? "Blocked" : "UnBlocked"} successfully.`
  );
  res.redirect("/admin/admin-management");
};

exports.postCreateAdmin = async (req, res) => {
  // let acl = res.locals.acl;
  if (!req.session.user.is_admin) {
    return res.redirect("/admin/dashboard");
  }

  if (req.body.password !== req.body.confirmPassword) {
    req.flash("errors", "Password not match");
    return res.redirect("back");
  }

  if (req.body.mobile && req.body.mobile.toString().indexOf(0) === 0) {
    req.body.mobile = req.body.mobile.slice(1);
  }

  if (req.body.bypass_2fa == undefined) {
    req.body.bypass_2fa = "off";
  }

  let user = await UserModel.findOne({email: new RegExp("^" + req.body.email.toLowerCase() + "$", "i")});
  if (user) {
    req.flash("errors", "User existed.");
    return res.redirect("back");
  }

  const formDataObj = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    mobile: req.body.mobile,
    mobile_country_code: req.body.countryCode[0],
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
    password: req.body.password ? req.body.password : "",
    is_admin: 1,
    bypass_2fa: req.body.bypass_2fa,
    email: req.body.email
  };

  if (req.body.groupId == "0") {
    formDataObj.group_id = 0;
  } else {
    formDataObj.group_id = req.body.groupId;
  }

  let url = "/api/users/create";

  if (req.file && req.file.filename) {
    formDataObj.avatar = {
      value: fs.createReadStream(req.file.path),
      options: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      },
    };
  }

  const response = await baseService.getInstance().postFormData(url, formDataObj, req.session.token, req);
  const bodyParse = JSON.parse(response.body);
  if (req.file) {
    //Remove old image
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
  if (bodyParse.success) {
    if (bodyParse.result._id) {
      // acl.addUserRoles(bodyParse.result._id, req.body.role);
      req.flash("success", "Add successfully.");
      return res.redirect("/admin/admin-management");
    }
    return res.redirect("back");
  } else {
    req.flash("errors", bodyParse.messages);
    return res.redirect("back");
  }
};

exports.getEditAdmin = async (req, res) => {
  if (!req.session.user.is_admin) {
    res.redirect("/admin/dashboard");
  }
  const id = req.params.id;

  const user = await UserModel.findOne({
    $and: [
      { _id: mongoose.Types.ObjectId(id) },
      { _id: { $ne: mongoose.Types.ObjectId(req.session.user._id) } },
    ],
  });

  if (!user) {
    req.flash("errors", "User not found");
    return res.redirect("back");
  }
  const messages = req.flash("errors");
  res.render("admin/edit-admin", {
    title: "Edit Manager",
    admin: user,
    messages: messages ? messages : "",
    pageName: "edit-manager",
    csrfToken: req.csrfToken(),
    countryCode: commonController.mobileCountryCode(),
    url: API_URL,
  });
};

exports.postEditAdmin = async (req, res) => {
  if (!req.session.user.is_admin) {
    return res.redirect("/admin/dashboard");
  }

    const id = req.params.id;
    const user = await UserModel.findOne({
        $and: [
            { _id: mongoose.Types.ObjectId(id) },
            { _id: { $ne: mongoose.Types.ObjectId(req.session.user._id) } }
        ]
    });
    if (!user) {
        req.flash('errors', 'User not found');
        return res.redirect('back');
    }
    if (req.body.mobile && req.body.mobile.toString().indexOf(0) === 0) {
        req.body.mobile = req.body.mobile.slice(1);
    }
    if (req.body.bypass_2fa == undefined) {
        req.body.bypass_2fa = "off";
    }

  const url = "/api/users/updateManager";

  const formDataObj = {
    _id: id,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    mobile: req.body.mobile,
    mobile_country_code: req.body.countryCode[1],
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
    bypass_2fa: req.body.bypass_2fa,
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

  const response = await baseService.getInstance().postFormData(url, formDataObj, req.session.token, req);
  const body = JSON.parse(response.body);
  if (req.file) {
    //Remove old image
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
  if (body.success) {
    req.flash("success", "Edited successfully.");
    return res.redirect("/admin/admin-management");
  } else {
    req.flash("errors", body.message);
    return res.redirect("back");
  }
};

exports.createAdminPassword = async (req, res) => {
  let password = req.body.newPassword
  const passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");

  const url = "/api/users/createAdminPassword";
  const body = {
    activation_code: req.body.activationCode,
    new_password: passwordHash,
  };

  const response = await baseService.getInstance().post(url, body, null, req);
  let resp = JSON.parse(response.body);
  if (resp.success) {
    let email = resp.result.email;
    var tz = req.body.time_offset; // Math.abs(dt.getTimezoneOffset()) * 60 * 1000;
    let deviceId;
    // check device id
    if (req.body.device_token != "") {
      deviceId = req.body.device_token.slice(0, 22);
      req.session.device_token = req.body.device_token;
    } else {
      deviceId = crypto.randomBytes(22).toString("hex");
    }

    const body2 = {
      email: email,
      password: passwordHash,
      device_id: deviceId,
      time_offset: tz,
    };
    const response2 = await baseService.getInstance().post("/api/users/createAdminPassword", body2, null, req);
    let data = JSON.parse(response2.body);
    if (!data.success) {
      return res.send(response2.body);
    } else {
      req.session.countryCode = commonController.mobileCountryCode();
      req.session.token = data.result.token;
      req.session.refresh_token = data.result.refresh_token;
      req.session.device_id = deviceId;
      const token = data.result.token.replace("JWT ", "");
      var decoded = jwt.decode(token, { complete: true });

      if (decoded.payload.is_admin) {
        req.session.role = "Admin";
        req.session.user = decoded.payload;
        if (!req.session.user.is_active) {
          return res.send({success: false, result: null, message: "Your account has been disabled from CashD, you no longer have access. For any queries, please send an email to support@cashd.com.au.", code: 400});
        }
        if (req.session.user.avatar_path) {
          req.session.user.avatar_path = `${req.session.user.avatar_path}`;
        }
        req.session.isLoggedIn = true;
        return req.session.save((err) => {
          if (err) console.log(err);
          return res.send({success: true, result: null, code: 200});
        });
      } else {
        return res.send({success: false, result: null, message: "Email or password incorrect. Please re-enter new information.", code: 400});
      }
    }
  } else {
    return res.send(response.body);
  }
};
