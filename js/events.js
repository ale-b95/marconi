$(function () {
    
    //get date informations
    var date;
    
    //get classroom informations
    var classroom_name;
    var classroom_id;
    
    $("#events_btn").on('click', () => {
        showPage($("#events_page"));
    });
    
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
    
    $('#new_event_btn').on('click', () => {
        $('#main_events_page').hide();
        $('#new_event_page').show();
    });
    
    $('#abort_event_btn').on('click', () => {
        $('#new_event_page').hide();
        $('#main_events_page').show();
    });
});