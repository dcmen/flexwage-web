var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CodeForgotPasswordSchema = new Schema({
  code: {
    type: String
  },
  email: {
    type: String
  },
  type: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 0
  },
  created_date: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model('Code_Forgot_Password', CodeForgotPasswordSchema);
