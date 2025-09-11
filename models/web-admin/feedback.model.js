const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  imagePath: { type: String, required: true },
  name: { type: String, required: true },
  occupations: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: Boolean, required: true }
});

const pricing = mongoose.model('Feedback', schema, 'feedbacks');
module.exports = pricing;
