var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
    company_id: {
        type: Schema.Types.ObjectId
    },
    system_brand_id: {
        type: Schema.Types.ObjectId
    },
    brand_name: {
        type: String,
        default: null
    },
    code: {
        type: Number,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    created_date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Company_Brand', CompanySchema);
