$(document).ready(function () {
  const token = $('input[name="_csrf"]').val();
  let keyword = "",
    groupId;
  var tableGroup = $("#tableGroup").DataTable({
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
      url: `/admin/api-groups`,
      data: function (d) {
        var info = $("#tableGroup").DataTable().page.info();
        d.page = info.page;
        d.pageSize = info.length;
        d._csrf = token;
        d.keyword = keyword;
      },
      dataSrc: "result",
      dataFilter: function (data) {
        var json = $.parseJSON(data);
        var info = $("#tableGroup").DataTable().page.info();
        if (info.page == 0) {
          total = json.totalCount;
        }
        json.recordsFiltered = total;
        json.recordsTotal = total;
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
        data: "group_name",
        render: function (data) {
          return data;
        },
      },
      {
        data: "managers",
        render: function (data) {
          if (data.length > 0) {
            let string = "";
            data.forEach((element, index) => {
              if (index > 0) {
                string += ", " + element.fullname;
              } else {
                string += element.fullname;
              }
            });
            return string;
          } else {
            return "N/A";
          }
        },
      },
      {
        data: "companies",
        render: function (data) {
          return data.length;
        },
      },
      {
        data: "is_active",
        render: function (data) {
          return data === 1
            ? "<span style='color: #0ac282 !important;'>Active</span>"
            : data === 0
            ? "<span style='color: #f6d807 !important;'>Pending</span>"
            : "<span style='color: #868e96 !important;'>Inactive</span>";
        },
      },
      {
        data: null,
        render: function (data, type, row, meta) {
          let stringSelect = '';
          const nameStatus = ['Pending', 'Active', 'Inactive'];
          for (let index = 0; index < 3; index++) {
            if (row.is_active === index) {
              stringSelect += `<div class="d-flex align-items-center">
                <input type="radio" name="${row._id}" class="cb-change-role" checked value="${index}" />
                <span class="ml-2">${nameStatus[index]}</span>
              </div>`;
            } else {
              stringSelect += `<div class="d-flex align-items-center">
                <input type="radio" name="${row._id}" class="cb-change-role" value="${index}" />
                <span class="ml-2">${nameStatus[index]}</span>
              </div>`;
            }
          }

          return `<div class="d-flex align-items-center">
          <a href="${
            "/admin/groups/" + row._id
          }" class="btn btn-mini btn-outline-info accordion-toggle md-details-control">
              <i class="icofont icofont-eye-alt"></i></a>
          <a href="${
            "/admin/group/" + row._id
          }" class="btn btn-mini btn-outline-info accordion-toggle md-details-control ml-2">
              <i class="icofont icofont-edit-alt"></i></a>
          <input title="Change status" class="btn-switch ml-2 detail-change-status ${data.is_active === 0 ? "btn-switch--pending" : ""}"  ${data.is_active === 1 || data.is_active === 0 ? "checked" : ""} type="checkbox" />
          </div>
          <div id="${row._id}" tabindex="-1" role="dialog" class="modal fade">
              <div class="modal-dialog" style="max-width: 20%;" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Change Status</h5>
                  </div>
                  <div class="modal-body">
                    ${stringSelect}
                  </div>
                  <div class="modal-footer d-flex justify-content-center">
                    <button type="button" class="btn btn-default waves-effect" data-dismiss="modal">Cancel</button>
                    <button  type="submit" class="btn btn-primary btn-change-status">Save</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        },
      },
    ],
  });

  $("#jsSearchGroup").submit(function (e) {
    e.preventDefault();
    keyword = $("input[name='jsNameGroup']").val();
    tableGroup.ajax.reload();
  });

  $("#tableGroup tbody").on("click", ".detail-change-status", function (event) {
    event.preventDefault();
    var tr = $(this).closest("tr");
    var row = tableGroup.row(tr);
    groupId = row.data()._id;
    $("#"+groupId).modal("show");
  });

  $(document).on('click', '.btn-change-status', function () {
    showLoading();
    let status = $(`input[name=${groupId}]:checked`, `#${groupId}`).val();
    $.ajax({
      dataType: "json",
      method: "PUT",
      url: `/admin/group/`+groupId,
      data: {
        _csrf: token,
       status, 
      },
      success: function (responsive) {
        if (responsive.success) {
          tableGroup.ajax.reload();
          showToast("success", responsive.message);
          $("#"+groupId).modal("hide");
        } else {
          showToast("error", responsive.message);
        }
        hideLoading();
        return true;
      },
      error: function () {
        hideLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  })

  function showLoading() {
    $('#jsLoader').addClass('show');
  }

  function hideLoading() {
    setTimeout(function () {
      $('#jsLoader').removeClass('show');
    }, 500);
  }

  //show toast
  function showToast(name, mess) {
    $('#jsErr').removeClass();
    $('#jsErr').addClass(`show ${name}`);
    $('#jsErr p').text(mess);
    setTimeout(() => {
      $('#jsErr').removeClass(`show ${name}`);
    }, 2500);
  }

  (function () {
    setTimeout(() => {
      $(".toast-err").removeClass(`show`);
    }, 2000);
  })();

  (function setFooterTable() {
    let divLength = $(
      `#tableGroup_wrapper .row:first-child div:nth-child(1) #tableGroup_length`
    ).addClass("pagination--custom");
    $(`#tableGroup_wrapper .row:last-child div`).first().append(divLength);
  })();
});
