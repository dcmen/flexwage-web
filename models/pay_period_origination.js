var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PayPeriodOriginationSchema = new Schema({
    company_id: {
      type: Schema.Types.ObjectId
    },
    pay_period_system_id: {
      type: Schema.Types.ObjectId
    },
    name: {
      type: String,
      default: null
    },
    start_date: {
      type: Date
    },
    cycle_system_id:{
      type: Schema.Types.ObjectId
    },
    cycle_id: {
      type: Schema.Types.ObjectId
    },
    created_date: {
      type: Date,
      default: new Date()
    },
    schedule_sub_date: {
      type: Number
    },
    schedule_minute_time: {
      type: Number
    }
});

module.exports = mongoose.model('pay_period_origination', PayPeriodOriginationSchema);
