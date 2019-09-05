import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import { GalleryGrid } from "./grid/GalleryGrid";

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sections: [<GalleryGrid />],
      editing: false
    };
  }

  addSection = () => {
    this.setState({
      sections: [<GalleryGrid />, ...this.state.sections]
    });
  };

  setEditing = b => {
    this.setState({ editing: b });
  };

  getEditing = () => {
    return this.state.editing;
  };

  render() {
    return <div className="App">{this.state.sections}</div>;
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
