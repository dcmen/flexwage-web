$(document).ready(function() {
    $('select[name="address_country_id"]').select2();
    $('select[name="address_line_state_id"]').select2();
    $('select[name="address_line_suburb_id"]').select2();
    $('select[name="address_line_city"]').select2();
    let jsValueCountryId = $('#jsValueCountryId').val();
    let jsValueStateId = $('#jsValueStateId').val();
    let jsValueSuburbId = $('#jsValueSuburbId').val();
    let jsValueCityName = $('#jsValueCityName').val();
    let countryId;
    getCountry();
    if (jsValueCountryId != '') {
      getState(jsValueCountryId);
      if (jsValueCountryId == '14') {
        getSuburbs(jsValueCountryId, jsValueStateId);
        $('#jsCity').addClass('hide');
        $('#jsSuburb').removeClass('hide');
      }
    }

    if ((jsValueCountryId != "" || jsValueStateId != "") && jsValueCountryId != '14') {
      getCities(jsValueCountryId, jsValueStateId);
    }

    $('select[name="address_country_id"]').change(() => {
      var selectedCountry = $('select[name="address_country_id"]').children("option:selected").val();
      countryId = selectedCountry;
      if (selectedCountry == '14') {
        $('#jsSuburb').removeClass('hide');
        $('#jsCity').addClass('hide');
      } else {
        getCities(countryId, "");
        $('#jsCity').removeClass('hide');
        $('#jsSuburb').addClass('hide');
      }
      getState(selectedCountry);
    });

    $('select[name="address_line_state_id"]').change(() => {
      if (countryId == undefined) {
        countryId = jsValueCountryId;
      }
      var selectedState = $('select[name="address_line_state_id"]').children("option:selected").val();
      if (countryId == 14 || (jsValueCountryId == 14 && countryId == undefined)) {
        getSuburbs(countryId, selectedState);
        $('#jsCity').addClass('hide');
        $('#jsSuburb').removeClass('hide');
      } else {
        getCities(countryId, selectedState);
        $('#jsSuburb').addClass('hide');
        $('#jsCity').removeClass('hide');
      }
    });

    function getCountry() {
        let string = [];
          $.ajax({
              dataType: "json",
              method: "GET",
              url: `/countries`,
              async: false,
              success: function (data) {
                  if (data.success) {
                    data.result.forEach(element => {
                      if (jsValueCountryId == element.id_key) {
                        string.push(`<option selected value="${element.id_key}">${element.name}</option>`);
                      } else {
                        string.push(`<option value="${element.id_key}">${element.name}</option>`);
                      }
                    });
                    $('select[name="address_country_id"]').html(`
                        <option value="">Choose Country</option>
                        ${string ? string.join(' ') : ''}
                    `);
                  }
              },
              error: function () {
                  showToast('error', "Can't connect to server. Try again")
              }
          });
    } 

    function getState(countryId) {
      let string = [];
          $.ajax({
              dataType: "json",
              method: "GET",
              url: `/states?countryId=${countryId}`,
              async: false,
              success: function (data) {
                  if (data.success) {
                    data.result.forEach(element => {
                      if (jsValueStateId == element.id_key) {
                        string.push(`<option selected value="${element.id_key}">${element.iso2}</option>`);
                      } else {
                        string.push(`<option value="${element.id_key}">${element.iso2}</option>`);
                      }
                    });
                    $('select[name="address_line_state_id"]').html(`
                        <option value="">Choose State</option>
                        ${string ? string.join(' ') : ''}
                    `);
                  }
              },
              error: function () {
                  showToast('error', "Can't connect to server. Try again")
              }
          });
    }

    function getSuburbs(countryId, stateId) {
      let string = [];
          $.ajax({
              dataType: "json",
              method: "GET",
              url: `/suburbs?countryId=${countryId}&stateId=${stateId}`,
              async: false,
              success: function (data) {
                  if (data.success) {
                    data.result.forEach(element => {
                      if (jsValueSuburbId == element._id) {
                        string.push(`<option selected value="${element._id}">${element.name}</option>`);
                      } else {
                        string.push(`<option value="${element._id}">${element.name}</option>`);
                      }
                    });
                    $('select[name="address_line_suburb_id"]').html(`
                      <option value="">Choose Suburb</option>
                        ${string ? string.join(' ') : ''}
                    `);
                  }
              },
              error: function () {
                  showToast('error', "Can't connect to server. Try again")
              }
          });
    }

    function getCities(countryId, stateId) {
      let string = [];
          $.ajax({
              dataType: "json",
              method: "GET",
              url: `/cities?countryId=${countryId}&stateId=${stateId}`,
              async: false,
              success: function (data) {
                  if (data.success) {
                    data.result.forEach(element => {
                      if (jsValueCityName == element.name) {
                        string.push(`<option selected value="${element.name}">${element.name}</option>`);
                      } else {
                        string.push(`<option value="${element.name}">${element.name}</option>`);
                      }
                    });
                    $('select[name="address_line_city"]').html(`
                      <option value="">Choose City</option>
                        ${string ? string.join(' ') : ''}
                    `);
                  }
              },
              error: function () {
                  showToast('error', "Can't connect to server. Try again")
              }
          });
    }
  });