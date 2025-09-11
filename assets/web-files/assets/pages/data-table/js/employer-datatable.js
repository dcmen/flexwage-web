$(document).ready(function () {
  const token = $('input[name="_csrf"]').val();
  const companyId = $("input[name='_id']").val();
  let searchKey = "",
    staffIds = {};
  let order = [
    [1, "asc"],
    [2, "asc"],
    [5, "asc"],
    [6, "asc"],
  ];
  let targets = [0, 3, 4, 7, 8, 9];

  let tableEmployer = null;

  $(document).on("submit", "#jsToEmployer", (event) => {
    event.preventDefault();
    searchKey = $('input[name="employer-name"]').val();
    tableEmployer.ajax.reload();
  });

  $("#invite").click(function () {
    searchKey = "";
    $("#devEmployer").modal({
      show: true,
      backdrop: false
    });
    if (!tableEmployer) {
      tableEmployer = $("#tableEmployer")
        .DataTable({
          searching: false,
          serverSide: true,
          processing: true,
          ordering: true,
          scrollCollapse: true,
          scrollY: "52vh",
          scrollX: true,
          order: order,
          language: {
            loadingRecords: "&nbsp;",
            processing: '<div class="spinner"></div>',
          },
          ajax: {
            type: "POST",
            url: "/employers",
            data: function (d) {
              var info = $("#tableEmployer").DataTable().page.info();
              d.keyword = searchKey;
              d.page = info.page;
              d.pageSize = info.length;
              d._csrf = token;
              d.companyId = companyId;
            },
            dataSrc: "result",
            dataFilter: function (data) {
              var json = $.parseJSON(data);
              var info = $("#tableEmployer").DataTable().page.info();
              if (info.page == 0) {
                total = json.totalCount;
              }
              json.recordsFiltered = total;
              json.recordsTotal = total;
              return JSON.stringify(json);
            },
          },
          columnDefs: [
            { orderable: false, targets: targets }, //Don't order the action column
          ],
          columns: [
            {
              data: null,
              className: "align-middle",
              render: function (data, type, full, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
              },
            },
            {
              data: "first_name",
            },
            {
              data: "last_name",
            },
            {
              data: "email",
            },
            {
              data: null,
              render: function (data, type, row) {
                return row.is_allow_login_other_system === 1
                  ? "Employer"
                  : row.role == "SUPERVISOR"
                  ? "Supervisor"
                  : "Employee";
              },
            },
            {
              data: "start_date",
              render: function (data) {
                return data ? moment(data).format("DD-MM-YYYY h:mm A") : "N/A";
              },
            },
            {
              data: "user",
              render: function (data) {
                return data.first_name;
              },
            },
            {
              data: "user",
              render: function (data) {
                return data.last_name;
              },
            },
            {
              data: "user",
              render: function (data) {
                return data.email;
              },
            },
            {
              data: "_id",
              className: "text-center",
              render: function (data) {
                return `<input type="checkbox" ${
                  staffIds[data] ? "checked" : ""
                } name="staffId" value="${data}">`;
              },
            },
          ],
        })
        .columns.adjust();
        if ($("#devEmployer .dataTables_scrollHead")) {
          $("#tableEmployer").css({ transform: "translateY(-43px)" });
          $("#devEmployer .dataTables_scrollHeadInner table").css({
            transform: "none",
          });
        }
        (function () {
          let divLength = $(
            "#tableEmployer_wrapper .row:first-child div:nth-child(1) #tableEmployer_length"
          ).addClass("pagination--custom");
          $("#tableEmployer_wrapper .row:last-child div:nth-child(1)").append(
            divLength
          );
          $("#tableEmployer_wrapper .row:last-child").addClass("mt-2");
        })();
    } else {
      tableEmployer.columns.adjust();
    }

  });

  $("#tableEmployer tbody").on("click", 'input[name="staffId"]', function () {
    const staffId = $(this).val();
    if ($(this).is(":checked")) {
      if (!staffIds[staffId]) {
        staffIds[staffId] = staffId;
      }
    } else {
      if (staffIds[staffId]) {
        delete staffIds[staffId];
      }
    }
  });

  $("#sendInvite").click(function () {
    let ids = Object.keys(staffIds);
    if (ids.length > 0) {
      showLoading();
      inviteDDToEmployer(ids);
    } else {
      return true;
    }
  });

  function inviteDDToEmployer(ids) {
    $.ajax({
      url: "/send-direct-debit-invite?_csrf=" + token,
      type: "POST",
      dataType: "json",
      data: {
        companyId: companyId,
        staffIds: JSON.stringify(ids),
        url: window.origin + "/reckon/direct-debit-form?code=",
      },
      success: function (response) {
        hideLoading();
        if (response.success) {
          staffIds = {};
          tableEmployer.ajax.reload();
          showToast("success", response.message);
          $("#devEmployer").modal("hide");
        } else {
          showToast("error", response.message);
        }
      },
      error: function (err) {
        hideLoading();
        showToast("error", "Can't connect to server. Try again!");
      },
    });
  }

  function showLoading() {
    $("#jsLoader").addClass("show");
  }

  function hideLoading() {
    setTimeout(function () {
      $("#jsLoader").removeClass("show");
    }, 500);
  }

  //show toast
  function showToast(name, mess) {
    $("#jsErr").removeClass();
    $("#jsErr").addClass(`show ${name}`);
    $("#jsErr p").text(mess);
    setTimeout(() => {
      $("#jsErr").removeClass(`show ${name}`);
    }, 2500);
  }
});
