const origin = window.origin;
let isLoad = true;
const socket = io();
let financialLink;
let isConnect;

function showToast(name, mess, nameErrId = '#jsErr') {
    $(nameErrId).addClass(`show ${name}`);
    $(`${nameErrId} p`).html(mess);
    setTimeout(() => {
        $(nameErrId).removeClass(`show ${name}`);
    }, 2500);
}

function showLoading() {
    $('#jsLoader').addClass('show');
}

function hidenLoading() {
    setTimeout(function () {
        $('#jsLoader').removeClass('show');
    }, 500);
}

function validateNumber(evt, isMan) {
    var regex;
    var theEvent = evt || window.event;

    // Handle paste
    if (theEvent.type === 'paste') {
        key = event.clipboardData.getData('text/plain');
    } else {
        // Handle key press
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    if (theEvent.target.name == 'limit_number_of_employee') {
        regex = /[0-9]/g;
    } else {
        regex = /[0-9]|\./;
    }
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }
}

$("body").tooltip({ selector: '[data-toggle=tooltip]' });

function loginAgain() {
    // if the ok button is clicked, result will be true (boolean)
    alert("Your password was changed. Please try to login again.");
    // the user clicked ok
    $('#logout')[0].click();
}

$(document).ready(function () {
    const token = $('input[name="_csrf"]').val();
    const idCompany = $("input[name='_id']").val();
    const selfFinancedInput = $('input[name=typeFinanced]:checked', '#myForm').val();
    const company = JSON.parse($('input[name="company"]').val());
    const systemCompanyId = $("input[name='systemCompanyId']").val();
    const systemCode = $("input[name='systemCode']").val();
    const urlApi = $("input[name='urlApi']").val();
    const urlKeyPay = $('#urlKeyPay').val();
    const urlXero = $('#urlXeRo').val();
    const urlReckon = $('#urlReckon').val();
    const key = $('input[name="key"]').val();
    const urlDeputy = $('#urlDeputy').val();
    const jsonLender = $('input[name="lenderLinkCompany"]').val();
    const lenderLinkCompany = jsonLender !== '' ? JSON.parse(jsonLender) : '';
    const pupupWidth = screen.width - 400;
    const pupupHeight = screen.height - 200;
    const windowFeatures =
        `resizable,scrollbars=0,status,top=100,left=200,width=${pupupWidth},height=${pupupHeight}`;
    let dataUpdateRefreshToken = {
        systemCode,
        "_csrf": token
    };
    let request = null,
        deductionFileMethod, feeValue, feeType, emailsInput;
    let checkboxDeduction = $('.cb-deduction-method'),
        checkboxPayPeriods = $('.cb-pay-period');

    const tabGroupName1 = ['#jsWelcome', '#jsFinancial', '#jsMonoova', '#jsCompany', '#jsPayroll', '#jsKYC', '#chatSetup'];
    const tabGroupName2 = ['#jsStaff', '#jsStaffInvitation', '#jsDedutionFiles',
        '#jsFeedBacks', '#jsTimesheetRequest', '#jsTransaction', '#jsWallet'
    ];
    const tabGroupName3 = ['#jsTimesheet', '#jsRequest'];
    const tabGroupName4 = ['#jsProcessControl', '#jsPayrun', '#deductionRepayment', '#jsDirectDebitSetup'];
    const tabGroupName5 = ['#monoovaSetup', '#bankSetup', '#validateBank', '#jsPaymentVerify'];
    const tabGroupName6 = ['#transactionTab', '#reconcileTab', '#monoovaTab', '#payCycleTab'];

    const tabGroupMultipleName = [];
    tabGroupMultipleName.push(tabGroupName1, tabGroupName2, tabGroupName3, tabGroupName4, tabGroupName5, tabGroupName6);

    tabGroupMultipleName.forEach(groupName => {
        groupName.forEach((name, index) => {
            const [...groupNameCopy] = groupName;
            groupNameCopy.splice(index, 1);
            $(name).click(() => {
                $(name).addClass('active');
                $(`${name}Div`).removeClass('hiden');
                if (name === '#jsMonoova' && lenderLinkCompany) {
                    const receivables_account_bsb = lenderLinkCompany?.lenders[0]?.receivables_account_bsb,
                            receivables_account_number = lenderLinkCompany?.lenders[0]?.receivables_account_number;

                    let bsb = receivables_account_bsb ? decryptString(receivables_account_bsb) : 'N/A';
                    let number = receivables_account_number ? decryptString(receivables_account_number) : 'N/A';
                    $("#jsAccountBsb").text(bsb);
                    $("#jsAccountNumber").text(number);
                }
                groupNameCopy.forEach(item => {
                    $(item).removeClass('active');
                    $(`${item}Div`).addClass('hiden');
                });
                // get data tab Payroll
                if (name === '#jsPayroll') {
                    $.ajax({
                        dataType: "json",
                        type: "GET",
                        url: `/get-payroll-data?_csrf=${token}&companyId=${idCompany}&code=${systemCode}`,
                        success: function (data) {
                            if (data.success) {
                                const {xeroAccounts, deductionCategory} = data.result;
                                if (xeroAccounts.length > 0) {
                                    $('#jsTotalGLAccount').text(xeroAccounts.length);
                                    let stringHtml = '<option selected disabled value="default">Select...</option>';
                                    xeroAccounts.forEach(item => {
                                        stringHtml += `<option value="${item.Code}">${item.Code}: ${item.Name}</option>`;
                                    });
                                    $('#deductionAccount').html(stringHtml);
                                } else {
                                    $('#jsTotalGLAccount').text(0);
                                }

                                if (deductionCategory.length > 0) {
                                    // DeductionCategory
                                    $('#jsTotalDeductionCategory').text(deductionCategory.length);
                                    let stringSalaryAdvanceHtml = '<option disabled selected>Choose deduction category </option>';
                                    let stringFeeHtml = '<option disabled selected>Choose deduction category </option>';  
                                    deductionCategory.forEach(item => {
                                        if (systemCode === 'KEYPAY') {
                                            const selected = (company.keypay_deduction_category_id && company.keypay_deduction_category_id.toString()) == item._id.toString() ? "selected" : "";
                                            const selected1 = (company.keypay_deduction_category_fee_id && company.keypay_deduction_category_fee_id.toString()) == item._id.toString() ? "selected" : "";
                                            stringSalaryAdvanceHtml += `<option value="${item._id}" ${selected}>${item.name}</option>`;
                                            stringFeeHtml += `<option value="${item._id}" ${selected1}>${item.name}</option>`;
                                        } else {
                                            if (systemCode !== 'ASTUTE') {
                                                const selected = (company.deduction_type_xero_id && company.deduction_type_xero_id.toString()) == item._id.toString() ? "selected" : "";
                                                const selected1 = (company.deduction_type_xero_fee_id && company.deduction_type_xero_fee_id.toString()) == item._id.toString() ? "selected" : "";
                                                stringSalaryAdvanceHtml += `<option value="${item._id}" ${selected}>${item.Name}</option>`;
                                                stringFeeHtml += `<option value="${item._id}" ${selected1}>${item.Name}</option>`;
                                            }
                                        }
                                    });
                                    $('.deduction-file-category .selectSalaryAdvance').html(stringSalaryAdvanceHtml);
                                    $('.deduction-file-category .selectFee').html(stringFeeHtml);
                                } else {
                                    $('#jsTotalDeductionCategory').text(0);
                                }
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        },
                      });
                }
            });
        });
    });

    // get Total Invitations
    $.ajax({
        dataType: "json",
        type: "GET",
        url: `/get-total-unaccepted-invitations?_csrf=${token}&companyId=${idCompany}`,
        success: function (data) {
            $('#jsTotalInvitations').text(data.totalUnacceptedInvitations);
        },
        error: function (err) {
            console.log(err);
        },
    });

    // get Total Registered
    $.ajax({
        dataType: "json",
        type: "GET",
        url: `/get-total-registered?_csrf=${token}&companyId=${idCompany}`,
        success: function (data) {
            $('#jsTotalRegistered').text(data.totalRegisteredStaffs);
        },
        error: function (err) {
            console.log(err);
        },
    });

    // get Total unregistered
    $.ajax({
        dataType: "json",
        type: "GET",
        url: `/get-total-unregistered?_csrf=${token}&companyId=${idCompany}`,
        success: function (data) {
            $('#jsTotalUnregistered').text(data.totalUnregistered);
        },
        error: function (err) {
            console.log(err);
        },
    });

    if (company?.make_repayment_time) {
        const makeRepaymentTime = toHoursAndMinutes(company.make_repayment_time);
        $('input[name="makePaymentTime"]').val(makeRepaymentTime);   
    }

    if (company?.remind_write_deduction_time) {
        const sendMailTime = toHoursAndMinutes(company.remind_write_deduction_time);
        $('input[name="sendMailTime"]').val(sendMailTime);   
    }

    function toHoursAndMinutes(totalMinutes) {
        const minutes = totalMinutes % 60;
        const hours = Math.floor(totalMinutes / 60);
      
        return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
      }
      
      function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
      }

    $('#directDebitAuthority').on('click', function(event) {
        event.preventDefault();
        $('#directDebitAuthorityModal').modal({
            show: true,
            keyboard: false,
            backdrop: false
        });      
    });

    var _0xacc5 = ['112240rKLcVU', '1942xUrgHJ', 'enc', '43EtsJuY', '61ygYjGO', 'toString', '457607LRxIBt', 'decrypt', '4957IKkLgF', '82638lmmFym', '292229NKkRSa', 'AES', 'Utf8', '179KmFAgG', '8563MOOdbn'];
    var _0x1687 = function (_0x51b3f3, _0x5ec935) {
        _0x51b3f3 = _0x51b3f3 - 0x87;
        var _0xacc5b4 = _0xacc5[_0x51b3f3];
        return _0xacc5b4;
    };
    (function (_0x17c0ad, _0x50e7ed) {
        var _0x56796f = _0x1687;
        while (!![]) {
            try {
                var _0x3cedc0 = parseInt(_0x56796f(0x89)) * parseInt(_0x56796f(0x8c)) + parseInt(_0x56796f(0x8b)) + -parseInt(_0x56796f(0x94)) + parseInt(_0x56796f(0x91)) + -parseInt(_0x56796f(0x8e)) * parseInt(_0x56796f(0x93)) + parseInt(_0x56796f(0x95)) + parseInt(_0x56796f(0x8f)) * -parseInt(_0x56796f(0x8a));
                if (_0x3cedc0 === _0x50e7ed) break;
                else _0x17c0ad['push'](_0x17c0ad['shift']());
            } catch (_0x182999) {
                _0x17c0ad['push'](_0x17c0ad['shift']());
            }
        }
    }(_0xacc5, 0x5f98a));

    function decryptString(_0x5abc6a) {
        var _0x694660 = _0x1687,
            _0x2d3c46 = CryptoJS[_0x694660(0x87)][_0x694660(0x92)](_0x5abc6a, key),
            _0x2c167e = _0x2d3c46[_0x694660(0x90)](CryptoJS[_0x694660(0x8d)][_0x694660(0x88)]);
        return _0x2c167e;
    }

    // check type 
    if (selfFinancedInput == 1) {
        $('#jsSelfDiv').addClass('active');
    }
    $("#jsSelf").on('click', function () {
        $('#jsSelfDiv').addClass('active');
    });
    $('#jsCashD').on('click', function () {
        $('#jsSelfDiv').removeClass('active');
    });

    $('#jsUpdateMonoova').on('click', function (e) {
        e.preventDefault();
        let inputValue = $('input[name=typeFinanced]:checked', '#myForm').val();
        let getValueMonoova = $('#jsmonoova').is(':checked');
        let idLender = $('#lenderId').val();
        let accountLive = null;
        let keyLive = null;
        let accountTest = null;
        let keyTest = null;
        let isTrue = true;
        let accountLiveTag = $('#inputAccountLive');
        let keyLiveTag = $('#inputKeyLive');
        let accountTestTag = $('#inputAccountTest');
        let keyTestTag = $('#inputKeyTest');
        if (inputValue == 1) {
            accountLive = accountLiveTag.val();
            keyLive = keyLiveTag.val();
            accountTest = accountTestTag.val();
            keyTest = keyTestTag.val();
            if (getValueMonoova) {
                $('#inputAccountTest').parent().removeClass('was-validated');
                $('#inputKeyTest').parent().removeClass('was-validated');
                if (accountLive == '') {
                    accountLiveTag.parent().addClass('was-validated');
                    isTrue = false;
                } else {
                    accountLiveTag.parent().removeClass('was-validated');
                }
                if (keyLive == '') {
                    keyLiveTag.parent().addClass('was-validated');
                    isTrue = false;
                } else {
                    keyLiveTag.parent().removeClass('was-validated');
                }
            } else {
                $('#inputAccountLive').parent().removeClass('was-validated');
                $('#inputKeyLive').parent().removeClass('was-validated');
                if (accountTest == '') {
                    accountTestTag.parent().addClass('was-validated');
                    isTrue = false;
                } else {
                    accountTestTag.parent().removeClass('was-validated');
                }
                if (keyTest == '') {
                    keyTestTag.parent().addClass('was-validated');
                    isTrue = false;
                } else {
                    keyTestTag.parent().removeClass('was-validated');
                }
            }
            if (isTrue) {
                UpdateLender(idLender, idCompany, token, 'SELF_FINANCED', 'Monoova', accountLive, keyLive, accountTest, keyTest);
            }
        } else {
            UpdateLender(idLender, idCompany, token, 'CASHD_FINANCED', 'Monoova', null, null, null, null);
        }
    })

    function UpdateLender(idLender, idCompany, token, fundingType, lenderName, liveAccountNumber, liveApiKey, testAccountNumber, testApiKey) {
        $.ajax({
                method: "post",
                url: `/admin/lender`,
                data: {
                    "_csrf": token,
                    "id": idCompany,
                    "idLender": idLender,
                    "fundingType": fundingType,
                    "lenderName": lenderName,
                    "liveAccountNumber": liveAccountNumber,
                    "liveApiKey": liveApiKey,
                    "testAccountNumber": testAccountNumber,
                    "testApiKey": testApiKey
                },
            })
            .done(function (response) {
                if (response.status == 200) {
                    hidenLoading();
                    showToast('success', "Updated successfully.");
                } else {
                    hidenLoading();
                    showToast('error', 'Update Failed.');
                }
            })
            .fail(function (err) {
                hidenLoading();
            });
    }
    //disabled warning datatable
    $.fn.dataTableExt.sErrMode = 'throw';
    //detect input change limit
    $(`#jsFinancialDiv form input[name="limit_number_of_employee"],
        #jsFinancialDiv form input[name="limit_allowable_percent_drawdown"],
        #jsFinancialDiv form input[name="transaction_fee"], 
        #jsFinancialDiv form input[name="limit_money"], 
        #jsFinancialDiv form input[name="min_withdrawal"],
        #jsFinancialDiv form input[name="threshold_amount"]`)
        .on('input', function () {
            const value = this.value.replace(',', "");
            if (value > -1 && value.match(/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/)) {
                $('#jsSubmit').removeClass('disabled');
                $(this).parent().children('small').text('');
                $(this).css('border-color', '#ccc');
            } else {
                if (value.indexOf(".") != value.length - 1) {
                    $('#jsSubmit').addClass('disabled');
                    $(this).parent().children('small').text('Value must be greater than or equal to 0');
                    $(this).css('border-color', 'red');
                }
            }
        });

    formatInput();

    function formatInput() {
        $('#jsFinancialDiv form input[name="limit_money"]').val(
            new Intl.NumberFormat(
                'en-US', {
                    style: 'currency',
                    currency: 'USD'
                }
            ).format(
                $('#jsFinancialDiv form input[name="limit_money"]').val()
            )
        );
        $('#jsFinancialDiv form input[name="limit_number_of_employee"]').val(
            new Intl.NumberFormat().format(
                $('#jsFinancialDiv form input[name="limit_number_of_employee"]').val()
            )
        );
    }

    $(`#jsFinancialDiv form input[name="limit_number_of_employee"]`)
        .on('focus', function () {
            let value = $(this).val();
            value = value.replace(/[,.$]/g, '');
            $(this).val(value);
        });
    $(`#jsFinancialDiv form input[name="limit_money"], #jsFinancialDiv form input[name="min_withdrawal"], #jsFinancialDiv form input[name="threshold_amount"]`)
        .on('focus', function () {
            let value = $(this).val();
            value = value.replace(/[,$]|\.00/g, '');
            $(this).val(value);
        });
    $(`#jsFinancialDiv form input[name="limit_number_of_employee"]`)
        .on('blur', function () {
            $(this).val(new Intl.NumberFormat().format(
                $(this).val()
            ));
        });
    $('#jsFinancialDiv form input[name="limit_money"], #jsFinancialDiv form input[name="min_withdrawal"], #jsFinancialDiv form input[name="threshold_amount"]')
        .on('blur', function () {
            let value = $(this).val().replace(',', "");
            if (isNaN(value)) {
                value = 0;
                $('#jsSubmit').removeClass('disabled');
                $(this).parent().children('small').text('');
                $(this).css('border-color', '#ccc');
            }
            $(this).val(new Intl.NumberFormat(
                'en-US', {
                    style: 'currency',
                    currency: 'USD'
                }
            ).format(
                value
            ));
        });
    //detect select change unit 
    $('#selectedUnit').on('change', function () {
        let feeValueCompany, feeTypeCompany;
        feeTypeCompany = feeType ? feeType : company.transaction_fee_type;
        feeValueCompany = feeValue ? feeValue : company.transaction_fee_value;
        if (this.value == feeTypeCompany) {
            $('input[name="transaction_fee"]').val(feeValueCompany);
        } else {
            if (this.value == 'DOLLAR') {
                $('input[name="transaction_fee"]').val(5);
            } else {
                $('input[name="transaction_fee"]').val(2.75);
            }
        }
        $('#jsSubmit').removeClass('disabled');
    });

    //detect select change
    $('.deduction-file-category .selectSalaryAdvance').on('change', function () {
        $('.deduction-file-category .selectSalaryAdvance').css('border', '1px solid #ccc');
        $('#jsPayrun b').css('color', '#495057');
    });
    $('.deduction-file-category .selectFee').on('change', function () {
        $('.deduction-file-category .selectFee').css('border', '1px solid #ccc');
        $('#jsPayrun b').css('color', '#495057');
    });
    //custom add icon time picker
    $('.input-group-addon i').removeClass('glyphicon glyphicon-time').addClass('icofont icofont-clock-time');
    $('.inc span').removeClass('glyphicon glyphicon-chevron-up').addClass('icofont icofont-rounded-up');
    $('.dec span').removeClass('glyphicon glyphicon-chevron-down').addClass('icofont icofont-rounded-down');
    $('.bfh-selectbox-toggle .selectbox-caret').addClass('icofont icofont-caret-down');
    //submit form
    $('#jsSubmit').click((e) => {
        if ($('#jsSubmit').hasClass('disabled')) return;
        showLoading();
        e.preventDefault();
        var $inputs = $('#jsFinancialDiv form :input');
        var values = {};
        $inputs.each(function () {
            values[this.name] = $(this).val();
        });
        //
        feeValue = values.transaction_fee;
        let limit_number_of_employee = (values.limit_number_of_employee).replace(/[,.$]/g, '');
        let min_withdrawal = (values.min_withdrawal).replace(/[,$]|\.00/g, '');
        feeType = $('#selectedUnit').val();
        if (values.limit_allowable_percent_drawdown > 0 &&
            limit_number_of_employee > 0 &&
            min_withdrawal > 0) {
            const result = getListEmail(emailsInput);
            if (!$("#email-list").hasClass("disabled")) {
                if (!result.isValid || result.emails?.length == 0) {
                    $(".log-err").removeClass('hide');
                    hidenLoading();
                    return;
                } else {
                    $(".log-err").addClass('hide');
                    if (!$("#emails-input").hasClass("hide")) {
                        $("#emails-input").addClass("hide");
                    }
                    if ($("#email-list").hasClass("hide")) {
                        $("#email-list").removeClass("hide");
                    }
                    if (result.emails?.length > 0) {
                        const text = renderText(result.emails);
                        $("#email-list").text(text);
                    } else {
                        $("#email-list").text("");
                    }
                }
            }
            $.ajax({
                    method: "post",
                    url: `/admin/edit-limit-company/${values._id}`,
                    data: {
                        "_csrf": values._csrf,
                        limit_allowable_percent_drawdown: values
                            .limit_allowable_percent_drawdown,
                        limit_money: (values.limit_money).replace(/[,$]|\.00/g, ''),
                        limit_number_of_employee: limit_number_of_employee,
                        transaction_fee: values.transaction_fee,
                        transaction_fee_type: $('#selectedUnit').val(),
                        min_withdrawal: (values.min_withdrawal).replace(/[,$]|\.00/g, ''),
                        "_id": values._id,
                        threshold_amount: values.threshold_amount ? (values.threshold_amount).replace(/[,$]|\.00/g, '') : 0,
                        recipients_float_alert: JSON.stringify(result.emails)
                    },
                })
                .done(function (response) {
                    if (response.status == 200) {
                        $('#staffTable').DataTable().ajax.reload();
                        hidenLoading();
                        showToast('success', "Updated successfully.");
                        $('#jsFinancial i').removeClass('icon-alert-circle').addClass('icon-check-circle');
                        $('#jsFinancialDiv form input[name="balance_available"]').val(new Intl.NumberFormat(
                            'en-US', {
                                style: 'currency',
                                currency: 'USD'
                            }
                        ).format(
                            (response.data.limit_money - response.data.total_drawn_period)
                        ));
                    } else {
                        hidenLoading();
                        showToast('error', 'Update Failed.');
                    }
                })
                .fail(function (err) {
                    hidenLoading();
                });
        } else {
            hidenLoading();
            showToast('warning', 'Value not expected.');
        }
    });
    // financial table
    financialLink = $('#financial').DataTable({
        'searching': false,
        'processing': false,
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
            'url': '/admin/lender-link-company',
            'data': function (d) {
                d._csrf = token;
                d.is_monoova_live_mode = $('#jsmonoova').is(':checked') ? true : false;
                d._id = idCompany;
            },
            'dataSrc': 'result',
            'dataFilter': function (data) {
                var json = $.parseJSON(data);
                if (!json) {
                    return;
                }
                if (json?.result?.length > 0) {
                    var $jsmonoova = $('#jsmonoova');
                    var lenderRepose = json.result[0];
                    var valueBsbCry = $jsmonoova.is(':checked') ? lenderRepose.live_receivables_account_bsb : lenderRepose.test_receivables_account_bsb;
                    var valueNumberCry = $jsmonoova.is(':checked') ? lenderRepose.live_receivables_account_number : lenderRepose.test_receivables_account_number;
                    var newArr = [valueBsbCry, valueNumberCry];
                    var valueBsb , valueNumber;
                    for (let index = 0; index < newArr.length; index++) {
                        var bytes = CryptoJS.AES.decrypt(newArr[index], key);
                        var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                        if (index == 0) {
                            valueBsb = decryptedData;
                        } else {
                            valueNumber = decryptedData;
                        }
                    }
                    $('#jsReceiverBank').html(`<div class="card-header">
                    <div
                        class="form-group row">
                        <h5
                            class="col-sm-12">
                            Receiver Bank Details<span style="font-weight: 300;display: inline;"> (Your lender)</span>
                        </h5>
                    </div>
                    <hr>
                </div>
                <div
                    class="card-block">
                    <div
                        class="form-group row">
                        <label
                            class="col-sm-4 col-form-label">Bank
                            account
                            name</label>
                        <div
                            class="col-sm-8">
                            <input
                                type="text"
                                class="form-control"
                                disabled
                                value="${$jsmonoova.is(':checked') ? lenderRepose.live_receivables_account_name : lenderRepose.test_receivables_account_name}"
                                maxlength="50">
                        </div>
                    </div>
                    <div
                        class="form-group row">
                        <label
                            class="col-sm-4 col-form-label">Bank
                            account
                            number</label>
                        <div
                            class="col-sm-8">
                            <input
                                type="text"
                                class="form-control"
                                disabled
                                value="${valueNumber}"
                                maxlength="9">
                        </div>
                    </div>
                    <div
                        class="form-group row">
                        <label
                            class="col-sm-4 col-form-label">Bank
                            BSB
                            number</label>
                        <div
                            class="col-sm-8">
                            <input
                                type="text"
                                class="form-control"
                                name="bank_bsb_number"
                                disabled
                                value="${valueBsb}"
                                maxlength="7">
                        </div>
                    </div>
                </div>`);
                } else {
                    $('#jsReceiverBank').html(`<div class="card-header">
                    <div
                        class="form-group row">
                        <h5
                            class="col-sm-12">
                            Receiver Bank Details<span style="font-weight: 300;display: inline;"> (Your lender)</span>
                        </h5>
                    </div>
                    <hr>
                </div>
                <div
                    class="card-block">
                    <p style="text-align: center;">No bank found</p>
                </div>`);
                }
                return JSON.stringify(json);
            }
        },
        'columns': [
            {
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
                "data": { test_receivables_account_name:  "test_receivables_account_name", live_receivables_account_name: "live_receivables_account_name" },
                "render": function (data) {
                    let value = $('#jsmonoova').is(':checked') ? data.live_receivables_account_name : data.test_receivables_account_name;
                    return value ? value : "N/A"
                }
            },
            {
                "data": { test_receivables_account_bsb: "test_receivables_account_bsb", live_receivables_account_bsb: "live_receivables_account_bsb"},
                "render": function (data) {
                    let value = $('#jsmonoova').is(':checked') ? data.live_receivables_account_bsb : data.test_receivables_account_bsb;
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
                    if (value) {
                        var bytes = CryptoJS[_0x4a93c6(0x10c)][_0x4a93c6(0x109)](value, key),
                            decryptedData = bytes[_0x4a93c6(0x10a)](CryptoJS[_0x4a93c6(0x107)][_0x4a93c6(0x108)]);
                        return decryptedData;
                    }
                    return _0x4a93c6(0x102);
                }
            },
            {
                "data": {test_receivables_account_number: "test_receivables_account_number", live_receivables_account_number: "live_receivables_account_number"},
                "render": function (data) {
                    let value = $('#jsmonoova').is(':checked') ? data.live_receivables_account_number : data.test_receivables_account_number;
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
                    if (value) {
                        var bytes = CryptoJS[_0x5ca903(0x71)][_0x5ca903(0x6b)](value, key),
                            decryptedData = bytes['toString'](CryptoJS[_0x5ca903(0x70)][_0x5ca903(0x6d)]);
                        return decryptedData;
                    }
                    return _0x5ca903(0x73);
                }
            },
            {
                "data": "total_amount",
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
                "data": "total_deduction",
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
                "data": {total_amount: "total_amount", total_deduction: "total_deduction"},
                "render": function (data) {
                    return new Intl.NumberFormat(
                        'en-US', 
                                { style: 'currency', currency: 'USD' }
                            ).format(
                                (data.total_amount - data.total_deduction)
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
                                    row.interest_rate_value || 0
                                )
                    }
                    return interestValue;
                }
            }
        ]
    });
    //Table Deduction Repayment in monoova
    // let deductionRepay = $('#deductionRepay').DataTable({
    //     'searching': false,
    //     'processing': false,
    //     "info": false,
    //     "paging": false,
    //     'serverSide': true,
    //     'lengthChange': false,
    //     "ordering": false,
    //     "language": {
    //         'loadingRecords': '&nbsp;',
    //         'processing': '<div class="spinner"></div>'
    //     },
    //     'ajax': {
    //         'type': 'POST',
    //         'url': '',
    //         'data': function (d) {
    //             d._csrf = token;
    //             d._id = idCompany;
    //         },
    //         'dataSrc': 'result',
    //         'dataFilter': function (data) {
    //             var json = $.parseJSON(data);
    //             return JSON.stringify(json);
    //         }
    //     },
    //     'columns': []
    // });

    //Table Deduction Repayment 
    // let deductionRepayment = $('#deductionRepaymentTab').DataTable({
    //     'searching': false,
    //     'processing': false,
    //     "info": false,
    //     "paging": false,
    //     'serverSide': true,
    //     'lengthChange': false,
    //     "ordering": false,
    //     "language": {
    //         'loadingRecords': '&nbsp;',
    //         'processing': '<div class="spinner"></div>'
    //     },
    //     'ajax': {
    //         'type': 'POST',
    //         'url': '',
    //         'data': function (d) {
    //             d._csrf = token;
    //             d._id = idCompany;
    //         },
    //         'dataSrc': 'result',
    //         'dataFilter': function (data) {
    //             var json = $.parseJSON(data);
    //             return JSON.stringify(json);
    //         }
    //     },
    //     'columns': [
    //         {
    //             "data": null,
    //             "render": function (data) {
    //                 return `<div><input type="radio" id="" name="" value=""></div>`;
    //             }
    //         }
    //     ]
    // });

    //submit monoova
    $('#jsmonoova').on('click', function () {
        const liveApikey = $('#liveApiKey').val(),
                oldLenderId = $('#oldLenderId').val();
    
        let isCheck;
        if ($(this).is(':checked')) {
            isCheck = true;
        } else {
            isCheck = false;
        }
        if (!oldLenderId) {
            $(this).prop('checked', false);
            showToast('error', 'Please add lender');
            return;
        }
        // if (!liveApikey) {
        //     $(this).prop('checked', false);
        //     showToast('error', 'Please add live api key in lender');
        //     return;
        // }
        showLoading();

        $.ajax({
                method: "post",
                url: `/admin/edit-monoova_live/${idCompany}`,
                data: {
                    "_csrf": token,
                    is_monoova_live_mode: isCheck,
                    "_id": idCompany,
                    "lenderId": oldLenderId
                },
            })
            .done(function (response) {
                if (response.status == 200) {
                    hidenLoading();
                    showToast('success', "Updated successfully.");
                    financialLink.ajax.reload();
                } else {
                    $('#jsmonoova').prop('checked', false);
                    hidenLoading();
                    showToast('error', response.messages);
                }
            })
            .fail(function (err) {
                hidenLoading();
            });
    });
    //validate bank
    $('#jsValidateBank').on('click', function() {
        let isCheck;
        if ($(this).is(':checked')) {
            isCheck = true;
        } else {
            isCheck = false;
        }
        showLoading();

        $.ajax({
            method: "post",
            url: `/admin/validate-bank_account/${idCompany}`,
            data: {
                "_csrf": token,
                is_validate_bank_account: isCheck
            },
        })
        .done(function (response) {
            if (response.status == 200) {
                hidenLoading();
                showToast('success', "Updated successfully.");
            } else {
                hidenLoading();
                showToast('error', 'Update Failed.');
            }
        })
        .fail(function (err) {
            hidenLoading();
        });
    });
    //update connected system
    $('.btn-reconnect-system').click(function () {
        if ($('.check-connect-system .btn-outline-success span').html() ==
        'Connected') {
            if (systemCode == "XERO") {
                $(".jsTextConfirm").html('<strong>Are you sure you want to disconnect the API.</strong>');
                isConnect = true;
            } else {
                return;
            }
        } else {
            $(".jsTextConfirm").html('<strong>Are you sure you want to connect the API.</strong>');
            isConnect = false;
        }
        $("#jsShowConfirmConnect").modal({show: true});
    });

    //
    $('#jsCancelConfirm').click(function() {
        $("#jsShowConfirmConnect").modal('hide');
    });
    // 
    $('#jsConfirmSubmit').click( function() {
        showLoading();
        if (isConnect) {
            $("#jsShowConfirmConnect").modal('hide');
            disconnectXero(systemCompanyId, idCompany);
        } else {
            switch (systemCode) {
                case 'KEYPAY':
                    runLoginSystem(urlKeyPay, systemCode);
                    break;
                case 'XERO':
                    // runLoginXero();
                    runLoginSystem(urlXero, systemCode);
                    break;
                case 'DEPUTY':
                    runLoginSystem(urlDeputy, systemCode);
                    break;
                case 'RECKON':
                    runLoginSystem(urlReckon, systemCode);
                    break;
                case 'MYOBEXO':
                    alert("Coming Soon!!!");
                    hidenLoading();
                    break;
                case 'ASTUTE':
                    alert("Coming Soon!!!");
                    hidenLoading();
                    break;
                case 'HR3':
                    alert("Coming Soon!!!");
                    hidenLoading();
                    break;
                default:
                    break;
            }
        }
    });

    //sync payroll data
    $('.btn-sync-payroll').click(function () {
        //validate
        if ($(this).hasClass('disabled')) return;

        showLoading();
        //call http request
        $.ajax({
            dataType: 'json',
            type: 'POST',
            url: `/sync-payroll`,
            async: true,
            data: {
                company_id: idCompany,
                "_csrf": token
            },
            success: function (data) {
                if (data.success || systemCode == "ASTUTE") {
                    if (!company.is_first_synced) {
                        location.reload();
                    }
                    var timezone = Math.abs(new Date().getTimezoneOffset()) * 60 * 1000;
                    if (data.timezoneServer == timezone) {
                        $('.last-sync').html('Last Sync: ' + moment(
                            new Date(data.result)).format(
                            'h:mm A DD/MM/YYYY'));
                    } else {
                        $('.last-sync').html('Last Sync: ' + moment(
                            new Date(data.result)).format(
                            'h:mm A DD/MM/YYYY'));
                    }

                    ["#timesheetTable", "#requestTable", "#staffTable", "#glAccountsTable", "#deductionCategoryTable", "#staffInviteTable"].forEach((item) => {
                        $(item).DataTable().page.len(10).draw().ajax.reload(function (json) {
                            if (item == "#staffInviteTable") {
                                $('#jsTotalUnregistered').text(json.recordsTotal);
                            }
                        });
                    });

                    getBanks();
                } else {
                    $('.btn-reconnect-system .circle')
                        .removeClass('pulsating-circle')
                        .addClass('normal-circle');
                    $('.btn-reconnect-system')
                        .removeClass('btn-outline-success')
                        .addClass('btn-outline-secondary');
                    $('.check-connect-system .btn-reconnect-system span')
                        .html('Reconnect');
                    $('.btn-sync-payroll').addClass('disabled');
                    showToast('error', 'Not found company');
                    hidenLoading();
                }
                return true;
            },
            timeout: 1800000,
            error: function (jqXHR, textStatus) {
                if (textStatus === 'timeout') {
                    showToast('error', 'Failed from timeout');
                } else {
                    showToast('error', "Don't connect to server. Try again!");
                }
                hidenLoading();
                return false;
            }
        });

    });

    // submit form KYC
    $('#jsKYCForm').on('submit', function (e) {
        //showLoading();
        e.preventDefault();
        let kyc_approved = $('input[name="kyc_approved"]:checked').val();
        let kyc_enable_company = $('input[name="kyc_enable_company"]:checked').val();
        let comments = $('textarea[name="comments"]').val();
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/admin/kyc/${idCompany}?_csrf=${token}`,
            data: {
                kyc_approved,
                is_active: kyc_enable_company,
                comments
            },
            async: true,
            success: function (data) {
                if (data.success) {
                    hidenLoading();
                    showToast('success', "Add KYC successfully.");
                } else {
                    hidenLoading();
                    showToast('error', "Add KYC failed!");
                }
            },
            error: function (err) {
                hidenLoading();
                showToast('error', "Don't connect to server. Try again!");
            }
        });
    });

    // submit form chart
    $('#jsChartType').on('submit', function (e) {
        e.preventDefault();
        showLoading();
        var chatType = $(this).find('input:checked').val();
        if (chatType) {
            $.ajax({
                dataType: "json",
                method: "POST",
                url: `/chat-type`,
                data: {
                    "_csrf": token,
                    type: chatType,
                    id: idCompany
                },
                success: function (data) {
                    hidenLoading();
                    if (data.success) {
                        showToast('success', "Setup chat type successfully.");
                    } else {
                        showToast('error', "Setup chat type failed!");
                    }
                    return true;
                },
                error: function () {
                    hidenLoading();
                    showToast('error', 'Can not connect to server. Please try again.');
                }
            });
        } else {
            hidenLoading();
            showToast('error', 'Please select a chat type.');
        }
    });

    // $('#jsChartType input[type="checkbox"]').on('change', (e) => {
    //     $('#jsChartType input[type="checkbox"]').each(function () {
    //         this.checked = false;
    //     });
    //     var target = $(e.target);
    //     target.prop('checked', true);
    // })

    //custom checked one in list checkbox & show table deduction scheduler
    checkboxDeduction.on('change', function (e) {
        checkboxDeduction.each(function () {
            this.checked = false;
        });
        var target = $(e.target);
        target.prop('checked', true);
        deductionFileMethod = target[0].defaultValue;
        //validate change color 
        $('#jsProcessControl b').css('color', '#495057');
        //view table
        $('#checkScheduler').is(":checked") ? $('#jsDeductionSchedule').removeClass('hiden') : $('#jsDeductionSchedule').addClass('hiden');
    });
    //show table pay period
    checkboxPayPeriods.on('change', function (e) {
        checkboxPayPeriods.each(function () {
            this.checked = false;
        });
        var target = $(e.target);
        target.prop('checked', true);
        //validate change color 
        $('#jsPayrun b').css('color', '#495057');
        //view table
        $('input[name="customPayPeriod"]').is(":checked") ? $('#jsPayPeriod').removeClass('hiden') : $('#jsPayPeriod').addClass('hiden');
    });
    if ($('input[name="customPayPeriod"]').val() == "false" && $('input[name="customPayPeriod"]').val()) {
        $('input[name="customPayPeriod"]').prop('checked', true);
    }
    //view table
    $('input[name="customPayPeriod"]').is(":checked") ? $('#jsPayPeriod').removeClass('hiden') : $('#jsPayPeriod').addClass('hiden');
    $('#checkScheduler').is(":checked") ? $('#jsDeductionSchedule').removeClass('hiden') : $('#jsDeductionSchedule').addClass('hiden');
    //save payrun setup in company
    $('.btn-setup-payrun').click(function () {
        let sendMailDate = $('select[name="sendMailDate"]').val();
        let sendMailTime = $('input[name="sendMailTime"]').val();
        //validate
        let conditionPayPeriod, values = {};
        if (systemCode != 'DEPUTY') {
            conditionPayPeriod = !$('.selectFee').val() || !$('.selectSalaryAdvance').val();
            //check system XERO
            // if (systemCode == 'XERO') {
            //     //get data input bank
            //     const $inputs = $('#bankSetupDiv :input[type="text"]');
            //     $inputs.each(function () {
            //         values[this.name] = $(this).val();
            //     });
            //     //validate tab "ABA's Bank setup"
            //     if (!values.bank_account_name && !values.bank_account_number && !values.bank_apca_id && !values.bank_bsb_number &&
            //         !values.bank_company_name && !values.bank_name && !values.bank_user_id) {
            //             console.log(values.bank_account_name, values.bank_account_number, values.bank_apca_id, values.bank_bsb_number,
            //                 values.bank_company_name, values.bank_name, values.bank_user_id);
            //         $('#jsABABankSetup b').css('color', 'red');
            //         showToast('error', `Please setup "ABA's Bank setup"`);
            //         return;
            //     }
            // }
        } else {
            conditionPayPeriod = !checkboxPayPeriods.is(':checked');
        }
        //validate tab "Deduction process control"
        if (!checkboxDeduction.is(':checked') && systemCode !== "ASTUTE") {
            $('#jsProcessControl b').css('color', 'red');
            showToast('error', 'Please choose "Deduction process control"');
            return;
        }
        //validate tab "Payrun setup"
        if (conditionPayPeriod && systemCode !== "ASTUTE") {
            $('#jsPayrun b').css('color', 'red');
            $('.deduction-file-category .form-control').css('border', '1px solid red');
            showToast('error', 'Please choose "Payrun setup"');
            return;
        }
        if (!deductionFileMethod && systemCode !== "ASTUTE") {
            var target = $('#jsProcessControlDiv').find('input[name="deduction-method"]').val();
            deductionFileMethod = target;
        }

        showLoading();
        var data = {
            "_csrf": token,
            systemCode: systemCode,
            companyId: idCompany,
            salaryAdvance: $('.selectSalaryAdvance').val(),
            fee: $('.selectFee').val(),
            isEnterprise: !$('input[name="customPayPeriod"]').is(":checked"),
            deductionFileMethod: deductionFileMethod,
            isAllowTimesheetRequest: !$('#jsTimesheetRequestCheck').is(":checked"),
            sendMailDate: sendMailDate || 2,
            sendMailTime: sendMailTime || "17:00",
            deduction_repayment_type: company?.deduction_repayment_type ? company.deduction_repayment_type : null
        };

        if (systemCode === "RECKON") {
            data.isSystemApproveProcess = $('input[name="isSystemApproveProcess"]:checked').val();
        }
        if (systemCode === "ASTUTE") {
            data.isSystemApproveProcess = $('input[name="isSystemApproveProcess"]').is(":checked");
        }
        $.ajax({
            method: 'POST',
            url: '/setup-payroll',
            data,
            success: function () {
                $('#jsPayroll i').removeClass('icon-alert-circle').addClass('icon-check-circle');
                if ($("#jsRequest" ).hasClass( "active" )) {
                    $('#jsTimesheet').trigger("click");
                }
                if (systemCode == "RECKON") {
                    if ($('input[name="isSystemApproveProcess"]:checked').val() === 'false') {
                        $('#jsRequest').attr("hidden", true);
                        $('#requestTable').attr("hidden", true);
                    } else {
                        $('#jsRequest').attr("hidden", !$('#jsTimesheetRequestCheck').is(":checked"));
                        $('#requestTable').attr("hidden", !$('#jsTimesheetRequestCheck').is(":checked"));
                    }
                } else {
                    $('#jsRequest').attr("hidden", !$('#jsTimesheetRequestCheck').is(":checked"));
                    $('#requestTable').attr("hidden", !$('#jsTimesheetRequestCheck').is(":checked"));
                }
                if (systemCode == 'DEPUTY') {
                    $('.btn-sync-payroll').trigger('click');
                } else {
                    hidenLoading();
                    showToast('success', 'Saved successfully.');
                }
                $('#deductionTable').DataTable().ajax.reload();
                $('#timesheetTable').DataTable().ajax.reload();

            },
            error: function () {
                hidenLoading();
                showToast('error', 'Can not connect to server. Please try again.');
            }
        })
    });

    // choose bank
    const banksJson = $('input[name="banks"]').val();
    const BankJson = $('input[name="bankInfo"]').val();
    let bankInfo = BankJson ? JSON.parse(BankJson) : null;
    let bankList = banksJson ? JSON.parse(banksJson) : [];
    const bankPick = $('#jsChooseBank').val();
    // choose bank
    var bank_account_number = bankInfo ? (bankInfo.bank_account_number_encryption ? decryptString(bankInfo.bank_account_number_encryption) : bankInfo.bank_account_number) : "";
    var bank_bsb_number = bankInfo ? (bankInfo.bank_bsb_number_encryption ? decryptString(bankInfo.bank_bsb_number_encryption) : bankInfo.bank_bsb_number) : "";
    if (bankInfo) {
        renderBank(bank_account_number, bank_bsb_number, bankInfo?.is_from_other_system ? "readonly" : "");
    } else {
        renderBank(null, null, null);
    }
    if (bankPick != "0" && bankInfo?._id.toString() == bankPick) {
        renderBank(bank_account_number, bank_bsb_number, bankInfo?.is_from_other_system ? "readonly" : "");
    } else {
        renderBank(null, null, null);
    }
    $('#jsChooseBank').on('change', function () {
                    let value = $(this).val();
                    if (value == "0") {
                        bankInfo = null;
                        renderBank(null, null, null);
                    } else {
                        bankList.forEach(function(bank) {
                            if (bank._id.toString() == value) {
                                let readonly = bank.is_from_other_system;
                                $('#jsBankInfo').html(`<div class="form-group row">
                                <label class="col-sm-5 col-form-label"> Bank name </label> 
                                <div class="col-sm-7">
                                    <input type="text" class="form-control" name="bank_name" required ${readonly ? "readonly" : ""}
                                    value="${bank.bank_name ? bank.bank_name : ''}" maxlength="3">
                                </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-5 col-form-label"> Bank account name </label> 
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="bank_account_name" required ${readonly ? "readonly" : ""}
                                        value="${bank.bank_account_name ? bank.bank_account_name : ''}" maxlength="50">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-5 col-form-label"> Bank account number </label> 
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="bank_account_number" required ${readonly ? "readonly" : ""}
                                        onkeypress='validateNumber(event)'
                                        value="${decryptString(bank.bank_account_number_encryption)}" minlength="9"
                                        maxlength="9">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-5 col-form-label"> Bank BSB number </label> 
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="bank_bsb_number" required ${readonly ? "readonly" : ""}
                                        onkeypress='validateNumber(event)'
                                        value="${decryptString(bank.bank_bsb_number_encryption)}"
                                        maxlength="7">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-5 col-form-label"> Bank User ID <i style="cursor: pointer;" class="icofont-question-circle" data-toggle="tooltip" data-placement="top" title="This is a 6 digit number provided by your bank. If you’re not sure what this number is, you’ll need to contact your bank. It’s often listed on their website and for some banks such as the ANZ you can provide any 6 digit number (such as 000000)"></i></label>
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="bank_user_id" required 
                                        value="${bank.bank_user_id ? bank.bank_user_id : ''}" maxlength="27">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-5 col-form-label"> Bank APCA ID </label> 
                                    <div div class="col-sm-7">
                                        <input type="text" class="form-control" name="bank_apca_id" required ${readonly ? "readonly" : ""}
                                        value="${bank.bank_apca_id ? bank.bank_apca_id : ''}" maxlength="7">
                                    </div>
                                </div> 
                                <div class="form-group row">
                                    <label class="col-sm-5 col-form-label"> Description </label> 
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="bank_description" required 
                                        value="${bank.bank_description ? bank.bank_description : ''}" maxlength="13">
                                    </div> 
                                </div> 
                                <div class="form-group row">
                                    <label class="col-sm-5 col-form-label"> Company name </label> 
                                    <div class="col-sm-7">
                                        <input type="text" class="form-control" name="bank_company_name" required  ${readonly ? "readonly" : ""}
                                        value="${bank.bank_company_name ? bank.bank_company_name : ''}" maxlength="17">
                                    </div>
                                </div>`);
                            }
                        });
                    }
    });

    function renderBank(bank_account_number, bank_bsb_number, readonly) {
                        $('#jsBankInfo').html(`<div class="form-group row">
                        <label class="col-sm-5 col-form-label"> Bank name </label> 
                        <div class="col-sm-7">
                            <input type="text" class="form-control" name="bank_name" required ${readonly}
                            value="${ bankInfo ? bankInfo.bank_name : '' }" maxlength="3">
                        </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-sm-5 col-form-label"> Bank account name </label> 
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="bank_account_name" required ${readonly}
                                value="${ bankInfo ? bankInfo.bank_account_name : '' }" maxlength="50">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-sm-5 col-form-label"> Bank account number </label> 
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="bank_account_number" required ${readonly}
                                onkeypress='validateNumber(event)'
                                value="${bank_account_number ? bank_account_number : ''}" minlength="9"
                                maxlength="9">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-sm-5 col-form-label"> Bank BSB number </label> 
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="bank_bsb_number" required ${readonly}
                                onkeypress='validateNumber(event)'
                                value="${bank_bsb_number ? bank_bsb_number : ''}"
                                maxlength="7">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-sm-5 col-form-label"> Bank User ID <i style="cursor: pointer;" class="icofont-question-circle" data-toggle="tooltip" data-placement="top" title="This is a 6 digit number provided by your bank. If you’re not sure what this number is, you’ll need to contact your bank. It’s often listed on their website and for some banks such as the ANZ you can provide any 6 digit number (such as 000000)"></i></label>
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="bank_user_id" required 
                                value="${ bankInfo ? bankInfo.bank_user_id : '' }" maxlength="27">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-sm-5 col-form-label"> Bank APCA ID </label> 
                            <div div class="col-sm-7">
                                <input type="text" class="form-control" name="bank_apca_id" required ${readonly}
                                value="${ bankInfo ? bankInfo.bank_apca_id : '' }" maxlength="7">
                            </div>
                        </div> 
                        <div class="form-group row">
                            <label class="col-sm-5 col-form-label"> Description </label> 
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="bank_description" required 
                                value="${ bankInfo ? bankInfo.bank_description : '' }" maxlength="13">
                            </div> 
                        </div> 
                        <div class="form-group row">
                            <label class="col-sm-5 col-form-label"> Company name </label> 
                            <div class="col-sm-7">
                                <input type="text" class="form-control" name="bank_company_name" required ${readonly}
                                value="${ bankInfo ? bankInfo.bank_company_name : '' }" maxlength="17">
                            </div>
                        </div>`);
    }

    function decryptString(params) {
        var decryptedData = CryptoJS.AES.decrypt(params, key).toString(CryptoJS.enc.Utf8);
        return decryptedData;
    }

    // save setup bank
    $('.btn-setup-bank').click(function (e) {
        const $inputs = $('#bankSetupDiv :input[type="text"]');
        const bankPick = $('#jsChooseBank').val();
        let values = {};
        values.id = bankPick; //values.id = bankInfo ? bankInfo._id : "0"; //        
        $inputs.each(function () {
            values[this.name] = $(this).val();
        });
        if (values.bank_account_name == "" || values.bank_account_number == "" || values.bank_apca_id == "" || values.bank_bsb_number == "" ||
            values.bank_company_name == "" || values.bank_name == "" || values.bank_user_id == "") {
            e.preventDefault();
            $inputs.each(function () {
                if ($(this).val() == "") {
                    $(this).css("border", "1px solid #de0000")
                } else {
                    $(this).css("border", "1px solid #ccc")
                }
            });
            showToast('error', `Please setup "ABA's Bank setup"`);
            return;
        } else {
            let _this; 
            $inputs.each(function () {
                if (this.name == "bank_account_number") {
                    _this = $(this);                  
                }
            });
            if (values.bank_account_number.length !== 9) {
                e.preventDefault();-
                _this.css("border", "1px solid #de0000");
                showToast('error', `Bank account number must be 9 digits`);
                return;
            } else {
                _this.css("border", "1px solid #ccc");
            }
        }
        showLoading();
        $.ajax({
            method: 'POST',
            url: '/setup-bank',
            data: {
                "_csrf": token,
                systemCode: systemCode,
                companyId: idCompany,
                bodyBankInfo: JSON.stringify(values)
            },
            success: function (response) {
                hidenLoading();
                showToast('success', 'Saved successfully.');
                if (response?.result?.length > 0) {
                    let string = `<option style="font-style: italic;" value="0"><i>Choose bank account</i></option>`;
                    bankList = response.result;
                    bankList.forEach(item => {
                        if (item._id.toString() == response.bankId) {
                            bankInfo = item;
                            string +=  `<option value="${item._id}" selected>${item.bank_account_name}${item.is_from_other_system ? " (payroll system)" : " (user)"}</option>`;
                        } else {
                            string += `<option value="${item._id}">${item.bank_account_name}${item.is_from_other_system ? " (payroll system)" : " (user)"}</option>`;
                        }
                    });
                    $('#jsChooseBank').html(string);
                }
            },
            error: function () {
                hidenLoading();
                showToast('error', 'Can not connect to server. Please try again.');
            }
        })
    });

    //submit payment verification
    $('#checkedPaymentVerify').click(function () {
        showLoading();
        var isCheck;
        if ($(this).is(':checked')) {
            isCheck = true;
        } else {
            isCheck = false;
        }
        $.ajax({
                method: "post",
                url: `/admin/edit-payment-verification/${idCompany}`,
                data: {
                    "_csrf": token,
                    is_verify_code_by_sms: isCheck,
                    "_id": idCompany
                },
            })
            .done(function (response) {
                if (response.status == 200) {
                    hidenLoading();
                    showToast('success', "Updated successfully.");
                } else {
                    hidenLoading();
                    showToast('error', 'Update Failed.');
                }
            })
            .fail(function (err) {
                console.log(err);
                hidenLoading();
            });
    });

    //
    $('#bankSetup').click(function() {
        getBanks();
    });

    // Get new banks info
    function getBanks() {
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/banks/${idCompany}`,
            data: {
                "_csrf": token
            },
            async: true,
            success: function (data) {
                if (data?.result?.length > 0) {
                    let string = `<option style="font-style: italic;" value="0"><i>Choose bank account</i></option>`;
                    bankList = data.result;
                    bankList.forEach(item => {
                        if (item._id.toString() == data.bankId) {
                            bankInfo = item;
                            string +=  `<option value="${item._id}" selected>${item.bank_account_name}${item.is_from_other_system ? " (payroll system)" : " (user)"}</option>`;
                            renderBank(item.bank_account_number_encryption ? decryptString(item.bank_account_number_encryption) : item.bank_account_number, item.bank_bsb_number_encryption ? decryptString(item.bank_bsb_number_encryption) : item.bank_bsb_number, item.is_from_other_system ? "readonly" : "");
                        } else {
                            string += `<option value="${item._id}">${item.bank_account_name}${item.is_from_other_system ? " (payroll system)" : " (user)"}</option>`;
                        }
                    });
                    $('#jsChooseBank').html(string);
                }
                hidenLoading();
            },
            error: function () {
                hidenLoading();
                showToast('error', "Can't connect to server. Try again")
                return false;
            }
        });
    }

    //show popup page system
    function popupSystem(url, name) {
        const popup = window.open(url, name, windowFeatures);
        const popupTick = setInterval(() => {
            if (popup.closed && isLoad) {
                clearInterval(popupTick);
                hidenLoading();
            }
        }, 500);
        return popup;
    }
    //run page login Systems
    function runLoginSystem(url, popupName) {
        $("#jsShowConfirmConnect").modal('hide');
        const popup = popupSystem(url, popupName);
        socket.on('join', data => {
            if (data.code && data.key == popupName) {
                isLoad = false;
                popup.close();
                //get access_token
                switch (popupName) {
                    case 'XERO':
                        getAccessTokenXero(data.code);
                        break;
                    case 'DEPUTY':
                        getAccessTokenDeputy(data.code);
                        break;
                    case 'KEYPAY':
                        getAccessTokenKeypay(data.code);
                        break;
                    case 'RECKON':
                        getAccessTokenReckon(data.code);
                        break;
                }
            } else {
                popup.close();
                showErr(popupName);
            }
        });
    }

    //<--------------- Start XERO --------------->

    //get AccessToken XERO
    function getAccessTokenXero(code) {
        if (request && request.readyState != 4) {
            request.abort();
        }
        request = $.ajax({
            dataType: "json",
            method: "POST",
            url: `/xero`,
            data: {
                code: code,
                "_csrf": token
            },
            async: true,
            success: function (data) {
                dataUpdateRefreshToken.refresh_token = data.refresh_token;
                getConnectionsXero(data.access_token);
                return true;
            }
        });
    }
    //get Connection XERO
    function getConnectionsXero(access_token) {
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/xero-get-connections`,
            data: {
                access_token: access_token,
                "_csrf": token
            },
            async: true,
            success: function (data) {
                data.forEach(element => {
                    if (element.tenantId === systemCompanyId) {
                        dataUpdateRefreshToken.company_id = idCompany;
                    } else {
                        showToast('error', 'Company not found.');
                        hidenLoading();
                    }
                });
                if (dataUpdateRefreshToken.company_id) {
                    updateCompanyRefreshToken();
                }
                return true;
            },
            error: function () {
                hidenLoading();
                showToast('error', "Can't connect to server. Try again")
                return false;
            }
        });
    }

    //disconnect Xero
    function disconnectXero (companySystemId, companyId) {
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/xero-dis-connections`,
            data: {
                company_system_id: companySystemId,
                company_id: companyId,
                "_csrf": token
            },
            async: true,
            success: function (data) {
                if (data.success) {
                    showToast('success', "Disconnect the API successfully.");
                    $('.btn-reconnect-system .circle').removeClass(
                        'pulsating-circle').addClass('normal-circle');
                    $('.btn-reconnect-system').removeClass(
                        'btn-outline-success').addClass(
                        'btn-outline-danger');
                    $('.btn-sync-payroll').addClass('disabled');
                    $('.check-connect-system .btn-reconnect-system span')
                        .html('Disconnected');
                    $('#deductionTable').DataTable().ajax.reload();
                    $('#timesheetTable').DataTable().ajax.reload();
                    $('#requestTable').DataTable().ajax.reload();
                } else {
                    showToast('error', "Can't disconnect the API.");
                }
                hidenLoading();
            },
            error: function () {
                hidenLoading();
                showToast('error', "Can't connect to server. Try again")
                return false;
            }
        });
    }

    //<--------------- End XERO --------------->

    //<--------------- Start DEPUTY --------------->

    function getAccessTokenDeputy(code) {
        if (request && request.readyState != 4) {
            request.abort();
        }
        request = $.ajax({
            dataType: "json",
            method: "POST",
            url: `/deputy`,
            data: {
                code: code,
                "_csrf": token
            },
            async: true,
            success: function (data) {
                dataUpdateRefreshToken.refresh_token = data.refresh_token;
                if (data.endpoint === systemCompanyId) {
                    dataUpdateRefreshToken.company_id = idCompany;
                } else {
                    showToast('error', 'Company not found.');
                    hidenLoading();
                }
                if (dataUpdateRefreshToken.company_id) {
                    updateCompanyRefreshToken();
                }
                return true;
            }
        });
    }

    //<--------------- End DEPUTY --------------->

    //<--------------- Start KEYPAY --------------->

    function getAccessTokenKeypay(code) {
        const decodeURICode = decodeURIComponent(code);
        if (request && request.readyState != 4) {
            request.abort();
        }
        request = $.ajax({
            dataType: "json",
            method: "POST",
            url: `/keypay`,
            data: {
                code: decodeURICode,
                "_csrf": token
            },
            async: true,
            success: function (data) {
                dataUpdateRefreshToken.refresh_token = data.refresh_token;
                getBusinessKeypay(data.access_token);
                return true;
            }
        });
    }
    //get Business KEYPAY
    function getBusinessKeypay(accessToken) {
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/keypay-get-business`,
            data: {
                tokenPay: accessToken,
                "_csrf": token,
            },
            async: true,
            success: function (data) {
                const parseBusiness = JSON.parse(data.data);
                if (parseBusiness.some(item => item.id ==
                        systemCompanyId)) {
                    dataUpdateRefreshToken.company_id = idCompany;
                } else {
                    showToast('error', `Could not connect to ${systemCode} for company: "${company.company_name}", please check your login parameters.`);
                    hidenLoading();
                }
                if (dataUpdateRefreshToken.company_id) {
                    updateCompanyRefreshToken();
                }
                return true;
            },
            error: function () {
                hidenLoading();
                showToast('error', "Can't connect to server. Try again")
                return false;
            }
        });
    }

    //<--------------- End KEYPAY --------------->

    // ---------------- Start Reckon ------------ //
    function getAccessTokenReckon(code) {
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/reckon`,
            data: {
                code: code,
                "_csrf": token
            },
            async: true,
            success: function (data) {
                if (data.success) {
                    dataUpdateRefreshToken.refresh_token = data.refresh_token;
                    getCashbooksReckon(data.access_token);
                } else {
                    hidenLoading();
                    showToast('error', data.message)
                }
                return true;
            },
            error: function() {
                hidenLoading();
                showToast('error', "Can't connect to server. Try again")
                return false;
            }
        });
    }


    function getCashbooksReckon(access_token) {
        $.ajax({
          dataType: "json",
          method: "POST",
          url: `/reckon/cashbooks`,
          data: {
            access_token,
            "_csrf": token
          },
          async: true,
          success: function(response) {
            hidenLoading();
            if (response?.length > 0) {
                var success = false;
                response.forEach(item => {
                    if (item.BookId == systemCompanyId) {
                        dataUpdateRefreshToken.company_id = idCompany;
                        success = true;
                    }
                });
                if (!success) {
                    showToast('error', 'Company not found.');
                    hidenLoading();
                }
                if (dataUpdateRefreshToken.company_id) {
                    updateCompanyRefreshToken();
                }
            } else {
              showToast('error', "Can't connect to server. Try again")
            }
            return true;
          },
          error: function() {
            hidenLoading();
            showToast('error', "Can't connect to server. Try again")
            return false;
          }
        });
      }
    // ---------------- End Reckon ------------ //

    //update company refresh token
    function updateCompanyRefreshToken() {
        $.ajax({
            dataType: 'json',
            type: 'POST',
            url: `/update-company-refreshToken`,
            async: true,
            data: dataUpdateRefreshToken,
            success: function (data) {
                if (data.success) {
                    $('.btn-reconnect-system .circle').removeClass(
                        'normal-circle').addClass('pulsating-circle');
                    $('.btn-reconnect-system').removeClass(
                        'btn-outline-danger').addClass(
                        'btn-outline-success');
                    $('.btn-sync-payroll').removeClass('disabled');
                    $('.check-connect-system .btn-reconnect-system span')
                        .html('Connected');
                    $('#deductionTable').DataTable().ajax.reload();
                    $('#timesheetTable').DataTable().ajax.reload();
                    $('#requestTable').DataTable().ajax.reload();
                } else {
                    showToast('error', data.message);
                }
                hidenLoading();
                return true;
            },
            error: function (data) {
                hidenLoading();
                showToast('error', "Don't connect to server. Try again!");
                return false;
            }
        });
    }
    //check is first synced 
    if (!company.is_first_synced) {
        $('.btn-sync-payroll').trigger('click');
    }

    $("#jsExportDirectDebitForm").on("click", function () {
        showLoading();
        getFilePDF();
    });

    function getFilePDF() {
        $.ajax({
        dataType: "json",
        method: "POST",
        url: `/admin/company/direct-debit-request/pdf`,
        data: {
            _csrf: token,
            companyId: idCompany,
            URL: location.origin
        },
        success: function (responsive) {
            if (responsive.success) {
            var blob = convertBase64toBlob(responsive.data, "application/pdf");
            saveAs(blob, "Direct_Debit_Request" + moment(Date.now()).format("YYYY_MM_DD") + "_"+ Date.now().toString() + ".pdf");
            } else {
            showToast("error", "Can't dowload file");
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

    $('.jsCheckboxFormDD').click(function() {
        $('#formDDMonoova').modal({
            show: true,
            keyboard: false,
            backdrop: false
        });
    });


    $("#jsFinancial").click(function() {
        if (!$("#emails-input").hasClass('emailsEditor')) {
          const inputContainerNode = document.querySelector('#emails-input');
          emailsInput = EmailsEditor(inputContainerNode);
        }
        if (company.recipients_float_alert?.length <= 0) {
            $("#emails-input").removeClass("hide");
            $("#email-list").addClass("hide");
        } else {
            const text = renderText(company.recipients_float_alert ? company.recipients_float_alert : []);
            $("#email-list").text(text);
            if (company.recipients_float_alert?.length > 0) {
                company.recipients_float_alert.forEach(item => {
                    emailsInput.add(item);
                });
            }
        }

        $("#email-list").on('click', function() {
            if (!$(this).hasClass("disabled")) {
                $(this).addClass("hide");
                $("#emails-input").removeClass("hide");
                $('.emailsEditor__input').focus();
                $('#jsSubmit').removeClass('disabled');
            }
        });

        $("#emails-input").on('click', function() {
            $('#jsSubmit').removeClass('disabled');
            $('.emailsEditor__input').focus();
        });

        $(document).on('click', function(e) {
            const className = e.target.className;
            if (className.indexOf('emailsEditor') < 0 && $("#email-list").hasClass("hide") && e.target.id != 'email-list' && e.target.id != 'jsSubmit') {
                const result = getListEmail(emailsInput);
                if (result.isValid) {
                    if (!$("#emails-input").hasClass("hide")) {
                        $("#emails-input").addClass('hide');
                    }
                    if ($("#email-list").hasClass("hide")) {
                        $("#email-list").removeClass("hide");
                    }
                    if (result.emails?.length > 0) {
                        const text = renderText(result.emails);
                        $("#email-list").text(text);
                        $(".log-err").addClass('hide');
                    } else {
                        $("#email-list").text(""); 
                    }
                }   
            }
        });

    });


    function getListEmail(element) {
        const result = {
            isValid: true,
            emails: []
        };
        if (element) {
           const emailList = element.getEmails();
           const emails = [];
           emailList.forEach(item => {
               if (item.isValid) {
                    emails.push(item.value);
               } else {
                    result.isValid = false;
               }
           });
           result.emails = [...emails];
           return result;
        }
        return result;
    }

    function renderText(emails) {
        return emails.join(", ");
    }

});