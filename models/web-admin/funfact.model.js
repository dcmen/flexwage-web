const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  iconClass: { type: String, required: true },
  title: { type: String, required: true },
  countNum: { type: String, required: true },
  status: { type: Boolean, required: true }
});

module.exports = mongoose.model('Funfact', schema);
