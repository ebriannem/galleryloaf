import React from "react";
import * as firebase from 'firebase'

const config = {
//removed
};
firebase.initializeApp(config);
var db = firebase.firestore();
export default db;
