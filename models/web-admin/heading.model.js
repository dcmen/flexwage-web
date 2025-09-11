const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  title: { type: String },
  description: { type: String },
  imagePath: { type: String },
  code: { type: String, required: true },
  status: { type: Boolean, required: true }
});

module.exports = mongoose.model('Heading', schema);
