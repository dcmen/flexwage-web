$(document).ready(function() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const queryParams = Object.fromEntries(urlSearchParams.entries());
  const token = $('input[name="_csrf"]').val();
  const encryptionKey = $('input[name="encryptionKey"]').val();
  let isCompleted = false;
  
  $(window).on('beforeunload', function(){
    if (!isCompleted) {
      return 'Are you sure you want to leave?';
    } else {
      return;
    }
  });

  function callRegister(params) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/reckon/post-cashd-trial?fee_model=${queryParams.fee_model}`,
      data: {
        _csrf: token,
        ...params
      },
      success: function (responsive) {
          if (responsive.success) {
            isCompleted = true;
            if (responsive.result.is_nominate) {
              $('#divModalSuccess').removeClass('hide');
              hideLoading();
            } else {
              setTimeout(function () {
                $("#divInfoUse").append(
                  `<a id='jsLink' href="${window.origin}/reckon/cashd-onboarding/${responsive.result._id}"></a>`
                );
                window.location.href = $("#jsLink").attr("href");
                hideLoading();
              }, 1000);
            }
          } else {
            $('#divModalFailed').removeClass('hide');
            hideLoading();
          }
      },
      error: function () {
          hideLoading();
          showToast("error", "Can not connect to server. Please try again.");
          return false;
      }
    });
  }

  function showToast(name, mess, nameErrId = '#jsErr') {
    $(nameErrId).addClass(`show ${name}`);
    $(`${nameErrId} p`).html(mess);
    setTimeout(() => {
        $(nameErrId).removeClass(`show ${name}`);
    }, 2500);
  }

  function encryptString(text) {
    const value = CryptoJS.AES.encrypt(text, encryptionKey).toString();
    return value;
}

  //show loading
  function loading() {
    $("#jsLoader").addClass("show");
  }
  
  //hide loading
  function hideLoading() {
    setTimeout(function() {
      $("#jsLoader").removeClass("show");
    }, 500);
  }

  $('input[name="isNominate"]').on('change', function() {
    let isNominate = $('input[name="isNominate"]:checked').val();
    if (isNominate === 'true') {
      let children = $('select[name="mobileCountryCode"]').html();
      $('#divPersonDetail').html(`
      <h4 class="title-txt">Nominated Person’s Details</h4>
      <div class="form-row mt-3">
        <div class="form-group col-md-6">
          <label for="nominateFirstName">First Name</label>
          <input type="text" class="form-control" name="nominateFirstName" id="nominateFirstName" placeholder="" required>
        </div>
        <div class="form-group col-md-6">
          <label for="nominateLastName">Last Name</label>
          <input type="text" name="nominateLastName" class="form-control" id="nominateLastName" placeholder="" required>
        </div>
      </div>
      <div class="form-group">
        <label for="nominateEmail">Email Address</label>
        <input type="email" class="form-control" name="nominateEmail" id="nominateEmail" placeholder="" required>
      </div>
      <div class="form-row">
        <div class="col-md-12 mb-3">
          <label for="validationMobile">Mobile Number</label>
          <div class="form-row custom-mobile">
              <div class="col-6 mb-1">
                  <select class="form-control" name="nominateCountryCode" id="nominateCountryCode">
                  ${children}
                  </select>
              </div>
              <div class="col-6 pl-1">
                  <input name="nominateMobile" type="text" class="form-control" placeholder="Mobile" pattern="[0-9]*" required> 
              </div>
          </div>
        </div>
      </div>
      `);
    } else {
      $('#divPersonDetail').html("");
    }
  });

  $('#onDirectDebitRequest').click(function () {
      $('#checkDDTerm').prop('checked', true);
      $('#formDDMonoova').modal('hide');
  });

  $('#onCheckedTermEmployer').click(function () {
      $('#checkEmployerTerm').prop('checked', true);
      $('#popupTermEmployer').modal('hide')
  });

  $(document).on('click', ".jsCheckEmployerTerm .copy-a", function (event) {
    event.preventDefault();
    $('#popupTermEmployer').modal({
      show: true,
      keyboard: false,
      backdrop: false
    });
  });

  $('#formRegister').submit(function(event) {
    loading();
    let isValidate = true;
    event.preventDefault();
    let isNominate = $('input[name="isNominate"]:checked').val();
    const objectValue = {};
    $(this).find("input[type='text'], input[type='email']").each(function(){
      let input = $(this);
      let name = input.attr("name");
      let value = input.val();
      objectValue[name] = value;
    });

    objectValue['isNominate'] = isNominate;
    objectValue['mobileCountryCode'] = $('select[name="mobileCountryCode"]').val();
    if (isNominate === 'true') {
      objectValue['nominateCountryCode'] = $('select[name="nominateCountryCode"]').val();
    }
    objectValue['checkEmployerTerm'] = $('#checkEmployerTerm').is(':checked');
    objectValue['url'] = window.origin;
    for (const key in objectValue) {
      if (Object.hasOwnProperty.call(objectValue, key)) {
        const element = objectValue[key];
        if (element.toString().trim() === '') {
          showToast("error", "Please fill out this form.");
          isValidate = false;
          hideLoading();
          return;
        }
      }
    }
    if (isValidate) {
      callRegister(objectValue);
    }
  });

  $('#btnClosePage').click(function() {
    window.location.href = "https://cashd.com.au/reckon-one/"
  });

  $(document).on('click', '.jsDDTerm .copy-a', function (event) {
    event.preventDefault();
    $('#formDDMonoova').modal({
      show: true,
      keyboard: false,
      backdrop: false
    });
  });

  $(document).on('click', '#btnClosePopupFailed', function () {
    $('#divModalFailed').addClass('hide');
  }
  );

});