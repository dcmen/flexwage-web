var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Locationschema = new Schema({
    company_id: {
        type: Schema.Types.ObjectId
    },
    system_location_id: {
        type: String
    },
    parent_id: {
        type: String
    },
    name: {
        type: String
    },
    fully_qualified_name: {
        type: String
    },
    is_global:{
        type: Boolean
    }
});

module.exports = mongoose.model('KeyPay_Location', Locationschema);
