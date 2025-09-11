$(document).ready(function () {
  const socket = io();
  const token = $('input[name="_csrf"]').val();
  const width = screen.width,
    height = screen.height,
    popupWidth = width - 400,
    popupHeight = height - 200;
  const windowFeatures = `resizable,scrollbars=0,status,top=150,left=200,width=${popupWidth},height=${popupHeight}`;
  const urlReckon = $('#urlRecKon').val();
  let request = null,
    reckonSelected = {},
    code = null,
    books = {},
    accessToken = null,
    refreshToken = null,
    userReckon = null,
    isCompleted = false;

  // Check user
  if (!userTrial._id) {
    showToast('error', "Can't connect to server. Try again");
    $('#showLoginReckon').addClass('disabled');
  }

  $(window).on('beforeunload', function () {
    if (!isCompleted) {
      return 'Are you sure you want to leave?';
    } else {
      return;
    }
  });

  $(document).on('click', '#showLoginReckon', function (event) {
    if (!$(this).hasClass('disabled')) {
      loading();
      let popup = showPopup();
      socket.on('join', data => {
        if (popup && data.code && data.key === "RECKON") {
          popup.close();
          popup = null;
          code = data.code;
          getAccessTokenReckon(data.code);
        }
      });
    }
  });

  //show toast
  function showToast(name, mess, nameErrId = '#jsErr') {
    $(nameErrId).addClass(`show ${name}`);
    $(`${nameErrId} p`).html(mess);
    setTimeout(() => {
      $(nameErrId).removeClass(`show ${name}`);
    }, 2500);
  }

  //show loading
  function loading() {
    $("#jsLoader").addClass("show");
  }

  //hide loading
  function hideLoading() {
    setTimeout(function () {
      $("#jsLoader").removeClass("show");
    }, 500);
  }

  function showPopup() {
    const popup = window.open(urlReckon, "Popup_Reckon", windowFeatures);
    const popupTick = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupTick);
        if (!code) {
          hideLoading();
        }
      }
    }, 500);
    return popup;
  }

  function getAccessTokenReckon(code) {
    if (request && request.readyState != 4) {
      request.abort();
    }
    request = $.ajax({
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
          accessToken = data.access_token;
          refreshToken = data.refresh_token;
          getCashbooksReckon(data.result, data.access_token);
        } else {
          hideLoading();
          showToast('error', data.message);
        }
        return true;
      },
      error: function (request, status, error) {
        hideLoading();
        showToast('error', "Can't connect to server. Try again");
        return false;
      }
    });
  }

  function getCashbooksReckon(data, access_token) {
    userReckon = data;
    if (data && access_token) {
      if (request && request.readyState != 4) {
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
        success: function (response) {
          if (response?.length > 0) {
            runGetInfoCompany(response);
          } else {
            showToast('error', "Can't connect to server. Try again")
          }
          return true;
        },
        error: function () {
          hideLoading();
          showToast('error', "Can't connect to server. Try again")
          return false;
        }
      });
    }
  }

  function runGetInfoCompany(array) {
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      checkRoleStaff(token, accessToken, element, refreshToken);
    }
    $('#divContentSuccess').addClass('hide');
    $('#divShowChooseCompany, .jsShowCompany').removeClass('hide');
    
    const loading = setInterval(() => {
      if (!request || request?.readyState === 4) {
        clearInterval(loading);
        hideLoading();
      }
    }, 500);

  }

  $(document).on('click', 'input[name="idCompany"]', function (e) {
    $('input[name="idCompany"]').each(function () {
      this.checked = false;
    });
    var target = $(e.target);
    target.prop('checked', true);
    reckonSelected.BookId = $(this).val();
    reckonSelected.BookName = $(this).attr("data-name");
    if (this.checked) {
      $('#jsSelect').prop('disabled', false);
    }
  });

  //layout chooseCompany
  function layoutChooseCompany(book) {
    let layout =
      `<div class="form-login-checkbox form-login-checkbox--border">
        <label class="form-login-checkbox-kepp form-login-checkbox-kepp--flex">
          <div class="form-login-checkbox-kepp-txt">
            <p>Company: <b>${book.CompanyName}</b></p>
            <p>ABN: <b>${book.TaxNumber ? book.TaxNumber : 'N/A'}</b></p>
          </div>
          <div class="form-login-checkbox-cus">
            <input class="form-login-checkbox_box" data-name="${book.CompanyName}" name="idCompany" type="checkbox" value='${book.CashbookId}' />
            <span class="form-login-checkbox_checkmark"></span>
          </div>
        </label>
      </div>`;
    return layout;
  }

  // Click select company
  $('#jsSelect').click(function () {
    loading();
    if (books[reckonSelected.BookId].isOwnerCompany) {
      let systemCompany = convertReckonToCashdCompany(books[reckonSelected.BookId], refreshToken);
      let systemUser = convertReckonToCashdUser(userReckon);
      callRegisterReckonTrialCompany(userTrial._id, systemCompany, systemUser);
    } else {
      showToast('error', "Your Reckon account is not linked to a CashD account. Please contact your Company Administrator to setup your CashD account.");
      hideLoading();
    }
  });

  function callRegisterReckonTrialCompany(id, systemCompany, systemUser) {
    if (request && request.readyState != 4) {
      request.abort();
    }
    request = $.ajax({
      dataType: "json",
      method: "POST",
      url: `/reckon/register-reckon-trial-company?_csrf=${token}`,
      data: {
        trial_user_id: id,
        system_company: JSON.stringify(systemCompany),
        system_user: JSON.stringify(systemUser)
      },
      async: true,
      success: function (response) {
        // Show info register
        if (response.success || response.errorCode === "REGISTER_ACCOUNTS_LINKED") {
          isCompleted = true;
          showInfoSuccess();
          showToast('success', "Register successfully.");
        } else {
          showToast('error', "Can't connect to server. Try again");
        }
        hideLoading();
      },
      error: function () {
        hideLoading();
        showToast('error', "Can't connect to server. Try again");
        return false;
      }
    });
  }

  function showInfoSuccess() {
    if (books[reckonSelected.BookId] && userReckon) {
      $('.jsShowCompany').addClass('hide');
      $('.jsShowInfoCompany').removeClass('hide');
      // render info
      $('#dicContentSuccess').html(`
      <h3>Thank you for participating in the trial.</h3>
        <h4>Your company is now registered.</h4>
        <div class="card-success-info">
          <div class="card-success-info--shadow">
            <p><b>${books[reckonSelected.BookId].CompanyName}</b></p>
            <p> ${books[reckonSelected.BookId].TaxNumber ? books[reckonSelected.BookId].TaxNumber : "N/A"}</p>
            <p>${books[reckonSelected.BookId].LegalAddress?.Line1 ? books[reckonSelected.BookId].LegalAddress.Line1 : ""}</p>
          </div>
          <div class="card-success-info--shadow">
            <p><b>Payroll Admin User</b></p>
            <p>Full name: ${userReckon.given_name} ${userReckon.family_name}</p>
            <p>Email: ${userReckon.email}</p>
          </div>
          <div class="card-success-info--shadow">
            <p><b>CashD User</b></p>
            <p>Full name: ${userTrial.is_nominate ? userTrial.nominate_first_name + " " + userTrial.nominate_last_name : userTrial.first_name +" "+ userTrial.last_name }</p>
            <p>Email: ${userTrial.is_nominate ? userTrial.nominate_email : userTrial.email}</p>
            <p>Phone: +${userTrial.is_nominate ? "(" + userTrial.nominate_mobile_country_code + ") " + userTrial.nominate_mobile : "("+userTrial.mobile_country_code+") " + userTrial.mobile}</p>
          </div>
        </div>
        <div class="card-success-footer">
          <h5 class="pt-3">
            You may be contacted by the CashD team to complete any outstanding information.
          </h5>
          <h5 class="pt-2">
            For any questions, please email support: <a href="mailto:support@cashd.com.au">support@cashd.com.au</a>
          </h5>
        </div>
      `);
    }
  }

  function convertReckonToCashdCompany(company, refreshToken) {
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
    //add refresh token
    companyInfo.system_refresh_token = refreshToken;
    companyInfo.email_company = company.ReplyToEmailAddress ? company.ReplyToEmailAddress : null;
    companyInfo.phone_company = company.PhoneNumber ? (company.PhoneCode ? company.PhoneCode + company.PhoneNumber : "" + company.PhoneNumber) : null;
    companyInfo.mobile_company = company.MobileNumber ? (company.MobileCode ? company.MobileCode + company.MobileNumber : "" + company.MobileNumber) : null;
    return companyInfo;
  }

  function convertReckonToCashdUser(user) {
    return {
      first_name: user.given_name,
      last_name: user.family_name,
      fullname: user.given_name + ' ' + user.family_name,
      mobile: '',
      email: user.email,
      system_user_id: user.kid,
      system_employee_id: user.kid
    }
  }

  function checkRoleStaff(csrf, accessToken, reckonSelected, refreshToken) {
    if (csrf && accessToken && reckonSelected && refreshToken) {
      request = $.ajax({
        dataType: "json",
        method: "POST",
        url: `/reckon/company-info`,
        data: {
          bookId: reckonSelected.BookId,
          access_token: accessToken,
          "_csrf": csrf
        },
        success: function (data) {
          if (data && !books[data.CashbookId]) {
            let company = data;
            company.isOwnerCompany = company.CompanyName && company.ReplyToEmailAddress
            if (company.CompanyName === null) {
              company.CompanyName = reckonSelected.BookName;
            }
            books[data.CashbookId] = company;
            $('#divChooseCompany').append(
              layoutChooseCompany(company)
            );
          }
        }
      });
    } else {
      loading();
      showToast('error', "Can't connect to server. Try again");
      return false;
    }
  }

  $('#btnCloseAfterRegister').click(function () {
    window.location.href = "https://cashd.com.au/reckon-one/";
  });

  $('#jsCancel').click(function() {
    loading();
    $('#divShowChooseCompany, .jsShowCompany').addClass('hide');
    $('#divChooseCompany').html('');
    $('#divContentSuccess').removeClass('hide');
    reckonSelected = {};
    books = {}
    hideLoading();
  });

});