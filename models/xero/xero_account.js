var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaObject = new Schema({
  company_id: {
    type: Schema.Types.ObjectId
  },  
  AccountID: {
      type: String
    },
    Code: {
      type: String
    },
    Name: {
      type: String
    },
    Status: {
      type: String
    },
    Type: {
      type: String
    },
    TaxType: {
      type: String
    },
    Description: {
      type: String
    },
    Class: {
      type: String
    },
    EnablePaymentsToAccount: {
      type: Boolean
    },
    ShowInExpenseClaims: {
      type: Boolean
    },
    HasAttachments: {
      type: Boolean
    },
    AddToWatchlist: {
      type: Boolean
    },
});

module.exports = mongoose.model('Xero_Account', SchemaObject);
