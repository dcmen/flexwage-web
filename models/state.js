var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var StateSchema = new Schema({
  id_key: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: null,
  },
  country_id: {
    type: Number,
    default: 0,
  },
  country_code: {
    type: String,
    default: null,
  },
  fips_code: {
    type: String,
    default: null,
  },
  iso2: {
    type: String,
    default: null,
  },
  flag: {
    type: Number,
    default: 1,
  },
  wikiDataId: {
    type: String,
    default: null,
  },
  created_date: {
    type: Date,
    default: new Date(),
  },
  modified_at: {
    type: Date,
    default: new Date(),
  }
});

module.exports = mongoose.model("State", StateSchema);
