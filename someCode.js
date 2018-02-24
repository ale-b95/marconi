
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
