$(document).ready(function () {
  const staffId = JSON.parse(localStorage.getItem("staff"))?._id;
  const idCompany = $("input[name='_id']").val();
  const systemCode = $("input[name='systemCode']").val();
  const token = $('input[name="_csrf"]').val();
  let totalCount, searchKey = "";
  let columns = [
    {
      data: null,
      render: function (data, type, full, meta) {
        return meta.row + meta.settings._iDisplayStart + 1;
      },
    },
    { data: "staff_infor.fullname" },
    {
      data: { start_date: "start_date", end_date: "end_date" },
      render: function (data) {
        const startDate = data.start_date.slice(0, 10);
        const endDate = data.end_date.slice(0, 10);
        return (
          moment(new Date(startDate)).format("ll") +
          " - " +
          moment(new Date(endDate)).format("ll")
        );
      },
    },
    {
      data: "pay_calculates.amount_available",
      render: function (data) {
        return `$${data > 0 ? splitSting(data.toString()) : "0.00"}`;
      },
    },
    {
      data: "pay_calculates.accured_amount_total",
      render: function (data) {
        return `$${data > 0 ? splitSting(data.toString()) : "0.00"}`;
      },
    },
    {
      data: "pay_calculates.limit_amount",
      render: function (data) {
        return `$${data > 0 ? splitSting(data.toString()) : "0.00"}`;
      },
    },
    {
      data: "pay_calculates.current_fee",
      render: function (data) {
        return `$${data > 0 ? splitSting(data.toString()) : "0.00"}`;
      },
    },
    {
      data: "pay_calculates.withdrawals_total",
      render: function (data) {
        return `$${data > 0 ? splitSting(data.toString()) : "0.00"}`;
      },
    },
    {
      data: "pay_calculates.accured_amount",
      render: function (data) {
        return `$${data > 0 ? splitSting(data.toString()) : "0.00"}`;
      },
    },
  ];

  var walletTable = $("#walletTable").DataTable({
    paging: true,
    ordering: false,
    info: true,
    searching: false,
    serverSide: true,
    processing: true,
    language: {
      loadingRecords: "&nbsp;",
      processing: '<div class="spinner"></div>',
    },
    ajax: {
      type: "POST",
      url: `/get-wallet`,
      data: function (d) {
        var info = $("#walletTable").DataTable().page.info();
        d.companyId = idCompany;
        d.systemCode = systemCode;
        if (staffId) d.staffId = staffId;
        d.page = info.page;
        d.pageSize = info.length;
        d._csrf = token;
        d.searchKey = searchKey;
        d.time_offset = Math.abs(new Date().getTimezoneOffset()) * 60 * 1000;
      },
      dataSrc: "result",
      dataFilter: function (data) {
        var json = $.parseJSON(data);
        if (!json.success) {
          json.result = [];
          json.totalCount = 0;
        }
        var info = $("#walletTable").DataTable().page.info();
        if (info.page == 0) {
          json.recordsTotal = json.totalCount;
          json.recordsFiltered = json.totalCount;
          totalCount = json.totalCount;
        } else {
          json.recordsTotal = totalCount;
          json.recordsFiltered = totalCount;
        }
        return JSON.stringify(json);
      },
    },
    columns:
      systemCode == "KEYPAY"
        ? [
            ...columns,
            {
              data: null,
              render: function (data, type, row) {
                var totalPayslips = row.pay_calculates.totalPayslips
                  ? row.pay_calculates.totalPayslips
                  : 0;
                var totalNetEaring = row.pay_calculates.totalNetEaring
                  ? row.pay_calculates.totalNetEaring
                  : 0;
                return `$${totalNetEaring === 0 ? 0 : splitSting((totalNetEaring/totalPayslips).toString())}`; 
              },
            },
            {
              data: null,
              render: function (data, type, row) {
                return row.pay_calculates.totalPayslips
                  ? row.pay_calculates.totalPayslips
                  : 0;
              },
            },
          ]
        : columns,
  });

  // Export data wallet
  $(document).on(
    "click",
    "#jsCsvWallet, #jsExcelWallet, #jsPdfWallet",
    async (e) => {
      showLoading();
      let id = e.target.id,
        companyName = $("#jsNameCompany").text();
      var response = await getDataWallet(totalCount);
      if (response.code != 200) {
        hideLoading();
        return;
      }
      var listWallet = response.result;
      let dataTable = {
        header: [],
        body: [],
        title: companyName.trim() + " wallet reports",
      };
      dataTable.header = [
        "#",
        "Employee Name",
        "Pay Periods",
        "Available Balance",
        "Salary (cycle)",
        "CashD Limit",
        "CashD Withdraws",
        "Salary Balance (cycle)",
      ];
      if (systemCode == "KEYPAY") {
        dataTable.header = [...dataTable.header, "Ave", "# payslips"];
      }
      listWallet.forEach((item, index) => {
        const startDate = item.start_date.slice(0, 10);
        const endDate = item.end_date.slice(0, 10);
        let cell;
        if (id == 'jsCsvWallet') {
          cell = {
            no: index + 1,
            employeeName: item.staff_infor.fullname,
            payPeriods: moment(new Date(startDate)).format("MMM DD YYYY") + " - " + moment(new Date(endDate)).format("MMM DD YYYY"),
            availableBalance: `$${item.pay_calculates.amount_available}`,
            salary: `$${item.pay_calculates.accured_amount_total}`,
            cashDLimit: `$${item.pay_calculates.limit_amount}`,
            cashDWithdraws: `$${item.pay_calculates.withdrawals_total}`,
            salaryBalance: `$${item.pay_calculates.accured_amount}`,
          };
          if (systemCode == "KEYPAY") {
            var totalPayslips = item.pay_calculates.totalPayslips
              ? item.pay_calculates.totalPayslips
              : 0;
            var totalNetEaring = item.pay_calculates.totalNetEaring
              ? item.pay_calculates.totalNetEaring
              : 0;
  
            cell.ave = `$${totalNetEaring === 0 ? 0 : totalNetEaring / totalPayslips}`;
            cell.payslips = item.pay_calculates.totalPayslips
              ? item.pay_calculates.totalPayslips
              : 0;
          }
        } else {
          cell = {
            no: index + 1,
            employeeName: item.staff_infor.fullname,
            payPeriods: moment(new Date(startDate)).format("ll") + " - " + moment(new Date(endDate)).format("ll"),
            availableBalance: `$${item?.pay_calculates?.amount_available > 0 ? splitSting(item.pay_calculates.amount_available.toString()) : "0.00"}`,
            salary: `$${item?.pay_calculates?.accured_amount_total > 0 ? splitSting(item.pay_calculates.accured_amount_total.toString()) : "0.00"}`,
            cashDLimit: `$${item?.pay_calculates?.limit_amount > 0 ? splitSting(item.pay_calculates.limit_amount.toString()) : "0.00"}`,
            cashDWithdraws: `$${item?.pay_calculates?.withdrawals_total > 0 ? splitSting(item.pay_calculates.withdrawals_total.toString()) : "0.00"}`,
            salaryBalance: `$${item?.pay_calculates?.accured_amount > 0 ? splitSting(item.pay_calculates.accured_amount.toString()) : "0.00"}`,
          };
          if (systemCode == "KEYPAY") {
            var totalPayslips = item.pay_calculates.totalPayslips
              ? item.pay_calculates.totalPayslips
              : 0;
            var totalNetEaring = item.pay_calculates.totalNetEaring
              ? item.pay_calculates.totalNetEaring
              : 0;
  
            cell.ave = `$${splitSting((totalNetEaring === 0 ? 0 : totalNetEaring / totalPayslips).toString())}`;
            cell.payslips = item.pay_calculates.totalPayslips
              ? item.pay_calculates.totalPayslips
              : 0;
          }
        }
        dataTable.body.push(cell);
      });
      switch (id) {
        case "jsCsvWallet":
          generateCsv(dataTable);
          break;
        case "jsExcelWallet":
          generateExcel(dataTable);
          break;
        case "jsPdfWallet":
          generatePDF(dataTable);
          break;
        default:
          hideLoading();
          break;
      }
    }
  );

  $(".jsSearchWallet").on("submit", (event) => {
    event.preventDefault();
    searchKey = $("#jsSearchWallet").val();
    walletTable.ajax.reload();
  });

  (function setFooterTable() {
    let divLength = $(
      `#walletTable_wrapper .row:first-child div:nth-child(1) #walletTable_length`
    ).addClass("pagination--custom");
    $(`#walletTable_wrapper .row:last-child div`).first().append(divLength);
  })();

  // get data wallet
  async function getDataWallet(total) {
    let data = $.ajax({
      dataType: "json",
      method: "POST",
      url: `/get-wallet`,
      data: {
        companyId: idCompany,
        systemCode: systemCode,
        staffId: staffId ? staffId : "",
        page: 0,
        pageSize: total,
        _csrf: token,
        time_offset: Math.abs(new Date().getTimezoneOffset()) * 60 * 1000,
        searchKey: searchKey
      },
      error: function () {
        showToast("error", "Can't connect to server. Try again");
        return false;
      },
    });
    return data;
  }

  function hideLoading() {
    setTimeout(() => {
      $("#jsLoader").removeClass("show");
    }, 2000);
  }

  function generateCsv(data) {
    let csvContent = "";
    csvContent += data.title + "\r\n";
    csvContent += data.header.join(",") + "\r\n";
    data.body.forEach(function (rowArray) {
      let row = Object.values(rowArray).join(",");
      csvContent += row + "\r\n";
    });
    var blob = new Blob([csvContent], {
      type: "data:text/csv;charset=utf-8",
    });
    saveAs(blob, "wallet-" + Date.now().toString() + ".csv");
    hideLoading();
  }

  function generateExcel(data) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/wallet/excel`,
      data: {
        _csrf: token,
        json: JSON.stringify(data),
        systemCode,
      },
      async: true,
      success: function (responsive) {
        if (responsive.code == 200) {
          var blob = convertBase64toBlob(
            responsive.data,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          saveAs(blob, "wallet-" + Date.now().toString() + ".xlsx");
          hideLoading();
        }
      },
      error: function (e) {
        showToast("error", "Can't connect to server. Try again");
        hideLoading();
        return false;
      },
    });
  }

  function generatePDF(data) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/wallet/pdf`,
      data: {
        _csrf: token,
        json: JSON.stringify(data),
        systemCode,
      },
      async: true,
      success: function (responsive) {
        if (responsive.code == 200) {
          var blob = convertBase64toBlob(responsive.data, "application/pdf");
          saveAs(blob, "wallet-" + Date.now().toString() + ".pdf");
          hideLoading();
        }
      },
      error: function (e) {
        showToast("error", "Can't connect to server. Try again");
        hideLoading();
        return false;
      },
    });
  }

  function convertBase64toBlob(content, contentType) {
    contentType = contentType || "";
    var sliceSize = 512;
    var byteCharacters = window.atob(content); //method which converts base64 to binary
    var byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, {
      type: contentType,
    }); //statement which creates the blob
    return blob;
  }

  function splitSting(str) {
    try {
      const words = str.split('.');
      let newString = words[0];
      if (words.length > 1 && words[1].length > 2) {
        newString += "." + words[1].slice(0,2);
      } else if (words[1]?.length === 1) {
        newString += `.${words[1]}0`; 
      } else if (words[1]?.length === 2) {
        newString = str;
      } else {
        newString += ".00"
      }
      return newString;
    } catch (err) {
      return str;
    }
  }
});
