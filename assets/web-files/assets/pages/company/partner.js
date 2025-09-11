$(document).ready(function () {
    const token = $('input[name="_csrf"]').val();
    const company = JSON.parse($('input[name="company"]').val());
    const jsonLender = $('input[name="lenderLinkCompany"]').val();
    const lenderLinkCompany = jsonLender !== '' ? JSON.parse(jsonLender) : '';
    const idCompany = $("input[name='_id']").val();
    const systemCode = $("input[name='systemCode']").val();
    let searchKey = "", isActive = "ALL";
    const refreshToken = localStorage.getItem('refresh_token');
    const urlApi = $('input[name="urlApi"]').val();

    let paid_withdrawals = []
    let payment_system_code = ''

    if (company) {
        let payment_system_id_send = company.payment_system_id
        $.ajax({
            dataType: "json",
            type: "POST",
            url: `/get-payment-system-by-id`,
            data: {
                "payment_system_id": payment_system_id_send,
                "_csrf": token,
            },
            success: function (data) {
                if (data) {
                    let paymentSys = data.payment_system
                    if (paymentSys == "MONOOVA") {
                        $('#jsExportPaymentReportExcel').attr('hidden', 'hidden')
                        $('#jsImportPaymentReportExcel').attr('hidden', 'hidden')
                    } else {
                        $('#jsExportPaymentReportExcel').removeAttr('hidden')
                        $('#jsImportPaymentReportExcel').removeAttr('hidden')
                    }
                }
            },
            error: function (err) {
                console.log(err);
            },
        });
    }

    let dataSend = {
        companyId: '',
        paymentSystemId: ''
    }

    let dataSend2 = {
        companyId: '',
        paymentSystemId: ''
    }

    let payments = ''

    function hideLoading() {
        setTimeout(() => {
            $('#jsLoading').remove();
        }, 2000);
    }

    function showLoading() {
        if (!$('#jsLoading').length) {
            $('#transactions, #jsTransactionDiv').append(`<div id="jsLoading">
                <div style="top: 40%; left: 0px;" class="loader">
                    <div class="loader-chiled"></div>
                </div>
            </div>`);
        }
    }

    function showToast(name, mess, nameErrId = '#jsErr') {
        $(nameErrId).addClass(`show ${name}`);
        $(`${nameErrId} p`).html(mess);
        setTimeout(() => {
            $(nameErrId).removeClass(`show ${name}`);
        }, 2500);
    }

    function convertBase64toBlob(content, contentType) {
        contentType = contentType || "";
        var sliceSize = 512;
        var byteCharacters = window.atob(content); //method which converts base64 to binary
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, {
            type: contentType,
        }); //statement which creates the blob
        return blob;
    }

    function showLoading() {
        $('#jsLoader').addClass('show');
    }

    function hidenLoading() {
        setTimeout(function () {
            $('#jsLoader').removeClass('show');
        }, 500);
    }

    const getPaymentSystemsAndSetPaymentId = async () => {
        await $.ajax({
            dataType: "json",
            type: "GET",
            url: `/get-payment-systems?_csrf=${token}`,
            success: function (data) {
                if (data.success) {
                    let htmlContent = '';
                    data.result.forEach(element => {
                        if (element.code == "MONOOVA") {
                            dataSend.paymentSystemId = element._id
                            payments = element._id
                        }
                        htmlContent += `<option ${element._id === company.payment_system_id ? 'selected' : ''} value="${element._id}">${element.name}</option>`
                    });
                    $('#allPaymentSystems').html(htmlContent)
                }
            },
            error: function (err) {
                console.log(err);
            },
        });

        if (!company.payment_system_id) {
            dataSend.companyId = company._id
            $.ajax({
                url: '/update-payment-system-id',
                method: 'PUT',
                dataType: 'json',
                data: dataSend,
                success: function (response) {
                    console.log('Update success!')
                },
                error: function (error) {
                    console.log('res: ', error)
                }
            });
        }
        else {
            if (company.payment_system_id === payments) {
                $('#lenderTable').removeAttr('hidden');
            } else {
                $('#lenderTable').attr('hidden', 'hidden')
            }
        }
    }

    getPaymentSystemsAndSetPaymentId()

    $('#allPaymentSystems').on('change', () => {
        var selectedValue = $('#allPaymentSystems').val();

        let paymentSystemCode = ''

        dataSend2.paymentSystemId = selectedValue
        dataSend2.companyId = company._id

        $.ajax({
            url: '/update-payment-system-id',
            method: 'PUT',
            dataType: 'json',
            data: dataSend2,
            success: function (response) {
                console.log('Update success!')
                paymentSystemCode = response.paymentSystem.code
                if (paymentSystemCode) {
                    if (paymentSystemCode == "MANUAL") {
                        $('#lenderTable').attr('hidden', 'hidden')
                        $('#jsExportPaymentReportExcel').removeAttr('hidden')
                        $('#jsImportPaymentReportExcel').removeAttr('hidden')
                    } else {
                        $('#lenderTable').removeAttr('hidden');
                        $('#jsExportPaymentReportExcel').attr('hidden', 'hidden')
                        $('#jsImportPaymentReportExcel').attr('hidden', 'hidden')
                    }
                }
            },
            error: function (error) {
                console.log('res: ', error)
            }
        })
    })

    $.ajax({
        dataType: "json",
        method: "GET",
        url: `/countries`,
        async: false,
        success: function (data) {
            if (data.success) {
                let htmlContent = '';
                let htmlContent2 = '';
                data.result.forEach(element => {
                    htmlContent += `<option ${element._id === company.country_id ? 'selected' : ''} value="${element._id}">${element.name}</option>`
                    htmlContent2 += `<option ${element.currency === company.currency ? 'selected' : ''} value="${element.currency}">${element.currency}</option>`
                });
                $('#listCountry').html(htmlContent)
                $('#listCurrency').html(htmlContent2)
            }
        },
        error: function () {
            showToast('error', "Can't connect to server. Try again")
        }
    });

    $('#submitCountryCurrencyBtn').on('click', () => {

        let country = $('#listCountry').val()
        let currency = $('#listCurrency').val()
        let language = $('#listLanguage').val()
        let companyId = company._id

        $.ajax({
            url: '/update-country-currency-language-for-company',
            method: 'PUT',
            dataType: 'json',
            data: companyExtraInfor = {
                country,
                currency,
                language,
                companyId,
            },
            success: function (response) {
                console.log('Update success!')
                showToast('success', "Updated successfully.");
            },
            error: function (error) {
                console.log('res: ', error)
                showToast('error', "Update failed.");
            }
        });
    })

    $(document).on("click", "#jsExportPaymentReportExcel", function () {
        let company
        let withdrawals
        $.ajax({
            dataType: "json",
            method: "POST",
            url: `/get-data-export-excel`,
            data: {
                "company_id": idCompany,
                "_csrf": token,
            },
            async: true,
            success: function (data) {
                if (data) {
                    company = data.result.company
                    withdrawals = data.result.withdrawals
                    exportExcel(company, withdrawals)
                }
            },
            error: function (error) {
                console.log('error: ', error)
            }
        });
    })

    const exportExcel = (company, withdrawals) => {

        if (withdrawals == [] || !withdrawals || withdrawals === [] || withdrawals == null || withdrawals == undefined || withdrawals.length === 0) {
            return showToast('error', "No unpaid withdrawals found!")
        } else {
            let body = {
                company: JSON.stringify(company),
                withdrawals: JSON.stringify(withdrawals),
            }

            $.ajax({
                dataType: "json",
                method: 'POST',
                url: '/export-excel-file-transaction',
                data: body,
                async: true,
                success: function (responsive) {
                    if (responsive.code == 200) {
                        var blob = convertBase64toBlob(responsive.data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        saveAs(blob, "Withdrawal-Report" + ".xlsx");
                    }
                    if (responsive.errCode == -1) {
                        showToast('error', "No unpaid withdrawals found")
                    }
                },
                error: function (e) {
                    showToast('error', "Can't connect to server. Try again")
                    return false;
                }
            });
        }
    }

    function showErrorInvite(message) {
        showToast("error", message);
        $("#fileTransactionModal").val("");
        $('#jsSubmitFileInvitesTransactionModal').attr("disabled", true);
    }

    $(document).on("click", "#jsImportPaymentReportExcel", function () {
        $("#jsTransactionModal").modal({
            backdrop: false,
            keyboard: false,
            show: true,
        });
        $('#jsSubmitFileInvitesTransactionModal').append(`OK`)
        $("#fileTransactionModal").val("");
    });

    document
        .getElementById("fileTransactionModal")
        .addEventListener("change", handleFileSelect, false);

    var ExcelToJSON = function () {
        this.parseExcel = function (file) {
            var reader = new FileReader();

            reader.onload = function (e) {
                staffListEmail = [];
                var data = e.target.result;
                var workbook = XLSX.read(data, {
                    type: "binary"
                });

                workbook.SheetNames.forEach(function (sheetName) {
                    // Here is your object
                    let XL_row_object = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
                    if (XL_row_object && XL_row_object.length > 0) {
                        totalEmployeeFromFile = XL_row_object.length;
                        let XL_row_object_first = XL_row_object[1];

                        const title = Object.values(XL_row_object_first)
                        let check = false

                        title.map((item) => {
                            if (item == "No" || "First Name" || "Last Name" || "Astute ID" || "Employee ID" || "Payment Amount" || "CashD Fees" || "Total" || "Account Name" || "Account Number" || "BSB/Routing" || "Pay Cycle Period" || "Transaction Id" || "Transaction Status" || "Date Time") {
                                check = false
                            } else {
                                check = true
                            }
                        })
                        if (
                            //     XL_row_object_first.values("First Name") 
                            // && XL_row_object_first.values("Last Name") 
                            //   && XL_row_object_first.values("Astute ID") && XL_row_object_first.values("Employee ID") 
                            //   && XL_row_object_first.values("Payment Amount") && XL_row_object_first.values("CashD Fees")
                            //   && XL_row_object_first.values("Total") && XL_row_object_first.values("Account Name")
                            //   && XL_row_object_first.values("Account Number") && XL_row_object_first.values("BSB/Routing")
                            //   && XL_row_object_first.values("Pay Cycle Period") && XL_row_object_first.values("Transaction Id")
                            //   && XL_row_object_first.values("Transaction Status") && XL_row_object_first.values("Date Time")
                            check = true
                        ) {
                            $('#jsSubmitFileInvitesTransactionModal').attr("disabled", false);

                            let arrItem = {}

                            for (let i = 2; i < XL_row_object.length; i++) {
                                let first_name = XL_row_object[i].__EMPTY
                                let last_name = XL_row_object[i].__EMPTY_1
                                let transaction_id = XL_row_object[i].__EMPTY_11
                                let employee_id = XL_row_object[i].__EMPTY_3

                                arrItem = {
                                    transaction_id,
                                    employee_id,
                                    first_name,
                                    last_name
                                }

                                paid_withdrawals.push(arrItem)
                            }

                        } else {
                            showErrorInvite("Please choose the correct file format.");
                        }
                    } else {
                        showErrorInvite("Please select the file with data.");
                    }
                });
            };

            reader.onerror = function (ex) {
                console.log(ex);
            };

            reader.readAsBinaryString(file);
        };
    };

    $('#jsSubmitFileInvitesTransactionModal').on("click", () => {

        $('#jsSubmitFileInvitesTransactionModal').html(
            `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
          );

        $.ajax({
            dataType: "json",
            type: "POST",
            url: `/import-data-from-excel`,
            data: {
                "_csrf": token,
                "paid_withdrawals": JSON.stringify(paid_withdrawals),
            },
            success: function (res) {
                if (res.success) {
                    if (res.result.failed_withdrawals.length == 0) {
                        showToast("success", "Update successfully!");
                        $("#jsTransactionModal").modal('hide');
                    } else if (res?.result?.failed_withdrawals?.length > 0) {
                        let employeesFaildFound = res.result.failed_withdrawals
                        showToast("success", "Update successfully!");
                        $("#jsTransactionModal").modal('hide');
                        $('#jsSubmitFileInvitesTransactionModal').append(`OK`)
                        $('#jsModalShowListValueFromExcel').modal({
                            backdrop: false,
                            keyboard: false,
                            show: true,
                        })

                        $("#listEmployeesFailed").DataTable({
                            searching: false,
                            serverSide: false,
                            processing: true,
                            pageLength: 5,
                            ordering: false,
                            lengthMenu: [
                                [5, 10, 25, 50, 100],
                                [5, 10, 25, 50, 100],
                            ],
                            language: {
                                loadingRecords: "&nbsp;",
                                processing: '<div class="spinner"></div>',
                            },
                            data: employeesFaildFound,
                            columns: [
                                {
                                    data: null,
                                    render: function (data, type, full, meta) {
                                        return meta.row + meta.settings._iDisplayStart + 1;
                                    },
                                },
                                {
                                    data: "first_name",
                                    render: function (data) {
                                        return data ?? "N/A";
                                    },
                                },
                                {
                                    data: "last_name",
                                    render: function (data) {
                                        return data ?? "N/A";
                                    },
                                },
                                {
                                    data: "employee_id",
                                    render: function (data) {
                                        return data ?? "N/A";
                                    },
                                },
                                {
                                    data: "transaction_id",
                                    render: function (data) {
                                        return data ?? "N/A";
                                    },
                                },
                            ]
                        });
                    }
                } else if (res.success == false) {
                    console.log("faild")
                    showToast("error", "Update failed, the paid_withdrawals array is required!");
                }
            },
            error: function (err) {
                console.log(err);
                showToast("error", "Update failed!");
            },
        });
    })

    function handleFileSelect(event) {
        var files = event.target.files; // FileList object
        employeesNotMatched = [];
        employeeFromEmail = {};
        staffListEmail = [];
        if (!files[0]) {
            showToast("error", "Please add file.");
        }
        if (files[0].name.split('.').pop() == "xls" || files[0].name.split('.').pop() == "xlsx") {
            let xl2json = new ExcelToJSON();
            xl2json.parseExcel(files[0]);
        } else {
            showErrorInvite("Sorry, file is invalid, allowed extensions are: .xls, .xlsx");
        }
    }
})

