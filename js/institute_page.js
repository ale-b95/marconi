$(function () {
    
    $("#schedule_btn").on('click', () => {
        $("#schedule_table_body").empty();
        loadClassroomSelectList("select_classroom");
        loadClassSelectList("select_class");
        showPage($("#schedule_page"));
    });
    
    $("#events_btn").on('click', () => {
        $("#schedule_event_table_body").empty();
        loadClassroomSelectList("select_event_classroom");
        loadClassSelectList("select_event_class");
        loadClassSelectList("event_class");
        showPage($("#events_page"));
    });
    
    $("#prenotations_btn").on('click', () => {
        loadClassSelectList("select_prenotations");
        showPage($("#prenotations_page"));
    });
    
    function loadClassroomSelectList(select_classroom) {
        $('#'+select_classroom).empty();
        $('#'+select_classroom).append('<option>Seleziona aula</option>');
        const dbRef = firebase.database().ref('institute/' + INSTITUTE_ID + '/classroom/');
        
        var classroomList = dbRef.on('value', snap => {
            
            snap.forEach(childSnap => {
                var name = childSnap.child('/classroom_name').val();
                var key = childSnap.key;
                $('#'+select_classroom).append('<option value="'+key+'">'+name+ '</option>');
            });
        });
    }

    function loadClassSelectList(select_class, defaultmsg) {
        if (defaultmsg == null) {
            defaultmsg = "Seleziona classe";
        }
        
        $('#'+select_class).empty();
        $('#'+select_class).append('<option>'+ defaultmsg +'</option>');
        const dbRef = firebase.database().ref('institute/' + INSTITUTE_ID + '/class/');
        
        var classList = dbRef.on('value', snap => {
            
            snap.forEach(childSnap => {
                var name = childSnap.key;
                $('#'+select_class).append('<option>'+name+'</option>');
            });
        });
    }  
    
});