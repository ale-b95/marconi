$(function () {
  var date = null;

  var day;
  var month;
  var year;

  var classroom_name = null;
  var classroom_id = null;

  var cs_selected_rows = 0;
  var mb_selected_rows = 0;

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
    var dbHoursRef = {};

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

      //aggiorna dbHoursRefay con key delle prenotaizoni
      pRef.once('value', snap => {
        snap.forEach(childSnap => {
          dbHoursRef['h_'+childSnap.key] = childSnap.val();
        });
      }).then(() => {
        for (var hour = 8; hour<16; hour++) {
            $("#schedule_table_body").append(
              '<tr class="clickable-row" id="hid_'+hour+'" value="'+hour+'">'+
              '<th>'+hour+':00</th><td></td>'+
            '</tr>');
            loadBookedHours(hour, dbHoursRef);
        }
      });
    }
  }

  function loadBookedHours(hour, dbHoursRef) {
    if (dbHoursRef['h_'+hour]) {
      var teacher_name;
      var class_name;
      var event_name;
      var teacher_id;

      var second_column;

      firebase.database().ref('institute/'
        +INSTITUTE_ID
        +'/prenotation_list/'
        + dbHoursRef['h_' + hour]
      ).once('value', father => {
        father.forEach(child => {
          if (child.key == 'teacher') {
            teacher_name = child.val();
          } else if (child.key == 'event') {
            event_name = child.val();
          } else if (child.key == 'class') {
            class_name =  child.val();
          } else if (child.key == 'teacher_key') {
            teacher_id = child.val();
          }
        });

        if (event_name) {
          second_column = event_name;
        } else {
          second_column = class_name + ' ' + teacher_name;
        }

        $("#hid_"+hour).empty();
        $("#hid_"+hour).append('<th>'+hour+':00</th><td>'+ second_column +'</td>');
        user = firebase.auth().currentUser;
        if (user.uid == teacher_id){
          $("#hid_"+hour).addClass('mybook')
        } else {
          $("#hid_"+hour).addClass('booked');
          $("#hid_"+hour).removeClass('clickable-row');
        }
      });
    }
  }

  $('#schedule_table').on('click', '.clickable-row', function(event) {
    if ($(this).hasClass('selected_row')) {
      $(this).removeClass('selected_row');
      idx = selected_hours.indexOf($(this).attr('value'));
      if (idx >= 0) selected_hours.splice(idx, 1);
      cs_selected_rows--;
    } else if (!$(this).hasClass('selected_row') &&
                !$(this).hasClass('mybook') &&
                mb_selected_rows == 0
              ){
      $(this).addClass('selected_row');
      selected_hours.push($(this).attr('value'));
      cs_selected_rows++;
    } else if ($(this).hasClass('mybook') && cs_selected_rows == 0) {
      $(this).addClass('mybook_selected');
      $(this).removeClass('mybook');
      selected_hours.push($(this).attr('value'));
      increase_mb_select(+1);
    } else if ($(this).hasClass('mybook_selected')) {
      $(this).removeClass('mybook_selected');
      $(this).addClass('mybook');
      idx = selected_hours.indexOf($(this).attr('value'));
      if (idx >= 0) selected_hours.splice(idx, 1);
      increase_mb_select(-1);
    }
  });

  function increase_mb_select(x) {
    mb_selected_rows += x;
    if (mb_selected_rows > 0) {
      $('#book_prenotation_btn').text('Cancel');
    } else {
      $('#book_prenotation_btn').text('Book');
    }
  }

  $('#book_prenotation_btn').on('click', () => {
    user = firebase.auth().currentUser;
    var class_name = $("#select_class").find(':selected').text();

    if (class_name && class_name != 'Select a Class' && cs_selected_rows > 0) {
        var prenotation_inlist = firebase.database().ref('institute/'
         +INSTITUTE_ID
         +'/prenotation_list/').push({
           class : class_name,
           classroom : classroom_name,
           classroom_key : classroom_id,
           date : date,
           teacher : user.displayName,
           teacher_key : user.uid,
           date : date
         });

        for (var i = 0; i < selected_hours.length; i++) {
          firebase.database().ref('institute/'
            +INSTITUTE_ID
            +'/prenotation/'
            +year+'/'
            +month+'/'
            +day+'/'
            +classroom_id+'/'
          ).update({
            [selected_hours[i]] : prenotation_inlist.key
          });
        }
        selected_hours = [];
        prenotation_id = [];
        loadClassroomSchedule();
        cs_selected_rows = 0;
        mb_selected_rows = 0;
        $('#book_prenotation_btn').text('Book');
    } else if (class_name == 'Select a Class' && cs_selected_rows > 0){
      alert ('Select a class');
    } else if (mb_selected_rows > 0) {
      // ciclo per le ore selezionate
      for (var i = 0; i < selected_hours.length; i++) {
        // referenza alle prenotazioni in data 'date' e aula scelta
        var prenotation_ref = firebase.database().ref('institute/'+INSTITUTE_ID+
        '/prenotation/'+year+'/'+month+'/'+day+'/'+classroom_id+'/'+selected_hours[i]).remove();
      }

      checkPrenotationInDate(date, )

      loadClassroomSchedule();
      prenotation_id = [];
      cs_selected_rows = 0;
      mb_selected_rows = 0;
      $('#book_prenotation_btn').text('Book');
    }
  });

  function checkPrenotationInDate (myDate, prenotation_id) {
    var my_day = myDate.getDate();
    var my_month = myDate.getMonth() + 1;
    var my_year = myDate.getFullYear();

    var prenotation_ref = firebase.database().ref('institute/'+INSTITUTE_ID+
    '/prenotation/'+my_year+'/'+my_month+'/'+my_day+'/'+classroom_id+'/').once('value', snap => {
      console.log(prenotation_id);
    });
  }


  $('.cs_back_btn').on('click', () => {
    cs_selected_rows = 0;
    mb_selected_rows = 0;
    $('#book_prenotation_btn').text('Book');
    selected_hours = [];
  });
});
