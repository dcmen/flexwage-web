$(document).ready(function () {
  let managers = [],
    managerIds = [],
    companies = [],
    companyIds = [],
    managerTablePick,
    companyTablePick,
    keywordManager = "",
    keywordCompany = "",
    managersObjTam = {},
    companiesObjTam = {},
    resultManager = {},
    resultCompany = {};
  const token = $('input[name="_csrf"]').val();

  let managerTable = $("#manageTable").DataTable({
    searching: false,
    processing: true,
    info: true,
    paging: true,
    // 'lengthChange': true,
    ordering: false,
    language: {
      loadingRecords: "&nbsp;",
      processing: '<div class="spinner"></div>',
    },
    data: managers,
    pageLength: 5,
    bLengthChange: false,
    // "lengthMenu": [
    //   [5, 10, 25, 50, 100],
    //   [5, 10, 25, 50, 100],
    // ],
    columns: [
      {
        data: null,
        render: function (data, type, full, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        },
      },
      {
        data: "fullname",
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
        data: {
          mobile_country_code: "mobile_country_code",
          mobile: "mobile",
        },
        render: function (data) {
          let text = "N/A";
          if (data.mobile_country_code && data.mobile) {
            text = `(+${data.mobile_country_code}) ${data.mobile}`;
          } else if (data.mobile) {
            text = `(+61) ${data.mobile}`;
          }
          return text;
        },
      },
      {
        data: {
          address_line_1: "address_line_1",
          address_line_2: "address_line_2",
        },
        render: function (data) {
          return data.address_line_1 + ", " + data.address_line_2;
        },
      },
      {
        data: "is_active",
        render: function (data) {
          return data === 1
            ? "<span style='color: #0ac282 !important;'>Active</span>"
            : data === 2
            ? "<span style='color: #868e96 !important;'>Inactive</span>"
            : "<span style='color: #f6d807 !important;'>Pending</span>";
        },
        width: 100,
      },
      {
        data: null,
        render: function (data, type, row) {
          return `<button type="button" class="btn btn-mini btn-sm btn-danger jsDeleteManager" data-toggle="modal">&nbsp
              <i class="icofont icofont-ui-delete" style="font-size: 16px;"></i>
          </button>`;
        },
        width: 100,
      },
    ],
  });

  let companyTable = $("#companyTable2").DataTable({
    searching: false,
    processing: true,
    info: true,
    paging: true,
    // 'lengthChange': true,
    ordering: false,
    language: {
      loadingRecords: "&nbsp;",
      processing: '<div class="spinner"></div>',
    },
    data: companies,
    pageLength: 5,
    bLengthChange: false,
    // "lengthMenu": [
    //   [5, 10, 25, 50, 100],
    //   [5, 10, 25, 50, 100],
    // ],
    columns: [
      {
        data: null,
        render: function (data, type, full, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        },
      },
      {
        data: "company_name",
        render: function (data) {
          return data.length <= 20 ? data : data.substring(0, 20).concat("...");
        },
      },
      {
        data: "system",
        render: function (data) {
          return data ? data.system_name : "N/A";
        },
      },
      {
        data: "is_fail_system_refresh_token",
        render: function (data) {
          return `<span class="${data ? "text-danger" : "text-success"}">
              ${data ? "Disconnected" : "Connected"}</span>`;
        },
      },
      {
        data: "address",
        render: function (data) {
          return data
            ? data.length <= 20
              ? data
              : data.substring(0, 20).concat("...")
            : "N/A";
        },
      },
      {
        data: "abn",
        render: function (data) {
          return data ? data : "N/A";
        },
      },
      {
        data: "email_company",
        render: function (data) {
          return data
            ? data.length <= 20
              ? data
              : data.substring(0, 20).concat("...")
            : "N/A";
        },
      },
      {
        data: "phone_company",
        render: function (data) {
          return data
            ? data.length <= 20
              ? data
              : data.substring(0, 20).concat("...")
            : "N/A";
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
        render: function (data, type, row) {
          return `<button type="button" class="btn btn-mini btn-sm btn-danger jsDeleteCompany" data-toggle="modal">&nbsp
              <i class="icofont icofont-ui-delete" style="font-size: 16px;"></i>
          </button>`;
        },
      },
    ],
  });

  $("#jsOnAddManager").click(function () {
    managersObjTam = convertArrayToObjectItem(managers);
    $('input[name="nameManager"]').val("");
    keywordManager = "";
    if (!managerTablePick) {
      managerTablePick = $("#manageTablePick").DataTable({
        searching: false,
        processing: true,
        info: true,
        paging: true,
        lengthChange: true,
        ordering: false,
        serverSide: true,
        language: {
          loadingRecords: "&nbsp;",
          processing: '<div class="spinner"></div>',
        },
        ajax: {
          type: "POST",
          url: `/admin/api-managers`,
          data: function (d) {
            var info = $("#manageTablePick").DataTable().page.info();
            d.page = info.page;
            d.pageSize = info.length;
            d._csrf = token;
            d.keyword = keywordManager;
          },
          dataSrc: "result",
          dataFilter: function (data) {
            var json = $.parseJSON(data);
            var info = $("#manageTablePick").DataTable().page.info();
            if (info.page == 0) {
              total = json.totalCount;
            }
            json.recordsFiltered = total;
            json.recordsTotal = total;
            resultManager = convertArrayToObjectItem(json.result);
            return JSON.stringify(json);
          },
        },
        pageLength: 5,
        // "bLengthChange": false,
        autoWidth: false,
        lengthMenu: [
          [5, 10, 25, 50, 100],
          [5, 10, 25, 50, 100],
        ],
        columns: [
          {
            data: null,
            render: function (data, type, row) {
              let checked = "";
              if (managersObjTam[row._id]) {
                checked = "checked";
              }
              return `<input type="checkbox" ${checked} value='${row._id}'>`;
            },
            width: 20,
          },
          {
            data: "fullname",
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
            data: {
              mobile_country_code: "mobile_country_code",
              mobile: "mobile",
            },
            render: function (data) {
              let text = "N/A";
              if (data.mobile_country_code && data.mobile) {
                text = `(+${data.mobile_country_code}) ${data.mobile}`;
              } else if (data.mobile) {
                text = `(+61) ${data.mobile}`;
              }
              return text;
            },
          },
          {
            data: {
              address_line_1: "address_line_1",
              address_line_2: "address_line_2",
            },
            render: function (data) {
              let address = `${data.address_line_1 && data.address_line_1.trim() != 'null' ? data.address_line_1 + "," : ""} ${data.address_line_2 && data.address_line_2.trim() != 'null' ? data.address_line_2 : ""}`;
              return address.trim() ? address : "N/A" ;
            },
          },
          {
            data: "is_active",
            render: function (data) {
              return data === 1
                ? "<span style='color: #0ac282 !important;'>Active</span>"
                : data === 2
                ? "<span style='color: #868e96 !important;'>Inactive</span>"
                : "<span style='color: #f6d807 !important;'>Pending</span>";
            },
            width: 100,
          },
        ],
      });

      let divLength3 = $(
        `#manageTablePick_wrapper .row:first-child div:nth-child(1) #manageTablePick_length`
      ).addClass("pagination--custom");
      $(`#manageTablePick_wrapper .row:last-child div`)
        .first()
        .append(divLength3);
    } else {
      managerTablePick.ajax.reload();
    }

    $("#jsModalManagerPick").modal({
      backdrop: false,
      keyboard: false,
      show: true,
    });
  });

  $("#jsOnAddCompanies").click(function () {
    companiesObjTam = convertArrayToObjectItem(companies);
    keywordCompany = "";
    $('input[name="nameCompany"]').val("");
    if (!companyTablePick) {
      companyTablePick = $("#companyTable2Pick").DataTable({
        searching: false,
        processing: true,
        info: true,
        paging: true,
        lengthChange: true,
        ordering: false,
        serverSide: true,
        language: {
          loadingRecords: "&nbsp;",
          processing: '<div class="spinner"></div>',
        },
        ajax: {
          type: "POST",
          url: `/admin/api-companies`,
          data: function (d) {
            var info = $("#companyTable2Pick").DataTable().page.info();
            d.page = info.page;
            d.pageSize = info.length;
            d._csrf = token;
            d.keyword = keywordCompany;
          },
          dataSrc: "result",
          dataFilter: function (data) {
            var json = $.parseJSON(data);
            var info = $("#companyTable2Pick").DataTable().page.info();
            if (info.page == 0) {
              total = json.totalCount;
            }
            json.recordsFiltered = total;
            json.recordsTotal = total;
            resultCompany = convertArrayToObjectItem(json.result);
            return JSON.stringify(json);
          },
        },
        pageLength: 5,
        // "bLengthChange": false,
        autoWidth: false,
        lengthMenu: [
          [5, 10, 25, 50, 100],
          [5, 10, 25, 50, 100],
        ],
        columns: [
          {
            data: null,
            render: function (data, type, row) {
              let checked = "";
              if (companiesObjTam[row._id]) {
                checked = "checked";
              }
              return `<input type="checkbox" ${checked} value='${row._id}'>`;
            },
            width: 20,
          },
          {
            data: "company_name",
            render: function (data) {
              return data.length <= 20
                ? data
                : data.substring(0, 20).concat("...");
            },
          },
          {
            data: "system",
            render: function (data) {
              return data ? data.system_name : "N/A";
            },
          },
          {
            data: "is_fail_system_refresh_token",
            render: function (data) {
              return `<span class="${data ? "text-danger" : "text-success"}">
              ${data ? "Disconnected" : "Connected"}</span>`;
            },
          },
          {
            data: "address",
            render: function (data) {
              return data
                ? data.length <= 20
                  ? data
                  : data.substring(0, 20).concat("...")
                : "N/A";
            },
          },
          {
            data: "abn",
            render: function (data) {
              return data ? data : "N/A";
            },
          },
          {
            data: "email_company",
            render: function (data) {
              return data
                ? data.length <= 20
                  ? data
                  : data.substring(0, 20).concat("...")
                : "N/A";
            },
          },
          {
            data: "phone_company",
            render: function (data) {
              return data
                ? data.length <= 20
                  ? data
                  : data.substring(0, 20).concat("...")
                : "N/A";
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
        ],
      });

      let divLength4 = $(
        `#companyTable2Pick_wrapper .row:first-child div:nth-child(1) #companyTable2Pick_length`
      ).addClass("pagination--custom");
      $(`#companyTable2Pick_wrapper .row:last-child div`)
        .first()
        .append(divLength4);
    } else {
      companyTablePick.ajax.reload();
    }

    $("#jsModalCompanyPick").modal({
      backdrop: false,
      keyboard: false,
      show: true,
    });
  });

  $("#logo-group").on("change", function () {
    var img = this.files[0];
    if (img) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $("#previewLogo").attr("src", e.target.result);
      };
      reader.readAsDataURL(img);
      $(".close-img").removeClass("hide");
    }
  });

  $("button.close-img").click(function () {
    $("#previewLogo").attr("src", "../../web-images/favicon.png");
    $('input[name="logoGroup"]').val("");
    $(".close-img").addClass("hide");
  });

  $("#formAddGroup").submit(function (event) {
    let groupName = $('input[name="groupName"]');
    if (groupName.val() == "") {
      event.preventDefault();
      hideLoading();
      showToast("error", "Please enter group name.");
      $('input[name="groupName"]').addClass("err-required");
    } else {
      $('input[name="managerIds"]').val(JSON.stringify(managerIds));
      $('input[name="companyIds"]').val(JSON.stringify(companyIds));
    }
  });

  $('input[name="groupName"]').keydown(function () {
    // $(this).toggleClass('err-required');
    if ($(this).hasClass("err-required")) {
      $(this).removeClass("err-required");
    }
  });

  $("#jsSearchManager").submit(function (e) {
    e.preventDefault();
    keywordManager = $('input[name="nameManager"]').val();
    managerTablePick.ajax.reload();
  });

  $("#jsSearchCompany").submit(function (e) {
    e.preventDefault();
    keywordCompany = $('input[name="nameCompany"]').val();
    companyTablePick.ajax.reload();
  });

  $("#manageTablePick").on("change", 'input[type="checkbox"]', function () {
    let managerId = $(this).val();
    if ($(this).is(":checked")) {
      if (!managersObjTam[managerId]) {
        managersObjTam[managerId] = resultManager[managerId];
      }
    } else {
      if (managersObjTam[managerId]) {
        delete managersObjTam[managerId];
      }
    }
  });

  $("#companyTable2Pick").on("change", 'input[type="checkbox"]', function () {
    let companyId = $(this).val();
    if ($(this).is(":checked")) {
      if (!companiesObjTam[companyId]) {
        companiesObjTam[companyId] = resultCompany[companyId];
      }
    } else {
      if (companiesObjTam[companyId]) {
        delete companiesObjTam[companyId];
      }
    }
  });

  $("#jsAddManagerPick").click(function () {
    managerIds = Object.keys(managersObjTam);
    managers = Object.values(managersObjTam);
    managerTable.clear().rows.add(managers).draw();
    $("#countManager").text(managers.length);
    $("#jsModalManagerPick").modal("hide");
  });

  $("#jsAddCompanyPick").click(function () {
    companyIds = Object.keys(companiesObjTam);
    companies = Object.values(companiesObjTam);
    companyTable.clear().rows.add(companies).draw();
    $("#countCompany").text(companies.length);
    $("#jsModalCompanyPick").modal("hide");
  });

  $("#jsModalManagerPick .btn-close").click(function () {
    managerTablePick.ajax.reload();
  });

  $("#jsModalCompanyPick .btn-close").click(function () {
    companyTablePick.ajax.reload();
  });

  $("#manageTable tbody").on("click", "button.jsDeleteManager", function () {
    var tr = $(this).closest("tr");
    var row = managerTable.row(tr);
    const manager = row.data();
    delete managersObjTam[manager._id];
    managerIds = Object.keys(managersObjTam);
    managers = Object.values(managersObjTam);
    managerTable.clear().rows.add(managers).draw();
    $("#countManager").text(managerIds.length);
  });

  $("#companyTable2 tbody").on("click", "button.jsDeleteCompany", function () {
    var tr = $(this).closest("tr");
    var row = companyTable.row(tr);
    const company = row.data();
    delete companiesObjTam[company._id];
    companies = Object.values(companiesObjTam);
    companyIds = Object.keys(companiesObjTam);
    companyTable.clear().rows.add(companies).draw();
    $("#countManager").text(companyIds.length);
    companyTablePick.ajax.reload();
  });

  function showLoading() {
    $("#jsLoader").addClass("show");
  }

  function hideLoading() {
    setTimeout(function () {
      $("#jsLoader").removeClass("show");
    }, 500);
  }

  function showToast(name, mess, nameErrId = "#jsErr") {
    $(nameErrId).addClass(`show ${name}`);
    $(`${nameErrId} p`).text(mess);
    setTimeout(() => {
      $(nameErrId).removeClass(`show ${name}`);
    }, 2000);
  }

  (function setFooterTable() {
    let divLength = $(
      `#manageTable_wrapper .row:first-child div:nth-child(1) #manageTable_length`
    ).addClass("pagination--custom");
    $(`#manageTable_wrapper .row:last-child div`).first().append(divLength);
    let divLength2 = $(
      `#companyTable2_wrapper .row:first-child div:nth-child(1) #companyTable2_length`
    ).addClass("pagination--custom");
    $(`#companyTable2_wrapper .row:last-child div`).first().append(divLength2);
  })();

  (function () {
    setTimeout(() => {
      $(".toast-err").removeClass(`show`);
    }, 2000);
  })();

  function convertArrayToObjectItem(items) {
    const object = {};
    for (let i = 0; i < items.length; i++) {
      let element = items[i];
      object[element._id] = element;
    }
    return object;
  }

});
