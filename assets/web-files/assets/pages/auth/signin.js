const origin = document.location.origin;
const width = screen.width;
const height = screen.height;
const pupupWidth = width - 400;
const pupupHeight = height - 200;
var windowFeatures = `resizable,scrollbars=0,status,top=100,left=200,width=${pupupWidth},height=${pupupHeight}`;
let isLoad = true;
const mess =
  "Your password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number digit and one special character (!@#$%^&*)";
const socket = io();
socket.on("connect", () => {});

var config = {
  messagingSenderId: "208800833949",
  apiKey: "AIzaSyB6LlVaiqII1pPnRRA8QyQaPCSwHlp2O_U",
  projectId: "cashd-324d3",
  appId: "1:208800833949:web:af744fb1ac23b3f7b98f74",
};
firebase.initializeApp(config);

try {
  const messaging = firebase.messaging();
  messaging
  .requestPermission()
  .then(function () {
    // get the token in the form of promise
    return messaging.getToken();
  })
  .then(function (tokenFirebase) {
    document.getElementById("device_token").value = tokenFirebase;
  })
  .catch(function (err) {
    console.log(err);
    const checkNotification = setInterval(() => {
      if(document.getElementsByClassName('theme-loader').length <= 0) {
        alert("Please allow notifications.");
        clearInterval(checkNotification);
      }
    }, 1000);
  }); 
} catch (error) {
  console.log(error);
}

$(document).ready(function () {
  $("#jsCheckbox").click(function () {
    if ($(this).is(":checked")) {
      localStorage.setItem("isChecked", "ok");
    } else {
      localStorage.setItem("isChecked", "");
    }
  });
  const isRemember = localStorage.getItem("isChecked");
  if (isRemember == "ok") {
    $("#jsCheckbox").prop("checked", true);
  }
  var checkboxs = $(".form-login-checkbox_box-company");
  // var checkBoxGroup = $(".form-login-checkbox_box-group");
  var token = $("#_csrf").val();
  var staffs = $("#data").val();
  var resultToken = null;
  var urlKeyPay = $("#urlKeyPay").val();
  var urlXero = $("#urlXeRo").val();
  var urlDeputy = $("#urlDeputy").val();
  var mode = "EMPLOYER";

  ///
  const urlParams = new URLSearchParams(window.location.search);
  const myParam = urlParams.get('code');
  const action = urlParams.get('action');
  let isLogin = sessionStorage.getItem('isLogin');
  if (isLogin) {
    document.location = window.origin;
  }
  if (action == 'login' || (myParam && !isLogin)) {
    logout($('input[name="_csrf"]').val());
  }
  if (myParam && !isLogin) {
    $('#jsChangePassAdmin').html(`<div style="max-width: 600px;"class="auth-box card">
    <div class="card-block card-block--custom">
      <div class="row m-b-20">
        <div class="col-md-12">
          <h3 class="text-center">Select a password</h3>
        </div>
      </div>
      <form autocomplete="off">
        <div class="form-group mt-2">
          <div class="form-group-position">
            <input type="text" class="form-control text-secure" id="selectPassword" placeholder="Select a password">
          </div>
        </div>
        <div class="form-group mt-2">
          <div class="form-group-position">
            <input type="text" class="form-control text-secure" id="reEnterPassword" placeholder="Re-enter password">
          </div>
        </div>
        <div class="mt-3">
          <p class="text-danger jsErrorText m-0"></p>
        </div>
      </form>
      <div class="row mt-5">
        <div class="col-sm-6"><button id="jsCanSelectPassword" type="button" class="btn btn-secondary btn-block">CANCEL</button></div>
        <div class="col-sm-6"><button id="jsNextSelectPassword" type="submit" class="btn btn-primary btn-block">NEXT</button></div>
      </div>
    </div>
  </div>`);
    $('#jsFormLogin').addClass('hide');
    $('#jsCanSelectPassword').click(function(){
      $('#jsChangePassAdmin').html("");
      $('#jsFormLogin').removeClass('hide');
    });
    $('#jsNextSelectPassword').click(function() {
      loader();
      let password = $("#reEnterPassword").val();
      let selectPass = $("#selectPassword").val();
      if (password.trim() !== selectPass.trim()) {
        $('.jsErrorText').text('Re-enter the new password does not match.');
      }
      if (!password.match(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
        $('.jsErrorText').text('Your password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number digit and one special character (!@#$%^&*)');
      }
      $.ajax({
        dataType: "json",
        type: "POST",
        url: `/createAdminPassword`,
        data: {
          activationCode : myParam,
          newPassword : password,
          _csrf: $('input[name="_csrf"]').val(),
          time_offset: Math.abs(new Date().getTimezoneOffset()) * 60 * 1000,
          device_token: $("#device_token").val()
        },
        success: function (data) {
          if (data.success) {
            sessionStorage.setItem('isLogin', 'true');
            setTimeout(function () {
              $(".fix-menu").append(
                `<a id='jsLink' href="${window.origin}/check2fa"></a>`
              );
              hidenLoader();
              window.location.href = $("#jsLink").attr("href");
            }, 1000);
          } else {
            showToast("error", data.message);
            hidenLoader();
          }
        },
        error: function (err) {
          console.log(err);
          showToast("error", `Can't connect server. Please try again.`);
          hidenLoader();
        },
      });
    });
  } else {
    $('#jsChangePassAdmin').html("");
    $('#jsFormLogin').removeClass('hide');
  }

  $('#jsSiCompany').click(function() {
    mode = "EMPLOYER";
    $(this).addClass('active');
    $('#jsFormGroup').addClass('hiden');
    $('#jsForm').removeClass('hiden');
    $('#jsSiGroup').removeClass('active');
  });
  // $('#jsSiGroup').click(function() {
  //   mode = "MANAGER";
  //   $(this).addClass('active');
  //   $('#jsSiCompany').removeClass('active');
  //   $('#jsFormGroup').removeClass('hiden');
  //   $('#jsForm').addClass('hiden');
  // });

  checkboxs.click(function (e) {
    checkboxs.each(function () {
      this.checked = false;
    });
    var target = $(e.target);
    target.prop("checked", true);
    const staff = $(target.parent()).find("input[name='item']").val();
    localStorage.setItem("staff", staff);
    const code = JSON.parse(staff).system_infor.code;
    if (code != localStorage.getItem("code_login")) {
      removeLocal();
    }
  });

  // checkBoxGroup.click(function(e) {
  //   checkBoxGroup.each(function () {
  //     this.checked = false;
  //   });
  //   var target = $(e.target);
  //   target.prop("checked", true);
  //   const group = $(target.parent()).find("input[name='itemGroup']").val();
  //   localStorage.setItem("group", group);
  // });

  $("#jsSelect").click(async function () {
    $("#jsLoader").addClass("show");
    var isCheck = false;
    // if (mode === "EMPLOYER" && $('#jsSiCompany').hasClass('active')) {
      checkboxs.each(function () {
        if (this.checked) {
          isCheck = true;
        }
      });
      if (!isCheck) {
        showToast("warning", "Select a Company and Payroll System.");
        hidenLoader();
      } else {
        var staff = JSON.parse(localStorage.getItem("staff"));
        var checkActive = checkCompanyAndStaff(staff);
        if (checkActive.success) {
          setStaffId(staff._id, staff.role);
          runLogin(staff.system_infor.code, staff._id);
        } else {
          showModalErr(checkActive.message);
        }
      }
    // } 
    // else if (mode === "MANAGER" && $('#jsSiGroup').hasClass('active')) {
    //   checkBoxGroup.each(function () {
    //     if (this.checked) {
    //       isCheck = true;
    //     }
    //   });
    //     if (!isCheck) {
    //       showToast("warning", "Select a group.");
    //       hidenLoader();
    //     } else {
    //       var group = JSON.parse(localStorage.getItem("group"));
    //       var checkActive = checkGroup(group);
    //       if (checkActive.success) {
    //         runLoginManager(group._id);
    //       } else {
    //         showModalErr(checkActive.message);
    //       }
    //     }
    // }
    });

  $("#jsCancel").click(function () {
    $("#jsChooseStaff").removeClass("show");
    window.history.back();
  });

  async function runLogin(systemCode, staffId) {
    let isSuccess = await getAccessTokenBySystemCode(systemCode, staffId);
    if (isSuccess) {
      const user = JSON.parse(localStorage.getItem("staff"));
      if (!checkFirstLogin()) {
          setTimeout(function () {
            $(".fix-menu").append(
              //`<a id='jsLink' href="${window.origin}/admin/watch-company-infor/${user.company_id}"></a>`
              `<a id='jsLink' href="${window.origin}/check2fa"></a>`
            );
            hidenLoader();
            window.location.href = $("#jsLink").attr("href");
          }, 1000);
        } else {
          hidenLoader();
          $("#jsChangePass").modal({
            backdrop: false,
            keyboard: false,
            show: true,
          });
      }
    } else {
      showToast("error", `Your ${systemCode} account is not linked to a CashD account. Please contact your Company Administrator to setup your CashD account.`);
      hidenLoader();
    }
  }

  async function runLoginManager(groupId) {
    $.ajax({
      dataType: "json",
      type: "POST",
      url: `/admin/group/${groupId}/auth?_csrf=${token}`,
      success: function (data) {
        setTimeout(function () {
          $(".fix-menu").append(
            //`<a id='jsLink' href="${window.origin}/admin/company-group"></a>`
            `<a id='jsLink' href="${window.origin}/check2fa"></a>`
          );
          hidenLoader();
          window.location.href = $("#jsLink").attr("href");
        }, 1000);
      },
      error: function () {
        showToast("error", `Your group account is not linked to a CashD account. Please contact your Company Administrator to setup your CashD account.`);
        hidenLoader();
      },
    });
  }
  // //show password
  // $(".toggle-password").click(function() {
  //   console.log('dcm');
  //   $(this).toggleClass("icon-eye-off");
  //   var input = $($(this).attr("toggle"));
  //   if (input.attr("type") == "password") {
  //     input.attr("type", "text");
  //   } else {
  //     input.attr("type", "password");
  //   }
  // });

  // Check active
  function checkCompanyAndStaff(staff) {
    let mess;
    if (staff.company_infor.is_active != 1) {
      mess = `Your company has been disconnected from CashD, you no longer have access. 
      For any queries, please contact your employer / supervisor or send an email to support@cashd.com.au.`;
      return {success: false, message: mess}
    }
    if (staff.is_active != 1) {
      mess = `You have been disconnected from CashD, you no longer have access. 
      For any queries, please contact your employer / supervisor or send an email to support@cashd.com.au.`;
      return {success: false, message: mess}
    }
    return {success: true, message: mess};
  }

  // Check group active
  function checkGroup(group) {
      let mess;
      if (group.is_active === 2) {
        mess = `Your company has been disconnected from CashD, you no longer have access. 
        For any queries, please contact your employer / supervisor or send an email to support@cashd.com.au.`;
        return {success: false, message: mess}
      }
      return {success: true, message: mess};
  }

  function showModalErr(message) {
    hidenLoader();
    $('#jsShowErrActive .jsTextErr').text(message);
    $('#jsShowErrActive').modal('show');
  }

  //show popup page system
  // function popupSystem(url, name) {
  //   const popup = window.open(url, name, windowFeatures);
  //   const popupTick = setInterval(() => {
  //     if (popup.closed && isLoad) {
  //       clearInterval(popupTick);
  //       hidenLoader();
  //     }
  //   }, 500);
  //   return popup;
  // }

  // async function runLoginKeyPay() {
  //   //await main();
  //   await mainKeyPayNew();
  //   var time = 0;
  //   var runInterval = setInterval(function () {
  //     var business = localStorage.getItem("business");
  //     var user_keypay = localStorage.getItem("user_keypay");
  //     if (
  //       business != null &&
  //       business != undefined &&
  //       user_keypay != null &&
  //       user_keypay != undefined
  //     ) {
  //       clearInterval(runInterval);
  //       checkId(business, user_keypay);
  //     }
  //     time++;
  //     if (time > 25) {
  //       clearInterval(runInterval);
  //       showToast(
  //         "error",
  //         "Your KEYPAY account is not linked to a CashD account. Please contact your Company Administrator to setup your CashD account."
  //       );
  //       hidenLoader();
  //     }
  //   }, 1000);
  // }

  // async function runLoginXero() {
  //   //await mainXero();
  //   await mainXeroNew();
  // }

  // async function runLoginDeputy() {
  //   const staff = JSON.parse(localStorage.getItem("staff"));
  //   var access_token = localStorage.getItem("access_token");
  //   var endpoint = localStorage.getItem("endpoint");
  //   if (access_token) {
  //     await setLocalAndGetProfile(staff, access_token, endpoint, true);
  //   } else {
  //     var popup = window.open(urlDeputy, "Pupup_Deputy", windowFeatures);
  //     const popupTick = setInterval(() => {
  //       if (popup.closed && isLoad) {
  //         clearInterval(popupTick);
  //         hidenLoader();
  //       }
  //     }, 500);
  //     socket.on("join", async (data) => {
  //       if (data.code && data.key == "DEPUTY") {
  //         localStorage.setItem("code", data.code);
  //         isLoad = false;
  //         popup.close();
  //         var resultGetAccessTokenDeputy = JSON.parse(
  //           await getAccessTokenDeputy(token, data.code)
  //         );
  //         if (resultGetAccessTokenDeputy.access_token != undefined) {
  //           localStorage.setItem(
  //             "access_token",
  //             resultGetAccessTokenDeputy.access_token
  //           );
  //           localStorage.setItem(
  //             "refresh_token",
  //             resultGetAccessTokenDeputy.refresh_token
  //           );
  //           localStorage.setItem(
  //             "endpoint",
  //             resultGetAccessTokenDeputy.endpoint
  //           );
  //           await setLocalAndGetProfile(
  //             staff,
  //             resultGetAccessTokenDeputy.access_token,
  //             resultGetAccessTokenDeputy.endpoint,
  //             false
  //           );
  //         } else {
  //           if (resultGetAccessTokenDeputy.error) {
  //             showToast("error", `Can not connect to server. Try again later!`);
  //             hidenLoader();
  //           } else {
  //             showPopupErr("Deputy");
  //           }
  //         }
  //       } else {
  //         popup.close();
  //         showToast("error", `Can not connect to server. Try again later!`);
  //         hidenLoader();
  //         removeLocal();
  //       }
  //     });
  //   }
  // }

  // async function runLoginDeputyNew() {
  //   const staff = JSON.parse(localStorage.getItem("staff"));
  //   var getAccessToken = await getAccessTokenPayroll(staff._id);
  //   let {access_token, end_point_url} = getAccessToken.result
  //   if (access_token != null) {
  //     await setLocalAndGetProfileNew(
  //       staff,
  //       access_token.replace("OAuth ", ""),
  //       end_point_url,
  //       false
  //     );
  //   } else {
  //     showToast(
  //       "error",
  //       "Please try again."
  //     );
  //     hidenLoader();
  //     return;
  //   }
  // }

  // async function refreshTokenDeputy(token, refresh_token) {
  //   let result = await $.ajax({
  //     method: "post",
  //     url: `/deputy-refresh_token`,
  //     data: {
  //       refresh_token,
  //       _csrf: token,
  //     },
  //   });
  //   return result;
  // }

  // async function getUserProfileLogin(token, access_token, link) {
  //   let result = await $.ajax({
  //     method: "post",
  //     url: `/deputy-get-profile`,
  //     data: {
  //       access_token,
  //       _csrf: token,
  //       link,
  //     },
  //   });
  //   return result;
  // }

  // async function getAccessTokenDeputy(token, code) {
  //   let result = await $.ajax({
  //     method: "post",
  //     url: `/deputy`,
  //     data: {
  //       code: code,
  //       _csrf: token,
  //     },
  //   });
  //   return result;
  // }

  // async function mainXero() {
  //   const staff = JSON.parse(localStorage.getItem("staff"));
  //   var access_token = localStorage.getItem("access_token");
  //   if (access_token) {
  //     var resultGetConnections = JSON.parse(
  //       await getConnections(token, access_token)
  //     );
  //     if (resultGetConnections.Status == 401) {
  //       var resultGetRefreshTokenXero = JSON.parse(
  //         await getRefreshTokenXero(
  //           token,
  //           localStorage.getItem("refresh_token")
  //         )
  //       );
  //       if (resultGetRefreshTokenXero.access_token != undefined) {
  //         localStorage.setItem(
  //           "access_token",
  //           resultGetRefreshTokenXero.access_token
  //         );
  //         localStorage.setItem(
  //           "refresh_token",
  //           resultGetRefreshTokenXero.refresh_token
  //         );
  //         var resultGetConnections = JSON.parse(
  //           await getConnections(token, resultGetRefreshTokenXero.access_token)
  //         );
  //         await setLocalAndRunGetConnections(
  //           resultGetConnections,
  //           staff,
  //           resultGetRefreshTokenXero.access_token
  //         );
  //       } else {
  //         showPopupErr("Xero");
  //       }
  //     } else if (resultGetConnections.Status == 400) {
  //       localStorage.removeItem("access_token");
  //       localStorage.removeItem("refresh_token");
  //       showPopupErr("Xero");
  //     } else {
  //       await setLocalAndRunGetConnections(
  //         resultGetConnections,
  //         staff,
  //         access_token
  //       );
  //     }
  //   } else {
  //     var popup = window.open(
  //       urlXero + staff.email,
  //       "Pupup_Xero",
  //       windowFeatures
  //     );
  //     const popupTick = setInterval(() => {
  //       if (popup.closed && isLoad) {
  //         clearInterval(popupTick);
  //         hidenLoader();
  //       }
  //     }, 500);
  //     socket.on("join", async (data) => {
  //       if (data.code && data.key == "XERO" && data.state == staff.email) {
  //         localStorage.setItem("code", data.code);
  //         isLoad = false;
  //         popup.close();
  //         var resultGetAccessToken = JSON.parse(
  //           await getAccessToken(data.code, token)
  //         );
  //         if (resultGetAccessToken.access_token != undefined) {
  //           localStorage.setItem(
  //             "access_token",
  //             resultGetAccessToken.access_token
  //           );
  //           localStorage.setItem(
  //             "refresh_token",
  //             resultGetAccessToken.refresh_token
  //           );
  //           var resultGetConnections = JSON.parse(
  //             await getConnections(token, resultGetAccessToken.access_token)
  //           );
  //           await setLocalAndRunGetConnections(
  //             resultGetConnections,
  //             staff,
  //             resultGetAccessToken.access_token
  //           );
  //         } else {
  //           if (resultGetAccessToken.error) {
  //             showToast("error", `Can not connect to server. Try again later!`);
  //             hidenLoader();
  //           } else {
  //             showPopupErr("Xero");
  //           }
  //         }
  //       } else {
  //         popup.close();
  //         // showPopupErr("Xero");
  //         showToast("error", `Can not connect to server. Try again later!`);
  //         hidenLoader();
  //         removeLocal();
  //       }
  //     });
  //   }
  // }

  // async function mainXeroNew() {
  //   const staff = JSON.parse(localStorage.getItem("staff"));
  //   let getAccessToken = await getAccessTokenPayroll(staff._id);
  //   let accessToken = getAccessToken.result.access_token;
  //   if (accessToken != null) {
  //     var resultGetConnections = JSON.parse(
  //       await getConnections(token, accessToken.replace("Bearer ", ""))
  //     );
  //     if (resultGetConnections.Status == 401) {
  //       getAccessToken = await getAccessTokenPayroll(staff._id);
  //       accessToken = getAccessToken.result.access_token;
  //       if (accessToken != null) {
  //         var resultGetConnections = JSON.parse(
  //           await getConnections(token, accessToken.replace("Bearer ", ""))
  //         );
  //         await setLocalAndRunGetConnections(
  //           resultGetConnections,
  //           staff,
  //           accessToken.replace("Bearer ", "")
  //         );
  //       } else {
  //         showPopupErr("Xero");
  //       }
  //     } else if (resultGetConnections.Status == 400) {
  //       showPopupErr("Xero");
  //     } else {
  //       await setLocalAndRunGetConnections(
  //         resultGetConnections,
  //         staff,
  //         accessToken.replace("Bearer ", "")
  //       );
  //     }
  //   } else {
  //     showToast(
  //       "error",
  //       "Please try again."
  //     );
  //     hidenLoader();
  //     return;
  //   }
  // }

  // function checkId(value, userKeypayLocal) {
  //   const users = JSON.parse(localStorage.getItem("staff"));
  //   if (
  //     value != undefined &&
  //     userKeypayLocal != undefined &&
  //     users != undefined
  //   ) {
  //     const business = JSON.parse(value);
  //     const userKeypay = JSON.parse(userKeypayLocal);
  //     if (
  //       users.system_user_id == JSON.parse(userKeypay.data).id &&
  //       users.company_infor.system_company_id == business[0].id
  //     ) {
  //       showToast("success", "Login successfull.");
  //       if (!checkFirstLogin()) {
  //         setTimeout(function () {
  //           $(".fix-menu").append(
  //             `<a id='jsLink' href="${window.origin}/admin/watch-company-infor/${users.company_id}"></a>`
  //           );
  //           hidenLoader();
  //           window.location.href = $("#jsLink").attr("href");
  //         }, 1000);
  //       } else {
  //         hidenLoader();
  //         $("#jsChangePass").modal({
  //           backdrop: false,
  //           keyboard: false,
  //           show: true,
  //         });
  //       }
  //     } else {
  //       showPopupErr("KeyPay");
  //     }
  //   } else {
  //     showPopupErr("KeyPay");
  //   }
  // }

  function removeLocal() {
    localStorage.removeItem("code");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_keypay");
    localStorage.removeItem("business");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("endpoint");
    localStorage.removeItem("group");
  }

  // async function main() {
  //   localStorage.setItem("users", staffs);
  //   var access_token = localStorage.getItem("access_token");
  //   if (access_token) {
  //     var resultCallUserPayInfo = await callUserPayInfo(token, access_token);
  //     if (resultCallUserPayInfo.statusCode == 401) {
  //       let newAccessToken = await refreshTokenPay();
  //       if (newAccessToken) {
  //         var newResult = await callUserPayInfo(token, newAccessToken);
  //         localStorage.setItem("user_keypay", JSON.stringify(newResult));
  //         await getBusinessOrinigation(token, newAccessToken);
  //       } else {
  //         showToast("error", `Can not connect to server. Try again later!`);
  //       }
  //     } else if (resultCallUserPayInfo.statusCode == 400) {
  //       showToast(
  //         "error",
  //         "Your KEYPAY account is not linked to a CashD account. Please contact your Company Administrator to setup your CashD account."
  //       );
  //       localStorage.removeItem("refresh_token");
  //       localStorage.removeItem("access_token");
  //     } else {
  //       localStorage.setItem(
  //         "user_keypay",
  //         JSON.stringify(resultCallUserPayInfo)
  //       );
  //       await getBusinessOrinigation(token, access_token);
  //     }
  //   } else {
  //     var popup = window.open(urlKeyPay, "Pupup_KeyPay", windowFeatures);
  //     const popupTick = setInterval(() => {
  //       if (popup.closed && isLoad) {
  //         clearInterval(popupTick);
  //         hidenLoader();
  //       }
  //     }, 500);
  //     socket.on("join", async (data) => {
  //       if (data.code && data.key == "KEYPAY") {
  //         localStorage.setItem("code", data.code);
  //         isLoad = false;
  //         popup.close();
  //         var result = await callYourPayrol(data.code, token);
  //         let dataPar = JSON.parse(result);
  //         if (dataPar.access_token) {
  //           localStorage.setItem("access_token", dataPar.access_token);
  //           localStorage.setItem("refresh_token", dataPar.refresh_token);
  //           var resultCallUserPayInfo = await callUserPayInfo(
  //             token,
  //             dataPar.access_token
  //           );
  //           if (resultCallUserPayInfo.statusCode === 401) {
  //             let access_token = await refreshTokenPay();
  //             var newResult = await callUserPayInfo(token, access_token);
  //             localStorage.setItem("user_keypay", JSON.stringify(newResult));
  //             await getBusinessOrinigation(token, access_token);
  //           } else if (resultCallUserPayInfo.statusCode == 400) {
  //             showToast(
  //               "error",
  //               "Your KEYPAY account is not linked to a CashD account. Please contact your Company Administrator to setup your CashD account."
  //             );
  //             localStorage.removeItem("refresh_token");
  //             localStorage.removeItem("access_token");
  //           } else {
  //             localStorage.setItem(
  //               "user_keypay",
  //               JSON.stringify(resultCallUserPayInfo)
  //             );
  //             await getBusinessOrinigation(token, dataPar.access_token);
  //           }
  //         } else {
  //           if (result.error) {
  //             showToast("error", `Can not connect to server. Try again later!`);
  //           } else {
  //             showPopupErr("Keypay");
  //           }
  //           hidenLoader();
  //         }
  //       } else {
  //         popup.close();
  //         showToast("error", `Can not connect to server. Try again later!`);
  //         hidenLoader();
  //         removeLocal();
  //       }
  //     });
  //   }
  //   hidenLoader();
  //   return null;
  // }

  // async function mainKeyPayNew() {
  //   const staff = JSON.parse(localStorage.getItem("staff"));
  //   let getAccessToken = await getAccessTokenPayroll(staff._id);
  //   let accessToken = getAccessToken.result.access_token;
  //   if (accessToken != null) {
  //     var resultCallUserPayInfo = await callUserPayInfo(
  //       token,
  //       accessToken.replace("Bearer ", "")
  //     );
  //     if (resultCallUserPayInfo.statusCode === 401) {
  //       getAccessToken = await getAccessTokenPayroll(staff._id);
  //       accessToken = getAccessToken.result.access_token;
  //       if ( accessToken != null) {
  //         resultCallUserPayInfo = await callUserPayInfo(
  //           token,
  //           accessToken.replace("Bearer ", "")
  //         );
  //       } else {
  //         showToast(
  //           "error",
  //           "Please try again."
  //         );
  //         return;
  //       }
  //     } 
  //     if (resultCallUserPayInfo.statusCode == 400) {
  //       showToast(
  //         "error",
  //         "Your KEYPAY account is not linked to a CashD account. Please contact your Company Administrator to setup your CashD account."
  //       );
  //       return;
  //     }
  //     if (resultCallUserPayInfo) {
  //       localStorage.setItem(
  //         "user_keypay",
  //         JSON.stringify(resultCallUserPayInfo)
  //       );
  //       await getBusinessOrinigation(token, accessToken.replace("Bearer ", ""));
  //     }
  //   } else {
  //     showToast(
  //       "error",
  //       "Please try again."
  //     );
  //     hidenLoader();
  //     return;
  //   }
  // }

  // async function callYourPayrol(code, token) {
  //   let result = await $.ajax({
  //     method: "post",
  //     url: `/keypay`,
  //     data: {
  //       code: code,
  //       _csrf: token,
  //     },
  //   });
  //   return result;
  // }

  // async function callUserPayInfo(token, tokenPay) {
  //   return await $.ajax({
  //     method: "post",
  //     url: `/keypay-get-user`,
  //     data: {
  //       tokenPay: tokenPay,
  //       _csrf: token,
  //     },
  //   });
  // }

  // async function refreshTokenPay() {
  //   var tokenPay = localStorage.getItem("refresh_token");
  //   let result = await $.ajax({
  //     method: "post",
  //     url: `/keypay-refresh-token`,
  //     data: {
  //       tokenPay: tokenPay,
  //       _csrf: token,
  //     },
  //   });
  //   if (result.data) {
  //     result = JSON.parse(result.data);
  //     if (result.access_token) {
  //       localStorage.setItem("access_token", result.access_token);
  //       localStorage.setItem("refresh_token", result.refresh_token);
  //       return result.access_token;
  //     } else {
  //       localStorage.removeItem("refresh_token");
  //       localStorage.removeItem("access_token");
  //       return null;
  //     }
  //   } else {
  //     localStorage.removeItem("refresh_token");
  //     localStorage.removeItem("access_token");
  //     localStorage.removeItem("user_keypay");
  //     localStorage.removeItem("business");
  //     localStorage.removeItem("tenantId");
  //     return null;
  //   }
  // }

  // async function getBusinessOrinigation(token, tokenPay) {
  //   let result = await $.ajax({
  //     method: "post",
  //     url: `/keypay-get-business`,
  //     data: {
  //       tokenPay: tokenPay,
  //       _csrf: token,
  //     },
  //   });
  //   if (result && result.data.length > 0) {
  //     localStorage.setItem("business", result.data);
  //   } else {
  //     hidenLoader();
  //     showToast(
  //       "error",
  //       "Your KEYPAY account is not linked to a CashD account. Please contact your Company Administrator to setup your CashD account."
  //     );
  //   }
  // }

  // async function getAccessToken(code, token) {
  //   let result = await $.ajax({
  //     method: "post",
  //     url: `/xero`,
  //     data: {
  //       code: code,
  //       _csrf: token,
  //     },
  //   });
  //   return result;
  // }

  // async function getConnections(token, access_token) {
  //   let result = await $.ajax({
  //     method: "post",
  //     url: `/xero-get-connections`,
  //     data: {
  //       access_token: access_token,
  //       _csrf: token,
  //     },
  //   });
  //   return result;
  // }

  // async function getUserProfile(token, tenantId, access_token) {
  //   let result = await $.ajax({
  //     method: "post",
  //     url: `/xero-get-profile`,
  //     data: {
  //       access_token: access_token,
  //       _csrf: token,
  //       tenantId: tenantId,
  //     },
  //   });
  //   return result;
  // }

  // async function getRefreshTokenXero(token, refresh_token) {
  //   let result = await $.ajax({
  //     method: "post",
  //     url: `/xero-refresh_token`,
  //     data: {
  //       refresh_token,
  //       _csrf: token,
  //     },
  //   });
  //   return result;
  // }

  // async function setLocalAndRunGetConnections(result, staff, access_token) {
  //   result.forEach((element) => {
  //     if (element.tenantId == staff.company_infor.system_company_id) {
  //       localStorage.setItem("tenantId", element.tenantId);
  //     }
  //   });
  //   var tenantId = localStorage.getItem("tenantId");
  //   if (tenantId && tenantId != null) {
  //     var resultGetUserProfile = JSON.parse(
  //       await getUserProfile(token, tenantId, access_token)
  //     );
  //     if (
  //       resultGetUserProfile.Users != null &&
  //       resultGetUserProfile.Users.length > 0
  //     ) {
  //       let error = resultGetUserProfile.Users.every((user) => {
  //         if (user.UserID === staff.system_user_id) {
  //           showToast("success", "Login successfull.");
  //           if (!checkFirstLogin()) {
  //             setTimeout(function () {
  //               $(".fix-menu").append(
  //                 `<a id='jsLink' href="${window.origin}/admin/watch-company-infor/${staff.company_id}"></a>`
  //               );
  //               hidenLoader();
  //               window.location.href = $("#jsLink").attr("href");
  //             }, 1000);
  //           } else {
  //             hidenLoader();
  //             $("#jsChangePass").modal({
  //               backdrop: false,
  //               keyboard: false,
  //               show: true,
  //             });
  //           }
  //           return false;
  //         }
  //         return true;
  //       });
  //       if (error) {
  //         showErr("Xero");
  //       }
  //     } else {
  //       showPopupErr("Xero");
  //     }
  //   } else {
  //     showPopupErr("Xero");
  //   }
  // }

  // async function setLocalAndGetProfile(staff, access_token, endpoint, isLoad) {
  //   if (endpoint == staff.company_infor.system_company_id) {
  //     var resultGetUserProfileLogin = JSON.parse(
  //       await getUserProfileLogin(token, access_token, endpoint)
  //     );
  //     if (isLoad && resultGetUserProfileLogin.statusCode == 401) {
  //       var resultGetRefreshTokenDeputy = JSON.parse(
  //         await refreshTokenDeputy(
  //           token,
  //           localStorage.getItem("refresh_token"),
  //           endpoint
  //         )
  //       );
  //       if (resultGetRefreshTokenDeputy.statusCode == 400) {
  //         localStorage.removeItem("access_token");
  //         localStorage.removeItem("refresh_token");
  //         showPopupErr("Deputy");
  //       } else if (resultGetRefreshTokenDeputy.access_token) {
  //         localStorage.setItem(
  //           "access_token",
  //           resultGetRefreshTokenDeputy.access_token
  //         );
  //         localStorage.setItem(
  //           "refresh_token",
  //           resultGetRefreshTokenDeputy.refresh_token
  //         );
  //         const isReload = true;
  //         await setLocalAndGetProfile(
  //           staff,
  //           "OAuth "+resultGetRefreshTokenDeputy.access_token,
  //           endpoint,
  //           isReload
  //         );
  //       }
  //     }
  //     if (resultGetUserProfileLogin.UserId == staff.system_user_id) {
  //       showToast("success", "Login successfull.");
  //       if (!checkFirstLogin()) {
  //         setTimeout(function () {
  //           $(".fix-menu").append(
  //             `<a id='jsLink' href="${window.origin}/admin/watch-company-infor/${staff.company_id}"></a>`
  //           );
  //           hidenLoader();
  //           window.location.href = $("#jsLink").attr("href");
  //         }, 1000);
  //       } else {
  //         hidenLoader();
  //         $("#jsChangePass").modal({
  //           backdrop: false,
  //           keyboard: false,
  //           show: true,
  //         });
  //       }
  //     } else {
  //       showPopupErr("Deputy");
  //     }
  //   } else {
  //     showPopupErr("Deputy");
  //   }
  // }

  // async function setLocalAndGetProfileNew(staff, accessToken, endpoint, isLoad) {
  //   if (endpoint == staff.company_infor.system_company_id) {
  //     var resultGetUserProfileLogin = JSON.parse(
  //       await getUserProfileLogin(token, accessToken, endpoint)
  //     );
  //     if (isLoad && resultGetUserProfileLogin.statusCode == 401) {
  //       var getAccessToken = await getAccessTokenPayroll(staff._id);
  //       let {access_token, end_point_url} = getAccessToken.result;
  //       if (access_token != null) {
  //         const isReload = true;
  //         await setLocalAndGetProfileNew(
  //           staff,
  //           access_token.replace("OAuth ", ""),
  //           end_point_url,
  //           isReload
  //         );
  //       } else {
  //         showToast(
  //           "error",
  //           "Please try again."
  //         );
  //         hidenLoader();
  //         return;
  //       }
  //     }
  //     if (resultGetUserProfileLogin.UserId == staff.system_user_id) {
  //       showToast("success", "Login successfull.");
  //       if (!checkFirstLogin()) {
  //         setTimeout(function () {
  //           $(".fix-menu").append(
  //             `<a id='jsLink' href="${window.origin}/admin/watch-company-infor/${staff.company_id}"></a>`
  //           );
  //           hidenLoader();
  //           window.location.href = $("#jsLink").attr("href");
  //         }, 1000);
  //       } else {
  //         hidenLoader();
  //         $("#jsChangePass").modal({
  //           backdrop: false,
  //           keyboard: false,
  //           show: true,
  //         });
  //       }
  //     } else {
  //       showPopupErr("Deputy");
  //     }
  //   } else {
  //     showPopupErr("Deputy");
  //   }
  // }

  //check matching password
  $("#retypeNewPassword").on("keyup", function () {
    if (
      $("#newPassword").val().trim() === $("#retypeNewPassword").val().trim()
    ) {
      $("#retypeNewPassword").css("border-color", "#ccc");
      $(".invalid-feedback").removeClass("show");
      $("#jsConfirm").removeAttr("disabled");
    } else {
      $("#retypeNewPassword").css("border-color", "red");
      $("#jsConfirm").attr("disabled", "disabled");
      $(".invalid-feedback")
        .addClass("show")
        .html("Re-enter the new password does not match.");
    }
  });

  $("#newPassword").on("blur", function () {
    let value = $(this).val();
    if (!value.match(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
      $(".invalid-feedback").addClass("show").html(mess);
      $("#jsConfirm").attr("disabled", "disabled");
      $("#newPassword").css("border-color", "red");
    } else {
      $(".invalid-feedback").removeClass("show");
      $("#newPassword").css("border-color", "#ccc");
      if (
        $("#newPassword").val() === $("#retypeNewPassword").val() &&
        $("#currentPassword").val()
      ) {
        $("#jsConfirm").removeAttr("disabled");
      } else {
        $("#retypeNewPassword").css("border-color", "red");
        $(".invalid-feedback")
          .addClass("show")
          .html("Re-enter the new password does not match.");
      }
    }
  });
  //submit new password
  $("#jsConfirm").click(function () {
    $("#jsLoader").addClass("show");
    if ($("#newPassword").val() === $("#retypeNewPassword").val()) {
      changePassword();
    } else {
      hidenLoader();
      showToast("error", "Password is not matching");
    }
  });

  //check account is first login
  function checkFirstLogin() {
    let isFirstLogin, choosedStaff;
    if (staffs.length > 1) {
      choosedStaff = JSON.parse(localStorage.getItem("staff"));
    } else {
      choosedStaff = staffs[0];
    }
    $.ajax({
      dataType: "json",
      type: "POST",
      url: `/get-user-profile`,
      data: {
        company_id: choosedStaff.company_infor._id,
        staff_id: choosedStaff._id,
        _csrf: token,
      },
      async: false,
      success: function (data) {
        if (data.result && data.success) {
          if (data.result.is_first_login === 1) {
            isFirstLogin = true;
          } else {
            isFirstLogin = false;
          }
        }
        return true;
      },
      error: function () {
        showToast("error", "Can't connect to server. Try again!");
        return false;
      },
    });
    return isFirstLogin;
  }
  //change password is first login
  function changePassword() {
    const staff = JSON.parse(localStorage.getItem("staff"));
    $.ajax({
      dataType: "json",
      type: "POST",
      url: `/change-password`,
      data: {
        current_password: $("#currentPassword").val(),
        new_password: $("#newPassword").val(),
        _csrf: token,
      },
      async: true,
      success: function (data) {
        hidenLoader();
        if (data.success) {
          showToast("success", "Password changed successfully.");
          setTimeout(function () {
            $(".fix-menu").append(
              //`<a id='jsLink' href="${window.origin}/admin/watch-company-infor/${staff.company_id}"></a>`
              `<a id='jsLink' href="${window.origin}/check2fa"></a>`
            );
            window.location.href = $("#jsLink").attr("href");
          }, 1000);
        } else {
          showToast("error", data.message);
        }
        return true;
      },
      error: function () {
        hidenLoader();
        showToast("error", "Can't connect to server. Try again");
        return false;
      },
    });
  }

  //loader
  function loader() {
    $("#jsLoader").addClass("show");
  }
  //hiden loader
  function hidenLoader() {
    setTimeout(function () {
      $("#jsLoader").removeClass("show");
    }, 500);
  }
  //show toast
  function showToast(name, mess) {
    $("#jsErr").removeClass();
    $("#jsErr").addClass(`show ${name}`);
    $("#jsErr p").text(mess);
    setTimeout(() => {
      $("#jsErr").removeClass(`show ${name}`);
    }, 2500);
  }
  //show err
  function showErr(name) {
    showToast(
      "error",
      `Your ${name} account is not linked to a CashD account. Please contact your Company Administrator to setup your CashD account.`
    );
    hidenLoader();
    removeLocal();
  }

  function showPopupErr(name) {
    $(".err--system-name").html(name);
    $("#jsShowErr").modal("show");
    hidenLoader();
    removeLocal();
  }

  function setStaffId(staff_id, role) {
    $.ajax({
      dataType: "json",
      type: "Post",
      url: `/staff/${staff_id}`,
      async: true,
      data: {
        role: role && role === "SUPERVISOR" ? "Supervisor" : "User",
        _csrf: token
      },
      success: function (data) {
        return true;
      },
      error: function () {
        return false;
      },
    });
  }

  async function getAccessTokenBySystemCode(systemCode, staffId) {
    var isSuccess = true;
    var accessToken = "";
      var resultGetAccessToken = await getAccessTokenPayroll(staffId);
      if (resultGetAccessToken?.result?.access_token != null) {
        switch(systemCode) {
          case 'XERO':
            accessToken = resultGetAccessToken.result.access_token.replace("Bearer ", ""); 
            break;
          case 'DEPUTY':
            if (resultGetAccessToken.result.end_point_url != null) {
              accessToken = resultGetAccessToken.result.access_token.replace("OAuth ", "");
              localStorage.setItem("endpoint", resultGetAccessToken.result.end_point_url);
            } else {
              showToast('error', "Can't connect to server. Please try again.");
            }
            break;
          case 'KEYPAY':
            accessToken = resultGetAccessToken.result.access_token.replace("Bearer ", "");
            break;
          case "RECKON":
            accessToken = resultGetAccessToken.result.access_token.replace("Bearer ", "");
          default: 
            break;
        }
      }
      localStorage.setItem("access_token", accessToken);
      return isSuccess;
  }

  // get access token payroll
  async function getAccessTokenPayroll(staff_id) {
    let response = $.ajax({
      dataType: "json",
      type: "GET",
      url: `/access-token?staff_id=${staff_id}&_csrf=${token}&is_login=1`,
      async: true,
      success: function (data) {
        return data;
      },
      error: function () {
        return false;
      },
    });
    return response;
  }

});

async function logout(csr) {
  $.ajax({
    dataType: "json",
    type: "GET",
    url: `/logout-auto?_csrf=${csr}`,
    async: true,
    success: function (data) {
      console.log(data);
      return data;
    },
    error: function () {
      return false;
    },
  });
}


