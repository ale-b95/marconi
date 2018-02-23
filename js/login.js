$(function () {
  $("#signup_link").on('click',() => {
    $("#login").hide();
    $("#signup").show();
  });

  $(".login_link").on('click',() => {
    $("#signup").hide();
    $("#login").show();
  });

  $("#login_button").on('click', () => {
    //logOut();
    userLogin();
  });

  $("#signup_button").on('click', () => {
    //logOut();
    registerNewUser();
  });

  $("#logout_button").on('click', () => {
    logOut();
    $("#user_page").hide();
    $("#login").show();
  });

  $("#close_alert_msg").on('click', () => {
    $("#alert_msg").hide();
  })

//------------------------------------------------------------------------------Auth state
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      console.log(firebaseUser);
      console.log('logged in');
      $("#login").hide();
      $("#user_page").show();
    } else {
      console.log('not logged in');
      $("#login").show();
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
        $("#signup").hide();
        $("#user_page").show();
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
      $("#login").hide();
      $("#user_page").show();
    }).catch(e => console.log('login error: ' + e.message));
  }

//------------------------------------------------------------------------------Log Out
  function logOut() {
    firebase.auth().signOut();
  }
});
