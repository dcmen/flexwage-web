var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CountrySchema = new Schema({
  id_key: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: null,
  },
  iso3: {
      type: String,
    default: null,
  },
  iso2: {
    type: String,
    default: null,
  },
  phone_code: {
    type: String,
    default: null,
  },
  capital: {
    type: String,
    default: null,
  },
  currency: {
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

module.exports = mongoose.model("Country", CountrySchema);
