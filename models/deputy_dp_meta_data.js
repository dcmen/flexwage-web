var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require("./deputy_employee_infor");
require("./deputy_operational_unit_object");

var SchemaObject = new Schema({
    System: {
      type: String
    },
    CreatorInfo:  mongoose.model('Deputy_Employee_Infor').schema,
    EmployeeInfo:  mongoose.model('Deputy_Employee_Infor').schema,
    OperationalUnitInfo:  mongoose.model('Deputy_Operational_Unit_Object').schema
});

module.exports = mongoose.model('Deputy_DP_Meta_Data', SchemaObject);
