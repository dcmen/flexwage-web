const UserModel = require('../../models/web-admin/user.model');
const StaffModel = require('../../models/staff');
const BlogModel = require('../../models/web-admin/post.model');
const CompanyModel = require('../../models/company');
const DeductionModel = require('../../models/deduction');
const moment = require('moment');

exports.getDashboard = async (req, res) => {
  let countStaff = await StaffModel.countDocuments();
  let countDeduction = await DeductionModel.countDocuments();
  let countCompany = await CompanyModel.countDocuments();
  const companyId = req.session.company_id;
  const role = req.session.role;
  const endDate = moment(Date.now()).format('YYYY-MM-DD');
  const endDateToString = new Date(endDate);
  //get startDate, endDate for Daily
  const startDateDaily = moment(endDate).subtract(30, 'days').format('YYYY-MM-DD');
  const startDateDailyToString = new Date(startDateDaily);
  //get startDate, endDate for Weekly
  const startDateWeekly = moment(endDate).subtract(6, 'month').format('YYYY-MM-DD');
  const startDateWeeklyToString = new Date(startDateWeekly);
  //get startDate, endDate for Fornightly
  const startDateFornightly = moment(endDate).subtract(1, 'year').format('YYYY-MM-DD');
  const startDateFornightlyToString = new Date(startDateFornightly);
  //get startDate, endDate for Monthly
  const startDateMonthly = moment(endDate).subtract(2, 'year').format('YYYY-MM-DD');
  const startDateMonthlyToString = new Date(startDateMonthly);

  let filterDaily = { "created_date": { $gte: startDateDailyToString, $lt: endDate} };;
  if (role != 'Admin') {
    filterDaily = {
      $and: [
        { "created_date": { $gte: startDateDailyToString, $lt: endDate} },
        { company_id: companyId }
      ]
    };
  }
  const queryStaffInDaily = StaffModel.aggregate([{$match: filterDaily }]);

  const queryCompanyInDaily = CompanyModel.aggregate([{$match: filterDaily }]);

  const queryDeductionInDaily = DeductionModel.aggregate([{$match: filterDaily }]);

  const [listStaffInDaily, listCompanyInDaily, listDeductionInDaily] = await Promise.all([
    queryStaffInDaily,
    queryCompanyInDaily,
    queryDeductionInDaily
  ]);

  const queryMain = (startDate, endDate, groupQuery, dataDaily) => {
    let filterMain = { "created_date": { $gte: startDate, $lt: endDate} };
    //check employer login
    if (role != 'Admin') {
      filterMain = {
        $and: [
          { "created_date": { $gte: startDate, $lt: endDate} },
          { company_id: companyId }
        ]
      };
    }
    if (dataDaily && dataDaily.length == 0) {
      filterMain = {};
    }
    return [
      { $match: filterMain },
      { $addFields: { 
        createdDate: { $dateFromParts: {
            year:{$year:"$created_date"},
            month:{$month:"$created_date"},
            day:{$dayOfMonth:"$created_date"}
        }},
        dateRange:{$map:{
          input:{$range:[0, 
            {$add:[
                {$divide: [{$subtract:[endDate, startDate]}, 1000*60*60*24]}, 1
            ]} 
          ]},
          in:{$add:[startDate, {$multiply:["$$this", 1000*60*60*24]}]}
        }}
      }},
      { $unwind: "$dateRange" },
      {$group:{
        _id: groupQuery._id,
        createdDate: {$last: "$dateRange"},
        count:{$sum:{$cond:[{$eq:["$dateRange","$createdDate"]},groupQuery.count,0]}}
      }},
      {$sort:{createdDate:1}},
      {$project:{
        _id:0,
        createdDate: groupQuery.createdDate,
        total:"$count"
      }}
    ]
  }
  //query get statistics daily
  const queryStatisticsDaily = (isAmount = 0, dataDaily) => {
    const groupQuery = {
      _id: "$dateRange",
      createdDate: { $dateToString: { format: "%Y-%m-%d", date: "$createdDate"}}
    };
    if (isAmount == 0) {
      groupQuery.count = 1;
    } else if (isAmount == 1) {
      groupQuery.count = "$fee_amount";
    } else {
      groupQuery.count = "$total_deduction"
    }
    const queryFormat = queryMain(startDateDailyToString, endDateToString, groupQuery, dataDaily);
    return queryFormat;
  }
  //query get statistics weekly
  const queryStatisticsWeekly = (isAmount = 0) => {
    const groupQuery = {
      _id: {$isoWeek: '$dateRange'},
      createdDate: { 
        $dateToString: { format: "%Y-%m-%d", date: { // convert date
          $subtract: ["$createdDate", {$multiply: [ {$subtract:[{$isoDayOfWeek: "$createdDate"},1]}, 86400000]}] 
        }}
      }
    };
    if (isAmount == 0) {
      groupQuery.count = 1;
    } else if (isAmount == 1) {
      groupQuery.count = "$fee_amount";
    } else {
      groupQuery.count = "$total_deduction"
    }
    const queryFormat = queryMain(startDateWeeklyToString, endDateToString, groupQuery);
    return queryFormat;
  }
  //query get statistics fornightly
  const queryStatisticsFornightly = (isAmount = 0) => {
    const groupQuery = {
      _id: {$subtract: [
        {$isoWeek: "$dateRange"}, {$mod: [{$isoWeek: "$dateRange"}, 2] }
      ]},
      createdDate: { 
          $dateToString: { format: "%Y-%m-%d", date: { // convert date
            $subtract: ["$createdDate", {$multiply: [ {$subtract:[{$isoDayOfWeek: "$createdDate"},1]}, 86400000]}] 
        }}
      }
    };
    if (isAmount == 0) {
      groupQuery.count = 1;
    } else if (isAmount == 1) {
      groupQuery.count = "$fee_amount";
    } else {
      groupQuery.count = "$total_deduction"
    }
    const queryFormat = queryMain(startDateFornightlyToString, endDateToString, groupQuery);
    return queryFormat;
  }
  //query get statistics monthly
  const queryStatisticsMonthly = (isAmount = 0) => {
    const groupQuery = {
      _id: {month: {$month: '$dateRange'}, year: {$year: '$dateRange'}},
      createdDate: { 
        $dateToString: { format: "%Y-%m", date: { // convert date
          $subtract: ["$createdDate", {$multiply: [ {$subtract:[{$isoDayOfWeek: "$createdDate"},1]}, 86400000]}] 
        }}
      }
    };
    if (isAmount == 0) {
      groupQuery.count = 1;
    } else if (isAmount == 1) {
      groupQuery.count = "$fee_amount";
    } else {
      groupQuery.count = "$total_deduction"
    }
    const queryFormat = queryMain(startDateMonthlyToString, endDateToString, groupQuery);
    return queryFormat;
  }
  //query get statistics yearly
  const queryStatisticsYearly = (total = 1) => {
    let filterYear = {};
    if (role != 'Admin') {
      filterYear = {company_id: companyId};
    };
    return [
      {$match: filterYear},
      {$group:{
        _id: {$year: '$created_date'},
        createdDate: {$last: '$created_date'},
        count:{$sum: total}
      }},
      {$project:{
        _id: 0,
        yearDate: { $dateToString: { format: "%Y", date: "$createdDate"}},
        total:{$sum: '$count'}
      }}
    ]
  };
  //query count total company, staff, deduction daily
  const queryStaffDaily = StaffModel.aggregate(queryStatisticsDaily(0, listStaffInDaily));
  const queryCompanyDaily = CompanyModel.aggregate(queryStatisticsDaily(0, listCompanyInDaily));
  const queryAmountDeductionDaily = DeductionModel.aggregate(queryStatisticsDaily(1, listDeductionInDaily));
  const queryTotalDeductionDaily = DeductionModel.aggregate(queryStatisticsDaily(2, listDeductionInDaily));
  //query count total company, staff, deduction Weekly
  const queryStaffWeekly = StaffModel.aggregate(queryStatisticsWeekly());
  const queryCompanyWeekly = CompanyModel.aggregate(queryStatisticsWeekly());
  const queryAmountDeductionWeekly  = DeductionModel.aggregate(queryStatisticsWeekly(1));
  const queryTotalDeductionWeekly  = DeductionModel.aggregate(queryStatisticsWeekly(2));
  //query count total company, staff, deduction Fornightly
  const queryStaffFornightly = StaffModel.aggregate(queryStatisticsFornightly());
  const queryCompanyFornightly = CompanyModel.aggregate(queryStatisticsFornightly());
  const queryAmountDeductionFornightly = DeductionModel.aggregate(queryStatisticsFornightly(1));
  const queryTotalDeductionFornightly = DeductionModel.aggregate(queryStatisticsFornightly(2));
  //query count total company, staff, deduction Monthly(
  const queryStaffMonthly = StaffModel.aggregate(queryStatisticsMonthly());
  const queryCompanyMonthly = CompanyModel.aggregate(queryStatisticsMonthly());
  const queryAmountDeductionMonthly = DeductionModel.aggregate(queryStatisticsMonthly(1));
  const queryTotalDeductionMonthly = DeductionModel.aggregate(queryStatisticsMonthly(2));
  //query count total company, staff, deduction Yearly
  const queryStaffYearly = StaffModel.aggregate(queryStatisticsYearly());
  const queryCompanyYearly = CompanyModel.aggregate(queryStatisticsYearly());
  const queryAmountYearly = DeductionModel.aggregate(queryStatisticsYearly('$fee_amount'));
  const queryDeductionYearly = DeductionModel.aggregate(queryStatisticsYearly('$total_deduction'));

  const [
    dataStaffDaily,
    dataCompanyDaily,
    dataAmountDeductionDaily,
    dataTotalDeductionDaily,
    //weekly
    dataStaffWeekly,
    dataCompanyWeekly,
    dataAmountDeductionWeekly,
    dataTotalDeductionWeekly,
    //fornightly
    dataStaffFornightly,
    dataCompanyFornightly,
    dataAmountDeductionFornightly,
    dataTotalDeductionFornightly,
    //monthly
    dataStaffMonthly,
    dataCompanyMonthly,
    dataAmountDeductionMonthly,
    dataTotalDeductionMonthly,
    //yearly
    dataStaffYearly,
    dataCompanyYearly,
    dataDeductionYearly,
    dataAmountYearly
  ] = await Promise.all([
    queryStaffDaily,
    queryCompanyDaily,
    queryAmountDeductionDaily,
    queryTotalDeductionDaily,
    //weekly
    queryStaffWeekly,
    queryCompanyWeekly,
    queryAmountDeductionWeekly,
    queryTotalDeductionWeekly,
    //fornightly
    queryStaffFornightly,
    queryCompanyFornightly,
    queryAmountDeductionFornightly,
    queryTotalDeductionFornightly,
    //monthly
    queryStaffMonthly,
    queryCompanyMonthly,
    queryAmountDeductionMonthly,
    queryTotalDeductionMonthly,
    //yearly
    queryStaffYearly,
    queryCompanyYearly,
    queryDeductionYearly,
    queryAmountYearly
  ]);
  //----------------------
  // const arrMain = [];
  // arrMain.push(dataStaffDaily,
  //   dataCompanyDaily,
  //   dataAmountDeductionDaily,
  //   dataTotalDeductionDaily,
  //   dataStaffWeekly,
  //   dataCompanyWeekly,
  //   dataAmountDeductionWeekly,
  //   dataTotalDeductionWeekly,
  //   dataStaffFornightly,
  //   dataCompanyFornightly,
  //   dataAmountDeductionFornightly,
  //   dataTotalDeductionFornightly,
  //   dataStaffMonthly,
  //   dataCompanyMonthly,
  //   dataAmountDeductionMonthly,
  //   dataTotalDeductionMonthly,
  //   dataStaffYearly,
  //   dataCompanyYearly,
  //   dataDeductionYearly,
  //   dataAmountYearly
  // );

  

  // convert data daily
  const totalStaffDaily = dataStaffDaily.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalCompanyDaily = dataCompanyDaily.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalAmountDaily = dataAmountDeductionDaily.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalDeductionDaily = dataTotalDeductionDaily.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  // convert data weekly
  const totalStaffWeekly = dataStaffWeekly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalCompanyWeekly  = dataCompanyWeekly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalAmountWeekly  = dataAmountDeductionWeekly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalDeductionWeekly  = dataTotalDeductionWeekly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  // // convert data fornightly
  const totalStaffFornightly = dataStaffFornightly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalCompanyFornightly = dataCompanyFornightly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalAmountFornightly = dataAmountDeductionFornightly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalDeductionFornightly = dataTotalDeductionFornightly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  // // convert data monthly
  const totalStaffMonthly = dataStaffMonthly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalCompanyMonthly = dataCompanyMonthly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalAmountMonthly = dataAmountDeductionMonthly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  const totalDeductionMonthly = dataTotalDeductionMonthly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.createdDate), item.total);
    return childArr;
  });
  // // convert data yearly
  const totalStaffYearly = dataStaffYearly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.yearDate), item.total);
    return childArr;
  });
  const totalCompanyYearly = dataCompanyYearly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.yearDate), item.total);
    return childArr;
  });
  const totalAmountYearly = dataAmountYearly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.yearDate), item.total);
    return childArr;
  });
  const totalDeductionYearly = dataDeductionYearly.map((item) => {
    let childArr = [];
    childArr.push(Date.parse(item.yearDate), item.total);
    return childArr;
  });

  res.render('index', {
    title: 'Dashboard',
    role: req.session.role,
    countStaff: countStaff,
    countDeduction: countDeduction,
    countCompany: countCompany,
    pageName: 'dashboard',
    csrfToken: req.csrfToken(),
    totalStaffDaily: JSON.stringify(totalStaffDaily),
    totalCompanyDaily: JSON.stringify(totalCompanyDaily),
    totalAmountDaily: JSON.stringify(totalAmountDaily),
    totalDeductionDaily: JSON.stringify(totalDeductionDaily),
    //
    totalStaffWeekly: JSON.stringify(totalStaffWeekly),
    totalCompanyWeekly: JSON.stringify(totalCompanyWeekly),
    totalAmountWeekly: JSON.stringify(totalAmountWeekly),
    totalDeductionWeekly: JSON.stringify(totalDeductionWeekly),
    //
    totalStaffFornightly: JSON.stringify(totalStaffFornightly),
    totalCompanyFornightly: JSON.stringify(totalCompanyFornightly),
    totalAmountFornightly: JSON.stringify(totalAmountFornightly),
    totalDeductionFornightly: JSON.stringify(totalDeductionFornightly),
    //
    totalStaffMonthly: JSON.stringify(totalStaffMonthly),
    totalCompanyMonthly: JSON.stringify(totalCompanyMonthly),
    totalAmountMonthly: JSON.stringify(totalAmountMonthly),
    totalDeductionMonthly: JSON.stringify(totalDeductionMonthly),
    //
    totalStaffYearly: JSON.stringify(totalStaffYearly),
    totalCompanyYearly: JSON.stringify(totalCompanyYearly),
    totalAmountYearly: JSON.stringify(totalAmountYearly),
    totalDeductionYearly: JSON.stringify(totalDeductionYearly),
  });
}
