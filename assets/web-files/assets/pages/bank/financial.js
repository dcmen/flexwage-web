$(document).ready(function () {
  const token = $('input[name="_csrf"]').val();
  let searchKey = '',
    financial, actionText;
  const companyId = $("input[name='_id']").val();
  let key = $('input[name="key"]').val();
  // convert bank number
  let oldLenderId = $('#oldLenderId').val(), newLenderId = '';

  const financeTable = $('#financeTable').DataTable({
    'searching': false,
    'processing': true,
    "info": true,
    "paging": true,
    'serverSide': true,
    'lengthChange': true,
    "ordering": false,
    "language": {
      'loadingRecords': '&nbsp;',
      'processing': '<div class="spinner"></div>'
    },
    'ajax': {
      'type': 'POST',
      'url': '/admin/get-lenders-company',
      'data': function (d) {
        var info = $('#financeTable').DataTable().page.info();
            d.searchKey = searchKey;
            d.page = info.page;
            d.pageSize = info.length;
            d._csrf = token;
        },
        'dataSrc': 'result',
        'dataFilter': function (data) {
            var json = $.parseJSON(data);
            var info = $('#financeTable').DataTable().page.info();
            if (info.page == 0) {
                total = json.totalItems;
            }
            json.recordsFiltered = total;
            json.recordsTotal = total;
            return JSON.stringify(json);
        }
    },
    'columns': [{
        "data": null,
        "render": function () {
          return `<a href="#" class="btn btn-mini accordion-toggle md-details-control">&nbsp
                  <i class="icofont icofont-plus-circle"></i>`
        }
      },
      {
        "data": "lender_name",
        "render": function (data) {
          return data;
        }
      },
      {
        "data": "funding_type",
        "render": function (data) {
          let fundingTextFormat;
          switch (data) {
            case 'SELF_FINANCED':
              fundingTextFormat = "Self financed";
              break;
            case 'EXTERNAL_FINANCED':
              fundingTextFormat = "External financed";
              break;
            case 'CASHD_FINANCED':
              fundingTextFormat = "CashD financed";
              break;
            case "SELF_CASHD_FINANCED":
              fundingTextFormat = "Self & CashD financed";
              break;
          };
          return fundingTextFormat;
        }
      },
      {
        "data": null,
        "render": function (data) {
          return 'Monoova';
        }
      },
      {
        "data": { test_receivables_account_name:  "test_receivables_account_name", live_receivables_account_name: "live_receivables_account_name" },
        "render": function (data) {
            let value = $('#jsmonoova').is(':checked') ? data.live_receivables_account_name : data.test_receivables_account_name;
            return value ? value : "N/A"
        }
    },
    {
        "data": { test_receivables_account_bsb: "test_receivables_account_bsb", live_receivables_account_bsb: "live_receivables_account_bsb"},
        "render": function (data) {
            let value = $('#jsmonoova').is(':checked') ? data.live_receivables_account_bsb : data.test_receivables_account_bsb;
            var _0x4507 = ['652083pThnwg', '15569GFQnDb', '\x20N/A', '528783uUiGVS', '48WWBdoI', '1CjQXwL', '142519uIKQWm', 'enc', 'Utf8', 'decrypt', 'toString', '236725pPLSWH', 'AES', '117807lsvHpA', '481361mJoiKu'];
            var _0x3b8e = function (_0x3c3c77, _0x5324a4) {
                _0x3c3c77 = _0x3c3c77 - 0xff;
                var _0x450787 = _0x4507[_0x3c3c77];
                return _0x450787;
            };
            var _0x4a93c6 = _0x3b8e;
            (function (_0x1b9f64, _0x231fdb) {
                var _0xa70236 = _0x3b8e;
                while (!![]) {
                    try {
                        var _0x2fe166 = -parseInt(_0xa70236(0x103)) + parseInt(_0xa70236(0x105)) * parseInt(_0xa70236(0x106)) + -parseInt(_0xa70236(0xff)) + parseInt(_0xa70236(0x100)) + -parseInt(_0xa70236(0x101)) * -parseInt(_0xa70236(0x104)) + parseInt(_0xa70236(0x10d)) + -parseInt(_0xa70236(0x10b));
                        if (_0x2fe166 === _0x231fdb) break;
                        else _0x1b9f64['push'](_0x1b9f64['shift']());
                    } catch (_0x423da8) {
                        _0x1b9f64['push'](_0x1b9f64['shift']());
                    }
                }
            }(_0x4507, 0x64cb4));
            if (value) {
                var bytes = CryptoJS[_0x4a93c6(0x10c)][_0x4a93c6(0x109)](value, key),
                    decryptedData = bytes[_0x4a93c6(0x10a)](CryptoJS[_0x4a93c6(0x107)][_0x4a93c6(0x108)]);
                return decryptedData;
            }
            return _0x4a93c6(0x102);
        }
    },
    {
        "data": {test_receivables_account_number: "test_receivables_account_number", live_receivables_account_number: "live_receivables_account_number"},
        "render": function (data) {
            let value = $('#jsmonoova').is(':checked') ? data.live_receivables_account_number : data.test_receivables_account_number;
            var _0x5aec = ['Utf8', '816722jNjQWo', '3tUQQIL', 'enc', 'AES', '1406996Hskbkr', '\x20N/A', '2563rUcvbK', '239523ZNiozI', '880620DOCNlA', '510913RchquS', '353yJFfPf', '876240aCvDyM', 'decrypt', '3bnQmHQ'];
            var _0x156e = function (_0x87716c, _0x3e970a) {
                _0x87716c = _0x87716c - 0x65;
                var _0x5aec10 = _0x5aec[_0x87716c];
                return _0x5aec10;
            };
            var _0x5ca903 = _0x156e;
            (function (_0x5da4a2, _0x3a5f51) {
                var _0xe9354a = _0x156e;
                while (!![]) {
                    try {
                        var _0x423381 = parseInt(_0xe9354a(0x69)) * parseInt(_0xe9354a(0x65)) + parseInt(_0xe9354a(0x67)) + parseInt(_0xe9354a(0x66)) * parseInt(_0xe9354a(0x6f)) + parseInt(_0xe9354a(0x6e)) + parseInt(_0xe9354a(0x68)) + parseInt(_0xe9354a(0x6a)) + parseInt(_0xe9354a(0x72)) * -parseInt(_0xe9354a(0x6c));
                        if (_0x423381 === _0x3a5f51) break;
                        else _0x5da4a2['push'](_0x5da4a2['shift']());
                    } catch (_0x2e1433) {
                        _0x5da4a2['push'](_0x5da4a2['shift']());
                    }
                }
            }(_0x5aec, 0x76d9f));
            if (value) {
                var bytes = CryptoJS[_0x5ca903(0x71)][_0x5ca903(0x6b)](value, key),
                    decryptedData = bytes['toString'](CryptoJS[_0x5ca903(0x70)][_0x5ca903(0x6d)]);
                return decryptedData;
            }
            return _0x5ca903(0x73);
        }
    },
      {
        "data": "total_amount",
        "render": function (data) {
          return new Intl.NumberFormat(
            'en-US', {
              style: 'currency',
              currency: 'USD'
            }
          ).format(
            data
          )
        }
      },
      {
        "data": "total_deduction",
        "render": function (data) {
          return new Intl.NumberFormat(
            'en-US', {
              style: 'currency',
              currency: 'USD'
            }
          ).format(
            data
          )
        }
      },
      {
        "data": {
          total_amount: "total_amount",
          total_deduction: "total_deduction"
        },
        "render": function (data) {
          return new Intl.NumberFormat(
            'en-US', {
              style: 'currency',
              currency: 'USD'
            }
          ).format(
            (data.total_amount - data.total_deduction)
          )
        }
      },
      {
        "data": "start_date",
        "render": function (data) {
          return moment(data).format('DD/MM/YYYY hh:mm:ss A');
        }
      },
      {
        "data": null,
        "render": function (data, type, row) {
          let interestValue;
          if (row.interest_rate_type == 'PERCENT') {
            interestValue = `${row.interest_rate_value}%`
          } else {
            interestValue = new Intl.NumberFormat(
              'en-US', {
                style: 'currency',
                currency: 'USD'
              }
            ).format(
              row.interest_rate_value
            )
          }
          return interestValue;
        }
      }
    ]
  });

  $('.btn-addNewFinancial').on('click', () => {
    actionText = 'add';
  });

  $('.btn-editFinancial').on('click', () => {
    actionText = 'edit';
  });

  $('#financeTable').on('click', '.md-details-control', function () {
    const tr = $(this).closest('tr');
    const row = financeTable.row(tr);
    financial = row.data();
    newLenderId = row.data()._id;
    //show popup confirm
    $('#jsConfirmAddFinancial').modal('show');
    $('.financial-name').html(row.data().lender_name);
  });
  //add new data to financial
  $('.btn-confirm').on('click', () => {
    showLoading();
    updateLenderLinkCompany();
  });

  function setFooterTable() {
    let divLength = $(`#financeTable_wrapper .row:first-child div:nth-child(1) #financeTable_length`).addClass('pagination--custom');
    $(`#financeTable_wrapper .row:last-child div`).first().append(divLength);
  }

  $('.btn-updateFinancial').on('click', () => {
    $('.action-text').html('add');
    $('#jsShowContentPage').addClass('hide');
    $('#jsDivFinancial').removeClass('hide');
    financeTable.ajax.reload();
    setFooterTable();
  });

  $('.btn-removeFinancial').on('click', () => {
    actionText = 'remove';
    const lenderName = $('#financial tbody tr td:first-child').html();
    $('.action-text').html('remove');
    $('.financial-name').html(lenderName);
    $('#jsConfirmAddFinancial').modal('show');
  });

  $('.jsBack').on('click', () => {
    backContent();
  });

  function updateLenderLinkCompany() {
    $.ajax({
      dataType: 'Text',
      url: `/admin/update-lender-link-company`,
      async: true,
      method: "post",
      data: {
        _csrf: token,
        newLenderId: newLenderId,
        oldLenderId: oldLenderId,
        companyId: companyId,
        actionText: actionText
      },
      statusCode: {
        200: function() {
          financeTable.ajax.reload();
          //add action
          if (actionText != 'remove') {
            $('#financial').removeClass('hiden');

            oldLenderId = financial._id;
            //remove row recent
            $('#financial tbody tr').remove();

            $('#liveApiKey').val(financial.live_api_key);
            $('#oldLenderId').val(financial._id);

            let fundingTextFormat, interestValue;
            //format funding_type
            switch (financial.funding_type) {
              case 'SELF_FINANCED':
                fundingTextFormat = "Self financed";
                break;
              case 'EXTERNAL_FINANCED':
                fundingTextFormat = "External financed";
                break;
              case 'CASHD_FINANCED':
                fundingTextFormat = "CashD financed";
                break;
              case "SELF_CASHD_FINANCED":
                fundingTextFormat = "Self & CashD financed";
                break;
            };
            //format interest rate
            if(financial.interest_rate_type == 'PERCENT') {
              interestValue = `${financial.interest_rate_value}%`;
            } else {
              interestValue = interestValue = new Intl.NumberFormat(
                'en-US', {
                  style: 'currency',
                  currency: 'USD'
                }
              ).format(
                financial.interest_rate_value
              )
            }
            financialLink.ajax.reload();
            backContent();
            $('#financial, .group-btn-update').removeClass('hiden');
            $('.btn-addNewFinancial').addClass('hiden');
            $('button.btn-sync-monoova').removeClass('hiden');
          } else {
            //remove action
            $('#financial, .group-btn-update').addClass('hiden');
            $('.btn-addNewFinancial').removeClass('hiden');
            $('button.btn-sync-monoova').addClass('hiden');
            $('#liveApiKey').val('');
            $('#oldLenderId').val('');
          }
          showToast('success', `${actionText == 'remove' ? 'Removed' : (actionText == 'add' ? 'Added' : 'Edited')} lender successfully.`);
          $('#jsConfirmAddFinancial').modal('hide');
          hidenLoading();
        },
        400: function() {
          showToast('error', 'Lender existed');
          $('#jsConfirmAddFinancial').modal('hide');
          hidenLoading();
        },
        500: function () {
          showToast('error', 'Can not connect to server. Please try again.');
          $('#jsConfirmAddFinancial').modal('hide');
          hidenLoading();
        }
      }
    });
  }

  function decryptString(data, key) {
    var _0x250a = ['98785RqiaKk', '3laEfkv', '32361XkzPgx', 'AES', '430290vezPjz', 'Utf8', 'enc', 'toString', '656606CPeoNO', '161212PlcxNg', '54557USGpfX', '73121WIyKCZ', '12xyzSAz', '1UEcCnV', 'decrypt'];
    var _0x119d = function (_0x54d315, _0x239152) {
      _0x54d315 = _0x54d315 - 0x100;
      var _0x250a7d = _0x250a[_0x54d315];
      return _0x250a7d;
    };
    var _0x469b73 = _0x119d;
    (function (_0x47075b, _0x268861) {
      var _0x314cba = _0x119d;
      while (!![]) {
        try {
          var _0xac991d = parseInt(_0x314cba(0x105)) * -parseInt(_0x314cba(0x10b)) + -parseInt(_0x314cba(0x10a)) + -parseInt(_0x314cba(0x104)) + parseInt(_0x314cba(0x107)) * parseInt(_0x314cba(0x10c)) + -parseInt(_0x314cba(0x10e)) + -parseInt(_0x314cba(0x108)) * -parseInt(_0x314cba(0x106)) + parseInt(_0x314cba(0x103));
          if (_0xac991d === _0x268861) break;
          else _0x47075b['push'](_0x47075b['shift']());
        } catch (_0x2367bd) {
          _0x47075b['push'](_0x47075b['shift']());
        }
      }
    }(_0x250a, 0x407a5));
    var bytes = CryptoJS[_0x469b73(0x10d)][_0x469b73(0x109)](data, key),
      originalText = bytes[_0x469b73(0x102)](CryptoJS[_0x469b73(0x101)][_0x469b73(0x100)]);
    return originalText;
  }

  function backContent() {
    $('#jsShowContentPage').removeClass('hide');
    $('#jsDivFinancial').addClass('hide');
  }
});