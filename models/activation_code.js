var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Company = require("./company");
var Staff = require("./staff");
var System = require("./system");

var UserSchema = new Schema({
    activation_code: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    fullname: {
        type: String
    },
    email: {
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
    created_date: {
        type: Date,
        default: new Date()
    },
    company_infor:  mongoose.model('Company').schema,
    staff_infor:  mongoose.model('Staff').schema,
    system_infor:  mongoose.model('System').schema
});
module.exports = mongoose.model('Activation_Code', UserSchema);
