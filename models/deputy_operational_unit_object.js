var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaObject = new Schema({
    Id: {
      type: Number
    },
    Creator: {
        type: Number
    },
    Company: {
        type: Number
    },
    OperationalUnitName: {
        type: String
    },
    CompanyName: {
        type: String
    },
    Active: {
        type: Boolean
    }
});

module.exports = mongoose.model('Deputy_Operational_Unit_Object', schemaObject);
