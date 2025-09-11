$(document).ready(function () {
    const token = $('input[name="_csrf"]').val();
    let errorCode = '';
    const errorCodeTable = $('#errorCodeTable').DataTable({
        'searching': false,
        'serverSide': true,
        'processing': true,
        "order": [[1, 'asc']],
        "ordering": true,
        'language': {
            'loadingRecords': '&nbsp;',
            'processing': '<div class="spinner"></div>'
        },
        'ajax': {
            'type': 'POST',
            'url': '/admin/error-code',
            'data': function (d) {
                var info = $('#errorCodeTable').DataTable().page.info();
                d.errorCode = errorCode;
                d.page = info.page;
                d.pageSize = info.length;
                d._csrf = token;
            },
            'dataSrc': 'result',
            'dataFilter': function (data) {
                var json = $.parseJSON(data);
                var info = $('#errorCodeTable').DataTable().page.info();
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
                "data": "code",
                "render": function (data) {
                    return data ? data : 'N/A';
                }
            },
            {
                "data": "message",
                "render": function (data) {
                    return data ? data : 'N/A';
                }
            }
        ]
    });

    let divLength = $(`#errorCodeTable_wrapper .row:first-child div:nth-child(1) #errorCodeTable_length`).addClass('pagination--custom');
    $(`#errorCodeTable_wrapper .row:last-child div`).first().append(divLength);

    $('#jsErrorCodeSearch').on('submit', (event) => {
        event.preventDefault();
        errorCode = $('input[name="error-code"]').val();
        errorCodeTable.ajax.reload();
    });
})