$(document).ready(() => {
  const mess = 'Your password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number digit and one special character (!@#$%^&*)';
  // //show password
  // $(".toggle-password").click(function() {
  //   $(this).toggleClass("icon-eye-off");
  //   var input = $($(this).attr("toggle"));
  //   console.log(input);
  //   if (input.attr("type") == "password") {
  //     input.attr("type", "text");
  //   } else {
  //     input.attr("type", "password");
  //   }
  // });
  //check matching password
  $('#newPassword').on('input', function () {
    if ($('#retypeNewPassword').val()) {
      if ($('#newPassword').val() !== $('#retypeNewPassword').val()) {
        $('.invalid-feedback').addClass('show').html('Password does not match!');
      } else {
        $('.invalid-feedback').removeClass('show');
      }
    } else {
      if (!$('#newPassword').val().match(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
        $('.invalid-feedback').addClass('show').html(mess);
        $('button[type=submit]').attr('disabled','disabled');
      } else {
        $('.invalid-feedback').removeClass('show')
        $('button[type=submit]').removeAttr('disabled');
      }
    }
  });

  $('#newPassword').on('blur', function () {
    let value = $(this).val();
    if (!value.match(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
      $('.invalid-feedback').addClass('show').html(mess);
      $('button[type=submit').attr('disabled','disabled');
    } else {
      $('.invalid-feedback').removeClass('show')
      $('button[type=submit').removeAttr('disabled');
    }
  });

  //check matching password
  $('#retypeNewPassword').on('input', function () {
    if ($('#newPassword').val() !== $('#retypeNewPassword').val()) {
      $('.invalid-feedback').addClass('show').html('Password does not match!');
    } else {
      $('.invalid-feedback').removeClass('show');
    }
  });

  $('.form-material button[type=submit').click(function(e) {
    if ($('input[name="new_password"]').val() !== $('input[name="retype-new-password"]').val()) {
      e.preventDefault(); //prevent the default action
    }
  })
});