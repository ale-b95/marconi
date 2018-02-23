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
      .catch(e => {
        alert(e.message);
        console.log(e.message)
      });
    } else {
      alert('Wrong institute');
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
