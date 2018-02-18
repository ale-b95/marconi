$(function() {
//TODO check input data format
//------------------------------------------------------------------------------Sign In
  const formSignup = $('#signup_form')[0];
  const txtName = $("#sUpName")[0];
  const txtSurname = $("#sUpSurname")[0];
  const txtEmailSignup = $("#sUpEmail")[0];
  const txtPwdSignup = $("#sUpPwd")[0];
  const txtPwdSignupRep = $("#sUpPwdRep")[0];
  const btnSignup = $("#signup_button");

  btnSignup.on('click', e => {
    if (txtPwdSignup.value == txtPwdSignupRep.value) {
      // Get email and password
      const email = txtEmailSignup.value;
      const password = txtPwdSignup.value;
      var dispName = txtName.value + " " + txtSurname.value;
      // Sign up
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(()=> {
        firebase.auth().currentUser.updateProfile({
          displayName: dispName
        }).then(console.log('update successful')).catch(updateUser => console.log('user not updated ' + updateUser.message))
      }).catch(createUser => console.log('error during user creation ' + createUser.message));
      formSignup.reset();
    } else {
      //TODO check password
      $(this).closest('form').find("input[type=password]").val("");
    }
  });

//------------------------------------------------------------------------------Log In
  const txtEmailLogin = $("#lInEmail")[0];
  const txtPwdLogin = $("#lInPwd")[0];
  const btnLogin = $("#login_button");
  const btnLogout = $("#logout_button");

  btnLogin.on('click', e => {
    // Get email and password
    const email = txtEmailLogin.value;
    const pwd = txtPwdLogin.value;
    const auth = firebase.auth();
    // Sign in
    const promise = auth.signInWithEmailAndPassword(email, pwd);
    promise.catch(e => console.log(e.message));
  })

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



//------------------------------------------------------------------------------insert and get data from fatabase
  /*
  function writeProfData( name, surname, admin, pwd) {
    var dbRef = firebase.database().ref().child('docenti').push().set({
      nome: name,
      cognome: surname,
      admin: admin,
      password: pwd
    });
    //alert ("Docente inserito");
  }

  showProfList ();

  function showProfList () {
    const dbRef_doc = firebase.database().ref().child('docenti').orderByKey();
    dbRef_doc.on('child_added', snap => {
      $("#prof_list").append("<ul id='"+snap.key+"'>Id: "+snap.key+"</ul><br/>");
      snap.forEach(childSnap => {
        var key = childSnap.key;
        var childData = childSnap.val();
        if (key == "nome") {
          $("#"+snap.key+"").append("<li>Nome: "+childData+"</li>");
        } else if (key == "cognome") {
          $("#"+snap.key+"").append("<li>Cognome: "+childData+"</li>");
        } else if (key == "password") {
          $("#"+snap.key+"").append("<li>Password: "+childData+"</li>");
        } else if (key == "admin") {
          $("#"+snap.key+"").append("<li>Admin: "+childData+"</li>");
        } else if (key == "email") {
          $("#"+snap.key+"").append("<li>Email: "+childData+"</li>");
        }
      });
    });
  }
  */
});
