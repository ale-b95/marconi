$(function () {

  $('.datepicker').datepicker({
    format: 'dd/mm/yyyy',
    language: "it",
    autoclose: true,
    todayHighlight: true,
    toggleActive: true,
    daysOfWeekHighlighted: "0"
  });

  $('#get_date_btn').on('click', () => {
    var year = $(".datepicker").datepicker('getDate');
    var month = $(".datepicker").datepicker('getDate');
    var day = $(".datepicker").datepicker('getDate').getDate();
    var croom_id = $("#select_classroom").val();
    var croom_name = $("#select_classroom").find(':selected').text();
  });
})
