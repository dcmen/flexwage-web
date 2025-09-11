var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    Id: {
      type: Number
    },
    DisplayName: {
      type: String
    },
    EmployeeProfile: {
      type: Number
    },
    Employee: {
      type: Number
    },
    Photo: {
      type: String
    }
});

module.exports = mongoose.model('Deputy_Employee_Infor', SchemaObject);
