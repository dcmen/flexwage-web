$(document).ready(function () {
  let isFirstLogin = $('input[name="isFirstLogin"]').val();
  if (isFirstLogin == 1) {
    $('#change-password').modal('show');
  }
});