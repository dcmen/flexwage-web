var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({

  company_id: {
    type: Schema.Types.ObjectId
  },
  payScheduleId:{
    type: String
  },
  name: {
    type: String
  },
  frequency: {
    type: String
  },
  lastPayRun: {
    type: String
  },
  lastDatePaid: {
    type: String
  },
  schedule_sub_date: {
    type: Number
  },
  schedule_minute_time: {
    type: Number
  }
});

module.exports = mongoose.model('Keypay_Pay_Schedule', SchemaObject);
