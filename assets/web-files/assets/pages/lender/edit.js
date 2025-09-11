$(document).ready(function () {
    var current_step, next_step, previous_step, validate = true,
        form = {};
    const href = (location.href).split('/');
    const id = href[href.length - 1];
    var token = $('#jsToken').val();
    var lenderName = $('#inputLenderName');
    var fundingType = $('#inputFundingType');
    var accountType = $('#inputAccountType');
    var liveMonoovaAccount = $('#inputLiveMonoovaAccount');
    var liveApiKey = $('#inputLiveApiKey');
    var testMonoovaAccount = $('#inputTestMonoovaAccount');
    var liveMonoovaFeeAccountNumber = $('#inputLiveMonoovaFeeAccount');
    var testApiKey = $('#inputTestApiKey');
    var interest = $('#inputInterest');
    var unit = $('#unit');
    let key = $('input[name="key"]').val();
    const lenderSupper = JSON.parse($('input[name="lenderSupper"]').val());
    const lender = JSON.parse($('input[name="lender"]').val());
    const isEditSupper = $('input[name="isSupper"]').val();
    let arrName = ['test_receivables_account_number', 'test_receivables_account_bsb', "live_receivables_account_number", 'live_receivables_account_bsb', 'live_api_key', 'test_api_key'];
    const inputs = $('section input[class="form-control"]');
    $('select').selectpicker();

    $('#jsShowStep').css('display', 'block');
    $('#jsNext').css('display', 'none');
    renderSteps();

    $("#inputBSBLive").blur((e) => {
        if ($("#inputAccountNameLive").val()) {
          autoFormatBsb(
            $("#inputBSBLive").val(),
            "#inputBSBLive",
            "#jsShowValidateLive"
          );
        } else if ($("#inputAccountNameLive").val() == "" && $("#inputBSBLive").val() == "" && $("#inputAccountNumberLive").val() == "") {
          $("#inputBSBLive").removeClass('input--err');
          let names = ['#inputAccountNameLive', '#inputBSBLive', '#inputAccountNumberLive'];
          names.forEach(item  => {
            $(item).parent().removeClass('was-validated');
          });
        }
      });
    
      $("#inputBSBTest").blur((e) => {
        if ($("#inputAccountNameTest").val()) {
          autoFormatBsb(
            $("#inputBSBTest").val(),
            "#inputBSBTest",
            "#jsShowValidateTest"
          );
        } else if ($("#inputAccountNameTest").val() == "" && $("#inputBSBTest").val() == "" && $("#inputAccountNumberTest").val() == "") {
          $("#inputBSBTest").removeClass('input--err');
          let names = ['#inputAccountNameTest', '#inputBSBTest', '#inputAccountNumberTest'];
          names.forEach(item  => {
            $(item).parent().removeClass('was-validated');
          });
        }
      });

    function autoFormatBsb(value, nameInput, nameErr) {
        if (!value.match(/^[0-9]{3,3}-?[0-9]{3,3}$/)) {
            $(nameInput).parent().addClass('was-validated');
            $(nameInput).addClass('input--err');
            $(nameErr).removeClass('d-none');
            $(nameErr).text('BSB number expression XXX-XXX');
        } else if (value.length === 6) {
            var text = value.substring(0, 3) + "-" + value.substring(3, value.length);
            $(nameInput).val(text);
        } else {
            $(nameInput).parent().addClass('was-validated');
            $(nameInput).removeClass('input--err');
            $(nameErr).text('Please provide a bsb.');
        }
    }

    inputs.each(function () {
        $(this).keydown(() => {
            $(this).parent().find('.invalid-feedback').addClass('d-none');
        });
        $(this).blur(() => {
            ($(this).val()).trim() == '' ? $(this).parent().find('.invalid-feedback').removeClass('d-none') : '';
        });
    });

    arrName.forEach(item => {
        if (lender[item] && lender[item] !== null) {
            var _0x3b53 = ['decrypt', '212903VYdquO', '631499GotWKm', 'Utf8', '1121721qwJneM', '892032qWOFws', '1018087EmLptr', '375257lFLHJP', '2mUVyIv', '1rXKmXR', '765113EgWEgl', 'AES', 'toString'];
            var _0x3dd0 = function (_0xb2aca, _0x32288d) {
                _0xb2aca = _0xb2aca - 0x1b8;
                var _0x3b5368 = _0x3b53[_0xb2aca];
                return _0x3b5368;
            };
            var _0xe5f52a = _0x3dd0;
            (function (_0x53512d, _0x1cd355) {
                var _0x45948f = _0x3dd0;
                while (!![]) {
                    try {
                        var _0x265115 = -parseInt(_0x45948f(0x1b8)) + parseInt(_0x45948f(0x1ba)) + -parseInt(_0x45948f(0x1bd)) * -parseInt(_0x45948f(0x1c2)) + -parseInt(_0x45948f(0x1bb)) + -parseInt(_0x45948f(0x1b9)) + parseInt(_0x45948f(0x1be)) + parseInt(_0x45948f(0x1c3)) * parseInt(_0x45948f(0x1bc));
                        if (_0x265115 === _0x1cd355) break;
                        else _0x53512d['push'](_0x53512d['shift']());
                    } catch (_0x334115) {
                        _0x53512d['push'](_0x53512d['shift']());
                    }
                }
            }(_0x3b53, 0xd46cb));
            var bytes = CryptoJS[_0xe5f52a(0x1bf)][_0xe5f52a(0x1c1)](lender[item], key),
                originalText = bytes[_0xe5f52a(0x1c0)](CryptoJS['enc'][_0xe5f52a(0x1c4)]);
            $(`input[name="${item}"]`).val(originalText);
        }
    });

    $('#inputAccountType').on('change', () => {
        renderSteps();
        if ($('#inputAccountType').find(':selected').data('cashd')) {
            fundingType.html(`<option value="SELF_FINANCED">Self Funded</option>
            <option value="EXTERNAL_FINANCED">
                External Funded
            </option>
            <option value="CASHD_FINANCED">CashD Funded</option>
            <option value="SELF_CASHD_FINANCED">Self & CashD Funded</option>`);
        } else {
            fundingType.html(`<option value="SELF_FINANCED">Self Funded
            </option>
            <option value="EXTERNAL_FINANCED">
                External Funded
            </option>`);
        }
        fundingType.selectpicker('refresh');
    });

    $('#jsBack').click(function () {
        //$('#jsShowStep').css('display', 'none');
        //$('#jsNext').css('display', 'inline');
        lenderName.removeAttr('disabled');
        fundingType.parent().find('button').removeAttr('disabled');
        accountType.parent().find('button').removeAttr('disabled');
    });

    // step 1
    $(document).on('click', '#jsSubmitMonoova', function () {
        if ((lenderName.val()).trim() !== '' && fundingType.val() !== '') {
            validate = true;
            form.lender_name = lenderName.val();
            form.funding_type = fundingType.val();
            form.parent_id = accountType.val();
            if (lenderSupper.length > 0) {
                lenderSupper.forEach(element => {
                    if (element._id == accountType.val()) {
                        form.monoova_account_type = "SUPPER_LENDER";
                    }
                });
            }
            if (!form.monoova_account_type || form.parent_id == null) {
                form.monoova_account_type = "NEW_ACCOUNT";
            }
            lenderName.attr('disabled', 'disabled');
            fundingType.parent().find('button').attr('disabled', 'disabled');
            accountType.parent().find('button').attr('disabled', 'disabled');
            let namesLive = ["#inputAccountNameLive", "#inputAccountNumberLive", "#inputBSBLive"];
            let nameSTest = ["#inputAccountNameTest", "#inputAccountNumberTest", "#inputBSBTest"];

            if ($("#inputAccountNameLive").val().trim() != "" || $("#inputAccountNumberLive").val().trim() != "" || $("#inputBSBLive").val().trim() != "") {
                validate = validateInput(namesLive, true);
            } else {
                for (var i = 0; i < namesLive.length; i++) {
                    $(`${namesLive[i]}`).parent().removeClass('was-validated');
                }
            }
            if ($("#inputAccountNameTest").val().trim() != "" || $("#inputAccountNumberTest").val().trim() != "" || $("#inputBSBTest").val().trim() != "") {
                validate = validateInput(nameSTest, validate);
            } else {
                for (var i = 0; i < namesLive.length; i++) {
                    $(`${nameSTest[i]}`).parent().removeClass('was-validated');
                }
            }
            if (validate) {
                if (accountType.val() == 'null') {
                    current_step = $(this).closest('fieldset');
                    next_step = $(this).closest('fieldset').next();
                    $('#jsBankAccount').css("display", "none");
                    $('#jsMonoovaConfig').css("display", "block");
                } else {
                    current_step = $(this).closest('fieldset');
                    next_step = $(this).closest('fieldset').next().next();
                    $('#jsBankAccount').css("display", "none");
                    $('#jsCommission').css("display", "block");
                }
                if ($("#inputAccountNameTest").val().trim() != "" &&
                $("#inputAccountNumberTest").val().trim() != "" &&
                $("#inputBSBTest").val().trim() != "") {
                    form.test_receivables_account_name = $('#inputAccountNameTest').val();
                    var _0x55ee = ['905788gAGQCF', '1iWeMVq', 'encrypt', '#inputAccountNumberTest', 'val', '29822xpcIvl', '#inputBSBTest', '3158VepGFN', '1059647CLHqRd', 'test_receivables_account_bsb', 'AES', '1RqZuIV', '1319429ZjjNYP', 'toString', '332qKbAtM', '1208193VdnGEu', '641836cOYXii', '1JNrUdp'];
                    var _0x4ba9 = function (_0x4a33fb, _0x1cbb41) {
                        _0x4a33fb = _0x4a33fb - 0x68;
                        var _0x55ee7d = _0x55ee[_0x4a33fb];
                        return _0x55ee7d;
                    };
                    var _0x10ca01 = _0x4ba9;
                    (function (_0x3a58c0, _0x1f019c) {
                        var _0x976b04 = _0x4ba9;
                        while (!![]) {
                            try {
                                var _0x351bce = -parseInt(_0x976b04(0x6f)) * parseInt(_0x976b04(0x76)) + parseInt(_0x976b04(0x77)) + parseInt(_0x976b04(0x6d)) + -parseInt(_0x976b04(0x69)) * -parseInt(_0x976b04(0x74)) + -parseInt(_0x976b04(0x78)) * parseInt(_0x976b04(0x73)) + -parseInt(_0x976b04(0x79)) * parseInt(_0x976b04(0x70)) + parseInt(_0x976b04(0x68));
                                if (_0x351bce === _0x1f019c) break;
                                else _0x3a58c0['push'](_0x3a58c0['shift']());
                            } catch (_0x4f4ccf) {
                                _0x3a58c0['push'](_0x3a58c0['shift']());
                            }
                        }
                    }(_0x55ee, 0xae24d), form['test_receivables_account_number'] = CryptoJS[_0x10ca01(0x72)][_0x10ca01(0x6a)]($(_0x10ca01(0x6b))[_0x10ca01(0x6c)](), key)[_0x10ca01(0x75)](), form[_0x10ca01(0x71)] = CryptoJS['AES'][_0x10ca01(0x6a)]($(_0x10ca01(0x6e))[_0x10ca01(0x6c)](), key)[_0x10ca01(0x75)]());
                }

                if ($('#inputAccountNameLive').val().trim() && $('#inputAccountNumberLive').val().trim() && $('#inputBSBLive').val().trim()) {
                    form.live_receivables_account_name = $('#inputAccountNameLive').val();
                    var _0x1d9f = ['212680uDWNqB', '30923xQumyx', '207682oBWnvg', '1HKBvSd', '2tDKQwa', '866768gotOal', '8CzlDIQ', '911391LLxqLQ', '661969HWPmEH', '1qpVXts', '60691hXRKaS'];
                    var _0x2efc = function (_0x295107, _0x544300) {
                        _0x295107 = _0x295107 - 0x82;
                        var _0x1d9f05 = _0x1d9f[_0x295107];
                        return _0x1d9f05;
                    };
                    (function (_0x4bc2b7, _0x2fa5fd) {
                        var _0x7bebfa = _0x2efc;
                        while (!![]) {
                            try {
                                var _0x2e076b = parseInt(_0x7bebfa(0x89)) + -parseInt(_0x7bebfa(0x84)) * parseInt(_0x7bebfa(0x88)) + parseInt(_0x7bebfa(0x82)) * parseInt(_0x7bebfa(0x8a)) + -parseInt(_0x7bebfa(0x86)) + -parseInt(_0x7bebfa(0x8b)) * -parseInt(_0x7bebfa(0x85)) + -parseInt(_0x7bebfa(0x8c)) + parseInt(_0x7bebfa(0x83)) * parseInt(_0x7bebfa(0x87));
                                if (_0x2e076b === _0x2fa5fd) break;
                                else _0x4bc2b7['push'](_0x4bc2b7['shift']());
                            } catch (_0x1dcaa4) {
                                _0x4bc2b7['push'](_0x4bc2b7['shift']());
                            }
                        }
                    }(_0x1d9f, 0x7661b), form['live_receivables_account_number'] = CryptoJS['AES']['encrypt']($('#inputAccountNumberLive')['val'](), key)['toString'](), form['live_receivables_account_bsb'] = CryptoJS['AES']['encrypt']($('#inputBSBLive')['val'](), key)['toString']());
                }

                sessionStorage.setItem('form', JSON.stringify(form));
                successNextStep(current_step, next_step);
            }
        } else {
            var formLender = $('#jsValidationLenderName');
            formLender.addClass('was-validated');
        }

    });

        // check validate input
        function validateInput(arr, isTrue) {
            let validate = isTrue;
            for (var i = 0; i < arr.length; i++) {
                if ($(`${arr[i]}`).val().trim() == '' || !($(arr[2]).val()).match(/^[0-9]{3,3}-?[0-9]{3,3}$/)) {
                    validate = false;
                    $(`${arr[i]}`).parent().addClass('was-validated');
                } else {
                    $(`${arr[i]}`).parent().removeClass('was-validated');
                }
            }
            if (!$(arr[2]).val().match(/^[0-9]{3,3}-?[0-9]{3,3}$/) && $(arr[2]).val() != "") {
                validate = false;
                $(arr[2]).parent().addClass("was-validated");
                $(arr[2]).addClass("input--err");
                if (arr[2] === '#inputBSBLive') {
                  $('#jsShowValidateLive').removeClass("d-none");
                  $('#jsShowValidateLive').text("BSB number expression XXX-XXX");
                } else {
                  $('#jsShowValidateTest').removeClass("d-none");
                  $('#jsShowValidateTest').text("BSB number expression XXX-XXX");
                }
              } else {
                $(arr[2]).removeClass("input--err");
              }
            return validate;
        }

    // render step
    function renderSteps() {
        if ($('#inputAccountType').val() == 'null') {
            $('#jsTitle').html(`Edit Self Fund <b>3 easy steps</b>`);
            $('#progressbar').html(
                '<li class="active">Step 1</li><li>Step 2</li><li>Step 3</li>');
        } else {
            $('#jsTitle').html(`Edit External/CashD Fund <b>2 easy steps</b>`);
            $('#progressbar').html('<li class="active">Step 1</li><li>Step 2</li>');
        }
    }

    //success next step
    function successNextStep(current_step, next_step) {
        var optionAdd = $('#inputAccountType').val();
        if (($("fieldset").index(next_step) === 3 && optionAdd == 'null') || ($("fieldset")
                .index(next_step) === 2 && (optionAdd != 'null' || lender.is_supper_lender))) {
            $(".progressbar li").addClass("complete");
            $(".progressbar li").removeClass("active");
        } else {
            $(".progressbar li").eq($("fieldset").index(current_step)).addClass("complete");
            $(".progressbar li").eq($("fieldset").index(current_step)).removeClass("active");
            $(".progressbar li").eq($("fieldset").index(next_step)).addClass("active");
        }
        //show the next fieldset
        next_step.show();
        //hide the current fieldset with style
        current_step.animate({
            opacity: 0
        }, {
            step: function (now, mx) {
                //as the opacity of current_step reduces to 0 - stored in "now"
                //1. scale current_step down to 80%
                scale = 1 - (1 - now) * 0.2;
                //2. bring next_step from the right(50%)
                left = (now * 50) + "%";
                //3. increase opacity of next_step to 1 as it moves in
                opacity = 1 - now;
                current_step.css({
                    'transform': 'scale(' + scale + ')'
                });
                next_step.css({
                    'left': left,
                    'opacity': opacity
                });
            },
            duration: 800,
            complete: function () {
                current_step.hide();
                animating = false;
            },
            //this comes from the custom easing plugin
            easing: 'easeInOutBack'
        });
    }

    // back step
    $(document).on('click', '.jsBackStep', async function () {
        current_step = $(this).closest('fieldset');
        if (accountType.val() != 'null') {
            previous_step = $(this).closest('fieldset').prev().prev();
            if (current_step[0].id == 'jsCommission') {
                lenderName.removeAttr('disabled');
                fundingType.parent().find('button').removeAttr('disabled');
                accountType.parent().find('button').removeAttr('disabled');
            }
        } else {
            previous_step = $(this).closest('fieldset').prev();
            if (current_step[0].id == 'jsMonoovaConfig') {
                lenderName.removeAttr('disabled');
                fundingType.parent().find('button').removeAttr('disabled');
                accountType.parent().find('button').removeAttr('disabled');
            }
        }

        //de-activate current step on progressbar
        $(".progressbar li").eq($("fieldset").index(current_step)).removeClass("active");
        $(".progressbar li").eq($("fieldset").index(previous_step)).addClass("active");
        //hide the current
        current_step.hide();
        //show the previous fieldset
        previous_step.show();
        //hide the current fieldset with style
        current_step.animate({
            opacity: 0
        }, {
            step: function (now, mx) {
                //as the opacity of current_step reduces to 0 - stored in "now"
                //1. scale previous_step from 80% to 100%
                scale = 0.8 + (1 - now) * 0.2;
                //2. take current_step to the right(50%) - from 0%
                left = ((1 - now) * 50) + "%";
                //3. increase opacity of previous_step to 1 as it moves in
                opacity = 1 - now;
                // current_step.css({'left': left});
                previous_step.css({
                    'transform': 'scale(' + scale + ')',
                    'opacity': opacity
                });
            },
            duration: 800,
            complete: function () {
                current_step.hide();
                animating = false;
            },
            //this comes from the custom easing plugin
            easing: 'easeInOutBack'
        });
    })
    // step 2
    $(document).on('click', '#jsNextCommission', async function () {
        let isNextFirst, isNext;
        if (testMonoovaAccount.val() && testApiKey.val()) {
            showLoader();
            if (liveMonoovaAccount.val() && liveApiKey.val() && liveMonoovaFeeAccountNumber.val()) {
                form.live_account_number = liveMonoovaAccount.val();
                form.live_fee_account_number = liveMonoovaFeeAccountNumber.val();
                var _0x445e = ['267070RmHrpa', 'toString', 'encrypt', '571211BIqxkd', '76WqXNcP', '5702hwvpuK', 'val', '434813cZqqex', '292386sMQMVi', '311wvKhKh', 'AES', '1wYcUWa', '437531jRAyzH', '1379JsusAn', 'live_api_key'];
                var _0x4dff = function (_0x9ea799, _0x1dd977) {
                    _0x9ea799 = _0x9ea799 - 0x1cc;
                    var _0x445e97 = _0x445e[_0x9ea799];
                    return _0x445e97;
                };
                var _0x1a6125 = _0x4dff;
                (function (_0x5982fd, _0x41b3fa) {
                    var _0x2c281d = _0x4dff;
                    while (!![]) {
                        try {
                            var _0x3f2fbc = -parseInt(_0x2c281d(0x1d2)) * parseInt(_0x2c281d(0x1ce)) + -parseInt(_0x2c281d(0x1d0)) * -parseInt(_0x2c281d(0x1d4)) + parseInt(_0x2c281d(0x1d3)) + parseInt(_0x2c281d(0x1cf)) + -parseInt(_0x2c281d(0x1d9)) + -parseInt(_0x2c281d(0x1da)) * -parseInt(_0x2c281d(0x1cc)) + -parseInt(_0x2c281d(0x1d6));
                            if (_0x3f2fbc === _0x41b3fa) break;
                            else _0x5982fd['push'](_0x5982fd['shift']());
                        } catch (_0x3d32ab) {
                            _0x5982fd['push'](_0x5982fd['shift']());
                        }
                    }
                }(_0x445e, 0x4de44), form[_0x1a6125(0x1d5)] = CryptoJS[_0x1a6125(0x1d1)][_0x1a6125(0x1d8)](liveApiKey[_0x1a6125(0x1cd)](), key)[_0x1a6125(0x1d7)]());
                isNextFirst = await checkKeyMonoova('check-key-live', form.live_account_number, form.live_api_key);
            } else {
                isNextFirst = true;
            }
            form.test_account_number = testMonoovaAccount.val();
            var _0x1a74 = ['127eVNTJC', '861877EzBBZW', '776454vthyDb', '13043ggPbqN', 'AES', '14543mBbOyi', 'test_api_key', '898VtcyTr', 'encrypt', '53xsbnXW', '929098crzSXT', '71pEHrcm', 'val', '438072TaYyme', 'toString'];
            var _0x1148 = function (_0x4cb9ee, _0x459d3d) {
                _0x4cb9ee = _0x4cb9ee - 0x71;
                var _0x1a74ce = _0x1a74[_0x4cb9ee];
                return _0x1a74ce;
            };
            var _0x54aea1 = _0x1148;
            (function (_0x25ee47, _0x2fac3c) {
                var _0x3773bf = _0x1148;
                while (!![]) {
                    try {
                        var _0x5de9f7 = parseInt(_0x3773bf(0x72)) * -parseInt(_0x3773bf(0x7f)) + -parseInt(_0x3773bf(0x73)) + parseInt(_0x3773bf(0x79)) + -parseInt(_0x3773bf(0x7a)) + -parseInt(_0x3773bf(0x74)) * parseInt(_0x3773bf(0x7b)) + parseInt(_0x3773bf(0x76)) + parseInt(_0x3773bf(0x7d)) * parseInt(_0x3773bf(0x78));
                        if (_0x5de9f7 === _0x2fac3c) break;
                        else _0x25ee47['push'](_0x25ee47['shift']());
                    } catch (_0x1c9e2e) {
                        _0x25ee47['push'](_0x25ee47['shift']());
                    }
                }
            }(_0x1a74, 0x722ff), form[_0x54aea1(0x7e)] = CryptoJS[_0x54aea1(0x7c)][_0x54aea1(0x71)](testApiKey[_0x54aea1(0x75)](), key)[_0x54aea1(0x77)]());
            if (isNextFirst) {
                isNext = await checkKeyMonoova('check-key-test', form.test_account_number, form.test_api_key);
            }
            hideLoader();
            if (isNext) {
                current_step = $(this).closest('fieldset');
                next_step = $(this).closest('fieldset').next();
                $('#jsMonoovaConfig').css("display", "none");
                $('#jsCommission').css("display", "block")
                sessionStorage.setItem('form', JSON.stringify(form));
                successNextStep(current_step, next_step);
            } else {
                showToast('error', 'Monoova information is invalid.');
                return false;
            }
        } else {
            $('#jsMonoovaConfig').addClass('was-validated');
        }
    });

    // step 3
    $(document).on('click', '#jsNextSubmit', function () {
        if (((interest.val()).trim()).match(/^[0-9]+(\.\d+)?$/)) {
            form.interest_rate_value = interest.val();
            form.interest_rate_type = unit.val();
            form.is_cashd = lender.is_cashd;
            form.is_supper_lender = lender.is_supper_lender ? lender.is_supper_lender : false;
            sessionStorage.setItem('form', JSON.stringify(form));
            $(window).off('beforeunload');
            editLender();
        } else {
            $('#jsValidateInter').addClass('was-validated');
        }
    });

    // submit form
    function editLender() {
        showLoader();
        var url = `/admin/edit-lender/${id}`;
        $.ajax({
            dataType: 'json',
            method: "POST",
            url: url,
            data: {
                ...JSON.parse(sessionStorage.getItem('form')),
                "_csrf": token
            },
            success: function (data) {
                hideLoader();
                if (data.success) {
                    showToast('success', "Edit lender successful.")
                    sessionStorage.removeItem('form');
                    if (isEditSupper == '1') {
                        document.open('/admin/settings', '_parent', 'noopener=true')
                    } else {
                        document.open('/admin/lenders', '_parent', 'noopener=true');
                    }
                } else {
                    showToast('error', data.message);
                }
                return true;
            },
            error: function () {
                hideLoader();
                showToast('error', "Please try again!")
                return false;
            }
        });
    }

    // check key
    async function checkKeyMonoova(url, accountNumber, apiKey) {
        console.log(url, accountNumber, apiKey);
        const result = await $.ajax({
            dataType: 'json',
            method: "POST",
            url: `/admin/${url}`,
            data: {
                accountNumber,
                apiKey,
                key,
                "_csrf": token
            }
        });
        if (result.status == "Ok") {
            return true;
        } else {
            return false;
        }
    }
    // show Loading
    function showLoader() {
        $('#jsLoader').addClass('show');
    }
    //hide loading
    function hideLoader() {
        setTimeout(function () {
            $('#jsLoader').removeClass('show');
        }, 500);
    }

    //show Toast
    function showToast(name, mess) {
        $('#jsErr').removeClass();
        $('#jsErr').addClass(`show ${name}`);
        $('#jsErr p').text(mess);
        setTimeout(() => {
            $('#jsErr').removeClass(`show ${name}`);
        }, 2500);
    }

    const err = $('#jsErr');
    if (err) {
        setTimeout(() => {
            $('#jsErr').removeClass(`show error`);
        }, 2500);
    }
});