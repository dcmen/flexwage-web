const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const retailerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
    },
    website: {
        type: String
    },
    encryption_key : {
        type: String
    },
    retailer_code : {
        type: String
    },
    status: {
        type: Boolean,
    }
});

module.exports = mongoose.model('retailer', retailerSchema);