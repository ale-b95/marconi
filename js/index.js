$(function() {

  const btnSignup = $("#signup_button");
  const btnLogin = $("#login_button");
  const btnLogout = $("#logout_button");

  var instituteName = null;
  var instituteId = null;

  btnLogin.on('click', e => {
    logOut();
    userLogin();
  });

  btnSignup.on('click', e => {
    logOut();
    registerNewUser();
  });

  btnLogout.on('click', e => {
    logOut();
  });
//------------------------------------------------------------------------------Auth state
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      //console.log(firebaseUser);
      console.log('logged in');
    } else {
      console.log('not logged in');
    }
  });

//------------------------------------------------------------------------------Sign Up
// creates a new user and updates its displayName
  function registerNewUser() {
    const formSignup = $('#signup_form')[0];
    const txtName = $("#sUpName")[0];
    const txtSurname = $("#sUpSurname")[0];
    const txtEmailSignup = $("#sUpEmail")[0];
    const txtPwdSignup = $("#sUpPwd")[0];
    const txtPwdSignupRep = $("#sUpPwdRep")[0];

    if (txtPwdSignup.value == txtPwdSignupRep.value) {
      // Get email and password
      const email = txtEmailSignup.value;
      const password = txtPwdSignup.value;
      var dispName = txtName.value + " " + txtSurname.value;
      // Sign up
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        // Set a displayName for the user
        firebase.auth().currentUser.updateProfile({
          displayName: dispName
        }).catch(updateUser => console.log('user not updated ' + updateUser.message))
      }).catch(createUser => console.log('error during user creation ' + createUser.message));
      formSignup.reset();
    } else {
      //TODO check password
      $(this).closest('form').find("input[type=password]").val("");
    }
    logOut();
  }

//------------------------------------------------------------------------------Log In
  function userLogin() {
    const txtInstituteLogin = $("#lInInstitute")[0];
    const txtEmailLogin = $("#lInEmail")[0];
    const txtPwdLogin = $("#lInPwd")[0];

    const institute = txtInstituteLogin.value;
    const email = txtEmailLogin.value;
    const pwd = txtPwdLogin.value;

    // Check if institute exists
    firebase.database().ref(institute).once('value', snap => {
      if (snap.exists()) {
        setGlobalInstituteNameAndId(institute);
        // Log in
        firebase.auth().signInWithEmailAndPassword(email, pwd)
        .then(() => {
        // Check if user already exists in institute
          firebase.database().ref().child(institute +'/users')
          .orderByChild('email').equalTo(email).once('value', snap => {
            const data = snap.val();
            if (data) {
            } else {
        // If not add it
              console.log('first login with this institute: add user to the institute');
              var user = firebase.auth().currentUser;
              writeUserData(institute, user.displayName, email, false, user.uid, 'true');
            }
          });
          showUserList (instituteName, instituteId);
        })
        .catch(e => console.log(e.message));
      } else {
        alert('wrong institute');
      }
    });
  }

  function setGlobalInstituteNameAndId(institute) {
    instituteId = institute;
    firebase.database().ref( institute + '/institute name').once('value', snap => {
      instituteName = snap.val();
      $('#topHeader').text('Institute: ' + instituteName);
    });
  }

  function writeUserData(institute, displayName, email, admin, uid, verified) {
    console.log('write user data');
    firebase.database().ref().child('institute-id/users').push().set({
      name: displayName,
      email: email,
      admin: admin,
      uid: uid,
      verified: verified
    });
  }

//------------------------------------------------------------------------------User insertion in database
  function showUserList (instituteName, instituteId) {
    if (instituteName && instituteId) {
      $("#showUserHeader").text('Show '+ instituteName + ' users');
      const dbRef_doc = firebase.database().ref().child(instituteId + '/users').orderByKey();
      dbRef_doc.once('value', snap => {
        snap.forEach(childSnap => {
          $("#user_list").append("<ul id='"+childSnap.key+"'>Id: "+childSnap.key);
          childSnap.forEach(grandChildSnap => {
            var key = grandChildSnap.key;
            var childData = grandChildSnap.val();
            if (key == "name") {
              $("#"+childSnap.key+"").append("<li>Nome: "+childData+"</li>");
            } else if (key == "email") {
              $("#"+childSnap.key+"").append("<li>Cognome: "+childData+"</li>");
            } else if (key == "admin") {
              $("#"+childSnap.key+"").append("<li>Admin: "+childData+"</li>");
            }
          });
          $("#user_list").append("</ul><br/>");
        });
      });
    }
  }

  function logOut() {
    firebase.auth().signOut();
    $("#user_list").empty();
    $("#showUserHeader").text('Not logged');
    $('#topHeader').text('Not logged');

    instituteId = null;
    instituteName = null;
  }

//------------------------------------------------------------------------------insert and get data from fatabase
  /*
  function writeData(data) {
    var dbRef = firebase.database().ref().child('dataNode').push().set({
      data:data
    });
    //alert ("data insert");
  }

  showData ();

  function showData () {
    const dbRef_doc = firebase.database().ref().child('dataNode').orderByKey();
    dbRef_doc.on('child_added', snap => {
      $("#list").append("<ul id='"+snap.key+"'>Id: "+snap.key+"</ul><br/>");
      snap.forEach(childSnap => {
        var key = childSnap.key;
        var childData = childSnap.val();
        if (key == "data") {
          $("#"+snap.key+"").append("<li>Data: "+childData+"</li>");
        }
      });
    });
  }
  */
});
