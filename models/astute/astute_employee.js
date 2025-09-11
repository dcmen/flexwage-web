var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
    UID: {
      type: String
    },
    MID: {
      type: String
    },
    id: {
      type: String
    },
    name_first: {
      type: String
    },
    name_last: {
      type: String
    },
    pay_frequency: {
      type: String
    },
    email: {
      type: String
    }
});

module.exports = mongoose.model('Astute_Employee', SchemaObject);
