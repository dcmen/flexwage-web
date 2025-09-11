var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Astute_Employee = require("./astute_employee");
var Astute_Rate = require("./astute_rate");

var SchemaObject = new Schema({
  
    company_id:{
        type: Schema.Types.ObjectId,
        required: true
    },
    TSID: {
      type: String
    },
    CM_CID: {
      type: String
    },
    status: {
      type: String
    },
    //= 0: Pending, =1: Approved/Accepted, =4: Requested
    timesheet_line_status: {
      type: [Number],
      default: [0, 0, 0, 0, 0, 0, 0]
    },
    timesheet_line:{
      type: [Number],
      default: [0, 0, 0, 0, 0, 0, 0]
    },
    //Rate
    earning_rate: {
      type: mongoose.model('Astute_Rate').schema
    },
    employee:{
      type: mongoose.model('Astute_Employee').schema
    },
    UID: {
      type: String
    },
    user_id: {
      type: String
    },
    date: {
      type: Date
    },
    date_to: {
      type: Date
    },
    mon_start: {
      type: String
    },
    mon_finish: {
      type: String
    },
    mon_break: {
      type: String
    },
    tue_start: {
      type: String
    },
    tue_finish: {
      type: String
    },
    tue_break: {
      type: String
    },
    wed_start: {
      type: String
    },
    wed_finish: {
      type: String
    },
    wed_break: {
      type: String
    },
    thu_start: {
      type: String
    },
    thu_finish: {
      type: String
    },
    thu_break: {
      type: String
    },
    fri_start: {
      type: String
    },
    fri_finish: {
      type: String
    },
    fri_break: {
      type: String
    },
    sat_start: {
      type: String
    },
    sat_finish: {
      type: String
    },
    sat_break: {
      type: String
    },
    sun_start: {
      type: String
    },
    sun_finish: {
      type: String
    },
    sun_break: {
      type: String
    }
});

module.exports = mongoose.model('Astute_Timesheet', SchemaObject);
