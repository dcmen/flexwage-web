let tableTransactions;
$(document).ready(function () {
    const token = $('input[name="_csrf"]').val();
    let modePeriod  = 1;
    var startDate = moment().startOf('month');
    var endDate = moment().add(3, 'month');
    let startDateSelect = "", endDateSelect = "";
    let pageSize = 10, page = 0, totalPage = 0, isExport;
    let stringPay, transactionMode = 0, system_code, isChange = false;
    let arr = window.location.pathname.split('/');
    let idCompany = (arr[arr.length - 1]).length == 24 ? arr[arr.length - 1] : "";
    if (idCompany != "") {
        stringPay = getPeriod(idCompany);
    }
    let option_login = $("input[name='option_login']").val();
    let pay_periods_id = "";
    if(option_login == "User") {
        let staff = JSON.parse(localStorage.getItem('staff'));
        idCompany = staff.company_id;
        stringPay = getPeriod(idCompany);
    }
    let tag = 'disabled';
    if (idCompany != "") {
        tag = '';
    }
    let dataSort = getAllCompany(idCompany);
    tableTransactions = $('#trancastionsTable').DataTable({ 
        "paging": true,
        "ordering": false,
        "lengthChange": true,
        'pageLength': pageSize,
        "info": true,
        "searching": false,
        'serverSide': true,
        'processing': true,
        "language": {
            'loadingRecords': '&nbsp;',
            'processing': '<div class="spinner"></div>'
        },
        'ajax': {
            'type': 'POST',
            'url': `/get-transactions`,
            'data': function (d) {
                var info = $('#trancastionsTable').DataTable().page.info();
                d.isAll = 0;
                d.company_id = idCompany; //idCompany;
                d.page = info.page;
                d.pageSize = info.length;
                d._csrf = token;
                d.payPeriod = pay_periods_id;
                d.mode = transactionMode;
                d.startDate = startDateSelect ? startDateSelect.format('YYYY-MM-DD') : '';
                d.endDate = endDateSelect ? endDateSelect.format('YYYY-MM-DD') : '';
            },
            'dataSrc': 'result',
            'dataFilter': function (data) {
                var json = $.parseJSON(data);
                json.result = json.result.map(item => ({
                    ...item,
                    DT_RowId: `row_${item._id}`
                }));
                if (!json.success) {
                    json.result = [];
                    json.totalItem = 0;
                }
                $('.txtRun').html(`-$${json.totalRun.toFixed(2)}`);
                json.recordsTotal = json.totalItem;
                json.recordsFiltered = json.totalItem;
                totalPage = json.totalPage;
                if (!isExport) {
                    setFooterTable(totalPage, json.totalItem);
                }
                return JSON.stringify(json);
            }
        },
        'columns': [
            {
                "data": null,
                "render": function (data, type, full, meta) {
                    return (page*pageSize) + (meta.row + meta.settings._iDisplayStart + 1);
                }
            },
            {
                "data": "company",
                "render": function (data) {
                    return data.company_name;
                }
            },
            {
                "data": "staff",
                "render": function (data) {
                    return data.fullname;
                }
            },
            {
                "data": "pay_deductions",
                "render": function (data) {
                    return moment(data.date).format('DD-MM-YYYY, h:mm A');
                }
            },
            {
                "data": "staff",
                "render": function (data) {
                    return 'Withdrawal to employee ' + data.fullname;
                }
            },
            {
                "data": null,
                "render": function () {
                    return "DD"
                }
            },
            {
                "data": {
                    total_deduction: "total_deduction" ? "total_deduction" : "0",
                    amount: "amount"
                },
                "render": function (data) {
                    return `$${Number(data.total_deduction).toFixed(2)}`;
                }
            },
            {
                "data": {
                    total_deduction: "total_deduction" ? "total_deduction" : "0",
                    amount: "amount"
                },
                "render": function (data) {
                    return `$${(Number(data.total_deduction) - Number(data.amount)).toFixed(2)}`;
                }
            },
            {
                "data": null,
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }
                      ).format(
                        0
                      );
                }
            },
            {
                "data": "pay_deductions",
                "render": function (data) {
                    let status = data.status
                    if(status == "PAID" || !status || status == '') {
                        return `<span class="text-success">Paid`;
                    } else {
                        return `<span class="text-warning">Pending`;
                    }
                }
            }
        ]  
    });
    // Create file Aba
    $('#trancastionsTable tbody').on('click', 'button.btn-click', function () {
        var tr = $(this).closest('tr');
        var row = tableTransactions.row(tr);
        var dataRow = row.data();
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/create-aba`,
            data: {
                deduction_id: dataRow._id,
                pay_deduction_id: dataRow.pay_deductions._id,
                staff_id: dataRow.staff._id,
                "_csrf": token
            },
            async: true,
            success: function (data) {
                if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
                    loginAgain();
                    return;
                  }
                tableTransactions.ajax.reload();
                showToast('success', 'File created successfully.');
                return true;
            },
            error: function () {
                showToast('error', "Can't connect to server. Try again")
                return false;
            }
        });
    });

    $('#trancastionsTable_wrapper .row:first-child div:nth-child(1)').removeClass('col-md-6');
    $('#trancastionsTable_wrapper .row:first-child div:nth-child(1)').addClass('unset-over-forlow');

    $('#trancastionsTable_wrapper .row:first-child div:nth-child(2)')
    .append(`<div style="height: 100%;" id="jsFilter" class='d-flex align-items-center justify-content-between'>
        <div class='d-flex align-items-center filter-custom'>
            <div class="dropdow-filter dropdow-company mr-2">
                <select name="company" id="jsCompanyFilter" class=" form-control">
                    ${dataSort.join(' ')}
                </select>
            </div>
            <div class="dropdow-filter dropdow-period ml-2">
                <select style="width: auto;" name="period" id="jsPeriod" class="form-control" ${tag}>
                    <option value="0">Choose Pay Period</option>
                    ${stringPay ? stringPay.join(' ') : ''}
                </select>
            </div>
            <div class="ml-1">
                <button title="Switch pay period or rank" id="jsSwitchDrop"><i class="icofont icofont-exchange"></i></button>
            </div>
            <div class="dropdow-filter dropdow-transaction ml-3 d-flex">
                <select name="period" id="jsTransactionMode" class="form-controller">
                    <option value="0" selected>Withdrawals</option>
                    <option value="1">Deductions</option>
                </select>
                <div class="dropdown ml-3">
                    <button type="button" class="btn btn-primary btn-sm dropdown-toggle"
                    id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="icofont icofont-download-alt"></i> Export data
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                        <button id="jsCsv" class="dropdown-item" type="button">CSV file</button>
                        <button id="jsExcel" class="dropdown-item" type="button">EXCEL file</button>
                        <button id="jsPdf" class="dropdown-item" type="button">PDF file</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="txt-show-total mr-2 ml-2"><b>Running Total: <span class="txtRun ml-2" style="color: red;"></span></b></div>
        </div>`
    )
    .addClass('col-md-12');

    $('#jsCompanyFilter').on('change', function() {
        if (this.value  != "0") {
            pay_periods_id = "";
            idCompany = this.value;
            tableTransactions.ajax.reload();
            let payPeriod = getPeriod(this.value);
            if (payPeriod.length > 0) {
                $('#jsPeriod').prop("disabled", false);
                $('#jsPeriod').html(`<option value="0">Choose Pay Period</option> ${payPeriod.join(' ')}`);
            } else {
                $('#jsPeriod').prop("disabled", true);
                $('#jsPeriod').html(`<option value="0">Choose Pay Period</option>`);
            }
        } else {
            $('#jsPeriod').prop("disabled", true);
            pay_periods_id = "";
            if(option_login == "User") {
                let staff = JSON.parse(localStorage.getItem('staff'));
                idCompany = staff.company_id;
            } else {
                let arr = window.location.pathname.split('/');
                idCompany = (arr[arr.length - 1]).length == 24 ? arr[arr.length - 1] : "";
            }
            tableTransactions.ajax.reload();
        }
    });

    $(document).on('change', "#jsPeriod", function() {
        if (this.value  != "0") {
            pay_periods_id = this.value;
            tableTransactions.ajax.reload();
            $('#jsPeriod').prop("disabled", false);
        } else {
            pay_periods_id = "";
            tableTransactions.ajax.reload();
        }
    });

    $('#jsCompanyFilter').select2();
    $('#jsPeriod').select2();

    $(document).on('click', '#jsSwitchDrop', () => {
        if (modePeriod) {
            pay_periods_id = "";
            $('.dropdow-period').html(`
                <div style="height: 35px; padding: 8px 10px;" id="ts_dateranger1" class="pull-left form-control d-flex justify-content-between align-items-center">
                    <i class="icofont icofont-calendar"></i>&nbsp;
                    <span style="white-space: nowrap;"></span> <div class="float-right"><b class="icofont icofont-caret-down"></b></div>
                </div>
                <button style="height: 25px; margin-top: 5px;" hidden class="btn btn-mini btn-outline-danger btn-refresh-ts ml-1">
                    <i class="icofont icofont-close"></i>
                </button>
            `).addClass('d-flex');
            modePeriod = 0;
        } else {
            pay_periods_id = "";
            startDateSelect = "";
            endDateSelect = "";
            if (idCompany != "") {
                tag = '';
                stringPay = getPeriod(idCompany);
            } else {
                tag = 'disabled';
            }
            $('.dropdow-period').html(`
                <select name="period" id="jsPeriod" class="form-control" ${tag}>
                    <option value="0">Choose Pay Period</option>
                    ${stringPay ? stringPay.join(' ') : ''}
                </select>
            `).removeClass('d-flex align-items-center');
            modePeriod = 1;
            $('#jsPeriod').select2();
        }
        tsDateRanger();
    });

    $('#jsTransactionMode').on('change', function() {
        transactionMode = $("#jsTransactionMode").children("option:selected").val();
        page = 0;
        pageSize = 10;
        tableTransactions.ajax.reload();
    })

    //refresh all timesheet
    $(document).on('click', '.btn-refresh-ts', function() {
        $('.btn-refresh-ts').attr('hidden', true);
        startDate = moment().startOf('month');
        endDate = moment().add(3, 'month');
        startDateSelect = "";
        endDateSelect = "";
        tsDateRanger();
        tableTransactions.ajax.reload();
    })

    //choose option export
    $(document).on('click', '#jsCsv, #jsExcel, #jsPdf', (e) => {
        showLoading();
        let id = e.target.id;
        isExport = true;
        let data = getDataExport();
        mainExport(id, data);
        isExport = false
    });
      
    // $(document).on('change', '.jsSelectPageSize', () => {
    //     pageSize = $('.jsSelectPageSize').find('option').filter(':selected').val();
    //     page = 0;
    //     tableTransactions.ajax.reload((json) => {
    //         setFooterTable(json.totalPage, json.totalItem);
    //     });
    // })

    function showLoading() {
        if(!$('#jsLoading').length) {
            $('#transactions, #jsTransactionDiv').append(`<div id="jsLoading">
                <div style="top: 40%; left: 0px;" class="loader">
                    <div class="loader-chiled"></div>
                </div>
            </div>`);
        }
    }

    function hideLoading() {
        setTimeout(() => {
            $('#jsLoading').remove();
        }, 2000);
    }

    function setFooterTable() {
        let divLength = $( "#trancastionsTable_wrapper .row:first-child div:nth-child(1) #trancastionsTable_length").addClass('pagination--custom');
        $('#trancastionsTable_wrapper .row:last-child div:nth-child(1)').append(divLength);
    }

    function mainExport(id, data) {
        let title = $('#jsTransactionMode').children("option:selected").text();
        let type = $('#jsCompanyFilter').children("option:selected").text();
        let payPeriod = $('#jsPeriod').children("option:selected").text();
        let dataTable = {header: [], body: []}, feeTotal = 0;
        dataTable.header = ["#","Company Name","Staff Name","Date","Description","Type","Debit","Credit","Balance"];
        data.json.forEach((item, index) => {
            let total_deduction = item.total_deduction ? item.total_deduction : 0;
            let cell = {
                no: index + 1,
                companyName: item.company.company_name,
                staffName: item.staff.fullname,
                date: moment(item.pay_deductions.date).format('DD-MM-YYYY h:mm:ss A'),
                description: 'Withdrawal to employee ' + item.staff.fullname,
                type: "DD",
                debit: `$${Number(total_deduction).toFixed(2)} (Inc. $${(Number(total_deduction) - Number(item.amount)).toFixed(2)} Fee)`,
                credit: "0",
                balance: "-$" + total_deduction.toFixed(2)
            };
            feeTotal += item.fee_amount
            dataTable.body.push(cell);
        });
        dataTable.feeTotal = "-$" + feeTotal.toFixed(2);
        dataTable.title =  title + " Reports";
        dataTable.type = type == "Choose Company" ? "All" : type;
        if (startDateSelect == "" && endDateSelect == "") {
            dataTable.payPeriod = payPeriod != "Choose Pay Period" && idCompany != "" ? payPeriod : "All";
        } else {
            dataTable.payPeriod = $('#ts_dateranger1').children("span").text();
        }
        dataTable.date = moment().format('MM/DD/YYYY');
        dataTable.runTotal = $('#jsFilter .txtRun').text();
        switch (id) {
            case "jsCsv":
                generateCsv(dataTable);
                break;
            case "jsExcel":
                generateExcel(dataTable);
                break;
            case "jsPdf":
                generatePDF(dataTable);
                break;
            default:
                hideLoading();
                break;
        }
    }

    function generateExcel(json) {
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/admin/excel`,
            data: {
                "_csrf": token,
                "json": JSON.stringify(json),
            },
            async: true,
            success: function (responsive) {
                if (responsive.code == 200) {
                    var blob = convertBase64toBlob(responsive.data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    saveAs(blob, Date.now().toString() + ".xlsx");
                    hideLoading();
                }
            },
            error: function (e) {
                showToast('error', "Can't connect to server. Try again")
                hideLoading();
                return false;
            }
        });
    }

    function generateCsv(json) {
        let csvContent = "";
        csvContent += json.title + "\r\n";
        csvContent += "Company:" + json.type + "                       " + "Running Total:" + json.runTotal + "\r\n";
        csvContent += "Pay Period:" + json.payPeriod + "                  " + "Fee Total:" + json.feeTotal + "\r\n";
        csvContent += "Date Report: " + json.date + "\r\n";
        csvContent += json.header.join(",") + "\r\n";
        json.body.forEach(function(rowArray) {
            let row = (Object.values(rowArray)).join(",");
            csvContent += row + "\r\n";
        });
        var blob = new Blob([csvContent], {
            type: "data:text/csv;charset=utf-8"
          });
        saveAs(blob, Date.now().toString() + ".csv");
        hideLoading();
    }

    function generatePDF(json) {
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/admin/pdf`,
            data: {
                "_csrf": token,
                "json": JSON.stringify(json),
            },
            async: true,
            success: function (responsive) {
                if (responsive.code == 200) {
                    var blob = convertBase64toBlob(responsive.data, 'application/pdf');
                    saveAs(blob, Date.now().toString() + ".pdf");
                    hideLoading();
                }
            },
            error: function (e) {
                showToast('error', "Can't connect to server. Try again")
                hideLoading();
                return false;
            }
        });
    }

    function convertBase64toBlob(content, contentType) {
        contentType = contentType || '';
        var sliceSize = 512;
        var byteCharacters = window.atob(content); //method which converts base64 to binary
        var byteArrays = [
        ];
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
          type: contentType
        }); //statement which creates the blob
        return blob;
    }

    function getDataExport() {
        let data;
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/get-transactions`,
            data: {
                "isAll": 1,
                "company_id": idCompany, //idCompany,
                "_csrf": token,
                "payPeriod": pay_periods_id,
                "mode": transactionMode,
                "startDate": startDateSelect ? startDateSelect.format('YYYY-MM-DD') : '',
                "endDate": endDateSelect ? endDateSelect.format('YYYY-MM-DD') : '',
                "pageSize": pageSize,
                "page": 0
            },
            async: false,
            success: function (res) {
                if (res.code == 200) {
                    data = {
                        json: [...res.result],
                        totalRun: res.totalRun
                    };
                }
                return true;
            },
            error: function () {
                showToast('error', "Can't connect to server. Try again")
                return false;
            }
        });
        return data;
    }

    //timesheet dateranger
    function tsDateRanger() {
        //set all timesheet
        $('#ts_dateranger1 span').html('All Timesheets');
        //create daterangerpicker
        $('#ts_dateranger1').daterangepicker({
            startDate: startDate,
            endDate: endDate,
            locale: { direction: 'timesheet-daterangepicker' }
            }, function(start, end) {
                //check start date choose and start date parent
                if (start.format('L') != moment().startOf('month').format('L') || end.format('L') != moment().add(3, 'month').format('L')) {
                    $('#ts_dateranger1 span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
                }
                startDateSelect = start;
                endDateSelect = end;
        });
        //check filter date ranger timesheet
        $('#ts_dateranger1').on('apply.daterangepicker', function() {
            $('.btn-refresh-ts').attr('hidden', false);
            tableTransactions.ajax.reload();
        });
    }

    function getAllCompany(id) {
        let string = [];
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/get-companies?company_id=${id}`,
            data: {
                "_csrf": token
            },
            async: false,
            success: function (data) {
                if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
                    loginAgain();
                    return;
                  }
                if (data.result.length > 1) {
                    string.push('<option value="0">Choose Company</option>');
                }
                data.result.forEach(element => {
                    string.push(`<option value="${element._id}">[ ${ element.system.code.slice(0, 1) + element.system.code.slice(1).toLowerCase()} ] ${element.company_name}</option>`);
                });
            },
            error: function () {
                showToast('error', "Can't connect to server. Try again")
            }
        });
        return string;
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

    function getPeriod(id) {
        let string = [];
        $.ajax({
            dataType: "json",
            method: "GET",
            url: `/get-pay-period?company_id=${id}`,
            async: false,
            success: function (data) {
                if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
                    loginAgain();
                    return;
                  }
                data.result.forEach(element => {
                    if (element.xero_pay_calendar) {
                        string.push(`<option value="${element._id}">[ ${element.xero_pay_calendar.Name} ] ${moment(element.start_date).format('DD/MM')} - ${moment(element.end_date).format('DD/MM/YYYY')}</option>`);
                    }
                    if (element.pay_period_origination) {
                        let code = "";
                        if (element.company_brands.length > 0) {
                            code = `[${element.company_brands[0].code}]`;
                        }
                        string.push(`<option value="${element._id}"> ${code}[ ${element.pay_period_origination.name} ] ${moment(element.start_date).format('DD/MM')} - ${moment(element.end_date).format('DD/MM/YYYY')}</option>`);
                    }
                    if (element.keypay_pay_schedule) {
                        string.push(`<option value="${element._id}">[ ${element.keypay_pay_schedule.name} ] ${moment(element.start_date).format('DD/MM')} - ${moment(element.end_date).format('DD/MM/YYYY')}</option>`);
                    }
                });
            },
            error: function () {
                showToast('error', "Can't connect to server. Try again")
            }
        });
        return string;
    }

    $('#buttonOkTableEmployeesFailFound').on('click', () => {
        tableTransactions.ajax.reload();
    })
});
