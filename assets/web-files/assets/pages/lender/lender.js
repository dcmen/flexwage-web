$(window).on("beforeunload", function () {
  return "Are you sure you want to leave?";
});
$(document).ready(function () {
  var current_step,
    next_step,
    previous_step,
    validate = true,
    form = {};
  var token = $("#jsToken").val();
  var lenderName = $("#inputLenderName");
  var fundingType = $("#inputFundingType");
  var accountType = $("#inputAccountType");
  var liveMonoovaAccount = $("#inputLiveMonoovaAccount");
  var liveApiKey = $("#inputLiveApiKey");
  var testMonoovaAccount = $("#inputTestMonoovaAccount");
  var testApiKey = $("#inputTestApiKey");
  var liveMonoovaFeeAccountNumber = $("#inputLiveMonoovaFeeAccount");
  var interest = $("#inputInterest");
  var unit = $("#unit");
  const key = $('input[name="key"]').val();
  const lenderSupper = JSON.parse($('input[name="lenderSupper"]').val());
  const inputs = $('section input[class="form-control"]');
  // var monoovaBalance = $('#inputMonoovaBalance');

  $("select").selectpicker(); //

  $("#inputAccountType").on("change", () => {
    if ($("#inputAccountType").find(":selected").data("cashd")) {
      $("#inputFundingType")
        .html(`<option value="SELF_FINANCED">Self Funded</option>
            <option value="EXTERNAL_FINANCED">
                External Funded
            </option>
            <option value="CASHD_FINANCED">CashD Funded</option>
            <option value="SELF_CASHD_FINANCED">Self & CashD Funded</option>`);
    } else {
      $("#inputFundingType").html(`<option value="SELF_FINANCED">Self Funded
            </option>
            <option value="EXTERNAL_FINANCED">
                External Funded
            </option>`);
    }
    $("#inputFundingType").selectpicker("refresh");
  });

  $("#jsBack").click(function () {
    $("#jsShowStep").css("display", "none");
    $("#jsNext").css("display", "inline");
    lenderName.removeAttr("disabled");
    fundingType.parent().find("button").removeAttr("disabled");
    accountType.parent().find("button").removeAttr("disabled");
  });

  $("#inputBSBLive").blur((e) => {
    if ($("#inputAccountNameLive").val()) {
      autoFormatBsb(
        $("#inputBSBLive").val(),
        "#inputBSBLive",
        "#jsShowValidateLive"
      );
    } else if ($("#inputAccountNameLive").val() == "" && $("#inputBSBLive").val() == "" && $("#inputAccountNumberLive").val() == "") {
      $("#inputBSBLive").removeClass('input--err');
      let names = ['#inputAccountNameLive', '#inputBSBLive', '#inputAccountNumberLive'];
      names.forEach(item  => {
        $(item).parent().removeClass('was-validated');
      });
    }
  });

  $("#inputBSBTest").blur((e) => {
    if ($("#inputAccountNameTest").val()) {
      autoFormatBsb(
        $("#inputBSBTest").val(),
        "#inputBSBTest",
        "#jsShowValidateTest"
      );
    } else if ($("#inputAccountNameTest").val() == "" && $("#inputBSBTest").val() == "" && $("#inputAccountNumberTest").val() == "") {
      $("#inputBSBTest").removeClass('input--err');
      let names = ['#inputAccountNameTest', '#inputBSBTest', '#inputAccountNumberTest'];
      names.forEach(item  => {
        $(item).parent().removeClass('was-validated');
      });
    }
  });

  function autoFormatBsb(value, nameInput, nameErr) {
    if (!value.match(/^[0-9]{3,3}-?[0-9]{3,3}$/)) {
      $(nameInput).parent().addClass("was-validated");
      $(nameInput).addClass("input--err");
      $(nameErr).removeClass("d-none");
      $(nameErr).text("BSB number expression XXX-XXX");
    } else if (value.length === 6) {
      var text = value.substring(0, 3) + "-" + value.substring(3, value.length);
      $(nameInput).val(text);
    } else {
      $(nameInput).parent().addClass("was-validated");
      $(nameInput).removeClass("input--err");
      $(nameErr).text("Please provide a bsb.");
    }
  }

  inputs.each(function () {
    $(this).keydown(() => {
      $(this).parent().find(".invalid-feedback").addClass("d-none");
    });
    $(this).blur(() => {
      $(this).val().trim() == ""
        ? $(this).parent().find(".invalid-feedback").removeClass("d-none")
        : "";
    });
  });

  // step 0
  $(document).on("click", "#jsNext", function () {
    sessionStorage.removeItem("form");
    if (lenderName.val().trim() !== "" && fundingType.val() !== "") {
      validate = true;
      $("#jsShowStep").css("display", "block");
      if (accountType.val() == "null") {
        $("#jsTitle").html(`Add New Self Fund <b>3 easy steps</b>`);
        $("#progressbar").html(
          '<li class="active">Step 1</li><li>Step 2</li><li>Step 3</li>'
        );
      } else {
        $("#jsTitle").html(`Add External/CashD Fund <b>2 easy steps</b>`);
        $("#progressbar").html('<li class="active">Step 1</li><li>Step 2</li>');
      }
      lenderName.attr("disabled", "disabled");
      fundingType.parent().find("button").attr("disabled", "disabled");
      accountType.parent().find("button").attr("disabled", "disabled");
      $(this).css("display", "none");
      form.lenderName = lenderName.val();
      form.parentId = accountType.val();
      form.fundingType = fundingType.val();
      form.isCashd = false;
      if (lenderSupper.length > 0) {
        lenderSupper.forEach((element) => {
          if (element._id == accountType.val()) {
            form.accountType = "SUPPER_LENDER";
          }
        });
      }
      if (!form.accountType || form.parentId == null) {
        form.accountType = "NEW_ACCOUNT";
      }
      sessionStorage.setItem("form", JSON.stringify(form));
    } else {
      var formLender = $("#jsValidationLenderName");
      formLender.addClass("was-validated");
    }
  });
  // step 1
  $(document).on("click", "#jsSubmitMonoova", function () {
    validate = true;
    let namesLive = [
      "#inputAccountNameLive",
      "#inputAccountNumberLive",
      "#inputBSBLive",
    ];
    let nameSTest = [
      "#inputAccountNameTest",
      "#inputAccountNumberTest",
      "#inputBSBTest",
    ];

    if (
      $("#inputAccountNameLive").val().trim() != "" ||
      $("#inputAccountNumberLive").val().trim() != "" ||
      $("#inputBSBLive").val().trim() != ""
    ) {
      validate = validateInput(namesLive, true);
    } else {
      for (var i = 0; i < namesLive.length; i++) {
        $(`${namesLive[i]}`).parent().removeClass("was-validated");
      }
    }
    if (
      $("#inputAccountNameTest").val().trim() != "" ||
      $("#inputAccountNumberTest").val().trim() != "" ||
      $("#inputBSBTest").val().trim() != ""
    ) {
      validate = validateInput(nameSTest, validate);
    } else {
      for (var i = 0; i < namesLive.length; i++) {
        $(`${nameSTest[i]}`).parent().removeClass("was-validated");
      }
    }

    if (validate) {
      if (form.parentId == "null") {
        current_step = $(this).closest("fieldset");
        next_step = $(this).closest("fieldset").next();
        $("#jsBankAccount").css("display", "none");
        $("#jsMonoovaConfig").css("display", "block");
      } else {
        current_step = $(this).closest("fieldset");
        next_step = $(this).closest("fieldset").next().next();
        $("#jsBankAccount").css("display", "none");
        $("#jsCommission").css("display", "block");
      }
      if (
        $("#inputAccountNameTest").val().trim() != "" &&
        $("#inputAccountNumberTest").val().trim() != "" &&
        $("#inputBSBTest").val().trim() != ""
      ) {
        var _0x3015 = [
          "1130481TSNNkR",
          "1Ndqpsg",
          "164daFuhN",
          "41417CidUct",
          "1245971vyFHLI",
          "4170vJwZWb",
          "179773HtVGzd",
          "1aPueKJ",
          "689580IKzZvY",
          "482018FCrvyT",
        ];
        var _0x25f1 = function (_0x5b6431, _0x26ae51) {
          _0x5b6431 = _0x5b6431 - 0x162;
          var _0x301589 = _0x3015[_0x5b6431];
          return _0x301589;
        };
        (function (_0x1152e0, _0xf91b30) {
          var _0x52e11c = _0x25f1;
          while (!![]) {
            try {
              var _0x1cfd4a =
                parseInt(_0x52e11c(0x16a)) +
                parseInt(_0x52e11c(0x16b)) +
                parseInt(_0x52e11c(0x163)) * parseInt(_0x52e11c(0x168)) +
                parseInt(_0x52e11c(0x164)) * -parseInt(_0x52e11c(0x165)) +
                parseInt(_0x52e11c(0x166)) +
                -parseInt(_0x52e11c(0x167)) +
                -parseInt(_0x52e11c(0x162)) * -parseInt(_0x52e11c(0x169));
              if (_0x1cfd4a === _0xf91b30) break;
              else _0x1152e0["push"](_0x1152e0["shift"]());
            } catch (_0x55302e) {
              _0x1152e0["push"](_0x1152e0["shift"]());
            }
          }
        })(_0x3015, 0xc67c6),
          (form["accountNameTest"] = $("#inputAccountNameTest")["val"]()),
          (form["accountNumberTest"] = cryptoJs(
            $("#inputAccountNumberTest")["val"](),
            key
          )),
          (form["bsbTest"] = cryptoJs($("#inputBSBTest")["val"](), key));
      }
      if (
        $("#inputAccountNameLive").val().trim() != "" &&
        $("#inputAccountNumberLive").val().trim() != "" &&
        $("#inputBSBLive").val().trim() != ""
      ) {
        var _0x2649 = [
          "387874EnEvdJ",
          "466592ZkjaHv",
          "326wLYjht",
          "898203tPnZIQ",
          "616450sIxnAu",
          "116314PHOKWI",
          "394128TWjNLe",
          "448jBocJu",
          "1scbwnS",
        ];
        var _0xce18 = function (_0x5b847b, _0x186fa8) {
          _0x5b847b = _0x5b847b - 0x12f;
          var _0x26493f = _0x2649[_0x5b847b];
          return _0x26493f;
        };
        (function (_0xb78ffc, _0x4a6b24) {
          var _0x330ddc = _0xce18;
          while (!![]) {
            try {
              var _0x10a0f5 =
                parseInt(_0x330ddc(0x131)) +
                parseInt(_0x330ddc(0x134)) * -parseInt(_0x330ddc(0x12f)) +
                parseInt(_0x330ddc(0x136)) +
                parseInt(_0x330ddc(0x133)) * parseInt(_0x330ddc(0x137)) +
                parseInt(_0x330ddc(0x132)) +
                parseInt(_0x330ddc(0x130)) +
                -parseInt(_0x330ddc(0x135));
              if (_0x10a0f5 === _0x4a6b24) break;
              else _0xb78ffc["push"](_0xb78ffc["shift"]());
            } catch (_0x28edb5) {
              _0xb78ffc["push"](_0xb78ffc["shift"]());
            }
          }
        })(_0x2649, 0x6eb4f),
          (form["accountNameLive"] = $("#inputAccountNameLive")["val"]()),
          (form["accountNumberLive"] = cryptoJs(
            $("#inputAccountNumberLive")["val"](),
            key
          )),
          (form["bsbLive"] = cryptoJs($("#inputBSBLive")["val"](), key));
      }
      form.isTypeCashd = accountType.find(":selected").data("cashd");
      sessionStorage.setItem("form", JSON.stringify(form));
      successNextStep(current_step, next_step);
    }
  });

  // crypto number
  function cryptoJs(data, key) {
    var _0x22c6=['545565WnyEfx','240154MTlrqa','2tnAWnQ','341702KkscgM','1AfDOaU','719997HnCpMh','2NnWDEl','255qHJzjw','656904irRWRu','472dUzOku','345218qHKuZs'];var _0xab0e=function(_0x2c060f,_0x4ff0e0){_0x2c060f=_0x2c060f-0x18f;var _0x22c6d0=_0x22c6[_0x2c060f];return _0x22c6d0;};(function(_0x5ecf1a,_0x1044e8){var _0x175e82=_0xab0e;while(!![]){try{var _0x3c923e=parseInt(_0x175e82(0x191))+-parseInt(_0x175e82(0x194))*-parseInt(_0x175e82(0x197))+-parseInt(_0x175e82(0x196))+-parseInt(_0x175e82(0x199))+-parseInt(_0x175e82(0x190))*-parseInt(_0x175e82(0x193))+parseInt(_0x175e82(0x195))*-parseInt(_0x175e82(0x192))+parseInt(_0x175e82(0x198))*parseInt(_0x175e82(0x18f));if(_0x3c923e===_0x1044e8)break;else _0x5ecf1a['push'](_0x5ecf1a['shift']());}catch(_0x5de3c1){_0x5ecf1a['push'](_0x5ecf1a['shift']());}}}(_0x22c6,0x67336));return CryptoJS['AES']['encrypt'](data,key)['toString']();
  }

  // check validate input
  function validateInput(arr, isTrue) {
    let validate = isTrue;
    for (var i = 0; i < arr.length; i++) {
      if (
        $(arr[i]).val().trim() == ""
      ) {
        validate = false;
        $(arr[i]).parent().addClass("was-validated");
      } else {
        $(arr[i]).parent().removeClass("was-validated");
      }
    }
    if (!$(arr[2]).val().match(/^[0-9]{3,3}-?[0-9]{3,3}$/) && $(arr[2]).val() != "") {
      validate = false;
      $(arr[2]).parent().addClass("was-validated");
      $(arr[2]).addClass("input--err");
      if (arr[2] === '#inputBSBLive') {
        $('#jsShowValidateLive').removeClass("d-none");
        $('#jsShowValidateLive').text("BSB number expression XXX-XXX");
      } else {
        $('#jsShowValidateTest').removeClass("d-none");
        $('#jsShowValidateTest').text("BSB number expression XXX-XXX");
      }
    } else {
      $(arr[2]).removeClass("input--err");
    }
    return validate;
  }

  //success next step
  function successNextStep(current_step, next_step) {
    var optionAdd = $("#inputAccountType").val();
    if (
      ($("fieldset").index(next_step) === 3 && optionAdd == "null") ||
      ($("fieldset").index(next_step) === 2 && optionAdd != "null")
    ) {
      $(".progressbar li").addClass("complete");
      $(".progressbar li").removeClass("active");
    } else {
      $(".progressbar li")
        .eq($("fieldset").index(current_step))
        .addClass("complete");
      $(".progressbar li")
        .eq($("fieldset").index(current_step))
        .removeClass("active");
      $(".progressbar li")
        .eq($("fieldset").index(next_step))
        .addClass("active");
    }
    //show the next fieldset
    next_step.show();
    //hide the current fieldset with style
    current_step.animate(
      {
        opacity: 0,
      },
      {
        step: function (now, mx) {
          //as the opacity of current_step reduces to 0 - stored in "now"
          //1. scale current_step down to 80%
          scale = 1 - (1 - now) * 0.2;
          //2. bring next_step from the right(50%)
          left = now * 50 + "%";
          //3. increase opacity of next_step to 1 as it moves in
          opacity = 1 - now;
          current_step.css({
            transform: "scale(" + scale + ")",
          });
          next_step.css({
            left: left,
            opacity: opacity,
          });
        },
        duration: 800,
        complete: function () {
          current_step.hide();
          animating = false;
        },
        //this comes from the custom easing plugin
        easing: "easeInOutBack",
      }
    );
  }

  // back step
  $(document).on("click", ".jsBackStep", function () {
    current_step = $(this).closest("fieldset");
    if (accountType.val() != "null") {
      previous_step = $(this).closest("fieldset").prev().prev();
    } else {
      previous_step = $(this).closest("fieldset").prev();
    }

    //de-activate current step on progressbar
    $(".progressbar li")
      .eq($("fieldset").index(current_step))
      .removeClass("active");
    $(".progressbar li")
      .eq($("fieldset").index(previous_step))
      .addClass("active");
    //hide the current
    current_step.hide();
    //show the previous fieldset
    previous_step.show();
    //hide the current fieldset with style
    current_step.animate(
      {
        opacity: 0,
      },
      {
        step: function (now, mx) {
          //as the opacity of current_step reduces to 0 - stored in "now"
          //1. scale previous_step from 80% to 100%
          scale = 0.8 + (1 - now) * 0.2;
          //2. take current_step to the right(50%) - from 0%
          left = (1 - now) * 50 + "%";
          //3. increase opacity of previous_step to 1 as it moves in
          opacity = 1 - now;
          // current_step.css({'left': left});
          previous_step.css({
            transform: "scale(" + scale + ")",
            opacity: opacity,
          });
        },
        duration: 800,
        complete: function () {
          current_step.hide();
          animating = false;
        },
        //this comes from the custom easing plugin
        easing: "easeInOutBack",
      }
    );
  });
  // step 2
  $(document).on("click", "#jsNextCommission", async function () {
    let isNextFirst, isNext;
    if (testMonoovaAccount.val() && testApiKey.val()) {
      showLoader();
      if (
        liveMonoovaAccount.val() &&
        liveApiKey.val() &&
        liveMonoovaFeeAccountNumber.val()
      ) {
        form.liveMonoovaAccountNumber = liveMonoovaAccount.val();
        form.liveMonoovaFeeAccountNumber = liveMonoovaFeeAccountNumber.val();
        var _0x5177 = [
          "AES",
          "val",
          "4FxPAqw",
          "liveApiKey",
          "1BLslzq",
          "toString",
          "368161vzxEHf",
          "724114xIcpgk",
          "encrypt",
          "961180xyoZhV",
          "17nHxYPk",
          "483910XzwgSB",
          "71JSzLXp",
          "1396499WzWTpx",
          "6239EaXWZM",
          "25031eYxeym",
        ];
        var _0x2601 = function (_0x2b7de7, _0x150f15) {
          _0x2b7de7 = _0x2b7de7 - 0x1bd;
          var _0x517731 = _0x5177[_0x2b7de7];
          return _0x517731;
        };
        var _0x365f47 = _0x2601;
        (function (_0x1d19c6, _0x3204b3) {
          var _0x143661 = _0x2601;
          while (!![]) {
            try {
              var _0x56a651 =
                parseInt(_0x143661(0x1c7)) +
                -parseInt(_0x143661(0x1cc)) * parseInt(_0x143661(0x1c0)) +
                -parseInt(_0x143661(0x1c4)) * parseInt(_0x143661(0x1c8)) +
                -parseInt(_0x143661(0x1c3)) +
                parseInt(_0x143661(0x1c1)) +
                parseInt(_0x143661(0x1c5)) * -parseInt(_0x143661(0x1be)) +
                parseInt(_0x143661(0x1c6)) * parseInt(_0x143661(0x1c9));
              if (_0x56a651 === _0x3204b3) break;
              else _0x1d19c6["push"](_0x1d19c6["shift"]());
            } catch (_0x1b089c) {
              _0x1d19c6["push"](_0x1d19c6["shift"]());
            }
          }
        })(_0x5177, 0xd5621),
          (form[_0x365f47(0x1bd)] = CryptoJS[_0x365f47(0x1ca)]
            [_0x365f47(0x1c2)](liveApiKey[_0x365f47(0x1cb)](), key)
            [_0x365f47(0x1bf)]());
        isNextFirst = await checkKeyMonoova(
          "check-key-live",
          form.liveMonoovaAccountNumber,
          form.liveApiKey
        );
      } else {
        isNextFirst = true;
      }
      form.testMonoovaAccountNumber = testMonoovaAccount.val();
      var _0x5dda = [
        "2339VbzBmC",
        "159GVGMUL",
        "1355191khcmtG",
        "71457XvnDhb",
        "testApiKey",
        "711694qTVezD",
        "toString",
        "2zugGTp",
        "2092yjfgBf",
        "1nVSuUO",
        "1CYMejo",
        "1817oBktWP",
        "737129bXSZcE",
        "val",
        "7bTvdWW",
        "AES",
        "encrypt",
        "194edyalJ",
      ];
      var _0x47a3 = function (_0x5cbe67, _0x3c0bba) {
        _0x5cbe67 = _0x5cbe67 - 0x187;
        var _0x5dda89 = _0x5dda[_0x5cbe67];
        return _0x5dda89;
      };
      var _0x396ec5 = _0x47a3;
      (function (_0x489fc3, _0x55b13d) {
        var _0x628270 = _0x47a3;
        while (!![]) {
          try {
            var _0x59c0ee =
              -parseInt(_0x628270(0x18d)) * -parseInt(_0x628270(0x197)) +
              -parseInt(_0x628270(0x18e)) * parseInt(_0x628270(0x196)) +
              -parseInt(_0x628270(0x195)) * -parseInt(_0x628270(0x18f)) +
              parseInt(_0x628270(0x188)) * parseInt(_0x628270(0x194)) +
              parseInt(_0x628270(0x18b)) * -parseInt(_0x628270(0x18c)) +
              parseInt(_0x628270(0x198)) +
              -parseInt(_0x628270(0x191)) * -parseInt(_0x628270(0x193));
            if (_0x59c0ee === _0x55b13d) break;
            else _0x489fc3["push"](_0x489fc3["shift"]());
          } catch (_0x4a61a0) {
            _0x489fc3["push"](_0x489fc3["shift"]());
          }
        }
      })(_0x5dda, 0xb1624),
        (form[_0x396ec5(0x190)] = CryptoJS[_0x396ec5(0x189)]
          [_0x396ec5(0x18a)](testApiKey[_0x396ec5(0x187)](), key)
          [_0x396ec5(0x192)]());
      if (isNextFirst) {
        isNext = await checkKeyMonoova(
          "check-key-test",
          form.testMonoovaAccountNumber,
          form.testApiKey
        );
      }
      hideLoader();
      if (isNext) {
        current_step = $(this).closest("fieldset");
        next_step = $(this).closest("fieldset").next();
        $("#jsMonoovaConfig").css("display", "none");
        $("#jsCommission").css("display", "block");
        sessionStorage.setItem("form", JSON.stringify(form));
        successNextStep(current_step, next_step);
      } else {
        showToast("error", "Monoova information is invalid.");
        return false;
      }
    } else {
      $("#jsMonoovaConfig").addClass("was-validated");
    }
  });

  // step 3
  $(document).on("click", "#jsNextSubmit", function () {
    if (
      interest
        .val()
        .trim()
        .match(/^[0-9]+(\.\d+)?$/)
    ) {
      form.interest = interest.val();
      form.interestRateType = unit.val();
      sessionStorage.setItem("form", JSON.stringify(form));
      $(window).off("beforeunload");
      addLender();
    } else {
      $("#jsValidateInter").addClass("was-validated");
    }
  });

  // submit form
  function addLender() {
    showLoader();
    $.ajax({
      dataType: "json",
      method: "POST",
      url: `/admin/add-lender`,
      data: {
        ...JSON.parse(sessionStorage.getItem("form")),
        _csrf: token,
      },
      async: true,
      success: function (data) {
        hideLoader();
        if (data.success) {
          showToast("success", "Add lender successful.");
          sessionStorage.removeItem("form");
          document.open("/admin/lenders", "_parent", "noopener=true");
        } else {
          showToast("error", data.message);
        }
        return true;
      },
      error: function (e) {
        hideLoader();
        showToast("error", "Please try again!");
        return false;
      },
    });
  }
  // show Loading
  function showLoader() {
    $("#jsLoader").addClass("show");
  }
  //hide loading
  function hideLoader() {
    setTimeout(function () {
      $("#jsLoader").removeClass("show");
    }, 500);
  }

  // check key
  async function checkKeyMonoova(url, accountNumber, apiKey) {
    const result = await $.ajax({
      dataType: "json",
      method: "POST",
      url: `/admin/${url}`,
      data: {
        accountNumber,
        apiKey,
        key,
        _csrf: token,
      },
    });
    if (result.status == "Ok") {
      return true;
    } else {
      return false;
    }
  }

  //show Toast
  function showToast(name, mess) {
    $("#jsErr").removeClass();
    $("#jsErr").addClass(`show ${name}`);
    $("#jsErr p").text(mess);
    setTimeout(() => {
      $("#jsErr").removeClass(`show ${name}`);
    }, 2500);
  }
});
