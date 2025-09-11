var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Keypay_Break = require("./keypay_break");

var SchemaObject = new Schema({
  company_id:{
    type: Schema.Types.ObjectId,
    required: true
  },
  timesheetId: {
      type: String
  },
  employeeId:{
    type: String
  },
  startTime: {
      type: String
  },
  endTime: {
      type: String
  },
  workedHours: {
    type: Number
  },
  breakHours: {
    type: Number
  },
  workTypeId: {
    type: String
  },
  locationId: {
    type: String
  },
  breaks: {
    type: [mongoose.model('Keypay_Break').schema]
  },
  status: {
    type: String
  },
  CasdDStatus: {
    type: Number,
    default: 0
  },
  fullyQualifiedLocationName: {
    type: String
  },
  submittedByUser: {
    type: String
  }
});

module.exports = mongoose.model('Keypay_Timesheet', SchemaObject);

