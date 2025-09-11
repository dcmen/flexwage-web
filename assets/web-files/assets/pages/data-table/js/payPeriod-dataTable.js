$(document).ready(function() {
  const token = $('input[name="_csrf"]').val();
  const idCompany = $("input[name='_id']").val();
  const companyBrands = JSON.parse($("input[name='companyBrands']").val());
  let isEdit, payPeriodId, total, searchKey = '', staffIds = [], isEmptyArray = true;

  $.ajax({
    dataType: "json",
    type: "GET",
    url: `/get-cycles?_csrf=${token}`,
    success: function (data) {
        if (data.result) {
          let stringHtml = '<option disabled selected value="default">--Select--</option>';
          data.result.forEach( cycle => {
            stringHtml += `<option value="${cycle._id}">${cycle.name}</option>`;
          });
          $('#cyclePeriod').html(stringHtml);
        }
    },
    error: function (err) {
        console.log(err);
    },
  });

  var periodTable = $('#payPeriodsTable').DataTable({
    "paging": true,
    "ordering": false,
    "lengthChange": false,
    'pageLength': 5,
    "info": true,
    "searching": false,
    'serverSide': true,
    'processing': true,
    "language": {
      'loadingRecords': '&nbsp;',
      'processing': '<div class="spinner"></div>'
    },
    'ajax': {
      'type': 'POST',
      'url': `/get-origination-pay-period`,
      'data': function (d) {
        var info = $('#payPeriodsTable').DataTable().page.info();
        d.companyId = idCompany;
        d.page =  info.page;
        d.pageSize =  5;
        d._csrf = token;
      },
      'dataSrc': 'result',
      'dataFilter': function (data) {
        var json = $.parseJSON(data);
        if (!json.success) {
          json.result = [];
          json.totalItem = 0;
        }
        json.recordsTotal = json.totalItems;
        json.recordsFiltered = json.totalItems;

        return JSON.stringify(json);
      }
    },
    'columns': [
      { "data": null,
        "render": function ( data, type, full, meta ) {
          return meta.row + meta.settings._iDisplayStart + 1;
        }
      },
      { "data": "name" },
      { "data": "cycle.name" },
      { "data": "start_date" ,
        "render": data => {
          return data.slice(0, 10);
        }
      },
      {
        data: null,
        render: function(data, type, row) {
          return `
            <a id="btnEdit"
            style="font-size: 13px; color: #fff;" class="btn btn-mini btn-outline-primary detail-sent accordion-toggle">
            <i style="color: black" class="icofont icofont-external-link"></i>  
            <a id="btnEdit"
            style="font-size: 13px; color: #fff;" class="btn btn-mini btn-outline-warning detail-edit accordion-toggle ml-2">
            <i style="color: black" class="icofont icofont-pen-alt-2"></i>
            <a id="btnDelete"
            style="font-size: 13px; color: #fff;" class="btn btn-mini btn-outline-danger detail-delete accordion-toggle ml-2">
            <i style="color: black" class="icofont icofont-close"></i>`
        }
      }
    ]
  });
  
  let staffCheckedTable = $('#staffCheckedTable').DataTable({
    'searching': false,
    'serverSide': true,
    'processing': true,
    "lengthChange": false,
    'pageLength': 5,
    "language": {
      'loadingRecords': '&nbsp;',
      'processing': '<div class="spinner"></div>'
    },
    'ajax': {
      'type': 'POST',
      'url': '/get-registered-staff',
      'data': function (d) {
        var info = $('#staffCheckedTable').DataTable().page.info();

        d.companyBrandId = $('.list-company-brand').val();
        d.company_id = idCompany;
        d.page =  info.page;
        d.pageSize =  info.length;
        d._csrf = token;
        d.searchKey = searchKey;
        d.isSetUpPayPeriods = true;
      },
      'dataSrc': 'result',
      'dataFilter': function(data) {
        var json = $.parseJSON(data);
        var info = $('#staffCheckedTable').DataTable().page.info();
        if (info.page == 0) {
          total = json.totalItems;
          staffIds = isEmptyArray ? json.staffIds : staffIds;
          isEmptyArray = false;
        }
        json.recordsFiltered = total
        json.recordsTotal = total;
        return JSON.stringify(json);
      }
    },
    'columns': [
      { "data": null,
        "render": function ( data, type, full, meta ) {
          return meta.row + meta.settings._iDisplayStart + 1;
        }
      },
      { "data": "fullname",
        "render": function(data) {
          return data ? data : 'N/A';
        }  
      },
      { "data": "email", 
        "render": function(data) {
          return data ? data : 'N/A';
        }  
      },
      { "data": 'pay_period_originations',
        "render": function (data) {
          return data.length > 0 ? data[0].name : 'N/A';
        }
      },
      { "data": "suburb", 
        "render": function(data) {
          return data ? data : 'N/A';
        } 
      },
      { "data": "start_date", 
        "render": function(data) {
          return data ? moment(data).format( 'DD-MM-YYYY') : 'N/A';
        } 
      },
      { "data": "is_active", 
        "render": function(data) {
          return data == 0 ? "Suspend" : data == 1 ? "Active" : data == 2 ? "Uninvite" : data == 3 ? "Terminated" : "";
        } 
      },
      {
        "data": null,
        "render": function(data, type, row) {
          let checkId = staffIds.filter(item => item == row._id);
          return `<div class="form-login-checkbox-cus">
                    <input ${checkId.length == 0 ? '' : 'checked'} 
                      class="form-login-checkbox_box checkbox-list-staffId--checked" type="checkbox" 
                      value='${row._id}'/>
                  </div>`
        }
      }
    ]
  });
  //add button 'Add New' table custom payroll
  $("#payPeriodsTable_wrapper .row:first-of-type div:nth-of-type(2)")
    .append(`<button type="button" class="btn btn-addNew btn-info float-right">Add New</button>`);
  //add filter company brand name
  $("#staffCheckedTable_wrapper .row:first-of-type div:nth-of-type(2)")
    .append(`<div class="row">
              <div class="col-md-6">
                <select class="form-control list-company-brand">
                  <option selected value=''>All locations</option>
                </select>
              </div>
              <div class="col-md-6 pl-0">
                <form id="jsQ">
                  <div
                      class="input-group mb-0">
                      <input name="staff-name"
                          type="search"
                          class="form-control"
                          placeholder="Search this name">
                      <div
                          class="input-group-append">
                          <button
                              class="btn btn-secondary"
                              type="submit">
                              <i
                                  class="icofont icofont-ui-search"></i>
                          </button>
                      </div>
                  </div>
                </form>
              </div>
            </div`);

  companyBrands.forEach(item => {
    $('.list-company-brand').append(`<option value="${item._id}">${item.brand_name}</option>`);
  });

  $('.list-company-brand').on('change', function() {
    staffCheckedTable.ajax.reload();
  });

  $("#jsQ").on("submit", (event) => {
    event.preventDefault();
    searchKey = $('input[name="staff-name"]').val();
    isEmptyArray = true;
    staffCheckedTable.ajax.reload();
  });

  $("#jsQ input[name='staff-name']").on("change", (event) => {
    if ($('input[name="staff-name"]').val() == '') {
      searchKey = '';
      staffCheckedTable.ajax.reload();
    }
  });

  //show popup add new pay period
  $('.btn-addNew').click(function() {
    $('#startDatePeriod').prop('disabled', false);
    $('#cyclePeriod').prop('disabled', false);
    $('#jsModalAddNewPayPeriod').modal({
      backdrop: false,
      show: true
    });
    //reset form
    $('#namePeriod').val('');
    $('#startDatePeriod').val('');
    $('#cyclePeriod').val('default');
    isEdit = false;
  });
  //validate
  $('#namePeriod').on('change', function() {
    if ($('#namePeriod').val()) {
      $('#namePeriod').css('border-color', '#ccc');
    }
  });
  $('#startDatePeriod').on('change', function() {
    if ($('#startDatePeriod').val()) {
      $('#startDatePeriod').css('border-color', '#ccc');
    }
  });
  $('#cyclePeriod').on('change', function() {
    if ($('#cyclePeriod').val()) {
      $('#cyclePeriod').css('border-color', '#ccc');
    }
  });

  //add pay period
  $('#submitPayPeriod').click(function() {
    let url, message;
    //validate
    if (!$('#namePeriod').val()) {
      $('#namePeriod').css('border-color', 'red');
      return;
    }
    if (!$('#startDatePeriod').val()) {
      $('#startDatePeriod').css('border-color', 'red');
      return;
    }
    if (!$('#cyclePeriod').val()) {
      $('#cyclePeriod').css('border-color', 'red');
      return;
    }
    showLoading();
    const dataPayPeriod = {
      company_id: idCompany,
      name: $('#namePeriod').val(),
      start_date: $('#startDatePeriod').val(),
      cycle_id: $('#cyclePeriod').val(),
    }
    //check edit or add new
    if (isEdit) {
      url = '/update-origination-pay-period';
      message = 'Updated Pay Period successfully.';
      dataPayPeriod.id = payPeriodId;
    } else {
      url = '/add-origination-pay-period';
      message = 'Add New Pay Period successfully.';
    }
    //post data
    $.ajax({
      method: 'POST',
      dataType: 'json',
      url: url,
      data: {
        dataPayPeriod: JSON.stringify(dataPayPeriod),
        "_csrf": token
      },
      success: function(data) {
        if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
          loginAgain();
          return;
        }
        if (data.success) {
          showToast('success', message);
          $('#jsModalAddNewPayPeriod').modal('hide');
          periodTable.ajax.reload();
        } else {
          showToast('error', "Cannot delete this pay cycle because it's being used by employees.");
        }
        hidenLoading();
      }, error: function() {
        showToast('error', "Can't connect to server. Try Again!");
        hidenLoading();
      }
    });
  });

  $(document).on('click', '#staffCheckedTable .checkbox-list-staffId--checked', function () {
    if ($(this).is(":checked")) {
      staffIds.push($(this).val());
    } else {
      staffIds = staffIds.filter(item => item !== $(this).val())
    }
  });

  //sent pay period
  $('.btn-save-sent-payperiod').click(function() {
    showLoading();
    let data = {
      staffIdArr: staffIds,
      payPeriodId: payPeriodId
    };
    
    $.ajax({
      method: 'POST',
      dataType: 'json',
      url: '/sent-pay-period',
      data: {
        "_csrf": token,
        data: JSON.stringify(data)
      },
      success: function(data) {
        if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
          loginAgain();
          return;
        }
        hidenLoading();
        showToast('success', 'Saved successfully.');
        $('#staffTable').DataTable().ajax.reload();
        $('#jsModalSentPayPeriod').modal('hide');
        staffCheckedTable.ajax.reload();
      }, error: function() {
        hidenLoading();
        showToast('error', "Can't connect to server. Try again!");
      }
    })
  }); 
  //delete pay period
  $('#submit-delete').click(function() {
    showLoading();
    const data = {
      id: payPeriodId,
      company_id: idCompany
    }
    $.ajax({
      method: 'POST',
      dataType: 'json',
      url: '/delete-origination-pay-period',
      data: {
        "_csrf": token,
        data: JSON.stringify(data)
      },
      success: function(data) {
        if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
          loginAgain();
          return;
        }
        hidenLoading();
        if (data.success) {
          showToast('success', 'Deleted successfully.');
          $('#staffTable').DataTable().ajax.reload();
          periodTable.ajax.reload();
        } else {
          showToast('error', data.message);
        }
        $('#jsModalCheckDeletePayPeriod').modal('hide');
      }, error: function() {
        hidenLoading();
        showToast('error', "Can't connect to server. Try again!");
      }
    })
  })

  //edit pay period detail
  $('#payPeriodsTable').on('click', 'a.detail-edit', function () {
    var tr = $(this).closest('tr');
    var row = periodTable.row( tr );
    let data = row.data();
    isEdit = true;
    //add data to form
    $('#namePeriod').val(data.name);
    $('#startDatePeriod').val(data.start_date.slice(0, 10));
    $('#cyclePeriod').val(data.cycle._id);
    $('#startDatePeriod').prop('disabled', true);
    $('#cyclePeriod').prop('disabled', true);
    //show modal
    $('#jsModalAddNewPayPeriod').modal({
      backdrop: false,
      show: true
    });
    payPeriodId = data._id;
  });
  //delete pay period detail
  $('#payPeriodsTable').on('click', 'a.detail-delete', function () {
    var tr = $(this).closest('tr');
    var row = periodTable.row( tr );
    let data = row.data();
    //show modal
    $('#jsModalCheckDeletePayPeriod').modal({
      backdrop: false,
      show: true
    });
    payPeriodId = data._id;
  });
  //sent pay period detail
  $('#payPeriodsTable').on('click', 'a.detail-sent', function () {
    var tr = $(this).closest('tr');
    var row = periodTable.row( tr );
    let data = row.data();
    //show modal
    $('#jsModalSentPayPeriod').modal({
      backdrop: false,
      show: true
    });
    $('h5.title-payPeriod').html(data.name);
    payPeriodId = data._id;
    isEmptyArray = true
    staffCheckedTable.ajax.reload();
  });
});