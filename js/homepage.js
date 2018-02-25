$(function () {
  $("#new_institute_button").on('click', () => {
    $("#user_page").hide();
    $("#new_institute").show();
  });

  $("#fromNItoUP").on('click', () => {
    $("#new_institute").hide();
    $("#user_page").show();
    getInstituteList();
  })

  $("#create_institute_button").on('click', () => {
    createInstitute();
  })

  $("#log_institute_button").on('click', () => {
    getInstituteList();
    $("#user_page").hide();
    $("#log_institute").show();
  })

  $("#fromLItoUP").on('click', () => {
    $("#log_institute").hide();
    $("#user_page").show();
  })

  $("#choose_inst").on('click', () => {
    logOnInstitute();
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
      name: auth.currentUser.displayName,
      admin: true,
      confirmed: true
    });

    ref.child('user/'+ auth.currentUser.uid +'/institute').update({
      [inst_id] : institute_name
    });

    $("#new_institute").hide();
    $("#user_page").show();
  }

  function getInstituteList(callback) {
    $("#my_institutes").empty();
    $("#all_institutes").empty();

    const user = firebase.auth().currentUser;
    const dbRef = firebase.database().ref();

    var user_inst = dbRef.child('user/'+ user.uid + '/institute/').orderByKey();
    user_inst.once('value').then(snap => {
      snap.forEach(childSnap => {
        var name = childSnap.val();
        var key = childSnap.key;
        $("#my_institutes").append('<option value="'+ key +'">'+ name +'</option>');
      });
    });

    var global_inst = dbRef.child('institute/').orderByKey();
    global_inst.once('value').then(snap => {
      snap.forEach(childSnap => {
        var name = childSnap.child('name').val();
        var key = childSnap.key;
        $("#all_institutes").append('<option value="'+ key +'">'+ name +'</option>');
      });
    });
  }

  function logOnInstitute() {
    var auth_user;
    var inst_id = $("#select_institute").val();
    var inst_name = $("#select_institute").find(':selected').text();

    const user = firebase.auth().currentUser;
    const dbRef = firebase.database().ref();

    // add institute to user
    dbRef.child('user/' + user.uid + '/institute/').update({
      [inst_id] : inst_name
    });

    // add user to institute
    dbRef.child('institute/' + inst_id + '/user/' + user.uid).update({
      name: user.displayName
    });

    // check if authorized user
  }
});
