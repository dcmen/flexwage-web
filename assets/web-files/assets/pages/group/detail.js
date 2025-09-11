$(document).ready(function () {
  let managers = $('input[name="managers"]').val();
  companies = $('input[name="companies"]').val();
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
    data: JSON.parse(managers),
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
    data: JSON.parse(companies),
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
    ],
  });

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
});
