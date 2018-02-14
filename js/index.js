$(function() {
  //var bigOne = document.getElementById('bigOne');
  var bigOne = $("#hey")[0];
  var dbRef = firebase.database().ref().child('text');
  dbRef.on('value', snap => bigOne.innerText = snap.val());
});
