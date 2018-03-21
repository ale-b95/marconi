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

  $("#admin_classes_btn").on('click', () => {
    loadClassList();
    showPage($("#admin_classes_page"));
  });

  $("#add_classroom_btn").on('click', () => {
    addClassroom();
  });

  $("#add_class_btn").on('click', () => {
    addClassToDb();
  });

  $("#schedule_btn").on('click', () => {
    $("#schedule_table_body").empty();
    loadClassroomSelectList();
    loadClassSelectList();
    showPage($("#schedule_page"));
  });

  $("#events_btn").on('click', () => {
    showPage($("#events_page"));
  });

  $("#prenotations_btn").on('click', () => {
    showPage($("#prenotations_page"));
  });

  loadClassList();

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
    if (classroomName.value != '' && classroomCapacity.value != '') {
      dbRef.child('institute/'+INSTITUTE_ID+'/classroom').push({
        classroom_name : classroomName.value,
        classroom_capacity : classroomCapacity.value
      }).catch(error => console.log('user not updated ' + error.message)).then(() =>{
        $("#classroom_name").val("");
        $("#classroom_capacity").val("");
        loadClassroomList();
      });
    }
  }

  function loadClassroomList() {
    $("#admin_classroom_table_body").empty();
    const dbRef = firebase.database().ref('institute/' + INSTITUTE_ID + '/classroom/');
    var classroomList =  dbRef.once('value', snap => {
      snap.forEach(childSnap => {
        var key =  childSnap.key;
        var name;
        var capacity;
        childSnap.forEach(gcSnap => {
          if (gcSnap.key == 'classroom_name') {
            name = gcSnap.val();
          } else if (gcSnap.key == 'classroom_capacity'){
            capacity = gcSnap.val();
          }
        });
        var my_btn = '<tr><td>'+name+'</td>'+
        '<td>'+capacity+'</td>'+
        '<td><button id="'+ key +'" class="btn btn-primary btn-sm" type="button">X</button></td></tr>';

        $("#admin_classroom_table_body").append(my_btn);

        $("#"+key).on('click', () => {
          $("#admin_classroom_table_body").empty();
          dbRef.child(key).remove();
          loadClassroomList();
        });
      });
    });
  }

  function loadClassroomSelectList() {
    $('#select_classroom').empty();
    $('#select_classroom').append('<option>Select a Classroom</option>');
    const dbRef = firebase.database().ref('institute/' + INSTITUTE_ID + '/classroom/');
    var classroomList = dbRef.on('value', snap => {
      snap.forEach(childSnap => {
        var name = childSnap.child('/classroom_name').val();
        var key = childSnap.key;

        $('#select_classroom').append('<option value="'+key+'">'+name+ '</option>');
      });
    });
  }

  function loadClassSelectList() {
    $('#select_class').empty();
    $('#select_class').append('<option>Select a Class</option>');
    const dbRef = firebase.database().ref('institute/' + INSTITUTE_ID + '/class/');
    var classList = dbRef.on('value', snap => {
      snap.forEach(childSnap => {
        var name = childSnap.key;
        $('#select_class').append('<option>'+name+'</option>');
      });
    });
  }

  function addClassToDb() {
    var className = $("#class_name")[0].value;
    var nOfStudents = $("#n_of_students")[0].value;
    if (className && className != '' && nOfStudents) {
      firebase.database().ref('institute/' +INSTITUTE_ID+ '/class/'+className).
      set({
        number_of_students : nOfStudents
      }).catch(error => console.log(error.message)).then(() =>{
        $("#class_name").val("");
        $("#n_of_students").val("");
        loadClassList();
      });
    } else {
      console.log('wrong form compilation');
    }
  }

  function loadClassList() {
    $("#admin_classes_table_body").empty();
    const dbRef = firebase.database().ref('institute/' + INSTITUTE_ID + '/class/');
    dbRef.once('value', snap => {
      snap.forEach(childSnap => {
        var className = childSnap.key;
        var numberOfStudents;
        childSnap.forEach(gcSnap => {
          if (gcSnap.key == "number_of_students") {
            numberOfStudents = gcSnap.val();
          }
        });
        var tableRow = '<tr><td>'+className+'</td><td>'+numberOfStudents+'</td>'+
        '<td><button id="'+ className +'" class="btn btn-primary btn-sm" type="button">X</button></td></tr>';
        $("#admin_classes_table_body").append(tableRow);
        $("#"+className).on('click', () => {
          $("#admin_class_table_body").empty();
          dbRef.child(className).remove();
          loadClassList();
        });
      })
    });
  }
});
