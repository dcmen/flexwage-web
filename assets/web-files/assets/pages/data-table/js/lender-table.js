$(document).ready(function () {
    const token = $('input[name="_csrf"]').val();
    const key = $('input[name="key"]').val();
    var lenderId = "";
    let mode, searchKey = '';
    //disabled warning datatable
    $.fn.dataTableExt.sErrMode = 'throw';
    var lenderTable = $('#lenderTable').DataTable({
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
            'url': '/admin/get-lenders',
            'data': function (d) {
                var info = $('#lenderTable').DataTable().page.info();

                d.searchKey = searchKey;
                d.page = info.page;
                d.pageSize = info.length;
                d._csrf = token;
            },
            'dataSrc': 'result',
            'dataFilter': function (data) {
                var json = $.parseJSON(data);
                var info = $('#lenderTable').DataTable().page.info();
                if (info.page == 0) {
                    total = json.totalItems;
                }
                json.recordsFiltered = total;
                json.recordsTotal = total;
                return JSON.stringify(json);
            }
        },
        'columns': [{
                "data": "lender_name",
                "render": function (data) {
                    return data;
                }
            },
            {
                "data": "funding_type",
                "render": function (data) {
                    let fundingTextFormat;
                    switch (data) {
                        case 'SELF_FINANCED':
                            fundingTextFormat = "Self financed";
                            break;
                        case 'EXTERNAL_FINANCED':
                            fundingTextFormat = "External financed";
                            break;
                        case 'CASHD_FINANCED':
                            fundingTextFormat = "CashD financed";
                            break;
                        case "SELF_CASHD_FINANCED":
                            fundingTextFormat = "Self & CashD financed";
                            break;
                    };
                    return fundingTextFormat;
                }
            },
            {
                "data": "lender_parent",
                "render": function (data) {
                    return data && data[0] ? data[0].lender_name : "N/A";
                }
            },
            {
                "data": "start_date",
                "render": function (data) {
                    return moment(data).format('DD/MM/YYYY hh:mm:ss A');
                }
            },
            {
                "data": {status: "status", _id: "_id"},
                "render": function (data) {
                    return `<label class="switch ${data.status === 2 ? "status-delete" : ""}">
                        ${data.status === 1 ? `<input name="btn-change-status" id="${data._id}" type="checkbox" checked>` : (data.status === 2 ? `<input name="btn-change-status" id="${data._id}" type="checkbox">` : `<input name="btn-change-status" id="${data._id}" type="checkbox">`)}
                        <span>
                            <em></em>
                            <strong></strong>
                        </span>
                    </label>`;
                }
            },
            {
                "data": "companies[0].company_name",
                "render": function (data) {
                    return data ? data : "N/A";
                }
            },
            {
                "data": {
                    lender: {
                        _id: "_id",
                        name: "lender_name",
                        is_cashd: "is_cashd",
                        status: "status"
                    }
                },
                "render": function (data) {
                    return `
                        <a href="/admin/lender/${data._id}" class="btn btn-mini btn-outline-info accordion-toggle md-details-control">&nbsp
                            <i class="icofont icofont-eye-alt"></i></a>
                        <a href="/admin/edit-lender/${data._id}" class="btn btn-mini btn-outline-info accordion-toggle md-details-control">&nbsp
                            <i class="icofont icofont-ui-edit"></i></a>
                        <button ${data.is_supper_lender || data.status === 2 ? "disabled" : ""} type="button" class="btn btn-mini btn-sm btn-danger jsDeleteLender" data-toggle="modal"
                        data-target="#${data._id}dele">&nbsp
                            <i class="icofont icofont-ui-delete" style="font-size: 16px;"></i>
                        </button>
                        <div class="modal fade" id="${data._id}dele" tabindex="-1" role="dialog">
                            <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                    <div class="modal-body">
                                    <h5 style="white-space: normal; line-height: 1.5;">Are you sure you want to block <b>${data.lender_name}</b> ?</h5>
                                    </div>
                                    <div class="modal-footer">
                                    <button type="button" class="btn btn-default waves-effect"
                                        data-dismiss="modal">No</button>
                                    <button type="button" id="${data._id}"
                                        class="btn btn-primary waves-effect waves-light ">Yes</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        ]
    });

    var financeTable = $('#financeTable').DataTable({
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
            'url': '/admin/get-lenders',
            'data': function (d) {
                var info = $('#financeTable').DataTable().page.info();

                d.searchKey = searchKey;
                d.page = info.page;
                d.pageSize = info.length;
                d._csrf = token;
            },
            'dataSrc': 'result',
            'dataFilter': function (data) {
                var json = $.parseJSON(data);
                var info = $('#financeTable').DataTable().page.info();
                if (info.page == 0) {
                    total = json.totalItems;
                }
                json.recordsFiltered = total;
                json.recordsTotal = total;
                return JSON.stringify(json);
            }
        },
        'columns': [{
                "data": "lender_name",
                "render": function (data) {
                    return data;
                }
            },
            {
                "data": "funding_type",
                "render": function (data) {
                    let fundingTextFormat;
                    switch (data) {
                        case 'SELF_FINANCED':
                            fundingTextFormat = "Self financed";
                            break;
                        case 'EXTERNAL_FINANCED':
                            fundingTextFormat = "External financed";
                            break;
                        case 'CASHD_FINANCED':
                            fundingTextFormat = "CashD financed";
                            break;
                        case "SELF_CASHD_FINANCED":
                            fundingTextFormat = "Self & CashD financed";
                            break;
                    };
                    return fundingTextFormat;
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return 'Monoova';
                }
            },
            {
                "data": "test_receivables_account_name",
                "render": function (data) {
                    return data ? data : ' N/A';
                }
            },
            {
                "data": "test_receivables_account_bsb",
                "render": function (data) {
                    var _0x4507 = ['652083pThnwg', '15569GFQnDb', '\x20N/A', '528783uUiGVS', '48WWBdoI', '1CjQXwL', '142519uIKQWm', 'enc', 'Utf8', 'decrypt', 'toString', '236725pPLSWH', 'AES', '117807lsvHpA', '481361mJoiKu'];
                    var _0x3b8e = function (_0x3c3c77, _0x5324a4) {
                        _0x3c3c77 = _0x3c3c77 - 0xff;
                        var _0x450787 = _0x4507[_0x3c3c77];
                        return _0x450787;
                    };
                    var _0x4a93c6 = _0x3b8e;
                    (function (_0x1b9f64, _0x231fdb) {
                        var _0xa70236 = _0x3b8e;
                        while (!![]) {
                            try {
                                var _0x2fe166 = -parseInt(_0xa70236(0x103)) + parseInt(_0xa70236(0x105)) * parseInt(_0xa70236(0x106)) + -parseInt(_0xa70236(0xff)) + parseInt(_0xa70236(0x100)) + -parseInt(_0xa70236(0x101)) * -parseInt(_0xa70236(0x104)) + parseInt(_0xa70236(0x10d)) + -parseInt(_0xa70236(0x10b));
                                if (_0x2fe166 === _0x231fdb) break;
                                else _0x1b9f64['push'](_0x1b9f64['shift']());
                            } catch (_0x423da8) {
                                _0x1b9f64['push'](_0x1b9f64['shift']());
                            }
                        }
                    }(_0x4507, 0x64cb4));
                    if (data) {
                        var bytes = CryptoJS[_0x4a93c6(0x10c)][_0x4a93c6(0x109)](data, key),
                            decryptedData = bytes[_0x4a93c6(0x10a)](CryptoJS[_0x4a93c6(0x107)][_0x4a93c6(0x108)]);
                        return decryptedData;
                    }
                    return _0x4a93c6(0x102);
                }
            },
            {
                "data": "test_receivables_account_number",
                "render": function (data) {
                    var _0x5aec = ['Utf8', '816722jNjQWo', '3tUQQIL', 'enc', 'AES', '1406996Hskbkr', '\x20N/A', '2563rUcvbK', '239523ZNiozI', '880620DOCNlA', '510913RchquS', '353yJFfPf', '876240aCvDyM', 'decrypt', '3bnQmHQ'];
                    var _0x156e = function (_0x87716c, _0x3e970a) {
                        _0x87716c = _0x87716c - 0x65;
                        var _0x5aec10 = _0x5aec[_0x87716c];
                        return _0x5aec10;
                    };
                    var _0x5ca903 = _0x156e;
                    (function (_0x5da4a2, _0x3a5f51) {
                        var _0xe9354a = _0x156e;
                        while (!![]) {
                            try {
                                var _0x423381 = parseInt(_0xe9354a(0x69)) * parseInt(_0xe9354a(0x65)) + parseInt(_0xe9354a(0x67)) + parseInt(_0xe9354a(0x66)) * parseInt(_0xe9354a(0x6f)) + parseInt(_0xe9354a(0x6e)) + parseInt(_0xe9354a(0x68)) + parseInt(_0xe9354a(0x6a)) + parseInt(_0xe9354a(0x72)) * -parseInt(_0xe9354a(0x6c));
                                if (_0x423381 === _0x3a5f51) break;
                                else _0x5da4a2['push'](_0x5da4a2['shift']());
                            } catch (_0x2e1433) {
                                _0x5da4a2['push'](_0x5da4a2['shift']());
                            }
                        }
                    }(_0x5aec, 0x76d9f));
                    if (data) {
                        var bytes = CryptoJS[_0x5ca903(0x71)][_0x5ca903(0x6b)](data, key),
                            decryptedData = bytes['toString'](CryptoJS[_0x5ca903(0x70)][_0x5ca903(0x6d)]);
                        return decryptedData;
                    }
                    return _0x5ca903(0x73);
                }
            },
            {
                "data": "total_amount_test",
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', 
                                { style: 'currency', currency: 'USD' }
                            ).format(
                                data
                            )
                }
            },
            {
                "data": "total_deduction_test",
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', 
                                { style: 'currency', currency: 'USD' }
                            ).format(
                                data
                            )
                }
            },
            {
                "data": {total_amount_test: "total_amount_test", total_deduction_test: "total_deduction_test"},
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', 
                                { style: 'currency', currency: 'USD' }
                            ).format(
                                (data.total_amount_test - data.total_deduction_test)
                            )
                }
            },
            {
                "data": "live_receivables_account_name",
                "render": function (data) {
                    return data ? data : ' N/A';
                }
            },
            {
                "data": "live_receivables_account_bsb",
                "render": function (data) {
                    var _0x4507 = ['652083pThnwg', '15569GFQnDb', '\x20N/A', '528783uUiGVS', '48WWBdoI', '1CjQXwL', '142519uIKQWm', 'enc', 'Utf8', 'decrypt', 'toString', '236725pPLSWH', 'AES', '117807lsvHpA', '481361mJoiKu'];
                    var _0x3b8e = function (_0x3c3c77, _0x5324a4) {
                        _0x3c3c77 = _0x3c3c77 - 0xff;
                        var _0x450787 = _0x4507[_0x3c3c77];
                        return _0x450787;
                    };
                    var _0x4a93c6 = _0x3b8e;
                    (function (_0x1b9f64, _0x231fdb) {
                        var _0xa70236 = _0x3b8e;
                        while (!![]) {
                            try {
                                var _0x2fe166 = -parseInt(_0xa70236(0x103)) + parseInt(_0xa70236(0x105)) * parseInt(_0xa70236(0x106)) + -parseInt(_0xa70236(0xff)) + parseInt(_0xa70236(0x100)) + -parseInt(_0xa70236(0x101)) * -parseInt(_0xa70236(0x104)) + parseInt(_0xa70236(0x10d)) + -parseInt(_0xa70236(0x10b));
                                if (_0x2fe166 === _0x231fdb) break;
                                else _0x1b9f64['push'](_0x1b9f64['shift']());
                            } catch (_0x423da8) {
                                _0x1b9f64['push'](_0x1b9f64['shift']());
                            }
                        }
                    }(_0x4507, 0x64cb4));
                    if (data) {
                        var bytes = CryptoJS[_0x4a93c6(0x10c)][_0x4a93c6(0x109)](data, key),
                            decryptedData = bytes[_0x4a93c6(0x10a)](CryptoJS[_0x4a93c6(0x107)][_0x4a93c6(0x108)]);
                        return decryptedData;
                    }
                    return _0x4a93c6(0x102);
                }
            },
            {
                "data": "live_receivables_account_number",
                "render": function (data) {
                    var _0x5aec = ['Utf8', '816722jNjQWo', '3tUQQIL', 'enc', 'AES', '1406996Hskbkr', '\x20N/A', '2563rUcvbK', '239523ZNiozI', '880620DOCNlA', '510913RchquS', '353yJFfPf', '876240aCvDyM', 'decrypt', '3bnQmHQ'];
                    var _0x156e = function (_0x87716c, _0x3e970a) {
                        _0x87716c = _0x87716c - 0x65;
                        var _0x5aec10 = _0x5aec[_0x87716c];
                        return _0x5aec10;
                    };
                    var _0x5ca903 = _0x156e;
                    (function (_0x5da4a2, _0x3a5f51) {
                        var _0xe9354a = _0x156e;
                        while (!![]) {
                            try {
                                var _0x423381 = parseInt(_0xe9354a(0x69)) * parseInt(_0xe9354a(0x65)) + parseInt(_0xe9354a(0x67)) + parseInt(_0xe9354a(0x66)) * parseInt(_0xe9354a(0x6f)) + parseInt(_0xe9354a(0x6e)) + parseInt(_0xe9354a(0x68)) + parseInt(_0xe9354a(0x6a)) + parseInt(_0xe9354a(0x72)) * -parseInt(_0xe9354a(0x6c));
                                if (_0x423381 === _0x3a5f51) break;
                                else _0x5da4a2['push'](_0x5da4a2['shift']());
                            } catch (_0x2e1433) {
                                _0x5da4a2['push'](_0x5da4a2['shift']());
                            }
                        }
                    }(_0x5aec, 0x76d9f));
                    if (data) {
                        var bytes = CryptoJS[_0x5ca903(0x71)][_0x5ca903(0x6b)](data, key),
                            decryptedData = bytes['toString'](CryptoJS[_0x5ca903(0x70)][_0x5ca903(0x6d)]);
                        return decryptedData;
                    }
                    return _0x5ca903(0x73);
                }
            },
            {
                "data": "total_amount_live",
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', 
                                { style: 'currency', currency: 'USD' }
                            ).format(
                                data
                            )
                }
            },
            {
                "data": "total_deduction_live",
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', 
                                { style: 'currency', currency: 'USD' }
                            ).format(
                                data
                            )
                }
            },
            {
                "data": {total_amount_live: "total_amount_live", total_deduction_live: "total_deduction_live"},
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', 
                                { style: 'currency', currency: 'USD' }
                            ).format(
                                (data.total_amount_live - data.total_deduction_live)
                            )
                }
            },
            {
                "data": "start_date",
                "render": function (data) {
                    return moment(data).format('DD/MM/YYYY hh:mm:ss A');
                }
            },
            {
                "data": null,
                "render": function (data, type, row) {
                    let interestValue;
                    if (row.interest_rate_type == 'PERCENT') {
                        interestValue = `${row.interest_rate_value}%`
                    } else {
                        interestValue = new Intl.NumberFormat(
                            'en-US', 
                                    { style: 'currency', currency: 'USD' }
                                ).format(
                                    row.interest_rate_value
                                )
                    }
                    return interestValue;
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return `<a href="javascript:void(0)" class="btn btn-mini btn-outline-info accordion-toggle md-details-control">&nbsp
                        <i class="icofont icofont-eye-alt"></i>`
                }
            }
        ]
    });

    var financialDetailTable = $('#financialDetailTable').DataTable({
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
            'url': `/admin/financial`,
            'data': function (d) {
                var info = $('#financeTable').DataTable().page.info();
                d.page = info.page;
                d.pageSize = info.length;
                d.lenderId = lenderId;
                d._csrf = token;
            },
            'dataSrc': 'result',
            'dataFilter': function (data) {
                var json = $.parseJSON(data);
                var info = $('#financeTable').DataTable().page.info();
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
                "render": function (data) {
                    return "Deposit";
                }
            },
            {
                "data": "type",
                "render": function (data) {
                    let fundingTextFormat;
                    switch (data) {
                        case 'CAPITAL_LOAN':
                            fundingTextFormat = "Capital Loan";
                            break;
                    };
                    return fundingTextFormat;
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return 'Input';
                }
            },
            {
                "data": "amount",
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', 
                                { style: 'currency', currency: 'USD' }
                            ).format(
                                data
                            )
                }
            },
            {
                "data": "Date",
                "render": function (data) {
                    return moment(data).format('DD/MM/YYYY hh:mm:ss A');
                }
            }
        ]
    });

    function setFooterTable(mode) {
        let nameMode, nameLength;
        switch (mode) {
            case 0:
                nameMode = '#financeTable_wrapper';
                nameLength = '#financeTable_length';
                break;
            case 1:
                nameMode = "#lenderTable_wrapper";
                nameLength = "#lenderTable_length"
                break;
            case 2:
                nameMode = '#financialDetailTable_wrapper';
                nameLength = '#financialDetailTable_length';
                break;
        }
        let divLength = $(`${nameMode} .row:first-child div:nth-child(1) ${nameLength}`).addClass('pagination--custom');
        $(`${nameMode} .row:last-child div`).first().append(divLength);
    }

    setFooterTable(1);
    $('#lender-tab').click(() => {
        $('#lender-tab').addClass('active');
        $('#finance-tab').removeClass('active');
        $('#lender').addClass('show active');
        $('#finance').removeClass('show active');
        mode = 1;
        setFooterTable(mode);
    });

    $('#finance-tab').click(() => {
        $('#finance-tab').addClass('active');
        $('#lender-tab').removeClass('active');
        $('#lender').removeClass('show active');
        $('#finance').addClass('show active');
        mode = 0;
        setFooterTable(mode);
    });

    $('#financeTable').on('click', 'a.md-details-control', function () {
        var tr = $(this).closest('tr');
        var row = financeTable.row(tr);
        let data = row.data();
        lenderId = data._id;
        financialDetailTable.ajax.reload();
        setFooterTable(2);
        //show content detail
        $('#jsShowContentPage').addClass('hide');
        $('#jsDetailFinance').addClass('show');
        $('#jsDetailFinance').removeClass('hide');
    });

    $('.jsBack').click(() => {
        //show content page
        $('#jsShowContentPage').removeClass('hide');
        $('#jsDetailFinance').addClass('hide');
        $('#jsDetailFinance').removeClass('show');
    });

    $('#jsLenderSearch').on('submit', (event) => {
        event.preventDefault();
        searchKey = $('input[name="lender-name"]').val();
        lenderTable.ajax.reload();
    });

    $('#jsFinancialSearch').on('submit', (event) => {
        event.preventDefault();
        searchKey = $('input[name="financial-name"]').val();
        financeTable.ajax.reload();
    });

    $(document).on('click', '.btn-primary', (e) => {
        const id = e.target.id;
        $.ajax({
            method: 'Get',
            dataType: 'json',
            url: `/admin/lenders/${id}`,
            success: function (data) {
                if (data.success) {
                    showToast('success', 'Deleted successfully.');
                    lenderTable.ajax.reload();
                    financeTable.ajax.reload();
                    $(`.btn-default`).trigger('click');
                } else {
                    showToast('error', data.message);
                    $(`.btn-default`).trigger('click');
                }
            },
            error: function () {
                showToast('error', "Can't connect to server. Try again!");
            }
        })
    });

    $(document).on('change', 'input[name="btn-change-status"]', (e) => {
        showLoading();
        const id = e.target.id;
        if (id) {
            $.ajax({
                method: 'PUT',
                dataType: 'json',
                url: `/admin/lenders/${id}`,
                data: {
                    _csrf: token,
                    status: e.target.checked ? 1 : 0
                },
                success: function (data) {
                    hideLoading();
                    if (data.success) {
                        showToast('success', 'Update lender successfully.');
                        lenderTable.ajax.reload();
                        financeTable.ajax.reload();
                    } else {
                        showToast('error', data.message);
                    }
                },
                error: function () {
                    hideLoading();
                    showToast('error', "Can't connect to server. Try again!");
                }
            })
        }
    })

    function showLoading() {
        $('#jsLoader').addClass('show');
      }
    
      function hideLoading() {
        setTimeout(function () {
          $('#jsLoader').removeClass('show');
        }, 500);
      }

    function showToast(name, mess, nameErrId = '#jsErr') {
        $(nameErrId).addClass(`show ${name}`);
        $(`${nameErrId} p`).text(mess);
        setTimeout(() => {
            $(nameErrId).removeClass(`show ${name}`);
        }, 2000);
    }
});