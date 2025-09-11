const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  imagePath: { type: String, required: true },
  status: { type: Boolean, required: true }
});

module.exports = mongoose.model('Screenshot', schema);
