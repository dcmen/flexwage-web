$(document).ready(function () {
    var firstName = $('#first_name');
    var lastName = $('#last_name');
    var email = $('#email');
    var password = $('#password');
    var confimPassword = $('#confim_password');
    var isTrue = true;
    $('#btnLoginSubmit').click(function () {
        if (firstName.val().trim() == "") {
            firstName.addClass("wr-border-color");
            isTrue = false;
        }
        if (lastName.val().trim() == "") {
            lastName.addClass("wr-border-color");
            isTrue = false;
        }
        var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;
        if (re.test(String(email.val()).toLowerCase())) {
            email.removeClass('wr-border-color');
        } else {
            email.addClass("wr-border-color");
            $('#show-err').text("Please include an '@' in the email address.");
            isTrue = false;
        }
        if (password.val().trim() == "") {
            password.addClass("wr-border-color");
            isTrue = false;
        }
        if (confimPassword.val().trim() == "" || confimPassword.val().trim() !== password.val().trim()) {
            isTrue = false;
            confimPassword.addClass("wr-border-color");
            $('#show-err').text('Confim password error! Please try again.');
        }
        if (isTrue) {
            $('#jsform-register').submit();
        }
    });
    firstName.change(function() {
        if (firstName.val().trim() != "") {
            firstName.removeClass('wr-border-color');
            isTrue = true;
        }
    });
    lastName.change(function() {
        if (lastName.val().trim() != "") {
            lastName.removeClass('wr-border-color');
            isTrue = true;
        }
    });
    email.change(function() {
        var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;
        if (re.test(String(email.val()).toLowerCase())) {
            email.removeClass('wr-border-color');
            isTrue = true;
        } else {
            email.addClass("wr-border-color");
            $(this).focus();
            $('#show-err').text("Please include an '@' in the email address.");
        }
    });
    password.change(function() {
        if (password.val().trim() != "") {
            password.removeClass('wr-border-color');
            isTrue = true;
        }
    });
    confimPassword.change(function() {
        if (confimPassword.val().trim() != "") {
            confimPassword.removeClass('wr-border-color');
            if (confimPassword.val() !== password.val()) {
                confimPassword.addClass("wr-border-color");
                $('#show-err').text('Confim password error! Please try again.');
            } else {
                isTrue = true;
            }
        }
    });
});