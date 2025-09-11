var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
  staff_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  system_employee_id : {
    type: String
  },
  company_id : {
    type: Schema.Types.ObjectId,
    required: true
  },
  device_id: {
    type: String,
    required: true
  },
  device_token: {
    type: String,
    required: true
  },
  //0: Android, 1: IOS
  os: {
    type: Number
  },
  created_date: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model('Device', DeviceSchema);
