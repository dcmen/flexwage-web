// revove toast

// btn-click
$(".toast-btn button").click(function() {
  if ($(".toast").hasClass("show-success")) {
    $(".toast").removeClass("show-success");
  }
  if ($(".toast").hasClass("show")) {
    $(".toast").removeClass("show");
  }
});

// Call api
function callApi(url, num) {
  // get data
  const formSubmit = $("#js-form" + num);

  let deduction_id = formSubmit.children('input[name="deduction_id"]').val();
  let pay_deduction_id = formSubmit
    .children('input[name="pay_deduction_id"]')
    .val();
  let staff_id = formSubmit.children('input[name="staff_id"]').val();
  // ajax call api
  $.ajax({
    method: "POST",
    url,
    data: { deduction_id, pay_deduction_id, staff_id }
  })
    .done(function(data) {
      if (data.code === 200) {
        $(".toast").addClass("show-success");
        $("#js-toast").text("Created ABA file successfully.");
        setTimeout(function() {
          if ($(".toast").hasClass("show-success")) {
            $(".toast").removeClass("show-success");
          }
        }, 4000);
        const button = $("#btn"+ num);
        button.removeClass("btn-click");
        const tdClick = $("#js-td"+ num);
        tdClick.text(data.result.aba_link.slice(17));
      } else {
        $(".toast").addClass("show");
        $("#js-toast").text(
          "This employee is missing Bank information for creating ABA file."
        );
        setTimeout(function() {
          if ($(".toast").hasClass("show")) {
            $(".toast").removeClass("show");
          }
        }, 4000);
      }
    })
    .fail(function(err) {
      console.log(err);
    });
  return false;
}


