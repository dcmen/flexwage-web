var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Deputy_Slot = require("./deputy_slot");
var Deputy_Operational_Unit_Object = require("./deputy_operational_unit_object");
var Deputy_DP_Meta_Data = require("./deputy_dp_meta_data");

var schemaObject = new Schema({
    company_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    staff_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    Id: {
        type: Number
    },
    System: {
        type: String
    },
    Creator: {
        type: Number
    },
    Employee: {
        type: Number
    },
    StartTimeLocalized: {
        type: String
    },
    EndTimeLocalized: {
        type: String
    },
    Date: {
        type: String
    },
    ComparingDate: {
        type: String
    },
    Mealbreak: {
        type: String
    },
    Slots: {
        type: String
    },
    OperationalUnit: {
        type: Number
    },
    OperationalUnitObject: {
        type: String
    },
    MatchedByTimesheet: {
        type: Number
    },
    TotalTime: {
        type: Number
    },
    Roster: {
        type: Number
    },
    TimeApproved: {
        type: Boolean
    },
    Discarded: {
        type: Boolean
    },
    PayRuleApproved: {
        type: Boolean
    },

    PayStaged: {
        type: Boolean
    },
    AutoTimeApproved: {
        type: Boolean
    },
    AutoPayRuleApproved: {
        type: Boolean
    },
    DPMetaData: {
        type: String
    },
    Slots:  [mongoose.model('Deputy_Slot').schema],
    OperationalUnitObject:  mongoose.model('Deputy_Operational_Unit_Object').schema,
    _DPMetaData:  mongoose.model('Deputy_DP_Meta_Data').schema,
    CashDStatus: {
        type: Number,
        default: 0
    },
    created_date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Deputy_Timesheet_Withdraw_Request', schemaObject);
