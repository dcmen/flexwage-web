
$(document).ready(function() {
    const checkPayPeriod = $('input[name="checkPayPeriod"]').val();
    const staff = $('input[name="staff"]').length > 0 ? JSON.parse($('input[name="staff"]').val()) : '';
    const token = $('input[name="token"]').val();

    $('#jsInformation').click(function() {
        $(this).addClass('active');
        $('#jsInformationDiv').removeClass('hiden');
        $('#jsWorkingDay').removeClass('active');
        $('#jsWorkingDayDiv').addClass('hiden');
    });
    $('#jsWorkingDay').click(function() {
        $(this).addClass('active');
        $('#jsWorkingDayDiv').removeClass('hiden');
        $('#jsInformation').removeClass('active');
        $('#jsInformationDiv').addClass('hiden');
    });

    $('#jsSaveWorkDay').click(function() {
        showLoading();
        let days = $('#jsWorkingDayDiv select.jsDay');
        let payslip_history = $('input[name="payslipHistory"]').val();
        let timeOfDay = $('input[name="timeOfDay"]').val();
        let dayWork = [];
        days.each(function() {
            dayWork.push(Number($(this).val()));
        })

        let body = {
            _csrf: token,
            company_id: staffPick.company_id,
            system_employee_id: staffPick.system_employee_id,
            working_days_of_week: JSON.stringify([...dayWork]),
            weeks_checking_payslip_history: payslip_history && payslip_history != "" ? Number(payslip_history) : 0 
        };

        if (timeOfDay) {
            let array = timeOfDay.split(':');
            let minute = Number(array[0]) * 60 + Number(array[1]);
            body.time_accrue_wages = minute;
        }

        $.ajax({
            type: "POST",
            url: `/admin/staffs/work-day`,
            data: body,
            success: function (data) {
                hidenLoading();
                if (data.success) {
                    showToast('success', data.message);
                } else {
                    showToast('error', data.message);
                }
            },
            error: function () {
                hidenLoading();
                showToast('error', "Can't connect to server. Try again.");
            },
        });
    });

    if (checkPayPeriod) {
        $('#selectedPayCycle').val(staff.pay_period_origination_id);
    } 
    //edit pay cycle
    $('.btn-save-Paycycle').click(function() {
        //validate
        if (!$('#selectedPayCycle').val()) {
            $('#selectedPayCycle').css('border-color', 'red');
            return;
        }
        showLoading();
        //post data
        $.ajax({
            method: 'POST',
            dataType: 'json',
            url: '/save-pay-cycle',
            data: {
                staffId: staff._id,
                payPeriodId: $('#selectedPayCycle').val(),
                "_csrf": token
            },
            success: function(data) {
                showToast('success', 'Pay cycle edited successfully.');
                hidenLoading();
            }, error: function() {
                showToast('error', "Can't connect to server. Try Again!");
                hidenLoading();
            }
        });
    });

    let text = $('#jsBSB').text();
    if (text && text != "N/A") {
       // Decrypt
        var bytes  = CryptoJS.AES.decrypt(text, $('input[name="encryptCode"]').val());
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        $('#jsBSB').text(originalText);
    }
	
	let value = $('#jsBankNumber').text();
    if (value && value != "N/A") {
       // Decrypt
        var bytes  = CryptoJS.AES.decrypt(value, $('input[name="encryptCode"]').val());
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        $('#jsBankNumber').text(originalText);
    }

    function showToast(name, mess) {
        $('#jsErr').addClass(`show ${name}`);
        $('#jsErr p').text(mess);
        setTimeout(() => {
            $('#jsErr').removeClass(`show ${name}`);
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
});