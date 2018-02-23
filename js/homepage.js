$(function () {

  $("#new_institute_button").on('click', () => {
    $("#user_page").hide();
    $("#new_institute").show();
  });

  $("#create_institute_button").on('click', () => {
    createInstitute();
  })

  function createInstitute() {
    const institute_name = $("#nInstInstName")[0].value;
    const auth = firebase.auth();

    const REF = firebase.database().ref();
    const INST = firebase.database().ref('institutes');
    const GU = firebase.database().ref('global_users');

    var inst_ref = INST.push().set({
      name: institute_name
    }).then(snap => {
      const inst_id = snap.key
    });

    INST.child('users/'+ auth.currentUser.uid).set({
      name: auth.currentUser.displayName,
      email: auth.currentUser.email
    })

    REF.child('users/'+ auth.currentUser.uid).set({
      [inst_id] : [institute_name]
    })
  }

});
