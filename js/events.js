$(function () {
    
    const eventTitle = $('#event_title')[0];
    
    //get date informations
    var date;
    
    //get classroom informations
    var classroom_name;
    var classroom_id;
    
    var cs_selected_rows = 0;

    var selected_hours = [];
    
    $('#events_create_datepicker').datepicker({
        format: 'dd/mm/yyyy',
        language: "it",
        autoclose: true,
        todayHighlight: true,
        toggleActive: true,
        daysOfWeekHighlighted: "0"
    });
    
    $('#events_show_datepicker').datepicker({
        format: 'mm/yyyy',
        language: "it",
        autoclose: true,
        todayHighlight: true,
        toggleActive: true,
        viewMode: "months", 
        minViewMode: "months"
    });
    
    $('#events_create_datepicker').on('changeDate', () => {
        if (classroom_name != "Seleziona aula") {
            loadClassroomSchedule();
        }
    });
    
    $("#select_event_classroom").on('change', () => {
        if (date) {
            loadClassroomSchedule();
        }
    });
    
    $('#new_event_btn').on('click', () => {
        $('#main_events_page').hide();
        $('#new_event_page').show();
    });
    
    $('#abort_event_btn').on('click', () => {
        $('#new_event_page').hide();
        $('#main_events_page').show();
        $("#schedule_event_table_body").empty();
        
        selected_hours = [];
        cs_selected_rows = 0;
    });
    
    $('#schedule_event_table').on('click', '.clickable-row', function(event){
        var idx;

        if ($(this).hasClass('selected_row')) {
            $(this).removeClass('selected_row');
            idx = selected_hours.indexOf($(this).attr('value'));
            if (idx >= 0) selected_hours.splice(idx, 1);
            cs_selected_rows--;
        } else if (!$(this).hasClass('selected_row') && !$(this).hasClass('mybook') && !$(this).hasClass('event_prenotation')) {
            $(this).addClass('selected_row');
            selected_hours.push($(this).attr('value'));
            cs_selected_rows++;
        }
    });
    
    $('#create_event_btn').on('click', () => {
        var today = Date.now() - (24*3600*1000);
        user = firebase.auth().currentUser;
        
        if (cs_selected_rows > 0 && date >= today && classroom_name != "Seleziona aula" && eventTitle.value != "") {
            var event_prenotation = firebase.database().ref('institute/'+INSTITUTE_ID+'/event/').push({
                title : eventTitle.value,
                classroom : classroom_name,
                classroom_key : classroom_id,
                date : day + '/' + month + '/' + year,
                teacher : user.displayName,
                teacher_key : user.uid,
                starting_hour : selected_hours[0]
            });
            
            for (var i = 0; i < selected_hours.length; i++) {            
                firebase.database().ref('institute/'+INSTITUTE_ID+'/prenotation/'+year+'/'+month+'/'+day+'/'+classroom_id+'/'+selected_hours[i]+'/').set({
                event_key : event_prenotation.key,
                event : eventTitle.value,
                classroom : classroom_name
                });
            }
            
            loadClassroomSchedule();
            cs_selected_rows = 0;
            $('#new_event_page').hide();
            $('#main_events_page').show();
            alert('Nuovo evento creato\nTitolo evento:  '+ eventTitle.value + '\nGiorno:  ' + day + '/' + month + '/' + year + '\nAula:  ' + classroom_name + '\nOra di inizio:  ' + selected_hours[0] + ':00');
            selected_hours = [];
        } else if (classroom_name == 'Seleziona aula') {
            alert ("Seleziona un'aula");
        } else if (date < today) {
            alert('ERRORE: Non possono essere effettuate modifiche per la data selezionata.');
        }
    });
    
    function loadClassroomSchedule() {
        date = $("#events_create_datepicker").datepicker('getDate');
        day = date.getDate();
        month = date.getMonth() + 1;
        year = date.getFullYear();
        
        classroom_id = $("#select_event_classroom").val();
        classroom_name = $("#select_event_classroom").find(':selected').text();
        
        if (classroom_id != 'Seleziona aula' && date) {
            $("#schedule_event_table_body").empty();
            
            for (var hour = 8; hour<16; hour++) {
                $("#schedule_event_table_body").append(
                '<tr class="clickable-row" id="hid_'+hour+'" value="'+hour+'">'+
                '<th>'+hour+':00</th><td></td>'+
                '</tr>');
            }
            
            
            var pRef = firebase.database().ref('institute/'+INSTITUTE_ID+'/prenotation/'+year+'/'+month+'/'+day+'/'+classroom_id+'/');
            pRef.once('value', snap => {
                var hour;
                var teacher_name;
                var class_name;
                var event_title;
                var teacher_id;
                var event_key;
                var second_column;
                
                snap.forEach(childSnap => {
                    hour = childSnap.key;
                    childSnap.forEach(gcSnap => {
                        
                        if (gcSnap.key == 'teacher') {
                            teacher_name = gcSnap.val();
                        } else if (gcSnap.key == 'event') {
                            event_title = gcSnap.val();
                        } else if (gcSnap.key == 'class') {
                            class_name =  gcSnap.val();
                        } else if (gcSnap.key == 'event_key') {
                            event_key = gcSnap.val();
                        } else if (gcSnap.key == 'teacher_key') {
                            teacher_id = gcSnap.val();
                        }
                    }); 

                    if (event_title) {
                        second_column = event_title;
                    } else {
                        second_column = class_name + ' ' + teacher_name;
                    }

                    $("#hid_"+hour).empty();
                    $("#hid_"+hour).append('<th>'+hour+':00</th><td>'+ second_column +'</td>');
                    user = firebase.auth().currentUser;
                    
                    
                    $("#hid_"+hour).empty();
                    $("#hid_"+hour).append('<th>'+hour+':00</th><td>'+ second_column +'</td>');
                    
                    if (event_key) {
                        $("#hid_"+hour).addClass('event_prenotation');
                        $("#hid_"+hour).val(event_key);              
                    } else {
                        user = firebase.auth().currentUser;
                    
                        if (user.uid == teacher_id){
                            $("#hid_"+hour).addClass('mybook');
                        } else {
                            $("#hid_"+hour).addClass('booked');
                            $("#hid_"+hour).removeClass('clickable-row');
                        }
                    }
                });
            });
        }
    }
});