var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SuburbSchema = new Schema({
  name: {
    type: String,
    default: null,
  },
  state_id: {
    type: Number,
    default: 0,
  },
  state_code: {
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
  latitude: {
    type: String,
    default: null,
  },
  longitude: {
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
  created_date: {
    type: Date,
    default: new Date(),
  },
  modified_at: {
    type: Date,
    default: new Date(),
  }
});

module.exports = mongoose.model("Suburb", SuburbSchema);
