var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
  group_name: {
    type: String,
    required: true
  },
  logo: {
    type: String
  },
  manager_ids: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  company_ids: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  //0 = Pending, 1 = Active, 2 Inactive
  is_active: {
    type: Schema.Types.Number,
    default: 1
  },
  updated_date: {
    type: Date,
    default:  Date.now
  },
  created_date: {
    type: Date,
    default:  Date.now
  }
});

module.exports = mongoose.model('Group', GroupSchema);
