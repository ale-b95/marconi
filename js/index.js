$(function() {
  var uid = 0;

  var prof_name = $("#add_prof_name")[0];
  var prof_surname = $("#add_prof_surname")[0];
  var prof_pwd = $("#add_prof_pwd")[0];
  var prof_pwd_r = $("#add_prof_pwd_r")[0];
  var prof_admin = $("#add_prof_admin");

  $("#add_prof_button").click(function() {
    if (prof_pwd.value == prof_pwd_r.value) {
      writeProfData(uid, prof_name.value, prof_surname.value, prof_admin.is(":checked"), prof_pwd.value);
      uid++;
      $('#add_prof_form')[0].reset();
    } else {
      alert("le password non corrispondono");
      $(this).closest('form').find("input[type=password]").val("");
    }
  });

  function writeProfData(profId, name, surname, admin, pwd) {
    var dbRef = firebase.database().ref().child("docenti").push().set({
      nome: name,
      cognome: surname,
      admin: admin,
      password: pwd
    });
    alert ("Docente inserito");
  }
});
