var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaObject = new Schema({
    
  strTypeName: {
      type: String
  },
  strState: {
      type: String
  },
  intStart: {
      type: Number
  },
  intEnd: {
      type: Number
  }
});

module.exports = mongoose.model('Deputy_Slot', schemaObject);
