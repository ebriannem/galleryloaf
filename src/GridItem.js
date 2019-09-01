import React from "react";
import { EditorWindow } from "./editor/EditorWindow";
import { ReadOnlyEditor } from "./editor/ReadOnlyEditor";
import { stateToHTML } from "draft-js-export-html";

const gridItemStyle = {
  width: "100%",
  height: "100%",
  overflowX: "hidden",
  overflowY: "auto",
  paddingLeft: "5px"
};

const gridImageStyle = {
  width: "100%",
  height: "auto"
};

const gridTitleStyle = {};

const gridTextStyle = {
  width: "100%",
  textAlign: "left",
  paddingLeft: "10px"
};

export class GridItem extends React.Component {
  constructor(props) {
    super(props);
    this.key = props.key;
    this.image = props.image;
    this.title = props.title;

    this.bColor = props.color;
    this.reader = React.createRef();
    this.setAdding = props.setAdding;
    this.logKey = props.logKey;
    this.index = props.index;
    this.state = {
      hovering: false,
      content: props.content
    };
  }

  toggleHover = hover => {
    this.setState({
      hovering: hover
    });
  };

  openEditor = () => {
    console.log("O");
    this.logKey(this.title, this.state.content, this.color, this.index);
  };

  render() {
    return (
      <div
        onMouseEnter={() => this.toggleHover(true)}
        onMouseLeave={() => this.toggleHover(false)}
        style={{ backgroundColor: this.bColor, ...gridItemStyle }}
      >
        <button className="GridItem-EditButton" onClick={this.openEditor}>
          Edit
        </button>

        {this.title ? <h1 style={gridTitleStyle}>{this.title}</h1> : null}

        <DottedDivider />
        {this.image ? (
          <img style={gridImageStyle} alt={this.title} src={this.image} />
        ) : null}
        {this.content ? (
          <div style={gridTextStyle}>
            <ReadOnlyEditor ref={this.reader} content={this.state.content} />
          </div>
        ) : null}
      </div>
    );
  }
}

function DottedDivider(props) {
  return <hr className="dotted-divider" />;
}
