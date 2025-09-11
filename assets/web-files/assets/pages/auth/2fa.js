//const origin = document.location.origin;
$(document).ready(function () {
    let staff = null;
    try{
        staff = JSON.parse(localStorage.getItem("staff"));
    }catch (err){
        conosle.log(err);
    }

    var token = $("#_csrf").val();
    var email = $("#email").val();
    var mobile = $("#sms").val();
    let sendType = "";
    
    $(".otp-form").hide();
    $("#message-fail").hide();
    $('#send-otp').prop('disabled', true)

    $('#email').click(async function() {
        $('#send-otp').prop('disabled', false);
        sendType = this.id;
    })

    $('#sms').click(async function() {
        $('#send-otp').prop('disabled', false)
        sendType = this.id;
    })


    $("#send-otp").click(async function() {
        $("#container").hide();
        $("#post-otp-form").append(`<input type="hidden" id="otp-email" name="email" value="${email}">`);
        if(staff){
            $("#post-otp-form").append(`<input type="hidden" id="company_id" name="company_id" value="${staff.company_id}">`);
        }
        if(sendType === "email"){
            $("#extra-message").html(`An email with a verification code was sent to <strong>${email}</strong>`);
        }else{
            $("#extra-message").html(`An sms with a verification code was sent to <strong>${mobile}</strong>`);
        }
        $.ajax({
            dataType: "json",
            type: "POST",
            url: `/get-otp-login`,
            data: {
                    email: email,
                    mobile: mobile,
                    sendType: sendType,
                    _csrf: token,
                },
            async: true,
            success: function (data) {
                if(!data.success){
                    $(".error-message").append(`<a id='jsLink' href="${window.origin}/"></a>`);
                    $("#message-fail").show()
                    setTimeout(function () {
                            window.location.href = $("#jsLink").attr("href");
                        }, 2000);
                    }
                },
            error: function () {
                console.log(data);
            },
        });
        $(".otp-form").show();
    })

    $("#send-again").click(async function() {
        $.ajax({
            dataType: "json",
            type: "POST",
            url: `/get-otp-login`,
            data: {
                    email: email,
                    mobile: mobile,
                    sendType: sendType,
                    _csrf: token,
                },
            async: true,
            success: function (data) {
                if(!data.success){
                    $(".error-message").append(`<a id='jsLink' href="${window.origin}/"></a>`);
                    $("#message-fail").show()
                    setTimeout(function () {
                            window.location.href = $("#jsLink").attr("href");
                        }, 2000);
                    }
                },
            error: function () {
                console.log(data);
            },
        });
    })
        
});
    