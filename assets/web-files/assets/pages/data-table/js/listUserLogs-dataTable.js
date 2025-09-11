$(document).ready(function () {
    const token = $('input[name="_csrf"]').val();
    let userName = '';
    const userLogsTable = $('#userLogsTable').DataTable({
        'searching': false,
        'serverSide': true,
        'processing': true,
        "order": [[1, 'asc'], [2, 'asc'], [3, 'asc']],
        "ordering": true,
        'language': {
            'loadingRecords': '&nbsp;',
            'processing': '<div class="spinner"></div>'
        },
        'ajax': {
            'type': 'POST',
            'url': '/admin/user-logs',
            'data': function (d) {
                var info = $('#userLogsTable').DataTable().page.info();
                d.userName = userName;
                d.page = info.page;
                d.pageSize = info.length;
                d._csrf = token;
            },
            'dataSrc': 'result',
            'dataFilter': function (data) {
                var json = $.parseJSON(data);
                var info = $('#userLogsTable').DataTable().page.info();
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
            "render": function (data, type, full, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }
        },
            {
                "data": "staff.fullname",
                "render": function (data) {
                    return data ? data : 'N/A';
                }
            },
            {
                "data": "company.company_name",
                "render": function (data) {
                    return data ? data : 'N/A';
                }
            },
            {
                "data": "create_date",
                "render": function (data) {
                    return data ? moment(data).format('DD-MM-YYYY hh:mm A') : 'N/A';
                }
            }
        ]
    });

    let divLength = $(`#userLogsTable_wrapper .row:first-child div:nth-child(1) #userLogsTable_length`).addClass('pagination--custom');
    $(`#userLogsTable_wrapper .row:last-child div`).first().append(divLength);

    $('#jsUserLogSearch').on('submit', (event) => {
        event.preventDefault();
        userName = $('input[name="userlogs-name"]').val();
        userLogsTable.ajax.reload();
    });
});