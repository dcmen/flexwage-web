$(document).ready(function () {
  const token = $('input[name="_csrf"]').val();
  const companyId = $("input[name='_id']").val();
  const balance = $('input[name="balance"]').val();
  let payPeriodsId = "";
  $("#jsPeriodPayCycle").select2();

  const reconcileTable = $("#reconcileTable").DataTable({
    searching: false,
    processing: true,
    info: true,
    paging: true,
    serverSide: true,
    lengthChange: true,
    ordering: false,
    language: {
      loadingRecords: "&nbsp;",
      processing: '<div class="spinner"></div>',
    },
    ajax: {
      type: "POST",
      url: "/admin/get-reconciles",
      data: function (d) {
        var info = $("#reconcileTable").DataTable().page.info();
        d.page = info.page;
        d.pageSize = info.length;
        d._csrf = token;
      },
      dataSrc: "result",
      dataFilter: function (data) {
        var json = $.parseJSON(data);
        json.recordsFiltered = json.total;
        json.recordsTotal = json.total;
        if (json) {
          $("#statementBalance").text(
            `$${(json.totalAmountLenderFinancial[0] &&
            json.totalDebitReconcile[0]
              ? json.totalAmountLenderFinancial[0].total_amount -
                json.totalDebitReconcile[0].main_monoova_amount
              : 0
            ).toFixed(2)}`
          );
          $("#statementBalanceFee").text(
            `(+ $${
              json.totalDebitReconcile[0]
                ? json.totalDebitReconcile[0].main_monoova_amount_fee.toFixed(2)
                : 0
            } Fee)`
          );
          $("#cashd-bank-balance").text(
            `$${(json.totalAmountLenderFinancial[0] &&
            json.totalDebitReconcile[0]
              ? json.totalAmountLenderFinancial[0].total_amount -
                json.totalDebitReconcile[0].main_cashd_amount
              : 0
            ).toFixed(2)}`
          );
          $("#cashd-bank-balance-fee").text(
            `(+ $${
              json.totalDebitReconcile[0]
                ? json.totalDebitReconcile[0].main_cashd_amount_fee.toFixed(2)
                : 0
            } Fee)`
          );
        }
        return JSON.stringify(json);
      },
    },
    columns: [
      {
        data: null,
        render: function (data, type, row) {
          let monoovaTransactions;
          if (row.deductions.length > 0) {
            monoovaTransactions = row.deductions[0].monoova_transactions;
          } else {
            monoovaTransactions = row.monoova_transactions;
          }
          let content = `<div class="d-flex justify-content-center">
          <div class="line item">
            <div class="d-flex justify-content-center">
              <div class="statement statement-info" style="margin-top: 2.2rem">`;
          if (monoovaTransactions?.length > 0) {
            content += `<div class="details-container details-left d-flex ${
              monoovaTransactions?.length > 0 ? "" : "hiden"
            }">
                <div class="details d-flex">
                  <span>${moment(monoovaTransactions[0].dateTime).format(
                    "DD MMM YYYY"
                  )}</span>
                  <span class="pt-1">${
                    monoovaTransactions[0].receivables_type == "CAPITAL_LOAN"
                      ? "Employer deposit Capital"
                      : monoovaTransactions[0].description
                  }</span>
                  <span class="pt-3">Transaction ID: ${
                    monoovaTransactions[0].transactionId
                  }</span>
                  <span></span>
                  <!-- <a class="more">More details</a> -->
                </div>
                <div class="amount spent sent">$${
                  monoovaTransactions[0].credit
                }&nbsp;</div>
                <div class="amount received set">
                  <span>$${monoovaTransactions[0].debit}&nbsp;</span>
                  <span class="pt-1" style="font-weight: 400;">(+ $${
                    monoovaTransactions[0].fee_debit
                  } Fee)</span>
                  <span class="pt-3 text-success">$${
                    monoovaTransactions[0].debit +
                    monoovaTransactions[0].fee_debit
                  }</span>
                </div>
              </div>
            </div>
            <div class="ok">`;
          }

          if (row.deductions.length > 0) {
            if (monoovaTransactions?.length > 0) {
              content += `
              <a id="reconcile-${
                monoovaTransactions[0]._id
              }" class="xbtn okayButton btn ${
                !monoovaTransactions[0].is_reconciled ? "" : "hiden"
              }">OK</a>
                  
              <div class="group-reconciled-${
                monoovaTransactions[0]._id +
                " " +
                (monoovaTransactions[0].is_reconciled ? "" : "hiden")
              }">
                <p class="text-success pt-5 px-2 pb-2">Reconciled</p>
                <a id="cancelReconcile-${
                  monoovaTransactions[0]._id
                }" class="text-danger btn-cancel px-3">Cancel</a>
              </div>`;
            } else {
              content += `<p class="pt-5 px-3 pb-2">Syncing...</p>`;
            }
          }

          content += `</div>
            <div class="statement create">
          `;
          if (row.deductions.length > 0) {
            content += `<ul class="nav nav-tabs" id="statementTab" role="tablist">
                <li class="nav-item">
                  <a class="nav-link active" id="match-tab" data-toggle="tab" href="#match" role="tab" aria-controls="match" aria-selected="true">Match</a>
                </li>
                <!-- <li class="nav-item">
                  <a class="nav-link" id="findMatch-tab" data-toggle="tab" href="#findMatch" role="tab" aria-controls="findMatch" aria-selected="false">Find & Match</a>
                </li> -->
              </ul>
              <div class="tab-content" id="statementTabContent">
                <div class="tab-pane fade show active" id="match" role="tabpanel" aria-labelledby="match-tab">
                  <div class="statement statement-info">
                    <div class="details-container d-flex">
                      <div class="details d-flex">
                        <span>${moment(row.deductions[0].created_date).format(
                          "DD MMM YYYY"
                        )}</span>
                        <span class="pt-1">${row.deductions[0].name}</span>
                        <span class="pt-3">Pay period: ${
                          moment(
                            row.deductions[0].pay_periods[0]?.start_date
                          ).format("ll") +
                          " - " +
                          moment(
                            row.deductions[0].pay_periods[0]?.end_date
                          ).format("ll")
                        }</span>
                        <span></span>
                        <!-- <a class="more">More details</a> -->
                      </div>
                      <div class="amount spent sent">$0&nbsp;</div>
                      <div class="amount received set">
                        <span>$${row.deductions[0].amount}&nbsp;</span>
                        <span class="pt-1" style="font-weight: 400;">(Inc $${
                          row.deductions[0].fee_amount
                        } Fee)</span>
                        <span class="pt-3 text-success">$${
                          row.deductions[0].amount +
                          row.deductions[0].fee_amount
                        }</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="tab-pane fade" id="findMatch" role="tabpanel" aria-labelledby="findMatch-tab">
                  <div class="find-matching">
                    <div class="no-float card p-3">
                      <p>Find & select matching transactions below</p>
                    </div>
                  </div>
                </div>
              </div>`;
          }
          content += "</div></div>";

          return content;
        },
      },
    ],
  });

  const monoovaTable = $("#monoovaTable").DataTable({
    searching: false,
    processing: true,
    info: true,
    paging: true,
    serverSide: true,
    lengthChange: true,
    ordering: false,
    language: {
      loadingRecords: "&nbsp;",
      processing: '<div class="spinner"></div>',
    },
    ajax: {
      type: "POST",
      url: "/admin/monoova-reconciles",
      data: function (d) {
        var info = $("#monoovaTable").DataTable().page.info();
        d.page = info.page;
        d.pageSize = info.length;
        d._csrf = token;
      },
      dataSrc: "result",
      dataFilter: function (data) {
        var json = $.parseJSON(data);
        json.recordsFiltered = json.total;
        json.recordsTotal = json.total;
        return JSON.stringify(json);
      },
    },
    columns: [
      {
        data: "monoova_transaction.dateTime",
        render: function (data) {
          return moment(data).format("MMMM Do YYYY, h:mm A");
        },
      },
      {
        data: null,
        render: function (data, type, row) {
          return row.monoova_transaction?.receivables_type == "CAPITAL_LOAN"
            ? "Employer deposit Capital"
            : (row.monoova_transaction?.description ? row.monoova_transaction.description : "N/A");
        },
      },
      {
        data: null,
        render: function (data, type, row) {
          let total = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(
            row.monoova_transaction?.debit ? row.monoova_transaction.debit : 0 + row.monoova_transaction?.fee_debit ? row.monoova_transaction.fee_debit : 0
          );
          let fee_debit = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(row.monoova_transaction?.fee_debit ? row.monoova_transaction?.fee_debit : 0);
          return total + "(Inc. " + fee_debit + " Fee)";
        },
      },
      {
        data: "monoova_transaction.credit",
        render: function (data) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data ? data : 0);
        },
      },
      {
        data: "monoova_transaction.balance",
        render: function (data) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(data ? data : 0);
        },
      },
      {
        data: "monoova_transaction.is_reconciled",
        render: function (data) {
          return `<span class="${data ? "text-success" : "text-danger"}">${
            data ? "Reconciled" : "UnReconciled"
          }</span>`;
        },
      },
    ],
  });

  const payCycleTable = $("#payCycleTable").DataTable({
    searching: false,
    processing: true,
    info: true,
    paging: true,
    serverSide: true,
    lengthChange: true,
    ordering: false,
    language: {
      loadingRecords: "&nbsp;",
      processing: '<div class="spinner"></div>',
    },
    ajax: {
      type: "POST",
      url: "/admin/pay-cycle-summary",
      data: function (d) {
        var info = $("#payCycleTable").DataTable().page.info();
        d.page = info.page;
        d.pageSize = info.length;
        d._csrf = token;
        d.payPeriodsId = payPeriodsId;
        d.companyId = companyId;
      },
      dataSrc: "result",
      dataFilter: function (data) {
        var json = $.parseJSON(data);
        json.recordsFiltered = json.total;
        json.recordsTotal = json.total;
        setInfoFooter(
          0,
          json.deduction,
          json.totalFeesPaid,
          json.totalWithdrawal
        );
        return JSON.stringify(json);
      },
    },
    columns: [
      {
        data: null,
        render: function (data, type, row) {
          let monoovaTransactions;
          if (row.deductions.length > 0) {
            monoovaTransactions = row.deductions[0].monoova_transactions;
          } else {
            monoovaTransactions = row.monoova_transactions;
          }
          let content = `<div class="d-flex justify-content-center">
          <div class="line item">
            <div class="d-flex justify-content-center">
              <div class="statement statement-info" style="margin-top: 2.2rem">`;
          if (monoovaTransactions?.length > 0) {
            content += `<div class="details-container details-left d-flex ${
              monoovaTransactions?.length > 0 ? "" : "hiden"
            }">
                <div class="details d-flex">
                  <span>${moment(monoovaTransactions[0].dateTime).format(
                    "DD MMM YYYY"
                  )}</span>
                  <span class="pt-1">${
                    monoovaTransactions[0].receivables_type == "CAPITAL_LOAN"
                      ? "Employer deposit Capital"
                      : monoovaTransactions[0].description
                  }</span>
                  <span class="pt-3">Transaction ID: ${
                    monoovaTransactions[0].transactionId
                  }</span>
                  <span></span>
                  <!-- <a class="more">More details</a> -->
                </div>
                <div class="amount spent sent">$${
                  monoovaTransactions[0].credit
                }&nbsp;</div>
                <div class="amount received set">
                  <span>$${monoovaTransactions[0].debit}&nbsp;</span>
                  <span class="pt-1" style="font-weight: 400;">(+ $${
                    monoovaTransactions[0].fee_debit
                  } Fee)</span>
                  <span class="pt-3 text-success">$${
                    monoovaTransactions[0].debit +
                    monoovaTransactions[0].fee_debit
                  }</span>
                </div>
              </div>
            </div>
            <div class="ok">`;
          }

          if (row.deductions.length > 0) {
            if (monoovaTransactions?.length > 0) {
              content += `
              <a id="payCycle-${
                monoovaTransactions[0]._id
              }" class="xbtn okayButton btn ${
                !monoovaTransactions[0].is_reconciled ? "" : "hiden"
              }">OK</a>
                  
              <div class="group-payCycle-${
                monoovaTransactions[0]._id +
                " " +
                (monoovaTransactions[0].is_reconciled ? "" : "hiden")
              }">
                <p class="text-success pt-5 px-2 pb-2">Reconciled</p>
                <a id="cancelPayCycle-${
                  monoovaTransactions[0]._id
                }" class="text-danger btn-cancel px-3">Cancel</a>
              </div>`;
            } else {
              content += `<p class="pt-5 px-3 pb-2">Syncing...</p>`;
            }
          }

          content += `</div>
            <div class="statement create">
          `;
          if (row.deductions.length > 0) {
            content += `<ul class="nav nav-tabs" id="statementTab" role="tablist">
                <li class="nav-item">
                  <a class="nav-link active" id="match-tab" data-toggle="tab" href="#match" role="tab" aria-controls="match" aria-selected="true">Match</a>
                </li>
                <!-- <li class="nav-item">
                  <a class="nav-link" id="findMatch-tab" data-toggle="tab" href="#findMatch" role="tab" aria-controls="findMatch" aria-selected="false">Find & Match</a>
                </li> -->
              </ul>
              <div class="tab-content" id="statementTabContent">
                <div class="tab-pane fade show active" id="match" role="tabpanel" aria-labelledby="match-tab">
                  <div class="statement statement-info">
                    <div class="details-container d-flex">
                      <div class="details d-flex">
                        <span>${moment(row.deductions[0].created_date).format(
                          "DD MMM YYYY"
                        )}</span>
                        <span class="pt-1">${row.deductions[0].name}</span>
                        <span class="pt-3">Pay period: ${
                          moment(
                            row.deductions[0].pay_periods[0]?.start_date
                          ).format("ll") +
                          " - " +
                          moment(
                            row.deductions[0].pay_periods[0]?.end_date
                          ).format("ll")
                        }</span>
                        <span></span>
                        <!-- <a class="more">More details</a> -->
                      </div>
                      <div class="amount spent sent">$0&nbsp;</div>
                      <div class="amount received set">
                        <span>$${row.deductions[0].amount}&nbsp;</span>
                        <span class="pt-1" style="font-weight: 400;">(Inc $${
                          row.deductions[0].fee_amount
                        } Fee)</span>
                        <span class="pt-3 text-success">$${
                          row.deductions[0].amount +
                          row.deductions[0].fee_amount
                        }</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="tab-pane fade" id="findMatch" role="tabpanel" aria-labelledby="findMatch-tab">
                  <div class="find-matching">
                    <div class="no-float card p-3">
                      <p>Find & select matching transactions below</p>
                    </div>
                  </div>
                </div>
              </div>`;
          }
          content += "</div></div>";
          return content;
        },
      },
    ],
  });

  //set mode monoova
  $("#jsmonoova").click(() => {
    monoovaTable.ajax.reload();
    reconcileTable.ajax.reload();
    tableTransactions.ajax.reload();
    payCycleTable.ajax.reload();
  });

  $(document).on("change", "#jsPeriodPayCycle", function () {
    if (this.value != "0") {
      payPeriodsId = this.value;
      payCycleTable.ajax.reload();
    } else {
      payPeriodsId = "";
      payCycleTable.ajax.reload();
    }
  });

  //cancel reconcile action
  $(document).on("click", ".btn-cancel", function (e) {
    const monoovaId = e.target.id.slice(e.target.id.indexOf("-") + 1);
    const actionBtn = "cancel";
    showLoading();

    $.ajax({
      method: "PUT",
      dataType: "Text",
      url: "/admin/update-reconcile",
      data: {
        monoovaId: monoovaId,
        actionBtn: actionBtn,
        _csrf: token,
      },
      async: true,
      success: function () {
        $(`.group-reconciled-${monoovaId}`).addClass("hiden");
        $(`#reconcile-${monoovaId}`).removeClass("hiden");
        $(`.group-payCycle-${monoovaId}`).addClass("hiden");
        $(`#payCycle-${monoovaId}`).removeClass("hiden");
        monoovaTable.ajax.reload();
        payCycleTable.ajax.reload();

        showToast("success", "Canceled successfully.");
        hidenLoading();
      },
      error: function () {
        showToast("error", "Can not connect to server. Please try again.");
        hidenLoading();
      },
    });
  });

  //reconcile action
  $(document).on("click", ".okayButton", function (e) {
    const monoovaId = e.target.id.slice(e.target.id.indexOf("-") + 1);
    const actionBtn = "reconcile";
    showLoading();

    $.ajax({
      dataType: "Text",
      method: "PUT",
      url: "/admin/update-reconcile",
      data: {
        monoovaId: monoovaId,
        actionBtn: actionBtn,
        _csrf: token,
      },
      async: true,
      success: function () {
        $(`.group-reconciled-${monoovaId}`).removeClass("hiden");
        $(`#reconcile-${monoovaId}`).addClass("hiden");
        $(`.group-payCycle-${monoovaId}`).addClass("hiden");
        $(`#payCycle-${monoovaId}`).removeClass("hiden");
        monoovaTable.ajax.reload();
        payCycleTable.ajax.reload();

        showToast("success", "Reconciled successfully.");
        hidenLoading();
      },
      error: function () {
        showToast("error", "Can not connect to server. Please try again.");
        hidenLoading();
      },
    });
  });

  //sync monoova transactions
  $(".btn-sync-monoova").on("click", () => {
    showLoading();
    $.ajax({
      dataType: "Text",
      method: "POST",
      url: `/admin/sync-monoova-transactions/${companyId}`,
      data: {
        _csrf: token,
      },
      async: true,
      statusCode: {
        200: function () {
          hidenLoading();
          $("#trancastionsTable").DataTable().ajax.reload();
          financialLink.ajax.reload();
          reconcileTable.ajax.reload();
          monoovaTable.ajax.reload();
          payCycleTable.ajax.reload();
        },
        500: function () {
          showToast("error", "Can not connect to server. Please try again.");
          hidenLoading();
        },
      },
    });
  });

  function setInfoFooter(
    deductionPayment,
    deduction,
    totalFeesPaid,
    totalWithdrawals = 0,
    totalFessEarned = 0
  ) {
    $(
      `#payCycleTable tfoot`
    ).html(`<tr><td style="padding-top: 0; border: none;">
      <div>
        <div><b>Deduction payment</b></div>
        <div class="row mt-2">
          <div class="col-md-3"><b>Total for Pay Cycle:</b></div>
          <div class="col-md-4">
            <div>Deduction ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(deduction)}</div>
            <div class="mt-2">Total fees paid ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalFeesPaid)}</div>
          </div>
          <div class="col-md-5">
            <div>Total withdrawals ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalWithdrawals)}</div>
            <div class="mt-2">Total fess earned ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalFessEarned)}</div>
          </div>
        </div>
      </div>
    </td></tr>`);
  }

  (function setFooterTable() {
    let divLength = $(
      `#reconcileTable_wrapper .row:first-child div:nth-child(1) #reconcileTable_length`
    ).addClass("pagination--custom");
    $(`#reconcileTable_wrapper .row:last-child div`).first().append(divLength);
    let divLength1 = $(
      `#monoovaTable_wrapper .row:first-child div:nth-child(1) #monoovaTable_length`
    ).addClass("pagination--custom");
    $(`#monoovaTable_wrapper .row:last-child div`).first().append(divLength1);
    let divLength2 = $(
      `#payCycleTable_wrapper .row:first-child div:nth-child(1) #payCycleTable_length`
    ).addClass("pagination--custom");
    $(`#payCycleTable_wrapper .row:last-child div`).first().append(divLength2);
  })();

  (function getPeriod(id) {
    let string = [];
    $.ajax({
      dataType: "json",
      method: "GET",
      url: `/get-pay-period?company_id=${id}`,
      async: false,
      success: function (data) {
        if (!data.success && data.errorCode == "LOGIN_AGAIN") {
          loginAgain();
          return;
        }
        data.result.forEach((element) => {
          if (element.xero_pay_calendar) {
            string.push(
              `<option value="${element._id}">[ ${
                element.xero_pay_calendar.Name
              } ] ${moment(element.start_date).format("DD/MM")} - ${moment(
                element.end_date
              ).format("DD/MM/YYYY")}</option>`
            );
          }
          if (element.pay_period_origination) {
            let code = "";
            if (element.company_brands.length > 0) {
              code = `[${element.company_brands[0].code}]`;
            }
            string.push(
              `<option value="${element._id}"> ${code}[ ${
                element.pay_period_origination.name
              } ] ${moment(element.start_date).format("DD/MM")} - ${moment(
                element.end_date
              ).format("DD/MM/YYYY")}</option>`
            );
          }
          if (element.keypay_pay_schedule) {
            string.push(
              `<option value="${element._id}">[ ${
                element.keypay_pay_schedule.name
              } ] ${moment(element.start_date).format("DD/MM")} - ${moment(
                element.end_date
              ).format("DD/MM/YYYY")}</option>`
            );
          }
        });
      },
      error: function () {
        showToast("error", "Can't connect to server. Try again");
      },
    });
    $("#jsPeriodPayCycle").html(
      `<option value="0">Choose Pay Period</option> ${string.join(" ")}`
    );
  })(companyId);
});
