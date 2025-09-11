
$(document).ready(function() {
  const token = $('input[name="_csrf"]').val();
  const idCompany = $("input[name='_id']").val(); 
  
  var tableFB = $('#feedBacksTable').DataTable({
    "paging": true,
    "ordering": false,
    "bLengthChange": true,
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
      'url': `/get-feedback`,
      'data': function (d) {
        var info = $('#feedBacksTable').DataTable().page.info();
        d.idCompany = idCompany;
        d.page =  info.page;
        d.pageSize =  info.length;
        d._csrf = token;
      },
      'dataSrc': 'result',
      'dataFilter': function (data) {
        var json = $.parseJSON(data);
        if (!json.success && json.errorCode == 'LOGIN_AGAIN') {
          loginAgain();
        }
        json.recordsTotal = json.totalItem;
        json.recordsFiltered = json.totalItem;

        return JSON.stringify(json);
      }
    },
    'columns': [
      { "data": null,
        "render": function ( data, type, full, meta ) {
          return meta.row + meta.settings._iDisplayStart + 1;
        }
      },
      { "data": "name" },
      { "data": "email" },
      { "data": "mobile",
        "render": function(data) {
          return data ? data : 'N/A';
        }
      },
      { "data": "message",
        "render": function(data) {
          return data.length <= 20 ? data : data.substring(0, 20).concat('...');
        }
      },
      {
        "data": '_id',
        "render": function() {
          return '<a class="btn btn-mini btn-outline-info accordion-toggle md-details-control">&nbsp\n\
              <i class="icofont icofont-eye-alt"></i>'
        }
      }
    ]
  });



  $('#feedBacksTable').on('click', 'a.md-details-control', function () {
    var tr = $(this).closest('tr');
    var row = tableFB.row( tr );
    let data = row.data()
    //add data to form
    $("#name").val(data.name);
    $("#email").val(data.email);
    $("#mobile").val(data.mobile);
    $("#message").val(data.message);
    //show modal
    $('#FormFeedBacksModal').modal("show");

  });

  function setFooterTable() {
    let divLength = $(`#feedBacksTable_wrapper .row:first-child div:nth-child(1) #feedBacksTable_length`).addClass('pagination--custom');
    $(`#feedBacksTable_wrapper .row:last-child div`).first().append(divLength);
  }

  $('#jsFeedBacks').on('click', () => {
    setFooterTable();
  });
});
