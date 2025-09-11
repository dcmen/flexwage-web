$(document).ready(function() {
  const token = $('input[name="_csrf"]').val();
  const systemCode = $("input[name='systemCode']").val();
  const companyId = $("input[name='_id']").val(); 
  const scheduleName = [
    'End date of pay period',
    'One day before the end of pay period', 
    'Two day before the end of pay period',
    'Three day before the end of pay period'
  ];
  let scheduleId;

  const scheduleTable = $('#deductionScheduleTable').DataTable({
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
      'url': '/get-deduction-scheduler',
      'data': function (d) {
        var info = $('#deductionScheduleTable').DataTable().page.info();
        
        d.companyId = companyId;
        d.systemCode = systemCode;
        d.page =  info.page;
        d.pageSize =  5;
        d._csrf = token;
      },
      'dataSrc': 'result',
      'dataFilter': function(data) {
        var json = $.parseJSON(data);
        //format data
        const formatData = formatDataDeductionSchedule(json.result);

        json.result = formatData;
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
      { "data": "scheduleName",
        "render": function(data) {
          return data ? data : 'N/A';
        }
      },
      { "data": "startDate" },
      { "data": "scheduleTime",
        "render": function(data, type, row) {
          return `<span id="scheduleTime_${row._id}">${data ? data : 'N/A'}</span>`
        }
      },
      {
        "data": null,
        "render": function(data) {
          return `<a class="btn btn-mini btn-outline-info detail-edit">&nbsp
              <i class="icofont icofont-edit-alt"></i>`
        }
      }
    ]
  });

  const formatDataDeductionSchedule = function(data) {
    const formatDataArr = [];
    data.forEach(item => {
      let formatItem = {};
      if (systemCode == 'KEYPAY') {
        formatItem.name = item.name;
        formatItem.scheduleName = item.frequency;
        formatItem.startDate = moment(new Date(item.lastPayRun)).add('days', 1).format('DD/MM/YYYY');
      } else if (systemCode == 'XERO' || systemCode == 'RECKON') {
        formatItem.name = item.Name;
        formatItem.scheduleName = item.CalendarType;
        formatItem.startDate = moment(new Date(item.StartDateTimestamp)).format('DD/MM/YYYY');
      } else {
        formatItem.name = item.name;
        formatItem.scheduleName = item.cycle.name;
        formatItem.startDate = moment(new Date(item.start_date.slice(0, 10))).format('DD/MM/YYYY');
      }
      if (item.schedule_minute_time && item.schedule_sub_date >= 0) {
        const timeFormat = convertMinuteToTime(item.schedule_minute_time);
        formatItem.scheduleSubDate = +item.schedule_sub_date;
        formatItem.time = timeFormat;
        formatItem.scheduleTime = `${scheduleName[item.schedule_sub_date]} <br> At ${timeFormat}`;
      }
      formatItem._id = item._id;
      
      formatDataArr.push(formatItem);
    });

    return formatDataArr;
  }
  //edit event
  $('#deductionScheduleTable tbody').on('click', 'a.detail-edit', function() {
    var tr = $(this).closest('tr');
    var row = scheduleTable.row( tr );
    const schedule = row.data();
    scheduleId = row.data()._id;
    //disabled button
    $('#saveSchedule').addClass('disabled');
    if (schedule.time) {
      const [time, modifier] = schedule.time.split(' ');
      const [hours, minutes] = time.split(':');
      //selected date
      $('#selectedDate').val(schedule.scheduleSubDate);
      //set data
      $('.bfh-timepicker-toggle input').val(schedule.time);
      $('.bfh-timepicker-toggle input').click(function() {
        $('.bfh-selectbox input').val(modifier.toLowerCase());
        $('td.hour input').val(hours);
        $('td.minute input').val(minutes);
        $('#saveSchedule').removeClass('disabled');
        $('a.bfh-selectbox-toggle span.bfh-selectbox-option').html(modifier);
      });
    } else {
      $('.bfh-timepicker').val('');
      $('#selectedDate').val('default');
    }
    
    $('#selectedDate').on('change', function() {
      $('#saveSchedule').removeClass('disabled');
    });
    //open modal
    $('#jsModalEditScheduleTime').modal({
      backdrop: false,
      show: true
    });
  });
  //save deduction schedule edited
  $('#saveSchedule').click(function() {
    const valueTimepicker = $('.bfh-timepicker-toggle input').val()
    const [time, modifier] = valueTimepicker.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    const convertTime12to24 = hours*60 + +minutes;
    showLoading();
    $.ajax({
      dataType: 'json',
      url: '/update-deduction-scheduler',
      type: 'POST',
      async: true,
      data: {
        systemCode: systemCode,
        scheduleId: scheduleId,
        scheduleSubDate: $('#selectedDate').val(),
        time: convertTime12to24,
        "_csrf": token
      }, 
      success: function(data) {
        if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
          loginAgain();
          return;
        }
        const timeFormat = convertMinuteToTime(data.schedule_minute_time);
        showToast('success', 'Saved successfully.');
        $('#jsModalEditScheduleTime').modal('hide');
        $(`#deductionScheduleTable tbody span#scheduleTime_${data._id}`).html(`${scheduleName[data.schedule_sub_date]}<br>At ${timeFormat}`);
        hidenLoading();
      },
      error: function() {
        showToast('error', 'Can not connect to server. Please try again.');
        hidenLoading();
      }
    })
  });
  
  const convertMinuteToTime = (minutesTime) => {
    const getHours = Math.floor(minutesTime / 60);          
    const getMinutes = minutesTime % 60;
    const time24 = `${getHours}:${getMinutes}`;
    let [sHours, minutes] = time24.split(':')
    const period = +sHours < 12 ? 'AM' : 'PM';
    let hours = +sHours % 12 || 12;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;

    return `${hours}:${minutes} ${period}`;
  }
})