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
    month = date.getMonth() + 1;
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
      $("#schedule_table_body").empty();
      var pRef = firebase.database().ref('institute/'
        +INSTITUTE_ID
        +'/prenotation/'
        +year+'/'
        +month+'/'
        +day+'/'
        +classroom_id+'/'
        );

      //aggiorna array con key delle prenotaizoni
      pRef.once('value', snap => {
        snap.forEach(childSnap => {
          childSnap.forEach(gcSnap => {
            arr['h_'+childSnap.key] = gcSnap.val();
          });
        });
      }).then(() => {
        for (var hour = 8; hour<16; hour++) {
          /*!(('h_' + starting_hour) in arr)*/
            $("#schedule_table_body").append(
              '<tr class="clickable-row" id="hid_'+hour+'" value="'+hour+'">'+
              '<th>'+hour+':00</th><td></td>'+
            '</tr>');
            loadBookedHours(hour, arr);
        }
      });
    }
  }

  function loadBookedHours(hour, arr) {
    if (arr['h_'+hour]) {
      var teacher_name;
      var class_name;
      var event_name;

      var second_column;

      firebase.database().ref('institute/'
        +INSTITUTE_ID
        +'/prenotation_list/'
        + arr['h_' + hour]
      ).once('value', father => {
        father.forEach(child => {
          if (child.key == 'teacher') {
            teacher_name = child.val();
          } else if (child.key == 'event') {
            event_name = child.val();
          } else if (child.key == 'class') {
            class_name =  child.val();
          }
        });
        if (event_name) {
          second_column = event_name;
        } else {
          second_column = class_name + ' ' + teacher_name;
        }
        $("#hid_"+hour).empty();
        $("#hid_"+hour).addClass('booked');
        $("#hid_"+hour).append('<th>'+hour+':00</th><td>'+ second_column +'</td>');
      });
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
