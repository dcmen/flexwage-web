var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LenderLinkCompanySchema = new Schema({
    lender_id: {
      type: Schema.Types.ObjectId,
      require: true
    },
    company_id: {
      type: Schema.Types.ObjectId,
      require: true
    },
    is_active: {
      type: Boolean,
      default: false
    },
    created_date: {
      type: Date,
      default: Date.now
    }
});

module.exports = mongoose.model('Lender_link_company', LenderLinkCompanySchema);
