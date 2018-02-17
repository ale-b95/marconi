$(function() {


//inserisci docente
  $("#add_prof_button").click(function() {
    if ($("#add_prof_pwd")[0].value ==  $("#add_prof_pwd_r")[0].value) {
      writeProfData(
        $("#add_prof_name")[0].value,
        $("#add_prof_surname")[0].value,
        $("#add_prof_admin").is(":checked"),
        $("#add_prof_pwd")[0].value);
      $('#add_prof_form')[0].reset();
    } else {
      alert("le password non corrispondono");
      $(this).closest('form').find("input[type=password]").val("");
    }
  });

  function writeProfData( name, surname, admin, pwd) {
    var dbRef = firebase.database().ref().child('docenti').push().set({
      nome: name,
      cognome: surname,
      admin: admin,
      password: pwd
    });
    //alert ("Docente inserito");
  }

//visualizza docenti
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
        }
      });
    });
  }

});
