import React, {useState} from "react";
import ReactDOM from "react-dom";
import GridLayout from "react-grid-layout";


import "./styles.css";
import {GridItem} from "./GridItem";
import {GalleryGrid} from "./TestGrid";

export function App() {
  var [layout, setLayout] = useState([]);

  var [items, setItems] = useState([]);

  var addToLayout = () => {
    var newItem = {title: "Title", text: <p>Hi</p>};
  };

  return (
      <div className="App">
        <GalleryGrid/>
      </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <App/>, rootElement);
