const mongoose = require("mongoose");
const request = require("request");
const requestPromise = require("request-promise");
const Excel = require("exceljs");
const paymentSystemsModel = require('../../models/web-admin/payment_systems')
const companiesModel = require('../../models/company')
var moment = require('moment');

const addNewPaymentSystems = async (req, res) => {
  try {
    const name = req.body.name
    const code = req.body.code
    const CODE = code.toUpperCase()
    if (name, CODE) {
      const payment = new paymentSystemsModel({
        name: name,
        code: CODE,
      })
      await payment.save()
      return res.status(200).json({
        errCode: 0,
        errMessage: 'Save payment systems success!',
        data: {
          name: name,
          code: CODE
        }
      })
    }
  } catch (e) {
    console.log(e)
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server!'
    })
  }
}

const getPaymentSystems = async (req, res) => {
  try {
    const allPaymentSystems = await paymentSystemsModel.find()
    if (allPaymentSystems) {
      return res.status(200).send({ success: true, result: allPaymentSystems });
    } else {
      return res.status(200).send({ success: false, message: 'null data' });
    }
  } catch (error) {
    return res.status(400).send({
      message: 'Error from server',
      error: error
    });
  }
}

const updatePaymentSystemsId = async (req, res) => {
  try {
    if (!req.body.companyId || !req.body.paymentSystemId) {
      return res.status(200).send({
        message: 'Missing parameters!',
        errorCode: 1
      });
    } else {
      let companyId = req.body.companyId
      let paymentSystemId = req.body.paymentSystemId

      let company = await companiesModel.findOne({ _id: companyId })

      if (!company) {
        return res.status(200).send({
          message: 'Company is not exist!',
          errorCode: -1
        });
      } else {
        company.payment_system_id = paymentSystemId

        await company.save()

        let paymentSystemName = await paymentSystemsModel.findOne({ _id: paymentSystemId })

        if(paymentSystemName) {
          return res.status(200).send({
            message: 'here is company!',
            errorCode: 0,
            data: company,
            paymentSystem: paymentSystemName
          });
        }
      }
    }
  } catch (error) {
    return res.status(400).send({
      message: 'Error from server',
      error: error
    });
  }
}

const getAllCompanies = async (req, res) => {
  try {
    const companies = await companiesModel.find()

    if (!companies) {
      return res.status(200).send({
        message: 'Company is not exist!',
        errorCode: -1
      });
    } else {
      return res.status(200).send({
        message: 'Here is company',
        errorCode: 0,
        companies: companies
      });
    }

  } catch (error) {
    return res.status(400).send({
      message: 'Error from server',
      error: error
    });
  }
}

const updateCountryLanguageCurrencyForCompany = async (req, res) => {
  try {
    if (!req.body.companyId || !req.body.country || !req.body.currency || !req.body.language) {
      return res.status(200).send({
        message: 'Missing parameters!',
        errorCode: 1
      });
    } else {
      let country_id = req.body.country
      let currency = req.body.currency
      let language = req.body.language
      let companyId = req.body.companyId

      let company = await companiesModel.findOne({ _id: companyId })

      if (!company) {
        return res.status(200).send({
          message: 'Company is not exist!',
          errorCode: -1
        });
      } else {
        company.country_id = country_id
        company.language = language
        company.currency = currency

        await company.save()

        return res.status(200).send({
          message: 'Company is updated!',
          errorCode: 0,
          data: company
        });
      }
    }
  } catch (error) {
    return res.status(400).send({
      message: 'Error from server',
      error: error
    });
  }
}

const exportExcelFile = async (req, res) => {
  try {
    const company = JSON.parse(req.body.company)
    const withdrawals = JSON.parse(req.body.withdrawals)

    if (withdrawals == [] || !withdrawals || withdrawals === [] || withdrawals == null || withdrawals == undefined) {
      return res.status(400).send({
        message: 'Missing withdrawals!',
        errCode: -1
      });
    }

    let date = moment().format("DD/MM/YYYY");

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    const header = [
      "No",
      "First Name",
      "Last Name",
      "Astute ID",
      "Employee ID",
      "Payment Amount",
      "CashD Fees",
      "Total",
      "Account Name",
      "Account Number",
      "BSB/Routing",
      "Pay Cycle Period",
      "Transaction Id",
      "Transaction Status",
      "Date Time",
    ];

    // Title
    worksheet.mergeCells("A4:O4");
    worksheet.getCell("A4").value = "Astute Withdrawals";
    worksheet.getCell("A4").font = {
      size: 16,
      bold: true,
      color: { argb: "Black" },
      name: "Arial",
    };

    // custom header
    worksheet.getCell('A1').value = `Company: ${company.company_name}` + "\n" + `Country: ${company.country.name}` + "\n" + `Currency: ${company.country.currency}` + "\n" + `Report Date: ${date}`;

    const headerRow = worksheet.addRow(header);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0073e6" },
        bgColor: { argb: "0073e6" },
        alignment: { vertical: "middle", horizontal: "center" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.font = {
        name: "Arial",
        size: 10,
        color: { argb: "FFFFFF" },
        bold: true,
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // body
    let number = 6;
    withdrawals.forEach((item, index) => {

      let startDate = item.pay_period.start_date
      let endDate = item.pay_period.end_date
      let createdDate = item.created_date

      let start_date = moment(startDate).format("DD/MM/YYYY");
      let end_date = moment(endDate).format("DD/MM/YYYY");
      let created_date = moment(createdDate).format("DD/MM/YYYY");

      worksheet.getCell(`A${number}`).value = index + 1;
      worksheet.getCell(`A${number}`).alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.getCell(`B${number}`).value = item.staff.first_name ? item.staff.first_name : 'NULL';
      worksheet.getCell(`C${number}`).value = item.staff.last_name ? item.staff.last_name : 'NULL';
      worksheet.getCell(`D${number}`).value = item.staff.system_employee_id ? item.staff.system_employee_id : 'NULL';
      worksheet.getCell(`E${number}`).value = item.staff._id ? item.staff._id : 'NULL';
      worksheet.getCell(`F${number}`).value = item.deduction.amount ? '$' + item.deduction.amount : 'NULL';
      worksheet.getCell(`G${number}`).value = item.deduction.fee_amount ? '$' + item.deduction.fee_amount : 'NULL';
      worksheet.getCell(`H${number}`).value = item.deduction.total_deduction ? '$' + item.deduction.total_deduction : 'NULL';
      worksheet.getCell(`I${number}`).value = item.deduction.bank_account_name ? item.deduction.bank_account_name : 'NULL';
      worksheet.getCell(`J${number}`).value = item.deduction.bank_account_number ? item.deduction.bank_account_number : 'NULL';
      worksheet.getCell(`K${number}`).value = item.deduction.bank_bsb_number ? item.deduction.bank_bsb_number : 'NULL'
      worksheet.getCell(`L${number}`).value = start_date + ' - ' + end_date;
      worksheet.getCell(`M${number}`).value = item._id ? item._id : 'NULL';
      worksheet.getCell(`N${number}`).value = item.status === "PENDING" ? "PENDING" : "PAID";
      worksheet.getCell(`O${number}`).value = created_date ? created_date : 'NULL';

      if (worksheet.getCell(`N${number}`).value == "PENDING") {
        worksheet.getCell(`N${number}`).font = {
          color: { argb: "FFFF00" }
        }
      } else {
        worksheet.getCell(`N${number}`).font = {
          color: { argb: "32CD32" }
        }
      }

      number++;
    });

    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(2).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(3).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getColumn(4).width = 10;
    worksheet.getColumn(4).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(5).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(6).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getColumn(7).width = 15;
    worksheet.getColumn(7).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(8).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getColumn(9).width = 30;
    worksheet.getColumn(9).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(10).width = 30;
    worksheet.getColumn(10).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(11).width = 30;
    worksheet.getColumn(11).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(12).width = 30;
    worksheet.getColumn(12).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(13).width = 30;
    worksheet.getColumn(13).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(14).width = 20;
    worksheet.getColumn(14).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getColumn(15).width = 20;
    worksheet.getColumn(15).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // Title style
    worksheet.getRow(4).height = 35;
    worksheet.getRow(4).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getRow(5).height = 25;

    // Upper Title
    worksheet.mergeCells('A1:O3');
    worksheet.getRow(3).height = 60;
    worksheet.getCell("A1").alignment = {
      wrapText: true,
      vertical: 'middle',
      horizontal: 'left',
      indent: 3
    };
    worksheet.getCell("A1").font = {
      name: "Calibri",
      size: 11,
      color: { argb: "black" },
      bold: true
    };

    headerRow.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    workbook.xlsx.writeBuffer().then((data) => {
      let base64data = data.toString('base64');
      return res.json({ code: 200, data: base64data });
    });
  } catch (error) {
    console.log('errr', error)
    return res.json({ code: 500, errMessage: "Error from server!" });
  }
}

const getPaymentSystemsById = async (req, res) => {
  try {
    if (!req) {
      return res.json({ code: 204, errMessage: "Missing parameters!" });
    } else {
      let payment_system_id = req.body.payment_system_id
      const payment_system = await paymentSystemsModel.findOne({ _id: payment_system_id })
      let payment_system_code = payment_system.code

      if (payment_system_code) {
        return res.json({ code: 200, errMessage: "OK", payment_system: payment_system_code });
      } else {
        return res.json({ code: 204, errMessage: "There is no qualifying payment system!" });
      }
    }
  } catch (error) {
    console.log('error', error)
    return res.json({ code: 500, errMessage: "Error from server!" });
  }
}

const updatePaymentSystemsIdWhenChangeSelect = async (req, res) => {
  try {
    if (!req.body.companyId || !req.body.paymentSystemId) {
      return res.status(200).send({
        message: 'Missing parameters!',
        errorCode: 1
      });
    } else {
      let companyId = req.body.companyId
      let paymentSystemId = req.body.paymentSystemId

      let company = await companiesModel.findOne({ _id: companyId })

      if (!company) {
        return res.status(200).send({
          message: 'Company is not exist!',
          errorCode: -1
        });
      } else {
        company.payment_system_id = paymentSystemId

        await company.save()

        return res.status(200).send({
          message: 'here is company!',
          errorCode: 0,
          data: company
        });
      }
    }
  } catch (error) {
    return res.status(400).send({
      message: 'Error from server',
      error: error
    });
  }
}

module.exports = {
  addNewPaymentSystems,
  getPaymentSystems,
  updatePaymentSystemsId,
  getAllCompanies,
  updateCountryLanguageCurrencyForCompany,
  exportExcelFile,
  getPaymentSystemsById,
  updatePaymentSystemsIdWhenChangeSelect
};