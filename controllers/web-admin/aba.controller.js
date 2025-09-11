const moment = require("moment");
var http = require("../../config/http");
const path = require("path");
const fs = require("fs");
const Deduction = require("../../models/deduction");
const mongoose = require("mongoose");
var localStorage;
var err = false;
const baseService = require("../../service/baseService");

exports.getABA = async function (req, res, next) {
  let url = `/api/timesheets/getDocumentsFromDeduction?company_id=${req.session.user.company_id != undefined ? req.session.user.company_id : ''}`;
  //token api
  const token = req.session.token;
  let messages = req.flash("errors");
  const response = await baseService.getInstance().get(url, token, req);
  const body = JSON.parse(response.body);
  return res.render("aba/table-aba", {
    data: body.result,
    title: "Document",
    pageName: "documents",
    moment: moment,
    messages: messages,
    url: http.API_HTTPS + "/api/timesheets/createABAForDeduction",
    http: http.API_HTTPS,
    localStorage,
    csrfToken: req.csrfToken()
    //downloadAba: http.apiHttps + "/public/web-files/aba/aba-1571910657777.aba"
  });
};

exports.getFileABA = (req, res, next) => {
  let path = __dirname;
  let arrPath = path.split("\\");
  let pathPublic = arrPath.slice(0, arrPath.length - 2);
  let string = pathPublic.join("\\") + "\\public\\fileABA\\";
  var file = fs.readdirSync(string, "binary");
  res.download(`${string}${file}`);
};

exports.postDocument = function (req, res, next) {
  var request = require("request");
  let urlFile = req.body.path;
  let {
    memberId,
    memberPassword
  } = req.body;
  let arr = urlFile.split("/");
  let href = arr.slice(0, arr.length - 2).join("/");
  const {
    Builder,
    By,
    Key,
    until,
    Capabilities
  } = require("selenium-webdriver");
  require("selenium-webdriver");
  const chrome = require("selenium-webdriver/chrome");
  // optionss.setChromeBinaryPath('e:\\Downloads\\chromedriver.exe');
  const httpBrow = require("http");
  require("chromedriver");

  // Set the headers
  var headers = {
    "Content-Type": "application/json"
  };

  function removeFile() {
    const directory = "public/fileABA";

    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
          if (err) throw err;
        });
      }
    });
  }

  // Configure the request
  var options = {
    url: http.API_HTTPS + "/api/timesheets/createABAForDeduction",
    method: "POST",
    headers: headers,
    form: {
      deduction_id: req.body.send_deduction_id,
      pay_deduction_id: req.body.send_pay_deduction_id,
      staff_id: req.body.send_staff_id
    }
  };

  // Start the request

  let getRequestApi = () => {
    return new Promise((resolve, reject) => {
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // Print out the response body
          let objBody = JSON.parse(body);
          resolve(objBody);
        } else {
          reject(error);
        }
      });
    });
  };
  getRequestApi()
    .then(objBody => {
      let link = "aba_link";
      let date = new Date();
      const url = `${http.API_HTTPS}/${objBody.result[link]}`;
      let strName = objBody.result[link];
      let arrName = strName.split("/");
      let name = arrName[3];
      removeFile();
      const newName = `public/fileABA/${date.getTime()}-${name}`;
      let arr = newName.split("/");
      let fileName = arr.slice(arr.length - 1).join("/");
      const file = fs.createWriteStream(newName);
      httpBrow.get(url, function (response) {
        response.pipe(file);
      });
      // const getRun = async () => {
      //   await run();
      //   console.log(values);
      //   await 
      // };
      // getRun();
      runWeb(fileName);
      const time = setInterval(function () {
        if (localStorage || err) {
          clearInterval(time);
          res.redirect("/admin/documents");
        }
      }, 2000);
    })
    .catch(err => console.log(err));

  // selenium web
  const runWeb = async (nameFile) => {
    let driver = await new Builder()
      .withCapabilities(Capabilities.chrome())
      .build();
    const values = {};
    try {
      await driver.get(`${href}/api/timesheets/fileABA/download`);
      await driver.get(
        "https://ib.australianmilitarybank.com.au/AMBOnlineBanking/apps/services/www/AMBBankingApp/desktopbrowser/default/AMBAppIndex.html"
      );
      const info = (await driver).getCapabilities();
      info.then(item => {
        for (let key in item) {
          const map = [...item[key]];
          const OS = {
            ...map[7]
          };
          var pathText;
          const obj = {
            ...map[3]
          };
          const path = obj['1'].userDataDir;
          if (OS['1'] === 'windows') {
            pathText = path.split("\\");
          }
          if (OS['1'] === 'linux') {
            pathText = path.split("/");
          }
          if (OS['1'] === 'mac') {
            pathText = path.split("\\");
          }
          values.name = pathText[2];
          values.OS = OS['1'];
        }
      });
      await driver.wait(until.elementsLocated(By.id("member-id-log")));
      await driver.findElement(By.id("member-id-log")).sendKeys(memberId);
      await driver
        .findElement(By.id("login-password"))
        .sendKeys(memberPassword);
      var button = await driver.findElements(
        By.css('button[ng-click="login.doLogin();"]')
      );
      await button[0].click();
      await driver.wait(
        until.elementsLocated(
          By.css('a[title="manage your payments and transfers"]')
        )
      );
      var upfile = false;
      await driver
        .findElement(By.css('a[title="manage your payments and transfers"]'))
        .click();
      await driver.wait(until.elementLocated(By.css(`a[title="Payroll"]`)));
      await driver.sleep(2000);
      await driver.findElement(By.css('a[title="Payroll"]')).click();
      await driver.wait(
        until.elementsLocated(
          By.css('button[ng-show="payandtransfer.payroll.fileUploadFlag"]', 5000)
        )
      );
      if (values.OS === "windows" && upfile === false) {
        await driver
          .findElement(By.id("fileToUpload"))
          .sendKeys(`c:\\Users\\${values.name}\\Downloads\\${nameFile}`);
        upfile = true;
      }
      if (values.OS === "mac" && upfile === false) {
        await driver
          .findElement(By.id("fileToUpload"))
          .sendKeys(`\\Users\\${values.name}\\Downloads\\${nameFile}`);
        upfile = true;
      }
      if (values.OS === "linux" && upfile === false) {
        await driver
          .findElement(By.id("fileToUpload"))
          .sendKeys(`/home/${values.name}/Downloads/${nameFile}`);
        upfile = true;
      }

      await driver.wait(
        until.elementsLocated(
          By.css('span[class="upload-indicator__file file-value"]')
        )
      );

      await driver.sleep(2000);
      await driver.wait(
        until.elementsLocated(
          By.css("button[ng-click='payandtransfer.payroll.continueButtonControlFlagFunction();']")
        )
      );
      await driver
        .findElement(
          By.css(
            "button[ng-click='payandtransfer.payroll.continueButtonControlFlagFunction();']"
          )
        )
        .click();
      await driver.sleep(2000);
      await driver.wait(
        until.elementsLocated(
          By.css("button[ng-click='payandtransfer.continueButtonControlFlag.payrollRemitterDetailsVerified=true;']")
        )
      );
      await driver
        .findElement(
          By.css(
            "button[ng-click='payandtransfer.continueButtonControlFlag.payrollRemitterDetailsVerified=true;']"
          )
        )
        .click();
      await driver.wait(
        until.elementsLocated(
          By.css("button[title='wait']")
        )
      );
      localStorage = await memberId;
    } finally {
      err = true;
      await driver.quit();
    }
  }
};

exports.getDeduction = async (req, res) => {
  const id = req.params.id;
  const deductions = await Deduction.aggregate([
    {$match: {_id: new mongoose.Types.ObjectId(id)}},
    {
      $lookup: {
        from: "companies",
        localField: "company_id",
        foreignField: "_id",
        as: "company"
      }
    },
    {
      $lookup: {
        from: "pay_deductions",
        localField: "_id",
        foreignField: "deduction_id",
        as: "pay_deduction"
      }
    },
    {
      $lookup: {
        from: "staffs",
        localField: "pay_deduction.staff_id",
        foreignField: "_id",
        as: "staff"
      }
    },
    {
        $unwind: "$company"
    },
        {
        $unwind: "$pay_deduction"
    },
        {
        $unwind: "$staff"
    }
  ]);
  res.render('aba/watch-aba', {
    title: "Deductions",
    pageName: "documents",
    moment: moment,
    deduction: deductions[0],
    csrfToken: req.csrfToken()
  });
};

exports.postDeduction = async (req, res) => {
  if(!req.body._csrf) {
    res.redirect('/admin/documents');
  }
  const deduction = await Deduction.aggregate([
    {
      $match: {_id: new mongoose.Types.ObjectId(req.body.deduction_id)}
    },
    {
      $lookup: {
        from: "pay_deductions",
        localField: "deduction_id",
        foreignField: "_id",
        as: "pay_deductions"
      }
    }
  ]);
  res.redirect('/admin/documents');
};