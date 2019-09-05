import React from "react";
import { ReadOnlyEditor } from "../editor/ReadOnlyEditor";
import { elementOrNull } from "../utils";

const gridImageStyle = {
  width: "100%",
  height: "100%"
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
    this.id = props.id;
    this.image = props.image;
    this.title = props.title;
    this.image = props.image;
    this.reader = React.createRef();
    this.index = props.index;
    this.state = {
      content: props.content
    };
  }

  render() {
    return (
      <div className={this.image ? "ImageItem" : "TextItem"}>
        {elementOrNull(
          this.title,
          <div>
            <h1 style={gridTitleStyle}>{this.title}</h1>
            <DottedDivider />
          </div>
        )}
        {elementOrNull(
          this.image,
          <img style={gridImageStyle} alt={this.title} src={this.image} />
        )}
        {elementOrNull(
          this.state.content,
          <div style={gridTextStyle}>
            <ReadOnlyEditor ref={this.reader} content={this.state.content} />
          </div>
        )}
      </div>
    );
  }
}

function DottedDivider() {
  return <hr className="dotted-divider" />;
}
