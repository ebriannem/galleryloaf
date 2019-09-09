import db from "./firebase"

export function getSection(user, section) {
  let ref = db.collection('users').doc(user)
      .collection('sections').doc(section);
  return ref.get();
}

export function getDocumentAll(user, section) {
  let ref = db.collection('users').doc(user)
      .collection('sections').doc(section).collection('documents');
  return ref.get();
}

export function getSectionAll(user) {
  let ref = db.collection('users').doc(user)
      .collection('sections');
   return ref.get()
}

export function getDocument(user, section, document) {
  let ref = db.collection('users').doc(user)
      .collection('sections').doc(section)
      .collection('documents').doc(document);
  return ref.get()
}


export function setSection(user, section, data) {
  let ref = db.collection('users').doc(user)
      .collection('sections').doc(section);
  return ref.set(data, {merge: true})
}

export function setDocument(user, section, document, data) {
  let ref = db.collection('users').doc(user)
      .collection('sections').doc(section)
      .collection('documents').doc(document);
  return ref.set(data, {merge: true})
}

export function deleteSection(user, section) {
  let ref = db.collection('users').doc(user)
      .collection('sections').doc(section)
  return ref.delete()
}

export function deleteDocument(user, section, document) {
  let ref = db.collection('users').doc(user)
      .collection('sections').doc(section)
      .collection('documents').doc(document);
  return ref.delete()
}

