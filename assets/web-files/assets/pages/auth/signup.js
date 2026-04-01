$(window).on('beforeunload', function(){
  return 'Are you sure you want to leave?';
});
let isLoad = true;
const socket = io();

$(document).ready(function() {
  
  const token = $('#_csrf').val();
  const urlKeyPay = $('#urlKeyPay').val();
  const urlXero = $('#urlXeRo').val();
  const urlDeputy = $('#urlDeputy').val();
  const urlReckon = $('#urlReckon').val();
  const pupupWidth = screen.width - 400;
  const pupupHeight = screen.height - 200;
  const windowFeatures = `resizable,scrollbars=0,status,top=100,left=200,width=${pupupWidth},height=${pupupHeight}`;
  let codeSystem = '', current_step, next_step, tenantId, companyName, reckonSelected;
  let lastSignupCodeSystem = ''; // hệ thống đã chọn lần trước (để không clear khi back step 1 rồi chọn lại đúng hệ thống đó)
  let accessToken, refreshToken, systemEmployeeList, systemCompany, systemUser, formUser, endpoint, systemCompanyId;
  let currentPageNumber = 0, checkData, request = null, companyIdKeypay, userRoot = {}, reckonReLogin = true, companies = {}, reckonUser, 
  astuteApiKey, astuteApiUserName, astuteApiPassword, userNameHR3, passwordHR3, apiKeyRH3, companyIdHR3; 
  let companiesAstute = {};
  let misaOtpSent = false;
  let misaOtpResendIntervalId = null;

  function clearMisaOtpResendCooldown() {
    if (misaOtpResendIntervalId) {
      clearInterval(misaOtpResendIntervalId);
      misaOtpResendIntervalId = null;
    }
  }

  /** Đếm ngược 30s: Resend disabled, hiển thị "in Ns." (giống design). */
  function startMisaOtpResendCooldown(totalSeconds) {
    clearMisaOtpResendCooldown();
    const $btn = $('#misaOtpResend');
    const $cd = $('#misaOtpResendCountdown');
    if (!$btn.length) return;
    let sec = totalSeconds;
    $btn.prop('disabled', true);
    $cd.text(' in ' + sec + 's.').show();
    misaOtpResendIntervalId = setInterval(function () {
      sec -= 1;
      if (sec <= 0) {
        clearMisaOtpResendCooldown();
        $btn.prop('disabled', false);
        $cd.text('').hide();
        return;
      }
      $cd.text(' in ' + sec + 's.');
    }, 1000);
  }

  /** Bước 3: MISA dùng 2 tab (chi tiết cá nhân / OTP). Các hệ thống khác chỉ hiện form + Complete. */
  function setPersonalStepMisaMode(isMisa) {
    if (isMisa) {
      $('.misa-personal-tabs').removeAttr('hidden');
      $('.misa-personal-tab-dot').removeClass('active');
      $('.misa-personal-tab-dot[data-target="misa-personal-details"]').addClass('active');
      $('.misa-personal-pane-details').removeAttr('hidden');
      $('.misa-personal-pane-otp').attr('hidden', true);
      $('#jsMisaPersonalNext').removeAttr('hidden');
      $('#jsNextStep1').attr('hidden', true);
    } else {
      $('.misa-personal-tabs').attr('hidden', true);
      $('.misa-personal-tab-dot').removeClass('active');
      $('.misa-personal-tab-dot[data-target="misa-personal-details"]').addClass('active');
      $('.misa-personal-pane-details').removeAttr('hidden');
      $('.misa-personal-pane-otp').attr('hidden', true);
      $('#jsMisaPersonalNext').attr('hidden', true);
      $('#jsNextStep1').removeAttr('hidden');
    }
  }

  function showMisaPersonalOtpTab() {
    $('.misa-personal-tab-dot').removeClass('active');
    $('.misa-personal-tab-dot[data-target="misa-personal-otp"]').addClass('active');
    $('.misa-personal-pane-details').attr('hidden', true);
    $('.misa-personal-pane-otp').removeAttr('hidden');
    $('.misa-otp-email-hint').text(formUser && formUser.email ? formUser.email : '');
    startMisaOtpResendCooldown(30);
  }

  function showMisaPersonalDetailsTab() {
    clearMisaOtpResendCooldown();
    $('#misaOtpResend').prop('disabled', false);
    $('#misaOtpResendCountdown').text('').hide();
    $('.misa-personal-tab-dot').removeClass('active');
    $('.misa-personal-tab-dot[data-target="misa-personal-details"]').addClass('active');
    $('.misa-personal-pane-otp').attr('hidden', true);
    $('.misa-personal-pane-details').removeAttr('hidden');
  }

  function requestMisaRegisterOtp(callbackOnOk) {
    const { email, firstName, lastName, countryCode, mobile  } = formUser;
    const phone = countryCode ? `+${countryCode}${mobile}` : mobile;
    $.ajax({
      dataType: 'json',
      method: 'POST',
      url: '/get-OTPCode',
      data: {
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        '_csrf': token,
      },
      async: true,
      success: function (data) {
        if (data.success) {
          misaOtpSent = true;
          if (typeof callbackOnOk === 'function') {
            callbackOnOk();
          } else {
            hidenLoader();
            showToast('success', 'Verification code sent to your email.');
          }
        } else {
          hidenLoader();
          showToast('error', data.message || 'Could not send verification code. Please try again.');
        }
      },
      error: function () {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again.");
      },
    });
  }

  // initial step: payroll system integration (step4)
  current_step = $('#step4');
  next_step = $('#step4');
  updateStepHeader(current_step);
  showLoader();
  $('.system-list .row').remove();
  getSystemList();

  $('input[type="text"]').keypress(function(event) {
    if (event.which === 13) {
      if (event.target.id === 'activeCode') {
        $('#jsSubmitStep3').trigger('click');
      } else if (event.target.id === 'otpCode') {
        $('#jsNextStep2').trigger('click');
      } else if (event.target.id === 'misaOtpCode') {
        $('#misaOtpComplete').trigger('click');
      } else if ($("#step5").find(`input[name='${event.target.name}']`).length > 0) {  
        if (!$("#jsChooseCompany").hasClass("show")) {
          if (event.target.name == "userNameHR3" || event.target.name == "passwordHR3" || event.target.name == "apiKeyRH3") {
            $('#submitHR3Info').trigger('click');
          } else if (event.target.name == "apiKey" || event.target.name == "apiUserName" || event.target.name == "apiPassword") {
            $('#submitAstuteInfo').trigger('click');
          } else if (
            codeSystem === 'MISA' &&
            !$('.misa-api').attr('hidden') &&
            [
              'misaApiKey',
              'misaApiUserName',
              'misaApiPassword',
              'employeeCentralConnectionId',
              'employeeCentralPasscode',
              'timekeepingConnectionId',
              'timekeepingPasscode',
              'salaryConnectionId',
              'salaryPasscode'
            ].includes(event.target.name)
          ) {
            $('#misaApiNextBtn').trigger('click');
          } else {
            $('#submitCompanyInfo').trigger('click');
          }
        }
      } else if (
        codeSystem === 'MISA' &&
        $(event.target).closest('#stepPersonal .misa-personal-pane-details').length
      ) {
        $('#jsMisaPersonalNext').trigger('click');
      } else {
        $('#jsNextStep1').trigger('click');
      }
    }
  });

  $('#mobile').keypress(validateNumber);

  function validateInput(inputInStep) {
    
    let isValid = true;
    inputInStep.each(function(index, input) {
      $("#" + input.id).focusout(function () {
        if ($("#" + input.id).val() === "") {
          isValid = false;
          $("#" + input.id).addClass("invalid");
        } else {
          $("#" + input.id).removeClass("invalid");
        }
      });
      if ($("#" + input.id).val() === "") {
        isValid = false;
        $("#" + input.id).addClass("invalid");
      } 
    });
    return isValid;
  }
  
  function validateEmail(email) {
    return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  }

  function validateNumber(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode === 8 || event.keyCode === 46) {
        return true;
    } else if ( key < 48 || key > 57 ) {
        return false;
    } else {
        return true;
    }
  };

  //show Toast
  function showToast(name, mess) {
    $('#jsErr').removeClass();
    $('#jsErr').addClass(`show ${name}`);
    $('#jsErr p').text(mess);
    setTimeout(() => {
      $('#jsErr').removeClass(`show ${name}`);
    }, 2500);
  }
  //show loading 
  function showLoader() {
    $('#jsLoader').addClass('show');
  }
  //hiden loading
  function hidenLoader() {
    setTimeout(function () {
      $('#jsLoader').removeClass('show');
    }, 500);
  }
  //show popup page system
  function popupSystem(url, name) {
    let popup;
    if (codeSystem === "RECKON") {
      popup = window.open(url, name, windowFeatures);
    } else {
      popup = window.open(url, name, windowFeatures);
    }
    popup.focus();
    const popupTick = setInterval( () => {
      if (popup.closed && isLoad) {
        clearInterval(popupTick);
        hidenLoader();
      }
    }, 500);
    return popup;
  }
  // cập nhật title/description theo fieldset hiện tại
  function updateStepHeader(step) {
    if (!step || !step.length) return;
    const title = $(step).data('title');
    const desc  = $(step).data('description');

    if (title) {
      $('.signup-main-title').text(title);
    }

    const $subtitle = $('.signup-main-subtitle');
    if (typeof desc !== 'undefined') {
      if (desc && desc.length > 0) {
        $subtitle.text(desc).show();
      } else {
        // nếu mô tả rỗng (ví dụ step 4), ẩn hẳn để không chừa khoảng trống
        $subtitle.text('').hide();
      }
    }
  }

  //success next step – chuyển step gọn, không scale/co giãn panel
  function successNextStep(current_step, next_step) {
    const currentIndex = $("fieldset").index(current_step);
    const nextIndex    = $("fieldset").index(next_step);

    updateStepHeader(next_step);

    if (nextIndex === 5) {
      $(".progressbar li").addClass("complete");
      $(".progressbar li").removeClass("active");
    } else if (nextIndex !== 5) {
      $(".progressbar li").eq(currentIndex).addClass("complete");
      $(".progressbar li").eq(currentIndex).removeClass("active");
      $(".progressbar li").eq(nextIndex).addClass("active");
    }

    current_step.hide();
    next_step.css({ left: 0, opacity: 1, transform: 'scale(1)' }).show();
    animating = false;
  }
  
  // back step
  $(document).on('click', '.jsBackStep', function() {
    const fieldset = $(this).closest('fieldset');

    // Trường hợp MISA đang ở tab 2 (company) của step 2: chỉ quay về tab 1 (API), không đổi step
    if (fieldset.attr('id') === 'step5' && codeSystem === 'MISA' && !$('.misa-tabs').attr('hidden')) {
      const $step5Dots = $('#step5 .misa-tabs .misa-tab-dot');
      $step5Dots.removeClass('active');
      $step5Dots.filter('[data-target="misa-api"]').addClass('active');
      $('.misa-api').attr('hidden', false);
      $('.input-company').attr('hidden', true);
      return;
    }

    if (
      fieldset.attr('id') === 'stepPersonal' &&
      codeSystem === 'MISA' &&
      !$('.misa-personal-pane-otp').attr('hidden')
    ) {
      showMisaPersonalDetailsTab();
      return;
    }

    if (fieldset.attr('id') === 'step5') {
      // Bước 2: luôn quay lại step 1 (Payroll System)
      current_step = fieldset;
      previous_step = $('#step4');
    } else {
      // Các bước còn lại giữ hành vi cũ: quay về fieldset trước đó trong DOM
      current_step = fieldset;
      previous_step = fieldset.prev();
    }

    //de-activate current step on progressbar
    const currentIndex  = $("fieldset").index(current_step);
    const previousIndex = $("fieldset").index(previous_step);
    $(".progressbar li").eq(currentIndex).removeClass("active");
    $(".progressbar li").eq(previousIndex).addClass("active");

    // nếu quay về step 1 (fieldset đầu tiên), đảm bảo chỉ vòng tròn đầu tiên active
    if (previousIndex === 0) {
      $(".progressbar li").removeClass("active complete");
      $(".progressbar li").eq(0).addClass("active");
    }

    //show the previous fieldset – không scale/co giãn panel
    updateStepHeader(previous_step);
    current_step.hide();
    previous_step.css({ left: 0, opacity: 1, transform: 'scale(1)' }).show();
    animating = false;

  })
  // Step 3 (MISA): NEXT – gửi OTP, chuyển tab xác minh email
  $('#jsMisaPersonalNext').click(function () {
    current_step = $('#stepPersonal');
    const email = $('#email').val();
    const firstName = $('#firstName').val();
    const lastName = $('#lastName').val();
    const mobile = $('#mobile').val();
    const countryCode = $('#selectedCountryCode').val();

    if (!validateInput(current_step.find('.misa-personal-pane-details input'))) {
      showToast('error', 'Please fill in all the required fields.');
      return false;
    }
    if (!validateEmail(email)) {
      showToast('error', 'Invalid Email address.');
      return;
    }

    showLoader();

    formUser = {
      email,
      firstName,
      lastName,
      countryCode,
      mobile,
    };

    const systemId = systemCompany && systemCompany.system_company_id
      ? systemCompany.system_company_id
      : '';

    systemUser = {
      first_name: firstName,
      last_name: lastName,
      fullname: `${firstName} ${lastName}`.trim(),
      mobile: countryCode ? `+${countryCode}${mobile}` : mobile,
      email,
      system_user_id: systemId,
      system_employee_id: systemId,
    };

    requestMisaRegisterOtp(function () {
      hidenLoader();
      $('#misaOtpCode').val('');
      showMisaPersonalOtpTab();
    });
  });

  $('.misa-personal-tab-dot').on('click', function () {
    if (codeSystem !== 'MISA') return;
    var target = $(this).data('target');
    if (target === 'misa-personal-details') {
      showMisaPersonalDetailsTab();
      return;
    }
    if (target === 'misa-personal-otp') {
      if (!misaOtpSent) {
        showToast('error', 'Please complete your details and tap NEXT to receive a code.');
        return;
      }
      showMisaPersonalOtpTab();
    }
  });

  $(document).on('click', '.jsMisaOtpBack', function () {
    showMisaPersonalDetailsTab();
  });

  $('#misaOtpResend').on('click', function () {
    if ($(this).prop('disabled')) return;
    if (!formUser || !formUser.email) {
      showToast('error', 'Please complete your personal details first.');
      return;
    }
    if (!misaOtpSent) {
      showToast('error', 'Use NEXT on the previous step first.');
      return;
    }
    showLoader();
    requestMisaRegisterOtp(function () {
      hidenLoader();
      showToast('success', 'A new verification code has been sent.');
      startMisaOtpResendCooldown(30);
    });
  });

  $('#misaOtpComplete').on('click', function () {
    if (!formUser || !formUser.email) {
      showToast('error', 'Please complete your personal details first.');
      return;
    }
    const otpVal = ($('#misaOtpCode').val() || '').trim();
    if (!otpVal) {
      showToast('error', 'Please enter the verification code.');
      return;
    }
    showLoader();
    current_step = $('#stepPersonal');
    next_step = $('#msform fieldset').last();
    $.ajax({
      dataType: 'json',
      method: 'POST',
      url: '/send-OTPCode',
      data: {
        email: formUser.email,
        code: otpVal,
        '_csrf': token,
      },
      async: true,
      success: function (data) {
        if (data.success) {
          $('#misaOtpCode').val('');
          submitFormRegister(current_step, next_step);
        } else if (data.errorCode === 'FORGOT_PASSWORD_CODE_EXPIRED') {
          hidenLoader();
          showToast('error', 'Verification code expired.');
        } else {
          hidenLoader();
          showToast('error', 'Incorrect code, please try again.');
        }
      },
      error: function () {
        hidenLoader();
        showToast('error', 'Incorrect code, please try again.');
      },
    });
  });

  // Step 3: Complete – thu thập thông tin user và submit registration (không dùng khi MISA – dùng OTP tab)
  $('#jsNextStep1').click(function() {
    if (codeSystem === 'MISA') {
      return false;
    }
    current_step = $(this).closest('fieldset');
    const email       = $("#email").val();
    const firstName   = $("#firstName").val();
    const lastName    = $("#lastName").val();
    const mobile      = $("#mobile").val();
    const countryCode = $('#selectedCountryCode').val();

    if (!validateInput(current_step.find("input"))) {
      showToast('error', 'Please fill in all the required fields.');
      return false;
    }
    if (!validateEmail(email)) {
      showToast('error', 'Invalid Email address.');
      return;
    }

    showLoader();

    // Lưu lại thông tin người dùng ở bước 3
    formUser = {
      email,
      firstName,
      lastName,
      countryCode,
      mobile
    };

    // Thu thập thông tin user vào system_user để gửi lên API đăng ký
    const systemId = systemCompany && systemCompany.system_company_id
      ? systemCompany.system_company_id
      : '';

    systemUser = {
      first_name: firstName,
      last_name: lastName,
      fullname: `${firstName} ${lastName}`.trim(),
      mobile: countryCode ? `+${countryCode}${mobile}` : mobile,
      email,
      system_user_id: systemId,
      system_employee_id: systemId
    };

    // next_step là fieldset cuối cùng (màn hình Complete)
    const next_step = $('#msform fieldset').last();
    submitFormRegister(current_step, next_step);
  });
  //Step POST OTP 
  $(document).on('click', '#jsNextStep2', function(){
    if (!validateInput($(this).parent().find("input"))) {
      showToast('error', 'Please enter the one time password.');
      return false;
    }
    showLoader();
    current_step = $(this).parent();
    next_step = $(this).parent().next();
    
    const { email } = formUser;
    const otpCode = $("#otpCode").val();
    
    $.ajax({
      dataType: 'json',
      method: "POST",
      url: `/send-OTPCode`,
      data: {
        email: email,
        code: otpCode,
        "_csrf": token
      },
      async: true,
      success: function(data){
        hidenLoader();
        if (data.success) {
          $("#otpCode").val("");
          $("#step3").html(data.sourceCode);
          successNextStep(current_step, next_step);
        } else if (data.errorCode === "FORGOT_PASSWORD_CODE_EXPIRED") {
          showToast('error', "Activation code expired.");
        } else {
          showToast('error', "Incorrect code, please try again!");
        }
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Incorrect code, please try again!")
        return false;
      }
    });
  });
  //Send activation code 
  $(document).on('click', '#jsSubmitStep3', function() {
    if (!validateInput($(this).parent().find("input"))) {
      showToast('error', 'Please enter the activation code.');
      return false;
    }
    showLoader();
    const activation_code = $("#activeCode").val();
    current_step = $(this).parent();
    // after activation, go to final "Completed" fieldset (last one)
    next_step = $('#msform fieldset').last();
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/send-activationCode`,
      data: {
        email: formUser.email,
        activation_code: activation_code,
        "_csrf": token
      },
      async: true,
      success: function(data) {
        hidenLoader();
        if (data.success) {
          $('.info-company-register').append(
            `<h4 class="mt-5">Login credentials sent</h4>
            <div>
              <img src="/web-images/ic_submit_email_success.9.png" alt="img_mail" width="200">
              <h6>Thank you for Activating your account!
              <h6>We are preparing your account. Please look out for a final email with your login credentials to get you started using CashD.
              </h6>
            </div>
            <div class="mt-3">
              <button type="button" class="btn btn-primary btn-redirect-login" style="width: 50%">OK</button>
            </div>`
          );
          //Redirect login
          $('.btn-redirect-login').click(function () {
            $(window).off('beforeunload');
            location.href = '/';
          });
          successNextStep(current_step, next_step);
        } else if (data.errorCode === "REQUIRE_ACTIVATION_CODE_INVALID") {
          showToast('error', "Activation code is invalid. Please re-create a new code.");
        } else {
          showToast('error', "Can't connect to server. Try again!");
        }
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again!")
        return false;
      }
    })
  });
  //Resend activation code
  $(document).on('click', '#jsResendActiveCode', function() {
    showLoader();
    $.ajax({
      dataType: 'json',
      type: 'POST',
      url: `/resend-activationCode`,
      data: {
        email: formUser.email,
        "_csrf": token
      },
      async: true,
      success: function(data) {
        hidenLoader();
        if (data.success) {
          $('#jsShowInvitation').modal('show');
        } else if(data.errorCode === "NOT_FOUND_EMAIL") {
          $('#jsShowErrInvitation').modal('show');
        } else {
          showToast('error', "Can not connect to server. Please try again.");
        }
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can not connect to server. Please try again.")
        return false;
      }
    });
  });
  //Register Company and Next Step 3 (OTP flow)
  $(document).on('click', '#jsNextStep3', function() {
    showLoader();
    $('.system-list .row').remove();
    const fromStep = $(this).parent().parent();
    const toStep = $(this).parent().parent().next();
    getSystemList(fromStep, toStep);        
  })
  //Load System 
  $('#jsNextStep4').click(function () {
    showLoader();
    $('.employee-list .row').remove();
    $('.modal-chooseUser .form-login-checkbox').remove();
    $('.modal-chooseCompany .form-login-checkbox').remove();
    systemCompany = []; systemEmployeeList = []; systemUser = [];
    switch (codeSystem) {
      case 'KEYPAY':
        runLoginSystem(urlKeyPay, codeSystem);
        break;
      case 'XERO':
        // runLoginXero();
        runLoginSystem(urlXero + formUser.email, codeSystem);
        break;
      case 'DEPUTY':
        runLoginSystem(urlDeputy, codeSystem);
        break;
      case 'MYOBEXO':
        alert("Coming Soon!!!");
        hidenLoader();
        break;
      case 'ASTUTE':
        lastSignupCodeSystem = codeSystem;
        successNextStep($('#step4'), $('#step4').next());
        showRegisterAstute();
        hidenLoader();
        break;
      case 'RECKON':
        runLoginSystem(urlReckon, codeSystem);
        break;
      case 'NONE':
      case 'TANCA':
        if (lastSignupCodeSystem !== codeSystem) {
          clearLocalPaymentDataAndFormFields();
        }
        lastSignupCodeSystem = codeSystem;
        successNextStep($('#step4'), $('#step4').next());
        showRegisterNone();
        hidenLoader();
        break;
      case 'MISA':
        if (lastSignupCodeSystem !== codeSystem) {
          clearLocalPaymentDataAndFormFields();
        }
        lastSignupCodeSystem = codeSystem;
        successNextStep($('#step4'), $('#step4').next());
        showRegisterMisa();
        hidenLoader();
        break;
      case 'HR3':
        lastSignupCodeSystem = codeSystem;
        successNextStep($('#step4'), $('#step4').next());
        showRegisterHR3();
        hidenLoader();
        break;
      default:
        break;
    }
  });
  //Select Company
  $('#jsSelectCompany').click(function() {
    showLoader();
    switch (codeSystem) {
      case 'KEYPAY':
        //getEmployeeKeypay(currentPageNumber);
        hidenLoader();
        $('#jsChooseCompany').modal('hide');
        successNextStep($('#step4'), $('#step4').next());
        showInfoSignup(formUser, userRoot);
        break;
      case 'XERO':
        getUserXero(token, accessToken, tenantId);
        break;
      case 'RECKON':
        runShowInfoSignup();
        break;
      case 'ASTUTE':
        runSignupAstute();
        break;
      case 'HR3':
        runSignupHR3();
        break;
      default:
        break;
    }
  });
  //Select User
  $('#jsSelectUser').click(function() {
    showLoader();
    switch (codeSystem) {
      case 'KEYPAY':
        getBusinessKeypay();
        break;
      case 'XERO':
        getEmployeeListXero(token, accessToken, tenantId);
        break;
      case 'DEPUTY':
        getCompanyDeputy();
        getEmployeeDeputy();
        break;
      default:
        break;
    }
  });
  //Invite
  $('#jsInvite').click(function() {
    showLoader();
    $('.employee-list-invite .row').remove();
    let convertValueEmp;
    systemEmployeeList = [];
    current_step = $(this).parent();
    next_step = $(this).parent().next();
    $('.employee-list .checkbox-emp').each(function (index, input) {
      let valueEmp = JSON.parse(input.defaultValue);
      if(input.checked) {
        systemEmployeeList.push(valueEmp);
      }
    });
    let itemsProcessed = 0;
    systemEmployeeList.forEach((emp, index, array) => {
      $('.employee-list-invite').append(
        layoutEmployeeList(emp, emp)
      );
      $('.employee-list-invite .checkbox-emp').prop('checked', true);
      itemsProcessed++;
      if (itemsProcessed === array.length) {
        hidenLoader();
        successNextStep(current_step, next_step);
      }
    });
    
  });
  //Skip and submit step 5.1
  $('#jsSkip1').click(function() {
    showLoader();
    systemEmployeeList = [];
    current_step = $(this).parent();
    next_step = $('#step5').next();
    submitFormRegister(current_step, next_step);
  });
  //Skip and submit step 5.2
  $('#jsSkip2').click(function() {
    showLoader();
    systemEmployeeList = [];
    $('.employee-list-invite .checkbox-emp').each(function (index, input) {
      let valueEmp = JSON.parse(input.defaultValue);
      if(input.checked) {
        systemEmployeeList.push(valueEmp);
      }
    });
    current_step = $(this).parent();
    next_step = $(this).parent().next();
    submitFormRegister(current_step, next_step);
  });

  $('.btn-goBack').click(() => {
    $('#jsShowInvitation').modal('hide');
    $('#jsShowErrInvitation').modal('hide');
  });

  // 
  $(document).on('click', '.btn-submit-signup', () => { 
    current_step = $('#step5');
    next_step = current_step.next();
    submitFormRegister(current_step, next_step);
  });

  //get system list
  function getSystemList(fromStep, toStep) {
    if (fromStep) {
      current_step = fromStep;
    }
    if (toStep) {
      next_step = toStep;
    }
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/get-systemList`,
      data: {
        "_csrf": token
      },
      async: true,
      success: function(data) {
        let itemsProcessed = 0;
        data.result.forEach((item, index, array) => {
          const id = `system-${item.code}`;
          const isActive = item.active !== false;
          const comingSoonHtml = !isActive ? ' <span style="color: #0066cc;">[Coming soon]</span>' : '';
          const disabledAttr = !isActive ? ' disabled' : '';
          $('.system-list').append(
            `<div class="row mb-2">
              <div class="col-12">
                <div class="form-check system-option">
                  <input class="form-check-input checkbox-system" type="radio" name="payrollSystem" value="${item.code}" id="${id}"${disabledAttr}>
                  <label class="form-check-label" for="${id}">
                    ${item.system_name}${comingSoonHtml}
                  </label>
                </div>
              </div>
            </div>`
          );
          itemsProcessed++;
          if (itemsProcessed === array.length) {
            let checkboxs = $('.checkbox-system:not(:disabled)');
            checkboxs.click(function (e) {
              // với radio, browser tự đảm bảo chỉ chọn một; giữ lại để chắc chắn
              checkboxs.each(function () {
                this.checked = false;
              });
              var target = $(e.target);
              target.prop('checked', true);
              // lưu lại code của hệ thống payroll đã chọn
              codeSystem = target.val();
              if (this.checked) { $('#jsNextStep4').prop('disabled', false); }
            });
            // chỉ chuyển bước nếu fromStep và toStep khác nhau (flow OTP cũ)
            if (current_step && next_step && current_step[0] !== next_step[0]) {
              successNextStep(current_step, next_step);
            } else {
              hidenLoader();
            }
          }
        });
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again!")
        return false;
      }
    });
  }
  //run page login Systems
  function runLoginSystem(url, popupName) {
    const popup = popupSystem(url, popupName);
    socket.on('join', data => {
      if (data.code && data.key == popupName) {
        isLoad = false;
        popup.close();
        //get access_token
        switch(popupName) {
          case 'XERO':
            if (data.state == formUser.email) {
              getAccessTokenXero(data.code);
            } else {
              showErr(popupName);
            }
            break;
          case 'DEPUTY': 
            getAccessTokenDeputy(data.code);
            break;
          case 'KEYPAY': 
            getAccessTokenKeypay(data.code);
            break;
          case "RECKON":
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
    if(request && request.readyState != 4){
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
      success: function(data) {
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        getConnectionsXero(data.access_token, data.id_token);
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again")
        return false;
      }
    });
  }
  //get Connection XERO
  function getConnectionsXero(access_token, id_token) {
    // decoded token
    var decoded = jwt_decode(id_token);
    userRoot.email = decoded.email;
    userRoot.first_name = decoded.family_name;
    userRoot.last_name =  decoded.given_name;
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/xero-get-connections`,
      data: {
        access_token: access_token,
        "_csrf": token
      },
      async: true,
      success: function(data) {
        let itemsProcessed = 0, companyConvert;
        if (data.length === 1) {
          let companyInforItem = getCompanyInforXero(token, access_token, data[0].tenantId);
            companyConvert = {
              fullname: companyInforItem.Name,
              abn: companyInforItem.RegistrationNumber
            }
            userRoot.company_name = companyInforItem.Name;
            userRoot.abn = companyInforItem.RegistrationNumber;
            userRoot.address = companyInforItem.Addresses[1]?.AddressLine1 ?? null;
            $('.modal-chooseCompany').append(
              layoutChooseCompany(companyConvert, companyInforItem)
            );
            tenantId = companyInforItem.OrganisationID;
            convertXeroCompanyToCashdCompany(companyInforItem);
            $('#jsSelectCompany').trigger( "click" );
        } else {
          data.forEach((itemConnect, index, array) => {
            let companyInforItem = getCompanyInforXero(token, access_token, itemConnect.tenantId);
            companyConvert = {
              fullname: companyInforItem.Name,
              abn: companyInforItem.RegistrationNumber
            }
            $('.modal-chooseCompany').append(
              layoutChooseCompany(companyConvert, companyInforItem)
            );
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              hidenLoader();
              $('#jsChooseCompany').modal({
                backdrop: false,
                keyboard: false,
                show: true
              });
              let checkboxCompany = $('.checkbox-company');
              checkboxCompany.click(function (e) {
                checkboxCompany.each(function () {
                  this.checked = false;
                });
                var target = $(e.target);
                target.prop('checked', true);
                let xeroCompanySelected = JSON.parse($(target.parent()).find("input[name='cb-company']").val());
                tenantId = xeroCompanySelected.OrganisationID;
                userRoot.company_name = xeroCompanySelected.Name;
                userRoot.abn = xeroCompanySelected.RegistrationNumber;
                userRoot.address = xeroCompanySelected.Addresses[1]?.AddressLine1 ?? null;
                convertXeroCompanyToCashdCompany(xeroCompanySelected);
                if (this.checked) { 
                  $('#jsSelectCompany').prop('disabled', false) 
                }
              });
            }
          });
        }
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again")
        return false;
      }
    });
  }
  
  //get Company Information XERO
  function getCompanyInforXero(token, access_token, tenantId) {
    let result;
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/xero-get-company`,
      data: {
        access_token: access_token,
        tenantId: tenantId,
        "_csrf": token
      },
      async: false,
      success: function(data) {
        result = data.Organisations[0];
        companyName = data.Organisations[0]?.Name;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again")
        return false;
      }
    });
    return result;
  }
  //get List User XERO
  function getUserXero(token, access_token, tenantId) {
    let dataUser;
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/xero-get-profile`,
      data: {
        access_token: access_token,
        "_csrf": token,
        tenantId: tenantId,
      },
      async: true,
      success: function(data) {
        const { email } = formUser;
        dataUser = data.Users;
        let itemsProcessed = 0;
        let dataFilter = dataUser.filter(item => email.toLowerCase() === item.EmailAddress.toLowerCase());
        let filterRoot = dataUser.filter(item => userRoot.email.toLowerCase() === item.EmailAddress.toLowerCase());
        let userConvert;
        if (filterRoot[0]) {
          userConvert = {
            fullname: `${filterRoot[0].FirstName} ${filterRoot[0].LastName}`,
            email: filterRoot[0].EmailAddress
          }
          $('.modal-chooseUser').append(
            layoutChooseUser(userConvert, filterRoot[0])
          );
          showChooseUser(dataFilter);
        } else {
          dataUser.forEach((item, index, array) => {
            if (email.toLowerCase() === item.EmailAddress.toLowerCase()) {
              convertXeroUserToCashdUser(dataFilter[0]);
              $('#jsChooseCompany').modal('hide');
              getEmployeeListXero(token, access_token, tenantId);
            } else {
              userConvert = {
                fullname: `${item.FirstName} ${item.LastName}`,
                email: item.EmailAddress
              }
              $('.modal-chooseUser').append(
                layoutChooseUser(userConvert, item)
              );
            }
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              showChooseUser(dataFilter);
            }
          });
        }
        
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again")
        return false;
      }
    });
  }
  // 
  function showChooseUser(dataFilter) {
    $('#jsChooseCompany').modal('hide');
    hidenLoader();
    if (dataFilter.length === 0) {
      $('#jsChooseUser').modal({
        backdrop: false,
        keyboard: false,
        show: true
      });
    }
    let checkboxUser = $('.checkbox-user');
      checkboxUser.click(function (e) {
      checkboxUser.each(function () {
        this.checked = false;
      });
      var target = $(e.target);
      target.prop('checked', true);
      let userSelected = $("input[name='userItem']").val();
      if (this.checked) { 
        $('#jsSelectUser').prop('disabled', false);
        convertXeroUserToCashdUser(JSON.parse(userSelected));
      }
    });
    return true;
  }

  //get Employee List XERO
  function getEmployeeListXero(token, access_token, tenantId) {
    current_step = $('#step4');
    next_step = $('#step4').next();
    hidenLoader();
    $('#jsChooseUser').modal('hide');
    successNextStep(current_step, next_step);
    showInfoSignup(formUser, userRoot);
  }

  // show info company and prefill forms
  function showInfoSignup(user, root) {
    lastSignupCodeSystem = codeSystem;
    const hasUser = !!user;
    const userFullName = hasUser
      ? (user.firstName ? (user.firstName + " " + (user.lastName || "")) : (user.fullname || ""))
      : "";
    const userEmail = hasUser ? (user.email || "") : "";
    const userPhone = hasUser && user.mobile
      ? ('+' + (user.countryCode || '') + user.mobile)
      : "";

    // Đổ dữ liệu từ hệ thống thanh toán (có thì đổ đè lên ô trước đó đã nhập)
    if (root.company_name && $("input[name='companyName']").length) {
      $("input[name='companyName']").val(root.company_name);
      lockFieldFromApi("input[name='companyName']");
    }
    if (root.abn && $("input[name='ABN']").length) {
      $("input[name='ABN']").val(root.abn);
      lockFieldFromApi("input[name='ABN']");
    }
    if (root.address && $("input[name='companyAddress']").length) {
      $("input[name='companyAddress']").val(root.address);
    }

    // Đổ dữ liệu personal từ hệ thống thanh toán (có thì đổ đè)
    if (hasUser && (user.first_name || user.firstName) && $("#firstName").length) {
      $("#firstName").val(user.first_name || user.firstName);
    }
    if (hasUser && (user.last_name || user.lastName) && $("#lastName").length) {
      $("#lastName").val(user.last_name || user.lastName);
    }
    if (hasUser && user.email && $("#email").length) {
      $("#email").val(user.email);
      lockFieldFromApi("#email");
    }
    if (hasUser && user.mobile != null && user.mobile !== '' && $("#mobile").length) {
      let mobileStr = String(user.mobile).trim();
      if (user.countryCode && mobileStr.startsWith('+' + user.countryCode)) {
        mobileStr = mobileStr.slice(String(user.countryCode).length + 1).replace(/^[^\d]*/, '');
      }
      $("#mobile").val(mobileStr);
    }
    if (hasUser && user.countryCode != null && $("#selectedCountryCode").length) {
      $("#selectedCountryCode").val(user.countryCode);
    }

    // always show standard company-detail form (same layout as system NONE)
    showRegisterNone();
  }
  //convert Xero Company to Cashd Company
  function convertXeroCompanyToCashdCompany (xeroCompany) {
    systemCompany = {};
    systemCompany.company_name = xeroCompany.Name;
    if (xeroCompany.Addresses.length > 0) {
      systemCompany.address = xeroCompany.Addresses[0].AddressLine1;
      systemCompany.suburb = '';
      systemCompany.city = xeroCompany.Addresses[0].City;
      systemCompany.state = '';
      systemCompany.region = xeroCompany.Addresses[0].Region;
      systemCompany.postcode = xeroCompany.Addresses[0].PostalCode;
    }
    systemCompany.abn = xeroCompany.RegistrationNumber,
    systemCompany.system_company_id = xeroCompany.OrganisationID,
    systemCompany.short_code = xeroCompany.ShortCode,
    systemCompany.currency = xeroCompany.BaseCurrency,
    //add refresh token
    systemCompany.system_refresh_token = refreshToken,
    systemCompany.system_tenant_id = xeroCompany.OrganisationID
  }
  //convert Xero User to Cashd User
  function convertXeroUserToCashdUser (xeroUser) {
    systemUser = {
      first_name: xeroUser.FirstName,
      last_name: xeroUser.LastName,
      fullname: xeroUser.FirstName + ' ' + xeroUser.LastName,
      mobile: '',
      email: xeroUser.EmailAddress,
      system_user_id: xeroUser.UserID,
      system_employee_id: xeroUser.UserID
    }
  }
  //convert Xero User to Cashd User
  function convertXeroEmployeeToCashdEmployee (xeroEmployee, id) {
    let convertSystemEmp = {
      first_name: xeroEmployee.FirstName,
      last_name: xeroEmployee.LastName,
      fullname: xeroEmployee.FirstName + ' ' + xeroEmployee.LastName,
      mobile: '',
      email: xeroEmployee.Email || '',
      system_user_id: id,
      system_employee_id: xeroEmployee.EmployeeID
    }
    return convertSystemEmp;
  }
  
  //<!--------------- End XERO --------------->

  //<--------------- Start KEYPAY --------------->
  
  //get AccessToken KEYPAY
  function getAccessTokenKeypay(code) {
    const decodeURICode = decodeURIComponent(code);
    if(request && request.readyState != 4){
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
      success: function(data) {
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        getUserKeypay(data.access_token)
        return true;
      }
    });
  }
  //get User KEYPAY
  function getUserKeypay(access_token) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/keypay-get-user`,
      data: {
        tokenPay: access_token,
        "_csrf": token,
      },
      async: true,
      success: function(data) {
        const parseUser = JSON.parse(data.data);
        userRoot.fullname  = parseUser.displayName;
        userRoot.email = parseUser.email;
        convertKeypayUserToCashdUser(parseUser);
        hidenLoader();
        getBusinessKeypay();
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again")
        return false;
      }
    });
  }
  //get Business KEYPAY
  function getBusinessKeypay() {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/keypay-get-business`,
      data: {
        tokenPay: accessToken,
        "_csrf": token,
      },
      async: true,
      success: function(data) {
        const parseBusiness = JSON.parse(data.data);
        let itemsProcessed = 0, businessConvert;
        parseBusiness.forEach((item, index, array) => {
          businessConvert = {
            fullname: item.name, 
            abn: item.abn
          }
          $('.modal-chooseCompany').append(
            layoutChooseCompany(businessConvert, item)
          );
          itemsProcessed++;
          if (itemsProcessed === array.length) {
            $('#jsChooseUser').modal('hide');
            hidenLoader();
            $('#jsChooseCompany').modal({
              backdrop: false,
              keyboard: false,
              show: true
            });
            let checkboxCompany = $('.checkbox-company');
            checkboxCompany.click(function (e) {
              checkboxCompany.each(function () {
                this.checked = false;
              });
              var target = $(e.target);
              target.prop('checked', true);
              let keypayCompanySelected = JSON.parse($(target.parent()).find("input[name='cb-company']").val());
              convertKeypayCompanyToCashdCompany(keypayCompanySelected);
              companyIdKeypay = keypayCompanySelected.id;
              companyName = keypayCompanySelected.name;
              userRoot.company_name = keypayCompanySelected.name; 
              userRoot.abn = keypayCompanySelected.abn;
              userRoot.address = keypayCompanySelected.addressLine1;
              if (this.checked) { 
                $('#jsSelectCompany').prop('disabled', false) 
              }
            });
          }
        });
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again")
        return false;
      }
    });
  }  
  //get Employee KEYPAY
  function getEmployeeKeypay(currentPageNumber) {
    let dataEmployee = [], checkData = true;
    current_step = $('#step4');
    next_step = current_step.next();
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/keypay-get-employees`,
      data: {
        page: currentPageNumber,
        companyId: companyIdKeypay,
        tokenPay: accessToken,
        "_csrf": token,
      },
      async: true,
      beforeSend: function(xhr) {
        $(".employee-list").after($("<div class='loading'>Loading...</div>").fadeIn('slow')).data("loading", true);
      },
      success: function(data) {
        let valueEmp; var $results = $(".employee-list");
        $('.modal-chooseUser .form-login-checkbox').remove();
        $(".loading").fadeOut('fast', function() {
            $(this).remove();
        });
        data.forEach(emp => {
          valueEmp = convertKeypayEmployeeToCashdEmployee(emp);
          dataEmployee.push(valueEmp);
        });
        let itemsProcessed = 0, empConvert;
        if (dataEmployee.length > 0) {
          dataEmployee.forEach((item, index, array) => {
            empConvert = {
              fullname: `${item.first_name} ${item.last_name}`,
              email: item.email
            }
            $('.employee-list').append(
              layoutEmployeeList(empConvert, item)
            );
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              hidenLoader();
              $('#jsChooseCompany').modal('hide');
              successNextStep(current_step, next_step);
            }
          });
          showPopupNotify();
          //scroll load more data
          $results.removeData("loading");
          $('.scroll-pane').scroll(function() {
            var $this = $(this);
            var $results = $(".employee-list");
            if (!$results.data("loading")) {
              if ($this.scrollTop() + $this.height() == $results.height()) {
                currentPageNumber++;
                getEmployeeKeypay(currentPageNumber);
              } 
            } 
          });
        } else {
          checkData = false;
          hidenLoader();
          $('#jsChooseCompany').modal('hide');
          successNextStep(current_step, next_step);
        }
        checkInvite();
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again")
        return false;
      }
    });
  }
  //convert Keypay Company to Cashd Company
  function convertKeypayCompanyToCashdCompany(keypayCompany) {
    systemCompany = {
      company_name: keypayCompany.name,
      address: keypayCompany.addressLine1,
      suburb: keypayCompany.suburb,
      city: '',
      state: keypayCompany.state,
      region: keypayCompany.region,
      postcode: keypayCompany.postalCode,
      abn: keypayCompany.abn,
      system_company_id: keypayCompany.id,
      //add refresh token
      system_refresh_token: refreshToken
    }
  }
  //convert Keypay User to Cashd User
  function convertKeypayUserToCashdUser(keypayUser) {
    systemUser = {
      first_name: keypayUser.displayName,
      last_name: '',
      fullname: keypayUser.displayName,
      mobile: '',
      email: keypayUser.email,
      system_user_id: keypayUser.id,
      system_employee_id: keypayUser.id
    }
  }
  //convert Keypay Employee to Cashd Emplyee 
  function convertKeypayEmployeeToCashdEmployee(keypayEmployee) {
    let convertSystemEmp = {
      first_name: keypayEmployee.firstName,
      last_name: keypayEmployee.surname,
      fullname: keypayEmployee.firstName + ' ' + keypayEmployee.surname,
      mobile: '',
      email: keypayEmployee.emailAddress ?? '',
      system_user_id: keypayEmployee.id,
      system_employee_id: keypayEmployee.id
    }
    if (keypayEmployee.startDate && keypayEmployee.startDate.length > 0) {
      let formatStartDate = new Date(keypayEmployee.startDate);
      let startDateString = formatStartDate.getUTCFullYear() +"/"+ (formatStartDate.getUTCMonth()+1) +"/"+ formatStartDate.getUTCDate();
      convertSystemEmp.startDate = startDateString;
    }
    return convertSystemEmp;
  }

  //<!--------------- End KEYPAY --------------->

  //<--------------- Start DEPUTY --------------->

  //get AccessToken DEPUTY
  function getAccessTokenDeputy(code) {
    if(request && request.readyState != 4){
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
      success: function(data) {
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        endpoint = data.endpoint;
        getUserDeputy(data.access_token, data.endpoint);
        return true;
      }
    });
  }
  //get User Deputy
  function getUserDeputy(access_token, endpoint) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/deputy-get-profile`,
      data: {
        link: endpoint,
        access_token: access_token,
        "_csrf": token
      },
      async: true,
      success: function(data) {
        // Check Admin
        var isEmployer = false;
        data.Permissions.forEach(item => {
          if (item == 'ADMINISTRATOR') {
            isEmployer = true;
          }
        });
        if (isEmployer) {
          userRoot.email = data.PrimaryEmail;
          userRoot.first_name = data.FirstName;
          userRoot.last_name = data.LastName;
          systemCompanyId = data.Company;
          const userConvert = {
            fullname: data.FirstName + ' ' + data.LastName,
            email: data.PrimaryEmail
          }
          convertDeputyUserToCashdUser(data);
          getCompanyDeputy();
          getEmployeeDeputy();
          hidenLoader();
          const checkValue = setInterval(() => {
            if (userRoot.company_name) {
              successNextStep($('#step4'), $('#step4').next());
              showInfoSignup(formUser, userRoot);
              clearInterval(checkValue);
            }
          }, 500);
          return true;
        } else {
          hidenLoader();
          showToast('error', `CashD needs permission to access your company employee list. On the on the next screen you will be asked to login to your Deputy Creator account. This step is powered by Deputy, your credential are secured.`);
          return false;
        }
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again")
        return false;
      }
    })
  }
  //get Company Deputy 
  function getCompanyDeputy() {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/deputy-get-company`,
      data: {
        link: endpoint,
        access_token: accessToken,
        systemCompanyId: systemCompanyId,
        "_csrf": token
      },
      async: true,
      success: function(data) {
        companyName = data.CompanyName;
        userRoot.company_name = data.CompanyName;
        userRoot.abn = data.CompanyNumber;
        userRoot.address = data._DPMetaData?.AddressObject?.Street1 ?? null;
        convertDeputyCompanyToCashdCompany(data);
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again")
        return false;
      }
    });
  }
  //get employee Deputy
  function getEmployeeDeputy() {
    let dataEmployee = [];
    current_step = $('#step4');
    next_step = current_step.next();
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/deputy-get-employees`,
      data: {
        link: endpoint,
        access_token: accessToken,
        "_csrf": token
      },
      async: true,
      success: function(data) {
        let valueEmp;
        data.forEach(emp => {
          valueEmp = convertDeputyEmployeeToCashdEmployee(emp);
          dataEmployee.push(valueEmp);
        });
        let itemsProcessed = 0, empConvert;
        if (dataEmployee.length > 0) {
          dataEmployee.forEach((item, index, array) => {
            empConvert = {
              fullname: `${item.first_name} ${item.last_name}`,
              email: item.email
            }
            $('.employee-list').append(
              layoutEmployeeList(empConvert, item)
            );
            itemsProcessed++;
            if (itemsProcessed === array.length) {
              hidenLoader();
              $('.modal-chooseUser .form-login-checkbox').remove();
              $('#jsChooseUser').modal('hide');
              successNextStep(current_step, next_step);
            }
          });
        } else {
          hidenLoader();
          $('#jsChooseUser').modal('hide');
          successNextStep(current_step, next_step);
        }
        showPopupNotify();
        checkInvite();
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again")
        return false;
      }
    });
  }
  //convert Deputy Company to Cashd Company
  function convertDeputyCompanyToCashdCompany(deputyCompany) {
    systemCompany = {
      company_name: deputyCompany.CompanyName,
      address: deputyCompany._DPMetaData?.AddressObject?.Street1 ?? '',
      suburb: '',
      city: deputyCompany._DPMetaData?.AddressObject?.City ?? '',
      state: deputyCompany._DPMetaData?.AddressObject?.State ?? '',
      postcode: deputyCompany._DPMetaData?.AddressObject?.Postcode ?? '',
      abn: deputyCompany.CompanyNumber,
      system_company_id: endpoint,
      //add refresh token
      system_refresh_token: refreshToken
    }
  }
  //convert Deputy User to Cashd User
  function convertDeputyUserToCashdUser(deputyUser) {
    systemUser = {
      first_name: deputyUser.FirstName,
      last_name: deputyUser.LastName,
      fullname: deputyUser.FirstName + ' ' + deputyUser.LastName,
      mobile: deputyUser.PrimaryPhone,
      email: deputyUser.PrimaryEmail,
      system_user_id: deputyUser.UserId,
      system_employee_id: deputyUser.UserId
    }
  }
  //convert Deputy Employee to Cashd Employee
  function convertDeputyEmployeeToCashdEmployee(deputyEmployee) {
    let convertSystemEmp = {
      first_name: deputyEmployee.FirstName,
      last_name: deputyEmployee.LastName,
      fullname: deputyEmployee.FirstName + ' ' + deputyEmployee.LastName,
      mobile: deputyEmployee.Mobile ?? '',
      email: deputyEmployee.Email ?? '',
      system_user_id: deputyEmployee.UserId,
      system_employee_id: deputyEmployee.Id,
      avatar_path: deputyEmployee.Img
    }
    if (deputyEmployee.startDate?.length > 0) {
      let formatStartDate = new Date(deputyEmployee.startDate);
      let startDateString = formatStartDate.getUTCFullYear() +"/"+ (formatStartDate.getUTCMonth()+1) +"/"+ formatStartDate.getUTCDate();
      convertSystemEmp.startDate = startDateString;
    }
    return convertSystemEmp;
  }

  //<!--------------- End DEPUTY --------------->

  // -------------- Start Reckon ------------------- //
  function getAccessTokenReckon(code) {
    if (code && reckonReLogin) {
      if(request && request.readyState != 4){
        request.abort();
      }
      reckonReLogin = false;
      request = $.ajax({
        dataType: "json",
        method: "POST",
        url: `/reckon`,
        data: {
          code: code,
          "_csrf": token
        },
        async: true,
        success: function(data) {
          if (data.success) {
            accessToken = data.access_token;
            refreshToken = data.refresh_token;
            getCashbooksReckon(data.result, data.access_token);
          } else {
            hidenLoader();
            showToast('error', data.message);
          }
          return true;
        },
        error: function (request, status, error) {
          hidenLoader();
          showToast('error', "Can't connect to server. Try again");
          return false;
        }
      });
    } else if (code) {
      getAccessTokenReckon(code);
    } else {
      showToast('error', "Can't connect to server. Try again");
    }
  }

  function getCashbooksReckon(data, access_token) {
    if (data && access_token) {
      reckonUser = data;
      if(request && request.readyState != 4){
        request.abort();
      }
      request = $.ajax({
        dataType: "json",
        method: "POST",
        url: `/reckon/cashbooks`,
        data: {
          access_token,
          "_csrf": token
        },
        async: true,
        success: function(response) {
          hidenLoader();
          if (response?.length > 0) {
            runGetInfoCompanies(response);
          } else {
            showToast('error', "Can't connect to server. Try again")
          }
          //successNextStep($('#step4'), $('#step4').next());
          //showInfoSignup(formUser, userRoot);
          return true;
        },
        error: function() {
          hidenLoader();
          showToast('error', "Can't connect to server. Try again")
          return false;
        }
      });
    }
  }

  function checkRoleStaff(csrf, access_token, reckon) {
    if (csrf && access_token && reckon) {
      $.ajax({
        dataType: "json",
        method: "POST",
        url: `/reckon/company-info`,
        data: {
          bookId: reckon.BookId,
          access_token,
          "_csrf": csrf,
        },
        success: function(data) {
          if (data && !companies[data.CashbookId]) {
            let company = data;
            company.isOwnerCompany = company.CompanyName && company.ReplyToEmailAddress
            if (company.CompanyName === null) {
              company.CompanyName = reckon.BookName;
            }
            companies[data.CashbookId] = company;
            let companyConvert = {
              fullname: company.CompanyName,
              abn: company.TaxNumber ? company.TaxNumber : "N/A"
            }
            $('.modal-chooseCompany').append(
              layoutChooseCompany(companyConvert, company)
            );
          }
        }
      });
    } else {
      hidenLoader();
      showToast('error', "Can't connect to server. Try again");
      return false;
    }
  }

  function convertReckonToCashdCompany(company) {
    var companyInfo = {};
    if (company.LegalAddress) {
      companyInfo.address = company.LegalAddress?.Line1;
      companyInfo.suburb = company.LegalAddress?.Suburb;
      companyInfo.city = company.LegalAddress?.Town;
      companyInfo.state = company.LegalAddress?.State;
      companyInfo.postcode = company.LegalAddress?.Postcode;
    }
    companyInfo.company_name = company.CompanyName;
    companyInfo.abn = company.TaxNumber;
    companyInfo.system_company_id = company.CashbookId;
    companyInfo.phone_company = company.PhoneNumber ? (company.PhoneCode ? company.PhoneCode + company.PhoneNumber : "" + company.PhoneNumber) : null;
    companyInfo.mobile_company = company.MobileNumber ? (company.MobileCode ? company.MobileCode + company.MobileNumber : "" + company.MobileNumber) : null;
    //add refresh token
    companyInfo.system_refresh_token = refreshToken;
    systemCompany = {...companyInfo};
  }

  function convertReckonToCashdUser (user) {
    systemUser = {
      first_name: user.given_name,
      last_name: user.family_name,
      fullname: user.given_name + ' ' + user.family_name,
      mobile: '',
      email: user.email,
      system_user_id: user.kid,
      system_employee_id: user.kid
    }
  }

  function runGetInfoCompanies(companies) {
    for (let i = 0; i < companies.length; i++) {
      const element = companies[i];
      checkRoleStaff(token, accessToken, element);
    }
    const loading = setInterval(() => {
      if (!request || request?.readyState === 4) {
        clearInterval(loading);
        hidenLoader();
      }
    }, 700);
    $('#jsChooseCompany').modal({
      backdrop: false,
      keyboard: false,
      show: true
    });
  } 

  $(document).on('click', 'input[name="cb-company"]', function (e) {
    $('input[name="cb-company"]').each(function () {
      this.checked = false;
    });
    var target = $(e.target);
    target.prop('checked', true);
    reckonSelected = JSON.parse($(this).val());
    if (this.checked) {
      $('#jsSelectCompany').prop('disabled', false);
    }
  });

  function runShowInfoSignup() {
    showLoader();
    if (companies[reckonSelected.CashbookId].isOwnerCompany) {
        userRoot.company_name = reckonSelected.CompanyName;
        userRoot.abn = reckonSelected.TaxNumber;
        userRoot.address = reckonSelected.LegalAddress?.Line1 ? reckonSelected.LegalAddress?.Line1 : null;
        userRoot.first_name = reckonUser.given_name;
        userRoot.last_name = reckonUser.family_name;
        userRoot.email = reckonUser.email;
        convertReckonToCashdCompany(companies[reckonSelected.CashbookId]);
        convertReckonToCashdUser(reckonUser);
        showInfoSignup(formUser, userRoot);
        current_step = $('#step4');
        next_step = $('#step4').next();
        $('#jsChooseCompany').modal('hide');
        successNextStep(current_step, next_step);
        hidenLoader();
    } else {
      showErr('Reckon');
      reckonReLogin = true;
      hidenLoader();
      return false;
    }
  }
  
  // -------------- End Reckon --------------------- //

  //form register
  function submitFormRegister(current_step, next_step) {
    const { email, firstName, lastName, countryCode, mobile } = formUser;
    var registerCode = sessionStorage.getItem('registration_code');
    const formRegister = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile: '+' + countryCode + mobile,
      mobile_country_code: countryCode,
      system_cashd_code: codeSystem,
      system_company: systemCompany,
      system_user: systemUser,
      system_employees_list: systemEmployeeList
    }

    request = $.ajax({
      dataType: "json",
      method: "POST",
      url: `/signup`,
      data: {
        dataSignup: JSON.stringify(formRegister),
        registerCode: registerCode,
        "_csrf": token
      },
      async: true,
      success: function(data) { 
        if (data.success) {
          const company = data.result?.user?.company_infor || {};
          $('.info-company-register').html(
            `<div class="signup-complete">
              <h2 class="signup-complete__title">Registration Successful 🎉</h2>
              <div class="signup-complete__icon-wrapper">
                <div class="signup-complete__icon">
                  <span class="signup-complete__check">&#10003;</span>
                </div>
              </div>
              <p class="signup-complete__headline">
                Your company account has been created successfully.
              </p>
              ${
                company.company_name
                  ? `<p class="signup-complete__company">
                      <strong>${company.company_name}</strong>
                      ${company.abn ? `<span class="signup-complete__company-abn"> · ABN: ${company.abn}</span>` : ''}
                    </p>`
                  : ''
              }
              <p class="signup-complete__description">
                Your login credentials have been sent to your email address.
                Please check your inbox and change your password after logging in.
              </p>
              <button type="button" class="btn btn-primary btn-step btn-redirect-login signup-complete__button">
                Go to login
              </button>
            </div>`
          );
          successNextStep(current_step, next_step);
        } else {
          if (data.errorCode === "REGISTER_ACCOUNTS_LINKED"){
            showToast('error', "Your CashD account has already been linked to this Payroll system. Re-enter with new information.");
            $('.info-company-register').append(
              `<div>
                <img src="/web-images/ic_company_denied.png" alt="img_mail" width="200">
              </div>
              <h6 style="line-height: 24px;">Your CashD account had linked to this ${codeSystem} system already
                <br>Please try to login again!
              </h6>
              <div class="mb-3">
                <button type="button" class="btn btn-primary btn-redirect-login" style="width: 50%">Go to Login</button>
              </div>`
            );
            successNextStep(current_step, next_step);
          } else if ( data.errorCode === "REGISTER_PHONE_EXISTS") {
            showToast('error', "This phone number already exists. Re-enter a different number.");
          } else if ( data.errorCode === "REGISTER_NAME_OR_ABN_COMPANY_EXISTS") { 
            showToast('error', "This Company name or ABN already exists. Re-enter with new information.");
          } else if ( data.errorCode == "REGISTER_DEPUTY_ACCOUNT_LINKED_ONE") {
            showToast('error', "Deputy account should be linked a CashD user. Try again!");
          } else {
            showToast('error', "Can not connect to server. Please try again.");
          }
        }
        //Redirect login
        $('.btn-redirect-login').click(function () {
          $(window).off('beforeunload');
          location.href = '/';
        });
        hidenLoader();
        return true;
      },
      error: function() {
        hidenLoader();
        showToast('error', "Can't connect to server. Try again");
        return false;
      }
    })
  }
  //layout chooseUser 
  function layoutChooseUser (userConvert, user) {
    let userItem = JSON.stringify(user);
    let layout = 
      `<div class="form-login-checkbox form-login-checkbox--border">
        <label class="form-login-checkbox-kepp form-login-checkbox-kepp--flex">
          <div class="form-login-checkbox-kepp-txt">
            <p>Full Name: <b>${userConvert.fullname}</b> 
            <p>Email: <b>${userConvert.email}</b></p>
          </div>
          <div class="form-login-checkbox-cus">
            <input class="form-login-checkbox_box checkbox-user" name="userItem" type="checkbox" value='${userItem}'/>
            <span class="form-login-checkbox_checkmark"></span>
          </div>
        </label>
      </div>`;

    return layout;
  }
  //layout chooseCompany
  function layoutChooseCompany (companyConvert, companyInforItem) {
    let companyInfo = JSON.stringify(companyInforItem);
    let layout = 
      `<div class="form-login-checkbox form-login-checkbox--border">
        <label class="form-login-checkbox-kepp form-login-checkbox-kepp--flex">
          <div class="form-login-checkbox-kepp-txt">
            <p>Company name: <b>${companyConvert.fullname}</b> 
            <p>Abn: <b>${companyConvert.abn || 'N/A'}</b></p>
          </div>
          <div class="form-login-checkbox-cus">
            <input class="form-login-checkbox_box checkbox-company" name="cb-company" type="checkbox" value='${companyInfo}'/>
            <span class="form-login-checkbox_checkmark"></span>
          </div>
        </label>
      </div>`;
    return layout;
  }
  //layout Employee List
  function layoutEmployeeList(empConvert, employee) {
    let empValue = JSON.stringify(employee);
    let layout = 
      `<div class="row">
        <div class="col-md-2"></div>
        <div class="form-login-checkbox col-md-8 form-login-checkbox--border form-signup-checkbox-custom">
          <label class="form-login-checkbox-kepp form-login-checkbox-kepp--flex">
            <div class="form-login-checkbox-kepp-txt">
              <p>Full Name: <b>${empConvert.fullname}</b> 
              <p>Email: <b>${empConvert.email || 'N/A'}</b></p>
            </div>
            <div class="form-login-checkbox-cus">
              <input class="form-login-checkbox_box checkbox-emp" type="checkbox" value='${empValue}'/>
              <span class="form-login-checkbox_checkmark"></span>
            </div>
          </label>
        </div>
      </div>`;

    return layout;
  }

  function checkInvite() {
    let checkboxEmp = $('.employee-list .checkbox-emp');
    checkboxEmp.click(function(e) {
      let count = $(".employee-list .checkbox-emp:checked").length;
      $('.countEmp').html('(' + count + ')');
      if (count > 0) {
        $('#jsInvite').prop('disabled', false);
      } else {
        $('#jsInvite').prop('disabled', true);
      }
    });
  }

  function showPopupNotify() {
    // $('#jsShowNotify').modal('show');
    $('.notify-company-name').html(companyName);
    $('.notify-system-name').html(codeSystem);
    // $('.btn-gotIt').on('click', () => {
    //   $('#jsShowNotify').modal('hide');
    // }); 
  }
  
  //show error
  function showErr(name) {
    showToast('error', `Your ${name} account is not linked to a CashD account. Please contact your Company Administrator to setup your CashD account.`);
    hidenLoader();
  }

  //-------------------- Employer None ---------------------//

  /** Lock field and show lock icon when value is from payroll system API (readonly, not editable) */
  function lockFieldFromApi(inputSelector) {
    const $input = $(inputSelector);
    if (!$input.length) return;
    $input.prop('readonly', true);
    $input.closest('.input-with-lock-wrap').find('.input-lock-icon').removeClass('d-none');
  }

  /** Unlock field and hide lock icon (selector string hoặc jQuery object) */
  function unlockField(inputSelector) {
    const $input = typeof inputSelector === 'string' ? $(inputSelector) : inputSelector;
    if (!$input || !$input.length) return;
    $input.prop('readonly', false);
    $input.closest('.input-with-lock-wrap').find('.input-lock-icon').addClass('d-none');
  }

  /** Đọc form tab company (.input-company) thành object */
  function readInputCompanyFormBody() {
    var body = {};
    $('.input-company input').each(function() {
      body[$(this).attr('name')] = $(this).val();
    });
    body.companyCountryCode = $('#companyCountryCode').val();
    return body;
  }

  /** Merge systemCompany từ form tab 2 (phone, address, abn, tên hiển thị) */
  function syncSystemCompanyFromInputCompanyForm() {
    if (!systemCompany) return;
    var body = readInputCompanyFormBody();
    var phone =
      body.companyPhone && String(body.companyPhone).trim() !== ''
        ? '+' + body.companyCountryCode + body.companyPhone
        : null;
    $.extend(systemCompany, {
      company_name: (body.companyName || '').trim() || systemCompany.company_name,
      phone_company: phone,
      address: (body.companyAddress || '').trim() || null,
      abn: body.abn != null && body.abn !== '' ? String(body.abn) : null,
    });
  }

  /** Điền tab 2 (MISA / manual company) từ bản ghi đơn vị AMIS */
  function fillInputCompanyFormFromMisaOrganization(org) {
    if (!org) return;
    unlockField("input[name='companyName']");
    $("input[name='companyName']").val(org.OrganizationUnitName || '');
    lockFieldFromApi("input[name='companyName']");
    unlockField("input[name='ABN']");
    $("input[name='ABN']").val('');
    $("input[name='companyPhone']").val('');
    $("input[name='companyAddress']").val('');
    $('#companyNameValidate').attr('hidden', true);
    $('.input-company input').css('border-color', '#ccc');
  }

  /** Đổ systemUser (nếu có) vào bước Personal Details sau khi sang step tương ứng (không dùng cho MISA). */
  function applyPrefillPersonalDetailsFromSystemUser() {
    if (!systemUser) return;
    if ((systemUser.first_name || systemUser.firstName) && $('#firstName').length) {
      $('#firstName').val(systemUser.first_name || systemUser.firstName);
    }
    if ((systemUser.last_name || systemUser.lastName) && $('#lastName').length) {
      $('#lastName').val(systemUser.last_name || systemUser.lastName);
    }
    if (systemUser.email && $('#email').length) {
      $('#email').val(systemUser.email);
      lockFieldFromApi("#email");
    }
    if (systemUser.mobile != null && systemUser.mobile !== '' && $('#mobile').length) {
      let mobileStr = systemUser.mobile.toString().trim();
      const selectedCode = $('#selectedCountryCode').val();
      if (selectedCode && mobileStr.startsWith('+' + selectedCode)) {
        mobileStr = mobileStr.slice(1 + selectedCode.length).replace(/^[^\d]*/, '');
      }
      $('#mobile').val(mobileStr);
    }
    if (systemUser.countryCode != null && $('#selectedCountryCode').length) {
      $('#selectedCountryCode').val(systemUser.countryCode);
    }
  }

  /** Xoá hết dữ liệu local từ hệ thống thanh toán và clear các field form (dùng khi chọn hệ thống không phải thanh toán) */
  function clearLocalPaymentDataAndFormFields() {
    systemCompany = {};
    systemUser = null;
    systemEmployeeList = [];
    formUser = null;
    accessToken = undefined;
    refreshToken = undefined;
    // Clear step 2 - company fields
    $(".input-company input").each(function() {
      $(this).val('');
      unlockField($(this));
    });
    $(".input-company select").each(function() {
      $(this).val($(this).find('option').first().val());
    });
    // Clear step 3 - personal fields
    $('#firstName').val('');
    $('#lastName').val('');
    $('#email').val('');
    $('#mobile').val('');
    if ($('#selectedCountryCode').length) {
      $('#selectedCountryCode').val($('#selectedCountryCode').find('option').first().val());
    }
    unlockField('#firstName');
    unlockField('#lastName');
    unlockField('#email');
    unlockField('#mobile');
    unlockField("input[name='companyName']");
    unlockField("input[name='ABN']");

    // Clear step 2 - MISA API fields
    $(".misa-api input").each(function() {
      $(this).val('');
    });
    $('#employeeCentralConnectionIdValidate, #employeeCentralPasscodeValidate, #timekeepingConnectionIdValidate, #timekeepingPasscodeValidate, #salaryConnectionIdValidate, #salaryPasscodeValidate')
      .attr('hidden', true);

    misaOtpSent = false;
    $('#misaOtpCode').val('');
    clearMisaOtpResendCooldown();
    $('#misaOtpResend').prop('disabled', false);
    $('#misaOtpResendCountdown').text('').hide();
    setPersonalStepMisaMode(false);
  }

  function showRegisterNone() {
    $('.misa-tabs').attr('hidden', true);
    $('.misa-api').attr('hidden', true);
    $('.input-company').attr('hidden', false);
    $('.as-company').attr('hidden', true);
    $('.as-company-hr3').attr('hidden', true);
  }

  $(document).on('click', '#submitCompanyInfo', function (e) {
    // Bước 2: chỉ lưu local, không cần gọi API hay show loading
    if (request && request.readyState != 4) {
      request.abort();
    }
    const body = {};
    const inputs = $(".input-company input");
    let isValidate = true;
    inputs.each(function(e) {
      const name = $(this).attr("name");
      const value = $(this).val();
      body[name] = value;
    });
    if ((body.companyName).trim() === "") {
      $("input[name='companyName']").css("border-color", "rgb(225 0 0)");
      $("#companyNameValidate").attr('hidden', false);
      isValidate = false;
    } else {
      $("input[name='companyName']").css("border-color", "#ccc");
      $("#companyNameValidate").attr('hidden', true);
    }
    
    body.companyCountryCode = $('#companyCountryCode').val();

    if (isValidate) {
      var phoneVal =
        body.companyPhone && String(body.companyPhone).trim() !== ''
          ? '+' + body.companyCountryCode + body.companyPhone
          : null;
      if (codeSystem === 'MISA' && systemCompany && systemCompany.misa_organization_unit_id != null) {
        systemCompany = $.extend({}, systemCompany, {
          company_name: body.companyName,
          phone_company: phoneVal,
          address: (body.companyAddress || '').trim() || null,
          abn: body.abn != null && body.abn !== '' ? String(body.abn) : null,
        });
      } else {
        systemCompany = {
          system_company_id: body.companyName,
          company_name: body.companyName,
          phone_company: phoneVal,
          address: body.companyAddress || null,
          abn: body.abn != null && body.abn !== '' ? String(body.abn) : null,
        };
      }

      // chuyển sang bước 3: personal details, không gọi submitFormRegister
      current_step = $('#step5');
      next_step = $('#stepPersonal');
      successNextStep(current_step, next_step);

      misaOtpSent = false;
      $('#misaOtpCode').val('');
      if (codeSystem === 'MISA') {
        setPersonalStepMisaMode(true);
      } else {
        setPersonalStepMisaMode(false);
      }

      if (codeSystem !== 'MISA') {
        applyPrefillPersonalDetailsFromSystemUser();
      }
    }

  });

  $("input[name='companyName']").on('paste keydown click', function(e) {
    const name = $(this).attr("name");
    if (($(this).val()).trim() !== "") {
      $(this).css("border-color", "#ccc");
      $(`#${name}Validate`).attr('hidden', true);
    }
  });

  //---------------------- End Employer None -----------------//

  //----------------------------- Employer Astute ---------------------------//

  function showRegisterAstute() {
    $('.modal-chooseCompany .form-login-checkbox').remove();
    $('.misa-tabs').attr('hidden', true);
    $('.misa-api').attr('hidden', true);
    $('.as-company-hr3').attr('hidden', true);
    $('.as-company').attr('hidden', false);
  }

  //----------------------------- Employer MISA ---------------------------//

  function showRegisterMisa() {
    $('.modal-chooseCompany .form-login-checkbox').remove();
    $('.misa-tabs').attr('hidden', false);
    $('.as-company').attr('hidden', true);
    $('.as-company-hr3').attr('hidden', true);
    // Mặc định: màn API (dot 1 trái); chỉ dot trong #step5 .misa-tabs, không đụng tab Personal
    const $step5Dots = $('#step5 .misa-tabs .misa-tab-dot');
    $step5Dots.removeClass('active');
    $step5Dots.filter('[data-target="misa-api"]').addClass('active');
    $('.misa-api').attr('hidden', false);
    $('.input-company').attr('hidden', true);
  }

  // Đổi tab giữa API và Company (chỉ dot trong step 5)
  $('#step5 .misa-tabs').on('click', '.misa-tab-dot', function() {
    var target = $(this).data('target');
    const $step5Dots = $('#step5 .misa-tabs .misa-tab-dot');
    $step5Dots.removeClass('active');
    $(this).addClass('active');
    if (target === 'misa-api') {
      $('.misa-api').attr('hidden', false);
      $('.input-company').attr('hidden', true);
    } else {
      $('.misa-api').attr('hidden', true);
      $('.input-company').attr('hidden', false);
    }
  });

  //---------------------- End Employer MISA -----------------//

  // Nút Back/Next riêng cho tab 1 MISA (API)
  $('#misaApiBackBtn').on('click', function() {
    // quay về step 1 giống jsBackStep cho step5
    current_step = $('#step5');
    previous_step = $('#step4');

    const currentIndex  = $("fieldset").index(current_step);
    const previousIndex = $("fieldset").index(previous_step);
    $(".progressbar li").eq(currentIndex).removeClass("active");
    $(".progressbar li").eq(previousIndex).addClass("active");
    if (previousIndex === 0) {
      $(".progressbar li").removeClass("active complete");
      $(".progressbar li").eq(0).addClass("active");
    }
    updateStepHeader(previous_step);
    current_step.hide();
    previous_step.css({ left: 0, opacity: 1, transform: 'scale(1)' }).show();
    animating = false;
  });

  $('#misaApiNextBtn').on('click', function() {
    const invalidColor = "rgb(225 0 0)";
    const normalColor = "#ccc";

    function setInvalid(inputSelector, spanSelector) {
      const $input = $(inputSelector);
      const $span = $(spanSelector);
      if ($input && $input.length) $input.css('border-color', invalidColor);
      if ($span && $span.length) $span.attr('hidden', false);
    }

    function setValid(inputSelector, spanSelector) {
      const $input = $(inputSelector);
      const $span = $(spanSelector);
      if ($input && $input.length) $input.css('border-color', normalColor);
      if ($span && $span.length) $span.attr('hidden', true);
    }

    const empConn = ($('#employeeCentralConnectionId').val() || '').trim();
    const empPass = ($('#employeeCentralPasscode').val() || '').trim();

    const tkConn = ($('#timekeepingConnectionId').val() || '').trim();
    const tkPass = ($('#timekeepingPasscode').val() || '').trim();

    const salConn = ($('#salaryConnectionId').val() || '').trim();
    const salPass = ($('#salaryPasscode').val() || '').trim();

    let isValidate = true;

    // Employee Central: mandatory (both Connection ID + Passcode)
    if (!empConn) { setInvalid('#employeeCentralConnectionId', '#employeeCentralConnectionIdValidate'); isValidate = false; }
    else { setValid('#employeeCentralConnectionId', '#employeeCentralConnectionIdValidate'); }

    if (!empPass) { setInvalid('#employeeCentralPasscode', '#employeeCentralPasscodeValidate'); isValidate = false; }
    else { setValid('#employeeCentralPasscode', '#employeeCentralPasscodeValidate'); }

    // Timekeeping: optional, but if user fills one of them -> require both
    const tkAny = tkConn !== '' || tkPass !== '';
    if (tkAny) {
      if (!tkConn) { setInvalid('#timekeepingConnectionId', '#timekeepingConnectionIdValidate'); isValidate = false; }
      else { setValid('#timekeepingConnectionId', '#timekeepingConnectionIdValidate'); }

      if (!tkPass) { setInvalid('#timekeepingPasscode', '#timekeepingPasscodeValidate'); isValidate = false; }
      else { setValid('#timekeepingPasscode', '#timekeepingPasscodeValidate'); }
    } else {
      setValid('#timekeepingConnectionId', '#timekeepingConnectionIdValidate');
      setValid('#timekeepingPasscode', '#timekeepingPasscodeValidate');
    }

    // Salary: optional, but if user fills one of them -> require both
    const salAny = salConn !== '' || salPass !== '';
    if (salAny) {
      if (!salConn) { setInvalid('#salaryConnectionId', '#salaryConnectionIdValidate'); isValidate = false; }
      else { setValid('#salaryConnectionId', '#salaryConnectionIdValidate'); }

      if (!salPass) { setInvalid('#salaryPasscode', '#salaryPasscodeValidate'); isValidate = false; }
      else { setValid('#salaryPasscode', '#salaryPasscodeValidate'); }
    } else {
      setValid('#salaryConnectionId', '#salaryConnectionIdValidate');
      setValid('#salaryPasscode', '#salaryPasscodeValidate');
    }

    if (!isValidate) {
      showToast('error', 'Please check MISA connection/passcode fields.');
      return;
    }

    showLoader();
    $.ajax({
      dataType: 'json',
      method: 'POST',
      url: '/misa/get-organization-unit',
      data: {
        employeeCentralConnectionId: empConn,
        employeeCentralPasscode: empPass,
        timekeepingConnectionId: tkConn || '',
        timekeepingPasscode: tkPass || '',
        salaryConnectionId: salConn || '',
        salaryPasscode: salPass || '',
        '_csrf': token,
      },
      success: function (response) {
        hidenLoader();
        if (response.code !== 200 || !response.success || !response.result) {
          showToast('error', response.message || 'Cannot load company from MISA.');
          return;
        }
        var r = response.result;
        var org = r.organization;
        systemCompany = $.extend({}, r.systemCompany, {
          employee_central_connection_id: empConn,
          employee_central_passcode: empPass,
          timekeeping_connection_id: tkConn || '',
          timekeeping_passcode: tkPass || '',
          payroll_connection_id: salConn || '',
          payroll_passcode: salPass || '',
        });

        systemUser = null;

        if (systemCompany.company_name) {
          userRoot.company_name = systemCompany.company_name;
        }

        // Tab 2 bước 2: hiển thị & đồng bộ form công ty từ MISA
        const $step5Dots = $('#step5 .misa-tabs .misa-tab-dot');
        $step5Dots.removeClass('active');
        $step5Dots.filter('[data-target="misa-company"]').addClass('active');
        $('.misa-api').attr('hidden', true);
        $('.input-company').attr('hidden', false);
        fillInputCompanyFormFromMisaOrganization(org);
        syncSystemCompanyFromInputCompanyForm();
        // Dừng ở tab 2: user bắt buộc bấm NEXT (#submitCompanyInfo) để sang bước 3
      },
      error: function (xhr) {
        hidenLoader();
        var msg = "Can't connect to MISA. Please try again.";
        if (xhr.responseJSON && xhr.responseJSON.message) {
          msg = xhr.responseJSON.message;
        }
        showToast('error', msg);
      }
    });
  });

  $(document).on('click', '#submitAstuteInfo', function (e) {
    showLoader();
    if (request && request.readyState != 4) {
      request.abort();
    }
    const body = {};
    const inputs = $(".as-company input");
    let isValidate = true;
    inputs.each(function(e) {
      const name = $(this).attr("name");
      const value = $(this).val();
      const regex = new RegExp(/^\S.*\S$/g);
      if (value.trim() === "" || !regex.test(value)) {
        $(`input[name='${name}']`).css("border-color", "rgb(225 0 0)");
        $(`#${name}Validate`).attr('hidden', false);
        isValidate = false;
        if (!regex.test(value)) {
          showToast('error', "Please enter correct information.");
        }
      } else {
        body[name] = value;
      }
    });

    if (isValidate) {
      companyEntityQuery(body);
    } else {
      hidenLoader();
    }

  });

  function companyEntityQuery(params) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/astute/company-entity-query`,
      data: {
        ...params,
        "_csrf": token
      },
      success: function(response) {
        hidenLoader();
        if (response.code === 200) {
          if (response.result.length !== 0) {
            astuteApiKey = params.apiKey;
            astuteApiUserName = params.apiUserName;
            astuteApiPassword = params.apiPassword;
            companiesAstute = {};
            response.result.forEach((item) => {
              companiesAstute[item.CM_CID] = item;
              $('.modal-chooseCompany').append(
                layoutChooseCompany({fullname: item.name, abn: item.abn}, item.CM_CID)
              );
            });
            $('#jsChooseCompany').modal({
              backdrop: false,
              keyboard: false,
              show: true
            });
            let checkboxCompany = $('.checkbox-company');
            checkboxCompany.click(function (e) {
              checkboxCompany.each(function () {
                this.checked = false;
              });
            var target = $(e.target);
            target.prop('checked', true);
            let astuteCompanySelectedId = JSON.parse($(target.parent()).find("input[name='cb-company']").val());
            let astuteCompanySelected = companiesAstute[astuteCompanySelectedId];
            convertAstuteCompanyToCashdCompany(astuteCompanySelected);
            companyIdAstute = astuteCompanySelected.CM_CID;
            companyName = astuteCompanySelected.name;
            userRoot.company_name = astuteCompanySelected.name; 
            userRoot.abn = astuteCompanySelected.abn;
            userRoot.address = astuteCompanySelected.address_street;
            if (this.checked) { 
              $('#jsSelectCompany').prop('disabled', false) 
            }
            });
          } else {
            showToast('error', "Your credentials are incorrect. Please try again.");
            return false;
          }
        }
      }, 
      error: function() {
        showToast('error', "Your credentials are incorrect. Please try again.");
        hidenLoader();
        return false;
      }
    });
  }

  $("input[name='apiKey'], input[name='apiUserName'], input[name='apiPassword']").on('paste keydown click', function(e) {
    let iValidate = false;
    const name = $(this).attr("name");

    if (($(this).val()).trim() !== "") {
      iValidate = true;
    }

    if (iValidate) {
      $(this).css("border-color", "#ccc");
      $(`#${name}Validate`).attr('hidden', true);
    }
  });

  function runSignupAstute () {
    $('#jsChooseCompany').modal('hide');
    convertAstuteUserToCashdUser();
    submitFormRegister($('#step5'), $('#step5').next());
  }
  
  function convertAstuteCompanyToCashdCompany(company) {
    let companyInfo = {};
    companyInfo.company_name = company.name;
    companyInfo.address = company.address_street;
    companyInfo.suburb = "";
    companyInfo.city = company.address_locality;
    companyInfo.state = "";
    companyInfo.region = company.address_region;
    companyInfo.postcode = company.address_postcode;

    companyInfo.abn = company.abn;
    companyInfo.system_company_id = astuteApiKey;
    companyInfo.short_code = "";
    companyInfo.currency = company.payroll_currency_default;
    //add refresh token
    companyInfo.system_cm_cid = company.CM_CID;
    companyInfo.system_api_username = astuteApiUserName;
    companyInfo.system_api_password = astuteApiPassword;
    systemCompany = {...companyInfo};
  }

  function convertAstuteUserToCashdUser() {
    systemUser = {
      first_name: formUser.firstName,
      last_name: formUser.lastName,
      fullname: formUser.firstName + ' ' + formUser.lastName,
      mobile: formUser.mobile,
      email: formUser.email,
      system_user_id: "",
      system_employee_id: ""
    }
  }
  //----------------------------- End Employer Astute ----------------------//

  //----------------------------- Employer HR3 ----------------------------//
  function showRegisterHR3() {
    $('.modal-chooseCompany .form-login-checkbox').remove();
    $('.as-company').attr('hidden', true);
    $('.as-company-hr3').attr('hidden', false);
  }

  $(document).on('click', '#submitHR3Info', function(e) {
    showLoader();
    const inputs = $(".as-company-hr3 input");
    let isError = false;
    const params = {};
    inputs.each(function(e) {
      const name = $(this).attr("name");
      const spanDiv = $(`input[name='${name}']`).parent().find('span');
      if ($(`input[name='${name}']`).val().trim() == "") {
        spanDiv.attr('hidden', false);
        isError = true;
      } else {
        spanDiv.attr('hidden', true);
      }
      params[`${name}`] = $(`input[name='${name}']`).val();
    });
    if (!isError) {
      requestUserAuthorized(params);
    } else {
      hidenLoader();
    }
  })

  function requestUserAuthorized(params) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/hr3/request-user-authorized`,
      data: {
        ...params,
        "_csrf": token
      },
      success: function(response) {
        console.log(response);
        hidenLoader();
        if (response.code === 200) {
          if (response.result.length !== 0) {
            userNameHR3 = params.userNameHR3;
            passwordHR3 = params.passwordHR3;
            apiKeyRH3 = params.apiKeyRH3;
            $('.modal-chooseCompany').html("");
            response.result.forEach((item) => {
              $('.modal-chooseCompany').append(
                layoutChooseCompany({fullname: item.Companyname, abn: item.Abn}, item)
              );
            });
            $('#jsChooseCompany').modal({
              backdrop: false,
              keyboard: false,
              show: true
            });
            let checkboxCompany = $('.checkbox-company');
            checkboxCompany.click(function (e) {
              checkboxCompany.each(function () {
                this.checked = false;
              });
            var target = $(e.target);
            target.prop('checked', true);
            let hr3CompanySelected = JSON.parse($(target.parent()).find("input[name='cb-company']").val());
            convertHR3CompanyToCashdCompany(hr3CompanySelected);
            let address = hr3CompanySelected.Street1 ? hr3CompanySelected.Street1 + ", " : "" 
            + hr3CompanySelected.Suburb ? hr3CompanySelected.Suburb + ", " : "" 
            + hr3CompanySelected.State ? hr3CompanySelected.State + ", " : ""
            + hr3CompanySelected.Postcode ? hr3CompanySelected.Postcode : ""
            companyIdHR3 = hr3CompanySelected.Company_code;
            companyName = hr3CompanySelected.Companyname;
            userRoot.company_name = hr3CompanySelected.Companyname; 
            userRoot.abn = hr3CompanySelected.Abn;
            userRoot.address = address;
            if (this.checked) { 
              $('#jsSelectCompany').prop('disabled', false) 
            }
            });
          } else {
            showToast('error', "Your credentials are incorrect. Please try again.");
            return false;
          }
        }
      }, 
      error: function() {
        showToast('error', "Your credentials are incorrect. Please try again.");
        hidenLoader();
        return false;
      }
    });
  }

  function convertHR3CompanyToCashdCompany(company) {
    let companyInfo = {};
    companyInfo.company_name = company.Companyname;
    companyInfo.address = company.Street1;
    companyInfo.suburb = company.Suburb;
    companyInfo.city = "";
    companyInfo.state = company.State;
    companyInfo.postcode = company.Postcode;

    companyInfo.abn = company.Abn;
    companyInfo.system_company_id = apiKeyRH3;
    companyInfo.short_code = company.Company_code;
    //add refresh token
    companyInfo.system_cm_cid = company.Company_Id;
    companyInfo.system_api_username = userNameHR3;
    companyInfo.system_api_password = passwordHR3;
    systemCompany = {...companyInfo};
  }

  function convertHR3UserToCashdUser() {
    systemUser = {
      first_name: formUser.firstName,
      last_name: formUser.lastName,
      fullname: formUser.firstName + ' ' + formUser.lastName,
      mobile: formUser.mobile,
      email: formUser.email,
      system_user_id: "",
      system_employee_id: ""
    }
  }

  function runSignupHR3 () {
    $('#jsChooseCompany').modal('hide');
    convertHR3UserToCashdUser();
    submitFormRegister($('#step5'), $('#step5').next());
  }
  //----------------------------- End Employer HR3 ----------------------------//

});