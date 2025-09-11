$(document).ready(function () {
    const token = $('input[name="_csrf"]').val();
    let searchKey = '';

    var registrationTable = $('#tableRegistration').DataTable({
        'searching': false,
        'processing': true,
        "info": true,
        "paging": true,
        'serverSide': true,
        'lengthChange': true,
        "ordering": false,
        "language": {
            'loadingRecords': '&nbsp;',
            'processing': '<div class="spinner"></div>'
        },
        'ajax': {
            'type': 'POST',
            'url': '/admin/logs/registration',
            'data': function (d) {
                var info = $('#tableRegistration').DataTable().page.info();

                d.searchKey = searchKey;
                d.page = info.page;
                d.pageSize = info.length;
                d._csrf = token;
            },
            'dataSrc': 'result',
            'dataFilter': function (data) {
                var json = $.parseJSON(data);
                var info = $('#tableRegistration').DataTable().page.info();
                if (info.page == 0) {
                    total = json.totalItems;
                }
                json.recordsFiltered = total;
                json.recordsTotal = total;
                return JSON.stringify(json);
            }
        },
        'columns': [{
                "data": null,
                "render": function ( data, type, full, meta ) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            {
                "data": "first_name",
                "render": function (data) {
                    return data ? data : "N/A";           
                }
            },
            {
                "data": "last_name",
                "render": function (data) {
                    return data ? data : "N/A";
                }
            },
            {
                "data": "email",
                "render": function (data) {
                    return data ? data : "N/A";
                }
            },
            {
                "data": "phone",
                "render": function (data) {
                    return data ? data : "N/A";
                }
            },
            {
                "data": "created_date",
                "render": function (data) {
                    return moment(data).format('DD/MM/YYYY hh:mm A');
                }
            }
        ]
    });

    var rateTable = $('#tableRate').DataTable({
        'searching': false,
        'processing': true,
        "info": true,
        "paging": true,
        'serverSide': true,
        'lengthChange': true,
        "ordering": false,
        "language": {
            'loadingRecords': '&nbsp;',
            'processing': '<div class="spinner"></div>'
        },
        'ajax': {
            'type': 'POST',
            'url': '/admin/logs/rate',
            'data': function (d) {
                var info = $('#tableRate').DataTable().page.info();
                d.searchKey = searchKey;
                d.page = info.page;
                d.pageSize = info.length;
                d._csrf = token;
            },
            'dataSrc': 'result',
            'dataFilter': function (data) {
                var json = $.parseJSON(data);
                $('#jsAveRate').html(`<strong style="color: #e21;">Ave Rate: ${json.averageRate > 0 ? Number.parseFloat(json.averageRate).toFixed(2) : 0}</strong>`);
                var info = $('#tableRate').DataTable().page.info();
                if (info.page == 0) {
                    total = json.totalItems;
                }
                json.recordsFiltered = total;
                json.recordsTotal = total;
                return JSON.stringify(json);
            }
        },
        'columns': [{
                "data": null,
                "render": function ( data, type, full, meta ) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            {
                "data": "first_name",
                "render": function (data) {
                    return data;           
                }
            },
            {
                "data": "last_name",
                "render": function (data) {
                    return data;           
                }
            },
            {
                "data": "rate",
                "render": function (data) {
                    return data ? data : 0;
                }
            },
            {
                "data": "comment",
                "render": function (data) {
                    return data ? data : "N/A";
                }
            },
            {
                "data": "created_date",
                "render": function (data) {
                    return moment(data).format('DD/MM/YYYY hh:mm A');
                }
            }
        ]
    });

    let divLength = $(`#tableRate_wrapper .row:first-child div:nth-child(1) #tableRate_length`).addClass('pagination--custom');
    $(`#tableRate_wrapper .row:last-child div`).first().append(divLength);

    let divLength1 = $(`#tableRegistration_wrapper .row:first-child div:nth-child(1) #tableRegistration_length`).addClass('pagination--custom');
    $(`#tableRegistration_wrapper .row:last-child div`).first().append(divLength1);

    $('#jsSearchKey').on('submit', (event) => {
        event.preventDefault();
        searchKey = $('input[name="search_key"]').val();
        rateTable.ajax.reload();
        registrationTable.ajax.reload();
      });
});

