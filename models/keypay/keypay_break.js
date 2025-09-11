var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({

  startTime:{
    type: String
  },
  endTime: {
      type: String
  }
  
});

module.exports = mongoose.model('Keypay_Break', SchemaObject);
