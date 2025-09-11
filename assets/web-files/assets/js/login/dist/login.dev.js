'use strict';

$(document).ready(function () {
  var checkboxs = $('.form-login-checkbox_box');
  var url = "https://api.yourpayroll.com.au/oauth/authorise?client_id=WEwlIIWHZW3uLX1vH4EujHH1&response_type=code&redirect_uri=http://cashd.co/callback";
  checkboxs.click(function (e) {
    checkboxs.each(function () {
      this.checked = false;
    });
    var target = $(e.target);
    target.prop('checked', true);
  });
  $('#jsCancel').click(function () {
    $('#jsChooseStaff').removeClass("show"); // $.ajax({
    //         method: "get",
    //         url: "http://localhost:4001/signin"
    //     })
    //     .done(function (data) {
    //         console.log(data);
    //     })
    //     .fail(function (err) {
    //         console.log(err);
    //     });
  });
  $('#jsSelect').click(function () {
    var isCheck = false;
    var data = null;
    checkboxs.each(function () {
      if (this.checked) {
        isCheck = true;
        var input = $($(this).parent()).parent().find(".data");
        data = input.val();
      }
    });

    if (!isCheck) {
      alert('Please choose staff!');
    } else {
      // $("#jsForm").submit();
      // var body = $(".fix-menu");
      // body.append(`<iframe src="${url}" height="200" id='keypay' width="300" title="Iframe Example" referrerpolicy="same-origin"></iframe>`);
      // var keypay = $('#keybay');
      // console.log(keypay);
      // var browser = browser || chrome
      var windowFeatures = "resizable,scrollbars,status"; // var href = window.location.href;
      // localStorage.setItem('user', data);

      var keypay = window.open("https://accounts.google.com", "CNN_WindowName", windowFeatures);
      var popupTick = setInterval(function () {
        console.log(keypay); // keypay.postMessage("anh yeu em", 'http://e180c5c72376.ngrok.io/signin');

        if (keypay.closed) {
          clearInterval(popupTick);
        }
      }, 500);
      window.location.assign(); // keypay.addEventListener( 'beforeunload', ( event ) => {
      //     console.log( keypay.location.href );
      // } );
      // const popupTick = setInterval( () => {
      //     keypay.document.getElementsByName('');
      //     if (keypay.closed) {
      //         clearInterval(popupTick);
      //     }
      // }, 500);
      // var getting = browser.windows.getAll({
      //     populate: true,
      //     windowTypes: ["normal"]
      // });
      // console.log(getting);
      // keypay.addEventListener('', function () {
      // });
      // const popupTick = setInterval( () => {
      //     // console.log(keypay.location.href);
      //     // if ((keypay.location.href).match(/(http|https):\/\/cashd\.co\/callback\?code=+/)) {
      //     //     keypay.opener.postMessage(JSON.stringify(window.document.head), href);
      //     // }
      //     keypay.opener.postMessage(JSON.stringify(keypay.document.head), href);
      //     if (keypay.closed) {
      //         clearInterval(popupTick);
      //         // keypay.document.write(
      //         //     `<script>window.opener.postMessage('dcmm', 'http://localhost:4001/signin');<\/script>`
      //         // );
      //     }
      // }, 500);
      // keypay.opener.postMessage('dcmm', href);
      // body.prepend(`<iframe src='${url}' name='' width='' height='' id='keypay' sandbox='allow-forms allow-scripts allow-popups allow-pointer-lock'></iframe>`);
      //var keypay = $('#keypay');
      // let newWindow = window.open(""");

      window.addEventListener("message", receiveMessage, false); // // newWindow.postMessage('aaa', '*', window.location.href);
    }
  });

  function receiveMessage(event) {
    console.log(event.data);
  }
});