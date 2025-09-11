"use strict";
var btnValue;

// function checksyStem() {
//   var OSName = "Unknown OS";
//   if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
//   if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
//   if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
//   if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";
//   return OSName;
// }

// $("#js-send").click(function() {
//   $("#js-browser").attr("value", checksyStem());
// });

// checksyStem();

$(".js-btn").click(function(e) {
  btnValue = e.target.value;
  let divPa = $(".dropdown-primary");
  let divMenu = $(".dropdown-menu");
  if (divPa.hasClass("show")) {
    divPa.removeClass("show");
    divMenu.removeClass("show");
  }
});

$(".toast-btn button").click(function() {
  $(".toast").toggleClass("show");
});

function callApi(url, http, num) {
  const formSubmit = $("#js-callApi" + num);
  let deduction_id = formSubmit.children('input[name="deduction_id"]').val();
  let pay_deduction_id = formSubmit
    .children('input[name="pay_deduction_id"]')
    .val();
  let staff_id = formSubmit.children('input[name="staff_id"]').val();
  $.ajax({
    method: "POST",
    url,
    data: {
      deduction_id,
      pay_deduction_id,
      staff_id
    }
  })
    .done(function(data) {
      if (!data.success) {
        $(".toast").addClass("show");
        $("#js-toast").text(
          "This employee is missing Bank information for creating ABA file."
        );
        setTimeout(function() {
          if ($(".toast").hasClass("show")) {
            $(".toast").removeClass("show");
          }
        }, 5000);
      } else {
        let link = btnValue === "0" ? "aba_link" : "csv_link";
        window.open(`${http}/${data.result[link]}`, "_parent");
      }
    })
    .fail(function(err) {
      console.log(err);
    });

  return false;
}

$('.js-path').attr('value', window.location.href);
$('.js-send').click(getMemberId);

const key = $('.js-local').val();
if(key) {
  window.localStorage.setItem('keyID', key)
}

function getMemberId() {
  const input = $('.js-getID');
  if(window.localStorage.getItem('keyID')){
    input.attr('value', window.localStorage.getItem('keyID'));
  }
}

////////////////
// check browser 
// // Opera 8.0+
// const isBrowser = {
// };

// isBrowser.isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// // Firefox 1.0+
// isBrowser.isFirefox = typeof InstallTrigger !== 'undefined';

// // Safari 3.0+ "[object HTMLElementConstructor]" 
// isBrowser.isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

// // Internet Explorer 6-11
// isBrowser.isIE = /*@cc_on!@*/false || !!document.documentMode;

// // Edge 20+
// isBrowser.isEdge = !isBrowser.isIE && !!window.StyleMedia;

// // Chrome 1 - 71
// isBrowser.isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

// // Blink engine detection
// isBrowser.isBlink = (isBrowser.isChrome || isBrowser.isOpera) && !!window.CSS;

// for(let key in isBrowser){
//   if(isBrowser[key]){
//     console.log(key);
//   }
// }



