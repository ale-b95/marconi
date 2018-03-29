$(function () {
  var date;

  var classroom_name;
  var classroom_id;

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
        if (classroom_name != "Seleziona aula") {
            loadClassroomSchedule();
        }
    });

    $("#select_classroom").on('change', () => {
        if (date) {
            loadClassroomSchedule();
        }
    });

    $('#schedule_table').on('click', '.clickable-row', function(event) {

    if ($(this).hasClass('selected_row')) {
        $(this).removeClass('selected_row');
        idx = selected_hours.indexOf($(this).attr('value'));
        if (idx >= 0) selected_hours.splice(idx, 1);
        cs_selected_rows--;
    } else if (!$(this).hasClass('selected_row') && !$(this).hasClass('mybook') && mb_selected_rows == 0 ) {
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

    $('#book_prenotation_btn').on('click', () => {
        var today = Date.now() - (24*3600*1000);
        user = firebase.auth().currentUser;        
        var class_name = $("#select_class").find(':selected').text();
        
        if (class_name && class_name != 'Seleziona classe' && cs_selected_rows > 0 && date >= today && classroom_name != "Seleziona aula") {
            
            for (var i = 0; i < selected_hours.length; i++) {            
                firebase.database().ref('institute/'+INSTITUTE_ID+'/prenotation/'+year+'/'+month+'/'+day+'/'+classroom_id+'/'+selected_hours[i]+'/').set({
                class : class_name,
                classroom : classroom_name,
                classroom_key : classroom_id,
                date : date,
                teacher : user.displayName,
                teacher_key : user.uid
                });
            }
            selected_hours = [];
            loadClassroomSchedule();
            cs_selected_rows = 0;
            mb_selected_rows = 0;
            $('#book_prenotation_btn').text('Prenota');
        } else if (class_name == 'Seleziona classe' && cs_selected_rows > 0){
            alert ('Seleziona una classe');
        } else if (classroom_name == 'Seleziona aula') {
            alert ("Seleziona un'aula");
        } else if (mb_selected_rows > 0) {
            
            for (var i = 0; i < selected_hours.length; i++) {
                var prenotation_ref = firebase.database().ref('institute/'+INSTITUTE_ID+'/prenotation/'+year+'/'+month+'/'+day+'/'+classroom_id+'/'+selected_hours[i]);
                prenotation_ref.remove();
            }
            loadClassroomSchedule();
            selected_hours = [];
            cs_selected_rows = 0;
            mb_selected_rows = 0;
            $('#book_prenotation_btn').text('Prenota');
        } else if (date < today) {
            alert('ERRORE: Non possono essere effettuate modifiche per la data selezionata.');
        }
    });

    $('.cs_back_btn').on('click', () => {
        cs_selected_rows = 0;
        mb_selected_rows = 0;
        $('#book_prenotation_btn').text('Prenota');
        selected_hours = [];
    });
    
    function loadClassroomSchedule() {
        date = $("#classroom_datepicker").datepicker('getDate');
        day = date.getDate();
        month = date.getMonth() + 1;
        year = date.getFullYear();
        
        classroom_id = $("#select_classroom").val();
        classroom_name = $("#select_classroom").find(':selected').text();
        
        if (classroom_id != 'Seleziona aula' && date) {
            $("#schedule_table_body").empty();
            
            for (var hour = 8; hour<16; hour++) {
                $("#schedule_table_body").append(
                '<tr class="clickable-row" id="hid_'+hour+'" value="'+hour+'">'+
                '<th>'+hour+':00</th><td></td>'+
                '</tr>');
            }
            
            
            var pRef = firebase.database().ref('institute/'+INSTITUTE_ID+'/prenotation/'+year+'/'+month+'/'+day+'/'+classroom_id+'/');
            pRef.once('value', snap => {
                var hour;
                var teacher_name;
                var class_name;
                var event_name;
                var teacher_id;
                var second_column;
                
                snap.forEach(childSnap => {
                    hour = childSnap.key;
                    childSnap.forEach(gcSnap => {
                        
                        if (gcSnap.key == 'teacher') {
                            teacher_name = gcSnap.val();
                        } else if (gcSnap.key == 'event') {
                            event_name = gcSnap.val();
                        } else if (gcSnap.key == 'class') {
                            class_name =  gcSnap.val();
                        } else if (gcSnap.key == 'teacher_key') {
                            teacher_id = gcSnap.val();
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
                        $("#hid_"+hour).addClass('mybook');
                    } else {
                        $("#hid_"+hour).addClass('booked');
                        $("#hid_"+hour).removeClass('clickable-row');
                    }
                });
            });
        }
    }

    function increase_mb_select(x) {
        mb_selected_rows += x;

        if (mb_selected_rows > 0) {
            $('#book_prenotation_btn').text('Rimuovi');
        } else {
            $('#book_prenotation_btn').text('Prenota');
        }
    }
});
