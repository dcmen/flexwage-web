var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require("./deputy_slot");
require("./deputy_operational_unit_object");
require("./deputy_dp_meta_data");
require("./deputy_pay_rule");

var schemaObject = new Schema({
    company_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    CashDStatus: {
        type: Number,
        default: 0
    },
    TimesheetId: {
        type: Number
    },
    //TIMESHEET or ROSTER
    Type: {
        type: String
    },
    Id: {
        type: Number
    },
    Employee: {
        type: String
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
    Slots: [mongoose.model('Deputy_Slot').schema],
    OperationalUnitObject: mongoose.model('Deputy_Operational_Unit_Object').schema,
    _DPMetaData: mongoose.model('Deputy_DP_Meta_Data').schema,
    PayRuleObject: mongoose.model('Deputy_Pay_Rule').schema,
    created_date: {
        type: Date,
        default: new Date()
    }
});


schemaObject.index({
    company_id: 1,
    TimesheetId: 1,
    Type: 1

})

module.exports = mongoose.model('Deputy_Timesheet', schemaObject);
