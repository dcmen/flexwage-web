$(document).ready(function () {
  const token = $('input[name="_csrf"]').val();
  const idCompany = $("input[name='_id']").val();
  const systemCode = $("input[name='systemCode']").val();
  const company = JSON.parse($("input[name='company']").val());
  const urlApi = $("input[name='urlApi']").val();
  const isEmployer = $('input[name="isEmployer"]').val();
  const socket = io();
  // const system_name = $("#system_name").val();
  let payPeriodId, total, totalDeduction, statusDeduction = -1, deductionTableDetailConfirm;
  let deductionFileDetail = [],
    role = $('input[name="role"]').val();
  var table;
  let deduction_repayment_type = $('input[name="deductionRePaType"]').val();
  renderDeductionTable(deduction_repayment_type);

  function renderDeductionTable(deduction_repayment_type) {
    let columns = [
      {
        data: null,
        className: "align-middle",
        render: function (data, type, full, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        },
      },
      {
        data: { start_date: "start_date", end_date: "end_date" },
        className: "align-middle",
        render: function (data) {
          return (
            "Pay cycle " +
            moment(data.start_date).format("DD/MM") +
            " to " +
            moment(data.end_date).format("DD/MM")
          );
        },
      },
      {
        data: null,
        className: "align-middle",
        render: function (data, type, row) {
          return getScheduleName(row);
        },
      },
      {
        data: "is_write_deductions_back_system",
        className: "align-middle",
        render: function (data) {
          return (
            '<span style="color: ' +
            (data ? "limegreen" : "red") +
            '">' +
            (data ? "Sent" : "Unsent") +
            "</span>"
          );
        },
      },
      {
        data: "is_prevent_withdrawals",
        className: "text-center align-middle",
        render: function (data) {
          return (
            '<i class="icofont ' +
            (data ? "icofont-lock" : "icofont-unlocked") +
            '" style="font-size: 27px;"></i>'
          );
        },
      },
      {
        data: "write_deductions_date",
        className: "align-middle",
        render: function (data) {
          return data ? moment(data).format("DD/MM/YYYY h:mm A") : "N/A";
        },
      },
      {
        data: "total_deductions_sent",
        className: "totalSent align-middle",
        render: function (data) {
          return data.toFixed(2);
        },
      },
      {
        data: "total_deductions_unsent",
        className: "totalUnsent align-middle",
        render: function (data) {
          return data.toFixed(2);
        },
      },
      {
        data: null,
        className: "align-middle",
        render: function (data, type, row) {
          var isDisconnected = $('.btn-reconnect-system').hasClass('btn-outline-danger');
          let string = "";
            let paymentType = row.repayment_status;
            if (role === "Admin") {
              if (deduction_repayment_type == "DIRECT_DEBIT_BY_APPROVAL" || deduction_repayment_type == "DIRECT_DEBIT_AUTO_PAY") {
                switch (paymentType) {
                  case "REQUESTED":
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #ffc107; !important">Request Sent</span>`;
                    break;
                  case "PROCESSING":
                    let info = "";
                    if (deduction_repayment_type == "DIRECT_DEBIT_BY_APPROVAL") {
                      info = `<i style="cursor: pointer;" class="icofont-question-circle" data-toggle="tooltip" data-placement="top" title="The payment has been approved by the employer. Please wait for at least 3 days for the bank to complete the payment."></i>`;
                    }
                    if (deduction_repayment_type == "DIRECT_DEBIT_AUTO_PAY") {
                      info = `<i style="cursor: pointer;" class="icofont-question-circle" data-toggle="tooltip" data-placement="top" title="Please wait for at least 3 days for the bank to complete the payment."></i>`;
                    }
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #0033cc; !important">Processing ${info}</span>`;
                    break;
                  case "PAID":
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #009933; !important">Paid</span>`;
                    break;
                  case "DISHONOURS":
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #ff0000; !important">Dishonours</span>`;
                    break;
                  default:
                    string = `<button class="btn btn-success btn-sm ml-2 jsPayNow ${row.total_deductions_sent > 0 && row.total_deductions_unsent == 0 ? '' : 'disabled'}" style="padding: 6px 14px; font-size: 14px;">Pay now</button>`;
                    break;
                }
              }
            } else {
              if (deduction_repayment_type == "DIRECT_DEBIT_BY_APPROVAL") {
                switch (paymentType) {
                  case "REQUESTED":
                    string = `<button class="btn btn-success btn-sm ml-2 jsApprovePayment" style="padding: 6px 14px; font-size: 14px;">Approve Payment</button>`;
                    break;
                  case "PROCESSING":
                    let info = `<i style="cursor: pointer;" class="icofont-question-circle" data-toggle="tooltip" data-placement="top" title="The request of payment is sent. Please wait for at least 3 days for the bank to complete the payment."></i>`;
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #0033cc; !important">Processing ${info}</span>`;
                    break;
                  case "PAID":
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #009933; !important">Paid</span>`;
                    break;
                  case "DISHONOURS":
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #ff0000; !important">Dishonours</span>`;
                    break;
                  default:
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #ffc107; !important">Payment Pending</span>`;
                    break;
                }
              } else if (deduction_repayment_type == "DIRECT_DEBIT_AUTO_PAY") {
                switch (paymentType) {
                  case "PROCESSING":
                    let info = `<i style="cursor: pointer;" class="icofont-question-circle" data-toggle="tooltip" data-placement="top" title="Please wait for at least 3 days for the bank to complete the payment."></i>`;
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #0033cc; !important">Processing ${info}</span>`;
                    break;
                  case "PAID":
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #009933; !important">Paid</span>`;
                    break;
                  case "DISHONOURS":
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #ff0000; !important">Dishonours</span>`;
                    break;
                  default:
                    string = `<span class="btn btn-outline-warning btn-sm ml-2 none-hover" style="padding: 0px 7px; font-size: 14px; color: #ffc107; !important">Auto Payment</span>`;
                    break;
                }
              }  
          }
          let checkDeductionFileMethod = true,
            filePath;
          if (systemCode == "DEPUTY" || systemCode == "ASTUTE") {
            filePath = row.deduction_file_path;
          } else if (systemCode == "XERO" || systemCode == "RECKON") {
            filePath = row.deduction_aba_file_path;
          }
  
          return (
            '<a title="View Deduction" class="btn btn-mini btn-outline-info accordion-toggle details-control ' +
            (row.total_deductions_sent === 0 &&
            row.total_deductions_unsent === 0 || isDisconnected
              ? "disabled"
              : "") +
            '">&nbsp' +
            '<i class="icofont icofont-eye-alt"></i></a>' +
            '<a title="Run Deduction" style="position: relative" class="btn btn-mini btn-outline-success accordion-toggle details-sent ml-2 ' +
            (!isDisconnected && row.total_deductions_unsent > 0
              ? ""
              : "disabled") +
            '">&nbsp' +
            '<i class="icofont icofont-share-alt"></i>' +
            '<i class="icofont icofont-ui-block icon-block-custom ' +
            (checkDeductionFileMethod && !isDisconnected ? "hiden" : "") +
            '"></i></a>' +
            `<div style="display: inline-block !important;" class="btn-group">
                <a data-toggle="dropdown" class="btn btn-mini btn-outline-warning accordion-toggle ml-2 ${
                  filePath && !isDisconnected ? "" : "disabled"
                }" style="display: ${
              systemCode != "KEYPAY" ? "inline-block" : "none"
            }">
                  <i class="icofont icofont-download-alt"></i>
                </a>
                <div class="dropdown-menu">
                  ${
                    systemCode == "DEPUTY"
                      ? '<a class="dropdown-item jsDeCsvOrAba">CSV file</a>'
                      : ""
                  }
                  ${
                    systemCode == "XERO" || systemCode == "RECKON"
                      ? '<a class="dropdown-item jsDeCsvOrAba">ABA file</a>'
                      : ""
                  }
                  <a class="dropdown-item jsDeExcel" data-path="${filePath}">EXCEL file</a>
                  ${
                    systemCode == "ASTUTE" ? "" : `<a class="dropdown-item jsDePdf">PDF file here</a>`
                  }
                </div>
              </div>` +
            '<a title="Undo file ABA" style="position: relative" class="btn btn-mini btn-outline-success jsUndo ml-2 ' +
            (isDisconnected || row.total_deductions_sent === 0 &&
            row.total_deductions_unsent === 0 || row.total_deductions_sent === 0 && row.total_deductions_unsent > 0 || row.repayment_status ? "disabled" : "") +
            '"><i class="icofont icofont-undo"></i>' +
            '<i class="icofont icofont-ui-block icon-block-custom ' +
            (!isDisconnected ? "hiden" : "") +
            '"></i></a>' +
            `<div class="d-inline">${string}</div>` +
            `<div id="deduction-${
              data._id
            }" tabindex="-1" role="dialog" class="modal fade">
              <div class="modal-dialog" style="max-width: 20%;" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Change Status</h5>
                  </div>
                  <div class="modal-body">
                    <select>
                    <option>${
                      systemCode == "XERO"
                        ? "Download ABA"
                        : systemCode == "DEPUTY"
                        ? "Download CSV"
                        : ""
                    }</option>
                    </select>
                  </div>
                  <div class="modal-footer d-flex justify-content-center">
                    <button type="button" class="btn btn-default waves-effect" data-dismiss="modal">Cancel</button>
                    <button  type="submit" class="btn btn-primary btn-change-role">Save</button>
                  </div>
                </div>
              </div>
            </div>`
          );
        },
      }
    ];
    let body;
    if (deduction_repayment_type == "DIRECT_DEBIT_AUTO_PAY" || deduction_repayment_type == "DIRECT_DEBIT_BY_APPROVAL") {
      body = [...columns,
        {
          data: null,
          className: "align-middle text-center pt-3",
          render: function (data, type, row) {
            return `<div class="radio-item">
                <input type="radio" ${row.total_deductions_sent > 0 && row.total_deductions_unsent === 0 ? 'checked' : ''}>
                <label class="m-0 blue"></label>
            </div>`;
          }
        },
        {
          data: null,
          className: "align-middle text-center pt-3",
          render: function(data, type, row) {
            let html;
            if (row.repayment_status == "PAID") {
              html = `<div class="radio-item">
                  <input type="radio" checked>
                  <label class="m-0 green"></label>
              </div>`;
            } else if (row.repayment_status == "PROCESSING") {
              html = `<div class="radio-item">
                  <input type="radio" checked>
                  <label class="m-0 blue"></label>
              </div>`;
            } else {
              html = `<div class="radio-item">
                  <input type="radio">
                  <label class="m-0"></label>
              </div>`;
            }
            return html;
          }
        }
    ];
    } else {
      body = [...columns];
    }

    table = $("#deductionTable").DataTable({
      paging: true,
      ordering: false,
      bLengthChange: true,
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
        url: `/get-deductionFile`,
        data: function (d) {
          var info = $("#deductionTable").DataTable().page.info();
          d.idCompany = idCompany;
          d.page = info.page;
          d.pageSize = info.length;
          d._csrf = token;
        },
        dataSrc: "result",
        dataFilter: function (data) {
          var json = $.parseJSON(data);
          var info = $("#deductionTable").DataTable().page.info();
          if (!json.success) {
            json.result = [];
            json.totalItem = 0;
          }
          if (info.page == 0) {
            totalDeduction = json.totalItem;
          }
          json.recordsTotal = totalDeduction;
          json.recordsFiltered = totalDeduction;
          json.result = json.result.map((item) => ({
            ...item,
            DT_RowId: `row_${item._id}`,
          }));
          return JSON.stringify(json);
        },
      },
      columns: body
    });
  }

  $("body").tooltip({ selector: '[data-toggle=tooltip]' });

  // Add event listener for opening and closing details
  $(document).on("click", "#deductionTable tbody a.details-control", function () {
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    const idDeductionFile = row.data()._id;
    let deductionDetail = $("#deductionTableDetail").DataTable({
      destroy: true,
      paging: true,
      ordering: false,
      bLengthChange: true,
      info: true,
      searching: false,
      serverSide: true,
      processing: true,
      scrollY: "52vh",
      "scrollX": true,
      scrollCollapse: true,
      language: {
        loadingRecords: "&nbsp;",
        processing: '<div class="spinner"></div>',
      },
      ajax: {
        type: "POST",
        url: `/get-deductionFile-detail`,
        data: function (d) {
          var info = $("#deductionTableDetail").DataTable().page.info();
          d.idDeductionFile = idDeductionFile;
          d.page = info.page;
          d.pageSize = info.length;
          d._csrf = token;
          d.deduction_status= -1;
        },
        dataSrc: "result",
        dataFilter: function (data) {
          var json = $.parseJSON(data);
          var info = $("#deductionTableDetail").DataTable().page.info();
          if (!json.success) {
            json.result = [];
            json.totalItem = 0;
          }
          if (info.page == 0) {
            total = json.totalItem;
          }
          json.recordsTotal = total;
          json.recordsFiltered = total;
          return JSON.stringify(json);
        },
      },
      columns: [
        {
          data: null,
          render: function (data, type, full, meta) {
            return meta.row + meta.settings._iDisplayStart + 1;
          },
        },
        {
          data: "staff",
          render: function (data) {
            return data.fullname;
          },
        },
        {
          data: "staff",
          render: function (data) {
            return getEmployeeType(data.salary_wag);
          },
        },
        {
          data: "total_amount_sent",
          className: "totalSent",
          render: function (data) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(data);
          },
        },
        {
          data: "total_fee_sent",
          className: "totalSent",
          render: function (data) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(data);
          },
        },
        {
          data: { total_amount_sent: "total_amount_sent", total_fee_sent: "total_fee_sent" },
          className: "totalSent",
          render: function (data) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(data.total_amount_sent + data.total_fee_sent);
          },
        },
        {
          data: "total_amount_unsent",
          className: "totalUnsent",
          render: function (data) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(data);
          },
        },
        {
          data: "total_fee_unsent",
          className: "totalUnsent",
          render: function (data) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(data);
          },
        },
        {
          data: {total_amount_unsent: "total_amount_unsent", total_fee_unsent: "total_fee_unsent"},
          className: "totalUnsent",
          render: function (data) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(data.total_amount_unsent + data.total_fee_unsent);
          },
        }
      ]
    });

    if ($('#jsModalDeductionDetail .dataTables_scrollHead')) {
      $('#deductionTableDetail').css({'transform': 'translateY(-43px)'});
      $('#jsModalDeductionDetail .dataTables_scrollHeadInner table').css({'transform': 'none'});
    }

    $("#jsModalDeductionDetail").modal({
      backdrop: false,
      show: true,
    });
  });


  $(document).on("click", "#deductionTable tbody a.details-sent", function () {
    statusDeduction = -1;
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    payPeriodId = row.data()._id;
    var bodyTable = [
      {
        data: null,
        render: function (data, type, full, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        },
      },
      {
        data: "staff",
        render: function (data) {
          return data.fullname;
        },
      },
      {
        data: "staff",
        render: function (data) {
          return getEmployeeType(data.salary_wag);
        },
      },
      {
        data: "total_amount_sent",
        className: "totalSent",
        render: function (data) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data);
        },
      },
      {
        data: "total_fee_sent",
        className: "totalSent",
        render: function (data) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data);
        },
      },
      {
        data: { total_amount_sent: "total_amount_sent", total_fee_sent: "total_fee_sent" },
        className: "totalSent",
        render: function (data) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data.total_amount_sent + data.total_fee_sent);
        },
      },
      {
        data: "total_amount_unsent",
        className: "totalUnsent",
        render: function (data) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data);
        },
      },
      {
        data: "total_fee_unsent",
        className: "totalUnsent",
        render: function (data) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data);
        },
      },
      {
        data: {total_amount_unsent: "total_amount_unsent", total_fee_unsent: "total_fee_unsent"},
        className: "totalUnsent",
        render: function (data) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data.total_amount_unsent + data.total_fee_unsent);
        },
      }
    ];
    deductionTableDetailConfirm = $("#deductionTableDetailConfirm").DataTable({
      destroy: true,
      paging: true,
      ordering: false,
      bLengthChange: true,
      info: true,
      searching: false,
      serverSide: true,
      processing: true,
      scrollY: "52vh",
      scrollCollapse: true,
      language: {
        loadingRecords: "&nbsp;",
        processing: '<div class="spinner"></div>',
      },
      ajax: {
        type: "POST",
        url: `/get-deductionFile-detail`,
        data: function (d) {
          var info = $("#deductionTableDetailConfirm").DataTable().page.info();
          d.idDeductionFile = payPeriodId;
          d.page = info.page;
          d.pageSize = info.length;
          d._csrf = token;
          d.deduction_status = Number(statusDeduction);
        },
        dataSrc: "result",
        dataFilter: function (data) {
          var json = $.parseJSON(data);
          var info = $("#deductionTableDetailConfirm").DataTable().page.info();
          if (!json.success) {
            json.result = [];
            json.totalItem = 0;
          }
          if (info.page == 0) {
            total = json.totalItem;
          }
          json.recordsTotal = total;
          json.recordsFiltered = total;
          return JSON.stringify(json);
        },
      },
      columns: systemCode == "KEYPAY" ? [ ...bodyTable, {
        data: {"deduction_status": "deduction_status", "total_deductions_unsent": "total_deductions_unsent", "total_deductions_sent": "total_deductions_sent" },
        render: function (data) {
          var status;
          var color;
          if (data.deduction_status) {
            if (data.deduction_status == 2) {
              status = "Failed";
              color = "#ff0000";
            } else if (data.deduction_status == 1) {
              status = "Success";
              color = "#32cd32";
            } else {
              status = "Pending";
              color = "#f6d807";
            }
          } else {
            if (data.total_deductions_unsent == 0 & data.total_deductions_sent > 0) {
              status = "Success";
              color = "#32cd32";
            } else {
              status = "Pending";
              color = "#f6d807";
            }
          }
          return `<span style="color: ${color}">${status}</span>`;
        }
      },
      {
        data: {"deduction_status": "deduction_status", "total_deductions_unsent": "total_deductions_unsent", "total_deductions_sent": "total_deductions_sent" },
        render: function (data) {
          var isDisabled;
          if (data.deduction_status && data.deduction_status == 1 && data.total_deductions_unsent == 0) {
            isDisabled = true;
          } else {
            if (data.total_deductions_unsent == 0 && data.total_deductions_sent > 0) {
              isDisabled = true;
            }
          }
          return `<div style="display: inline-block !important;" class="btn-group">
            <a data-toggle="dropdown" class="btn btn-mini btn-outline-info accordion-toggle ml-2 ${
              isDisabled || data.total_deductions_unsent == 0 & data.total_deductions_sent == 0 ? "disabled" : ""
                }">
              <i class="icofont icofont-edit-alt"></i>
              <i class="icofont icofont-ui-block icon-block-custom ${ isDisabled || data.total_deductions_unsent == 0 & data.total_deductions_sent == 0 ? "" : "hiden"}"></i>
            </a>
            <div class="dropdown-menu">
              <a class="dropdown-item mr-2 jsSendManually">Send manually</a>
              <a class="dropdown-item jsSendAutomatically">Send automatically</a>
            </div>
          </div>`;
        }
      }]  : bodyTable, 
    });

    if (systemCode == "KEYPAY") {
      $("#deductionTableDetailConfirm_wrapper .row:first-child div:nth-child(2)").html(`
      <div style="float: right; padding-top: 10px;">
        <div class="form-check form-check-inline mr-4">
          <input class="form-check-input" type="radio" name="deductionStatus" id="status1" value="-1" checked>
          <label class="form-check-label pl-0" for="status1">
            All
          </label>
        </div>
        <div class="form-check form-check-inline mr-4">
          <input class="form-check-input" type="radio" name="deductionStatus" id="status2" value="0">
          <label class="form-check-label pl-0" for="status2">
            Pending
          </label>
        </div>
        <div class="form-check form-check-inline mr-4">
          <input class="form-check-input" type="radio" name="deductionStatus" id="status3" value="1">
          <label class="form-check-label pl-0" for="status3">
            Success
          </label>
        </div>
        <div class="form-check form-check-inline mr-4">
          <input class="form-check-input" type="radio" name="deductionStatus" id="status4" value="2">
          <label class="form-check-label pl-0" for="status4">
            Failed
          </label>
        </div>
      </div>
      `);
    }

    if ($('#jsModalDeductionDetailConfirm .dataTables_scrollHead')) {
      $('#deductionTableDetailConfirm').css({'transform': 'translateY(-43px)'});
      $('#jsModalDeductionDetailConfirm .dataTables_scrollHeadInner table').css({'transform': 'none'});
    }

    $("#jsModalDeductionDetailConfirm").modal({
      backdrop: false,
      show: true,
    });
  });

  $(document).on("change", "input[name='deductionStatus']", function () {
    statusDeduction = $(this).val();
    $("#deductionTableDetailConfirm").DataTable().ajax.reload();
  });

  $(".jsSubmitDeduction").click(function () {
    $("#jsModalCheckSent").modal({
      backdrop: false,
      show: true,
    });
  });

  $("#deductionTableDetailConfirm tbody").on("click", ".jsSendManually", function() {
    showModalConfirm($(this).closest("tr"), "MANUALLY");
  });

  $("#deductionTableDetailConfirm tbody").on("click", ".jsSendAutomatically", function() {
    showModalConfirm($(this).closest("tr"), "AUTO");
  });

  function showModalConfirm (tr, type) {
    var row = deductionTableDetailConfirm.row(tr);
    var id = row.data().pay_period_id;
    var staff_id = row.data().staff_id;
    $("#jsModalCheckSentOne .modal-body").html(`<input hidden name="id_period" value="${id}">
    <input hidden name="type_period" value="${type}">
    <input hidden name="staff_id" value="${staff_id}">
    <p
        style="font-size: 16px; font-weight: 600;">
        ${systemCode != 'DEPUTY' ? `Are you sure you want to mark deductions of this employee back to ${systemCode} ${ type == 'AUTO' ? 'automatically' : 'manually' } ?` : `Are you sure you
        want to mark deductions of
        this
        pay period in a
        file
        ready that will
        be
        ready to
        download to
        HR3 ?` }
    </p>`);
    $("#jsModalCheckSentOne").modal({
      backdrop: false,
      show: true,
    });
  }

  $("#submit-sent-one").click(function () {
    showLoading();
    $("#jsModalCheckSentOne").modal("hide");
    runOneDeductionOne($('#jsModalCheckSentOne input[name="id_period"]').val(), $('#jsModalCheckSentOne input[name="type_period"]').val(), $('#jsModalCheckSentOne input[name="staff_id"]').val());
  });

  function runOneDeductionOne (id, type, staff_id) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/keypay/deduction-back-to-keypay`,
      data: {
        type,
        pay_period_id: id,
        staff_id,
        _csrf: token,
      },
      async: true,
      success: function (data) {
        hidenLoading();
        if (data.success && data.result.fail_employees_list.length == 0) {
          deductionTableDetailConfirm.ajax.reload();
          table.ajax.reload();
          showToast("success", "Write period deduction files successfully.");
        } else {
          if (data.result?.fail_employees_list?.length > 0) {
            $("ul.fail-employee-list").remove("li");
            for (let emp of data.result.fail_employees_list) {
              $("ul.fail-employee-list").append(
                `<li class="ml-2">- ${emp}</li>`
              );
            }
            $("#jsModalToastFailEmpList").modal("show");
          } else {
            showToast("error", data.message); 
          }
        }
        deductionTableDetailConfirm.ajax.reload();
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  }

  $(document).on("click", "#deductionTable tbody a.jsUndo", function () {
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    payPeriodId = row.data()._id;
    $('#jsWarningUndo').modal({
      backdrop: false,
      show: true,
    });
    $('#submit-sent-undo').click(function () {
      showLoading();
      $('#jsWarningUndo').modal('hide');
      $.ajax({
        dataType: "json",
        method: "POST",
        url: `/deduction/undo`,
        data: {
          idCompany: idCompany,
          payPeriodId: payPeriodId,
          codeSystem: systemCode,
          _csrf: token,
        },
        async: true,
        success: function (data) {
          hidenLoading();
          if (data.success) {
            showToast("success", data.message);
            table.ajax.reload(null, false);
          } else {
            showToast("error", data.message);
          }
          return true;
        },
        error: function () {
          hidenLoading();
          showToast("error", "Can not connect to server. Please try again.");
          return false;
        },
      });
    });
  });

  $("#submit-sent").click(function () {
    showLoading();
    // detailRunDeduction();
    $("#jsModalCheckSentOne").modal("hide");
    runOneDeduction($('#jsModalCheckSentOne input[name="id_period"]').val(), $('#jsModalCheckSentOne input[name="type_period"]').val(), $('#jsModalCheckSentOne input[name="staff_id"]').val());
  });

  function runOneDeduction (id, type, staff_id) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/one-pay-period`,
      data: {
        idCompany: idCompany,
        payPeriodId: payPeriodId,
        isPreventWithdrawals: $('input[name="check-withdraw"]').is(":checked"),
        codeSystem: systemCode,
        _csrf: token,
      },
      async: true,
      success: function (data) {
        if (!data.success && data.errorCode == "LOGIN_AGAIN") {
          loginAgain();
          return;
        }
        if (data.success) {
          if (data.result.fail_employees_list.length > 0) {
            $("#jsModalToastFailEmpList ul.fail-employee-list").html("");
            for (let emp of data.result.fail_employees_list) {
              $("ul.fail-employee-list").append(
                `<li class="ml-2">- ${emp}</li>`
              );
            }
          }
          getPeriodDeductionFileById(
            payPeriodId,
            data.result.fail_employees_list.length
          );
          deductionTableDetailConfirm.ajax.reload();
        } else {
          hidenLoading();
          deductionTableDetailConfirm.ajax.reload();
          if (data.errorCode === "REQUIRE_DONT_HAVE_ANY_PAYRUNS") {
            showToast(
              "error",
              `There are no pay runs for this period in ${systemCode}`
            );
          } else if (data.errorCode === "REQUIRE_DEDUCTION_TYPE") {
            showToast(
              "error",
              "You don't have any payroll deduction types setup. Please go to your Profile to add a payroll deduction type."
            );
          } else if (data.errorCode === "REQUIRE_KEYPAY_DEDUCTION_CATEGORY") {
            showToast(
              "error",
              "You don't have any payroll deduction category setup. Please go to your Profile to add a payroll deduction type."
            );
          } else if (data.errorCode == "REQUIRE_SETUP_ABA_BANK") {
            showToast(
              "error",
              `Your company hasn't been setup "ABA's Bank" yet!`
            );
          } else {
            showToast("error", "Can not connect to server. Please try again. </br> Error Code: "+ data.code);
          }
        }
        return true;
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  };

  $(".close").click(function () {
    $("#deductionTableDetail tbody").remove();
  });

  $(document).on(
    "click",
    "#deductionTable tbody a.jsDeCsvOrAba, #deductionTable tbody a.jsDeExcel, #deductionTable tbody a.jsDePdf",
    async function () {
      showLoading();
      if (systemCode != 'ASTUTE') {
        var tr = $(this).closest("tr");
        var row = table.row(tr);
        var dataRow = row.data();
        var idBtn = $(this).attr("class").toString();
        var companyName = $("#jsNameCompany").text();
        if (idBtn.match(/jsDeCsvOrAba/)) {
          getFileCSV(row);
        } else {
          var response = await getDataDeduction(dataRow._id);
          if (response.success == true) {
            var deductions = response.result;
            if (deductions.length > 0) {
              var dataTable = {
                body: [],
                title: "Deductions Report",
                companyName: "["+ systemCode.charAt(0) + systemCode.slice(1).toLowerCase() + "] " + companyName.trim(),
                dateReport: moment().format("DD/MM/YYYY"),
                payPeriod:
                  moment(dataRow.start_date).format("DD/MM/YYYY") +
                  " to " +
                  moment(dataRow.end_date).format("DD/MM/YYYY"),
                scheduleName: getScheduleName(dataRow), 
              };
              var sentAmount = 0, unsentAmount = 0;
              deductions.forEach((item, index) => {
                var cell = {
                  no: index + 1,
                  employeesName: item.staff.fullname,
                  employeesType: getEmployeeType(item.salary_wag),
                  capitalSent: new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(item.total_amount_sent),
                  feeSent: new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(item.total_fee_sent),
                  totalSent: new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(item.total_deductions_sent),
                  capitalUnsent: new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(item.total_amount_unsent),
                  feeUnsent: new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(item.total_fee_unsent),
                  totalUnsent: new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(item.total_deductions_unsent)
                };
                dataTable.body.push(cell);
                sentAmount +=  item.total_deductions_sent;
                unsentAmount += item.total_deductions_unsent;
              });
              dataTable.sentAmount = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(sentAmount);
              dataTable.unsentAmount = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(unsentAmount);
              if (idBtn.match(/jsDeExcel/)) {
                getFileExcel(dataTable);
              }
              if (idBtn.match(/jsDePdf/)) {
                getFilePDF(dataTable);
              }
            }
          }
        }
      } else {
        const astutePath = $(this).data("path");
        downloadFile(astutePath);
        hidenLoading();
      }
    }
  );

  // Download CSV details
  $(document).on("click", "#deductionTable tbody a.details-download", function () {
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    let urlPath, filePath;
    if (systemCode == "DEPUTY") {
      filePath = row.data().deduction_file_path;
    } else if (systemCode == "XERO" || systemCode == "RECKON") {
      filePath = row.data().deduction_aba_file_path;
    }
    if (deductionFileDetail.length > 0) {
      deductionFileDetail.filter((item) => {
        if (item._id === row.data()._id) {
          let filePathDetail;
          if (systemCode == "DEPUTY") {
            filePathDetail = item.deduction_file_path;
          } else if (systemCode == "XERO" || systemCode == "RECKON") {
            filePathDetail = item.deduction_aba_file_path;
          }
          urlPath = `/${filePathDetail}`;
        } else {
          urlPath = `/${filePath}`;
        }
      });
    } else {
      urlPath = `/${filePath}`;
    }
    downloadFile(urlPath);
    hidenLoading();
  });

  $(document).on("click", "#deductionTable tbody a.jsDownloadFileDeduction", function () {
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    let id = row.data()._id;

    $("#deduction-" + id).modal({
      backdrop: false,
      show: true,
    });
  });

  function getPeriodDeductionFileById(payPeriodId, length) {
    $.ajax({
      dataType: "json",
      type: "POST",
      url: `/get-deductionFileById`,
      async: true,
      data: {
        payPeriodId: payPeriodId,
        _csrf: token,
      },
      success: function (data) {
        if (!data.success && data.errorCode == "LOGIN_AGAIN") {
          loginAgain();
          return;
        }
        deductionFileDetail.push(data.result);
        $("#jsModalCheckSent").modal("hide");
        hidenLoading();
        if (data.success) {
          $(`#deductionTable tbody #row_${data.result._id} td:eq(3)`).html(
            '<span style="color: ' +
            (data.result.is_write_deductions_back_system ? "limegreen" : "red") +
            '">' +
            (data.result.is_write_deductions_back_system ? "Sent" : "Unsent") +
            "</span>"
          );
          if (data.result.is_prevent_withdrawals) {
            $(`#deductionTable tbody #row_${data.result._id} td:eq(4)`).html(
              '<i class="icofont icofont-lock" style="font-size: 27px"></i>'
            );
          }
          $(`#deductionTable tbody #row_${data.result._id} td:eq(5)`).html(
            moment(data.result.write_deductions_date).format("DD/MM/YYYY h:mm A")
          );
          $(`#deductionTable tbody #row_${data.result._id} td:eq(6)`).html(
            data.result.total_deductions_sent.toFixed(2)
          );
          $(`#deductionTable tbody #row_${data.result._id} td:eq(7)`).html(
            data.result.total_deductions_unsent.toFixed(2)
          );

          $(
            `#deductionTable tbody #row_${data.result._id} a.jsUndo`
          ).removeClass("disabled");

          if (length > 0) {
            $("#jsModalToastFailEmpList").modal("show");
          } else {
            showToast("success", "Generate file successfully.");
            $(
              `#deductionTable tbody #row_${data.result._id} a.details-sent`
            ).addClass("disabled");
            $(
              `#deductionTable tbody #row_${data.result._id} a.details-download`
            ).removeClass("disabled");
          }
        } else {
          showToast("error", "Can not connect to server. Please try again.");
        }
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  }

  const downloadFile = (function () {
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.style = "display: none";
    return function (url, fileName) {
      iframe.src = url;
    };
  })();

  function setFooterTable() {
    let divLength = $(
      `#deductionTable_wrapper .row:first-child div:nth-child(1) #deductionTable_length`
    ).addClass("pagination--custom");
    $(`#deductionTable_wrapper .row:last-child div`).first().append(divLength);
  }

  function getFileCSV(row) {
    let urlPath, filePath;
    if (systemCode == "DEPUTY") {
      filePath = row.data().deduction_file_path;
    } else if (systemCode == "XERO" || systemCode == "RECKON") {
      filePath = row.data().deduction_aba_file_path;
    }
    if (deductionFileDetail.length > 0) {
      deductionFileDetail.filter((item) => {
        if (item._id === row.data()._id) {
          let filePathDetail;
          if (systemCode == "DEPUTY") {
            filePathDetail = item.deduction_file_path;
          } else if (systemCode == "XERO" || systemCode == "RECKON") {
            filePathDetail = item.deduction_aba_file_path;
          }
          urlPath = `${filePathDetail}`;
        } else {
          urlPath = `${filePath}`;
        }
      });
    } else {
      urlPath = `${filePath}`;
    }
    downloadFile(urlPath);
    hidenLoading();
  }

  function getFileExcel(dataTable) {
    //
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/admin/company/deduction/excel`,
      data: {
        _csrf: token,
        json: JSON.stringify(dataTable)
      },
      success: function (responsive) {
        if (responsive.success) {
          var blob = convertBase64toBlob(
            responsive.data,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          saveAs(blob, "Deduction-" + Date.now().toString() + ".xlsx");
        } else {
          showToast("error", "Can't export data.");
        }
        hidenLoading();
        return true;
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  }

  function getFilePDF(dataTable) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/admin/company/deduction/pdf`,
      data: {
        _csrf: token,
        json: JSON.stringify(dataTable)
      },
      success: function (responsive) {
        if (responsive.success) {
          var blob = convertBase64toBlob(responsive.data, "application/pdf");
          saveAs(blob, "Deduction-" + Date.now().toString() + ".pdf");
        } else {
          showToast("error", "Can't export data.");
        }
        hidenLoading();
        return true;
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  }

  async function getDataDeduction(idDeductionFile) {
    let data = $.ajax({
      dataType: "json",
      method: "POST",
      url: `/get-deductionFile-detail`,
      data: {
        idDeductionFile: idDeductionFile,
        page: 0,
        pageSize: 10000,
        _csrf: token,
        deduction_status: -1
      },
      success: function (responsive) {
        data = responsive;
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
    return data;
  }

  function getScheduleName(row) {
    let scheduleName = "N/A";
    if (systemCode == "DEPUTY") {
      scheduleName =
        row.company_brands.length > 0
          ? `[${row.company_brands[0].code}] ${row.pay_period_origination.name}`
          : row.pay_period_origination.name;
    } else if (systemCode == "KEYPAY") {
      scheduleName = row.keypay_pay_schedule?.name;
    } else {
      scheduleName = row.xero_pay_calendar?.Name;
    }
    return scheduleName;
  }

  function getEmployeeType(data) {
    let employeeType;
    if (systemCode === "DEPUTY") {
      employeeType = "Timesheet";
    } else {
      if (data === 2) {
        employeeType = "Timesheet";
      } else if (data === 3) {
        employeeType = "Salary & TimeSheet";
      } else {
        employeeType = "Salary";
      }
    }
    return employeeType;
  }

  $("#jsDedutionFiles").on("click", () => {
    setFooterTable();
  });

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

  // function detailRunDeduction() {
  //   $('#jsModalDeductionDetailConfirm .modal-show-run').removeClass('hide');
  // }

  $(document).on("click", "#deductionTable button.jsPayNow", function () {
    if (!$(this).hasClass('disabled')) {
      showLoading();
      var tr = $(this).closest("tr");
      var row = table.row(tr);
      let id = row.data()._id;
      actionPayment(id, {
        payPeriodId: id,
        _csrf: token,
        idCompany: idCompany
      });
    }
  });

  $(document).on("click", "#deductionTable button.jsApprovePayment", function () {
    if (!$(this).hasClass('disabled')) {
      showLoading();
      var tr = $(this).closest("tr");
      var row = table.row(tr);
      let id = row.data()._id;
      actionPayment(id, {
        payPeriodId: id,
        _csrf: token,
        idCompany: idCompany,
        isEmployer: true
      });
    }
  });

  function actionPayment(id, body) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/admin/pay-now`,
      data: body,
      success: function (responsive) {
        if (responsive.success) {
          if (body.isEmployer) {
            showToast("success", "Approved payment successfully");
          } else {
            showToast("success", responsive.message);
          }
        } else {
          showToast("error", responsive.message);
        }
        hidenLoading();
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  }

  $("#jsSaveDeductionRepayment").on('click', function(event) {
    showLoading();
    let paymentType = $('input[name="deductionRepaymentType"]:checked').val();
    let isOK = false;
    const body = {
      _csrf: token,
      deductionPaymentTypes: paymentType,
      companyId: idCompany
    };
    if ((paymentType === "DIRECT_DEBIT_BY_APPROVAL" || paymentType === "DIRECT_DEBIT_AUTO_PAY")) {
        let makeRepaymentDate = $('select[name="makeRepaymentDate"]').val();
        let makePaymentTime = $('input[name="makePaymentTime"]').val();
        isOK = true;
        if (makeRepaymentDate && makeRepaymentDate != '-1') {
          body['makeRepaymentDate'] = makeRepaymentDate;
          body['makePaymentTime'] = makePaymentTime;
        } else {
          showToast('error', "Please choose time to make repayment automatically.");
          hidenLoading();
          return false;
        }
    }
    if (paymentType === "ABA_FILE_VIA_PAYROLL_SYSTEM" || paymentType === "CASHD_GENERATED_ABA_FILE") {
        isOK = true;
    }

    if (isOK) {
        $.ajax({
            method: "post",
            url: `/admin/deduction-repayment-type`,
            data: body,
        })
        .done(function (response) {
            if (response.success) {
              hidenLoading();
              showToast('success', "Setup successfully.");
            } else {
                $('form.form-setup-type')[0].reset();
                hidenLoading();
                showToast('error', response.messages);
            }
        })
        .fail(function (err) {
            hidenLoading();
        });
    } else {
        showToast('error', "Please click receive / reset direct debit authority.");
        hidenLoading();
    }
  }); 

  $(document).on('click', '#deductionTable a.jsShowMail', function() {
    showLoading();
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    var data = row.data();
    $(`#jsShowMail tbody.jsShowContent`).html(`<tr>
      <td>
        <p style="text-align: center; color: #2e92f7; font-size: 24px;">Direct Debit Notification</p>
        <p style="padding-top: 10px;">Your account will be debited as follows</p>
        <p style="margin-top: 30px;">Pay period:<span style="margin-left: 40px;">${moment(data.start_date).format("DD/MM/YYYY") +" to " +moment(data.end_date).format("DD/MM/YYYY")}</span><br/>
          Amount:<span style="margin-left: 40px;">${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data.total_deductions_sent)}</span><br/>
          Due of payment:<span style="margin-left: 40px;">${moment(data.payment_due_date).format("DD/MM/YYYY")}</span><br/>
        </p>
        <p style="margin-top: 20px;">Any queries, appease email:<a href="mailto:support@cashd.com.au"> support@cashd.com.au</a></p>
        <p style="margin-top: 30px;">Thank you <br/>
          Best regards,
        </p>
        <p style="margin-top: 30px; margin-bottom: 20px;">The CashD team.</p>
      </td>
    </tr>`);
    $(`#jsShowMail`).modal('show');
    hidenLoading();
  });

  $(document).on('click', '#deductionTable a.jsShowSendMai', function() {
    var tr = $(this).closest("tr");
    var row = table.row(tr);
    var dataRow = row.data();
    $('input[name="valueMail"]').val(JSON.stringify(dataRow));
    $('#jsChooseDatePayment').modal({
      show: true,
      backdrop: false,
    });
  });

  $('button.jsSendMailPayment').click(function() {
    showLoading();
    let valueJson = $('input[name="valueMail"]').val();
    let data = JSON.parse(valueJson);
    let date = $('select[name="oneMakeRepaymentDate"]').val();
    let timeRePayment = $('input[name="oneMakePaymentTime"]').val();
    if (!date || date == '-1') {
      showToast('error', 'Please setup time to make repayment');
      hidenLoading();
    } else {
      sendMailPayment(data, date, timeRePayment);
    }
  });

  function sendMailPayment(dataRow, date, time) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/admin/send-mail-payment`,
      data: {
        payPeriodId: dataRow._id,
        _csrf: token,
        companyId: idCompany,
        amount: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(dataRow.total_deductions_sent),
        payRate: moment(dataRow.start_date).format("DD/MM/YYYY") +" to " +moment(dataRow.end_date).format("DD/MM/YYYY"),
        date: date,
        timeMarkRePayment: time,
        endDate: dataRow.end_date
      },
      success: function (responsive) {
        if (responsive.success) {
          showToast("success", "Send notice of Payroll deduction repayment successfully.");
          $('#jsChooseDatePayment').modal('hide');
        }
        hidenLoading();
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  }

  // socket listen event 
  socket.on(idCompany + "_REPAYMENT", (data) => {
      if (data.company) {
        const company = data.company;
        $(`input[name="deductionRepaymentType"][value="${company.deduction_repayment_type}"]`).prop('checked', true);
        $('#directDebitAuthority').prop('checked', company.direct_debit_form_id ? true : false);
        if (company.deduction_repayment_type === "DIRECT_DEBIT_BY_APPROVAL" || company.deduction_repayment_type === "DIRECT_DEBIT_AUTO_PAY") {
          $('select[name="sendMailDate"]').val(company.remind_write_deduction_date);
          $('input[name="sendMailTime"]').val(company.remind_write_deduction_time);
          $('select[name="makeRepaymentDate"]').val(company.make_repayment_date);
          $('input[name="makePaymentTime"]').val(company.make_repayment_time);
        }

        //Reload table after change deduction repayment type
        if (table) {
          table.destroy();
        }
        let header = `<tr>
            <th style="padding-bottom: 15px;" scope="col">#</th>
            <th style="padding-bottom: 15px;">Pay Periods</th>
            <th style="padding-bottom: 15px;">Schedule Name</th>
            <th style="padding-bottom: 15px;">Status</th>
            <th style="padding-bottom: 15px;">Withdraws</th>
            <th style="padding-bottom: 15px;">DateTime</th>
            <th style="padding-bottom: 15px;">Sent Amount</th>
            <th style="padding-bottom: 15px;">Unsent Amount</th>
            <th style="padding-bottom: 15px;">Action</th>
        </tr>`;
        let html = `<table id="deductionTable" class="table table-bordered nowrap" style="width: 100%">
        <thead class="thead-dark">
        ${company.deduction_repayment_type == "DIRECT_DEBIT_AUTO_PAY" || company.deduction_repayment_type == "DIRECT_DEBIT_BY_APPROVAL" ? `
        <tr>
            <th style="padding-bottom: 15px;" rowspan="2" scope="col">#</th>
            <th style="padding-bottom: 15px;" rowspan="2">Pay Periods</th>
            <th style="padding-bottom: 15px;" rowspan="2">Schedule Name</th>
            <th style="padding-bottom: 15px;" rowspan="2">Status</th>
            <th style="padding-bottom: 15px;" rowspan="2">Withdraws</th>
            <th style="padding-bottom: 15px;" rowspan="2">DateTime</th>
            <th style="padding-bottom: 15px;" rowspan="2">Sent Amount</th>
            <th style="padding-bottom: 15px;" rowspan="2">Unsent Amount</th>
            <th style="padding-bottom: 15px;" rowspan="2">Action</th>
            <th class="text-center" style="padding-top: 2px; padding-bottom: 2px; border-bottom: 0px solid #e9ecef; width: 15px;" colspan="2">Payment Status</th>
        </tr>
        <tr class="">
            <th class="m-0 text-center" style="font-size: 12px; padding-top: 2px !important; padding-bottom: 2px !important; width: 15px; padding-left: 5px; padding-right: 5px;">
                Deduction <br/> Run ?
            </th>
        <th class="m-0 text-center" style="font-size: 12px; padding-top: 2px !important; padding-bottom: 2px !important; width: 15px; padding-left: 5px; padding-right: 5px;">
            Payment <br/> Paid ?
        </th>
        ` : header}
        </tr>
        </thead>
        <tbody>
        </tbody>
        </table>
        `;
        $("#jsDeductionTable").html(html);
        renderDeductionTable(company.deduction_repayment_type);
        setFooterTable();
      } else {
        table.rows().data().filter(function(value, index) {
          if (value._id === data.payPeriodId) {
            table.ajax.reload(null, false);
          }
        });
      }
  });

  socket.on(idCompany + "_DPC", (data) => {
    if (data.company.deduction_file_method) {
      $(`input[value="${data.company.deduction_file_method}"]`).prop('checked', true);
    } 
    $('select[name="sendMailDate"]').val(data.company.remind_write_deduction_date);
    $('input[name="sendMailTime"]').val(data.company.remind_write_deduction_time);
  });

});
