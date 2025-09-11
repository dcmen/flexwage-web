var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
  isbn: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId
  },
  publisher: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Book', BookSchema);
