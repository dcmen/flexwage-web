var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
  date: {
      type: String
  },
  payrollPayItemId: {
      type: String
  },
  status: {
    type: String
  },
  CasdDStatus: {
    type: Number,
    default: 0
  },
  workedHours: {
    type: Number
  }
});

module.exports = mongoose.model('Reckon_Timesheet', SchemaObject);

