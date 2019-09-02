// import {notesRef} from './firebase'
// const FETCH_ITEMS = 'FETCH_TODOS';
//
// export const addItem = newItem => async dispatch => {
//   notesRef.push().set(newItem);
// };
// export const fetchItems = () => async dispatch => {
//   notesRef.on("value", snapshot => {
//     dispatch({
//       type: FETCH_ITEMS,
//       payload: snapshot.val()
//     });
//   });
// };