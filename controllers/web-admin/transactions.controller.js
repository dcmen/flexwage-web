var localhost = require('../../config/http');
const request = require('request');
const Excel = require('exceljs');
const fs = require('fs');
var path = require('path');
var moment = require('moment');

const CompanyModel = require('../../models/company');
const baseService = require("../../service/baseService");

exports.getTransactions = function (req, res, next) {
  var now = Date.now();

  var result = res.render("transactions/table-transactions", {
    cache: true,
    title: "Transactions",
    pageName: "transactions",
    csrfToken: req.csrfToken(),
    optionLogin: req.session.role
  });

  console.log("transactions screen, time: ", Date.now() - now);
  return result;
};

exports.getDataTransactions = async (req, res) => {
  let company;
  if (req.body.company_id) {
    company = await CompanyModel.findById(req.body.company_id);
  }
  let company_id = req.body.company_id ? req.body.company_id : "";
  let pay_periods_id = req.body.payPeriod ? req.body.payPeriod : "";
  let startDate = req.body.startDate ? req.body.startDate : "";
  let endDate = req.body.endDate ? req.body.endDate : "";
  let mode = req.body.mode ? req.body.mode : "";
  let isAll = req.body.isAll;
  let is_monoova_live_mode = company ? company.is_monoova_live_mode : "";
  const url = `/api/timesheets/getAllDeductions?company_id=${company_id}&page=${req.body.page}&pageSize=${req.body.pageSize}&pay_periods_id=${pay_periods_id}&startDate=${startDate}&endDate=${endDate}&mode=${mode}&isAll=${isAll}&is_monoova_live_mode=${is_monoova_live_mode}`;
  const token = req.session.token;
  const response = await baseService.getInstance().get(url, token, req);
  return res.status(200).send(response.body);
}

exports.getDataExportExcel = async (req, res) => {
  let company_id = req.body.company_id
  const token = req.session.token;

  console.log("check click!", {
    company_id
  })

  const url = `/api/timesheets/getUnpaidWithdrawals?company_id=${company_id}`
  const response = await baseService.getInstance().get(url, token, req, null);
  if(!response) {
    res.status(500).send("error from server");
  }
  return res.status(200).send(response.body);
}

exports.importDataFromExcelFile = async (req, res) => {
  let paid_withdrawals = JSON.parse(req.body.paid_withdrawals)
  
  const token = req.session.token;
  const url = '/api/timesheets/uploadPaidWithdrawals'

  
  const body = {paid_withdrawals}
  // const body = {}
  console.log({
    paid_withdrawals,
    body
  })
  
  const response = await baseService.getInstance().post(url, body, null, req);
  if(response.success == false) {
    res.status(500).send("error from server", response.body);
  }
  console.log('check: ', response.body)
  return res.status(200).send(response.body);
}

exports.getCreateABA = async (req, res) => {
  let { deduction_id, pay_deduction_id, staff_id } = req.body;
  const url = "/api/timesheets/createABAForDeduction";
  const body = { deduction_id, pay_deduction_id, staff_id };
  const response = await baseService.getInstance().post(url, body, null, req);
  return res.status(200).send(response.body);
}

exports.getBank = async (req, res) => {
  return res.send({ result: [], totalItems: 0 });
}

exports.createFileExcel = async (req, res) => {
  const data = JSON.parse(req.body.json);
  const header = [...data.header];
  const { type, payPeriod, date, runTotal, feeTotal, title } = data;
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('My Sheet');

  // Title
  worksheet.mergeCells('A1:I1');
  worksheet.getCell('A1').value = title;
  worksheet.getCell('A1').font = {size: 16, bold: true, color: { argb: '0073e6' }, name: 'Times New Roman'};
  // custom header
  worksheet.getCell('A2').value = `Company: ${type}`;
  worksheet.getCell('A3').value = `Pay Period: ${payPeriod}`;
  worksheet.getCell('A4').value = `Date Report: ${date}`;
  worksheet.getCell('G2').value = `Running Total: ${runTotal}`;
  worksheet.getCell('G3').value = `Fee Total: ${feeTotal}`;

  const headerRow = worksheet.addRow(header);
  headerRow.eachCell((cell) => {
      cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0073e6'},
      bgColor: { argb: '0073e6' },
      alignment: {vertical: 'middle', horizontal: 'center'}
  };
  cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  cell.font = {
      name: 'Times New Roman',
      size: 12,
      color: { argb: 'FFFFFF' }
  };
  cell.alignment = {vertical: 'middle', horizontal: 'center'};
  });

  // body
  let number = 6;
  data.body.forEach(item => {
      worksheet.getCell(`A${number}`).value = item.no;
      worksheet.getCell(`A${number}`).alignment = {vertical: 'middle', horizontal: 'center'};
      worksheet.getCell(`B${number}`).value = item.companyName;
      worksheet.getCell(`C${number}`).value = item.staffName;
      worksheet.getCell(`D${number}`).value = item.date;
      worksheet.getCell(`E${number}`).value = item.description;
      worksheet.getCell(`F${number}`).value = item.type;
      worksheet.getCell(`G${number}`).value = item.debit;
      worksheet.getCell(`H${number}`).value = item.credit;
      worksheet.getCell(`I${number}`).value = item.balance;
      number++;
  });

  worksheet.getColumn(1).width = 5;
  worksheet.getColumn(2).width = 30;
  worksheet.getColumn(2).alignment = {vertical: 'middle', horizontal: 'left'};
  worksheet.getColumn(3).width = 17;
  worksheet.getColumn(3).alignment = {vertical: 'middle', horizontal: 'left'};
  worksheet.getColumn(4).width = 30;
  worksheet.getColumn(4).alignment = {vertical: 'middle', horizontal: 'left', wrapText: true};
  worksheet.getColumn(5).width = 40;
  worksheet.getColumn(5).alignment = {vertical: 'middle', horizontal: 'left', wrapText: true};
  worksheet.getColumn(6).width = 15;
  worksheet.getColumn(6).alignment = {vertical: 'middle', horizontal: 'left'};
  worksheet.getColumn(7).width = 30;
  worksheet.getColumn(7).alignment = {vertical: 'middle', horizontal: 'left'};
  worksheet.getColumn(8).width = 10;
  worksheet.getColumn(8).alignment = {vertical: 'middle', horizontal: 'left', wrapText: true};
  worksheet.getColumn(9).width = 20;

  worksheet.getRow(1).height = 50;
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  headerRow.eachCell((cell) => {
      cell.alignment = {vertical: 'middle', horizontal: 'center'};
  });

  workbook.xlsx.writeBuffer().then((data) => {
    let base64data = data.toString('base64');
    return res.json({code: 200, data: base64data});
  });
}

exports.createFilePdf = async (req, res) => {
  const puppeteer = require('puppeteer');
  const data = JSON.parse(req.body.json);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let tbody = "", thString = "";
  const { type, payPeriod, date, runTotal, feeTotal, title, header, body } = data;
  header.forEach(item => {
    thString += `<th>${item}</th>`;
  });
  body.forEach(item => {
    tbody += `<tr>
      <td style="text-align: center;">${item.no}</td>
      <td>${item.companyName}</td>
      <td>${item.staffName}</td>
      <td>${item.date}</td>
      <td>${item.description}</td>
      <td>${item.type}</td>
      <td>${item.debit}</td>
      <td style="text-align: center;">${item.credit}</td>
      <td>${item.balance}</td>
    </tr>`;
  });
  let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            table {
              font-family: arial, sans-serif;
              border-collapse: collapse;
              width: 100%;
            }
            
            td, th {
              border: 1px solid #dddddd;
              text-align: left;
              padding: 8px;
              font-size: 12px;
            }

            th {
              font-weight: bold;
              text-align: center;
            }
            
            tr:nth-child(even) {
              background-color: #dddddd;
            }
            .header-text {
                display: flex;
                justify-content: space-between;
            }
            h5 {
                margin: 10px 0;
            }
            h3 {
              margin-top: 0;
            }
            table {
              page-break-inside: auto;
              border-collapse: collapse;
              }
              tr {
              page-break-inside: avoid;
              page-break-after: auto;
              }
              thead {
              display: table-header-group;
              }
              tfoot {
              display: table-footer-group;
              }
              @media print {
              table {
              page-break-after: auto;
              }
              tr {
              page-break-inside: avoid;
              page-break-after: auto;
              }
              td {
              page-break-inside: avoid;
              page-break-after: auto;
              }
              thead {
                display: table-header-group;
              }
              tfoot {
                display: table-footer-group;
              }
              }
        </style>
    </head>
    <body>
        <div>
            <h3 style="text-align: center;">${title}</h3>
            <div class="header-text">
                <h5>Company: ${type}</h5>
                <h5>Running Total: ${runTotal}</h5>
            </div>
            <div class="header-text">
                <h5>Pay Period: ${payPeriod}</h5>
                <h5>Fee Total: ${feeTotal}</h5>
            </div>
            <h5>Date Report: ${date}</h5>
        </div>
        <div style="margin-top: 20px;">
            <table style="width:100%">
                <tr>
                  ${thString}
                </tr>
                ${tbody}
              </table>
        </div>
    </body>
    </html>`;
  await page.setContent(html, {
    waitUntil: 'domcontentloaded'
  })
  let base64data = (await page.pdf({
    margin: {
      top: 30,
      bottom: 30,
      left: 30,
      right: 30
    }, format: 'a4'
  })).toString('base64');
  await browser.close();
  return res.json({ code: 200, data: base64data });
}