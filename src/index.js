import React, { useState } from "react";
import ReactDOM from "react-dom";
import GridLayout from "react-grid-layout";

import "./styles.css";
import { GridItem } from "./GridItem";
import { BasicLayout } from "./TestGrid";

function App() {
  var [layout, setLayout] = useState([]);

  var [items, setItems] = useState([]);

  var addToLayout = () => {
    var newItem = { title: "Title", text: <p>Hi</p> };
  };

  return (
    <div className="App">
      <BasicLayout />
      <GridLayout
        className="layout"
        cols={12}
        layout={layout}
        rowHeight={30}
        width={1200}
      >
        {items.map(i => (
          <GridItem key={i.title} title={i.title} image={i.image}>
            {i.text}
          </GridItem>
        ))}
      </GridLayout>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);