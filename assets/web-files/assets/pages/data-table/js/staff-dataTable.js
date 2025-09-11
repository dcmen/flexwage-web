$(document).ready(function () {
  const token = $('input[name="_csrf"]').val();
  const systemCode = $("input[name='systemCode']").val();
  const idCompany = $("input[name='_id']").val();
  const company = JSON.parse($("input[name='company']").val());
  const roleLogin = $('input[name="role"]').val();
  let startDate = moment().startOf('month');
  let endDate = moment().add(3, 'month');
  let startDateSelect = "", endDateSelect = "";
  let total,
    searchKey = "",
    role,
    currentStaff,
    InvitesType,
    pageEvent = null,
    totalUnregister;
  let staffList = [],
    staffListInvite = [],
    staffListEmail = [],
    staffListEmailInvite = [],
    staffListChangeStatus = [],
    employeeFromEmail = {},
    employeesNotMatched = [];
    totalEmployeeFromFile = 0;
  let matchBy = "EMAIL",
    isActive = "ALL",
    action = "1",
    nameIdChange = "";
  let businessFee = {}, listBusiness;

  let statusArr
  let statusObject = {}

  const columnsCommonTableRegisteredStaff = [{
                                      data: null,
                                      render: function (data, type, full, meta) {
                                        statusArr = meta.settings.aoData
                                        statusObject = statusArr.reduce((result, obj) => {
                                          return { ...result, [obj._aData._id]: obj._aData };
                                        }, {});
                                        return meta.row + meta.settings._iDisplayStart + 1;
                                      },
                                    },
                                    {
                                      data: "first_name",
                                      render: function (data) {
                                        return data ? data : "N/A";
                                      },
                                    },
                                    {
                                      data: "last_name",
                                      render: function (data) {
                                        return data ? data : "N/A";
                                      },
                                    },
                                    {
                                      data: "email",
                                      render: function (data) {
                                        return data ? data : "N/A";
                                      },
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
                                      data: "salary_wag",
                                      render: function (data) {
                                        const employeeType = checkSalaryWag(data);
                                        return employeeType;
                                      },
                                    },
                                    {
                                      data: null,
                                      render: function (data, type, row) {
                                        let scheduleName;
                                        if (systemCode == "DEPUTY") {
                                          scheduleName =
                                            row.pay_period_originations.length > 0
                                              ? row.pay_period_originations[0].name
                                              : "N/A";
                                        } else if (systemCode == "KEYPAY") {
                                          scheduleName =
                                            row.keypay_pay_schedules.length > 0
                                              ? row.keypay_pay_schedules[0].name
                                              : "N/A";
                                        } else {
                                          scheduleName =
                                            row.xero_pay_calendars.length > 0
                                              ? row.xero_pay_calendars[0].Name
                                              : "N/A";
                                        }
                                        return scheduleName;
                                      },
                                    },
                                    {
                                      data: "suburb",
                                      render: function (data) {
                                        return data ? data : "N/A";
                                      },
                                    },
                                    {
                                      data: "start_date",
                                      render: function (data) {
                                        return data ? moment(data).format("DD-MM-YYYY") : "N/A";
                                      },
                                    },
                                    {
                                      data: "is_active",
                                      render: function (data, type, row) {
                                        let element = "",
                                          checked = `<label class="lab-checkbox ml-2">
                                                      <input class="check-status-staff" type="checkbox" value=${row._id}>
                                                      <span class="lab-checkbox-checkmark"></span>
                                                  </label>`;
                                        switch (data) {
                                          case 0:
                                            element = `<span style='width: 50px; display: inline-block;'>Suspend</span>`;
                                            break;
                                          case 1:
                                            element = `<span style='color: #0ac282;width: 50px; display: inline-block;'>Active</span>`;
                                            break;
                                          case 2:
                                            element = `<span style='color: #fe5d70;width: 50px; display: inline-block;'>Inactive</span>`;
                                            break;
                                          case 3:
                                            element = `<span style='width: 50px; display: inline-block;'>Terminated</span>`;
                                            break;
                                          default:
                                            break;
                                        }
                                        staffListChangeStatus.forEach((item) => {
                                          if (item._id == row._id) {
                                            checked = `<label class="lab-checkbox ml-2">
                                                              <input checked class="check-status-staff" type="checkbox" value=${row._id}>
                                                              <span class="lab-checkbox-checkmark"></span>
                                                          </label>`;
                                          }
                                        });
                                        return element + checked;
                                      },
                                    },
                                    {
                                      data: null,
                                      render: function (data, type, row) {
                                        return `<div class="d-flex"><a href="${
                                          "/admin/staff-company/" + row._id
                                        }" data-toggle="tooltip" title="View detail" class="btn btn-mini btn-outline-info accordion-toggle md-details-control">
                                                  <i class="icofont icofont-eye-alt" style="font-size: 16px;"></i>
                                                  <a data-toggle="tooltip" title="Change Employment Type" class="btn btn-mini btn-outline-success detail-change-role ml-2 ${
                                                    row.is_allow_login_other_system === 1 ? "disabled" : ""
                                                  }"
                                                  ${row.is_allow_login_other_system === 1 ? "disabled" : ""}>
                                                  <i class="icofont icofont-exchange" style="font-size: 16px;"></i>
                                                  <a href="javascript:void(0);" class="btn btn-mini btn-outline-info ml-2 staff-chat ${
                                                    JSON.stringify(currentStaff?._id) ===
                                                    JSON.stringify(row._id)
                                                      ? "disabled"
                                                      : ""
                                                  }" ${
                                          JSON.stringify(currentStaff?._id) === JSON.stringify(row._id)
                                            ? "disabled"
                                            : ""
                                        } data-izimodal-fullscreen="" data-id="${row._id}">
                                                  <i class="icofont icofont-ui-messaging" style="font-size: 16px;"></i></a>
                                                  ${ row.is_allow_login_other_system || row.role == "SUPERVISOR" ? `<a title="Support" 
                                                  class="btn btn-mini btn-outline-info ml-2 jsActiveSupport">
                                                  <i class="icofont icofont-live-support" style="font-size: 18px;${row.is_support ? "color: #19a7ba;" : "color: #7c7c7c;"}"></i>
                                                  </a>` : `<a style="position: relative;" title="Support" class="btn btn-mini btn-outline-info ml-2 disabled jsActiveSupport">
                                                    <i class="icofont icofont-live-support" style="font-size: 18px; color: #7c7c7c;"></i>
                                                    <i class="icofont icofont-ui-block" style="right: 30%;"></i>
                                                  </a>`}
                                                  </div>
                                                  `;
                                      },
                                    },
                                    {
                                      data: null,
                                      render: function (data, type, row, meta) {
                                        let index = meta.row + meta.settings._iDisplayStart;
                                        return `
                                                  <form class="form-set-detail">
                                                      <div class="form-set-detail-input">
                                                        <label for="">$</label>
                                                        <input data-toggle="tooltip" title="Minimum withdrawal per transaction" class="allowable" id="${
                                                          "min_" + row._id
                                                        }" name="staff_min_withdrawal" min="1" style="max-width: 55px;" disabled value="${
                                                          row.min_withdrawal ? row.min_withdrawal : 1
                                                        }">
                                                      </div>
                                                      <div class="form-set-detail-input">
                                                        <label for="">%</label>
                                                        <input data-toggle="tooltip" title="Limit % of salary / pay period" class="allowable" id="${
                                                          "moneymod_" + row._id
                                                        }" name="staff_limit_allowable_percent_drawdown" min="0" style="max-width: 55px;" disabled value="${
                                                          row.limit_allowable_percent_drawdown
                                                            ? row.limit_allowable_percent_drawdown
                                                            : 0
                                                        }">
                                                      </div>
                                                      <div style="width: 48px; margin-top: 0!important;" class="d-flex justify-content-end align-items-center mr-2">
                                                        <input disabled title="Max wallet" id="${"wallet_" + row._id}" class="btn-switch-small disabled" ${row.is_limit_money_max_wallet ? "checked" : ''} type="checkbox">
                                                      </div>
                                                      <div class="form-set-detail-input input-withdrawal">
                                                        <span ${row.is_limit_money_max_wallet ? "" : "hidden"} class="text-wallet">Wallet</span>
                                                        <label ${row.is_limit_money_max_wallet ? "hidden" : ""} for="">$</label>
                                                        <input ${row.is_limit_money_max_wallet ? "hidden" : ""} data-toggle="tooltip" title="Maximum withdrawal / pay period" class="money" id="${
                                                          "money_" + row._id
                                                        }" name="staff_limit_money" style="width: 100%;" disabled value="${
                                                          row.limit_money ? row.limit_money : 0
                                                        }">
                                                        <a style="font-size: 11px; padding-right: 3px;" id="${
                                                          "edit_" + row._id
                                                        }" class="detail-edit" title="edit">
                                                          <i data-index-number="${index}" class="icofont icofont-edit-alt"></i>
                                                        </a>
                                                        <span hidden class="editable-clear-x"></span>
                                                      </div>
                                                      <a hidden class="btn btn-primary btn-mini ml-2 detail-save" id="${
                                                        "save_" + row._id
                                                      }" title="save">
                                                      <i style="font-size: 12px;color: #fff;" data-index-number="${index}" class="icofont icofont-ui-check"></i>
                                                      </a>                                                                                
                                                      <a hidden id="${
                                                        "cancel_" + row._id
                                                      }" type="reset" class="btn btn-secondary btn-mini ml-1 detail-cancel" title="cancel">
                                                      <i style="font-size: 12px;" data-index-number="${index}" class="icofont icofont-ui-close"></i>
                                                      </a>
                                                  </form>`;
                                      },
                                    }];

  const columnsAstuteTableRegisteredStaff = [{
                                      data: null,
                                      render: function (data, type, full, meta) {
                                        statusArr = meta.settings.aoData
                                        statusObject = statusArr.reduce((result, obj) => {
                                          return { ...result, [obj._aData._id]: obj._aData };
                                        }, {});
                                        return meta.row + meta.settings._iDisplayStart + 1;
                                      },
                                    },
                                    {
                                      data: "first_name",
                                      render: function (data) {
                                        return data ? data : "N/A";
                                      },
                                    },
                                    {
                                      data: "last_name",
                                      render: function (data) {
                                        return data ? data : "N/A";
                                      },
                                    },
                                    {
                                      data: "email",
                                      render: function (data) {
                                        return data ? data : "N/A";
                                      },
                                    },
                                    {
                                      data: "business_units",
                                      render: function (data) {                                      
                                        return data[0] ? data[0].name : "N/A";
                                      },
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
                                      data: "salary_wag",
                                      render: function (data) {
                                        const employeeType = checkSalaryWag(data);
                                        return employeeType;
                                      },
                                    },
                                    {
                                      data: null,
                                      render: function (data, type, row) {
                                        let scheduleName;
                                        if (systemCode == "DEPUTY") {
                                          scheduleName =
                                            row.pay_period_originations.length > 0
                                              ? row.pay_period_originations[0].name
                                              : "N/A";
                                        } else if (systemCode == "KEYPAY") {
                                          scheduleName =
                                            row.keypay_pay_schedules.length > 0
                                              ? row.keypay_pay_schedules[0].name
                                              : "N/A";
                                        } else {
                                          scheduleName =
                                            row.xero_pay_calendars.length > 0
                                              ? row.xero_pay_calendars[0].Name
                                              : "N/A";
                                        }
                                        return scheduleName;
                                      },
                                    },
                                    {
                                      data: "suburb",
                                      render: function (data) {
                                        return data ? data : "N/A";
                                      },
                                    },
                                    {
                                      data: "start_date",
                                      render: function (data) {
                                        return data ? moment(data).format("DD-MM-YYYY") : "N/A";
                                      },
                                    },
                                    {
                                      data: "is_active",
                                      render: function (data, type, row) {
                                        let element = "",
                                          checked = `<label class="lab-checkbox ml-2">
                                                      <input class="check-status-staff" type="checkbox" value=${row._id}>
                                                      <span class="lab-checkbox-checkmark"></span>
                                                  </label>`;
                                        switch (data) {
                                          case 0:
                                            element = `<span style='width: 50px; display: inline-block;'>Suspend</span>`;
                                            break;
                                          case 1:
                                            element = `<span style='color: #0ac282;width: 50px; display: inline-block;'>Active</span>`;
                                            break;
                                          case 2:
                                            element = `<span style='color: #fe5d70;width: 50px; display: inline-block;'>Inactive</span>`;
                                            break;
                                          case 3:
                                            element = `<span style='width: 50px; display: inline-block;'>Terminated</span>`;
                                            break;
                                          default:
                                            break;
                                        }
                                        staffListChangeStatus.forEach((item) => {
                                          if (item._id == row._id) {
                                            checked = `<label class="lab-checkbox ml-2">
                                                              <input checked class="check-status-staff" type="checkbox" value=${row._id}>
                                                              <span class="lab-checkbox-checkmark"></span>
                                                          </label>`;
                                          }
                                        });
                                        return element + checked;
                                      },
                                    },
                                    {
                                      data: null,
                                      render: function (data, type, row) {
                                        return `<div class="d-flex"><a href="${
                                          "/admin/staff-company/" + row._id
                                        }" data-toggle="tooltip" title="View detail" class="btn btn-mini btn-outline-info accordion-toggle md-details-control">
                                                  <i class="icofont icofont-eye-alt" style="font-size: 16px;"></i>
                                                  <a data-toggle="tooltip" title="Change Employment Type" class="btn btn-mini btn-outline-success detail-change-role ml-2 ${
                                                    row.is_allow_login_other_system === 1 ? "disabled" : ""
                                                  }"
                                                  ${row.is_allow_login_other_system === 1 ? "disabled" : ""}>
                                                  <i class="icofont icofont-exchange" style="font-size: 16px;"></i>
                                                  <a href="javascript:void(0);" class="btn btn-mini btn-outline-info ml-2 staff-chat ${
                                                    JSON.stringify(currentStaff?._id) ===
                                                    JSON.stringify(row._id)
                                                      ? "disabled"
                                                      : ""
                                                  }" ${
                                          JSON.stringify(currentStaff?._id) === JSON.stringify(row._id)
                                            ? "disabled"
                                            : ""
                                        } data-izimodal-fullscreen="" data-id="${row._id}">
                                                  <i class="icofont icofont-ui-messaging" style="font-size: 16px;"></i></a>
                                                  ${ row.is_allow_login_other_system || row.role == "SUPERVISOR" ? `<a title="Support" 
                                                  class="btn btn-mini btn-outline-info ml-2 jsActiveSupport">
                                                  <i class="icofont icofont-live-support" style="font-size: 18px;${row.is_support ? "color: #19a7ba;" : "color: #7c7c7c;"}"></i>
                                                  </a>` : `<a style="position: relative;" title="Support" class="btn btn-mini btn-outline-info ml-2 disabled jsActiveSupport">
                                                    <i class="icofont icofont-live-support" style="font-size: 18px; color: #7c7c7c;"></i>
                                                    <i class="icofont icofont-ui-block" style="right: 30%;"></i>
                                                  </a>`}
                                                  </div>
                                                  `;
                                      },
                                    },
                                    {
                                      data: null,
                                      render: function (data, type, row, meta) {
                                        let index = meta.row + meta.settings._iDisplayStart;
                                        return `
                                                  <form class="form-set-detail">
                                                      <div class="form-set-detail-input">
                                                        <label for="">$</label>
                                                        <input data-toggle="tooltip" title="Minimum withdrawal per transaction" class="allowable" id="${
                                                          "min_" + row._id
                                                        }" name="staff_min_withdrawal" min="1" style="max-width: 55px;" disabled value="${
                                                          row.min_withdrawal ? row.min_withdrawal : 1
                                                        }">
                                                      </div>
                                                      <div class="form-set-detail-input">
                                                        <label for="">%</label>
                                                        <input data-toggle="tooltip" title="Limit % of salary / pay period" class="allowable" id="${
                                                          "moneymod_" + row._id
                                                        }" name="staff_limit_allowable_percent_drawdown" min="0" style="max-width: 55px;" disabled value="${
                                                          row.limit_allowable_percent_drawdown
                                                            ? row.limit_allowable_percent_drawdown
                                                            : 0
                                                        }">
                                                      </div>
                                                      <div style="width: 48px; margin-top: 0!important;" class="d-flex justify-content-end align-items-center mr-2">
                                                        <input disabled title="Max wallet" id="${"wallet_" + row._id}" class="btn-switch-small disabled" ${row.is_limit_money_max_wallet ? "checked" : ''} type="checkbox">
                                                      </div>
                                                      <div class="form-set-detail-input input-withdrawal">
                                                        <span ${row.is_limit_money_max_wallet ? "" : "hidden"} class="text-wallet">Wallet</span>
                                                        <label ${row.is_limit_money_max_wallet ? "hidden" : ""} for="">$</label>
                                                        <input ${row.is_limit_money_max_wallet ? "hidden" : ""} data-toggle="tooltip" title="Maximum withdrawal / pay period" class="money" id="${
                                                          "money_" + row._id
                                                        }" name="staff_limit_money" style="width: 100%;" disabled value="${
                                                          row.limit_money ? row.limit_money : 0
                                                        }">
                                                        <a style="font-size: 11px; padding-right: 3px;" id="${
                                                          "edit_" + row._id
                                                        }" class="detail-edit" title="edit">
                                                          <i data-index-number="${index}" class="icofont icofont-edit-alt"></i>
                                                        </a>
                                                        <span hidden class="editable-clear-x"></span>
                                                      </div>
                                                      <a hidden class="btn btn-primary btn-mini ml-2 detail-save" id="${
                                                        "save_" + row._id
                                                      }" title="save">
                                                      <i style="font-size: 12px;color: #fff;" data-index-number="${index}" class="icofont icofont-ui-check"></i>
                                                      </a>                                                                                
                                                      <a hidden id="${
                                                        "cancel_" + row._id
                                                      }" type="reset" class="btn btn-secondary btn-mini ml-1 detail-cancel" title="cancel">
                                                      <i style="font-size: 12px;" data-index-number="${index}" class="icofont icofont-ui-close"></i>
                                                      </a>
                                                  </form>`;
                                      },
                                    },
                                    {
                                      data: "business_units",
                                      render: function (data) {
                                        return data[0]?.fee_type ? data[0].fee_type.slice(0, 1).toUpperCase() + data[0].fee_type.slice(1).toLowerCase() : "Company";
                                      },
                                    }
                                  ];
  
  //Staff Datatable
  var staffTable = $("#staffTable").DataTable({
    searching: false,
    serverSide: true,
    processing: true,
    order: [1, "asc"],
    ordering: true,
    language: {
      loadingRecords: "&nbsp;",
      processing: '<div class="spinner"></div>',
    },
    ajax: {
      type: "POST",
      url: "/get-registered-staff",
      data: function (d) {
        var info = $("#staffTable").DataTable().page.info();
        d.company_id = idCompany;
        d.searchKey = searchKey;
        d.page = info.page;
        d.pageSize = info.length;
        d.isActive = isActive;
        d._csrf = token;
      },
      dataSrc: "result",
      dataFilter: function (data) {
        var json = $.parseJSON(data);
        currentStaff = json.currentStaff;
        var info = $("#staffTable").DataTable().page.info();
        if (info.page == 0) {
          total = json.totalItems;
        }
        json.recordsFiltered = total;
        json.recordsTotal = total;
        if (total == 0) {
          $('#jsExportRegistered').addClass('disabled');
        } else {
          $('#jsExportRegistered').removeClass('disabled');
        }
        return JSON.stringify(json);
      },
    },
    columnDefs: [
      {
        orderable: false,
        targets: [0, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      }, //Don't order the action column
    ],
    columns: systemCode === "ASTUTE" ? [...columnsAstuteTableRegisteredStaff] : [...columnsCommonTableRegisteredStaff]
  });
  //Staff Invitation Datatable
  let staffInviteTable = $("#staffInviteTable").DataTable({
    searching: false,
    serverSide: true,
    processing: true,
    order: [1, "asc"],
    ordering: true,
    language: {
      loadingRecords: "&nbsp;",
      processing: '<div class="spinner"></div>',
    },
    ajax: {
      type: "POST",
      url: "/get-unregistered-staff",
      data: function (d) {
        var info = $("#staffInviteTable").DataTable().page.info();
        d.is_invited = InvitesType === "INVITES_SENT" ? 1 : 0;
        d.company_id = idCompany;
        d.searchKey = searchKey;
        d.page = info.page;
        d.pageSize = info.length;
        d._csrf = token;
        d.startDate = startDateSelect ? startDateSelect.format('YYYY-MM-DD') : '';
        d.endDate = endDateSelect ? endDateSelect.format('YYYY-MM-DD') : '';
      },
      dataSrc: "result",
      dataFilter: function (data) {
        var json = $.parseJSON(data);
        staffList = json.result;
        checkDataCheckbox = true;
        var info = $("#staffInviteTable").DataTable().page.info();
        if (info.page == 0) {
          totalUnregister = json.recordsFiltered;
        }
        json.recordsFiltered = totalUnregister;
        json.recordsTotal = totalUnregister;
        if (totalUnregister == 0) {
          $('#jsExportStaffInvited').addClass('disabled')
        } else {
          $('#jsExportStaffInvited').removeClass('disabled')
        }
        return JSON.stringify(json);
      },
    },
    columnDefs: [
      {
        orderable: false,
        targets: [0, 3, 4, 5, 6, 7, 8],
      }, //Don't order the action column
    ],
    columns: [
      {
        data: null,
        render: function (data, type, full, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        },
      },
      {
        data: "first_name",
        render: function (data) {
          return data ? data : "N/A";
        },
      },
      {
        data: "last_name",
        render: function (data) {
          return data ? data : "N/A";
        },
      },
      {
        data: "start_date",
        render: function (data) {
          return data ? moment(data).format("DD-MM-YYYY") : "N/A";
        },
      },
      {
        data: "email",
        render: function (data) {
          return data ? data : "N/A";
        },
      },
      {
        data: null,
        render: function (data) {
          return "Employee";
        },
      },
      {
        data: "salary_wag",
        render: function (data) {
          const employeeType = checkSalaryWag(data);
          return employeeType;
        },
      },
      {
        data: "suburb",
        render: function (data) {
          return data ? data : "N/A";
        },
      },
      {
        data: null,
        render: function (data, type, row, meta) {
          let element = `<div ${
            row.email ? "" : "hidden"
          } class="form-login-checkbox-cus">
                  <input class="form-login-checkbox_box checkbox-staff" name="staffItem" type="checkbox" value='${JSON.stringify(
                    row
                  )}'/>
                  <span ${
                    row.is_invited > 0 ? "" : "hidden"
                  } class="form-login-checkbox_checkmark align-text-bottom sent-icon">|
                    <i class="icofont icofont icofont-paper-plane text-success"></i>
                  </span>
                </div>`;
          staffListInvite.forEach((item) => {
            if (item._id == row._id) {
              element = `<div ${
                row.email ? "" : "hidden"
              } class="form-login-checkbox-cus">
                      <input checked class="form-login-checkbox_box checkbox-staff" name="staffItem" type="checkbox" value='${JSON.stringify(
                        row
                      )}'/>
                      <span ${
                        row.is_invited > 0 ? "" : "hidden"
                      } class="form-login-checkbox_checkmark align-text-bottom sent-icon">|
                        <i class="icofont icofont icofont-paper-plane text-success"></i>
                      </span>
                    </div>`
            }
          });
          return element;
        },
      },
    ],
    rowCallback: function (row, data) {
      // var element = $(row).find(".checkbox-staff");
      // element.on("change", function () {
      //   let count = $(".checkbox-staff:checked").length;
      //   $(".countEmp").html("(" + count + ")");
      //   if (count > 0) {
      //     $("#jsInvite").prop("disabled", false);
      //   } else {
      //     $("#jsInvite").prop("disabled", true);
      //   }
      //   $(this).each(function (index, input) {
      //     if (input.checked) {
      //       staffListInvite.push(data);
      //     } else {
      //       staffListInvite.splice(index, 1);
      //     }
      //   });
      // });
      // staffListInvite.forEach((item) => {
      //   if (item._id == data._id) $(this).prop("checked", true);
      // });
    },
  });
  $("#staffInviteTable_wrapper .row:first-child div:nth-child(1)")
    .removeClass("col-xs-12 col-sm-12 col-sm-12 col-md-6")
    .addClass("col-xs-3 col-sm-3 col-md-3");
  //add btn filter
  $("#staffInviteTable_wrapper .row:first-child > div:nth-child(1)").addClass("d-none");
  //add invite group button
  $("#staffInviteTable_wrapper .row:first-child > div:nth-child(2)")
    .append(
      `<div class="row">
        <div class="col-sm-auto mb-1 pr-0">
          <div style="height: 100%;">
            <div style="padding: 7px 10px;" id="staff_dateranger" class="pull-left">
              <i style="font-size: 15px;" class="icofont icofont-calendar"></i>&nbsp;
              <span></span> <div class="float-right"><b class="icofont icofont-caret-down"></b></div>
            </div>
            <a hidden style="margin-top: 4px;" class="btn btn-mini btn-outline-danger btn-refresh-ts ml-1">
              <i class="icofont icofont-close"></i>
            </a>
          </div>
        </div>
        <div class="col-sm-auto mb-1 pr-0">
          <button style="padding: 8px 19px;" title="Exports data staffs invited to excel" class="btn btn-primary" id="jsExportStaffInvited">
            <i class="icofont-file-excel"></i>
            Export data
          </button>
        </div>
        <div class="col-sm-auto mb-1 pr-0">
          <select id="jsFilterInvites" style="max-width: 200px; padding-top: 10px; padding-bottom: 10px;" class="form-controller">
            <option value="ALL">All</option>
            <option value="INVITES_SENT">Unaccepted Invitations</option>
          </select>
        </div>
        <div class="col-md-auto mb-1 pr-0">
          <form style="width: 220px;" id="jsStaffInvitationSearch">
            <div class="input-group mb-0">
                <input style="min-width: 100px;" name="staff-invitation-name" type="text" class="form-control" placeholder="Search this name">
                <div class="input-group-append">
                <button style="padding: 8px 19px;" class="btn btn-secondary" type="submit">
                    <i class="icofont icofont-ui-search"></i>
                </button>
                </div>
            </div>
          </form>
        </div>
        <div class="col-sm-auto pr-0 mb-1">
          <button disabled id="jsInvite" class="btn btn-primary btn-invite--custom">Invite <span class="countEmp">(0)</span></button>
        </div>
        <div class="col-sm-auto pr-0 mb-1">
          <button id="jsInviteAll" class="btn btn-warning btn-invite--custom">Invite All</button>
        </div>
        <div class="col-sm-auto mb-1 pr-0">
          <button id="jsInvitesStaff" class="btn btn-success btn-invite--custom">Load File</button>
        </div>
      </div>`)
    .addClass("col-xs-12 col-sm-12 col-md-12 pl-0");

  // filter invites
  $(document).on("change", "#jsFilterInvites", () => {
    InvitesType = $("#jsFilterInvites").val();
    staffInviteTable.ajax.reload();
  });
  //open modal list staff invite
  $("#jsInvite").click(function () {
    staffListInvite.forEach((item) => {
      let salaryWag = checkSalaryWag(item.salary_wag),
        startDate = item.start_date
          ? moment(item.start_date).format("DD-MM-YYYY")
          : "N/A";

      $("#listStaffInvite tbody").append(
        `<tr>
        <td>${item.fullname}</td>
        <td>${item.email ? item.email : "N/A"}</td>
        <td>${salaryWag}</td>
        <td>${startDate}</td>
        <td>
          <div class="form-login-checkbox-cus">
            <input checked class="form-login-checkbox_box checkbox-staff--checked" name="staffItem" type="checkbox" value='${JSON.stringify(
              item
            )}'/>
            <span class="form-login-checkbox_checkmark align-text-bottom sent-icon">
            </span>
          </div>
        </td>
      </tr>`
      );
    });
    $("#jsModalListStaffInvite").modal({
      backdrop: false,
      keyboard: false,
      show: true,
    });
    $(".checkbox-staff--checked").each((index, inputChecked) => {
      let valueEmpChecked = JSON.parse(inputChecked.defaultValue);
      //check staff invited after submit
      $(inputChecked).on("change", function () {
        if (inputChecked.checked) {
          staffListInvite.push(valueEmpChecked);
        } else {
          staffListInvite.forEach((item, index) => {
            if (item._id == valueEmpChecked._id) {
              staffListInvite.splice(index, 1);
            }
          });
        }
        $(".checkbox-staff").each(function (index, input) {
          let valueEmp = JSON.parse(input.defaultValue);
          if (inputChecked.checked) {
            if (valueEmp._id == valueEmpChecked._id) {
              $(input).prop("checked", true);
            }
          } else {
            if (valueEmp._id == valueEmpChecked._id) {
              $(input).prop("checked", false);
            }
          }
        });
        let count = staffListChangeStatus.length;
        $(".countEmp").html("(" + count + ")");
      });
    });
  });
  //open modal check invite all staff
  $(document).on("click", "#jsInviteAll", function () {
    if (staffList.length > 0) {
      $("#jsModalCheckInviteAll").modal({
        backdrop: false,
        keyboard: false,
        show: true,
      });
      $(".checkbox-staff").prop("checked", true);
    } else {
      showToast("warning", "No employee found");
    }
  });

  //open modal invites staff
  $(document).on("click", "#jsInvitesStaff", function () {
    $("#jsModalCheckInvites").modal({
      backdrop: false,
      keyboard: false,
      show: true,
    });
    $("#file").val("");
  });

  //cancel remove item
  $(".close-modal").click(function () {
    $("#listStaffInvite tbody tr").remove();
  });
  //submit staff list invited
  $("#submit-invite").click(function () {
    showLoading();
    sendDataInvite(0, staffListInvite);
  });
  //submit all staff
  $("#submit-invite-all").click(function () {
    showLoading();
    const staffListFilter = staffList.filter((item) => item.email);
    sendDataInvite(1, staffListFilter);
  });
  //edit event
  $("#staffTable tbody").on("click", "a.detail-edit", function () {
    $("#staffTable tbody").find('form a.detail-cancel').each(function() {
      if (!$(this).is(":hidden")) {
        $(this).trigger( "click" );
      }
    });
    var tr = $(this).closest("tr");
    var row = staffTable.row(tr);
    const idStaff = row.data()._id;
    if ($(`#wallet_${idStaff}`).is(':checked')) {
      $(this).parent().find('span.editable-clear-x').attr("hidden", true);
    } else {
      $(this).parent().find('span.editable-clear-x').attr("hidden", false);
    }
    $(`#wallet_${idStaff}`).prop("disabled", false).removeClass('disabled');
    $(`#edit_${idStaff}`).attr("hidden", true);
    $(`#cancel_${idStaff}`).attr("hidden", false);
    $(`#save_${idStaff}`).attr("hidden", false);
    $(`#moneymod_${idStaff}`).prop("disabled", false);
    $(`#money_${idStaff}`).prop("disabled", false);
    $(`#min_${idStaff}`).prop("disabled", false);
    document.getElementById('jsStaffDiv').scroll(1000, 0);
  });
  //change support
  $("#staffTable tbody").on("click", "a.jsActiveSupport", function () {
    var tr = $(this).closest("tr");
    var row = staffTable.row(tr);
    const idStaff = row.data()._id;
    const isSupport = row.data().is_support;
    showLoading();
      $.ajax({
        dataType: "json",
        method: "POST",
        url: `/admin/staffs/support`,
        data: {
          _csrf: token,
          is_support: !isSupport,
          owner_staff_id: idStaff
        },
        success: function (responsive) {
          if (responsive.success) {
            showToast("success", "Update successfully.");
            staffTable.ajax.reload();
          } else {
            showToast("error", "Can not connect to server. Please try again.");
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
  });

  //cancel event
  $("#staffTable tbody").on("click", "a.detail-cancel", function () {
    $(this).parent()[0].reset();
    if ($(this).parent().find('input').val() >= 0) {
      var tr = $(this).closest("tr");
      var row = staffTable.row(tr);
      const idStaff = row.data()._id;
      var $parent = $(this).parent();
      $(`#save_${idStaff}`).removeClass("disabled");
      $parent.find('.form-set-detail-input').css("border-color", "black");
      $parent.find('.form-set-detail-input').css("color", "black");
      if ($(`#wallet_${idStaff}`).is(":checked")) {
        $parent.find('div.input-withdrawal label').attr("hidden", true);
        $parent.find('div.input-withdrawal input').attr("hidden", true);
        $parent.find('span.text-wallet').attr("hidden", false);
        $parent.find('span.editable-clear-x').attr("hidden", true);
      } else {
        $parent.find('div.input-withdrawal label').attr("hidden", false);
        $parent.find('div.input-withdrawal input').attr("hidden", false);
        $parent.find('span.text-wallet').attr("hidden", true);
        $parent.find('span.editable-clear-x').attr("hidden", false);
      }
      changeCancel(idStaff);
    }
  });
  //save event
  $("#staffTable tbody").on("click", "a.detail-save", function (e) {
    showLoading();
    var $element = $(this).parent();
    var tr = $(this).closest("tr");
    var row = staffTable.row(tr);
    const idStaff = row.data()._id;
    const limit_money = Number($("input[name='limit_money']").val());
    const limit_allowable_percent_drawdown = Number(
      $("input[name='limit_allowable_percent_drawdown']").val()
    );
    const staffMoney = $(`input[name='staff_limit_money']`);
    const staffDrawdown = $(
      `input[name='staff_limit_allowable_percent_drawdown']`
    );
    const staff_limit_allowable_percent_drawdown = $(`#moneymod_${idStaff}`);
    const staff_limit_money = $(`#money_${idStaff}`);
    const staff_min_withdrawal = $(`#min_${idStaff}`);
    const is_wallet = $(`#wallet_${idStaff}`);
    var sumStaffMoney = 0;
    var sumStaffDrawdown = 0;
    staffMoney.each(function () {
      sumStaffMoney = sumStaffMoney + Number($(this).val());
    });
    staffDrawdown.each(function () {
      if (Number($(this).val()) > sumStaffDrawdown) {
        sumStaffDrawdown = Number($(this).val());
      }
    });
    if ((staff_limit_money.val() == null || staff_limit_money.val() < 0 || staff_limit_money.val() == "") && !is_wallet.is(':checked')) {
      e.preventDefault();
      isSubmit = false;
      hidenLoading();
      showToast(
        "error",
        "Maximum $ withdrawal must be greater than $0."
      );
      return;
    }
    //validate input
    if (sumStaffMoney > limit_money) {
      isSubmit = false;
      hidenLoading();
      showToast(
        "warning",
        "The total financial limit for the employee must be less than the total financial limit for the company."
      );
      return;
    }
    if (sumStaffDrawdown > limit_allowable_percent_drawdown) {
      isSubmit = false;
      hidenLoading();
      showToast(
        "warning",
        "The withdrawal percentage limit for the employee must be lower than the company's withdrawal percentage limit."
      );
      return;
    }
    if (staff_min_withdrawal.val() < 0 || staff_min_withdrawal.val() == "") {
      isSubmit = false;
      hidenLoading();
      showToast("warning", "Minimum $ withdrawal must be greater than $0");
      return;
    }

    var formData = {
      _csrf: token,
      _id: idStaff,
      limit_allowable_percent_drawdown: staff_limit_allowable_percent_drawdown.val(),
      min_withdrawal: staff_min_withdrawal.val()
    };
    if (is_wallet.is(':checked')) {
      formData.is_limit_money_max_wallet = true;
    } else {
      formData.limit_money = staff_limit_money.val();
      formData.is_limit_money_max_wallet = false;
    }

    $.ajax({
      method: "post",
      url: `/admin/edit-limit-staff/${idCompany}`,
      data: formData
    })
      .done(function (response) {
        if (!response.success && response.errorCode == "LOGIN_AGAIN") {
          loginAgain();
          return;
        }
        if (response.status == 200) {
          var index = $element.find('i').attr('data-index-number');
          $element.parent().html(`<form class="form-set-detail">
          <div class="form-set-detail-input">
            <label for="">$</label>
            <input data-toggle="tooltip" title="Minimum withdrawal per transaction" class="allowable" id="${
              "min_" + idStaff
            }" name="staff_min_withdrawal" min="1" style="max-width: 55px;" disabled value="${
              response.data.min_withdrawal ? response.data.min_withdrawal : 1
            }">
          </div>
          <div class="form-set-detail-input">
            <label for="">%</label>
            <input data-toggle="tooltip" title="Limit % of salary / pay period" class="allowable" id="${
              "moneymod_" + idStaff
            }" name="staff_limit_allowable_percent_drawdown" min="0" style="max-width: 55px;" disabled value="${
              response.data.limit_allowable_percent_drawdown
                ? response.data.limit_allowable_percent_drawdown
                : 0
            }">
          </div>
          <div style="width: 48px; margin-top: 0!important;" class="d-flex justify-content-end align-items-center mr-2">
            <input disabled title="Max wallet" id="${"wallet_" + idStaff}" class="btn-switch-small disabled" ${formData.is_limit_money_max_wallet ? "checked" : ''} type="checkbox">
          </div>
          <div class="form-set-detail-input input-withdrawal">
            <span ${formData.is_limit_money_max_wallet ? "" : "hidden"} class="text-wallet">Wallet</span>
            <label ${formData.is_limit_money_max_wallet ? "hidden" : ""} for="">$</label>
            <input ${formData.is_limit_money_max_wallet ? "hidden" : ""} data-toggle="tooltip" title="Maximum withdrawal / pay period" class="money" id="${
              "money_" + idStaff
            }" name="staff_limit_money" style="width: 100%;" disabled value="${
              response.data.limit_money ? response.data.limit_money : 0
            }">
            <a style="font-size: 11px; padding-right: 3px;" id="${
              "edit_" + idStaff
            }" class="detail-edit" title="edit">
              <i data-index-number="${index}" class="icofont icofont-edit-alt"></i>
            </a>
            <span hidden class="editable-clear-x"></span>
          </div>
          <a hidden class="btn btn-primary btn-mini ml-2 detail-save" id="${
            "save_" + idStaff
          }" title="save">
          <i style="font-size: 12px;color: #fff;" data-index-number="${index}" class="icofont icofont-ui-check"></i>
          </a>                                                                                
          <a hidden id="${
            "cancel_" + idStaff
          }" type="reset" class="btn btn-secondary btn-mini ml-1 detail-cancel" title="cancel">
          <i style="font-size: 12px;" data-index-number="${index}" class="icofont icofont-ui-close"></i>
          </a>
      </form>`);
          hidenLoading();
          showToast("success", "Updated successfully.");
          return;
        } else {
          hidenLoading();
          showToast("error", "Update Failed.");
          return;
        }
      })
      .fail(function (xhr) {
        console.log(xhr.responseText);
        hidenLoading();
      });
  });

  $("#staffTable tbody").on('click', "span.editable-clear-x", function () {
    $(this).parent().find('input').val('');
  });

  $("#staffTable tbody").on('change', "input.btn-switch-small", function () {
    var $div = $(this).parent().parent();
    if ($(this).is(":checked")) {
      $div.find('div.input-withdrawal label').attr("hidden", true);
      $div.find('div.input-withdrawal input').attr("hidden", true);
      $div.find('span.text-wallet').attr("hidden", false);
      $div.find('span.editable-clear-x').attr("hidden", true);
    } else {
      $div.find('div.input-withdrawal label').attr("hidden", false);
      $div.find('div.input-withdrawal input').attr("hidden", false);
      $div.find('span.text-wallet').attr("hidden", true);
      $div.find('span.editable-clear-x').attr("hidden", false);
    }
  });

  $("#staffTable tbody").on("keyup", "input", function (e) {
    var tr = $(this).closest("tr");
    var row = staffTable.row(tr);
    const idStaff = row.data()._id;
    let idInput, condition;

    if (e.target.id.includes("moneymod")) {
      idInput = $(`#moneymod_${idStaff}`).parent();
      condition = $(`#moneymod_${idStaff}`)
        .val()
        .match(/^[0-9]+$/g);
    } else if (e.target.id.includes("min")) {
      idInput = $(`#min_${idStaff}`).parent();
      condition = $(`#min_${idStaff}`)
        .val()
        .match(/^[0-9]+[\.]?[0-9]?[0-9]?$/g);
    } else {
      idInput = $(`#money_${idStaff}`).parent();
      condition = $(`#money_${idStaff}`)
        .val()
        .match(/^[1-9]+[\.]?[0-9]?[0-9]?$/g);
    }
    if (idInput) {
      if (condition) {
        $(`#save_${idStaff}`).removeClass("disabled");
        idInput.css("border-color", "black");
        idInput.css("color", "black");
      } else {
        $(`#save_${idStaff}`).addClass("disabled");
        idInput.css("border-color", "red");
        idInput.css("color", "red");
      }
    }
  });

  //cancel event
  $("#staffTable tbody").on("click", "a.detail-change-role", function () {
    var tr = $(this).closest("tr");
    var row = staffTable.row(tr);
    const staffId = row.data()._id;
    let html = `
    <input hidden id="staffIdRole" value="${staffId}" />
    <input
        type="checkbox"
        class="cb-change-role"
        ${!row.data().role || row.data().role == 'null' ? "checked" : ""}
        value="null" />
    <span>Employee</span>
    <br><br>
    <input
        type="checkbox"
        class="cb-change-role"
        ${row.data().role == "SUPERVISOR" ? "checked" : ""}
        value="SUPERVISOR" />
    <span>Supervisor</span>`;

    $("#jsModalChangeRole .modal-body").html(html);
    $("#jsModalChangeRole").modal("show");
  });

  $(document).on("change", ".cb-change-role", function (e) {
    $('.cb-change-role').each(function () {
      this.checked = false;
    });
    var target = $(e.target);
    target.prop("checked", true);
    role = target[0].defaultValue;
  });

  //change role
  $(".btn-change-role").on("click", () => {
    showLoading();
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/admin/change-role/${$('#staffIdRole').val()}`,
      data: {
        role: role,
        _csrf: token,
      },
      async: true,
      success: function (data) {
        staffTable.ajax.reload(null, false);
        showToast("success", "Changed role successfully.");
        hidenLoading();
        $("#jsModalChangeRole").modal("hide");
        $("#jsModalChangeRole .modal-body").html('');
        role = null;
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  });

  function checkSalaryWag(salaryWag) {
    let employeeType;
    if (systemCode === "DEPUTY") {
      employeeType = "Timesheet";
    } else {
      if (salaryWag === 2) {
        employeeType = "Timesheet";
      } else if (salaryWag === 3) {
        employeeType = "Salary & TimeSheet";
      } else {
        employeeType = "Salary";
      }
    }
    return employeeType;
  }

  function changeCancel(idStaff) {
    $(`#edit_${idStaff}`).attr("hidden", false);
    $(`#edit_${idStaff}`).parent().find('span.editable-clear-x').attr("hidden", true);
    $(`#cancel_${idStaff}`).attr("hidden", true);
    $(`#save_${idStaff}`).attr("hidden", true);
    $(`#moneymod_${idStaff}`).prop("disabled", true);
    $(`#min_${idStaff}`).prop("disabled", true);
    $(`#money_${idStaff}`).prop("disabled", true);
    $(`#wallet_${idStaff}`).prop("disabled", true).addClass('disabled');
  }

  function sendDataInvite(statusInvite, staffList) {
    const dataStaffInvited = {
      systemCode: systemCode,
      company: company,
      staffList: staffList,
      statusInvite: statusInvite,
    };

    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/send-invite-employee`,
      data: {
        dataStaffInvited: JSON.stringify(dataStaffInvited),
        _csrf: token,
      },
      async: true,
      success: function (data) {
        if (!data.success && data.errorCode == "LOGIN_AGAIN") {
          loginAgain();
          return;
        }
        const count = $(".countEmp").html().replace(/[()]/g, "");
        $(".txt-total-invitation").html(
          (Number($(".txt-total-invitation").html()) + Number(count)).toString()
        );

        $(".checkbox-staff").each(function (index, input) {
          if (input.checked) {
            $(input).parent().find(".sent-icon").attr("hidden", false);
          }
        });
        statusInvite === 0
          ? $("#jsModalListStaffInvite").modal("hide")
          : $("#jsModalCheckInviteAll").modal("hide");
        $("#listStaffInvite tbody tr").remove();
        staffListInvite = [];
        staffInviteTable.ajax.reload();
        $("#jsInvite").attr("disabled", true); 
        $(".countEmp").html("(" + staffListInvite.length + ")");
        hidenLoading();
        showToast("success", "Invitations sent.");
        return true;
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  }

  function setFooterTable(mode) {
    let nameMode, nameLength;
    if (mode == 1) {
      nameMode = "#staffTable_wrapper";
      nameLength = "#staffTable_length";
    } else {
      nameMode = "#staffInviteTable_wrapper";
      nameLength = "#staffInviteTable_length";
    }
    let divLength = $(
      `${nameMode} .row:first-child div:nth-child(1) ${nameLength}`
    )
      .addClass("pagination--custom")
      .removeClass("col-xs-3 col-sm-3 col-md-3");
    $(`${nameMode} > .row:last-child div`).first().append(divLength);
  }

  setFooterTable(1);

  $("#jsStaff").on("click", () => {
    setFooterTable(1);
  });

  $("#jsStaffInvitation").on("click", () => {
    setFooterTable(0);
  });

  $("#jsStaffSearch").on("submit", (event) => {
    event.preventDefault();
    searchKey = $('#jsStaffSearch input[name="staff-name"]').val();
    staffTable.ajax.reload();
  });

  $("#jsStaffInvitationSearch").on("submit", (event) => {
    event.preventDefault();
    searchKey = $('input[name="staff-invitation-name"]').val();
    staffInviteTable.ajax.reload();
  });
  // Read file staff
  document
    .getElementById("file")
    .addEventListener("change", handleFileSelect, false);

  $("input[name='match_by'").on("click", function () {
    matchBy = $('input[name="match_by"]:checked').val();
  });

  var ExcelToJSON = function () {
    this.parseExcel = function (file) {
      var reader = new FileReader();

      reader.onload = function (e) {
        staffListEmail = [];
        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: "binary"
        });

        workbook.SheetNames.forEach(function (sheetName) {
          // Here is your object
          let XL_row_object = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],{defval:""});
          if (XL_row_object && XL_row_object.length > 0) {
            totalEmployeeFromFile = XL_row_object.length;
            let XL_row_object_first = XL_row_object[0];
            console.log('check XL_row_object 1', XL_row_object)
            if (XL_row_object_first.hasOwnProperty('Business Unit')&& XL_row_object_first.hasOwnProperty('Email') 
              && XL_row_object_first.hasOwnProperty('Employer ID') && XL_row_object_first.hasOwnProperty('First Name') 
              && XL_row_object_first.hasOwnProperty('Last Name') && XL_row_object_first.hasOwnProperty('Mobile Phone') 
              && XL_row_object_first.hasOwnProperty('Payroll Employee ID')
            ) {
              $('#jsSubmitFileInvites').attr("disabled", false);
              XL_row_object.forEach((element) => {
                element.Email = element.Email?.trim();
                employeeFromEmail[element.Email.toLowerCase()] = element;
                if (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(element.Email.toLowerCase())) {
                  if (checkIsHudson()) {
                    if (company.system_cm_cid && element.hasOwnProperty('Employer ID') && element["Employer ID"] == company.system_cm_cid) {// && element["Business Unit"] == "FLEXHIVE"
                      staffListEmail = [
                        ...staffListEmail,
                        element,
                      ];
                    } else {
                      employeesNotMatched.push({"email": element.Email.toLowerCase()});
                    }
                  } else {
                    staffListEmail = [
                      ...staffListEmail,
                      element.Email.toLowerCase(),
                    ]; 
                  }
                } else {
                  employeesNotMatched.push({"email": element.Email.toLowerCase()});
                }
              });
            } else {
              showErrorInvite("Please choose the correct file format.");
            }
          } else {
            showErrorInvite("Please select the file with data.");
          }
        });
      };

      reader.onerror = function (ex) {
        console.log(ex);
      };

      reader.readAsBinaryString(file);
    };
  };

  function checkIsHudson() {
    if (
      company._id === '6304730a3d2dcc2f974319a1' && location.host === 'localhost:4001'
      || company._id === '6304730a3d2dcc2f974319a1' && location.host === 'dev.web.cashd.com.au'
      || company._id === '630446724fc9d238548417e3' &&  location.host === 'test.web.cashd.com.au' 
      || company._id === '630819f0309856166b274964' &&  location.host === 'web.cashd.com.au'
    ) {
      return true;
    } else {
      return false;
    }
  }

  function showErrorInvite(message) {
    showToast("error", message);
    $("#file").val("");
    $('#jsSubmitFileInvites').attr("disabled", true);
  }

  function handleFileSelect(event) {
    var files = event.target.files; // FileList object
    employeesNotMatched = [];
    employeeFromEmail = {};
    staffListEmail = [];
    if (!files[0]) {
      showToast("error", "Please add file.");
    }
    if (files[0].name.split('.').pop() == "xls" || files[0].name.split('.').pop() == "xlsx") {
      let xl2json = new ExcelToJSON();
      xl2json.parseExcel(files[0]);
    } else {
      showErrorInvite("Sorry, file is invalid, allowed extensions are: .xls, .xlsx");
    }
  }

  // add data table
  var staffInvitesTable = $("#jsStaffInvitesTable").DataTable({
    searching: false,
    serverSide: true,
    processing: true,
    pageLength: 5,
    ordering: false,
    lengthMenu: [
      [5, 10, 25, 50, 100],
      [5, 10, 25, 50, 100],
    ],
    scrollY: "50vh",
    "scrollX": true,
    scrollCollapse: true,
    language: {
      loadingRecords: "&nbsp;",
      processing: '<div class="spinner"></div>',
    },
    ajax: {
      type: "POST",
      url: "/invite-staffs",
      data: function (d) {
        var info = $("#jsStaffInvitesTable").DataTable().page.info();
        d.company_id = idCompany;
        d.match_by_list = JSON.stringify(staffListEmail);
        d.match_by = matchBy;
        d.page = info.page;
        d.pageSize = info.length;
        d._csrf = token;
        d.isHudson = checkIsHudson();
      },
      dataSrc: "result",
      dataFilter: function (data) {
        var json = $.parseJSON(data);
        json.recordsFiltered = json.totalItems;
        json.recordsTotal = json.totalItems;
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
        data: "first_name",
        render: function (data) {
          return data ? data : "N/A";
        },
      },
      {
        data: "last_name",
        render: function (data) {
          return data ? data : "N/A";
        },
      },
      {
        data: "email",
        render: function (data) {
          return data ? data : "N/A";
        },
      },
      {
        data: null,
        render: function (data) {
          return "Employee";
        },
      },
      {
        data: "salary_wag",
        render: function (data) {
          const employeeType = checkSalaryWag(data);
          return employeeType;
        },
      },
      {
        data: "suburb",
        render: function (data) {
          return data ? data : "N/A";
        },
      },
      {
        data: "start_date",
        render: function (data) {
          return data ? moment(data).format("DD-MM-YYYY") : "N/A";
        },
      },
      {
        data: null,
        render: function (data, type, row, meta) {
          return `<div ${
            row.email ? "" : "hidden"
          } class="form-login-checkbox-cus" style="padding-top: 2px;">
                    <input class="form-login-checkbox_box checkbox-staffs" name="staffItem" type="checkbox" checked value='${JSON.stringify(
                      row
                    )}'/>
                    <span ${
                      row.is_invited > 0 ? "" : "hidden"
                    } class="form-login-checkbox_checkmark align-text-bottom sent-icon">|
                      <i class="icofont icofont icofont-paper-plane text-success"></i>
                    </span>
                  </div>`;
        },
      },
    ],
    rowCallback: function (row, data) {
      var element = $(row).find(".checkbox-staffs");
      element.on("change", function () {
        $(this).each(function (index, input) {
          if (input.checked) {
            staffListEmailInvite.push(data);
          } else {
            staffListEmailInvite.splice(index, 1);
          }
        });
      });
      staffListEmailInvite.forEach((item) => {
        if (item._id == data._id) $(this).prop("checked", true);
      });
    },
  });

  //add invite group button modal
  //   $("#jsStaffInvitesTable_wrapper .row:first-child div:nth-child(2)").append(`
  //   <div class="d-flex justify-content-end">
  //     <p>Invite <span class="countEmp1">(0)</span></p>
  //   </div>
  // `);

  // table employees not match
  let employeesNotMatch = $("#listEmployeesNotMatched").DataTable({
    searching: false,
    serverSide: false,
    processing: true,
    pageLength: 5,
    ordering: false,
    lengthMenu: [
      [5, 10, 25, 50, 100],
      [5, 10, 25, 50, 100], 
    ],
    language: {
      loadingRecords: "&nbsp;",
      processing: '<div class="spinner"></div>',
    },
    data: employeesNotMatched,
    columns: [
      {
        data: null,
        render: function (data, type, full, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        },
      },
      {
        data: "email",
        render: function (data) {
          return data ? data : "N/A";
        },
      },
      {
        data: "email",
        render: function (data) {
          return employeeFromEmail[data]['Payroll Employee ID'] ?? "N/A";
        },
      },
    ]
  });

  $(document).on("click", "#jsSubmitFileInvites", function () {
    showLoading();
    if (matchBy == "EMAIL" && staffListEmail.length > 0) {
      staffListEmailInvite = [];
      $("#jsModalCheckInvites").modal("hide");

      $('#listEmployeesNotMatched_wrapper').show();

      if (!checkIsHudson()) {
        $("#jsShowInfoStaff").modal({
          backdrop: false,
          keyboard: false,
          show: true,
        });
      }

      $("#jsStaffInvitesTable_wrapper .row:nth-child(3)").css({
        "margin-top": "20px",
      });

      let divLength = $(
        `#jsStaffInvitesTable_wrapper .row:first-child div:nth-child(1) #jsStaffInvitesTable_length`
      ).addClass("pagination--custom");
      $(`#jsStaffInvitesTable_wrapper .row:last-child div`)
        .first()
        .append(divLength);
      staffInvitesTable.ajax.reload(function (data) {
        let employeesMatched = {};
        if (data.allStaffUnregistered.length > 0) {
          data.allStaffUnregistered.forEach(item => employeesMatched[item.email.toLowerCase()] = {item});
        }
        employeesNotMatched = [...employeesNotMatched];
        staffListEmail.forEach(item => {
          if (!company.system_cm_cid) {
            if (!employeesMatched[item.toLowerCase()] && !data.employeesRegistered?.find(({email}) => email == item)) {
              employeesNotMatched.push({"email": item.toLowerCase()});
            }
          }
          if (!checkIsHudson() && company.system_cm_cid) {
            employeesNotMatched.push({"email": item.toLowerCase()});
          }
        });

        $('#jsTotalEmployees').html(`
          <b>${totalEmployeeFromFile || 0}</b> Employees found
        `);

        $('#jsNumberEmployeesMatched').html(`
          <b>${data.totalItems || 0}</b> Invited
        `);

        $('#jsTotalAlreadyRegistered').html(`
          <b>${data.totalEmployeesRegistered || 0}</b> Already registered
        `);

        $('#jsShowTheResultOfUploadFile').modal({
          backdrop: false,
          keyboard: false,
          show: true,
        });
        if (employeesNotMatched.length > 0) {
          $('#jsNumberEmployeesNotMatched').html(`
            <b>${employeesNotMatched.length}</b> Invalid emails:
          `);
          reloadTableNotMatch(employeesNotMatched);
        } else {
          $('#jsNumberEmployeesNotMatched').html(`
            <b>0</b> Invalid email
          `);

          $('#listEmployeesNotMatched_wrapper').hide();
        }

        staffListEmailInvite = data.allStaffUnregistered;
        $('#jsSubmitFileInvites').attr("disabled", true);
        if (checkIsHudson() && staffListEmailInvite.length > 0) {
          $('#jsBtnInvites').trigger( "click" );
        }
      });

    } else if (employeesNotMatched.length > 0) {
      $('#jsShowTheResultOfUploadFile').modal({
        backdrop: false,
        keyboard: false,
        show: true,
      });

      $('#jsTotalEmployees').html(`
        <b>${employeesNotMatched.length}</b> Employees found
      `);

      $('#jsNumberEmployeesMatched').html(`
        <b>0</b> Invited
      `);

      $('#jsTotalAlreadyRegistered').html(`
        <b>0</b> Already registered
      `);

      $('#jsNumberEmployeesNotMatched').html(`
        <b>${employeesNotMatched.length}</b> Invalid emails:
      `);
      reloadTableNotMatch(employeesNotMatched);
    } 
    else {
      showErrorInvite("Please select the file with data.");
    }
    setTimeout(() => {
      staffInvitesTable.ajax.reload();
      hidenLoading();
    }, 1000);
    return;
  });

  function reloadTableNotMatch(value) {
    employeesNotMatch.clear();
    employeesNotMatch.rows.add(value);
    employeesNotMatch.draw();

    $("#listEmployeesNotMatched_wrapper .row:nth-child(3)").css({
      "margin-top": "20px",
      "flex-flow":  "column",
    });

    $("#listEmployeesNotMatched_wrapper .row:nth-child(3) div:nth-child(1)").removeClass('col-md-5');
    $("#listEmployeesNotMatched_wrapper .row:nth-child(3) div:nth-child(2)").removeClass('col-md-7');
    $("#listEmployeesNotMatched_wrapper .row:nth-child(3) div:nth-child(2) div#listEmployeesNotMatched_paginate").css({
      "height": "",
      "float": "left;",
    });

    let divLength = $(
      `#listEmployeesNotMatched_wrapper .row:first-child div:nth-child(1) #listEmployeesNotMatched_length`
    ).addClass("pagination--custom");
    $(`#listEmployeesNotMatched_wrapper .row:last-child div`)
      .first()
      .append(divLength);
  }

  $('#jsShowTheResultOfUploadFile .btn.btn-primary.close-modal').on('click', () => {
    $('#jsModalCheckInvites').modal("hide");
  });

  $(document).on("click", "#jsBtnInvites", function () {
    $("#jsShowInfoStaff").modal("hide");
    showLoading();
    sendDataInvite(0, staffListEmailInvite);
  });

  $("#jsFilterStatus").on("change", function () {
    isActive = $(this).val();
    staffTable.ajax.reload();
  });

  $(document).on("click", "#jsRefresh", function () {
    refreshTable();
  });

  $(document).on("click", "#jsActive, #jsDeactivate", function () {
    nameIdChange = $(this).attr("id");
    if (
      !$("#staffTable tbody").hasClass("jsBtnShowCheck") &&
      staffListChangeStatus.length > 0
    ) {
      showLoading();
      $("#jsModalListStaffChangeStatus").modal({
        backdrop: false,
        keyboard: false,
        show: true,
      });
      var text = "Employee List Deactivate";
      if ($(this).attr("id") == "jsActive") {
        action = 1;
        text = "Employee List Change To Active";
      } else {
        action = 2;
      }
      $(".jsTitleChangeStatus").text(text);

      staffListChangeStatus.forEach((item) => {
        let salaryWag = checkSalaryWag(item.salary_wag),
          startDate = item.start_date
            ? moment(item.start_date).format("DD-MM-YYYY")
            : "N/A";

        $("#listStaffChangeStatus tbody").append(`<tr>
                  <td>${item.fullname}</td>
                  <td>${item.email ? item.email : "N/A"}</td>
                  <td>${salaryWag}</td>
                  <td>${startDate}</td>
                  <td>
                      <div class="form-login-checkbox-cus">
                      <input checked class="check-status-staff--checked" type="checkbox" value=${item}'/>
                      <span class="form-login-checkbox_checkmark align-text-bottom sent-icon">
                      </span>
                      </div>
                  </td>
              </tr>`);
      });

      $(".check-status-staff--checked").each((index, inputChecked) => {
        // let valueEmpChecked = JSON.parse(inputChecked.defaultValue);
        let valueEmpChecked = inputChecked.defaultValue;
        $(inputChecked).on("change", function () {
          if (inputChecked.checked) {
            staffListChangeStatus.push(valueEmpChecked);
          } else {
            staffListChangeStatus.forEach((item, index) => {
              if (item._id == valueEmpChecked._id) {
                staffListChangeStatus.splice(index, 1);
              }
            });
          }
          $(".check-status-staff").each(function (index, input) {
            let valueEmp = JSON.parse(input.defaultValue);
            if (inputChecked.checked) {
              if (valueEmp._id == valueEmpChecked._id) {
                $(input).prop("checked", true);
              }
            } else {
              if (valueEmp._id == valueEmpChecked._id) {
                $(input).prop("checked", false);
              }
            }
          });
          let count = staffListChangeStatus.length;
          if (nameIdChange == "jsActive") {
            $(".jsCountCheck").html("(" + count + ")");
          } else {
            $(".jsCountCheckDe").html("(" + count + ")");
          }
        });
      });
      hidenLoading();
    } else {
      $("#staffTable tbody").removeClass("jsBtnShowCheck");
      $("#jsRefresh").prop("hidden", false);
      if (nameIdChange == "jsActive") {
        $("#jsDeactivate").prop("disabled", true);
      } else {
        $("#jsActive").prop("disabled", true);
      }
    }
  });

  $(".close-modal-status").click(() => {
    $("#listStaffChangeStatus tbody tr").remove();
    if (staffListChangeStatus.length <= 0) {
      $("#jsActive").prop("disabled", false);
      $("#jsDeactivate").prop("disabled", false);
    }
  });

  $("#jsSubmitChangeStatus").click(() => {
    showLoading();
    if (staffListChangeStatus.length <= 0) {
      showToast("error", "Please choose staff.");
      hidenLoading();
      return;
    }
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/admin/staffs/change-status`,
      data: {
        _csrf: token,
        staffList: JSON.stringify(staffListChangeStatus),
        action: action,
      },
      success: function (data) {
        showToast(
          "success",
          `${action == 1 ? "Active staffs" : "Deactivate staffs"} successfully.`
        );
        $("#jsModalListStaffChangeStatus").modal("hide");
        refreshTable();
        hidenLoading();
        return true;
      },
      error: function () {
        hidenLoading();
        showToast("error", "Can not connect to server. Please try again.");
        return false;
      },
    });
  });

  $("#jsExportRegistered").click(() => {
    showLoading();
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/admin/staffs/registered`,
      data: {
        _csrf: token,
        company_id: idCompany,
        searchKey,
        isActive,
        systemCode,
      },
      success: function (responsive) {
        if (responsive.success) {
          var blob = convertBase64toBlob(
            responsive.data,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          saveAs(blob, "staffs-registered" + Date.now().toString() + ".xlsx");
        } else {
          showToast("error", "Can not export data.");
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
  });

  $("#jsExportStaffInvited").click(() => {
    if (!$('#jsExportStaffInvited').hasClass('disabled')) {
      showLoading();
      $.ajax({
        dataType: "json",
        method: "POST",
        url: `/admin/staffs/invited`,
        data: {
          _csrf: token,
          company_id: idCompany,
          searchKey,
          systemCode,
          isAll: $('#jsFilterInvites').val(),
          startDate: startDateSelect ? startDateSelect.format('YYYY-MM-DD') : '',
          endDate: endDateSelect ? endDateSelect.format('YYYY-MM-DD') : ''
        },
        success: function (responsive) {
          if (responsive.success) {
            var blob = convertBase64toBlob(
              responsive.data,
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            saveAs(blob, "staffs-invited" + Date.now().toString() + ".xlsx");
          } else {
            showToast("error", "No staff invited.");
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
  });

  $(document).on("change", ".check-status-staff", function () {
    // let value = JSON.parse($(this).val());
    let value = statusObject[$(this).val()]
    if ($(this).is(":checked")) {
      staffListChangeStatus.push(value);
    } else {
      staffListChangeStatus.forEach((item, index) => {
        if (item._id == value._id) {
          staffListChangeStatus.splice(index, 1);
        }
      });
    }
    if (nameIdChange == "jsActive") {
      $(".jsCountCheck").html("(" + staffListChangeStatus.length + ")");
    } else {
      $(".jsCountCheckDe").html("(" + staffListChangeStatus.length + ")");
    }
    if (staffListChangeStatus.length <= 0) {
      $("#jsActive").prop("disabled", false);
      $("#jsDeactivate").prop("disabled", false);
    }
  });

  $(document).on("change", "#staffInviteTable .checkbox-staff", function () {
    let value = JSON.parse($(this).val());
    if ($(this).is(":checked")) {
      staffListInvite.push(value);
    } else {
      staffListInvite.forEach((item, index) => {
        if (item._id == value._id) {
          staffListInvite.splice(index, 1);
        }
      });
    }
    $(".countEmp").html("(" + staffListInvite.length + ")");
    if (staffListInvite.length <= 0) {
      $("#jsInvite").attr("disabled", true);
    } else {
      $("#jsInvite").attr("disabled", false);
    }
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


  //staff dateranger
  function staffDateRanger() {
    //set all staff
    $('#staff_dateranger span').html('All Staffs');
    //create daterangerpicker
    $('#staff_dateranger').daterangepicker({
      startDate: startDate,
      endDate: endDate,
      locale: { direction: 'staff-daterangepicker' }
    }, function(start, end) {
      //check start date choose and start date parent
      if (start.format('L') != moment().startOf('month').format('L') || end.format('L') != moment().add(3, 'month').format('L')) {
        $('#staff_dateranger span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
      }
      startDateSelect = start;
      endDateSelect = end;
    });
    //check filter date ranger staff
    $('#staff_dateranger').on('apply.daterangepicker', function() {
      $('.btn-refresh-ts').attr('hidden', false);
      staffInviteTable.ajax.reload();
    });
  }

  $('#staff_dateranger').daterangepicker();
  staffDateRanger();
  //refresh all staff
  $('.btn-refresh-ts').click(function() {
    refreshDatePicker();
    staffInviteTable.ajax.reload();
  })

  function refreshDatePicker() {
    $('.btn-refresh-ts').attr('hidden', true);
    startDate = moment().startOf('month');
    endDate = moment().add(3, 'month');
    startDateSelect = "";
    endDateSelect = "";
    staffDateRanger();
  }

  $(document).on("click", ".btn-sync-payroll", function () {
    //validate
    if ($(this).hasClass('disabled')) return;
    searchKey = "";
    isActive = "ALL";
    InvitesType = "ALL";
    $('input[name="staff-invitation-name"]').val("");
    $('input[name="staff-name"]').val("");
    $('#jsFilterInvites').val("ALL");
    $('#jsFilterStatus').val("ALL");
    refreshDatePicker();
  });

  function refreshTable() {
    $("#jsRefresh").prop("hidden", true);
    staffListChangeStatus = []; //
    $("#jsActive").prop("disabled", false);
    $("#jsDeactivate").prop("disabled", false);
    if (nameIdChange == "jsActive") {
      $(".jsCountCheck").html("(" + 0 + ")");
    } else {
      $(".jsCountCheckDe").html("(" + 0 + ")");
    }
    $("#listStaffChangeStatus tbody tr").remove();
    if (!$("#staffTable tbody").hasClass("jsBtnShowCheck")) {
      $("#staffTable tbody").addClass("jsBtnShowCheck");
    }
    staffTable.ajax.reload();
  }

  //  ----------------------------------------- business
  
  $('#jsSetupFee').on('click', function () {
    $('#jsModalSetupFee').modal('show');
    if (!listBusiness) {
      listBusiness = $('#listBusiness').DataTable({
        searching: false,
        serverSide: true,
        processing: true,
        ordering: false,
        language: {
          loadingRecords: '&nbsp;',
          processing: '<div class="spinner"></div>',
        },
        ajax: {
          type: 'POST',
          url: "/get-business",
          data: function (d) {
            let info = $("#listBusiness").DataTable().page.info();
            d.companyId = idCompany;
            d.searchKey = '';
            d.page = info.page;
            d.pageSize = info.length;
            d._csrf = token;
          },
          dataSrc: "result",
          dataFilter: function (data) {
            let json = $.parseJSON(data);
            let info = $('#listBusiness').DataTable().page.info();
            if (info.page === 0) {
              total = json.total;
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
            data: "name",
            render: function (data) {                                      
              return data ? data : "N/A";
            },
          },
          {
            "data": {
              fee_type: "fee_type",
              _id: "_id"
            },
            render: function (data) {
              let text = `<select class="form-control form-control-sm" id="${data._id}">
              <option ${ !data || data.fee_type === "COMPANY" ? 'selected' : ''} value="COMPANY">Company</option>
              <option ${ data && data.fee_type === "FREE" ? 'selected' : ''} value="FREE">Free</option>
            </select>`;
              return text;
            },
          }
        ],
      });
    } else {
      listBusiness.ajax.reload();
    }

    $("#listBusiness_info").addClass("d-none");

    (function setFooterTable() {
      let divLength = $(
        `#listBusiness_wrapper .row:first-child div:nth-child(1) #listBusiness_length`
      );
      $(`#listBusiness_wrapper .row:last-child div`)
        .first()
        .append(divLength);
    })();
  });

  $("#listBusiness tbody").on("change", "select", function () {
    var tr = $(this).closest("tr");
    var row = listBusiness.row(tr);
    const id = row.data()._id;
    const value = $(`#${id} option:selected`).val();
    businessFee[id] = value;
  });

  $("#submitSetupFee").click(() => {
    showLoading();
    let business = [];
    Object.keys(businessFee).map((key) => {
      business.push({id: key, feeType: businessFee[key]});
      return;
    });
    if (business.length > 0) {
      $.ajax({
        dataType: "json",
        method: "POST",
        url: `/setup-fee-type`,
        data: {
          business: JSON.stringify(business),
          _csrf: token,
        },
        async: true,
        success: function (data) {
          showToast("success", "Setup type fee successfully");
          listBusiness.ajax.reload();
          staffTable.ajax.reload();
          hidenLoading();
          $("#jsModalSetupFee").modal("hide");
          return true;
        },
        error: function () {
          hidenLoading();
          showToast("error", "Can not connect to server. Please try again.");
          return false;
        },
      });
    } else {
      return;
    }
  });
});
