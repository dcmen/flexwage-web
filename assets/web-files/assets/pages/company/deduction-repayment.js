$(document).ready(function () {
  let banksJson = $('input[name="banks"]').val();
  let bankId = $('input[name="directDebitFormBankId"]').val();
  const key = $('input[name="key"]').val();
  const token = $('input[name="_csrf"]').val();
  let banks;
  try {
    banks = JSON.parse(banksJson);
  } catch (error) {
    console.log(err);
  }
  if (banks) {
    renderSelectBank(banks, bankId);
  } else {
    $('.jsEmptyBank').removeClass('hide');
  }

  $('select[name="chooseSenderBank"]').on("change", function() {
    let id = $(this).val();
    let parent = $(this).parent().parent().find('input[name="bankName"]');
    banks.forEach(bank => {
      if (id === bank._id.toString()) {
        let value = decryptString(bank.bank_bsb_number_encryption);
        $(this).parent().parent().find('input[name="nameOnAccount"]').val(bank.bank_account_name);
        $(this).parent().parent().find('input[name="bsb"]').val(value);
        $(this).parent().parent().find('input[name="accountNumber"]').val(decryptString(bank.bank_account_number_encryption));
        formatBSB(value, parent);
      }
    });
  });

  $(document).on("keydown", 'input[name="nameOnAccount"], input[name="bsb"], input[name="accountNumber"]', function() {
    $(this).parent().parent().find('select[name="chooseSenderBank"]').val('0');
  });

  function renderSelectBank(banks, bankId) {
    if (banks) {
      let html = `<option style="font-style: italic;" value="0">
        Choose bank account
      </option>`;
      for (let index = 0; index < banks.length; index++) {
        const bank = banks[index];
        let string = `
        <option data-name="${bank.bank_account_name}" value="${bank._id}" ${bank._id.toString() === bankId ? "selected" : ""}>
          ${bank.bank_account_name} ${bank.is_from_other_system ? " (payroll system)" : " (user)"}
        </option>
        `;
        html = html + string;
      }
      $('select[name="chooseSenderBank"]').html(html);
    }
  }

  function decryptString(text) {
    var bytes = CryptoJS.AES.decrypt(text, key);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  }

  $('input[name="bsb"]').on('blur, change', function (event) {
    let value = $(this).val();
    let parent = $(this).parent().parent().find('input[name="bankName"]');
    formatBSB(value, parent);
  });

  function formatBSB(value, parent) {
    if (value.match(/^\d{3}-?\d{3}$/)) {
      if (value.indexOf('-') !== -1) {
          findBSB(value, parent);
      } else {
          let position = 3;
          let result = value.slice(0, position )  + "-" + value.slice(3) ;
          findBSB(result, parent);
          parent.parent().parent().find('input[name="bsb"]').val(result);
      }
    } else {
      parent.prop('readonly', false);
      parent.val("");
    }
  }

  function findBSB(bsbNumber, parent) {
    console.log(parent);
      $.ajax({
          dataType: "json",
          method: "GET",
          url: `/bsb/australia?_csrf=${token}&bsb=${bsbNumber}`,
          success: function (responsive) {
              if (responsive.result?.length > 0) {
                parent.prop('readonly', true);
                parent.val(responsive.result[0].fi_code);
              } else {
                parent.prop('readonly', false);
                parent.val("");
              }
          },
          error: function () {
              return false;
          },
      });
  }

  $("#cancel-setup-direct-debit").click(function () {
    $(this).parent().parent().find('form.formDirectDebit')[0].reset();
    let bsb = $(this).parent().parent().find('input[name="bsb"]');
    bsb.val(decryptString(bsb.val()));
    let account_number = $(this).parent().parent().find('input[name="accountNumber"]');
    account_number.val(decryptString(account_number.val()));
  });

});