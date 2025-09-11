$(document).ready(function() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const queryParams = Object.fromEntries(urlSearchParams.entries());
  const token = $('input[name="_csrf"]').val();
  const encryptionKey = $('input[name="encryptionKey"]').val();

  function callRegister(params) {
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/reckon/direct-debit-form`,
      data: {
        _csrf: token,
        ...params
      },
      success: function (responsive) {
          if (responsive.success) {
            hideLoading();
            $('#divModalSuccess').removeClass('hide');
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

  $('#formDDDetails').submit(function(event) {
    loading();
    let isValidate = true;
    let countKey = 0;
    event.preventDefault();
    const objectValue = {};
    $(this).find("input[type='text']").each(function(){
      let input = $(this);
      let name = input.attr("name");
      let value = input.val();
      objectValue[name] = value;
    });
    objectValue['code'] = queryParams.code;
    objectValue['checkDDTerm'] = $('#checkDDTerm').is(':checked');
    for (const key in objectValue) {
      if (Object.hasOwnProperty.call(objectValue, key)) {
        const element = objectValue[key];
        if (element.toString().trim() === '') {
          showToast("error", "Please complete field.");
          isValidate = false;
          hideLoading();
          return;
        }
        if (key === 'bankBsb' || key === 'bankAccountNumber') {
          objectValue[key] = encryptString(objectValue[key]);
        }
      }
      countKey++;
    }
    if (isValidate && countKey === 6) {
      callRegister(objectValue);
    } else {
      showToast("error", "Please complete field.");
      hideLoading();
      return;
    }
  });

  $(document).on('click', '.jsDDTerm .copy-a', function (event) {
    event.preventDefault();
    $('#formDDMonoova').modal({
      show: true,
      keyboard: false,
      backdrop: false
    });
  });

  $(document).on('click', '#btnClosePage', function () {
    window.location.href = window.location.origin;
  });

  $('#onDirectDebitRequest').click(function () {
    $('#checkDDTerm').prop('checked', true);
    $('#formDDMonoova').modal('hide');
  });

  $('#btnClosePopupFailed').click(function () {
    $('#divModalFailed').addClass('hide');
  });

});

document.addEventListener("DOMContentLoaded", function() {
  var elements = document.getElementsByTagName("INPUT");
  for (var i = 0; i < elements.length; i++) {
      elements[i].oninvalid = function(e) {
          e.target.setCustomValidity("");
          if (!e.target.validity.valid) {
              e.target.setCustomValidity("Please complete field");
          }
      };
      elements[i].oninput = function(e) {
          e.target.setCustomValidity("");
      };
  }
})