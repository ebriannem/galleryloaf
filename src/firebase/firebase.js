import * as firebase from "firebase";

const config = {
  apiKey: "fdsfsdfdsf",
  authDomain: "fdsfdsfsdfdsf",
  databaseURL: "sdfdsfdsf",
  projectId: "dsfdsfdsf",
  storageBucket: "dsfdsfdsf",
  messagingSenderId: "dsfdsfsdfdsf"
};
firebase.initializeApp(config);

var db = firebase.firestore();
export default db;
