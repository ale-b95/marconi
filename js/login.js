$(function () {
  var current_page = null;
  var logged_institute_id = null;
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
    loadUserInfo();
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
/*
  called at every user state change (login / logout)
*/
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
        loadUserInfo();
        showPage($("#user_page"));

        var user = firebase.auth().currentUser;

        var dbRef = firebase.database().ref();

        dbRef.child('user/' + user.uid + '/user_data').set({
          name: txtName.value,
          surname: txtSurname.value,
          email: user.email
        }).catch(ops => console.log('ERROR '+ops.message));
      })
      .catch(createUser => console.log('error during user creation ' + createUser.message));
    } else {
      $(this).closest('form').find("input[type=password]").val("");
    }
  }

//------------------------------------------------------------------------------Log In
/*
  login with the user email and password, log into the default institute if
  it is se
*/
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

//------------------------------------------------------------------------------Automatic institute access
  /*
    after user login
    automatically log in the default institute (last logged one)
    if presen
  */
  function logDefaultInstitute() {
    /*
      get database and authentication reference to obtain user id and access to
      the "default institute" field of the user
    */
    const user = firebase.auth().currentUser;
    const ref = firebase.database().
                ref().
                child('user/' + user.uid + '/institute/default_institute');

    /*
      check if the "default institute" field is set
      if it's set automatically log on the institute page
    */
    ref.once('value', snap => {
      if (snap.val() != null) {
        logged_institute_id = snap.val();
         loadInstituteInfo();
        showPage($("#institute_page"));
      } else {
        loadUserInfo();
        showPage($("#user_page"));
      }
    });
  }

//------------------------------------------------------------------------------Institute creation
  /*
    create a new institute in the db and set the user as admin
  */
  function createInstitute() {
    /*
      get institte name from the html text input field
      retrive database and user reference
    */
    const institute_name = $("#nInstInstName")[0].value;
    const user = firebase.auth().currentUser;
    const ref = firebase.database().ref();
    /*
      check if the institute name is valid
    */
    if (institute_name.length >= 1 ) {
      /*
        if it is insert the institute in the db
        (an unique key is automatically generated)
      */
      var inst_ref = ref.child('institute').push({
        name: institute_name
      });

      /*
        get the reference (unique key) to the new institute
      */
      var inst_id = inst_ref.key;

      /*
        add the user to the institute's user list, grant him access and
        admin privileges
      */
      ref.child('institute/' + inst_id + '/user/'+ user.uid).set({
        name: user.displayName,
        admin: true,
        confirmed: true
      });

      /*
        add the institute to the user's institute list
      */
      ref.child('user/'+ user.uid +'/institute').update({
        [inst_id] : institute_name
      });

      /*
        set the institute as default institute for the user
      */
      ref.child('user/'+ user.uid + '/institute/').update({
        default_institute : inst_ref.key
      });

      /*
        send the user to the institute page
      */
      logged_institute_id = inst_ref.key;
      loadInstituteInfo ();
      showPage($("#institute_page"));
    } else {
      alert('Insert institute name');
    }
  }

//------------------------------------------------------------------------------Institute selection
  /*
    get the institutes name list allow the user to pick the one he wants to log
    on
  */
  function getInstituteList() {
    $("#my_institutes").empty();
    $("#all_institutes").empty();

    /*
      get database and user reference
    */
    const user = firebase.auth().currentUser;
    const dbRef = firebase.database().ref();

    /*
      retrive the list of the institutes known to the user
    */
    var user_inst = dbRef.child('user/'+ user.uid + '/institute/').orderByKey();
    user_inst.once('value', snap => {
      snap.forEach(childSnap => {
        var name = childSnap.val();
        var key = childSnap.key;
        if (key != 'default_institute') {
          /*
            show each one as a option in the html input field
          */
          $("#my_institutes").append('<option value="'+ key +'">'+ name +'</option>');
        }
      });
    });

    /*
      retrive the list of all institutes in the database
    */
    var global_inst = dbRef.child('institute/').orderByKey();
    global_inst.once('value', snap => {
      snap.forEach(childSnap => {
        var name = childSnap.child('name').val();
        var key = childSnap.key;
        /*
          show each one as a option in the html input field
        */
        $("#all_institutes").append('<option value="'+ key +'">'+ name +'</option>');
      });
    });
  }

//------------------------------------------------------------------------------Institute access
/*
  access to the selected institute

  it is required for the user to be confirmed by the institute admin
  access is denied otherwise
*/
  function logOnInstitute() {
    /*
      get the selected value from the selection field in the html page
    */
    var auth_user;
    var inst_id = $("#select_institute").val();
    var inst_name = $("#select_institute").find(':selected').text();

    /*
      ensure the value is valid
    */
    if (inst_name != 'Select Institute') {
      /*
        if it is get database and user reference
      */
      const user = firebase.auth().currentUser;
      const dbRef = firebase.database().ref();

      var confirmed = false;

      /*
        insert the institute to the user institute list
      */
      dbRef.child('user/' + user.uid + '/institute/').update({
        [inst_id] : inst_name
      });

      /*
        insert the user to the institute user list
      */
      dbRef.child('institute/' + inst_id + '/user/' + user.uid).update({
        name: user.displayName
      });

      /*
        check if the user is authorized to access to the institute page
      */
      dbRef.child('institute/' + inst_id + '/user/' + user.uid).once('value',snap => {
        snap.forEach(childSnap => {
          if (childSnap.key == 'confirmed' && childSnap.val() == true) {
            confirmed = true;
          }
        });

        /*
          if the user is confirmed, allow access otherwise notify the
          "waiing confirmation" status and go to the user page
        */
        if (confirmed) {
          /*
            set the institute as the default user institute
          */
          dbRef.child('user/' + user.uid + '/institute').update({
            default_institute : inst_id
          });
          logged_institute_id = inst_id;
          loadInstituteInfo();
          showPage($("#institute_page"));
        } else {
          loadUserInfo();
          showPage($("#user_page"));
          alert("Waiting Confirmation: Contact an institute admin to get access.")
        }
      });
    } else {
      alert('Select an institute');
    }
  }

/*
  show user data (name and password) on the user page
*/
  function loadUserInfo() {
    const user = firebase.auth().currentUser;
    $("#user_info").empty();
    $("#user_info").append("<p>User: "+ user.displayName + '<br/>Email: ' + user.email + '</p>');
  }

/*
  show institute info on institute page
*/
  function loadInstituteInfo () {
    if (logged_institute_id != null) {
      var ref = firebase.database().ref('institute/' + logged_institute_id);
      ref.once('value', snap => {
        snap.forEach(childSnap => {
          if (childSnap.key == 'name') {
            $("#institute_name_heander").text('Institute: ' + childSnap.val());
          }
        });
      });
    }
  }
});
