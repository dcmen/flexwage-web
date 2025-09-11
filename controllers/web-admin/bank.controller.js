const mongoose = require('mongoose');
const SettingModel = require('../../models/setting');
const BankInfoModel = require('../../models/bank_infor');
const CommontController = require('../web-admin/commonController');

exports.postBank = async (req, res) => {
  const setting = await SettingModel.findOne();
  const bankInfo = await BankInfoModel.find({company_id: mongoose.Types.ObjectId(req.body.companyId)});
  const bodyBankInfo = JSON.parse(req.body.bodyBankInfo);
  let bank_account_number_encryption = await CommontController.encryption(setting.encryption_key, bodyBankInfo.bank_account_number);
  let bank_bsb_number_encryption = await CommontController.encryption(setting.encryption_key, bodyBankInfo.bank_bsb_number);
  //create bank info
  if (bankInfo.length == 0) {
    await BankInfoModel.create({
      "bank_name" : bodyBankInfo.bank_name,
      "bank_account_name" : bodyBankInfo.bank_account_name,
      "bank_account_number_encryption" : bank_account_number_encryption,
      "bank_bsb_number_encryption" : bank_bsb_number_encryption,
      "bank_user_id" : bodyBankInfo.bank_user_id,
      "bank_apca_id" : bodyBankInfo.bank_apca_id,
      "bank_description" : bodyBankInfo.bank_description,
      "bank_company_name" : bodyBankInfo.bank_company_name,
      "is_cashd_admin": 0,
      "company_id": mongoose.Types.ObjectId(req.body.companyId)
    });
  } else {
    //update bank info
    await BankInfoModel.update({company_id: req.body.companyId}, {
      $set: {
        "bank_name" : bodyBankInfo.bank_name,
        "bank_account_name" : bodyBankInfo.bank_account_name,
        "bank_account_number_encryption" : bank_account_number_encryption,
        "bank_bsb_number_encryption" : bank_bsb_number_encryption,
        "bank_user_id" : bodyBankInfo.bank_user_id,
        "bank_apca_id" : bodyBankInfo.bank_apca_id,
        "bank_description" : bodyBankInfo.bank_description,
        "bank_company_name" : bodyBankInfo.bank_company_name
      }
    });
  }

  return res.send({success: true, result: null});
}

exports.getFunds = async (req, res) => {
  return res.send({result: [], totalItem: 0});
}