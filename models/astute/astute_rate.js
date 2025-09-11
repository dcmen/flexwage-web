var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    UID: {
      type: String
    },
    PRID: {
      type: String
    },
    pay_rate: {
      type: String
    },
    pay_oncosts: {
      type: String
    },
    pay_charge_rate: {
      type: String
    }
});

module.exports = mongoose.model('Astute_Rate', SchemaObject);
