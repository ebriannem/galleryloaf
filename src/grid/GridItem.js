import React from "react";
import { ReadOnlyEditor } from "../editor/ReadOnlyEditor";
import { elementOrNull } from "../utils";
import classNames from "classnames";
import {ReactComponent as EditIcon} from "../resources/edit.svg";
import {ReactComponent as DeleteIcon} from "../resources/trash-2.svg";

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
    this.updateFunc = props.updateFunc;
    this.state = {
      content: props.content,
      title: props.title
    };
    this.updaterr = this.updaterr.bind(this);
    this.editing = props.editing;
    this.deleteSelf = () => props.delete(props.id);
  }

  updaterr() {
    this.updateFunc({id: this.id, title: this.title, content: this.state.content})
  }


  render() {
    return (
      <div className={classNames("grid-item", this.image ? "ImageItem" : "TextItem")}>
        {this.title !== "" ?
        <div><button className={classNames("item-edit-button", this.editing() ? "visible" : "hidden", "Clickable")} onClick={this.updaterr}><EditIcon/></button>
          <button className={classNames("item-edit-button", this.editing() ? "visible" : "hidden", "Clickable")} onClick={this.deleteSelf}><DeleteIcon/></button></div>
            : null}
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
