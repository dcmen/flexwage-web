const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  imagePath: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  linkButton1: { type: String, required: true },
  linkButton2: { type: String, required: true }
});

module.exports = mongoose.model('About', schema);
