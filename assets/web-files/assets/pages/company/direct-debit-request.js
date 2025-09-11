$(document).ready(function () {
  const token = $('input[name="_csrf"]').val();
  const companyId = $("input[name='_id']").val();
  const socket = io();
  const role = $('input[name="role"]').val();
  const key = $('input[name="key"]').val();
  let bsbValue = $('input[name="bsb"]').val();
  let accountNumberValue = $('input[name="accountNumber"]').val();
  const company = JSON.parse($('input[name="company"]').val());

      //get Active Employees
      $.ajax({
        dataType: "json",
        type: "POST",
        url: `/admin/get-totals`,
        data: {
            _csrf: token,
            companyId: companyId
        },
        success: function (data) {
            $('#jsActiveEmployees').val(new Intl.NumberFormat(
                ).format(
                    data.totalActiveEmployees
                ));
            $('#jsTotalDrawnPeriod').val(
                new Intl.NumberFormat(
                    'en-US',
                    { style: 'currency', currency: 'USD' }
                ).format(
                    data.totalDrawnPeriod
                )
            );
            $('input[name="balance_available"]').val(new Intl.NumberFormat(
                'en-US', {
                    style: 'currency',
                    currency: 'USD'
                }
            ).format(
                (company.limit_money - data.totalDrawnPeriod)
            ));
            $('.jsLoaderInput').hide();
        },
        error: function (err) {
            console.log(err);
        },
    });

  let bsb = bsbValue != "" ? decryptString(bsbValue) : '';
  let number = accountNumberValue != "" ? decryptString(accountNumberValue) : '';

  $('input[name="bsb"]').val(bsb);
  $('input[name="accountNumber"]').val(number);

  // socket listen event 
  socket.on(companyId, (data) => {
      switch (data.action) {
          case "ADD":
              socketFormDD(data, role);
              break;
          case "EDIT":
              socketFormDD(data, role);
              break;
          case "APPROVE":
              approveFormDD(data, role);
              break;
          case "CANCEL":
              socketCancelFormDD(data, role);
              break;
          default:
              break;
      }
      tableDDHistory.ajax.reload();
  });

  function socketFormDD(data, role) {
      $('.txtApplication').parent().removeClass('hide');
      $('.txtApplication').text(moment(data.result.created_date).format('DD/MM/YYYY HH:mm A'));
      $('input[name="companyName"]').val(data.result.company_name);
      $('input[name="nameOnAccount"]').val(data.result.bank_account_name);
      $('input[name="bsb"]').val(decryptString(data.result.bsb));
      $('input[name="accountNumber"]').val(decryptString(data.result.account_number));
      $('input[name="companyName"]').prop("checked", data.result.authorized);
      $('select[name="chooseSenderBank"]').val(data.result.bank_id ? data.result.bank_id : '0');
      if (role == "Admin") {
          $('#actionForm').html(`<div class="col-md-12">
              <button type="submit" id="adminCancelDDForm" class="btn btn-danger btn-block">Cancel</button>
          </div>`);
          if ($("#actionFormDD #approveFormDD").length <= 0) {
              $("#actionFormDD").html(`<buttons type="button" id="approveFormDD" class="btn btn-success btn-block">Approve</buttons>`);
          }
      } else {
          $('#actionForm').html(`<div class="col-md-12">
              <button type="submit" id="cancelDDForm" class="btn btn-danger btn-block">Cancel</button>
          </div>`); 
      }
      $('#txtStatus').html(`<button class="btn btn-sm ${data.result.status == 'APPROVED' ? 'text-color-green' : data.result.status == 'CANCELLED' ? 'text-color-red' : 'text-color-yellow'}">
          ${data.result.status == 'APPROVED' ? 'Approved' : data.result.status == 'CANCELLED' ? 'Cancelled' : 'Pending'}
      </button>`);
  }

  function approveFormDD(data, role) {
      if (role !== "Admin") {
          if ($('#actionFormDD #updateFormDD').length <= 0) {
              $('#actionFormDD').html(`<buttons type="submit" id="updateFormDD" class="btn btn-primary btn-block">Edit&ReApply</buttons>`)
          }
      } else {
          $('#actionFormDD').html("");
          $('#actionForm').html(`<div class="col-md-12">
            <button type="submit" id="adminCancelDDForm" class="btn btn-danger btn-block">Cancel</button>
          </div>`);
      }
      $('#txtStatus').html(`<button class="btn btn-sm text-color-green">Approved</button>`);
  }

  function socketCancelFormDD(data, role) {
      if (role == "Admin") {
          if (data.result.is_cashD_cancel) {
              $('#actionFormDD').html(`<buttons type="button" id="approveFormDD" class="btn btn-success btn-block">Approve</buttons>`);
              $('#actionForm').html("");
          } else {
              if ($('#actionFormDD #approveFormDD').length <= 0) {
                  $('#actionFormDD').html(`<buttons type="button" id="approveFormDD" class="btn btn-success btn-block">Approve</buttons>`);
              }
              if ($('#actionForm #adminCancelDDForm').length > 0) {
                  $('#actionForm').html("");
              }
          }
      } else {
          if (data.result.is_cashD_cancel) {
            if ($('#actionFormDD #updateFormDD').length <= 0) {
                $('#actionFormDD').html(`<buttons type="submit" id="updateFormDD" class="btn btn-primary btn-block">Edit&ReApply</buttons>`)
            }
          } else {
            $('#actionFormDD').html(`<buttons type="submit" id="updateFormDD" class="btn btn-primary btn-block">Edit&ReApply</buttons>`);
          }
          if ($('#actionForm #cancelDDForm').length > 0) {
            $('#actionForm').html("");
          }
      }
      $('#txtStatus').html(`<button class="btn btn-sm text-color-red">Cancelled</button>`);
  }

  // Table Direct Debit Request History
  let tableDDHistory =  $("#historyDD").DataTable({
      "paging": true,
      "ordering": false,
      "lengthChange": false,
      'pageLength': 7,
      "info": false,
      "searching": false,
      'serverSide': true,
      'processing': true,
      "language": {
          'loadingRecords': '&nbsp;',
          'processing': '<div class="spinner"></div>'
      },
      'ajax': {
          'type': 'POST',
          'url': `/admin/get-dd-histories/${companyId}`,
          'data': function (d) {
              var info = $('#historyDD').DataTable().page.info();
              d.page = info.page;
              d.pageSize = info.length;
              d._csrf = token;
          },
          'dataSrc': 'result',
          'dataFilter': function (data) {
              var json = $.parseJSON(data);
              var info = $("#historyDD").DataTable().page.info();
              if (!json.success) {
                  json.result = [];
                  json.totalItems = 0;
              }
              if (info.page == 0) {
                  total = json.totalItems;
              }
              json.recordsFiltered = total;
              json.recordsTotal = total;
              return JSON.stringify(json);
          }
      },
      'columns': [
          {
              "data": null,
              "render": function (data, type, full, meta) {
                  return meta.row + meta.settings._iDisplayStart + 1;
              }
          },
          {
              "data": "created_date",
              "render": function (data) {
                  return moment(data).format('DD/MM/YYYY HH:mm A');
              }
          },
          {
              "data": "status",
              "render": function (data) {
                  return `<span style="text-transform: capitalize; color: ${ data == "PENDING" ? '#FFD700' : data == "CANCELLED" ? "#ff0000" : "#26e000" }">${data.toLowerCase()}</span>`;
              }
          }
      ]
  });

  // Submit Form Direct Debit Request
  $(document).on("click", "#submitFormDD, #updateFormDD, #submit-direct-debit", function() {
    showLoading();
      let action = $(this).attr('id');
      let objectValue = {};
      let parent = $(this).parent().parent();
      parent.find("input[type='text']").each(function(){
          var input = $(this);
          var name = input.attr("name");
          var value = input.val();
          if (value != "") {
              if (name === "bsb" || name === "accountNumber") {
                objectValue[name] = encryptString(value);
              } else {
                objectValue[name] = value;
              }
          } else if (name !== 'bankName') {
              showToast('error', "Please fill out the form completely.");
              hideLoading();
              return;
          }                   
      });
      if (action === "submit-direct-debit") {
        if (parent.find('input[name="authorized"]')[0].checked) {
            objectValue.authorized = true;
        } else {
            showToast('error', "Please fill out the form completely.");
            hideLoading();
        }
      } else {
        objectValue.authorized = parent.find('input[name="authorized"]')[0]?.checked ? true : false;
      }
      objectValue.bankId = parent.find('select[name="chooseSenderBank"]').val();
      Object.size = function(obj) {
          var size = 0,
              key;
              for (key in obj) {
              if (obj.hasOwnProperty(key)) size++;
              }
              return size;
          };
          var size = Object.size(objectValue);
          console.log(objectValue);
          if (size === 7) {
              $.ajax({
              dataType: "json",
              method: "POST",
              url: `/admin/add-direct-debit?_csrf=${token}`,
              data: {
                  ...objectValue,
                  companyId: companyId,//idCompany
                  timeOffset: Math.abs(new Date().getTimezoneOffset()) * 60 * 1000,
                  action: action === 'submitFormDD' ? 'ADD' : action == 'submit-direct-debit' && !$('#directDebitAuthority').prop('checked') ? "ADD" : 'EDIT'
              },
              success: function (responsive) {
                  if (responsive.success) {
                    if (action == 'submit-direct-debit') {
                        $('#directDebitAuthority').prop('checked', true);
                        $('#directDebitAuthorityModal').modal('hide');
                      } else {
                        showToast("success", "Submitted Direct Debit Request successfully");
                      }
                  } else {
                      if (responsive.errorCode === "DIRECT_DEBIT_FORM_NOT_APPROVED") {
                        showToast("error", "Direct Debit Form has not been approved by CashD admin.");
                      } else {
                        showToast("error", responsive.message);
                      }
                  }
                  hideLoading();
              },
              error: function () {
                  hideLoading();
                  showToast("error", "Can not connect to server. Please try again.");
                  return false;
              },
              });
          } else {
            hideLoading();
          }
  });

  // Show modal Direct Debit Request
  $("#checkboxFormDD").click(function() {
      $('#formDDMonoova').modal({
          show: true,
          keyboard: false,
          backdrop: false
      });
  });

  // Hide modal Direct Debit Request
  $("#onDirectDebitRequest").on('click', function() {
      $('input[name="authorized"]').prop('checked', true);
      $('#formDDMonoova').modal('hide');
      $('.jsErrNote').addClass('hide');
  });

  // Employer cancel form DD
  $(document).on('click', "#cancelDDForm", function() {
      commonApi("CANCEL", companyId, 'Canceled');
  });

  // Approve form DD
  $(document).on('click', '#approveFormDD', function() {
      commonApi("APPROVE", companyId, 'Approved');
  });

  //Admin cancel form DD
  $(document).on('click', '#adminCancelDDForm', function () {
      commonApi("ADMIN_CANCEL", companyId, 'Canceled');
  });

  // Function Action DD
  function commonApi(action, companyId, text) {
      showLoading();
      $.ajax({
              dataType: "json",
              method: "POST",
              url: `/admin/action-direct-debit-request/${companyId}`,
              data: {
                  action,
                  _csrf: token
              },
              success: function (responsive) {
                  if (responsive.success) {
                      showToast("success", `${text} Direct Debit Request successfully`);
                  } else {
                      showToast("error", responsive.message);
                  }
                  hideLoading();
              },
              error: function () {
                  hideLoading();
                  showToast("error", "Can not connect to server. Please try again.");
                  return false;
              },
      });
  }

  function showToast(name, mess, nameErrId = '#jsErr') {
    $(nameErrId).addClass(`show ${name}`);
    $(`${nameErrId} p`).html(mess);
    setTimeout(() => {
        $(nameErrId).removeClass(`show ${name}`);
    }, 2500);
  }

  function showLoading() {
      $('#jsLoader').addClass('show');
  }

  function hideLoading() {
      setTimeout(function () {
          $('#jsLoader').removeClass('show');
      }, 500);
  }

  function decryptString(text) {
    var bytes = CryptoJS.AES.decrypt(text, key);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
    }

    function encryptString(text) {
        return CryptoJS.AES.encrypt(text, key).toString();
    }

});