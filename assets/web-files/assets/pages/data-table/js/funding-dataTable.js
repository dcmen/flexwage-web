
$(document).ready(function() {
  const token = $('input[name="_csrf"]').val();
  const idCompany = $("input[name='_id']").val(); 
  
  $('#fundingTable').DataTable({
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
      'url': `/get-funds`,
      'data': function (d) {
        var info = $('#fundingTable').DataTable().page.info();
        d.idCompany = idCompany;
        d.page =  info.page;
        d.pageSize =  info.length;
        d._csrf = token;
      },
      'dataSrc': 'result',
      'dataFilter': function (data) {
        var json = $.parseJSON(data);
        json.recordsTotal = json.totalItem;
        json.recordsFiltered = json.totalItem;

        return JSON.stringify(json);
      }
    },
    'columns': [
      { "data": "name" },
      { "data": "email" },
      { "data": "email" },
      { "data": "email" },
      { "data": "email" },
      { "data": "email" },
      {
        "data": null,
        "render": function(data, type, row) {
          return `<a id="btnEditCate_${row._id}"
              style="font-size: 13px;position: relative" class="btn btn-mini btn-outline-warning edit-detail accordion-toggle">
              <i class="icofont icofont-edit-alt"></i>
            </a>`
        }
      }
    ]
  });

});
