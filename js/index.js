$(function() {
  const btnSignup = $("#signup_button");
  const btnLogin = $("#login_button");
  const btnLogout = $("#logout_button");

//------------------------------------------------------------------------------Sign Up
  btnSignup.on('click', e => {
    registerNewUser();
  });

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
        firebase.auth().currentUser.updateProfile({
          displayName: dispName
        }).then(console.log('update successful')).catch(updateUser => console.log('user not updated ' + updateUser.message))
      }).catch(createUser => console.log('error during user creation ' + createUser.message));
      formSignup.reset();
    } else {
      //TODO check password
      $(this).closest('form').find("input[type=password]").val("");
    }
  }

//------------------------------------------------------------------------------Log In
  btnLogin.on('click', e => {
    userLogin();
  });

  function userLogin() {
    const txtInstituteLogin = $("#lInInstitute")[0];
    const txtEmailLogin = $("#lInEmail")[0];
    const txtPwdLogin = $("#lInPwd")[0];

    const institute = txtInstituteLogin.value;
    const email = txtEmailLogin.value;
    const pwd = txtPwdLogin.value;

    // Check if institute exists
    firebase.database().ref(institute).once('value').then(snap => {
      if (snap.exists()) {
        // Log in
        firebase.auth().signInWithEmailAndPassword(email, pwd)
        .then(() => {
        // Check if user already exists in institute
          firebase.database().ref().child(institute +'/users')
          .orderByChild('email').equalTo(email).once('value', snap => {
            const data = snap.val();
            console.log('checking data');
            if (data) {
              console.log('element found');
            } else {
        // If not add it
              console.log('element not found: insert element');
              var user = firebase.auth().currentUser;
              writeUserData(institute, user.displayName, email, false, user.uid, 'true');
            }
          });
          showUserList ();
        })
        .catch(e => console.log(e.message));
      } else {
        alert('wrong institute');
      }
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


//------------------------------------------------------------------------------Log Out
  btnLogout.on('click', e => {
    firebase.auth().signOut();
  });

//------------------------------------------------------------------------------Auth state
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      console.log(firebaseUser);

    } else {
      console.log('not logged in');
    }
  });

//------------------------------------------------------------------------------User insertion in database
  function showUserList (institute) {
    alert('ok1');
    const dbRef_doc = firebase.database().ref().child(institute + '/users').orderByKey();
    alert('ok2');
    dbRef_doc.on('value', snap => {
      $("#user_list").append("<ul id='"+snap.key+"'>Id: "+snap.key+"</ul><br/>");
      snap.forEach(childSnap => {
        var key = childSnap.key;
        var childData = childSnap.val();
        if (key == "name") {
          $("#"+snap.key+"").append("<li>Name: "+childData+"</li>");
        } else if (key == "email") {
          $("#"+snap.key+"").append("<li>Email: "+childData+"</li>");
        } else if (key == "admin") {
          $("#"+snap.key+"").append("<li>Admin: "+childData+"</li>");
        }
      });
    });
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
