$(function () {
  $("#admin_btn").on('click', () => {
    showPage($("#administration_page"));
  });

  $("#roles_and_permission_btn").on('click', () => {
    loadUsersList();
    showPage($("#roles_and_permission_page"));
  });

  $("#admin_classrooms_btn").on('click', () => {
    loadClassroomList();
    showPage($("#admin_classrooms_page"));
  });

  $("#add_classroom_btn").on('click', () => {
    addClassroom();
  })

  function loadUsersList() {
    $("#user_table_body").empty();
    const USER = firebase.auth().currentUser;
    const dbRef = firebase.database().ref('institute/' + INSTITUTE_ID + '/user/');
    var user_list = dbRef.on('value', snap => {
      snap.forEach(childSnap => {
        var name;
        var admin = null;
        var confirmed = null;
        childSnap.forEach(gcSnap => {
          if (gcSnap.key == 'name') {
            name = gcSnap.val();
          } else if (gcSnap.key == 'admin'){
            admin = gcSnap.val();
          } else if (gcSnap.key == 'confirmed'){
            confirmed = gcSnap.val();
          }
        });

        if (confirmed == null) {
          confirmed = 'false';
        }

        if (admin == null) {
          admin = 'false';
        }


        $("#user_table_body").append('<tr id="'+childSnap.key+'"><td>'+name+'</td>'+
        '<td><button class="btn btn-primary btn-sm conf_btn" type="button">'+confirmed+'</button></td>'+
        '<td><button class="btn btn-primary btn-sm admin_btn" type="button">'+admin+'</button></td></tr>');

        $("#"+childSnap.key+" .conf_btn").on('click', function() {
          institute_user_ref = dbRef.child(childSnap.key);
          if (USER.uid != childSnap.key) {
            if (confirmed == true) {
              institute_user_ref.update({
                confirmed: false,
                admin: false
              });
              $("#"+childSnap.key+" .conf_btn").text('false');
              $("#"+childSnap.key+" .admin_btn").text('false');
            } else {
              institute_user_ref.update({
                confirmed: true
              });
              $("#"+childSnap.key+" .conf_btn").text('true');
            }
          } else {
            alert('Cannot modify your own privileges')
          }

          loadUsersList();
        });

        $("#"+childSnap.key+" .admin_btn").on('click', function() {
          institute_user_ref = dbRef.child(childSnap.key);
          if (USER .uid != childSnap.key) {
            if (admin == true) {
              institute_user_ref.update({
                admin: false
              });
              $("#"+childSnap.key+" .admin_btn").text('false');
            } else {
              institute_user_ref.update({
                admin: true,
                confirmed: true
              });
              $("#"+childSnap.key+" .admin_btn").text('true');
              $("#"+childSnap.key+" .conf_btn").text('true');
            }
          } else {
            alert('Cannot modify your own privileges');
          }
          loadUsersList();
        });
      });
    });
  }

  function addClassroom() {
    const classroomName = $("#classroom_name")[0];
    const classroomCapacity = $("#classroom_capacity")[0];
    const dbRef = firebase.database().ref();

    dbRef.child('institute/'+INSTITUTE_ID+'/classroom').push({
      classroom_name : classroomName.value,
      classroom_capacity : classroomCapacity.value
    }).catch(error => console.log('user not updated ' + error.message)).then(() =>{
      loadClassroomList();
      $("#classroom_name").val("");
      $("#classroom_capacity").val("");      
    });
  }

  function loadClassroomList() {
    $("#admin_classroom_table_body").empty();
    const dbRef = firebase.database().ref('institute/' + INSTITUTE_ID + '/classroom/');
    var classroomList =  dbRef.on('value', snap => {
      snap.forEach(childSnap => {
        var name;
        var capacity;
        childSnap.forEach(gcSnap => {
          if (gcSnap.key == 'classroom_name') {
            name = gcSnap.val();
          } else if (gcSnap.key == 'classroom_capacity'){
            capacity = gcSnap.val();
          }
        });
        $("#admin_classroom_table_body").append('<tr><td>'+name+'</td>'+
        '<td>'+capacity+'</td>'+
        '<td><button class="btn btn-primary btn-sm rm_classroom_btn" type="button">X</button></td></tr>');
      });
    });
  }
});