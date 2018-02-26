$(function () {
  var current_page = null;
  function showPage(page) {
    if (current_page != null){
      current_page.hide();
    }

    current_page = page;
    current_page.show();
  }

  $("#signup_link").on('click',() => {
    showPage($("#signup"));
  });

  $(".login_page_btn").on('click',() => {
    showPage($("#login"));
  });

  $(".user_page_btn").on('click', () => {
    showPage($("#user_page"));
  })

  $("#login_button").on('click', () => {
    userLogin();
  });

  $("#signup_button").on('click', () => {
    registerNewUser();
  });

  $("#logout_button").on('click', () => {
    logOut();
  });

  $("#new_institute_button").on('click', () => {
    showPage($("#new_institute"));
  });

  $("#create_institute_button").on('click', () => {
    createInstitute();
  });

  $("#log_institute_button").on('click', () => {
    getInstituteList();
    showPage($("#log_institute"));
  });

  $("#choose_inst").on('click', () => {
    logOnInstitute();
  });


//------------------------------------------------------------------------------Auth state
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      console.log(firebaseUser);
      console.log('logged in');

      logDefaultInstitute();
    } else {
      console.log('not logged in');
      showPage($("#login"));
    }
  });

  function logDefaultInstitute() {
    const dbRef = firebase.database().ref();

    var user = firebase.auth().currentUser;
    var ref = dbRef.child('user/' + user.uid + '/default_institute');

    ref.once('value', snap => {
      if (snap.val() != null) {
        showPage($("#institute_page"));
      } else {
        showPage($("#user_page"));
      }
    });
  }

//------------------------------------------------------------------------------Sign Up
// creates a new user and updates its displayName
  function registerNewUser() {
    const formSignup = $('#signup_form')[0];
    const txtName = $("#sUpName")[0];
    const txtSurname = $("#sUpSurname")[0];
    const txtEmailSignup = $("#sUpEmail")[0];
    const txtPswd = $("#sUpPwd")[0];
    const txtPswdRep = $("#sUpPwdRep")[0];

    if (txtPswd.value == txtPswdRep.value) {
      // Get email and password
      var dispName = txtName.value + " " + txtSurname.value;
      // Sign up
      firebase.auth().createUserWithEmailAndPassword(txtEmailSignup.value, txtPswd.value)
      .then(() => {
        // Set a displayName for the user
        firebase.auth().currentUser.updateProfile({
          displayName: dispName
        })
        .catch(updateUser => console.log('user not updated ' + updateUser.message))
      })
      .then(() => {
        showPage($("#user_page"));

        var user = firebase.auth().currentUser;

        var dbRef = firebase.database().ref();

        dbRef.child('user/'+user.uid).set({
          name: txtName.value,
          surname: txtSurname.value,
          email: user.email
        }).catch(ops => console.log('ERROR '+ops.message));
      })
      .catch(createUser => console.log('error during user creation ' + createUser.message));
    } else {
      //TODO check password
      $(this).closest('form').find("input[type=password]").val("");
    }
  }

//------------------------------------------------------------------------------Log In
  function userLogin() {
    const txtEmailLogin = $("#lInEmail")[0];
    const txtPwdLogin = $("#lInPwd")[0];

    const email = txtEmailLogin.value;
    const pwd = txtPwdLogin.value;

    firebase.auth().signInWithEmailAndPassword(email, pwd).then(() =>{
      logDefaultInstitute();
    }).catch(e => console.log('login error: ' + e.message));
  }

//------------------------------------------------------------------------------Log Out
  function logOut() {
    firebase.auth().signOut();
    showPage($("#login"));
  }

  function createInstitute() {
    const institute_name = $("#nInstInstName")[0].value;
    const user = firebase.auth().currentUser;
    const ref = firebase.database().ref();
    if (institute_name.length >= 6 ) {
      var inst_ref = ref.child('institute').push({
        name: institute_name
      });

      var inst_id = inst_ref.key;

      ref.child('institute/' + inst_id + '/user/'+ user.uid).set({
        name: user.displayName,
        admin: true,
        confirmed: true
      });

      ref.child('user/'+ user.uid +'/institute').update({
        [inst_id] : institute_name
      });

      ref.child('user/'+ user.uid).update({
        default_institute : inst_ref.key
      });

      showPage($("#institute_page"));
    } else {
      alert('Insert institute name');
    }
  }

//TODO trovare modo per caricare più velocemente
  function getInstituteList() {
    $("#my_institutes").empty();
    $("#all_institutes").empty();

    const user = firebase.auth().currentUser;
    const dbRef = firebase.database().ref();

    var user_inst = dbRef.child('user/'+ user.uid + '/institute/').orderByKey();
    user_inst.once('value', snap => {
      snap.forEach(childSnap => {
        var name = childSnap.val();
        var key = childSnap.key;
        $("#my_institutes").append('<option value="'+ key +'">'+ name +'</option>');
      });
    });

    var global_inst = dbRef.child('institute/').orderByKey();
    global_inst.once('value', snap => {
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

      if (inst_name != 'Select Institute') {
        const user = firebase.auth().currentUser;
        const dbRef = firebase.database().ref();

        var confirmed = false;

        // add institute to user
        dbRef.child('user/' + user.uid + '/institute/').update({
          [inst_id] : inst_name
        });

        // add user to institute
        dbRef.child('institute/' + inst_id + '/user/' + user.uid).update({
          name: user.displayName
        });

        // check if authorized user
        dbRef.child('institute/' + inst_id + '/user/' + user.uid).once('value',snap => {
          snap.forEach(childSnap => {
            if (childSnap.key == 'confirmed' && childSnap.val() == true) {
              confirmed = true;
            }
          });

          dbRef.child('user/' + user.uid).update({
            default_institute : inst_id
          });

          if (confirmed) {
            showPage($("#institute_page"));
          } else {
            showPage($("#user_page"));
            alert("Waiting Confirmation")
          }
        });
      } else {
        alert('Select an institute');
      }
    }
});
