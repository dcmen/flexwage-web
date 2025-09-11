$(document).ready(function () { 
    const token = $('input[name="_csrf"]').val();
    const key = $('input[name="key"]').val();
    var lenderId = "";
    let mode;
    var lenderTable = $('#lenderTable').DataTable({
        'searching': false,
        'processing': true,
        "info": false,
        "paging": false,
        'serverSide': true,
        'lengthChange': false,
        "ordering": false,
        "language": {
            'loadingRecords': '&nbsp;',
            'processing': '<div class="spinner"></div>'
        },
        'ajax': {
            'type': 'POST',
            'url': '/admin/get-lenders',
            'data': function (d) {
                // var info = $('#lenderTable').DataTable().page.info();
                d.is_supper_lender = true;
                d.page = 0;
                d.pageSize = 10;
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
                "data": {
                    lender: {
                        _id: "_id",
                        name: "lender_name",
                        is_cashd: "is_cashd"
                    }
                },
                "render": function (data) {
                    return `
                        <a href="/admin/lender/${data._id}" class="btn btn-mini btn-outline-info accordion-toggle md-details-control">
                            <i class="icofont icofont-eye-alt"></i></a>
                        <a href="/admin/edit-lender/${data._id}?is_supper=1" class="btn btn-mini btn-outline-info accordion-toggle md-details-control">
                            <i class="icofont icofont-ui-edit"></i></a>
                    `;
                }
            }
        ]
    });
    
    var financeTable = $('#financeTable').DataTable({
        'searching': false,
        'processing': true,
        "info": false,
        "paging": false,
        'serverSide': true,
        'lengthChange': false,
        "ordering": false,
        "language": {
            'loadingRecords': '&nbsp;',
            'processing': '<div class="spinner"></div>'
        },
        'ajax': {
            'type': 'POST',
            'url': '/admin/get-lenders',
            'data': function (d) {
                // var info = $('#financeTable').DataTable().page.info();
                d.is_supper_lender = true;
                d.page = 0;
                d.pageSize = 10;
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
            }
        ]
    });

    var mWallet = $('#mWalletTable').DataTable({
        'searching': false,
        'processing': true,
        "info": false,
        "paging": false,
        'serverSide': true,
        'lengthChange': false,
        "ordering": false,
        "language": {
            'loadingRecords': '&nbsp;',
            'processing': '<div class="spinner"></div>'
        },
        'ajax': {
            'type': 'POST',
            'url': '/admin/mWallet',
            'data': function (d) {
                // var info = $('#financeTable').DataTable().page.info();
                d.is_supper_lender = true;
                d.page = 0;
                d.pageSize = 10;
                d._csrf = token;
            },
            'dataSrc': 'result',
            'dataFilter': function (data) {
                var json = $.parseJSON(data);
                var info = $('#mWalletTable').DataTable().page.info();
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
                "data": null,
                "render": function (data) {
                    return 'Monoova';
                }
            },
            {
                "data": "wallet_test_account_number",
                "render": function (data) {
                    return data ? data : ' N/A';
                }
            },
            {
                "data": "wallet_test_balance",
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', 
                                { style: 'currency', currency: 'USD' }
                            ).format(
                                data ? data : 0
                            )
                }
            },
            {
                "data": "wallet_live_account_number",
                "render": function (data) {
                    return data ? data : ' N/A';
                }
            },
            {
                "data": "wallet_live_balance",
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', 
                                { style: 'currency', currency: 'USD' }
                            ).format(
                                data ? data : 0
                            )
                }
            },
            {
                "data": "wallet_created_date",
                "render": function (data) {
                    return moment(data).format('DD/MM/YYYY hh:mm:ss A');
                }
            },
            {
                "data": {
                    lender: {
                        _id: "_id",
                        lender_name: "lender_name",
                        wallet_test_account_number: "wallet_test_account_number",
                        wallet_live_account_number: "wallet_live_account_number"
                    }
                },
                "render": function (data) {
                    if (data.wallet_test_account_number || data.wallet_live_account_number) {
                        return `
                            <a href="javascript:void(0)" title="Pay in to mWallet" data-toggle="modal" data-target="#${data._id}_pay" data-id-number="${data._id}" class="btn btn-mini btn-outline-info accordion-toggle md-payment">
                                <i class="icofont icofont-dollar-plus"></i></a>
                            <div class="modal fade" id="${data._id}_pay" tabindex="-1" role="dialog" aria-hidden="true">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-header--custom">
                                        <h5 style="color: #fff;" class="modal-title">Deposit to mWallet</h5>
                                    </div>
                                    <div class="modal-content">
                                        <div class="modal-body">
                                            <div class="form-check mb-3">
                                                <p class="mb-2"><b>Please select mode:</b></p>
                                                <input type="radio" name="mode" value="TEST" required>
                                                <label for="male">Test mode</label><br>
                                                <input type="radio" name="mode" value="LIVE" required>
                                                <label for="female">Live mode</label><br>
                                                <div class="invalid-feedback">
                                                    Please chose mode
                                                </div>
                                            </div>
                                            <div class="form-group mt-3 jsValue">
                                                <label><b>Amount</b></label>
                                                <input type="number" name="amount_pay" min="1" class="form-control" placeholder="Enter amount" required>
                                                <div class="invalid-feedback">
                                                    Please provide a valid amount
                                                </div>
                                            </div>
                                        </div>
                                        <div class="modal-footer justify-content-around">
                                            <button type="button" style="width: 40%" class="btn btn-default waves-effect"
                                            data-dismiss="modal">No</button>
                                            <button type="button" style="width: 40%"
                                                class="btn btn-primary waves-effect waves-light btn-submit" data-id-number="${data._id}">Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        return `
                        <a href="javascript:void(0)" data-id-number="${data._id}" class="btn btn-mini btn-outline-info accordion-toggle md-details-control btn-add">
                        <i class="icofont icofont-plus-circle"></i></a>`;
                    }
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

    $('#mWalletTable').on('click', "a.btn-add", () => {
        showLoading();
        const id = $(this)[0].activeElement.dataset.idNumber;
        $.ajax({
            dataType: 'json',
            method: "POST",
            url: `/admin/mWallet/${id}`,
            data: {
              "_csrf": token,
              "key": key
            },
            async: true,
            success: function (data) {
                hideLoading();
                if (data.success) {
                    showToast('success', data.messages)
                } else {
                    showToast('error', data.messages);
                }
                mWallet.ajax.reload();
                return true;
            },
            error: function () {
                hideLoading();
              showToast('error', "Please try again!")
              return false;
            }
        });
    })

    $('#mWalletTable').on('click', ".btn-submit", () => {
        var validate = true;
        const id = $(this)[0].activeElement.dataset.idNumber;
        const divContent = $(`#${id}_pay`).find('.jsValue');
        var amount = $(`#${id}_pay`).find('.jsValue input').val();
        if (amount == '') {
            validate = false;
            divContent.addClass('was-validated');
        }
        var mode = $(`#${id}_pay`).find('input[name="mode"]:checked').val();
        if (mode == undefined) {
            validate = false;
            $(`#${id}_pay`).find('.form-check .invalid-feedback').css('display', 'block');
        }
        if (validate) {
            showLoading();
            $.ajax({
            dataType: 'json',
            method: "PUT",
            url: `/admin/mWallet/${id}`,
            data: {
                "key": key,
                "mode": mode,
                "amount": amount,
                "id": "id",
                "_csrf": token,
            },
            async: true,
            success: function (data) {
                hideLoading();
                if (data.success) {
                    showToast('success', data.messages)
                } else {
                    showToast('error', data.messages);
                }
                mWallet.ajax.reload();
                $(`#${id}_pay`).removeClass('show');
                $(document).find('.modal-backdrop.fade').remove();
                return true;
            },
            error: function () {
                hideLoading();
                showToast('error', "Please try again!")
                return false;
            }
        });
        }
    })

    // setFooterTable(1);
    $('#lender-tab').click(() => {
        $('#lender-tab').addClass('active');
        $('#finance-tab').removeClass('active');
        $('#mWallet-tab').removeClass('active');
        $('#lender').addClass('show active');
        $('#finance').removeClass('show active');
        $('#mWallet').removeClass('show active');
        mode = 1;
        // setFooterTable(mode);
    });

    $('#finance-tab').click(() => {
        $('#finance-tab').addClass('active');
        $('#lender-tab').removeClass('active');
        $('#mWallet-tab').removeClass('active');
        $('#finance').addClass('show active');
        $('#lender').removeClass('show active');
        $('#mWallet').removeClass('show active');
        mode = 0;
        // setFooterTable(mode);
    });

    $('#mWallet-tab').click(() => {
        $('#mWallet-tab').addClass('active');
        $('#finance-tab').removeClass('active');
        $('#lender-tab').removeClass('active');
        $('#mWallet').addClass('show active');
        $('#lender').removeClass('show active');
        $('#finance').removeClass('show active');
        mode = 1;
    });

    $('#financeTable').on('click', 'a.md-details-control', function () {
        var tr = $(this).closest('tr');
        var row = financeTable.row(tr);
        let data = row.data();
        lenderId = data._id;
        financialDetailTable.ajax.reload();
        // setFooterTable(2);
        //show content detail
        $('#jsShowContentPage').addClass('hide');
        $('#jsDetailFinance').addClass('show');
        $('#jsDetailFinance').removeClass('hide');
    });

        // show Loading
        function showLoading() {
            $('#jsLoader').addClass('show');
        }
        //hide loading
        function hideLoading() {
            setTimeout(function () {
                $('#jsLoader').removeClass('show');
            }, 500);
        }

        function showToast(name, mess) {
            $('#jsErr').removeClass();
            $('#jsErr').addClass(`show ${name}`);
            $('#jsErr p').text(mess);
            setTimeout(() => {
                $('#jsErr').removeClass(`show ${name}`);
            }, 2500);
        }

});