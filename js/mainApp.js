$(function () {
  var date = null;
  var day;
  var month;
  var year;
  var classroom_name = null;
  var classroom_id = null;

  $('#classroom_datepicker').datepicker({
    format: 'dd/mm/yyyy',
    language: "it",
    autoclose: true,
    todayHighlight: true,
    toggleActive: true,
    daysOfWeekHighlighted: "0"
  });

  $('#classroom_datepicker').on('changeDate', () => {
    if (classroom_name != 'Select a Classroom') loadClassroomSchedule();
  });

  $("#select_classroom").on('change', () => {
    if (date) loadClassroomSchedule();
  });

  function selectDate() {
    date = $("#classroom_datepicker").datepicker('getDate');
    day = date.getDate();
    month = date.getMonth();
    year = date.getFullYear();
  }

  function selectClassroom() {
    classroom_id = $("#select_classroom").val();
    classroom_name = $("#select_classroom").find(':selected').text();
  }

  function loadClassroomSchedule() {
    selectDate();
    selectClassroom();

    if (classroom_name != 'Select a Classroom' && date) {
      $("#schedule_table_body").empty();
      var i = 8;
      var n = 16;
      for(; i < n ; i++) {
        $("#schedule_table_body").append(
          '<tr>'+
          '<th>'+i+':00</th><th></th>'+
        '</tr>');
      }
    }
  }
});
