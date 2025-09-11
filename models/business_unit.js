var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BusinessUnitSchema = new Schema({
  name: {
    type: String
  },
  company_id: {
    type: Schema.Types.ObjectId
  },
  fee_type: {
    type: String //COMPANY / FREE
  },
  created_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Business_Unit", BusinessUnitSchema);
