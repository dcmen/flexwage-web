const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  information: [{
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: true }
  }],
  social: [{
    facebook: { type: String, required: true },
    google: { type: String, required: true },
    twitter: { type: String, required: true },
    instagram: { type: String, required: true }
  }],
  seo: [{
    title: { type: String, required: true },
    keyword: { type: String, required: true },
    content: { type: String, required: true }
  }],
  map: [{
    longtitude: { type: String, required: true },
    latitude: { type: String, required: true }
  }]
});

module.exports = mongoose.model('Config', schema);
