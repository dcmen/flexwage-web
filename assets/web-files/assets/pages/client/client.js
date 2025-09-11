const clients = document.getElementById('jsClient').value;
const pagination = document.getElementById('jsPagination').value;
let table = document.getElementById('jsTable');
const origin = document.location.origin;
const strText = rednderTable(JSON.parse(clients), JSON.parse(pagination));
table.innerHTML = strText;

function rednderTable(params1, prams2) {
    let stringTr = '';
    params1.forEach(client => {
        stringTr = stringTr + `<tr>
                        <td>${client.name}</td>
                        <td>
                          ${client.logo_uri ? `<img width="60px" height="60px" src="${client.logo_uri}">` : "N/A"}
                        </td>
                        <td>${client._id}</td>
                        <td><a>${client.redirect_uri}</a></td>
                        <td>
                          <a style="color: #000;" href="/oauth/client/detail/${client._id}" ><span id="edit${client._id}" name="edit" title="Edit" class="btn feather icon-edit p-1"></span></a>
                          <span onclick="deleteClient(this)" id="delete${client._id}" name="delete" title="Remove" class="btn feather icon-x-square p-1"></span>
                        </td>
                      </tr>`;
    });
    let prevPage = '';
    let nextPage = '';
    let arrPage = [];
    if (prams2.pageIndex == 0) {
        prevPage = `<li class="page-item disabled">
                        <a onclick="prevPage()" class="page-link">First</a>
                      </li>`;
    } else {
        prevPage = `<li class="page-item">
              <a onclick="prevPage()" class="page-link">First</a>
          </li>`;
    }
    if (prams2.pageIndex + 1 == prams2.totalPages) {
        nextPage = `<li class="page-item disabled">
                        <a onclick="nextPage()" class="page-link">
                          Last
                        </a>
                      </li>`;
    } else {
        nextPage = `<li class="page-item">
                        <a onclick="nextPage()" class="page-link">
                          Last
                        </a>
                      </li>`;
    }
    var i = (Number(prams2.pageIndex + 1) > 3 ? Number(prams2.pageIndex + 1) - 3 : 1)
    for (; i < (Number(prams2.pageIndex) == 0 ? Number(prams2.pageIndex + 1) + 3 : Number(prams2.pageIndex) + 3) && i <= prams2.totalPages; i++) {
        if (arrPage.length > 2) {
            arrPage.shift();
        }
        if (i == Number(prams2.pageIndex + 1)) {
            arrPage.push(`<li class="page-item active">
                  <a id="activePage" onclick="pickPage(this)" class="page-link">
                    ${i}
                  </a>
                </li>`);
        } else {
            arrPage.push(`<li class="page-item">
                  <a onclick="pickPage(this)" class="page-link">
                    ${i}
                  </a>
                </li>`);
        }
    }
    // };
    let string = `<div class="datatable-container">
                <!-- ======= Table ======= -->
                <table class="datatable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Logo</th>
                      <th>Client Id</th>
                      <th>Redirect Uri</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${stringTr}
                  </tbody>
                  </table>
                <!-- ======= Footer tools ======= -->
                <div class="footer-tools">
                  <div class="list-items">
                    Show
                    <select onchange="selectItem()" name="n-entries" id="n-entries" class="n-entries">
                      <option ${prams2.pageSize == 5 ? 'selected' : ''} value="5">5</option>
                      <option ${prams2.pageSize == 10 ? 'selected' : ''} value="10">10</option>
                      <option ${prams2.pageSize == 15 ? 'selected' : ''} value="15">15</option>
                      <option ${prams2.pageSize == 20 ? 'selected' : ''} value="20">20</option>
                    </select>
                    entries
                  </div>
              
                  <div class="pages">
                        <ul class="">
                        ${prevPage}
                        ${arrPage.join('')}
                        ${nextPage}
                        </ul>
                  </div>
                </div>
              </div>`;
    return string;
}

function pickPage() {
    let value = event.target.textContent;
    let size = document.getElementById('n-entries').value;
    let targetSearch = document.getElementsByClassName('input-search');
    let keySearch = targetSearch[0].value;
    var myHeaders = new Headers();
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`${origin}/oauth/api/clients?page=${value}&pageSize=${size}&q=${keySearch}`, requestOptions)
        .then(response => response.text())
        .then(result => {
            const data = JSON.parse(result);
            const srt = rednderTable(data.clients, data.pagination);
            table.innerHTML = srt;
        })
        .catch(error => console.log('error', error));
}

function prevPage() {
    let value = (document.getElementById('activePage').textContent).trim();
    let size = document.getElementById('n-entries').value;
    let targetSearch = document.getElementsByClassName('input-search');
    let keySearch = targetSearch[0].value;
    var myHeaders = new Headers();
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`${origin}/oauth/api/clients?page=${Number(value) - 1}&pageSize=${size}&q=${keySearch}`, requestOptions)
        .then(response => response.text())
        .then(result => {
            const data = JSON.parse(result);
            const srt = rednderTable(data.clients, data.pagination);
            table.innerHTML = srt;
        })
        .catch(error => console.log('error', error));
}

function nextPage() {
    let value = (document.getElementById('activePage').textContent).trim();
    let size = document.getElementById('n-entries').value;
    let targetSearch = document.getElementsByClassName('input-search');
    let keySearch = targetSearch[0].value;
    var myHeaders = new Headers();
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`${origin}/oauth/api/clients?page=${Number(value) + 1}&pageSize=${size}&q=${keySearch}`, requestOptions)
        .then(response => response.text())
        .then(result => {
            const data = JSON.parse(result);
            const srt = rednderTable(data.clients, data.pagination);
            table.innerHTML = srt;
        })
        .catch(error => console.log('error', error));
}

function selectItem() {
    let tagetPage = document.getElementsByClassName('active');
    let page = tagetPage[0].textContent;
    let size = document.getElementById('n-entries').value;
    let targetSearch = document.getElementsByClassName('input-search');
    let keySearch = targetSearch[0].value;
    var myHeaders = new Headers();
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`${origin}/oauth/api/clients?page=${page}&pageSize=${size}&q=${keySearch}`, requestOptions)
        .then(response => response.text())
        .then(result => {
            const data = JSON.parse(result);
            const srt = rednderTable(data.clients, data.pagination);
            table.innerHTML = srt;
        })
        .catch(error => console.log('error', error));
};

function deleteClient() {
  let idTarget = event.target.id;
  let id = idTarget.replace('delete', '');
  var raw = JSON.stringify({"id": id});
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(`${origin}/oauth/clients/delete`, requestOptions)
        .then(response => response.text())
        .then(result => {
            const data = JSON.parse(result);
            if(data.success){
              ((document.getElementById(idTarget).parentElement).parentElement).remove();
              showMess("alert-success", "Delete item success");
            } else {
              showMess("alert-danger", "Delete item failed");
            }
        })
        .catch(error => console.log('error', error));
}

function showMess(className, mess) {
  const section = document.getElementById('show_mess');
  section.innerHTML = `<div class="alert ${className}" role="alert">${mess}</div>`;
}

$(document).ready(function () {
    $('#jsToggelMenu').click(function () {
        if ($('#jsToggelIcon').hasClass('icon-menu')) {
            $('#jsToggelIcon').removeClass('icon-menu');
            $('#jsToggelIcon').addClass('icon-x');
            $('.navbar-content').addClass('navbar-content-height');
        } else {
            $('#jsToggelIcon').addClass('icon-menu');
            $('#jsToggelIcon').removeClass('icon-x');
            $('.navbar-content').removeClass('navbar-content-height');
        }
    });

    $('#search').click(async function () {
        var q = $('.input-search').val();
        var myHeaders = new Headers();
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch(`${origin}/oauth/api/clients?page=0&pageSize=10&q=${q}`, requestOptions)
            .then(response => response.text())
            .then(result => {
                const data = JSON.parse(result)
                const srt = rednderTable(data.clients, data.pagination);
                table.innerHTML = srt;
                $('#jsToggelIcon').addClass('icon-menu');
                $('#jsToggelIcon').removeClass('icon-x');
                $('.navbar-content').removeClass('navbar-content-height');
            })
            .catch(error => console.log('error', error));
    });
});