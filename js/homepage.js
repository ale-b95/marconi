$(function () {

  $("#new_institute_button").on('click', () => {
    $("#user_page").hide();
    $("#new_institute").show();
  });

  $("#fromNItoUP").on('click', () => {
    $("#new_institute").hide();
    $("#user_page").show();
  })

  $("#create_institute_button").on('click', () => {
    createInstitute();
  })

  $("#log_institute_button").on('click', () => {
    $("#user_page").hide();
    $("#log_institute").show();
    getInstituteList();
  })

  $("#fromLItoUP").on('click', () => {
    $("#log_institute").hide();
    $("#user_page").show();
  })

  function createInstitute() {
    const institute_name = $("#nInstInstName")[0].value;
    const auth = firebase.auth();
    const ref = firebase.database().ref();

    var inst_ref = ref.child('institute').push({
      name: institute_name
    });

    var inst_id = inst_ref.key;

    ref.child('institute/' + inst_id + '/user/'+ auth.currentUser.uid).set({
      name: auth.currentUser.displayName
    });

    ref.child('user/'+ auth.currentUser.uid +'/institute').update({
      [inst_id] : institute_name
    });

    $("#new_institute").hide();
    $("#user_page").show();
  }

  function getInstituteList() {
    const dbRef = firebase.database().ref();
  }




});
