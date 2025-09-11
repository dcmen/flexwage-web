const mongoose = require("mongoose");

const { readFileSize } = require("../../helpers/helper");
let RetailerModel = require("../../models/web-admin/retailer.model");
let BankModel = require("../../models/bank_infor");
const CommontController = require("./commonController");

exports.getRetailers = async (req, res) => {
  let messagesSuc = req.flash("success");
  let retailers = await RetailerModel.find();
  return res.render("retailer/table-retailer", {
    title: "Retailer",
    pageName: "retailers",
    retailers: retailers,
    csrfToken: req.csrfToken(),
    messagesSuc: messagesSuc,
  });
};

exports.getAddRetailer = async (req, res) => {
  let messages = req.flash("error");
  let messagesSuc = req.flash("success");
  return res.render("retailer/add-retailer", {
    title: "Create Retailer",
    pageName: "retailers",
    csrfToken: req.csrfToken(),
    messagesErr: messages,
    messagesSuc: messagesSuc,
  });
};

exports.postAddRetailer = async (req, res) => {
  if (!req.body.bank_name) {
    return res.status(400).send({
      success: false,
      result: null,
      message: 'The field "bank_name" is required.',
      code: 400,
      errorCode: "REQUIRE_BANKNAME",
    });
  }
  if (!req.body.name) {
    return res.status(400).send({
      success: false,
      result: null,
      message: 'The field "name" is required.',
      code: 400,
      errorCode: "REQUIRE_NAME",
    });
  }
  if (!req.body.phone) {
    return res.status(400).send({
      success: false,
      result: null,
      message: 'The field "phone" is required.',
      code: 400,
      errorCode: "REQUIRE_PHONE",
    });
  }
  if (!req.body.email) {
    return res.status(400).send({
      success: false,
      result: null,
      message: 'The field "email" is required.',
      code: 400,
      errorCode: "REQUIRE_EMAIL",
    });
  }
  if (!req.body.address) {
    return res.status(400).send({
      success: false,
      result: null,
      message: 'The field "address" is required.',
      code: 400,
      errorCode: "REQUIRE_ADDRESS",
    });
  }
  if (!req.body.website) {
    return res.status(400).send({
      success: false,
      result: null,
      message: 'The field "website" is required.',
      code: 400,
      errorCode: "REQUIRE_WEBSTILE",
    });
  }
  if (!req.body.bank_account_number) {
    return res.status(400).send({
      success: false,
      result: null,
      message: 'The field "bank_account_number" is required.',
      code: 400,
      errorCode: "REQUIRE_BANK_ACCOUNT_NUMBER",
    });
  }
  if (!req.body.bank_bsb_number) {
    return res.status(400).send({
      success: false,
      result: null,
      message: 'The field "bank_bsb_number" is required.',
      code: 400,
      errorCode: "REQUIRE_BANK_BSB_NUMBER",
    });
  }

  let retailer = new RetailerModel();
  retailer.name = req.body.name;
  retailer.phone = req.body.phone;
  retailer.email = req.body.email;
  retailer.address = req.body.address;
  retailer.website = req.body.website;
  retailer.status = true;
  retailer.encryption_key = await generateEncryptionKey(16);
  retailer.retailer_code = retailer.id + '.' + await generateEncryptionKey(10);
  let bank_account_number_encryption = await CommontController.encryption(
    retailer.encryption_key,
    req.body.bank_account_number
  );
  let bank_bsb_number_encryption = await CommontController.encryption(
    retailer.encryption_key,
    req.body.bank_bsb_number
  );

  try {
    await retailer.save();
    let bankInfor = new BankModel();
    bankInfor.retailer_id = retailer._id;
    bankInfor.bank_name = req.body.bank_name;
    bankInfor.bank_account_number_encryption = bank_account_number_encryption;
    bankInfor.bank_bsb_number_encryption = bank_bsb_number_encryption;
    await bankInfor.save();
    req.flash("success", "Add retailer successfully");
    return res.redirect("/admin/retailers");
  } catch (error) {
    console.log(error);
    req.flash("errors", "Add new retailer failed");
    return res.redirect("/admin/retailer");
  }
};

exports.postEditRetailer = async (req, res) => {
  let { id } = req.params;
  let formRetailer = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    website: req.body.website
  };
  let formBank = {
    bank_name: req.body.bank_name,
  };

  try {
    var retailer = await RetailerModel.findOneAndUpdate(
      {
        _id: id,
      },
      formRetailer,
      {
        new: true,
      }
    );
  
    formBank.bank_account_number_encryption = await CommontController.encryption(
      retailer.encryption_key,
      req.body.bank_account_number
    );
    formBank.bank_bsb_number_encryption = await CommontController.encryption(
      retailer.encryption_key,
      req.body.bank_bsb_number
    );
    await BankModel.findOneAndUpdate({_id: req.body.bank_id}, formBank, {new: true});
    req.flash("success", "Edit retailer successfully");
    return res.redirect(`/admin/retailers`);
  } catch (error) {
    console.log(error);
    req.flash("errors", "Edit retailer failed");
    return res.redirect("back");
  }
};

exports.getRetailerDetail = async (req, res) => {
  let messages = req.flash("error");
  let messagesSuc = req.flash("success");
  let retailers = await RetailerModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      $lookup: {
        from: "bank_infors",
        localField: "_id",
        foreignField: "retailer_id",
        as: "bank",
      },
    },
    {
      $unwind: "$bank",
    },
  ]);

  var retailer = retailers[0];

  if (retailer.bank.bank_bsb_number_encryption) {
    retailer.bank.bank_bsb_number_encryption = await CommontController.decryption(
      retailer.encryption_key,
      retailer.bank.bank_bsb_number_encryption
    );
  }
  if (retailer.bank.bank_account_number_encryption) {
    retailer.bank.bank_account_number_encryption = await CommontController.decryption(
      retailer.encryption_key,
      retailer.bank.bank_account_number_encryption
    );
  }

  return res.render("retailer/detail-retailer", {
    title: "Retailer",
    pageName: "retailer",
    retailer: retailer,
    csrfToken: req.csrfToken(),
    messagesErr: messages,
    messagesSuc: messagesSuc,
  });
};

exports.deletteRetailer = async (req, res) => {
  let {id} = req.body;
  try {
    await RetailerModel.findOneAndRemove({_id: id}); 
    req.flash("errors", "Delete retailer successfully");
    return res.redirect("back");
  } catch (error) {
    req.flash("errors", "Delete retailer failed");
    return res.redirect("back");
  }
}

async function generateEncryptionKey(number) {
  var result = "";
  var characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var charactersLength = characters.length;
  for (var i = 0; i < number; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
