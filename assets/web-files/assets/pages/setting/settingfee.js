$(document).ready(function () {
  const feeValue = $('input[name="feeValue"]').val(),
    token = $('input[name="_csrf"]').val(),
    key = $('input[name="key"]').val(),
    setting = JSON.parse($('input[name="setting"]').val()),
    feeType = $('input[name="feeType"]').val();
  //
  convertBankAccount('bank_account_number', setting.bank_account_number_encryption);
  convertBankAccount('bank_bsb_number', setting.bank_bsb_number_encryption);

  function convertBankAccount(name, params) {
    let value = '';
    var _0x2dc1 = ['decrypt', '888435cCBCoP', '651589UgJgTt', '1186535zezxaW', '1GYwRuJ', '388845OsXYzI', '1094293RnlNWN', 'Utf8', 'enc', '1138rGPYLn', '503ZsMCWs', 'AES', '1725481TAElGm', 'toString'];
    var _0x214e = function (_0x5d65c6, _0x4cdaed) {
      _0x5d65c6 = _0x5d65c6 - 0x12e;
      var _0x2dc1a1 = _0x2dc1[_0x5d65c6];
      return _0x2dc1a1;
    };
    var _0x311504 = _0x214e;
    (function (_0x11f7f3, _0x508e32) {
      var _0x1a10a0 = _0x214e;
      while (!![]) {
        try {
          var _0x16707a = parseInt(_0x1a10a0(0x130)) + -parseInt(_0x1a10a0(0x132)) * parseInt(_0x1a10a0(0x131)) + parseInt(_0x1a10a0(0x12e)) + -parseInt(_0x1a10a0(0x139)) + -parseInt(_0x1a10a0(0x136)) * -parseInt(_0x1a10a0(0x137)) + parseInt(_0x1a10a0(0x133)) + -parseInt(_0x1a10a0(0x12f));
          if (_0x16707a === _0x508e32) break;
          else _0x11f7f3['push'](_0x11f7f3['shift']());
        } catch (_0xac59f6) {
          _0x11f7f3['push'](_0x11f7f3['shift']());
        }
      }
    }(_0x2dc1, 0xee392));
    if (params) {
      var bytes = CryptoJS[_0x311504(0x138)][_0x311504(0x13b)](params, key);
      value = bytes[_0x311504(0x13a)](CryptoJS[_0x311504(0x135)][_0x311504(0x134)]);
    } else value = setting[name];
    $(`input[name="${name}"]`).val(value);
  }
  //detect select change unit 
  $('#selectedUnit').on('change', function () {
    if (this.value == feeType) {
      $('input[name="transaction_fee"]').val(feeValue);
    } else {
      if (this.value == 'DOLLAR') {
        $('input[name="transaction_fee"]').val(5);
      } else {
        $('input[name="transaction_fee"]').val(2.75);
      }
    }
  });

  let form = document.getElementById('jsForm');
  form.onsubmit = function (e) {
    e.preventDefault();
    const modal = document.getElementById('jsModal');
    const no = document.getElementById('jsNo');
    const yes = document.getElementById('jsYes');
    modal.classList.add('show');
    no.onclick = function () {
      modal.classList.remove('show');
    }
    yes.onclick = function () {
      form.submit();
      modal.classList.remove('show');
    }
  };

  $('#jsSubmit').click((e) => {
    showLoader();
    if (($('input[name="bank_account_number"]').val()).match(/^[0-9]{9,9}$/)) {
      $('input[name="bank_account_number"]').css('border-color', '#ccc');
      const _0x3a06 = ['50QiDJYB', 'encrypt', '700JOFOHQ', '215795SKzmIY', '1198HkydiU', 'input[name=\x22bank_account_number\x22]', '1cBBVsQ', '10838AqdXEi', 'toString', '47ElwRqS', 'input[name=\x22bank_bsb_number\x22]', '1xSyEYD', '267979TvwhXZ', 'AES', 'val', '166517rqnbzT', '187HZmDte', '1294JUakEh'];
      const _0x2a60 = function (_0x829726, _0x2970cb) {
        _0x829726 = _0x829726 - 0x100;
        let _0x3a0600 = _0x3a06[_0x829726];
        return _0x3a0600;
      };
      const _0x390b83 = _0x2a60;
      (function (_0x125b6d, _0x2272c8) {
        const _0x14173c = _0x2a60;
        while (!![]) {
          try {
            const _0x11fab3 = -parseInt(_0x14173c(0x10f)) * -parseInt(_0x14173c(0x107)) + -parseInt(_0x14173c(0x10d)) + -parseInt(_0x14173c(0x101)) * -parseInt(_0x14173c(0x104)) + parseInt(_0x14173c(0x105)) + parseInt(_0x14173c(0x100)) * -parseInt(_0x14173c(0x110)) + parseInt(_0x14173c(0x102)) * -parseInt(_0x14173c(0x10e)) + -parseInt(_0x14173c(0x10a)) * -parseInt(_0x14173c(0x109));
            if (_0x11fab3 === _0x2272c8) break;
            else _0x125b6d['push'](_0x125b6d['shift']());
          } catch (_0x423d88) {
            _0x125b6d['push'](_0x125b6d['shift']());
          }
        }
      }(_0x3a06, 0x1fb5f));
      let bank_account_number = CryptoJS[_0x390b83(0x10b)][_0x390b83(0x111)]($(_0x390b83(0x103))[_0x390b83(0x10c)](), key)[_0x390b83(0x106)](),
        bank_bsb_number = CryptoJS[_0x390b83(0x10b)][_0x390b83(0x111)]($(_0x390b83(0x108))[_0x390b83(0x10c)](), key)['toString']();
      $.ajax({
        dataType: 'json',
        method: "POST",
        url: `/admin/settings`,
        data: {
          bank_name: $('input[name="bank_name"]').val(),
          bank_account_name: $('input[name="bank_account_name"]').val(),
          bank_account_number,
          bank_bsb_number,
          bank_user_id: $('input[name="bank_user_id"]').val(),
          bank_apca_id: $('input[name="bank_apca_id"]').val(),
          bank_description: $('input[name="bank_description"]').val(),
          bank_company_name: $('input[name="bank_company_name"]').val(),
          "_csrf": token
        },
        async: true,
        success: function (data) {
          hidenLoader();
          if (data.success) {
            showToast('success', "Setting successful.")
          } else {
            showToast('error', "Setting failed.")
          }
          return true;
        },
        error: function () {
          hidenLoader();
          showToast('error', "Please try again!")
          return false;
        }
      });
    } else {
      $('input[name="bank_account_number"]').css('border-color', 'red');
    }
  })

  $('#jsFormRate').submit((e) => {
    e.preventDefault();
    var value = $('input[name="frequency_transaction_of_rate"]').val()
    if (value.match(/^(?:[2-9]|\d\d\d*)$/)) {
      e.target.submit();
    } else {
      $('#jsRateErr').text('Rate must be greater than 1 and and be an integer.');
    }
  });

  // show Loading
  function showLoader() {
    $('#jsLoader').addClass('show');
  }
  //hiden loading
  function hidenLoader() {
    setTimeout(function () {
      $('#jsLoader').removeClass('show');
    }, 500);
  }

  //show Toast
  function showToast(name, mess) {
    $('#jsErr').removeClass();
    $('#jsErr').addClass(`show ${name}`);
    $('#jsErr p').text(mess);
    setTimeout(() => {
      $('#jsErr').removeClass(`show ${name}`);
    }, 2500);
  }

});