$(document).ready(function () {
  const token = $('input[name="_csrf"]').val();
  let companyName = '',
    status, companyId, groupId = 0, payroll = 0, connection = 0;
  let column = [{
    "data": null,
    "render": function (data, type, full, meta) {
      return meta.row + meta.settings._iDisplayStart + 1;
    }
  },
  {
    "data": "groups",
    "render": function (data) {
      if (data && data.length > 0) {
        return data[0].group_name;
      } else if (data && data.group_name) {
        return data.group_name;
      } else {
        return "N/A";
      }
    }
  },
  {
    "data": "company_name",
    "render": function (data) {
      return data.length <= 20 ? data : data.substring(0, 20).concat('...');
    }
  },
  {
    "data": "system",
    "render": function (data) {
      return data ? data.system_name : "N/A";
    }
  },
  {
    "data": "is_fail_system_refresh_token",
    "render": function (data) {
      return `<span class="${data == true ? 'text-danger' : 'text-success'}">
              ${data == true ? 'Disconnected' : 'Connected'}</span>`;
    }
  },
  {
    "data": "address",
    "render": function (data) {
      return data ? (data.length <= 20 ? data : data.substring(0, 20).concat('...')) : 'N/A';
    }
  },
  {
    "data": "abn",
    "render": function (data) {
      return data ? data : 'N/A';
    }
  },
  {
    "data": "email_company",
    "render": function (data) {
      return data ? (data.length <= 20 ? data : data.substring(0, 20).concat('...')) : 'N/A';
    }
  },
  {
    "data": "phone_company",
    "render": function (data) {
      return data ? (data.length <= 20 ? data : data.substring(0, 20).concat('...')) : 'N/A';
    }
  },
  {
    "data": "is_active",
    "render": function (data) {
      return data === 1 ? "<span style='color: #0ac282 !important;'>Active</span>" : data === 0 ? "<span style='color: #f6d807 !important;'>Pending</span>" : "<span style='color: #868e96 !important;'>Inactive</span>";
    }
  },
  {
    "data": { _id: '_id', is_active: "is_active"},
    "render": function (data, type, row, meta) {
      let stringSelect = '';
      const nameStatus = ['Pending', 'Active', 'Inactive'];
      for (let index = 0; index < 3; index++) {
        if (data.is_active === index) {
          stringSelect += `<div class="d-flex align-items-center">
            <input type="radio" name="${data._id}" class="cb-change-role" checked value="${index}" />
            <span class="ml-2">${nameStatus[index]}</span>
          </div>`;
        } else {
          stringSelect += `<div class="d-flex align-items-center">
            <input type="radio" name="${data._id}" class="cb-change-role" value="${index}" />
            <span class="ml-2">${nameStatus[index]}</span>
          </div>`;
        }
      }

      return `<div class="d-flex align-items-center"><a href="${'/admin/watch-company/' +data._id}" class="btn btn-mini btn-outline-info accordion-toggle md-details-control">
          <i class="icofont icofont-eye-alt"></i></a>
          <input title="Change status" class="btn-switch ml-2 detail-change-role  ${row.is_allow_login_other_system === 1 ? 'disabled' : ''} ${data.is_active === 0 ? "btn-switch--pending" : ""}"  ${data.is_active === 1 || data.is_active === 0 ? "checked" : ""} type="checkbox" /></div>

        <div id="${data._id}" tabindex="-1" role="dialog" class="modal fade">
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
                <button  type="submit" class="btn btn-primary btn-change-role">Save</button>
              </div>
            </div>
          </div>
        </div>
        `
    }
  }
  ];
  let order = [[2, 'asc'], [1, 'asc'], [3, 'asc'], [4, 'asc'], [5, 'asc'], [6, 'asc'], [7, 'asc'], [8, 'asc']];
  let targets = [0, 8, 9, 10];

  const companyTable = $('#companyTable').DataTable({
    'searching': false,
    'serverSide': true,
    'processing': true,
    "order": order,
    "ordering": true,
    'language': {
      'loadingRecords': '&nbsp;',
      'processing': '<div class="spinner"></div>'
    },
    'ajax': {
      'type': 'POST',
      'url': '/admin/get-company-management',
      'data': function (d) {
        var info = $('#companyTable').DataTable().page.info();
        d.companyName = companyName;
        d.page = info.page;
        d.pageSize = info.length;
        d._csrf = token;
        d.groupId = groupId;
        d.payroll = payroll;
        d.connection = connection;
      },
      'dataSrc': 'result',
      'dataFilter': function (data) {
        var info = $('#companyTable').DataTable().page.info();
        var json = $.parseJSON(data);
        if (info.page == 0) {
          total = json.recordsTotal;
        }
        if (json.result && json.result.length > 0 && json.result[0].groups) {
          $('#nameGroup').html(`<b>Group:</b> ${json.result[0].groups.group_name}`);
        }
        json.recordsFiltered = total;
        json.recordsTotal = total;
        return JSON.stringify(json);
      }
    },
    "columnDefs" : [
      { "orderable": false, "targets": targets } //Don't order the action column
    ],
    'columns': column
  });
  // <a data-toggle="tooltip" title="Change Status" class="btn btn-mini btn-outline-info detail-change-role md-details-control ml-2 ${row.is_allow_login_other_system === 1 ? 'disabled' : ''}"
  // ${row.is_allow_login_other_system === 1 ? 'disabled' : ''}>&nbsp
  // <i class="icofont icofont-exchange" style="font-size: 16px;"></i></a>
  //   <label class="switch ${row.is_allow_login_other_system === 1 ? 'disabled' : ''}">
  //   ${data.is_active === 1 ? '<input type="checkbox" checked>' : '<input type="checkbox">'}
  //   <span>
  //       <em></em>
  //       <strong></strong>
  //   </span>
  // </label>

  let divLength = $(`#companyTable_wrapper .row:first-child div:nth-child(1) #companyTable_length`).addClass('pagination--custom');
  $(`#companyTable_wrapper .row:last-child div`).first().append(divLength);

  $('#jsCompanySearch').on('submit', (event) => {
    event.preventDefault();
    companyName = $('input[name="company-name"]').val();
    companyTable.ajax.reload();
  });

  //cancel event
  $('#companyTable tbody').on('click', '.detail-change-role', function (event) {
    event.preventDefault();
    var tr = $(this).closest('tr');
    var row = companyTable.row(tr);
    companyId = row.data()._id;
    $(`#${companyId}`).modal('show');
  });

  $(document).on('click', ".btn-change-role", (e) => {
    showLoading();
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/admin/change-status/${companyId}`,
      data: {
        status: $(`input[name=${companyId}]:checked`, `#${companyId}`).val(),
        "_csrf": token
      },
      async: true,
    });
    companyTable.ajax.reload();
    showToast('success', "Changed status successfully.");
    hidenLoading();
    $(`#${companyId}`).modal('hide');
  });

  $('#jsFilterGroup').select2();
  //getGroups();

  $('#jsFilterGroup').on('change', function() {
    groupId = $(this).val();
    companyTable.ajax.reload();
  })
  $('#jsFilterPayroll').on('change', function() {
    payroll = $(this).val();
    companyTable.ajax.reload();
  })
  $('#jsFilterConnection').on('change', function() {
    connection = $(this).val();
    companyTable.ajax.reload();
  })

  function getGroups() {
    let string = [];
    $.ajax({
          url: '/admin/api-groups?_csrf=' + token,
          type: 'POST',
          dataType: 'json',
          data: {
            page: 0,
            pageSize: 10000,
            keyword: ""
          },
          success: function (data) {
            if (data.success && data.result.length > 0) {
              data.result.forEach(element => {
                string.push(`<option value='${element._id}'>${element.group_name}</option>`);
              });
              $("#jsFilterGroup").html(`<option value="0">Choose Group</option> ${string.join(" ")}`);
            }
          },
          error: function (err) {
          }
      });
    }

  function showLoading() {
    $('#jsLoader').addClass('show');
  }

  function hidenLoading() {
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

})