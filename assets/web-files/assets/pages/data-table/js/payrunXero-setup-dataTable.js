$(document).ready(function() {
  const token = $('input[name="_csrf"]').val();
const companyId = $("input[name='_id']").val(); 
let accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');
const tenantId = localStorage.getItem('tenantId');
const role = $('input[name="role"]').val();
let searchKey = "";
let pageSize = 10;
let totalPageLG = 0;
let totalItemLG = 0;
let totalPageDe = 0;
let totalItemDe = 0;
let page = 0;
let checkStatus, accountID, deductionTypeID, mode;

const glAccountsTable = $('#glAccountsTable').DataTable({
  "paging": true,
  "ordering": false,
  "lengthChange": true,
  'pageLength': pageSize,
  "info": true,
  "searching": false,
  'serverSide': true,
  'processing': true,
  "language": {
    'loadingRecords': '&nbsp;',
    'processing': '<div class="spinner"></div>'
  },
  'ajax': {
    'type': 'POST',
    'url': `/get-accounts`,
    'data': function (d) {
      let info = $('#glAccountsTable').DataTable().page.info();
      d.companyId = companyId;
      d.page = info.page;
      d.pageSize =  info.length;
      d._csrf = token;
      d.searchKey = searchKey; 
    },
    'dataSrc': 'result',
    'dataFilter': function (data) {
      var json = $.parseJSON(data);
      json.recordsTotal = json.totalItem;
      json.recordsFiltered = json.totalItem;
      totalPageLG = json.totalPage;
      totalItemLG = json.totalItem;
      return JSON.stringify(json);
    }
  },
  'columns': [
    { "data": "Code" },
    { "data": "Name" },
    { "data": "Type" },
    { "data": "xero_tax_info.name" },
    {
      "data": null,
      "render": function(data, type, row) {
        return `<a id="btnEditAccount_${row._id}"
            style="font-size: 13px;position: relative" class="btn btn-mini btn-outline-warning edit-detail accordion-toggle ${role != 'Admin' && role != 'Supervisor' ? '' : 'disabled' }">
            <i class="icofont icofont-edit-alt"></i>
            <i class="icofont icofont-ui-block icon-block-custom ${role == 'Admin' || role == 'Supervisor' ? '' : 'hiden'}"></i>
          </a>`
      }
    }
  ]
});

const deductionCategoryTable = $('#deductionCategoryTable').DataTable({
  "paging": true,
  "ordering": false,
  "lengthChange": true,
  'pageLength': pageSize,
  "info": true,
  "searching": false,
  'serverSide': true,
  'processing': true,
  "language": {
    'loadingRecords': '&nbsp;',
    'processing': '<div class="spinner"></div>'
  },
  'ajax': {
    'type': 'POST',
    'url': `/get-deduction-category`,
    'data': function (d) {
      let info = $('#deductionCategoryTable').DataTable().page.info();
      d.companyId = companyId;
      d.page =  info.page;
      d.pageSize =  info.length;
      d._csrf = token;
      d.searchKey = searchKey;
    },
    'dataSrc': 'result',
    'dataFilter': function (data) {
      var json = $.parseJSON(data);
      json.recordsTotal = json.totalItem;
      json.recordsFiltered = json.totalItem;
      totalPageDe = json.totalPage;
      totalItemDe = json.totalItem;
      return JSON.stringify(json);
    }
  },
  'columns': [
    { "data": "Name" },
    { "data": "DeductionCategory" },
    { "data": "AccountCode" },
    { "data": "ReducesTax",
      "render": function(data) {
        return data ? 'Yes' : 'No';
      }
    },
    { "data": "ReducesSuper",
      "render": function(data) {
        return data ? 'Yes' : 'No';
      }
    },
    { "data": "IsExemptFromW1",
      "render": function(data) {
        return data ? 'Yes' : 'No';
      }
    },
    {
      "data": null,
      "render": function(data, type, row) {
        return `<a id="btnEditCate_${row._id}"
            style="font-size: 13px;position: relative" class="btn btn-mini btn-outline-warning edit-detail accordion-toggle ${role != 'Admin' && role != 'Supervisor' ? '' : 'disabled' }">
            <i class="icofont icofont-edit-alt"></i>
            <i class="icofont icofont-ui-block icon-block-custom ${role == 'Admin' || role == 'Supervisor' ? '' : 'hiden'}"></i>
          </a>`
      }
    }
  ]
});

if (role != 'Admin' && role != 'Supervisor') {
  //open modal add new account
  $('.btn-addNewAccount').click(()=> {
    //reset form
    $('input[name="accountCode"]').val('');
    $('input[name="accountName"]').val('');
    $('input[name="accountDescription"]').val('');
    $('input[name="ShowInExpenseClaims"]').prop('checked', false);
    $('input[name="EnablePaymentsToAccount"]').prop('checked', false);
    $('input[name="AddToWatchlist"]').prop('checked', false);
    $('.save-newAccount').addClass('disabled');
    //open modal
    $('#jsModalAddNewGLAccount').modal({
      backdrop: false,
      show: true,
      keyboard: false
    });
    $('#jsModalAddNewGLAccount .modal-title').html('Add New Account');
    checkStatus = 'add';
  });
  //open modal add new category
  $('.btn-addNewCategory').click(()=> {
    //reset form
    $('input[name="deductionName"]').val('');
    $('#deductionAccount').val('default');
    $('input[name="ReducesTax"]').prop('checked', false);
    $('input[name="ReducesSuper"]').prop('checked', false);
    $('input[name="IsExemptFromW1"]').prop('checked', false);
    $('.save-newDeductionCate').addClass('disabled');
    //open modal
    $('#jsModalAddNewDeductionCate').modal({
      backdrop: false,
      show: true,
      keyboard: false
    });
    $('#jsModalAddNewDeductionCate .modal-title').html('Add New Deduction');
    checkStatus = 'add';
  });

  //detect modal edit account
  $('#glAccountsTable').on('click', 'a.edit-detail', function () {
    var tr = $(this).closest('tr');
    var row = glAccountsTable.row( tr );
    let data = row.data();
    //add data to form
    $('input[name="accountCode"]').val(data.Code);
    $('input[name="accountName"]').val(data.Name);
    $('#accountType').val(data.Type);
    $('input[name="accountDescription"]').val(data.Description);
    data.ShowInExpenseClaims ? $('input[name="ShowInExpenseClaims"]').prop('checked', true) : $('input[name="ShowInExpenseClaims"]').prop('checked', false);
    data.EnablePaymentsToAccount ? $('input[name="EnablePaymentsToAccount"]').prop('checked', true) : $('input[name="EnablePaymentsToAccount"]').prop('checked', false);
    data.AddToWatchlist ? $('input[name="AddToWatchlist"]').prop('checked', true) : $('input[name="AddToWatchlist"]').prop('checked', false);
    $('#accountTax').val(data.xero_tax_info.type)
    //show modal
    $('#jsModalAddNewGLAccount').modal("show");
    $('.save-newAccount').removeClass('disabled');
    $('#jsModalAddNewGLAccount .modal-title').html('Edit Account');

    checkStatus = 'edit';
    accountID = data.AccountID;
  });
  //detect modal edit category
  $('#deductionCategoryTable').on('click', 'a.edit-detail', function () {
    var tr = $(this).closest('tr');
    var row = deductionCategoryTable.row( tr );
    let data = row.data();
    //add data to form
    $('#deductionAccount').val(data.AccountCode);
    $('input[name="deductionName"]').val(data.Name);
    data.ReducesTax ? $('input[name="ReducesTax"]').prop('checked', true) : $('input[name="ReducesTax"]').prop('checked', false);
    data.ReducesSuper ? $('input[name="ReducesSuper"]').prop('checked', true) : $('input[name="ReducesSuper"]').prop('checked', false);
    data.IsExemptFromW1 ? $('input[name="IsExemptFromW1"]').prop('checked', true) : $('input[name="IsExemptFromW1"]').prop('checked', false);
    //show modal
    $('#jsModalAddNewDeductionCate').modal("show");
    $('.save-newDeductionCate').removeClass('disabled');
    $('#jsModalAddNewDeductionCate .modal-title').html('Edit Deduction');

    checkStatus = 'edit';
    deductionTypeID = data.DeductionTypeID;
  });
}
//detect event save new account
$('.save-newAccount').click(() => {
  if ($('.save-newAccount').hasClass('disabled')) return;
  //body new account
  const bodyAccount = {
    "Code": $('input[name="accountCode"]').val(),
    "Name": $('input[name="accountName"]').val(),
    "Type": $('#accountType').val(),
    "Description": $('input[name="accountDescription"]').val(),
    "ShowInExpenseClaims": $('input[name="ShowInExpenseClaims"]').is(':checked'),
    "EnablePaymentsToAccount": $('input[name="EnablePaymentsToAccount"]').is(':checked'),
    "AddToWatchlist": $('input[name="AddToWatchlist"]').is(':checked'),
    "TaxType": $('#accountTax').val()
  };
  if (checkStatus == 'add') {
    bodyAccount.Status = 'ACTIVE';
  } else {
    bodyAccount.AccountID = accountID;
  }
  showLoading();
  callApiCreateAccount(bodyAccount);
});

//detect event save new category
$('.save-newDeductionCate').click(() => {
  if ($('.save-newDeductionCate').hasClass('disabled')) return;
  const valDeductionAccount = $('#deductionAccount').val();
  // const indexBetweenString = valDeductionAccount.search(':');
  // const accountCode= valDeductionAccount.slice(0, indexBetweenString);
  // const deductionCategory = valDeductionAccount.slice(indexBetweenString + 1);
  //body category
  const bodyCategory = {
    "DeductionTypes": [
      {
        "DeductionCategory": "NONE",
        "Name": $('input[name="deductionName"]').val(),
        "AccountCode": valDeductionAccount,
        "ReducesTax": $('input[name="ReducesTax"]').is(':checked'),
        "ReducesSuper": $('input[name="ReducesSuper"]').is(':checked'),
        "IsExemptFromW1": $('input[name="IsExemptFromW1"]').is(':checked'),
        "CurrentRecord": true
      }
    ]
  }
  if (checkStatus == 'edit') bodyCategory.DeductionTypes[0].DeductionTypeID = deductionTypeID;
  showLoading();
  callApiCreateDeductionCate(bodyCategory);
});

$(`#jsModalAddNewGLAccount input[name="accountCode"],
  #jsModalAddNewGLAccount input[name="accountName"]`)
  .on('input', function() {
    const $inputs = $('#jsModalAddNewGLAccount :input');
    let values = {};
    $inputs.each(function () {
        values[this.name] = $(this).val();
    });
    if (values.accountCode && values.accountName) {
      $('.save-newAccount').removeClass('disabled');
    } else {
      $('.save-newAccount').addClass('disabled');
    }
});

$(`#jsModalAddNewDeductionCate input[name="deductionName"]`).on('input', function() {
  checkInputValue();
})
$('#deductionAccount').on('change', function() {
  checkInputValue();
});

function callApiCreateAccount(bodyAccount) {
  $.ajax({
    dataType: 'json',
    method: 'POST',
    url: '/add-new-account',
    data: {
      accToken: accessToken,
      companyId: companyId,
      tenantId: tenantId,
      checkStatus: checkStatus,
      data: JSON.stringify(bodyAccount),
      '_csrf': token
    },
    success: function(data) {
      if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
        loginAgain();
        return;
      }
      if (data.status != 200 && data.result.Elements.length > 0) {
        data.result.Elements[0].ValidationErrors.forEach((error, index) => {
          showToast('error', error.Message, `#jsErr${index}`);
        });
        hidenLoading();
      } else if (data.result && data.result.Title == "Unauthorized") {
        getAccesstokenXeroFromRefreshToken('account');
      } else {
        $('#jsModalAddNewGLAccount').modal('hide');
        glAccountsTable.ajax.reload();
        showToast('success', `${checkStatus}ed account successfully.`);
        const $inputsText = $('#jsModalAddNewGLAccount :input[type="text"]');
        const $inputsCheck = $('#jsModalAddNewGLAccount :input[type="checkbox"]');
        //reset form
        $inputsText.each(function () {
          $(this).val('');
        });
        $inputsCheck.each(function () {
          $(this).prop('checked', false);
        });
        $('.save-newAccount').addClass('disabled');
        $('#deductionAccount option').remove();
        $('#deductionAccount').append(`<option value="default" selected disabled>Select...</option>`);
        data.listAccounts.forEach(account => {
          $('#deductionAccount').append(`<option value='${account.Code}'>${account.Code}: ${account.Name}</option>`);
        });
        hidenLoading();
      }
      return;
    },
    error: function() {
      hidenLoading();
      showToast('error', "Can not connect to server. Please try again.");
      return;
    }
  });
}

function callApiCreateDeductionCate(bodyCategory) {
  $.ajax({
    dataType: 'json',
    method: 'POST',
    url: '/add-deduction-category',
    data: {
      accToken: accessToken,
      companyId: companyId,
      tenantId: tenantId,
      checkStatus: checkStatus,
      bodyCategory: JSON.stringify(bodyCategory),
      '_csrf': token
    },
    success: function(data) {
      if (!data.success && data.errorCode == 'LOGIN_AGAIN') {
        loginAgain();
        return;
      }
      let validateErr;
      if (data.result.PayItems?.DeductionTypes.length > 0) {
        validateErr = data.result.PayItems?.DeductionTypes.pop();
      };
      if (validateErr?.length > 0) {
        validateErr?.forEach((error, index) => {
          showToast('error', error.Message, `#jsErr${index}`);
        });
        hidenLoading();
      } else if (data.result.Title && data.result.Title == "Unauthorized") {
        getAccesstokenXeroFromRefreshToken('category');
      } 
      if (data.status == 200) {
        $('#jsModalAddNewDeductionCate').modal('hide');
        deductionCategoryTable.ajax.reload();
        showToast('success', `${checkStatus}ed successfully.`);
        const $inputsText = $('#jsModalAddNewDeductionCate :input[type="text"]');
        const $inputsCheck = $('#jsModalAddNewDeductionCate :input[type="checkbox"]');
        //reset form
        $inputsText.each(function () {
          $(this).val('');
        });
        $inputsCheck.each(function () {
          $(this).prop('checked', false);
        });
        $('#deductionAccount').val('default');
        $('.save-newDeductionCate').addClass('disabled');
        //update deduction file category  
        if (checkStatus == 'add') {
          $('.deduction-file-category select').append(`<option value='${data.result._id}'>${data.result.Name}</option>`);
        } else {
          $(`option[value=${data.result._id}]`).html(data.result.Name);
        }

        hidenLoading();
      }
      return;
    },
    error: function() {
      hidenLoading();
      showToast('error', "Can not connect to server. Please try again.");
      return;
    }
  });
}

function checkInputValue() {
  if ($(`#jsModalAddNewDeductionCate input[name="deductionName"]`).val() && $('#deductionAccount').val()) {
    $('.save-newDeductionCate').removeClass('disabled');
  } else {
    $('.save-newDeductionCate').addClass('disabled');
  }
}

function getAccesstokenXeroFromRefreshToken(name) {
  let request = null;
  if (request && request.readyState != 4) {
    request.abort();
  }
  request = $.ajax({
    dataType: "json",
    method: "POST",
    url: `/xero-refresh_token`,
    data: {
      refresh_token: refreshToken,
      "_csrf": token
    },
    async: true,
    success: function (data) {
      accessToken = data.access_token;
      localStorage.setItem('access_token', data.access_token);
      if (name == 'account') {
        $('.save-newAccount').trigger('click');
      } else {
        $('.save-newDeductionCate').trigger('click');
      }
      return true;
    }
  });
}

$('#jsGLAccount').click((e) => {
  $('#jsShowContentPage').addClass('hide');
  $('#jsDivGL').addClass('show');
  mode = 1;
  setFooterTable(mode);
});

$('#jsDeductionCategory').click(() => {
  $('#jsShowContentPage').addClass('hide');
  $('#jsDivDeductionCategory').addClass('show');
  mode = 0;
  setFooterTable(mode);
});

$('#jsSearchDeduction').on('submit', (event) => {
  event.preventDefault();
  searchKey = $('#jsSearchD').val();
  deductionCategoryTable.ajax.reload();
});

$('#jsSearchGL').on('submit', (event) => {
  event.preventDefault();
  searchKey = $('#jsSearch').val();
  glAccountsTable.ajax.reload();
});

$('.jsBack').click(() => {
  $('#jsDivGL').removeClass('show');
  $('#jsDivDeductionCategory').removeClass('show');
  $('#jsShowContentPage').removeClass('hide');
  $('#jsSearchD').val('');
  $('#jsSearch').val('');
  page = 0;
  searchKey = '';
  searchKey = '';
  deductionCategoryTable.ajax.reload();
  glAccountsTable.ajax.reload();
});

function setFooterTable(mode) {
  let nameMode, nameLength;
  if (mode == 1) {
    nameMode = "#glAccountsTable_wrapper";
    nameLength = "#glAccountsTable_length"
  } else {
    nameMode = '#deductionCategoryTable_wrapper';
    nameLength = '#deductionCategoryTable_length';
  }
  let divLength = $(`${nameMode} .row:first-child div:nth-child(1) ${nameLength}`).addClass('pagination--custom');
  $(`${nameMode} .row:last-child div`).first().append(divLength);
}
});
