var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
    created_date: {
      type: Date,
      default: new Date()
    }
});

module.exports = mongoose.model('Reckon_Timesheet_Request', SchemaObject);
