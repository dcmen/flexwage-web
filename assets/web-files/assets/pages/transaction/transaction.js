function loginAgain() {
  // if the ok button is clicked, result will be true (boolean)
  alert( "Your password was changed. Please try to login again." );
  // the user clicked ok
  $('#logout')[0].click();
}
$(document).ready(() => {
  //disabled warning datatable
  $.fn.dataTableExt.sErrMode = 'throw';
  //open find & match tab
  $('#findMatch-tab').click(() => {
    $('#ItemsToReconcile .item').addClass('opened');
    $('.findMatch').removeClass('closed');
  });
  //open match tab
  $('#match-tab').click(() => {
    $('#ItemsToReconcile .item').removeClass('opened');
    $('.findMatch').addClass('closed');
  });
  //checked all transaction
  $('.checked-all').click(function() {
    const checkedTransaction = $('.checked-transaction');
    checkedTransaction.prop('checked', true);
    if (this.checked) {
      $(`#confirmMatchingTransactionTable tbody tr`).remove();
      addValueTable(checkedTransaction);
    } else {
      checkedTransaction.prop('checked', false);
      $(`#confirmMatchingTransactionTable tbody tr`).remove()
    }
  });
  //checked one transaction event
  $('.checked-transaction').on('change', function() {
    addValueTable($(this));
  });

  function addValueTable(value) {
    value.each((index, input) => {
      const valueEmp = JSON.parse(input.defaultValue);
      if(input.checked) {
        $('#confirmMatchingTransactionTable tbody').append(`
        <tr id="${valueEmp.id}">
          <th>
            <input type="checkbox" class="confirm-checked-transaction" checked value="${valueEmp.id}"/>
          </th>
          <td>${valueEmp.name1}</td>
          <td>${valueEmp.name2}</td>
          <td>${valueEmp.name3}</td>
          <td>${valueEmp.name4}</td>
        </tr>
        `);
      } else {
        $(`#confirmMatchingTransactionTable tbody tr#${valueEmp.id}`).remove()
      }
    });

    //confirm checked transaction event
    $('.confirm-checked-transaction').on('change', function() {
      if (!this.checked) {
        $(this).each((index, input) => {
          const valueEmp = input.defaultValue;
          $(`#confirmMatchingTransactionTable tbody tr#${valueEmp}`).remove();
          $(`input#${valueEmp}`).prop('checked', false);
        });
      }
    });
  }

});