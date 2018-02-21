$(function() {

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
