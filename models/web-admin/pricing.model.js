const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  diskSpace: { type: String, required: true },
  subdomains: { type: Number, required: true },
  emailAccounts: { type: Number, required: true },
  webmailSupport: { type: Boolean, required: true },
  offers: { type: String, required:true },
  status: { type: Boolean, required: true }
});

const pricing = mongoose.model('Pricing', schema, 'pricings');
module.exports = pricing;
