var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CycleSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId
  },
  name: {
    type: String,
    required: true
  },
  cycle_system_id: {
    type: Number,
    required: true
  },
  cycle_type: {
    type: String,
    required: true
  },
  created_date: {
    type: Date,
    default:  Date.now
  }
});

module.exports = mongoose.model('Cycle', CycleSchema);
