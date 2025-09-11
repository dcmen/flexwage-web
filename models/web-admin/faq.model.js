const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  answer: { type: String, required: true },
  question: { type: String, required: true },
  code: { type: String, required: true },
  status: { type: Boolean, required: true }
});

module.exports = mongoose.model('Faq', schema);
