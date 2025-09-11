const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: { type: String, required: true },
  createTime: { type: String, required: true },
  imagePath: { type: String, required: true },
  shortContent: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  tagID: { type: Array, required: true },
  categoryID: { type: String, required: true },
  status: { type: Boolean, required: true }
});

module.exports = mongoose.model('Post', schema);
