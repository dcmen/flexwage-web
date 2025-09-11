var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Xero_Timesheet_Request_Line = require("./xero_timesheet_request_line");

var SchemaObject = new Schema({
    staff_id: {
      type: Schema.Types.ObjectId,
      required: true
    },  
    timesheet_id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    status: {
      type: String,
      default:'PENDING'
    },
    position_in_timesheetline: {
      type: Number,
      default:0
    },
    request_lines: {
      type: [mongoose.model('Xero_Timesheet_Request_Line').schema],
      default: []
    },
    created_date: {
      type: Date,
      default: new Date()
    }
});

module.exports = mongoose.model('Xero_Timesheet_Request', SchemaObject);
