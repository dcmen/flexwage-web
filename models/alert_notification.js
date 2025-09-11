var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlertNotificationSchema = new Schema({
    sender_staff_id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    receiver_staff_id : {
      type: Schema.Types.ObjectId,
      required: true
    },
    system_code : {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    request_date:{
        type: String
    },
    reference_timsheet_id: {
      type: Schema.Types.ObjectId
    },
    reference_request_id: {
      type: Schema.Types.ObjectId
    },
    position_in_timesheetline: {
      type: Number
    },
    created_date: {
      type: Date,
      default: new Date()
    }
});

module.exports = mongoose.model('Alert_Notification', AlertNotificationSchema);
