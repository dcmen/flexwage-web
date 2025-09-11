if ($('input[name="message"]').val()) {
  $('#change-password').modal('show');
}
//check matching password
// $('input[name="new_password"]').on('blur', function () {
//   let value = $(this).val();
//   if (!value.match(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
//     $('#validationPass').text('Your password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number digit and one special character');
//     $(this).css('border-color', 'red');
//     $('#validationPass').removeClass('invalid-feedback').addClass('valid-feedback').css('color', '#dc3545');
//   } else {
//     $(this).css('border-color', '#ccc');
//     $('#validationPass').text('Password is not matching');
//   }
// });

// $('input[name="new_password"], input[name="retypeNewPassword"]').on('input', function () {
//   if ($('input[name="new_password"]').val() === $('input[name="retypeNewPassword"]').val()) {
//     $('input[name="retypeNewPassword"]').css('border-color', '#ccc');
//     $('#validationPass').removeClass('valid-feedback').addClass('invalid-feedback');
//   } else 
//     $('input[name="retypeNewPassword"]').css('border-color', 'red');
// });

$('.form-changepass button[type=submit').click(function(e) {
  $('#jsLoader').addClass('show');
    if ($('#newPassword').val() !== $('#retypeNewPassword').val()) {
      e.preventDefault();
    }
})

  //check matching password
  $('#retypeNewPassword').on('keyup', function () {
    if ($('#newPassword').val().trim() === $('#retypeNewPassword').val().trim()) {
      $('#retypeNewPassword').css('border-color', '#ccc');
      $('.invalid-feedback').removeClass('show');
      $('#jsConfirm').removeAttr('disabled');
    } else {
      $('#retypeNewPassword').css('border-color', 'red');
      $('#jsConfirm').attr('disabled','disabled');
      $('.invalid-feedback').addClass('show').html('Re-enter the new password does not match.');
    }
  });

  $('#newPassword').on('blur', function () {
    let value = $(this).val(); 
    if (!value.match(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
      $('.invalid-feedback').addClass('show').html('Your password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number digit and one special character (!@#$%^&*)');
      $('#jsConfirm').attr('disabled', 'disabled');
      $('#newPassword').css('border-color', 'red');
    } else {
      $('.invalid-feedback').removeClass('show');
      $('#newPassword').css('border-color', '#ccc');
      if (($('#newPassword').val() === $('#retypeNewPassword').val()) && $('#currentPassword').val()) {
        $('#jsConfirm').removeAttr('disabled');
      } else {
        $('#retypeNewPassword').css('border-color', 'red');
        $('.invalid-feedback').addClass('show').html('Re-enter the new password does not match.');
      }
    }
  });

  //show password
  $(".toggle-password").click(function() {
    $(this).toggleClass("icon-eye-off");
    var input = $($(this).attr("toggle"));
    if (input.attr("type") == "password") {
      input.attr("type", "text");
    } else {
      input.attr("type", "password");
    }
  });