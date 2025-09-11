// const fetch = require('node-fetch');
const moment = require('moment');

var http = require('../../config/http');
var SettingModel = require('../../models/setting');
const CompanyModel = require('../../models/company');
const CommontController = require('./commonController');
const baseService = require("../../service/baseService");

exports.getSettings = async function(req, res, next) {
    let setting = await SettingModel.findOne();
    const request = require('request');

    let url = "/api/users/getBankInforCashDAdmin";

    let messages = req.flash('error');

    const response = await baseService.getInstance().get(url, null, req);
    const body = JSON.parse(response.body);
    const { result } = body;
    if (result.bank_bsb_number_encryption) {
        result.bank_bsb_number_encryption = await CommontController.decryptionKeyClient(setting.encryption_key, result.bank_bsb_number_encryption);
    }
    if (result.bank_account_number_encryption) {
        result.bank_account_number_encryption = await CommontController.decryptionKeyClient(setting.encryption_key, result.bank_account_number_encryption);
    }
    return res.render('settings/form-settings', {
        data: result,
        title: 'Settings',
        pageName: 'settings',
        setting: setting,
        moment: moment,
        messages: messages,
        csrfToken: req.csrfToken(),
        key: setting.encryption_key
    }); 
};

exports.postSettings = async function(req, res, next) {
    let setting = await SettingModel.findOne();
    let {bank_bsb_number, bank_account_number} = req.body;
    let bank_account_number_encryption = await CommontController.encryptKeyClient(setting.encryption_key, bank_account_number);
    let bank_bsb_number_encryption = await CommontController.encryptKeyClient(setting.encryption_key, bank_bsb_number);
    const url = "/api/users/saveBankInforCashDAdmin";
    const body = {
        "bank_name" : req.body.bank_name,
        "bank_account_name" : req.body.bank_account_name,
        "bank_account_number_encryption" : bank_account_number_encryption,
        "bank_bsb_number_encryption" : bank_bsb_number_encryption,
        "bank_user_id" : req.body.bank_user_id,
        "bank_apca_id" : req.body.bank_apca_id,
        "bank_description" : req.body.bank_description,
        "bank_company_name" : req.body.bank_company_name
    };
    const response = await baseService.getInstance().post(url, body, null, req);
    if (response.statusCode !== 200) {
        // Print out the response body
        return res.send({success: false, result: null, messages: null, code: 200});
    }
    return res.send({success: true, result: null, messages: null, code: 200});
};

exports.postGeneralSettings = async function(req, res) {
    if(req.body.id_setting !== null && req.body.id_setting.trim() !== '') {
        const updateSetting = await SettingModel.findByIdAndUpdate({
            _id: req.body.id_setting
        },
        {
            $set: {
                transaction_fee_value: req.body.transaction_fee,
                transaction_fee_type: req.body.transaction_fee_type
            }
        });
        if (!updateSetting) {
            req.flash('errors', 'Add setting failed');
            res.redirect('back');
        } else {
            await CompanyModel.update({},
            {
                $set: {
                    transaction_fee_value: req.body.transaction_fee,
                    transaction_fee_type: req.body.transaction_fee_type
                }
            }, {
                multi: true
            });
        }
    } else {
        var setting = new SettingModel({
            transaction_fee: req.body.transaction_fee
        });
        setting.save();
    } 
    return res.redirect('/admin/settings');
};

exports.postGeneralSettingsRate = async (req, res) => {
    await SettingModel.findByIdAndUpdate({
        _id: req.body.id_setting
    },
    {
        $set: {
            frequency_transaction_of_rate: req.body.frequency_transaction_of_rate
        }
    });
    
    await CompanyModel.update({}, {
            $set: {
                frequency_transaction_of_rate: req.body.frequency_transaction_of_rate
            }
        }, {
            multi: true
    });

    return res.redirect('/admin/settings');
}

