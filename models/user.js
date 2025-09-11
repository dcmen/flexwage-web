var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var Company = require("../models/company");
var Staff = require("../models/staff");
var System = require("../models/system");
var Notification_Company_Setting = require("./notification_company_settings");
var Salary_Wag = require("../models/salary_wag");

var UserSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String
    },
    fullname: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    birth_date: {
        type: Date,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    mobile: {
        type: String,
        default: null
    },
    avatar_path: {
        type: String,
        default: null
    },
    system_id: {
        type: Schema.Types.ObjectId,
        default: null
    },
    role: {
        type: Schema.Types.Number,
        default: 0
    },
    //0-PENDING, 1-ACTIVE, 2-INACTIVE
    is_active: {
        type: Schema.Types.Number,
        default: 1
    },
    is_first_login: {
        type: Schema.Types.Number,
        default: 1
    },
    is_block: {
        type: Number,
        default: 0
    },
    created_date: {
        type: Date,
        default: new Date()
    },
    company_infor: mongoose.model('Company').schema,
    staff_infor: mongoose.model('Staff').schema,
    system_infor: mongoose.model('System').schema,
    notification_company_settings: [mongoose.model('Notification_Company_Setting').schema],
    salary_wag_settings: [mongoose.model('Salary_Wag').schema],
    allowance_ratio: {
        type: Number,
        default: 50
    },
    mobile_country_code: {
        type: Number
    },
    address_line_1: {
        type: String,
        default: null
    },
    address_line_2: {
        type: String,
        default: null
    },
    address_line_3: {
        type: String,
        default: null 
    },
    address_line_city: {
        type: String,
        default: null
    },
    address_line_suburb_id: {
        type: Schema.Types.ObjectId,
        default: null
    },
    address_line_state_id: {
        type: Number,
        default: null
    },
    address_country_id: {
        type: Number,
        default: null
    },
    postcode: {
        type: String,
        default: null
    },
    //"MANAGER"
    user_role: {
        type: String,
        default: null
    },
    is_support: {
        type: Boolean,
        default: false
    },
    //"Bypass 2fa"
    bypass_2fa:{
        type: Boolean,
        default: false
    },
    is_admin_invitation_accepted: {
        type: Boolean,
        default: false
    },
    is_admin_invitation_sent: {
        type: Boolean,
        default: false
    }
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
