const BusinessModel = require('../../models/business_unit');
const mongoose = require("mongoose");

const getBusiness = async (req, res) => {
  const { page, pageSize, searchKey, companyId} = req.body;

  let condition = [
    { company_id: mongoose.Types.ObjectId(companyId) },
    {
      name: new RegExp(searchKey, "i")
    },
  ];

  const businessPromise = BusinessModel.aggregate([
    { 
      $match: {
        $and: condition
      } 
    },
    { $sort: { name: 1 } },
    { $skip: +page * +pageSize },
    { $limit: +pageSize },
  ]);

  let totalPromise = 0;
  if (+page === 0) {
    totalPromise = BusinessModel.count({$and: condition});
  }

  const [total, business] = await Promise.all([ totalPromise, businessPromise]);

  return res.send(JSON.stringify({total, result: business}));
}

const setupFeeTypeBusiness = async (req, res) => {
  const business = JSON.parse(req.body.business);
  for (let index = 0; index < business.length; index++) {
    const element = business[index];
    await BusinessModel.findByIdAndUpdate({_id: element.id}, {$set: { fee_type: element.feeType }});
  }
  return res.send(JSON.stringify({result: null, success: true}));
}

module.exports = {
  getBusiness,
  setupFeeTypeBusiness
};