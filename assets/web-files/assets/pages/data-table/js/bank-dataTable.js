$(document).ready(function() {
  const token = $('input[name="_csrf"]').val();

const bankTable = $('#bankTable').DataTable({
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
    'url': `/get-bank`,
    'data': function (d) {
      var info = $('#bankTable').DataTable().page.info();
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
      json.recordsTotal = json.totalItems;
      json.recordsFiltered = json.totalItems;

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
});

