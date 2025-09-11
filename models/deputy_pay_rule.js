var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaObject = new Schema({
    
    Id: {
        type: String
    },
    PayTitle: {
        type: String
    },
    HourlyRate: {
        type: Number
    },
    PayrollCategory: {
        type: String
    },
    Comment: {
        type: String
    }
});

module.exports = mongoose.model('Deputy_Pay_Rule', schemaObject);
