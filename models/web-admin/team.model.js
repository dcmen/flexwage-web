const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  imagePath: { type: String, required: true },
  name: { type: String, required: true },
  position: { type: String, required: true },
  description: { type: String, required: true },
  facebook: { type: String, required: true },
  google: { type: String, required: true },
  twitter: { type: String, required: true },
  instagram: { type: String, required: true },
  status: { type: Boolean, required: true }
});

const pricing = mongoose.model('Team', schema, 'teams');
module.exports = pricing;
