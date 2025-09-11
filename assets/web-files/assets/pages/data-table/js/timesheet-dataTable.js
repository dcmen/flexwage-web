$(document).ready(function() {
  const token = $('input[name="_csrf"]').val();
  // const staffId = JSON.parse(localStorage.getItem('staff'))?._id;
  const idCompany = $("input[name='_id']").val(); 
  var startDate = moment().startOf('month');
  var endDate = moment().add(3, 'month');
  let statusList = ['PENDING', 'APPROVED', 'ACCEPTED', 'REJECTED', 'PENDING', 'SUBMITTED'];
  let arrTimesheets = [], arrTimesheetRequestIds = [];
  const systemCode = $("input[name='systemCode']").val();
  const systemCompanyId = $("input[name='systemCompanyId']").val(); 
  let timesheetKEYPAY, timesheetRequestKEYPAY, timesheetDEPUTY, timesheetRequestDEPUTY, timesheetRECKON, timesheetRequestRECKON;
  var role = $('input[name="role"]').val();
  const isEmployer = $('input[name="isEmployer"]').val();
  const payrollSystem = $('input[name="payrollSystem"]').val();
  const payrollSystemToken = JSON.parse(payrollSystem);
  let endpoint, accessToken;

  // $('#jsTimesheetRequest').click( async function () {
  //   var result = await getAccessTokenBySystemCode(systemCode);
  // });

  if (payrollSystemToken?.accessToken != null) {
    switch(systemCode) {
      case 'XERO':
        accessToken = payrollSystemToken.accessToken.replace("Bearer ", ""); 
        break;
      case 'DEPUTY':
        if (payrollSystemToken.endPointUrl != null) {
          accessToken = payrollSystemToken?.accessToken.replace("OAuth ", "");
          endpoint = payrollSystemToken.endPointUrl;
        }
        break;
      case 'KEYPAY':
        accessToken = payrollSystemToken.accessToken.replace("Bearer ", "");
        break;
      case 'RECKON':
        accessToken = payrollSystemToken.accessToken.replace("Bearer ", "");
        break;
      default: 
        break;
    }
  }

  const columns = [
    { "data": null,
      "render": function ( data, type, full, meta ) {
        return meta.row + meta.settings._iDisplayStart + 1;
      },
      "width": "100px"
    },
    { "data": "fullName" },
    { "data": "date" },
    { "data": "workingHours" },
    { "data": "payRate" },
    { "data": "statusTimesheet",
      "render": function(data, type, row) {
        var isAutoApprove = $('input[name="isSystemApproveProcess"]:checked').val();
        if (systemCode == "RECKON" && isAutoApprove === 'false') {
          return `<span id="status_${row.id}_${row.positonInTimesheetline || 0}"
          style="font-weight: 600; color: #5cb85c"> APPROVED
          </span>`;
        } else {
          return `<span id="status_${row.id}_${row.positonInTimesheetline || 0}"
          style="font-weight: 600; color: ${data == 'APPROVED' ? '#5cb85c' : data == 'SUBMITTED' ? 'rgb(8 59 163)' : '#f0ad4e'}">${data}
          </span>`
        }
      }
    }
  ];

  var timesheetTable = $('#timesheetTable').DataTable({
    "paging": true,
    "lengthChange": false,
    "info": true,
    "searching": false,
    "pageLength": 10,
    'processing': true,
    "language": {
      'loadingRecords': '&nbsp;',
      'processing': '<div class="spinner"></div>'
    },
    'ajax': {
      'type': 'POST',
      'url': `/system-get-timesheets`,
      'data': function (d) {
        d.companyId = idCompany;
        d.systemCode = systemCode;
        d._csrf = token;
        d.time_offset = Math.abs(new Date().getTimezoneOffset()) * 60 * 1000;
      },
      'dataSrc': 'result',
      'dataFilter': function (data) {
        let timesheetFormat;
        var json = $.parseJSON(data);
        //check success false
        if (!json.success) timesheetFormat = [];
        arrTimesheets = [];
        switch(systemCode) {
          case 'XERO': 
            timesheetFormat = formatTimesheetDataXERO(json.result.timesheets);
            break;
          case 'DEPUTY':
            timesheetFormat = formatTimesheetDataDEPUTY(json.result.timesheets);
            break;
          case 'KEYPAY':
            timesheetFormat = formatTimesheetDataKEYPAY(json.result.timesheets);
            break;
          case 'RECKON':
            timesheetFormat = formatTimesheetDataRECKON(json.result.timesheets);
            break;
          case 'ASTUTE':
            timesheetFormat = formatTimesheetDataASTUTE(json.result.timesheets);
            break;
          default: break;
        }
        //view button approve all
        viewBtnAll('#jsApproveAll', arrTimesheets.length);
        //render data
        json.result = timesheetFormat;
        json.recordsTotal = timesheetFormat.length;
        json.recordsFiltered = timesheetFormat.length;
        return JSON.stringify(json);
      }
    },
    'columns': systemCode == 'ASTUTE' ? [...columns] : [...columns, {
      "data": "statusTimesheet",
      "render": function(data, type, row) {
        var isConnected = $('.btn-reconnect-system').hasClass('btn-outline-danger');
        var isAutoApprove = $('input[name="isSystemApproveProcess"]:checked').val();
        if (systemCode == "RECKON" && isAutoApprove === 'false') {
          return `<a id="btnApprove_${row.id}_${row.positonInTimesheetline || 0}"
            style="font-size: 13px; color: #fff; position: relative" class="btn btn-mini btn-success detail-approve accordion-toggle disabled">
            Approve
            <i class="icofont icofont-ui-block"></i>
          </a>`
        } else {
          return `<a id="btnApprove_${row.id}_${row.positonInTimesheetline || 0}"
            style="font-size: 13px; color: #fff; position: relative" class="btn btn-mini btn-success detail-approve accordion-toggle ${data == 'PENDING' && isEmployer == 'true' && !isConnected  ? '' : 'disabled'}">
            Approve
            <i class="icofont icofont-ui-block ${isEmployer != 'true' || isConnected ? '' : 'hiden'}"></i>
          </a>`
        }
      }
    }]
  });

  var requestTable = $('#requestTable').DataTable({
    "paging": true,
    "ordering": false,
    "lengthChange": false,
    "info": true,
    "searching": false,
    "pageLength": 10,
    'processing': true,
    "language": {
      'loadingRecords': '&nbsp;',
      'processing': '<div class="spinner"></div>'
    },
    'ajax': {
      'type': 'POST',
      'url': `/system-get-timesheets`,
      'data': function (d) {
        d.companyId = idCompany;
        d.systemCode = systemCode;
        d._csrf = token;
        d.time_offset = Math.abs(new Date().getTimezoneOffset()) * 60 * 1000;
      },
      'dataSrc': 'result',
      'dataFilter': function (data) {
        let timesheetRequestFormat;
        var json = $.parseJSON(data);
        //check success false
        if (!json.success) timesheetRequestFormat = [];
        arrTimesheetRequestIds = [];
        switch(systemCode) {
          case 'XERO': 
            timesheetRequestFormat = formatTimesheetRequestDataXERO(json.result.request_timesheets);
            break;
          case 'DEPUTY':
            timesheetRequestFormat = formatTimesheetRequestDataDEPUTY(json.result.request_timesheets);
            break;
          case 'KEYPAY':
            timesheetRequestFormat = formatTimesheetRequestDataKEYPAY(json.result.request_timesheets);
            break;
          case 'RECKON':
            timesheetRequestFormat = formatTimesheetRequestDataRECKON(json.result.request_timesheets);
            break;
          default: 
            timesheetRequestFormat = [];
            break;
        }
        //view button accept all
        viewBtnAll('#jsAcceptAll', arrTimesheetRequestIds.length);
        //render data
        json.result = timesheetRequestFormat;
        json.recordsTotal = timesheetRequestFormat.length;
        json.recordsFiltered = timesheetRequestFormat.length;

        return JSON.stringify(json);
      }
    },
    'columns': [
      { "data": null,
        "render": function ( data, type, row, meta ) {
          return meta.row + meta.settings._iDisplayStart + 1;
        }
      },
      { "data": "fullName" },
      { "data": "date" },
      { "data": "workingHours" },
      { "data": "payRate" },
      { "data": "statusRequest",
        "render": function(data, type, row) {
          return `<span id="status_${row.id}"
              style="font-weight: 600; color: ${data == 'ACCEPTED' ? '#5cb85c' : (data == 'REJECTED' ? '#d9534f' : '#f0ad4e')}">${data}
              </span>`
        }
      },
      {
        "data": "statusRequest",
        "render": function(data, type, row) {
          return `<a id="btnAccept_${row.id}"
              style="font-size: 13px; color: #fff;" class="btn btn-mini btn-success detail-accept accordion-toggle ${data == 'PENDING' && isEmployer == 'true' ? '' : 'disabled' }">
              Accept
              <i class="icofont icofont-ui-block ${isEmployer != 'true' ? '' : 'hiden'}"></i>
              </a>
              <a id="btnReject_${row.id}"
              style="font-size: 13px; color: #fff;" class="btn btn-mini btn-danger detail-reject accordion-toggle ml-2 ${data == 'PENDING'&& isEmployer == 'true' ? '' : 'disabled' }">
              Reject
              <i class="icofont icofont-ui-block ${isEmployer != 'true' ? '' : 'hiden'}"></i>
            </a>`
        }
      }
    ],
    
  });
  /* ------------------ Start config dateranger ------------------- */

  //add dateranger timesheet
  $("#timesheetTable_wrapper .row:first-of-type div:nth-of-type(2)")
    .append(`
      <div>
        <div id="ts_dateranger"  class="pull-left">
          <i class="icofont icofont-calendar"></i>&nbsp;
          <span></span> <div class="float-right"><b class="icofont icofont-caret-down"></b></div>
        </div>
        <a hidden class="btn btn-mini btn-outline-danger btn-refresh-ts ml-2 pt-2" style="height: 100%;">
          <i class="icofont icofont-close"></i>
        </a>
      </div>
      <button hidden id="jsApproveAll" class="btn btn-success btn-timesheetRequest--custom">
        Approve all
        <i class="icofont icofont-ui-block"></i>
      </button>`)
    .addClass('d-flex justify-content-between  mb-2');

  //add dateranger request
  $("#requestTable_wrapper .row:first-of-type div:nth-of-type(2)")
    .append(`
      <div>
        <div id="rq_dateranger"  class="pull-left">
        <i class="icofont icofont-calendar"></i>&nbsp;
        <span></span> <div class="float-right"><b class="icofont icofont-caret-down"></b></div>
        </div>
        <a hidden class="btn btn-mini btn-outline-danger btn-refresh-tsrq ml-2 pt-2" style="height: 100%;">
          <i class="icofont icofont-close"></i>
        </a>
      </div>
      <button hidden id="jsAcceptAll" class="btn btn-success btn-timesheetRequest--custom">
        Accept all
        <i class="icofont icofont-ui-block"></i>
      </button>`)
    .addClass('d-flex justify-content-between mb-2');
  
  //timesheet dateranger
  function tsDateRanger() {
    //set all timesheet
    $('#ts_dateranger span').html('All Timesheets');
    //create daterangerpicker
    $('#ts_dateranger').daterangepicker({
      startDate: startDate,
      endDate: endDate,
      locale: { direction: 'timesheet-daterangepicker' }
    }, function(start, end) {
      //check start date choose and start date parent
      if (start.format('L') != moment().startOf('month').format('L') || end.format('L') != moment().add(3, 'month').format('L')) {
        $('#ts_dateranger span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
      }
      startDate = start;
      endDate = end;
    });
    //check filter date ranger timesheet
    $('#ts_dateranger').on('apply.daterangepicker', function() {
      $('#jsApproveAll').attr('hidden', false);
      $('.btn-refresh-ts').attr('hidden', false);
      timesheetTable.ajax.reload();
    });
  }
  //timesheet-request dateranger
  function tsrqDateRanger() {
    //set all timesheet-request
    $('#rq_dateranger span').html('All Requests');
    //create daterangerpicker
    $('#rq_dateranger').daterangepicker({
      startDate: startDate,
      endDate: endDate,
      locale: { direction: 'request-daterangepicker' }
    }, function(start, end) {
      //check start date choose and start date parent
      if (start.format('L') != moment().startOf('month').format('L') || end.format('L') != moment().add(3, 'month').format('L')) {
        $('#rq_dateranger span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
      }
      startDate = start;
      endDate = end;
    });
    //check filter date ranger timesheet request
    $('#rq_dateranger').on('apply.daterangepicker', function() {
      $('#jsAcceptAll').attr('hidden', false);
      $('.btn-refresh-tsrq').attr('hidden', false);
      requestTable.ajax.reload();
    });
  }
  tsDateRanger();
  tsrqDateRanger();
  //refresh all timesheet
  $('.btn-refresh-ts').click(function() {
    $('#jsApproveAll').attr('hidden', true);
    $('.btn-refresh-ts').attr('hidden', true);
    startDate = moment().startOf('month');
    endDate = moment().add(3, 'month');
    tsDateRanger();
    timesheetTable.ajax.reload();
  })
  //refresh all timesheetRequest
  $('.btn-refresh-tsrq').click(function() {
    $('#jsAcceptAll').attr('hidden', true);
    $('.btn-refresh-tsrq').attr('hidden', true);
    startDate = moment().startOf('month');
    endDate = moment().add(3, 'month');
    tsrqDateRanger();
    requestTable.ajax.reload();
  })

  /* ------------------ End config dateranger ------------------- */

  //approve all timesheet
  $('#jsApproveAll').click(function() {
    if (!$('#jsApproveAll').hasClass('disabled')) {
      showLoading();
      if (systemCode == 'KEYPAY') {
        for (let item of timesheetKEYPAY) {
          approveTimesheetKEYPAY(item);
        }
      } else if (systemCode == 'DEPUTY') {
        indexLoopDEPUTY = 0;
        arrTimesheets = [];
        for (let timesheet of timesheetDEPUTY) {
          approveTimesheetToCashDSystem(timesheet, true);
        }
      } else {
        postApproveTimesheet(arrTimesheets);
      }
    }
  })
  //approve detail timesheet
  $('#timesheetTable tbody').on('click', 'a.detail-approve', async function() {
    showLoading();
    var tr = $(this).closest('tr');
    var row = timesheetTable.row( tr );
    const timesheet = row.data();
    arrTimesheets = [];
    switch(systemCode) {
      case 'XERO':
        arrTimesheets.push({
          "id" : timesheet.id,
          "arr_position_in_timesheetline" : [timesheet.positonInTimesheetline]
        });
        postApproveTimesheet(arrTimesheets);
        break;
      case 'DEPUTY':
        approveTimesheetToCashDSystem(timesheet, false);
        break;
      case 'KEYPAY':
        arrTimesheets.push(timesheet.id);
        approveTimesheetKEYPAY(timesheet, 1);
        break;
      case 'RECKON':
        arrTimesheets.push(timesheet.id);
        postApproveTimesheet(arrTimesheets);
        break;
      default: break;
    }
  });
  //accept all timesheet request
  $('#jsAcceptAll').click(function() {
    if (!$('#jsAcceptAll').hasClass('disabled')) {
      showLoading();
      if (systemCode == 'KEYPAY') {
        for (let item of timesheetRequestKEYPAY) {
          approveTimesheetKEYPAY(item, timesheetRequestKEYPAY.length, '');
        }
        postAcceptTimesheetRequest(arrTimesheetRequestIds);
      } else if (systemCode == 'DEPUTY') {
        indexLoopDEPUTY = 0;
        arrTimesheets = [];
        for (let item of timesheetRequestDEPUTY) {
          approveTimesheetToCashDSystem(item, true, 'accept');
        }
      } else {
        postAcceptTimesheetRequest(arrTimesheetRequestIds);
      } 
    }
  })
  //accept detail timesheet request
  $('#requestTable tbody').on('click', 'a.detail-accept', function() {
    showLoading();
    var tr = $(this).closest('tr');
    var row = requestTable.row( tr );
    const timesheet = row.data();
    arrTimesheetRequestIds = [];
    if (systemCode == 'KEYPAY') {
      arrTimesheetRequestIds.push(timesheet.id);
      approveTimesheetKEYPAY(timesheet, 1, 'accept');
      postAcceptTimesheetRequest(arrTimesheetRequestIds);
    } else if (systemCode == 'DEPUTY') {
      approveTimesheetToCashDSystem(timesheet, false, 'accept');
    } else {
      arrTimesheetRequestIds.push(timesheet.id);
      postAcceptTimesheetRequest(arrTimesheetRequestIds);
    }
  });
  //reject detail timesheet request
  $('#requestTable tbody').on('click', 'a.detail-reject', async function() {
    showLoading();
    var tr = $(this).closest('tr');
    var row = requestTable.row( tr );
    const timesheetRequestId = row.data().id;
    postRejectTimesheetRequest(timesheetRequestId);
  });
  //post approve data timesheet
  function postApproveTimesheet(dataTimesheet, text = 'approve') {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/system-approve-timesheet`,
      data: {
        systemCode: systemCode,
        dataTimesheet: JSON.stringify(dataTimesheet),
        "_csrf": token
      },
      async: true,
      success: function(data) {
        if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
          loginAgain();
          return;
        }
        // if (systemCode == 'XERO') {
        //   for (let item of dataTimesheet) {
        //     for (let indexTimeline of item.arr_position_in_timesheetline) {
        //       $(`#status_${item.id}_${indexTimeline}`).html('APPROVED').css('color', '#5cb85c');
        //       $(`#btnApprove_${item.id}_${indexTimeline}`).addClass('disabled');
        //     }
        //   }
        // } else if (systemCode == 'KEYPAY') {
        //   for (let id of dataTimesheet) {
        //     $(`#status_${id}_0`).html('APPROVED').css('color', '#5cb85c');
        //     $(`#btnApprove_${id}_0`).addClass('disabled');
        //   }
        // } else {
        //   for (let timesheet of dataTimesheet) {
        //     $(`#status_${timesheet.id}_0`).html('APPROVED').css('color', '#5cb85c');
        //     $(`#btnApprove_${timesheet.id}_0`).addClass('disabled');
        //   }
        // }
        requestTable.ajax.reload(null, false);
        timesheetTable.ajax.reload(null, false);
        viewBtnAll('#jsApproveAll', dataTimesheet.length);
        if (text == 'approve') {
          showToast('success', 'Approved successfully');
        }
        hidenLoading();
        return true;
      },
      error: function(err) {
        hidenLoading();
        showToast('error', "Can't connect to server. Please try again.");
        return false;
      }
    });
  }
  //post accept data timesheetRequest
  function postAcceptTimesheetRequest(dataTimesheetRequest) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/system-accept-timesheetRequest`,
      data: {
        systemCode: systemCode,
        dataRequest: JSON.stringify(dataTimesheetRequest),
        "_csrf": token
      },
      async: true,
      success: function(data) {
        if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
          loginAgain();
          return;
        }
        // for (let item of data.result) {
        //   $(`#status_${item._id}`).html('ACCEPTED').css('color', '#5cb85c');
        //   $(`#btnAccept_${item._id}`).addClass('disabled');
        //   $(`#btnReject_${item._id}`).addClass('disabled');
        // }
        viewBtnAll('#jsApproveAll', dataTimesheetRequest.length);
        showToast('success', 'Accepted successfully');
        requestTable.ajax.reload();
        timesheetTable.ajax.reload();
        hidenLoading();
        return true;
      },
      error: function() {
        hidenLoading();
        showToast('error', "Can not connect to server. Please try again.");
        return false;
      }
    });
  }
  //post reject data timesheetRequest
  function postRejectTimesheetRequest(timesheetRequestId) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/system-reject-timesheetRequest`,
      data: {
        systemCode: systemCode,
        requestId: timesheetRequestId,
        "_csrf": token
      },
      async: true,
      success: function(data) {
        if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
          loginAgain();
          return;
        }
        $(`#status_${timesheetRequestId}`).html('REJECTED').css('color', '#d9534f');
        $(`#btnAccept_${timesheetRequestId}`).addClass('disabled');
        $(`#btnReject_${timesheetRequestId}`).addClass('disabled');
        showToast('success', 'Rejected successfully');
        hidenLoading();
        return true;
      },
      error: function() {
        hidenLoading();
        showToast('error', "Can not connect to server. Please try again.")
        return false;
      }
    });
  }

  /* ------------------ start XERO ---------------------- */
  //format timesheet data XERO
  function formatTimesheetDataXERO(data) {
    const timesheetFormatArr = [];
    let timesheetArrFilter;
    data.forEach(item => {
      //format timesheet item
      item.payRate = item.TimesheetLines[0] ? item.TimesheetLines[0].EarningsRate.RatePerUnit : "N/A";
      item.firstName = item.Employee.FirstName;
      item.lastName = item.Employee.LastName;
      item.startTime = item.StartDateTimestamp;

      item.TimesheetLines[0]?.NumberOfUnits.forEach((hour, index) => {
        item.statusTimesheet = item.TimesheetLineStatus[index];
        const timesheetItem = formatData(item, index, hour);
        timesheetFormatArr.push(timesheetItem);
      });
    });
    //fiter timesheet arr date ranger picker
    if (startDate.format('L') != moment().startOf('month').format('L') || endDate.format('L') != moment().add(3, 'month').format('L')) {
      timesheetArrFilter = timesheetFormatArr.filter(item => 
        new Date(item.date.toString()) >= new Date(startDate) && new Date(item.date.toString()) <= new Date(endDate) );
    } else {
      timesheetArrFilter = timesheetFormatArr;
    }

    timesheetArrFilter.sort((item1, item2) => {
      return new Date(item1.date) - new Date(item2.date);
    })
    
    //filter timsheet arr not approve
    const timesheetArrNotApprove = timesheetArrFilter.filter(item => item.statusTimesheet != 'APPROVED');
    let i = -1;  
    //custom arrTimesheets 
    timesheetArrNotApprove.forEach(item => { 
      if (arrTimesheets.length > 0 && arrTimesheets[i]?.id == item.id) {
        arrTimesheets[i].arr_position_in_timesheetline.push(item.positonInTimesheetline);
      } else {
        i++;
        let obj = {
          id: item.id,
          arr_position_in_timesheetline: [item.positonInTimesheetline]
        };
        arrTimesheets.push(obj);
      }
    });

    return timesheetArrFilter;
  }
  //format timesheet request XERO
  function formatTimesheetRequestDataXERO(data) {
    const requestFormatArr = [];
    data.forEach(item => {
      let hour;
      item._id = item._id;
      item.statusRequest = item.status;
      item.payRate = item.timesheet.TimesheetLines[0] ? item.timesheet.TimesheetLines[0].EarningsRate.RatePerUnit : "N/A";
      item.firstName = item.timesheet.Employee.FirstName;
      item.lastName = item.timesheet.Employee.LastName;
      item.startTime = item.timesheet.StartDateTimestamp;
      hour = item.timesheet.TimesheetLines[0] ? item.timesheet.TimesheetLines[0].NumberOfUnits[item.position_in_timesheetline] : "N/A";

      const requestItem = formatData(item, item.position_in_timesheetline, hour);
      requestFormatArr.push(requestItem);
    });

    let requestArrFilter = requestFormatArr;
    //filter timesheet request date ranger picker
    if (startDate.format('L') != moment().startOf('month').format('L') || endDate.format('L') != moment().add(3, 'month').format('L')) {
      requestArrFilter = requestFormatArr.filter(item => 
        new Date(item.date.toString()) >= new Date(startDate) && new Date(item.date.toString()) <= new Date(endDate) );
    } 
    //filter timesheet request not accept
    const timesheetRequestArrNotAccept = requestArrFilter.filter(item => (item.statusRequest != 'ACCEPTED' && item.statusRequest != 'REJECTED'));
    //push item arrTimesheetRequestIds
    for(let item of timesheetRequestArrNotAccept) {
      arrTimesheetRequestIds.push(item.id);
    }
    
    return requestArrFilter;
  }
  /* ------------------ end XERO ---------------------- */
  
  /* ------------------ start DEPUTY ---------------------- */
  //format timesheet request DEPUTY
  function formatTimesheetDataDEPUTY(data) {
    const timesheetFormatArr = [];
    let timesheetArrFilter;
    data.forEach(item => {
      //format timesheet item
      item.payRate = item.PayRuleObject;
      item.firstName = item.employee.first_name;
      item.lastName = item.employee.last_name;
      item.startTime = item.StartTimeLocalized;
      item.endTime = item.EndTimeLocalized;
      item.statusTimesheet = item.CashDStatus;
      item.operationalUnitInfo = item._DPMetaData?.OperationalUnitInfo;
      
      const timesheetItem = formatData(item);
      timesheetFormatArr.push(timesheetItem);
      
    });
    //fiter timesheet arr date ranger picker
    if (startDate.format('L') != moment().startOf('month').format('L') || endDate.format('L') != moment().add(3, 'month').format('L')) {
      timesheetArrFilter = timesheetFormatArr.filter(item => 
        new Date(item.date.toString()) >= new Date(startDate) && new Date(item.date.toString()) <= new Date(endDate) );
    } else {
      timesheetArrFilter = timesheetFormatArr;
    }
    //filter timsheet arr not approve
    timesheetDEPUTY = timesheetArrFilter.filter(item => item.statusTimesheet != 'APPROVED');

    return timesheetArrFilter;
  }
  //format timesheet request DEPUTY
  function formatTimesheetRequestDataDEPUTY(data) {
    const requestFormatArr = [];
    let requestArrFilter;
    data.forEach(item => {
      item.payRate = item.timesheet.PayRuleObject;
      item.firstName = item.employee.first_name;
      item.lastName = item.employee.last_name;
      item.startTime = item.timesheet.StartTimeLocalized;
      item.endTime = item.timesheet.EndTimeLocalized;
      item.statusRequest = item.status;
      item.Type = item.timesheet.Type;
      item.TimesheetId = item.timesheet.TimesheetId;
      item.operationalUnitInfo = item.timesheet.OperationalUnitObject;

      const timesheetItem = formatData(item);
      requestFormatArr.push(timesheetItem);
    });
    //filter timesheet request date ranger picker
    if (startDate.format('L') != moment().startOf('month').format('L') || endDate.format('L') != moment().add(3, 'month').format('L')) {
      requestArrFilter = requestFormatArr.filter(item => 
        new Date(item.date.toString()) >= new Date(startDate) && new Date(item.date.toString()) <= new Date(endDate) );
    } else {
      requestArrFilter = requestFormatArr;
    }
    //filter timesheet request not accept
    timesheetRequestDEPUTY = requestArrFilter.filter(item => (item.statusRequest != 'ACCEPTED' && item.statusRequest != 'REJECTED'));
    
    return requestArrFilter;
  }
  //approve timesheet to CashD
  async function approveTimesheetToCashDSystem(timesheet, all = true, text = 'approve') {
    let deputyMultipleTimesheet = {}, lengthArr;
    if (text == 'approve') {
      lengthArr = timesheetDEPUTY.length;
    } else {
      lengthArr = timesheetRequestDEPUTY.length;
    }
    //check type
    if (timesheet.type && timesheet.type === 'ROSTER') {
      const roster = await getRosterDetail(timesheet.timesheetId);
      if (roster.MatchedByTimesheet > 0) {
        //Is Timesheet
        //Approve to DEPUTY System
        const timesheetApprove = await approveTimesheetToDEPUTYSystem(roster.MatchedByTimesheet);
        
        if (timesheetApprove?.error && !all) {
          showToast('error', timesheetApprove?.error.message);
          hidenLoading();
          return;
        }
        //get Pay Rate
        const timesheetPayRuns = await getDeputyTimesheetPayReturn(timesheetApprove.Id);
        deputyMultipleTimesheet.id = timesheet.id;
        deputyMultipleTimesheet.timesheetSystemId = timesheetApprove.Id;
        if(timesheetPayRuns.length > 0) {
          deputyMultipleTimesheet.payRuleObject = timesheetPayRuns[0].payRuleObject;
          deputyMultipleTimesheet.Cost = timesheetPayRuns[0].TimesheetObject.Cost;
        }
        arrTimesheets.push(deputyMultipleTimesheet);
      } else {
        //Is Roster
        //Create Timesheet
        const startDate = roster.StartTimeLocalized.slice(0, 19);
        const endDate = roster.EndTimeLocalized.slice(0, 19);
        const strDate = startDate.slice(0, startDate.indexOf('T'));
        const startHours = startDate.slice(startDate.indexOf('T') + 1, startDate.indexOf('T') + 3);
        const startMinutes = startDate.slice(startDate.indexOf('T') + 4, startDate.indexOf('T') + 6);
        const endHours = endDate.slice(endDate.indexOf('T') + 1, endDate.indexOf('T') + 3);
        const endMinutes = endDate.slice(endDate.indexOf('T') + 4, endDate.indexOf('T') + 6);
        let input = {
          intEmployeeId: roster.Employee,
          intOpunitId : roster.OperationalUnit,
          strComment : "",
          strDate : strDate,
          intStartTimeHour : startHours,
          intStartTimeMinute : startMinutes,
          intEndTimeHour : endHours,
          intEndTimeMinute : endMinutes
        }
        if (roster.Slots?.length > 0) {
          const slot = roster.Slots[0];
          input.intMealbreakMinute = (slot.intEnd - slot.intStart) / 60;
        }
        //create timesheet from roster
        const timesheetRoster = await onlyCreateDeputyTimesheetFromRoster(input, timesheet.timesheetId, roster.Id, all);
        if (timesheetRoster?.error && !all) {
          showToast('error', timesheetRoster?.error.message);
          hidenLoading();
          return;
        }
        //approve to DEPUTY system
        const timesheetApprove = await approveTimesheetToDEPUTYSystem(timesheetRoster.Id);
        if (timesheetApprove?.error && !all) {
          showToast('error', timesheetApprove?.error.message);
          hidenLoading();
          return;
        }
        //get Pay Rate
        const timesheetPayRuns = await getDeputyTimesheetPayReturn(timesheetRoster.Id);
        deputyMultipleTimesheet.id = timesheet.id;
        deputyMultipleTimesheet.TimesheetSystemId = timesheetApprove.Id;
        if(timesheetPayRuns?.length > 0) {
          deputyMultipleTimesheet.PayRuleObject = timesheetPayRuns[0].PayRuleObject;
          deputyMultipleTimesheet.Cost = timesheetPayRuns[0].TimesheetObject.Cost;
        }
        arrTimesheets.push(deputyMultipleTimesheet);
      }
    } else {
      //Timesheet
      //approve to DEPUTY system
      const timesheetApprove = await approveTimesheetToDEPUTYSystem(timesheet.timesheetId);
     
      if (timesheetApprove?.error && !all && lengthArr == 1) {
        showToast('error', timesheetApprove?.error.message);
        hidenLoading();
        return;
      }
      //get Pay Rate
      const timesheetPayRuns = await getDeputyTimesheetPayReturn(timesheetApprove.Id);
      deputyMultipleTimesheet.id = timesheet.id;
      deputyMultipleTimesheet.timesheetSystemId = timesheetApprove.Id;
      if(timesheetPayRuns?.length > 0) {
        deputyMultipleTimesheet.payRuleObject = timesheetPayRuns[0].PayRuleObject;
        deputyMultipleTimesheet.Cost = timesheetPayRuns[0].TimesheetObject.Cost;
      }
      arrTimesheets.push(deputyMultipleTimesheet);
    }
    
    if (!all) {
      if (text == 'approve') {
        postApproveTimesheet(arrTimesheets);
      } else {
        postApproveTimesheet(arrTimesheets, 'accept');
        postAcceptTimesheetRequest(arrTimesheets);
      }
    } else {
      indexLoopDEPUTY++;
      //check approve or accept timesheet
      if (indexLoopDEPUTY === lengthArr) {
        if (text == 'approve') {
          postApproveTimesheet(arrTimesheets);
        } else {
          postApproveTimesheet(arrTimesheets, 'accept');
          postAcceptTimesheetRequest(arrTimesheets);
        }
      }
    }
  }
  //approve timesheet to DEPUTY system
  function approveTimesheetToDEPUTYSystem(timesheetId) {
    let timesheetApprove;
    const body = {
      url: `https://${endpoint}/api/v1/supervise/timesheet/approve`,
      headers: {
        Authorization: `OAuth ${accessToken}`,
        'Content-Type': 'application/json'
      }, 
      params: {"intTimesheetId" : timesheetId}
    }
    timesheetApprove = baseApi(body);

    return timesheetApprove;
  }
  //get roster detail 
  function getRosterDetail(timesheetId) {
    let roster;
    const body = { 
      url: `https://${endpoint}/api/v1/supervise/roster/${timesheetId}`,
      headers: {
        Authorization: `OAuth ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
    roster = baseApi(body);

    return roster;
  }
  //get DEPUTY timesheet pay return
  function getDeputyTimesheetPayReturn(timesheetId) {
    let timesheetPayrun;
    const body = { 
      url: `https://${endpoint}/api/v1/resource/TimesheetPayReturn/QUERY`,
      headers: {
        Authorization: `OAuth ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        "search": { 
          "s1": { 
            "field": "Timesheet", 
            "type": "eq", 
            "data": timesheetId
          }
        }, 
        "join": ["PayRuleObject", "TimesheetObject"] 
      }
    } 
    timesheetPayrun = baseApi(body);

    return timesheetPayrun;
  }
  //only Create Deputy Timesheet From Roster
  async  function onlyCreateDeputyTimesheetFromRoster(input, idTS, idRoster, all) {
    let timesheetRoster;
    const body = { 
      url: `https://${endpoint}/api/v1/supervise/timesheet/update`,
      headers: {
        Authorization: `OAuth ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: input
    }
    timesheetRoster = await baseApi(body);
    //map roster to timesheet
    resultRosterToTimesheet = await mapRosterToTimesheet(timesheetRoster.Id, idRoster, all);
    if (resultRosterToTimesheet?.error && !all) {
      timesheetRoster = {
        error: {
          message: "Can not connect to server. Please try again."
        }
      };
    }
    return timesheetRoster;
  }
  //map roster to timesheet
  function mapRosterToTimesheet(idTS, idRoster, all) {
    let result;
    const body = { 
      url: `https://${endpoint}/api/v1/resource/Timesheet/${idTS}`,
      headers: {
        Authorization: `OAuth ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {"Roster" : idRoster}
    }
    result = baseApi(body);
    // if (result?.error && !all) {
    //   showToast('error', "Can not connect to server. Please try again.");
    //   hidenLoading();
    //   return;
    // }
    return result;
  }
  //base function call api 
  async function baseApi(body) {
    let dataApi;
    await $.ajax({
      dataType: 'json',
      method: 'POST',
      url: '/system-requestRawForm',
      data: {
        data: JSON.stringify(body),
        '_csrf': token
      },
      success: function(data) {
        if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
          loginAgain();
          return;
        }
        dataApi = data.data;
      }
    });
    return dataApi;
  }
  /* ------------------ end DEPUTY ---------------------- */

  /* ------------------ start KEYPAY ---------------------- */
  //format timesheet data KEYPAY
  function formatTimesheetDataKEYPAY(data) {
    const timesheetFormatArr = [];
    let timesheetArrFilter;
    data.forEach(item => {
      let hour;
      item.statusTimesheet = item.CasdDStatus;
      item.payRate = item.employee.rate_per_hour;
      item.firstName = item.employee.first_name;
      item.lastName = item.employee.last_name;
      item.startTime = item.startTime;
      item.endTime = item.endTime;
      hour = item.workedHours;
      
      const timesheetItem = formatData(item, 0, hour);
      timesheetFormatArr.push(timesheetItem);
    });
    //fiter timesheet arr date ranger picker
    if (startDate.format('L') != moment().startOf('month').format('L') || endDate.format('L') != moment().add(3, 'month').format('L')) {
      timesheetArrFilter = timesheetFormatArr.filter(item => 
        new Date(item.date.toString()) >= new Date(startDate) && new Date(item.date.toString()) <= new Date(endDate) );
    } else {
      timesheetArrFilter = timesheetFormatArr;
    }
    //filter timsheet arr not approve
    const timesheetArrNotApprove = timesheetKEYPAY = timesheetArrFilter.filter(item => item.statusTimesheet != 'APPROVED');
    //push item arrTimesheet
    for(let item of timesheetArrNotApprove) { 
      arrTimesheets.push(item.id);
    }
    
    return timesheetArrFilter;
  }
  //format timesheet request KEYPAY
  function formatTimesheetRequestDataKEYPAY(data) {
    const requestFormatArr = [];
    let requestArrFilter;
    data.forEach(item => {
      let hour;
      item.statusRequest = item.status;
      item.payRate = item.employee.rate_per_hour;
      item.firstName = item.employee.first_name;
      item.lastName = item.employee.last_name;
      item.startTime = item.timesheet.startTime;
      item.endTime = item.timesheet.endTime;
      hour = item.timesheet.workedHours;
      item.timesheetId = item.timesheet.timesheetId;
      item.employeeId = item.timesheet.employeeId;

      const timesheetItem = formatData(item, 0, hour);
      requestFormatArr.push(timesheetItem);
    });
    //filter timesheet request date ranger picker
    if (startDate.format('L') != moment().startOf('month').format('L') || endDate.format('L') != moment().add(3, 'month').format('L')) {
      requestArrFilter = requestFormatArr.filter(item => 
        new Date(item.date.toString()) >= new Date(startDate) && new Date(item.date.toString()) <= new Date(endDate) );
    } else {
      requestArrFilter = requestFormatArr;
    }
    //filter timesheet request not accept
    const timesheetRequestArrNotAccept = timesheetRequestKEYPAY = requestArrFilter.filter(item => (item.statusRequest != 'ACCEPTED' && item.statusRequest != 'REJECTED'));
    //push item arrTimesheetRequestIds
    for(let item of timesheetRequestArrNotAccept) {
      arrTimesheetRequestIds.push(item.id);
    }
    
    return requestArrFilter;
  }
  //approve timesheet in server KEYPAY
  function approveTimesheetKEYPAY(data, length, text = 'approve') {
    $.ajax({
      dataType: 'json',
      type: 'POST',
      url: `/keypay/approve`,
      data: {
        systemCompanyId, 
        employeeId: data.employeeId, 
        timesheetId: data.timesheetId, 
        accessToken,
        '_csrf': token
      },
      success: function(data) {
        if (length === 1 && !data) {
          showToast('error', "Can not connect to server. Please try again.");
          hidenLoading();
          return;
        }
        postApproveTimesheet(arrTimesheets);              
      }, error: function(err) {
        showToast('error', "Can not connect to server. Please try again.");
        hidenLoading();
      }
    });
  }
  /* ------------------ end KEYPAY ---------------------- */
  
  /* ------------------ Start RECKON -------------------- */
    function formatTimesheetDataRECKON(data) {
      const timesheetFormatArr = [];
      let timesheetArrFilter;
      let isSystemApproveProcess = $('input[name="isSystemApproveProcess"]:checked').val();
      data.forEach(item => {
        let hour;
        let status = 0;
        item.firstName = item.employee.first_name;
        item.lastName = item.employee.last_name;
        item.startTime = item.date;
        hour = item.workedHours;
        if (isSystemApproveProcess == 'true') {
          if (item.CasdDStatus == 1 || item.status != null && item.status == 3) {
            status = 1;
            if (item.payrollPayItemId != null) {
              for (let i = 0; i < item.employee.xero_salary_earnings_rates.length; i++) {
                if (item.employee.xero_salary_earnings_rates[i].payroll_payitem_id === item.payrollPayItemId) {
                  item.payRate = item.employee.xero_salary_earnings_rates[i];
                  break;
                }
              }
            }
          }
        } else {
          status = item.CasdDStatus;
          if (item.employee.xero_salary_earnings_rates != null) {
            for (let i = 0; i < item.employee.xero_salary_earnings_rates.length; i++) {
              if (item.employee.xero_salary_earnings_rates[i].rate_basis == 2) {
                item.payRate = item.employee.xero_salary_earnings_rates[i];
                break;
              }
            }
          }
        }
        item.statusTimesheet = status;
        const timesheetItem = formatData(item, 0, hour);
        timesheetFormatArr.push(timesheetItem);
      });
      //fiter timesheet arr date ranger picker
      if (startDate.format('L') != moment().startOf('month').format('L')) {
        timesheetArrFilter = timesheetFormatArr.filter(item => 
          new Date(item.date.toString()) >= new Date(startDate) && new Date(item.date.toString()) <= new Date(endDate));
      } else {
        timesheetArrFilter = timesheetFormatArr;
      }
      //filter timsheet arr not approve
      const timesheetArrNotApprove = timesheetKEYPAY = timesheetArrFilter.filter(item => item.statusTimesheet != 'APPROVED');
      //push item arrTimesheet
      for(let item of timesheetArrNotApprove) { 
        arrTimesheets.push(item.id);
      }
      
      return timesheetArrFilter;
    }
  
    function formatTimesheetRequestDataRECKON(data) {
      const requestFormatArr = [];
      let requestArrFilter;
      data.forEach(item => {
        let hour;
        item.statusRequest = item.status;
        item.payRate = item.employee.rate_per_hour;
        item.firstName = item.employee.first_name;
        item.lastName = item.employee.last_name;
        item.startTime = item.timesheet.date;
        hour = item.timesheet.workedHours;
        item.timesheetId = item.timesheet.timesheetId;
        item.employeeId = item.timesheet.employeeId;

        const timesheetItem = formatData(item, 0, hour);
        requestFormatArr.push(timesheetItem);
      });
      //filter timesheet request date ranger picker
      if (startDate.format('L') != moment().startOf('month').format('L')) {
        requestArrFilter = requestFormatArr.filter(item => new Date(item.date.toString()) >= new Date(startDate)  && new Date(item.date.toString()) <= new Date(endDate));
      } else {
        requestArrFilter = requestFormatArr;
      }
      //filter timesheet request not accept
      const timesheetRequestArrNotAccept = timesheetRequestKEYPAY = requestArrFilter.filter(item => (item.statusRequest != 'ACCEPTED' && item.statusRequest != 'REJECTED'));
      //push item arrTimesheetRequestIds
      for(let item of timesheetRequestArrNotAccept) {
        arrTimesheetRequestIds.push(item.id);
      }
      
      return requestArrFilter;
    }
  /* ------------------ End RECKON ---------------------- */

  /*--------------------- Start ASTUTE ----------------------*/
    function formatTimesheetDataASTUTE(data) {
      const timesheetFormatArr = [];
      let timesheetArrFilter;
      data.forEach(item => {
        let hour;
        item.statusTimesheet = item.CasdDStatus;
        item.payRate = item.employee.rate_per_hour;
        item.firstName = item.employee.first_name;
        item.lastName = item.employee.last_name;
        item.startTime = item.startTime;
        item.endTime = item.endTime;
        hour = item.workedHours;

        const timesheetItem = formatData(item, 0, hour);
        timesheetFormatArr.push(timesheetItem);
      });
      //fiter timesheet arr date ranger picker
      if (startDate.format('L') != moment().startOf('month').format('L') || endDate.format('L') != moment().add(3, 'month').format('L')) {
        timesheetArrFilter = timesheetFormatArr.filter(item => 
          new Date(item.date.toString()) >= new Date(startDate) && new Date(item.date.toString()) <= new Date(endDate) );
      } else {
        timesheetArrFilter = timesheetFormatArr;
      }
      //filter timsheet arr not approve
      const timesheetArrNotApprove = timesheetKEYPAY = timesheetArrFilter.filter(item => item.statusTimesheet != 'APPROVED');
      //push item arrTimesheet
      for(let item of timesheetArrNotApprove) { 
        arrTimesheets.push(item.id);
      }
      
      return timesheetArrFilter;
    }

    function getPayRateAstute(xeroSalaryEarningsRates, employeeId) {
      if (xeroSalaryEarningsRates && employeeId) {
        return xeroSalaryEarningsRates.find(x => x.system_user_id === employeeId).rate;
      } else {
        return "N/A";
      }
    }
  /*--------------------- End ASTUTE ------------------------*/

  //custom form data
  const formatData = (data, index, hour) => {
    const dateFormat = moment(new Date(data.startTime)).add('days', index).format('ddd, MMM DD YYYY');
    let startDate, endDate, strDate, strDateFormat, startHours, endHours;
    if (systemCode != 'XERO' && systemCode != 'RECKON') {
      startDate = data.startTime?.slice(0, 19);
      endDate = data.endTime?.slice(0, 19);
      strDate = startDate.slice(0, startDate.indexOf('T'));
      strDateFormat = moment(new Date(strDate)).format('ddd, MMM DD YYYY');
      startHours = startDate.slice(startDate.indexOf('T') + 1, startDate.indexOf('T') + 6);
      endHours = endDate.slice(endDate.indexOf('T') + 1, endDate.indexOf('T') + 6);
    }
    if (systemCode == 'RECKON') {
      startDate = data.startTime?.slice(0, 19);
      strDate = startDate.slice(0, startDate.indexOf('T'));
      strDateFormat = moment(new Date(strDate)).format('ddd, MMM DD YYYY');
      startHours = startDate.slice(startDate.indexOf('T') + 1, startDate.indexOf('T') + 6);
    }
    //format item
    let item = {
      id: data._id,
      fullName: data.firstName + ' ' + data.lastName,
      statusTimesheet: statusList[data.statusTimesheet] || '',
      statusRequest: data.statusRequest || '',
    }
    if (systemCode == 'KEYPAY') {
      item.date = strDateFormat;
      item.payRate = `$${data.payRate}/hrs(${data.employee.keypay_primary_pay_category})`;
      item.workingHours =`${hour.toFixed(1)} hour(s)`;
      item.timesheetId = data.timesheetId;
      item.employeeId = data.employeeId;
    } else if (systemCode == 'XERO') {
      item.workingHours =`${hour.toFixed(1)} hour(s)`;
      item.date = dateFormat;
      item.payRate = `$${data.payRate}/hrs(Permanent Ordinary Hours)`,
      item.positonInTimesheetline = index;
    } else if (systemCode == 'RECKON') {
      item.date = strDateFormat;
      item.payRate = `$${data.payRate?.rate ? data.payRate.rate : 0}/hrs`;
      item.workingHours =`${hour.toFixed(1)} hour(s)`;
      item.timesheetId = data.timesheetId;
      item.employeeId = data.employeeId;
    } else if (systemCode == 'ASTUTE') {
      item.date = strDateFormat;
      item.workingHours = `${convertFrom24To12Format(startHours)} - ${convertFrom24To12Format(endHours)}`;
      item.payRate = `$${getPayRateAstute(data?.employee?.xero_salary_earnings_rates, data.employeeId)}/hrs`;
      item.timesheetId = data.TimesheetId;
      item.type = data.Type;
      item.statusTimesheet = statusList[data.CashDStatus] || ''
    } else {
      const companyName = data.operationalUnitInfo?.OperationalUnitName;
      item.date = strDateFormat;
      item.workingHours = `${convertFrom24To12Format(startHours)} - ${convertFrom24To12Format(endHours)} at ${companyName}`;
      item.payRate = data.payRate ? `$${data.payRate.HourlyRate}/hrs(${data.payRate.PayTitle})` : 'N/A';
      item.timesheetId = data.TimesheetId;
      item.type = data.Type;
    }
    return item;
  }
  //view button
  function viewBtnAll(string, length) {
    if (isEmployer == 'true') {
      if (systemCode == 'DEPUTY') {
        if (timesheetDEPUTY?.length === 0) {
          $(string).addClass('disabled');
        } else {
          $(string).removeClass('disabled');
        }
      } else {
        if (length == 0) {
          $(string).addClass('disabled');
        } else {
          $(string).removeClass('disabled');
        }
      }
    } else {
      $(string).addClass('disabled');
    }
  }
  const convertFrom24To12Format = (time24) => {
    const [sHours, minutes] = time24.match(/([0-9]{1,2}):([0-9]{2})/).slice(1);
    const period = +sHours < 12 ? 'AM' : 'PM';
    const hours = +sHours % 12 || 12;
  
    return `${hours}:${minutes} ${period}`;
  }
});

// get token by system
async function getAccessTokenBySystemCode(systemCode) {
  var isSuccess = false;
  var staff;
    try {
      staff = JSON.parse(localStorage.getItem('staff'));
    } catch (error) {
      return null;
    }
    if (staff) {
      var resultGetAccessToken = await getAccessTokenPayroll(staff._id);
      if (resultGetAccessToken?.result?.access_token != null) {
        switch(systemCode) {
          case 'XERO':
            accessToken = resultGetAccessToken.result.access_token.replace("Bearer ", ""); 
            isSuccess = true;
            break;
          case 'DEPUTY':
            if (resultGetAccessToken.end_point_url != null) {
              accessToken = resultGetAccessToken.result.access_token.replace("OAuth ", "");
              endpoint = resultGetAccessToken.result.end_point_url;
              isSuccess = true;
            } else {
              showToast('error', "Can't connect to server. Please try again.");
            }
            break;
          case 'KEYPAY':
            accessToken = resultGetAccessToken.result.access_token.replace("Bearer ", "");
            isSuccess = true;
            break;
          case 'RECKON':
            accessToken = resultGetAccessToken.result.access_token.replace("Bearer ", "");
            isSuccess = true;
            break;
          default: 
            break;
        }
      }
    }
    return isSuccess;
}

// get accessToken
async function getAccessTokenPayroll(staff_id) {
  let _csrf = $('input[name="_csrf"]').val();
  let response = $.ajax({
    dataType: "json",
    type: "GET",
    url: `/access-token?staff_id=${staff_id}&_csrf=${_csrf}`,
    async: true,
    success: function (data) {
      return data;
    },
    error: function () {
      return false;
    },
  });
  return response;
}
