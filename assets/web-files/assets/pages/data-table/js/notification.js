$(document).ready(function () {
  const token = $('input[name="_csrf"]').val();

  $('#jsSendMessage').on('click', () => {
    var message = $('#message').val();
    if(message.trim() == "") {
      $('#jsShowErr').text("Please enter your message.");
    }
    else {
      showLoader();
      $('#jsShowErr').text("");
      $.ajax({
        method: "post",
        url: `/admin/notifications`,
        data: {
          "_csrf": token,
          message
        },
        success: function (data) {
          hidenLoader();
          if (data.success) {
            showToast('success', "Send message successful.")
            notificationTable.ajax.reload();
            $('#message').val("");
          }
          return true;
        },
        error: function () {
          hidenLoader();
          showToast('error', "Please try again!")
          return false;
        }
      });
    }
  });

  const notificationTable =  $("#notificationTable").DataTable({
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
      url: `/admin/get-notifications`,
      data: function (d) {
        var info = $("#notificationTable").DataTable().page.info();
        d.page = info.page;
        d.pageSize = info.length;
        d._csrf = token;
      },
      dataSrc: "result",
      dataFilter: function (data) {
        var json = $.parseJSON(data);
        json.recordsTotal = json.totalItem;
        json.recordsFiltered = json.totalItem;
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
        data: null,
        render: function (data, type, row) {
          var content;
          switch (row.type) {
            case "ADMIN_NOTIFY":
              content = row.content;
              break;
            case "SEND_NEW_TIMESHEET_REQUEST":
              content = `${
                row.entity_name
              } sent a request to approve the timesheet on ${row.request_date}`;
              break;
            case "APPROVE_TIMESHEET_REQUEST":
              content = `${
                row.entity_name
              } approved your request on ${row.request_date}`;
              break;
            case "REJECTED_TIMESHEET_REQUEST":
              content = `${row.entity_name} rejected your request on ${row.request_date}`;
              break;
            case "APPROVE_TIMESHEET":
              content = `${
                row.entity_name
              } approved your timesheet on ${row.request_date}`;
              break;
            default:
              break;
          }
          return content;
        },
      },
      {
        data: null,
        render: function (data, type, row) {
          var system;
          switch (row.system_code) {
            case 'XERO':
                system = "Xero";
              break;
            case 'DEPUTY':
                system = "Deputy";
              break;
            case 'KEYPAY':
                system = "Keypay";
              break;
            case 'ASTUTE':
                system = "Astute";
              break;
            case 'RECKON':
              system = "Reckon";
              break;
            case 'HR3':
              system = "HR3";
              break;
            default:
              system = "N/A";
              break;
          }
          return system;
        },
      },
      {
        data: null,
        render: function (data, type, row) {
          return row.type_name ? row.type_name : "N/A";
        },
      },
      {
        data: "created_date",
        render: function (data) {
          return moment(data).format("DD/MM/YYYY");
        },
      },
    ],
  });

  (function setFooterTable() {
    let divLength = $(
      `#notificationTable_wrapper .row:first-child div:nth-child(1) #notificationTable_length`
    ).addClass("pagination--custom");
    $(`#notificationTable_wrapper .row:last-child div`)
      .first()
      .append(divLength);
  })();
});

  // show Loading
  function showLoader() {
    $('#jsLoader').addClass('show');
  }
  //hiden loading
  function hidenLoader() {
    setTimeout(function () {
      $('#jsLoader').removeClass('show');
    }, 500);
  }

  //show Toast
  function showToast(name, mess) {
    $('#jsErr').removeClass();
    $('#jsErr').addClass(`show ${name}`);
    $('#jsErr p').text(mess);
    setTimeout(() => {
      $('#jsErr').removeClass(`show ${name}`);
    }, 2500);
  }
