import * as firebase from "firebase";

const config = {};
firebase.initializeApp(config);

const db = firebase.firestore();
export default db;
