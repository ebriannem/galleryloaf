import React from "react";
import * as firebase from 'firebase'

const config = {
  apiKey: "AIzaSyCaxt87Q-q7sKHvPQ_7Dy7twykBm7h-eoU",
  authDomain: "galleryloaf.firebaseapp.com",
  databaseURL: "https://galleryloaf.firebaseio.com",
  projectId: "galleryloaf",
  storageBucket: "galleryloaf.appspot.com",
  messagingSenderId: "3295628774",
  appId: "1:3295628774:web:38dbe0d6ec682942"};
firebase.initializeApp(config);
var db = firebase.firestore();
export default db;
