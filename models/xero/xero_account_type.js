var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    name: {
      type: String
    },
    accounts: [mongoose.model('Xero_Tax_Account').schema]
});

module.exports = mongoose.model('Xero_Account_Type', SchemaObject);
