$(function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBcWoPOfCRHwFpOE2gFncQD6HtIiD1ftro",
    authDomain: "marconi-2c01d.firebaseapp.com",
    databaseURL: "https://marconi-2c01d.firebaseio.com",
    projectId: "marconi-2c01d",
    storageBucket: "",
    messagingSenderId: "916037440328"
  };
  firebase.initializeApp(config);

  var bigOne = document.getElementById('bigOne');
  var dbRef = firebase.database().ref().child('text');
  dbRef.on('value', snap => bigOne.innerText = snap.val());
});
