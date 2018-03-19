$(function () {
  var date = null;
  var day;
  var month;
  var year;
  var classroom_name = null;
  var classroom_id = null;
  var cs_selected_rows = 0;

  var selected_hours = [];


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

    var arr = {};

    if (classroom_id != 'Select a Classroom' && date) {
      console.log(day + ' ' + month + ' ' + year);
      var dbRef = firebase.database().ref('institute/'
        +INSTITUTE_ID
        +'/prenotation/'
        +year+'/'
        +month+'/'
        +day+'/classroom/');

      dbRef.once('value', snap => {
        console.log(snap.key);
      });

      /*
      TODO
        ottenere reference corretta del giorno selezionato controllando sull
        db se esiste 
      */

      $("#schedule_table_body").empty();
      var i = 8;
      var n = 16;
      for(; i < n ; i++) {
        $("#schedule_table_body").append(
          '<tr class="clickable-row" value="'+i+'">'+
          '<th>'+i+':00</th><td></td>'+
        '</tr>');
      }
    }
  }

  $('#schedule_table').on('click', '.clickable-row', function(event) {
    if ($(this).hasClass('selected_row')) {
      $(this).removeClass('selected_row');
      idx = selected_hours.indexOf($(this).attr('value'));
      if (idx >= 0) selected_hours.splice(idx, 1);
      cs_selected_rows--;
    } else {
      $(this).addClass('selected_row');//.siblings().removeClass('selected_row');
      selected_hours.push($(this).attr('value'));
      cs_selected_rows++;
    }
  });

  $('.cs_back_btn').on('click', () => {
    cs_selected_rows = 0;
  });

  $('#book_prenotation_btn').on('click', () => {
    if (cs_selected_rows > 0) {

    }
  });
});
