var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    name: {
      type: String
    },
    type: {
      type: String
    }
});

module.exports = mongoose.model('Xero_Tax_Account', SchemaObject);
