var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    earnings_rate_id: {
      type: String
    },  
    actually_hours: {
      type: Number
    }
});

module.exports = mongoose.model('Xero_Timesheet_Request_Line', SchemaObject);
