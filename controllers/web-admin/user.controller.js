require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Customer = require('../../models/user');
const CompanyModel = require('../../models/company');
const StaffModel = require('../../models/staff');
const PayPeriod = require('../../models/pay_period');
const Helper = require('../../helpers/helper');
const fs = require('fs');
const config = require('../../config/config');
const localhost = require('../../config/http');
var request = require('request');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const mongoose = require('mongoose');
const crypto = require('crypto');
const UserLogModel = require("../../models/user_log");
const moment = require('moment');
var querystring = require('querystring');
const commonController = require('./commonController');
const { socket, socketHttp } = require("../web-admin/socket");
const baseService = require("../../service/baseService");

exports.getRegister = async (req, res) => {
    let messages = req.flash('error');
    if (messages.length > 0) {
        messages = messages[0];
    } else {
        messages = null;
    }
    return res.render('login/register', {
        title: 'CashD Register',
        messages,
    });
}

exports.postRegister = async (req, res) => {
    const password = req.body.password;
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');
    const url = "/api/register";
    const body = {...req.body, password: passwordHash};
    const response = await baseService.getInstance().post(url, body, null, req);
    const result = JSON.parse(response.body);
    if (result?.success) {
        return res.redirect("/console/login");
    } else {
        req.flash('error', result.message);
        return res.redirect("/console/register");
    }
}

exports.getLogin = async (req, res) => {
    let messages = req.flash('error');
    if (messages.length > 0) {
        messages = messages[0];
    } else {
        messages = null;
    }
    const redirect_uri = req.query.redirect_uri;
    const client_id = req.query.client_id;
    const response_type = req.query.response_type;
    req.session.redirect_uri = redirect_uri;
    req.session.client_id = client_id;
    req.session.response_type = response_type;
    return res.render('login/index', {
        title: 'Log in',
        errorMessage: messages,
        isLoginCashD: client_id && redirect_uri ? true : false
    });
}

exports.postLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');
    //var dt = new Date();
    var tz = req.body.time_offset;// Math.abs(dt.getTimezoneOffset()) * 60 * 1000;
    const url = "/api/login";
    const body = req.session.client_id ? {
        "email": email,
        "password": passwordHash,
        "time_offset": tz,
        client_id: req.session.client_id
    } : {"email": email, "password": passwordHash, "time_offset": tz};
    const response = await baseService.getInstance().post(url, body, null, req);
    const data = JSON.parse(response.body);
    if (req.session.redirect_uri) {
        var client = req.session.client_id;
        if (!client) {
            req.flash('error', "Sorry, we couldn't log you in with those details.");
            return res.redirect(`/login?redirect_uri=${req.session.redirect_uri}&response_type=${req.session.response_type}&client_id=${req.session.client_id}`);
        } else {
            if (data.code == 200) {
                if (data.result && data.result.staffs && data.result.staffs.length > 0) {
                    req.session.staffs = data.result.staffs;
                    req.session.client = data.result.client;
                    req.session.user_id = data.result.user_id;
                    return res.redirect(`/my/login?redirect_uri=${req.session.redirect_uri}&response_type=${req.session.response_type}&client_id=${req.session.client_id}`);
                } else {
                    req.flash('error', "Sorry, we couldn't log you in with those details.");
                    return res.redirect(`/login?redirect_uri=${req.session.redirect_uri}&response_type=${req.session.response_type}&client_id=${req.session.client_id}`);
                }
            } else {
                req.flash('error', "Sorry, we couldn't log you in with those details.");
                return res.redirect(`/login?redirect_uri=${req.session.redirect_uri}&response_type=${req.session.response_type}&client_id=${req.session.client_id}`);
            }
        }
    } else {
        if (data.success) {
            var decoded = jwt_decode(data.result.token);
            req.session.token = data.result.token;
            req.session.user_id = decoded._id;
            req.session.save();
            return res.redirect('/oauth/clients');
        } else {
            req.flash('error', "Sorry, we couldn't log you in with those details.");
            return res.redirect('/console/login');
        }
    }
}

exports.getChooseStaff = async (req, res) => {
    return res.render('login/choose-staff', {
        title: "CashD - OAuth",
        staffs: req.session.staffs,
        client: req.session.client,
    });
}

exports.postChooseStaff = async (req, res) => {
    if (req.body.is_cancel == 1) {
        return res.redirect(`${req.session.redirect_uri}`);
    } else {
        const url = "/api/code";
        const body = {
            "client_id": req.session.client._id,
            "staff_id": req.body.staff_id,
            "user_id": req.session.user_id
        };
        const response = await baseService.getInstance().post(url, body, null, req);
        const data = JSON.parse(response.body);
        return res.redirect(`${req.session.redirect_uri}?code=${data.result.code}`);
    }
}

exports.getSignIn = (req, res) => {
    let messages = req.flash();
    let errorActive = null;
    if (messages.errorActive) {
        errorActive = messages.errorActive;
    }
    if (messages.error) {
        messages = messages.error;
    } else {
        messages = null;
    }

    // token = req.csrfToken();
    if (req.session.isLoggedIn && !req.query.code && !req.query.action) {
        if (req.session.role == 'Admin') {
            return res.redirect('/admin');
        }
        return res.redirect('/admin/company-management');
    }

    return res.render('auth/signin', {
        title: 'Sign In',
        errorMessage: messages,
        csrfToken: req.csrfToken(),
        staffs: null,
        email: null,
        urlDeputy: null,
        urlKeyPay: null,
        urlXero: null,
        password: null,
        errorActive: errorActive,
        groups: null
    });
}

exports.postSignIn = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');
    var tz = req.body.time_offset; // Math.abs(dt.getTimezoneOffset()) * 60 * 1000;
    let deviceId;
    // check device id
    if (req.body.device_token != '') {
        deviceId = req.body.device_token.slice(0, 22);
        req.session.device_token = req.body.device_token;
    } else {
        deviceId = crypto.randomBytes(22).toString('hex');
    }
    const path = "/api/users/signin";
    const body = {"email": email, "password": passwordHash, "device_id": deviceId, "time_offset": tz};
    const results = await baseService.getInstance().post(path, body, req);
    const data = JSON.parse(results.body);
    if (!data.success) {
        req.flash('error', "Email or password incorrect. Please re-enter new information.");
        return res.redirect('/');
    } else {
        req.session.countryCode = commonController.mobileCountryCode();
        req.session.token = data.result.token;
        req.session.refresh_token = data.result.refresh_token;
        req.session.device_id = deviceId;
        const token = data.result.token.replace('JWT ', '');
        var decoded = jwt.decode(token, {complete: true});
        if (decoded.payload.is_admin) {
            req.session.role = "Admin";
        }
        req.session.user = decoded.payload;
        req.session.is_first_login = req.session.user.is_first_login;
        if (req.session.user.is_active != 1) {
            req.flash('error', "Your account has been disabled from CashD, you no longer have access. For any queries, please send an email to support@cashd.com.au.");
            return res.redirect('/');
        }
        req.session.isLoggedIn = true;
        if (req.session.user.avatar_path) {
            req.session.user.avatar_path = `${req.session.user.avatar_path}`;
        }
        return req.session.save(err => {
            if (err) console.log(err);
            if(decoded.payload.email=='admin@gmail.com'){
                return res.redirect('/admin/company-management');
            }
            res.redirect('/check2fa');
        });
    }
}

exports.check2fa = async (req,res) => {
    
    if(!req.session.user) {
        req.flash('error', 'Unauthorized access, please sign in');
        return res.redirect(`/`);    
    }

    if(req.session.passedOTP) {
        return res.redirect('back');
    }

    let staff = null;
    try{
        staff = await StaffModel.findOne({_id: req.session.staff_id});     
    }catch (err) {
        console.log(err);
    }

    const url = "/api/users/check2fa";
    const response = await baseService.getInstance().get(url, null, req, { email: req.session.user.email });
    data = JSON.parse(response.body);
    if(data.success === false){
        req.session.isLoggedIn = false;
        req.session.passedOTP = false;
        return req.session.save(err => {
            console.log(err);
            return res.render('auth/2fa',{
                csrfToken: req.csrfToken(),
                email: req.session.user.email,
                mobile: req.session.user.mobile,
            });
        });
    }
    req.session.passedOTP = true;
    req.session.save(err => {
        console.log(err)
        return res.redirect('/admin/company-management');
    });
}

exports.getOTPLogin = async (req,res) => {
    const url = "/api/users/getOTPLogin";
    const body = {
        email: req.body.email,
        mobile: req.body.mobile,
        sendType: req.body.sendType,
        first_name: req.session.user.first_name,
        last_name: req.session.user.last_name
    };
    const response = await baseService.getInstance().post(url, body, null, req);
    const bodyParse = JSON.parse(response.body);
    if(bodyParse.success === false){
        req.session.user = null;
        req.session.save(err => console.log(err))
    }
    return res.send(response.body);
}

exports.postOTPLogin = async (req, res) => {
    const url = "/api/users/postOTPLogin";
    const body = {
        email: req.body.email, 
        code: req.body.code, 
        remember: req.body.remember ? req.body.remember : null,
    };
    const response = await baseService.getInstance().post(url, body, null, req);
    const bodyParse = JSON.parse(response.body);
    if (!bodyParse.success) {
        req.session.user = null;
        req.session.save(err => console.log(err));
        req.flash('error','Incorrect OTP code.');
        return res.redirect('/');
    }
    req.session.isLoggedIn = true;
    req.session.passedOTP = true;
    req.session.save(err => console.log(err));
    return res.redirect('/admin/company-management');
}

exports.getUserProfile = async (req, res) => {
    const queryObj = {
        company_id: req.body.company_id,
        staff_id: req.body.staff_id
    }
    const url = "/api/users";
    const token = req.session.token;
    const response = await baseService.getInstance().get(url, token, req, queryObj);
    return res.send(response.body);
}

exports.changePassIsFirstLogin = async (req, res) => {
    const currentPassword = crypto.createHash('md5').update(req.body.current_password).digest('hex');
    const newPassword = crypto.createHash('md5').update(req.body.new_password).digest('hex');
    const url = "/api/users/changePassword";
    const token = req.session.token;
    const body = {
        current_password: currentPassword,
        new_password: newPassword,
        device_id: req.session.device_id
    };
    const response = await baseService.getInstance().post(url, body, token, req);
    return res.send(response.body);
}

exports.getForgotPassword = async (req, res) => {
    return res.render('auth/forgot-password', {
        title: 'Forgot Password',
        csrfToken: req.csrfToken()
    });
}

exports.postForgotPassword = async (req, res) => {
    const url = "/api/users/getCodeForgotPassword";
    const qs = {email: req.body.email};
    const response = await baseService.getInstance().get(url, null, req, qs);
    req.flash('success', 'The one time password has been sent to your email');
    req.session.email = req.body.email;
    return res.redirect('/otp-forgot-password');
}

exports.getOTPForgotPassword = (req, res) => {
    let messages = req.flash();
    if (messages.success || messages.error) {
        messages = messages;
    } else {
        messages = null;
    }

    return res.render('auth/otp-forgot-password', {
        title: 'OTP Forgot Password',
        messages: messages,
        email: req.session.email,
        csrfToken: req.csrfToken()
    });
}

exports.postOTPForgotPassword = async (req, res) => {
    const url = "/api/users/enterCodeForgotPassword";
    const body = {email: req.body.email, code: req.body.code};
    const response = await baseService.getInstance().post(url, body, null, req);
    const bodyParse = JSON.parse(response.body);
    if (!bodyParse.success) {
        if (bodyParse.errorCode == 'FORGOT_PASSWORD_CODE_EXPIRED') {
            req.flash('error', 'Activation code expired.');
        } else {
            req.flash('error', 'Code incorrect, please re-enter.');
        }
        return res.redirect('back');
    }
    req.session.code = req.body.code
    return res.redirect('/create-new-password');
}

exports.getCreateNewPassword = (req, res) => {
    let messages = req.flash();
    if (messages.success || messages.error) {
        messages = messages;
    } else {
        messages = null;
    }

    return res.render('auth/create-new-password', {
        title: 'OTP Forgot Password',
        messages: messages,
        email: req.session.email,
        code: req.session.code,
        csrfToken: req.csrfToken()
    });
}

exports.postCreateNewPassword = async (req, res) => {
    const newPassword = crypto.createHash('md5').update(req.body.new_password).digest('hex');
    const url = "/api/users/createNewPassword";
    const body = {email: req.body.email, code: req.body.code, new_password: newPassword};
    const response = await baseService.getInstance().post(url, body, null, req);
    const bodyParse = JSON.parse(response.body);
    if (!bodyParse.success) {
        req.flash('error', 'Can not connect to server. Please try again.');
    } else {
        req.flash('success', 'OK');
    }
    return res.redirect('back');
}

exports.postLogout = async (req, res) => {
    const body = {
        device_id: req.session.device_id
    };
    if (req.session.role != "Admin") {
        const staff = await StaffModel.findOne({user_id: req.session.user._id});
        if (staff) {
            body.staff_id = staff._id;
            removeDeviceToken(req.session.device_id, staff._id, req.session.token, req);
        }
    }
    const url = "/api/users/logout";
    const token = req.session.token;
    const response = await baseService.getInstance().post(url, body, token, req);
    req.session.destroy();
    res.setHeader("Cache-Control", " no-cache, no-store, must-revalidate, max-age=120");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.redirect('/');
}

exports.getSignUp = async (req, res) => {
    let messages = req.flash('error');
    if (messages.length > 0) {
        messages = messages[0];
    } else {
        messages = null;
    }
    res.render('auth/signup', {
        title: 'Sign Up',
        errorMessage: messages,
        apiHttps: localhost.API_HTTPS,
        csrfToken: req.csrfToken(),
        urlDeputy: `https://once.deputy.com/my/oauth/login?client_id=${config.DEPUTY_CLIENT_ID}&redirect_uri=${config.DEPUTY_REDIRECT_URL}&response_type=code&scope=longlife_refresh_token`,
        urlKeyPay: `https://api.yourpayroll.com.au/oauth/authorise?client_id=${config.KEYPAY_CLIENT_ID}&response_type=code&redirect_uri=${config.KEYPAY_REDIRECT_URL}`,
        urlXero: `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${config.XERO_CLIENT_ID}&redirect_uri=${config.XERO_REDIRECT_URL}&scope=offline_access openid profile email accounting.settings accounting.transactions payroll.employees payroll.payruns payroll.payslip payroll.timesheets payroll.settings&state=`,
        urlReckon: `https://identity.reckon.com/connect/authorize?client_id=${config.RECKON_CLIENT_ID}&response_type=code&scope=openid+read+write+offline_access&redirect_uri=${config.RECKON_REDIRECT_URL}&state=random_state&nonce=random_nonce`,
        countryCode: commonController.mobileCountryCode()
    })
}

exports.postSignUp = async (req, res) => {
    const base64Authen = Buffer.from(config.XERO_CLIENT_ID + ':' + config.XERO_CLIENT_SECRET).toString('base64');
    var dataSignup = JSON.parse(req.body.dataSignup);
    if (dataSignup.system_cashd_code === 'XERO') {
        dataSignup.system_company.system_base64_authentication = `Basic ${base64Authen}`;
    }
    const deviceId = crypto.randomBytes(6).toString('hex');
    dataSignup.device_id = deviceId;
    dataSignup.registration_code = req.body.registerCode;
    const url = "/api/users/signup";
    const response = await baseService.getInstance().post(url, dataSignup, null, req);
    return res.send(response.body);
}

exports.getListUser = async (req, res) => {
    try {
        const user = await Customer.find({is_admin: 1});
        res.render('users/table-user', {
            title: 'User management',
            data: user,
            pageName: 'user-management',
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.log(error);
    }
}

exports.getAddUser = (req, res) => {
    let messages = req.flash('error');
    res.render('users/add-user', {
        title: 'Add New User',
        messages: messages,
        pageName: 'user-management',
        csrfToken: req.csrfToken()
    });
}

exports.postAddUser = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const is_active = req.body.status;
    // const url = 'http://' + req.get('host');
    Customer.findOne({
        email: email
    })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'Mail exists already, please pick a different one.');
                return res.redirect('/admin/add-user');
            }
            if (password !== confirmPassword) {
                req.flash('error', 'Password not match.');
                return res.redirect('/admin/add-user');
            }
            return bcrypt.hash(password, 5)
                .then(hashedPassword => {
                    if (req.file === undefined) {
                        const user = new Customer({
                            first_name: first_name,
                            last_name: last_name,
                            fullname: first_name + " " + last_name,
                            email: email,
                            password: hashedPassword,
                            mobile: req.body.phone,
                            is_active: is_active ? 1 : 0,
                            is_admin: 1
                        });

                        user.save()
                            .then(() => res.redirect('/admin/user-management'));

                    } else {
                        let checkFileImage = Helper.readFileSize(req, 512, 512);
                        checkFileImage.then(result => {
                            if (result) {
                                const user = new Customer({
                                    first_name: first_name,
                                    last_name: last_name,
                                    fullname: first_name + " " + last_name,
                                    email: email,
                                    password: hashedPassword,
                                    mobile: req.body.phone,
                                    avatar_path: '/tamp/' + req.file.filename,
                                    is_active: is_active,
                                    is_admin: 1
                                });

                                user.save()
                                    .then(() => res.redirect('/admin/user-management'));
                            } else {
                                req.flash('errors', 'Invalid Image. Please upload file image has width = 512px and height = 512px');
                                if (req.file.path) {
                                    fs.unlinkSync(req.file.path, (err) => {
                                        if (err) console.log("Couldn't delete" + req.file.path + "image");
                                    });
                                }
                                res.redirect('/admin/add-user');
                            }
                        })
                            .catch(err => console.log(err));
                    }
                })
        })
        .catch(err => {
            console.log(err);
        });
}

exports.postChangeInformation = async(req, res) => {
    let userId = req.params.id;
    let body = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        fullname: req.body.first_name + " " + req.body.last_name,
        mobile: req.body.mobile,
        mobile_country_code: req.body.countryCode
    };

    let user = res.locals.user;
    
    User.findOneAndUpdate({_id: userId}, {$set: body}, function(err, userResult) {
        if (err) {
          return res.json({success: err, msg: 'Fail: Update user'});
        } else {
            user.first_name = body.first_name;
            user.last_name = body.last_name;
            user.fullname = body.first_name + " " + body.last_name;
            user.mobile = body.mobile;
            user.mobile_country_code = body.mobile_country_code;
            req.session.user = user;
            res.locals.user = user;
            return res.redirect('back');
        }
    });
}

exports.postChangePassword = async (req, res) => {
    const currentPassword = crypto.createHash('md5').update(req.body.current_password).digest('hex');
    const newPassword = crypto.createHash('md5').update(req.body.new_password).digest('hex');
    const body = {
        current_password: currentPassword,
        new_password: newPassword,
        user_id: req.session.user._id,
        device_id: req.session.device_id
    }
    const token = req.session.token;
    const url = "/api/users/changePassword";
    const response = await baseService.getInstance().post(url, body, token, req);
    const bodyParse = JSON.parse(response.body);
    const user = req.session.user;
    if (bodyParse.success) {
        user.message = null;
        req.session.is_first_login = 0;
        return res.redirect('back');
    } else {
        user.message = bodyParse.message;
        return res.redirect('back');
    }
}

exports.getEditUser = async (req, res) => {
    let messages = req.flash('errors');
    const userId = req.params.id;
    let user = await Customer.findOne({
        _id: userId
    });
    res.render('users/edit-user', {
        title: 'Edit User',
        user: user,
        messages: messages,
        pageName: 'user-management',
        csrfToken: req.csrfToken()
    });
}

exports.postEditUser = (req, res) => {
    // const url = 'http://' + req.get('host');
    let userId = req.params.id;
    Customer.findOne({
        _id: userId
    })
        .then(user => {
            if (req.file === undefined) {
                user.fullname = req.body.name;
                user.mobile = req.body.phone;
                user.is_active = req.body.status;
                user.avatar_path = user.avatar;
                user.save()
                    .then(() => res.redirect('/admin/user-management'));
            } else {
                let checkFileImage = Helper.readFileSize(req, 512, 512);
                checkFileImage.then(result => {
                    if (result) {
                        //Delete file if upload new file
                        // let path = user.avatar.split('/');
                        // let filePath = './public/uploads/' + path[path.length - 1];
                        // fs.unlinkSync(filePath, (err) => {
                        //   if (err) console.log("Couldn't delete" + user.avatar + "image");
                        // });

                        user.fullname = req.body.name;
                        user.mobile = req.body.phone;
                        user.is_active = req.body.status;
                        user.avatar_path = '/tamp/' + req.file.filename;

                        user.save()
                            .then(() => res.redirect('/admin/user-management'));
                    } else {
                        req.flash('errors', 'Invalid Image. Please upload file image has width = 512px and height = 512px');
                        fs.unlinkSync(req.file.path, (err) => {
                            if (err) console.log("Couldn't delete" + req.file.path + "image");
                        });
                        res.redirect('back');
                    }
                })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getDeleteUser = (req, res) => {
    const userId = req.params.id;
    Customer.findByIdAndRemove(userId)
        .then(user => {
            if (user.avatar_path !== 'avatar.png') {
                let path = user.avatar_path.split('/');
                let filePath = './public/uploads/' + path[path.length - 1];
                fs.unlinkSync(filePath, (err) => {
                    if (err) console.log("Couldn't delete" + filePath + "image");
                });
            }
            res.redirect('/admin/user-management');
        })
        .catch(err => console.log(err));
}

exports.postKeyPay = async (req, res) => {
    if (req.body.code) {
        var options = {
            'method': 'POST',
            'url': config.KEYPAY_TOKEN_URL,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                'code': req.body.code,
                'client_id': config.KEYPAY_CLIENT_ID,
                'client_secret': config.KEYPAY_CLIENT_SECRET,
                'redirect_uri': config.KEYPAY_REDIRECT_URL,
                'grant_type': config.KEYPAY_GRANT_TYPE
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            res.send(response.body);
        });
    } else {
        res.send({
            code: 203,
            status: false
        });
    }
}

exports.getUserPay = async (req, res) => {
    var token = req.body.tokenPay;
    var options = {
        'method': 'GET',
        'url': 'https://api.yourpayroll.com.au/api/v2/user',
        'headers': {
            'Authorization': 'Bearer ' + token
        }
    };
    request(options, function (error, response) {
        if (error) return res.send(error);
        res.send({data: response.body, statusCode: response.statusCode});
    });
}

exports.refreshTokenKeypay = async (req, res) => {
    var refreshToken = req.body.tokenPay;
    var options = {
        'method': 'POST',
        'url': 'https://api.yourpayroll.com.au/oauth/token',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'refresh_token': refreshToken,
            'client_id': config.KEYPAY_CLIENT_ID,
            'client_secret': config.KEYPAY_CLIENT_SECRET,
            'grant_type': 'refresh_token'
        }
    };
    request(options, function (error, response) {
        if (error) return res.send(error);
        res.send(response.body);
    });
}

exports.getBusinessKeypay = async (req, res) => {
    var token = req.body.tokenPay;
    var options = {
        'method': 'GET',
        'url': 'https://api.yourpayroll.com.au/api/v2/business',
        'headers': {
            'Authorization': 'Bearer ' + token
        }
    };
    request(options, function (error, response) {
        if (error) return res.send(error);
        res.send({data: response.body, statusCode: response.statusCode});
    });
}

exports.getEmployeesKeypay = async (req, res) => {
    var token = req.body.tokenPay;
    var queryObj = {
        $orderBy: '',
        $skip: req.body.page * 100,
        $top: 100
    }
    var options = {
        'method': 'GET',
        'url': `https://api.yourpayroll.com.au/api/v2/business/${req.body.companyId}/employee/unstructured`,
        'headers': {
            'Authorization': 'Bearer ' + token
        },
        'qs': queryObj
    };
    request(options, function (error, response) {
        if (error) return res.send(error);
        res.send(response.body);
    });
    return res.statusCode = 203;
}

exports.getDeductionFile = async (req, res) => {
    //get token
    const token = req.session.token;
    const queryObj = {
        company_id: req.body.idCompany,
        page: req.body.page,
        pageSize: req.body.pageSize
    }
    const url = "/api/timesheets/getPeriodDeductionFiles";
    const response = await baseService.getInstance().get(url, token, req, queryObj);
    return res.send(response.body);
}

exports.getDeductionFileDetail = async (req, res) => {
    //get token
    const token = req.session.token;
    const queryObj = {
        pay_period_id: req.body.idDeductionFile,
        page: req.body.page,
        pageSize: req.body.pageSize,
        deduction_status: req.body.deduction_status
    };
    const url = "/api/timesheets/getPeriodDeductionFileDetail";
    const response = await baseService.getInstance().get(url, token, req, queryObj);
    return res.send(response.body);
}

exports.getDeductionFileById = async (req, res) => {
    //get token
    const token = req.session.token;
    const queryObj = {
        pay_period_id: req.body.payPeriodId
    }
    const url = "/api/timesheets/getPeriodDeductionFileById";
    const response = await baseService.getInstance().get(url, token, req, queryObj);
    return res.send(response.body);
}

exports.onePayPeriod = async (req, res) => {
    //get token
    const token = req.session.token;
    let url;
    const data = {
        company_id: req.body.idCompany,
        pay_period_id: req.body.payPeriodId,
        is_prevent_withdrawals: req.body.isPreventWithdrawals == 'false' ? false : true
    }

    switch (req.body.codeSystem) {
        case 'XERO':
            url = '/api/timesheets/addDeductionsBackToXeroOnePayPeriod';
            break;
        case 'DEPUTY':
            url = '/api/timesheets/deputy/addDeductionsDeputyBackToHR3OnePayPeriod';
            break;
        case 'KEYPAY':
            url = '/api/timesheets/keypay/addDeductionsBackToKeyPayOnePayPeriod';
            break;
        case 'RECKON':
            url = '/api/timesheets/reckon/addDeductionsBackToReckonOnePayPeriod';
            break;
        case 'ASTUTE':
            url = '/api/timesheets/astute/addDeductionsBackToAstute';
            break;
        default:
            break;
    }

    const response = await baseService.getInstance().post(url, data, token, req);
    const bodyParse = JSON.parse(response.body);
    if (bodyParse.success) {
        socket.emit('repayment', {
            companyId: req.body.idCompany,
            payPeriodId: req.body.payPeriodId
        });
        socketHttp.emit('repayment', {
            companyId: req.body.idCompany,
            payPeriodId: req.body.payPeriodId
        });
    }
    return res.send(response.body);
}

exports.getFeedback = async (req, res) => {
    //get token
    const token = req.session.token;
    const queryObj = {
        company_id: req.body.idCompany,
        page: req.body.page,
        pageSize: req.body.pageSize
    };
    const url = "/api/users/getFeedbacks";
    const response = await baseService.getInstance().get(url, token, req, queryObj);
    return res.send(response.body);
}

exports.getOTPCode = async (req, res) => {
    const form = {
        email: req.body.email,
        fullname: req.body.first_name + " " + req.body.last_name,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone
    }
    const url = "/api/users/getOTPCodeToRegister";
    const response = await baseService.getInstance().post(url, form, null, req);
    let sourceCode = `
    <h5 class="text-center m-3" style="color:royalblue">
      Please check your email for the One Time Password and enter it here
    </h5>
    <div class="form-row my-4">
      <div class="col-md-2"></div>
      <div class="col-md-8">
        <input type="text" class="form-control text-center" id="otpCode" placeholder="One Time Password">
      </div>
    </div>
    <button type="button"
      class="btn btn-default btn-md btn-step my-3 mx-2 jsBackStep">BACK</button>
    <button id="jsNextStep2" type="button"
      class="btn btn-primary btn-md btn-step my-3">NEXT</button>`;
        let newResponse = JSON.parse(response.body);
        newResponse.sourceCode = sourceCode;
        return res.send(newResponse);
}

exports.sendOTPCode = async (req, res) => {
    const data = {
        email: req.body.email,
        code: req.body.code
    };
    const url = "/api/users/enterOTPCodeToRegister";
    const response = await baseService.getInstance().post(url, data, null, req);
    let sourceCode = `
    <div class="mt-3">
      <h5 class="text-left mt-3">Employers: </h5>
      <button id="jsNextStep3" type="button" style="padding: 10px 10px; width: 70%; font-size: 16px;"
        class="btn btn-primary btn-lg btn-sm mt-5">Register your company</button>
    </div>
    <div class="mt-5">
      <h5 class="text-left mt-3">Employees: </h5>
      <div>
        <button id="jsResendActiveCode" type="button" style="padding: 10px 10px; width: 70%; font-size: 16px;"
        class="btn btn-primary btn-lg btn-sm mt-5">Resend Invitation</button>
      </div>
    </div>
    <p class="mt-5">For assistance please contact <b><a href="https://cashd.co/">support@cashd.com.au</a></b></p>
    <button type="button" style="padding: 10px 10px; width: 70%; font-size: 16px;"
    class="btn btn-default btn-md btn-step mx-2 mb-5 jsBackStep">BACK</button>
    `;
    let newResponse = JSON.parse(response.body);
    newResponse.sourceCode = sourceCode;
    return res.send(newResponse);
}

exports.sendActiveCode = async (req, res) => {
    const data = {
        email: req.body.email,
        activation_code: req.body.activation_code
    };
    const url = "/api/users/enterActivationCode";
    const response = await baseService.getInstance().post(url, data, null, req);
    return res.send(response.body);
}

exports.resendActiveCode = async (req, res) => {
    const data = {
        email: req.body.email,
        activation_code: req.body.activation_code,
        is_linked: true,
    };
    const url = "/api/users/resendActivationCode";
    const response = await baseService.getInstance().post(url, data, null, req);
    return res.send(response.body);
}

exports.getSystemList = async (req, res) => {
    const url = "/api/users/getSystemsList";
    const response = await baseService.getInstance().get(url, null, req);
    return res.send(response.body);
}

exports.updateCompanyRefreshToken = async (req, res) => {
    const base64Authen = Buffer.from(config.XERO_CLIENT_ID + ':' + config.XERO_CLIENT_SECRET).toString('base64');
    let data = req.body;
    const token = req.session.token;

    if (data.systemCode === 'XERO') {
        data.system_base64_authentication = `Basic ${base64Authen}`;
    }
    const url = "/api/timesheets/updateCompanyRefreshToken";
    const response = await baseService.getInstance().post(url, data, token, req);
    return res.send(response.body);
}

exports.syncPayrollData = async (req, res) => {
    const url = "/api/timesheets/syncPayrollDataByCompanyId";
    const token = req.session.token;
    const response = await baseService.getInstance().post(url, req.body, token, req);
    await CompanyModel.findOneAndUpdate({_id: req.body.company_id}, {
        $set: {
            is_first_synced: true
        }
    });
    var body = JSON.parse(response.body);
    return res.send({...body, timezoneServer: Math.abs(new Date().getTimezoneOffset()) * 60 * 1000});
}

exports.getViewLoginXero = async (req, res) => {
    const {client_id, redirect_uri} = req.query;
    const url = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=offline_access openid profile email payroll.employees payroll.payruns payroll.payslip payroll.timesheets payroll.settings&state=shapeecloud`;
    return res.render("web-view/login-xero", {url});
}

exports.getAccessTokenXero = async (req, res) => {
    var code = req.body.code;
    let buff = Buffer.from(config.XERO_CLIENT_ID + ":" + config.XERO_CLIENT_SECRET);
    let base64data = buff.toString('base64');
    if (code) {
        var options = {
            'method': 'POST',
            'url': 'https://identity.xero.com/connect/token',
            'headers': {
                'Authorization': `Basic ${base64data}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': config.XERO_REDIRECT_URL
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            return res.send(response.body);
        });
    }
    return res.statusCode = 203;
}

exports.getConnectionsXero = async (req, res) => {
    var access_token = req.body.access_token;
    if (access_token) {
        var options = {
            'method': 'GET',
            'url': 'https://api.xero.com/connections',
            'headers': {
                'Authorization': `Bearer ${access_token}`,
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            return res.send(response.body);
        });

    }
    return res.statusCode = 203;
}

exports.getUserProfileXero = async (req, res) => {
    var access_token = req.body.access_token;
    var tenantId = req.body.tenantId;
    if (access_token && tenantId) {
        var options = {
            'method': 'GET',
            'url': 'https://api.xero.com/api.xro/2.0/users',
            'headers': {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
                'Xero-tenant-id': `${tenantId}`,
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            return res.send(response.body);
        });
    }
    return res.statusCode = 203;
}

exports.getCompanyInforXero = async (req, res) => {
    var access_token = req.body.access_token;
    var tenantId = req.body.tenantId;
    if (access_token && tenantId) {
        var options = {
            'method': 'GET',
            'url': 'https://api.xero.com/api.xro/2.0/organisation',
            'headers': {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
                'Xero-tenant-id': `${tenantId}`,
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            return res.send(response.body);
        });
    }
    return res.statusCode = 203;
}

exports.getEmployeesXero = async (req, res) => {
    var access_token = req.body.access_token;
    var tenantId = req.body.tenantId;
    if (access_token && tenantId) {
        var options = {
            'method': 'GET',
            'url': 'https://api.xero.com/payroll.xro/1.0/Employees',
            'headers': {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
                'Xero-tenant-id': `${tenantId}`,
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            return res.send(response.body);
        });
    }
    return res.statusCode = 203;
}

exports.getRefreshTokenXero = async (req, res) => {
    var refresh_token = req.body.refresh_token;
    let buff = Buffer.from(config.XERO_CLIENT_ID + ":" + config.XERO_CLIENT_SECRET);
    let base64data = buff.toString('base64');
    if (refresh_token) {
        var options = {
            'method': 'POST',
            'url': 'https://identity.xero.com/connect/token',
            'headers': {
                'Authorization': `Basic ${base64data}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                'grant_type': 'refresh_token',
                'refresh_token': `${refresh_token}`
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            return res.send(response.body);
        });
    }
    return res.statusCode = 203;
}

exports.disConnectXero = async (req, res) => {
    let company_system_id = req.body.company_system_id;
    let companyId = req.body.company_id;
    let company = await CompanyModel.findById(companyId);
    let newAccessToken = null
    if (company.system_refresh_token != null) {
        let headers = {
            Authorization: company.system_base64_authentication,
            "Content-Type" : "application/x-www-form-urlencoded"
        }
        let body = {
            grant_type: "refresh_token",
            refresh_token: company.system_refresh_token
        }
        let formData = querystring.stringify(body);
        let urlRefreshToken = "https://identity.xero.com/connect/token";
        let refreshTokenResult = await new Promise((resolve, reject) => {
            request({url: urlRefreshToken, method: 'POST', headers: headers, body: formData}, function (error, res, body) {
                if (!error) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        }).catch((error) => {
            return false;
        });
        
        if(refreshTokenResult != null) {
            let refreshTokenJson = null
            try {
                refreshTokenJson = JSON.parse(refreshTokenResult) 
            } catch (e) {
                refreshTokenJson = null
            }            
            if(refreshTokenJson != null && refreshTokenJson.refresh_token != null) {
                //Update new refresh token for company
                await CompanyModel.findOneAndUpdate({"_id": company._id}, 
                { $set: {
                        system_refresh_token: refreshTokenJson.refresh_token
                    }});

                newAccessToken = refreshTokenJson.access_token
            } else {
                return res.send({success: false, result: refreshTokenResult});
            }
        } else {
            return res.send({success: false, result: null});
        }
    }

    let oAuth = "Bearer " + newAccessToken;
    let connectionsResult = await new Promise((resolve, reject) => {
        request({url: "https://api.xero.com/connections", method: 'GET', headers: {'Authorization': oAuth}}, function (error, res, body) {
            if (!error) {
                resolve(body);
            } else {
                reject(error);
            }
        });
        }).catch((error) => {
            return false;
        });

    if (connectionsResult != null) {
        let connections;
        try {
            connections = JSON.parse(connectionsResult);
        } catch (error) {
            console.error(error);
            return res.send({success: false, result: null});
        }
        if (connections && connections[0].tenantId == company_system_id) {
            let disConnectionsResult = await new Promise((resolve, reject) => {
                request({url: `https://api.xero.com/connections/${connections[0].id}`, method: 'DELETE', headers: {'Authorization': oAuth}}, function (error, res, body) {
                    if (!error) {
                        resolve(body);
                    } else {
                        reject(error);
                    }
                });
                }).catch((error) => {
                    console.long(error);
                    return false;
                });
            if (disConnectionsResult == "") {
                await CompanyModel.findByIdAndUpdate(companyId, {is_fail_system_refresh_token: true, system_refresh_token: null});
                return res.send({success: true, result: null});
            } else {
                console.log(disConnectionsResult);
                return res.send({success: false, result: null});
            }
        } else {
            return res.send({success: false, result: null});
        }
    }
}

exports.getAccessTokenDeputy = async (req, res) => {
    var code = req.body.code;
    if (code) {
        var options = {
            'method': 'POST',
            'url': 'https://once.deputy.com/my/oauth/access_token',
            'headers': {
                'Content-Type': 'application/json'
            },
            formData: {
                'code': code,
                'client_id': config.DEPUTY_CLIENT_ID,
                'redirect_uri': config.DEPUTY_REDIRECT_URL,
                'grant_type': 'authorization_code',
                'scope': 'longlife_refresh_token',
                'client_secret': config.DEPUTY_CLIENT_SECRET
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            return res.send(response.body);
        });
    }
    return res.statusCode = 203;
}

exports.getUserProfileLogin = async (req, res) => {
    var access_token = req.body.access_token;
    var link = req.body.link;
    if (access_token && link) {
        var options = {
            'method': 'GET',
            'url': `https://${link}/api/v1/me`,
            'headers': {
                'Authorization': `OAuth ${access_token}`,
                'Content-Type': 'application/json'
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            if (response.statusCode == 401) {
                var data = JSON.stringify({"statusCode": response.statusCode});
                return res.send(data);
            }
            return res.send(response.body);
        });
    }
    return res.statusCode = 203;
}

exports.getCompanyDeputy = async (req, res) => {
    var access_token = req.body.access_token;
    var link = req.body.link;
    if (access_token && link) {
        var options = {
            'method': 'GET',
            'url': `https://${link}/api/v1/resource/Company/${req.body.systemCompanyId}`,
            'headers': {
                'Authorization': `OAuth ${access_token}`
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            return res.send(response.body);
        });
    }
    return res.statusCode = 203;
}

exports.getEmployeeDeputy = async (req, res) => {
    var access_token = req.body.access_token;
    var link = req.body.link;
    if (access_token && link) {
        var options = {
            'method': 'GET',
            'url': `https://${link}/api/v1/supervise/employee`,
            'headers': {
                'Authorization': `OAuth ${access_token}`,
                'Content-Type': 'application/json'
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            return res.send(response.body);
        });
    }
    return res.statusCode = 203;
}

exports.refreshTokenDeputy = async (req, res) => {
    var refresh_token = req.body.refresh_token;
    var endpoint = req.body.endpoint;
    if (refresh_token) {
        var options = {
            'method': 'POST',
            'url': `https://${endpoint}/oauth/access_token`,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `OAuth 687d037d13bde06eb8a0b950fd3269a5`,
                'Accept': 'application/json'
            },
            form: {
                'client_id': config.DEPUTY_CLIENT_ID,
                'client_secret': config.DEPUTY_CLIENT_SECRET,
                'redirect_uri': config.DEPUTY_REDIRECT_URL,
                'grant_type': 'refresh_token',
                'scope': 'longlife_refresh_token',
                'refresh_token': refresh_token
            }
        };
        request(options, function (error, response) {
            if (error) return res.send(error);
            if (response.statusCode == 400) {
                var data = JSON.stringify({"statusCode": response.statusCode});
                return res.send(data);
            }
            return res.send(response.body);
        });
    }
    return res.statusCode = 203;
}

exports.getTimesheets = async (req, res) => {
    const token = req.session.token;
    const queryObj = {
        time_offset: req.body.time_offset,
        company_id: req.body.companyId
    }
    let url = "/api/timesheets";

    switch (req.body.systemCode) {
        case 'XERO':
            url += '/getXeroTimesheets';
            break;
        case 'DEPUTY':
            url += '/deputy/getDeputyTimesheets';
            break;
        case 'KEYPAY':
            url += '/keypay/getKeyPayTimesheets';
            break;
        case 'RECKON':
            url += '/reckon/getReckonTimesheets';
            break;
        case 'ASTUTE':
            url += '/astute/getAstuteTimesheets';
            break;
        default:
            break;
    }

    const response = await baseService.getInstance().get(url, token, req, queryObj);
    return res.send(response.body);
}

exports.approveTimesheet = async (req, res) => {
    const token = req.session.token;
    const data = JSON.parse(req.body.dataTimesheet);
    let url = "/api/timesheets";
    let body;

    switch (req.body.systemCode) {
        case 'XERO':
            url += '/approveXeroMultipleTimesheets';
            body = {arrs_timesheets: data, employer_staff_id: req.session.staff_id};
            break;
        case 'DEPUTY':
            url += '/deputy/approveDeputyMultipleTimesheets';
            body = {arrs_timesheets: data, employer_staff_id: req.session.staff_id};
            break;
        case 'KEYPAY':
            url += '/keypay/approveKeyPayMultipleTimesheets';
            body = {arrs_timesheet_ids: data, employer_staff_id: req.session.staff_id};
            break;
        case 'RECKON':
            url += '/reckon/approveReckonMultipleTimesheets';
            body = {arrs_timesheet_ids: data, employer_staff_id: req.session.staff_id};
            break;
        default:
            break;
    }

    const response = await baseService.getInstance().post(url, body, token, req);
    return res.send(response.body);
}

exports.acceptRequest = async (req, res) => {
    const token = req.session.token;
    const data = JSON.parse(req.body.dataRequest);
    let url = "/api/timesheets", body;
    switch (req.body.systemCode) {
        case 'XERO':
            url += '/acceptXeroMultipleTimesheetRequest';
            body = {arrs_timesheet_request_ids: data, employer_staff_id: req.session.staff_id}
            break;
        case 'DEPUTY':
            url += '/deputy/acceptDeputyMultipleTimesheetRequest';
            body = {arrs_timesheet_requests: data, employer_staff_id: req.session.staff_id}
            break;
        case 'KEYPAY':
            url += '/keypay/acceptKeyPayMultipleTimesheetRequest';
            body = {arrs_timesheet_request_ids: data, employer_staff_id: req.session.staff_id}
            break;
        case 'RECKON':
            url += '/reckon/acceptReckonMultipleTimesheetRequest';
            body = {arrs_timesheet_request_ids: data, employer_staff_id: req.session.staff_id}
            break;
        default:
            break;
    }

    const response = await baseService.getInstance().post(url, body, token, req);
    return res.send(response.body);
}

exports.rejectRequest = async (req, res) => {
    const token = req.session.token;
    const data = {
        timesheet_request_id: req.body.requestId,
        employer_staff_id: req.session.staff_id
    }
    let url = "/api/timesheets";

    switch (req.body.systemCode) {
        case 'XERO':
            url += '/rejectXeroTimesheetRequest';
            break;
        case 'DEPUTY':
            url += '/deputy/rejectDeputyTimesheetRequest';
            break;
        case 'KEYPAY':
            url += '/keypay/rejectKeyPayTimesheetRequest';
            break;
        case 'RECKON':
            url += '/reckon/rejectReckonTimesheetRequest';
            break;
        default:
            break;
    }

    const response = await baseService.getInstance().post(url, data, token, req);
    return res.send(response.body);
}

exports.requestRawForm = async (req, res) => {
    const body = JSON.parse(req.body.data)
    const token = req.session.token;
    const url = "/api/systems/requestRawForm";
    const response = await baseService.getInstance().post(url, body, token, req);
    return res.send(response.body);
}

exports.getWallet = async (req, res) => {
    const token = req.session.token;
    const queryObj = {
        time_offset: req.body.time_offset, //Math.abs(new Date().getTimezoneOffset()) * 60 * 1000
        page: +req.body.page,
        page_size: +req.body.pageSize,
        search_key: req.body.searchKey,
        company_id: req.body.companyId
    }
    let url = "/api/timesheets";
    //check system code
    switch (req.body.systemCode) {
        case 'XERO':
            url += '/getXeroWalletOfEmployees';
            break;
        case 'DEPUTY':
            url += '/deputy/getDeputyWalletOfEmployees';
            break;
        case 'KEYPAY':
            url += '/keypay/getKeyPayWalletOfEmployees';
            break;
        case 'RECKON':
            url += '/reckon/getReckonWalletOfEmployees';
            break;
        case 'ASTUTE':
            url += '/astute/getAstuteWalletOfEmployees';
            break;
        default:
            break;
    }

    const response = await baseService.getInstance().get(url, token, req, queryObj);
    return res.send(response.body);
}

exports.getCompanies = async (req, res) => {
    let where = {};
    if (req.query.company_id != "") {
        where = {"_id": mongoose.Types.ObjectId(req.query.company_id)};
    }
    let companies = await CompanyModel.aggregate([
        {$match: where},
        {
            $lookup:
                {
                    from: "systems",
                    localField: 'system_id',
                    foreignField: '_id',
                    as: 'system'
                }
        },
        {$unwind: "$system"},
        {$sort: {"created_date": -1}}
    ]);
    return res.send({
        success: true,
        result: companies,
        message: 'Get company successfully.',
        code: 200,
        errorCode: "GET_COMPANY_SUCCESFULLY"
    });
}

exports.getPeriod = async (req, res) => {
    let company_id = req.query.company_id;
    let bodyContent = [{
        $match: {
            $and: [
                {"company_id": mongoose.Types.ObjectId(company_id)},
                {$or: [{"xero_pay_calendar_id": {$ne: null}}, {"keypay_pay_schedule_id": {$ne: null}}, {"pay_period_origination_id": {$ne: null}}]}
            ]
        }
    }];
    let companies = await CompanyModel.aggregate([
        {$match: {"_id": mongoose.Types.ObjectId(company_id)}},
        {
            $lookup:
                {
                    from: "systems",
                    localField: 'system_id',
                    foreignField: '_id',
                    as: 'system'
                }
        },
        {$unwind: "$system"},
    ]);
    const company = companies[0];
    if (company.system.code != null && company.system.code == "DEPUTY") {
        bodyContent.push({
                $lookup:
                    {
                        from: "pay_period_originations",
                        localField: 'pay_period_origination_id',
                        foreignField: '_id',
                        as: 'pay_period_origination'
                    }
            },
            {$unwind: "$pay_period_origination"})

        bodyContent.push({
            $lookup:
                {
                    from: "company_brands",
                    localField: 'company_brand_id',
                    foreignField: '_id',
                    as: 'company_brands'
                }
        })
        //,{$unwind : "$company_brand"})
    } else if (company.system.code != null && company.system.code == "KEYPAY") {
        bodyContent.push({
                $lookup:
                    {
                        from: "keypay_pay_schedules",
                        localField: 'keypay_pay_schedule_id',
                        foreignField: '_id',
                        as: 'keypay_pay_schedule'
                    }
            },
            {$unwind: "$keypay_pay_schedule"})
    } else if (company.system.code != null && company.system.code == "XERO" 
    || company.system.code != null && company.system.code == "RECKON" 
    || company.system.code != null && company.system.code == "ASTUTE") {
        bodyContent.push({
                $lookup:
                    {
                        from: "xero_pay_calendars",
                        localField: 'xero_pay_calendar_id',
                        foreignField: '_id',
                        as: 'xero_pay_calendar'
                    }
            },
            {$unwind: "$xero_pay_calendar"})
    }
    bodyContent.push({$sort: {"start_date": -1}});
    let payPeriods = await PayPeriod.aggregate(bodyContent);
    return res.send({
        success: true,
        result: payPeriods,
        message: 'Get pay period successfully.',
        code: 200,
        errorCode: "GET_PERIOD_SUCCESFULLY"
    });
}

exports.addOriginationPayPeriod = async (req, res) => {
    const token = req.session.token;
    const url = "/api/timesheets/addOriginationPayPeriod";
    const response = await baseService.getInstance().post(url, JSON.parse(req.body.dataPayPeriod), token, req);
    return res.send(response.body);
}

exports.getOriginationPayPeriods = async (req, res) => {
    const token = req.session.token;
    const queryObj = {
        company_id: req.body.companyId,
        page: +req.body.page,
        pageSize: +req.body.pageSize
    };
    const url = "/api/timesheets/getOriginationPayPeriods";
    const response = await baseService.getInstance().get(url, token, req, queryObj);
    return res.send(response.body);
}

exports.updateOriginationPayPeriod = async (req, res) => {
    const token = req.session.token;
    const url = "/api/timesheets/editOriginationPayPeriod";
    const response = await baseService.getInstance().post(url, JSON.parse(req.body.dataPayPeriod), token, req);
    return res.send(response.body);
}

exports.deleteOriginationPayPeriod = async (req, res) => {
    const token = req.session.token;
    const url = "/api/timesheets/deleteOriginationPayPeriod";
    const response = await baseService.getInstance().post(url, JSON.parse(req.body.data), token, req);
    return res.send(response.body);
}

exports.getCountries = async (req, res) => {
    const url = "/api/countries";
    const response = await baseService.getInstance().get(url, null, req);
    return res.send(response.body);
}

exports.getStates = async (req, res) => {
    let {countryId} = req.query;
    const url = `/api/states?countryId=${countryId}`;
    const response = await baseService.getInstance().get(url, null, req);
    return res.send(response.body);
}

exports.getSuburbs = async (req, res) => {
    let {countryId, stateId} = req.query;
    const url = `/api/suburbs?countryId=${countryId}&stateId=${stateId}`;
    const response = await baseService.getInstance().get(url, null, req);
    return res.send(response.body);
}

exports.getCities = async (req, res) => {
    let {countryId, stateId} = req.query;
    const url = `/api/cities?countryId=${countryId}&stateId=${stateId}`;
    const response = await baseService.getInstance().get(url, null, req);
    return res.send(response.body);
}

exports.approveKeyPay = async (req, res) => {
    const {systemCompanyId, employeeId, timesheetId, accessToken} = req.body;
    const options = {
        'method': 'POST',
        'url': `https://api.yourpayroll.com.au/api/v2/business/${systemCompanyId}/manager/${employeeId}/timesheet/${timesheetId}/approve`,
        'headers': {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    };

    request(options, function (error, response) {
        if (error) throw new Error(error);
        return res.send(response.body);
    });
}

exports.usersLog = async (req, res) => {
    let countLogs = await UserLogModel.countDocuments();
    const endDate = moment(Date.now()).format('YYYY-MM-DD');
    const endDateToString = new Date(endDate);
    //get startDate, endDate for Daily
    const startDateDaily = moment(endDate).subtract(30, 'days').format('YYYY-MM-DD');
    const startDateDailyToString = new Date(startDateDaily);
    //get startDate, endDate for Weekly
    const startDateWeekly = moment(endDate).subtract(6, 'month').format('YYYY-MM-DD');
    const startDateWeeklyToString = new Date(startDateWeekly);
    //get startDate, endDate for Fornightly
    const startDateFornightly = moment(endDate).subtract(1, 'year').format('YYYY-MM-DD');
    const startDateFornightlyToString = new Date(startDateFornightly);
    //get startDate, endDate for Monthly
    const startDateMonthly = moment(endDate).subtract(2, 'year').format('YYYY-MM-DD');
    const startDateMonthlyToString = new Date(startDateMonthly);

    let filterDaily = { "create_date": { $gte: startDateDailyToString, $lt: endDate} };
    const queryUserLogInDaily = UserLogModel.aggregate([{$match: filterDaily }]);

    const [listUserLogInDaily] = await Promise.all([
        queryUserLogInDaily
    ]);

    const queryMain = (startDate, endDate, groupQuery, dataDaily) => {
        let filterMain = { "create_date": { $gte: startDate, $lt: endDate} };
        if (dataDaily && dataDaily.length == 0) {
            filterMain = {};
        }
        return [
            { $match: filterMain },
            { $addFields: {
                    createdDate: { $dateFromParts: {
                            year:{$year:"$create_date"},
                            month:{$month:"$create_date"},
                            day:{$dayOfMonth:"$create_date"}
                        }},
                    dateRange:{$map:{
                            input:{$range:[0,
                                    {$add:[
                                            {$divide: [{$subtract:[endDate, startDate]}, 1000*60*60*24]}, 1
                                        ]}
                                ]},
                            in:{$add:[startDate, {$multiply:["$$this", 1000*60*60*24]}]}
                        }}
                }},
            { $unwind: "$dateRange" },
            {$group:{
                    _id: groupQuery._id,
                    createdDate: {$last: "$dateRange"},
                    count:{$sum:{$cond:[{$eq:["$dateRange","$createdDate"]},groupQuery.count,0]}}
                }},
            {$sort:{createdDate:1}},
            {$project:{
                    _id:0,
                    createdDate: groupQuery.createdDate,
                    total:"$count"
                }}
        ]
    }
    //query get statistics daily
    const queryStatisticsDaily = (isAmount = 0, dataDaily) => {
        const groupQuery = {
            _id: "$dateRange",
            createdDate: { $dateToString: { format: "%Y-%m-%d", date: "$createdDate"}}
        };
        if (isAmount == 0) {
            groupQuery.count = 1;
        } else if (isAmount == 1) {
            groupQuery.count = "$fee_amount";
        } else {
            groupQuery.count = "$total_deduction"
        }
        const queryFormat = queryMain(startDateDailyToString, endDateToString, groupQuery, dataDaily);
        return queryFormat;
    }
    //query get statistics weekly
    const queryStatisticsWeekly = (isAmount = 0) => {
        const groupQuery = {
            _id: {$isoWeek: '$dateRange'},
            createdDate: {
                $dateToString: { format: "%Y-%m-%d", date: { // convert date
                        $subtract: ["$createdDate", {$multiply: [ {$subtract:[{$isoDayOfWeek: "$createdDate"},1]}, 86400000]}]
                    }}
            }
        };
        if (isAmount == 0) {
            groupQuery.count = 1;
        } else if (isAmount == 1) {
            groupQuery.count = "$fee_amount";
        } else {
            groupQuery.count = "$total_deduction"
        }
        const queryFormat = queryMain(startDateWeeklyToString, endDateToString, groupQuery);
        return queryFormat;
    }
    //query get statistics fornightly
    const queryStatisticsFornightly = (isAmount = 0) => {
        const groupQuery = {
            _id: {$subtract: [
                    {$isoWeek: "$dateRange"}, {$mod: [{$isoWeek: "$dateRange"}, 2] }
                ]},
            createdDate: {
                $dateToString: { format: "%Y-%m-%d", date: { // convert date
                        $subtract: ["$createdDate", {$multiply: [ {$subtract:[{$isoDayOfWeek: "$createdDate"},1]}, 86400000]}]
                    }}
            }
        };
        if (isAmount == 0) {
            groupQuery.count = 1;
        } else if (isAmount == 1) {
            groupQuery.count = "$fee_amount";
        } else {
            groupQuery.count = "$total_deduction"
        }
        const queryFormat = queryMain(startDateFornightlyToString, endDateToString, groupQuery);
        return queryFormat;
    }
    //query get statistics monthly
    const queryStatisticsMonthly = (isAmount = 0) => {
        const groupQuery = {
            _id: {month: {$month: '$dateRange'}, year: {$year: '$dateRange'}},
            createdDate: {
                $dateToString: { format: "%Y-%m", date: { // convert date
                        $subtract: ["$createdDate", {$multiply: [ {$subtract:[{$isoDayOfWeek: "$createdDate"},1]}, 86400000]}]
                    }}
            }
        };
        if (isAmount == 0) {
            groupQuery.count = 1;
        } else if (isAmount == 1) {
            groupQuery.count = "$fee_amount";
        } else {
            groupQuery.count = "$total_deduction"
        }
        const queryFormat = queryMain(startDateMonthlyToString, endDateToString, groupQuery);
        return queryFormat;
    }
    //query get statistics yearly
    const queryStatisticsYearly = (total = 1) => {
        let filterYear = {};
        return [
            {$match: filterYear},
            {$group:{
                    _id: {$year: '$create_date'},
                    createdDate: {$last: '$create_date'},
                    count:{$sum: total}
                }},
            {$project:{
                    _id: 0,
                    yearDate: { $dateToString: { format: "%Y", date: "$createdDate"}},
                    total:{$sum: '$count'}
                }}
        ]
    };
    //query count total company, staff, deduction daily
    const queryUserLogDaily = UserLogModel.aggregate(queryStatisticsDaily(0, listUserLogInDaily));
    const queryUserLogWeekly = UserLogModel.aggregate(queryStatisticsWeekly());
    const queryUserLogFornightly = UserLogModel.aggregate(queryStatisticsFornightly());
    const queryUserLogMonthly = UserLogModel.aggregate(queryStatisticsMonthly());
    const queryUserLogYearly = UserLogModel.aggregate(queryStatisticsYearly());
    const [
        dataUserLogDaily,
        dataUserLogWeekly,
        dataUserLogFornightly,
        dataUserLogMonthly,
        dataUserLogYearly
    ] = await Promise.all([
        queryUserLogDaily,
        queryUserLogWeekly,
        queryUserLogFornightly,
        queryUserLogMonthly,
        queryUserLogYearly
    ]);
    // convert data daily
    const totalUserLogDaily = dataUserLogDaily.map((item) => {
        let childArr = [];
        childArr.push(Date.parse(item.createdDate), item.total);
        return childArr;
    });
    // convert data weekly
    const totalUserLogWeekly = dataUserLogWeekly.map((item) => {
        let childArr = [];
        childArr.push(Date.parse(item.createdDate), item.total);
        return childArr;
    });
    const totalUserLogFornightly = dataUserLogFornightly.map((item) => {
        let childArr = [];
        childArr.push(Date.parse(item.createdDate), item.total);
        return childArr;
    });
    // convert data monthly
    const totalUserLogMonthly = dataUserLogMonthly.map((item) => {
        let childArr = [];
        childArr.push(Date.parse(item.createdDate), item.total);
        return childArr;
    });
    // convert data yearly
    const totalUserLogYearly = dataUserLogYearly.map((item) => {
        let childArr = [];
        childArr.push(Date.parse(item.yearDate), item.total);
        return childArr;
    });

    return res.render('userlogs/table-log', {
        title: 'User Logs Management',
        pageName: 'user-logs',
        countUserLog: countLogs,
        csrfToken: req.csrfToken(),
        totalUserLogDaily: JSON.stringify(totalUserLogDaily),
        totalUserLogWeekly: JSON.stringify(totalUserLogWeekly),
        totalUserLogFornightly: JSON.stringify(totalUserLogFornightly),
        totalUserLogMonthly: JSON.stringify(totalUserLogMonthly),
        totalUserLogYearly: JSON.stringify(totalUserLogYearly),
    });
}

exports.postUsersLogs = async (req, res) => {
    let sortColum = req.body['order[0][column]'];
    let value = req.body['order[0][dir]'] === "asc" ? 1 : -1;
    const nameFiled = ["staff.fullname", "company.company_name", "create_date"];
    let sort = {};
    if (req.body['order[2][column]']) {
        sort["create_date"] = -1;
    }
    sort[nameFiled[sortColum - 1]] = value;

    let {page, pageSize} = req.body;
    const user = req.session.user;

    let userLogs, totalItems;
    if (user.is_admin) {
        userLogs = await UserLogModel.aggregate([
            {
                $lookup: {
                    from: "staffs",
                    localField: "staff_id",
                    foreignField: "_id",
                    as: "staff",
                },
            },
            {
                $unwind: {
                    path: "$staff",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "companies",
                    localField: "staff.company_id",
                    foreignField: "_id",
                    as: "company",
                },
            },
            {
                $unwind: {
                    path: "$company",
                    preserveNullAndEmptyArrays: true,
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
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $match: { "user.fullname": new RegExp(req.body.userName, "i") } },
            { $sort: sort },
            { $skip: +page * +pageSize },
            { $limit: +pageSize },
        ]);
        totalItems = await UserLogModel.countDocuments({});
    } else {
        userLogs = await UserLogModel.aggregate([
            { $match: { "user_id": mongoose.Types.ObjectId(user._id) } },
            {
                $lookup: {
                    from: "staffs",
                    localField: "staff_id",
                    foreignField: "_id",
                    as: "staff",
                },
            },
            {
                $unwind: {
                    path: "$staff",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "companies",
                    localField: "staff.company_id",
                    foreignField: "_id",
                    as: "company",
                },
            },
            {
                $unwind: {
                    path: "$company",
                    preserveNullAndEmptyArrays: true,
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
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $match: { "user.fullname": new RegExp(req.body.userName, "i") } },
            { $sort: sort },
            { $skip: +page * +pageSize },
            { $limit: +pageSize },
        ]);
        totalItems = await UserLogModel.countDocuments({ user_id: mongoose.Types.ObjectId(user._id) });
    }
    return res.send(JSON.stringify({result: userLogs, totalItems: totalItems}));
}

exports.notifications = async (req, res) => {
    return res.render('notification', {
        title: 'Notifications',
        pageName: 'notifications',
        csrfToken: req.csrfToken(),
      });
}

exports.getAllNotifications = async (req, res) => {
    const body = {company_ids: req.session.companyIds};
    const url = `/api/users/getNotifications?page=${req.body.page}&pageSize=${req.body.pageSize}`;
    const token = req.session.token;
    const response = await baseService.getInstance().post(url, body, token, req);
    const data = JSON.parse(response.body);
    return res.send(JSON.stringify({result: data.result, totalItem: data.totalItem}));
}

exports.postNotifications = async (req, res) => {
    const token = req.session.token;
    const url = "/api/users/notifications";
    const body = { message: req.body.message };
    const response = await baseService.getInstance().post(url, body, token, req);
    return res.send({success: true});
}

exports.testNotification = async (req, res) => {
    return res.render('notification/test');
}

exports.getAccessTokenPayroll = async (req, res) => {
    if (!req.query.staff_id) {
        return res.status(400).json({ success: false, result: null, message: 'The field "staff_id" is required.', code: 400, errorCode: "REQUIRE_STAFF_ID"});
    }
    const url = `/api/users/getPayrollAccessToken?staff_id=${req.query.staff_id}`;
    const token = req.session.token;
    const response = await baseService.getInstance().get(url, token, req);
    let body = JSON.parse(response.body);
    if (body?.result?.access_token != null) {
        req.session.tokenPayroll = body.result.access_token;
        req.session.staff_id = req.query.is_login == 1 ? req.query.staff_id : req.session.staff_id;
    }
    return res.send(response.body);
}

exports.getAccessTokenReckon = async (req, res) => {
    if (!req.body.code) {
        return res.status(400).json({ success: false, result: null, message: 'The field "code" is required.', code: 400, errorCode: "REQUIRE_CODE"});
    }
    let buff = Buffer.from(config.RECKON_CLIENT_ID + ":" + config.RECKON_CLIENT_SECRET);
    let base64data = buff.toString('base64');
    var options = {
        'method': 'POST',
        'url': 'https://identity.reckon.com/connect/token',
        'headers': {
          'Authorization': 'Basic ' + base64data,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
          'grant_type': 'authorization_code',
          'code': req.body.code,
          'redirect_uri': config.RECKON_REDIRECT_URL
        }
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        try {
            let result = JSON.parse(response.body);
            let accessToken = result.access_token;
            let refreshToken = result.refresh_token;
            if (result.id_token) {
                let array = result.id_token.split('.');
                if (array.length > 1) {
                    let data = array[1];
                    let buff = Buffer.from(data, 'base64');
                    let jwt = buff.toString('ascii');
                    if (jwt != null) {
                        let jwtJs = JSON.parse(jwt);
                        result = jwtJs.portalToken?.split('.');
                        if (result.length > 1) {
                            jwt = Buffer.from(result[1], 'base64');
                            let reckonUser = JSON.parse(jwt);
                            if (reckonUser != null) {
                                return res.send({success: true, result: {...reckonUser}, message: null, access_token: accessToken, refresh_token: refreshToken});
                            }
                        }
                    }
                }
                return res.send({success: false, result: null, message: "Can't connect to server. Try again"});
            } else {
                return res.send({success: true, result: null, message: result.error});
            }
        } catch (error) {
            return res.send({success: false, result: null, message: "Can't connect to server. Try again"});
        }
      });
    
}

exports.getCashbooksReckon = async (req, res) => {
    if (!req.body.access_token) {
        return res.status(400).json({ success: false, result: null, message: 'The field "access token" is required.', code: 400, errorCode: "REQUIRE_ACCESS_TOKEN"});
    }
    var options = {
        'method': 'GET',
        'url': 'https://api.reckon.com/r1/cashbooks',
        'headers': {
          'Authorization': 'Bearer ' +req.body.access_token
        }
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        return res.send(response.body);
      });
}

exports.getCompanyInfoReckon = async (req, res) => {
    if (!req.body.access_token) {
        return res.status(400).json({ success: false, result: null, message: 'The field "access token" is required.', code: 400, errorCode: "REQUIRE_ACCESS_TOKEN"});
    }
    var options = {
        'method': 'GET',
        'url': `https://api.reckon.com/r1/${req.body.bookId}/companyinfo`,
        'headers': {
          'Authorization': 'Bearer ' +req.body.access_token
        }
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        return res.send(response.body);
      });
}

exports.setSupport = async (req, res) => {
    const url = "/api/users/changeGlobalSupportRole";
    const token = req.session.token;
    const body = {
        is_support: req.body.is_support,
        user_id: req.body.user_id
    };
    const response = await baseService.getInstance().post(url, body, token, req);
    return res.send(JSON.parse(response.body));
}

async function updateDeviceToken(deviceId, companyId, staffId, deviceToken, os, token, req) {
    const url = "/api/users/updateDeviceToken";
    const body = { device_id: deviceId, staff_id: staffId, device_token: deviceToken, os, company_id: companyId };
    const response = await baseService.getInstance().post(url, body, token, req);
    return;
  }
exports.updateDeviceToken = updateDeviceToken;
  
async function removeDeviceToken(deviceId, staffId, token, req) {
    const url = "/api/users/removeDeviceToken";
    const body = { device_id: deviceId, staff_id: staffId};
    const response = await baseService.getInstance().post(url, body, token, req);
    return;
  }
exports.removeDeviceToken = removeDeviceToken;

exports.postLogoutAuto = async (req, res) => {
    const body = {
        device_id: req.session.device_id
    };
    if (req.session.role != "Admin") {
        const staff = await StaffModel.findOne({user_id: req.session.user._id});
        if (staff) {
            body.staff_id = staff._id;
            removeDeviceToken(req.session.device_id, staff._id, req.session.token, req);
        }
    }
    const token = req.session.token;
    const url = "/api/users/logout";
    const response = await baseService.getInstance().post(url, body, token, req);
    req.session.destroy();
    res.setHeader("Cache-Control", " no-cache, no-store, must-revalidate, max-age=120");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.redirect('/');
    return res.send({success: true, result: null, message: null});
}

const Employer_Terms = require('../../models/employer_terms')
const SettingModel = require('../../models/setting');
const path = require('path')

exports.downloadTermsAndConditions = async (req, res) => {
    
    const { params: { valid_parameter } } = req
    const isValid = await Employer_Terms.findOne({valid_parameter})

    if (!isValid) {
        return res.send('You are not authorized access to this file')
    }
    await Employer_Terms.findOneAndDelete({valid_parameter})

    return res.download(path.join(__dirname, '/../../assets/web-downloads/Employer_Terms_CashD_Oct_2021.pdf'))

}

exports.reckonTrial = async (req, res) => {
    const querySetting = await SettingModel.findOne();
    const currentEnv = process.env.TYPE.toLowerCase();
    const apiUrl = `https://${currentEnv === "prod" ? '' : currentEnv + '.'}web.cashd.com.au`;
    return res.render('auth/reckon-trial', {
        csrfToken: req.csrfToken(),
        pageName: "Reckon CashD Trial",
        apiUrl,
        countryCode: commonController.mobileCountryCode(),
        encryptionKey: querySetting.encryption_key
    })
}

exports.postReckonTrial = async (req, res) => {
    const body = {
        fee_modal: +req.query.fee_model,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email.trim().toLowerCase(),
        mobile_country_code: req.body.mobileCountryCode,
        mobile: req.body.mobile,
        company_name: req.body.companyName,
        is_nominate: req.body.isNominate === 'true' ? true : false,
        nominate_first_name: req.body.nominateFirstName ? req.body.nominateFirstName : null,
        nominate_last_name: req.body.nominateLastName ? req.body.nominateLastName : null,
        nominate_email: req.body.nominateEmail ? req.body.nominateEmail.trim().toLowerCase() : null,
        nominate_mobile_country_code: req.body.nominateCountryCode ? req.body.nominateCountryCode : null,
        nominate_mobile: req.body.nominateMobile ? req.body.nominateMobile : null,
        url: req.body.url
    };
    const url = "/api/users/reckon-cashd-trial";
    const response = await baseService.getInstance().post(url, body, null, req);
    const bodyParse = JSON.parse(response.body);
    return res.send(bodyParse);
}

exports.reckonCashDRegister = async (req, res) => {
    const { params: { id } } = req;
    const url = `/api/users/reckon-cashd-trial/${id}`;
    const response = await baseService.getInstance().get(url, null, req);
    let bodyParser = JSON.parse(response.body);
    const currentEnv = process.env.TYPE.toLowerCase();
    const apiUrl = `https://${currentEnv === "prod" ? '' : currentEnv + '.'}web.cashd.com.au`;
    return res.render('auth/cashd-onboarding', {
        csrfToken: req.csrfToken(),
        apiUrl,
        pageName: "CashD Onboarding",
        urlReckon: `https://identity.reckon.com/connect/authorize?client_id=${config.RECKON_CLIENT_ID}&response_type=code&scope=openid+read+write+offline_access&redirect_uri=${config.RECKON_REDIRECT_URL}&state=random_state&nonce=random_nonce`,
        userTrial: bodyParser?.result
    });
}

exports.registerReckonTrialCompany = async (req, res) => {
    const params = {   
        trial_user_id: req.body.trial_user_id,
        system_company: JSON.parse(req.body.system_company),
        system_user: JSON.parse(req.body.system_user)
    };
    const url = "/api/users/register-reckon-trial-company";
    const response = await baseService.getInstance().post(url, params, null, req);
    req.session.destroy();
    res.setHeader("Cache-Control", " no-cache, no-store, must-revalidate, max-age=120");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.send(response.body);
}

exports.getDirectDebitForm = async (req, res) => {
    const querySetting = await SettingModel.findOne();
    const currentEnv = process.env.TYPE.toLowerCase();
    const apiUrl = `https://${currentEnv === "prod" ? '' : currentEnv + '.'}web.cashd.com.au`;
    return res.render('auth/reckon-direct-debit-form', {
        title: "Direct Debit Request",
        csrfToken: req.csrfToken(),
        pageName: "direct-debit-request",
        apiUrl,
        encryptionKey: querySetting.encryption_key
    });
}

exports.postDirectDebitForm = async (req, res) => {
    const querySetting = await SettingModel.findOne();
    let body = {
        bank_account_name: req.body.bankAccountName,
        authorized: req.body.checkDDTerm,
        direct_debit_invitation_code: req.body.code,
        company_name: req.body.ddCompanyName
    };
    let account_number = await commonController.encryptKeyClient(
        querySetting.encryption_key,
        req.body.bankAccountNumber
    );
    let bsb = await commonController.encryptKeyClient(
        querySetting.encryption_key,
        req.body.bankBsb
    );
    body["account_number"] = account_number;
    body["bsb"] = bsb;
    const url = "/api/users/addFormDirectDebitFromInvitation";
    const response = await baseService.getInstance().post(url, body, null, req);
    return res.send(response.body);
}

exports.getEmployers = async (req, res) => {
    const {keyword, page, pageSize, companyId} = req.body;
    const sortColum = req.body["order[0][column]"];
    const value = req.body["order[0][dir]"] === "asc" ? 1 : -1;
    const nameFiled = {
        1: "NAME_PAYROLL",
        2: "LAST_NAME_PAYROLL",
        5: "NAME_CASHD",
        6: "LAST_NAME_CASHD"
    };
    const sortStyle = nameFiled[sortColum] , sortValue = value;
    const url = `/api/users/getEmployerSupervisors?keyword=${keyword}&page=${page}&pageSize=${pageSize}&sort_style=${sortStyle}&sort_value=${sortValue}`;
    const token = req.session.token;
    const body = {"company_id": companyId};
    const response = await baseService.getInstance().post(url, body, token, req);
    return res.send(response.body);
}

exports.sendDirectDebitFormInvitation = async (req, res) => {
    const path = "/api/users/sendDirectDebitFormInvitation";
    const {companyId, staffIds, url} = req.body;
    const  token = req.session.token;
    const body = {
        company_id: companyId,
        staff_ids: JSON.parse(staffIds),
        url
    };
    const response = await baseService.getInstance().post(path, body, token, req);
    return res.send(response.body);
}

