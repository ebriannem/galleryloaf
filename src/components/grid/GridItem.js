import React from "react";
import {ReadOnlyEditor} from "../editor/ReadOnlyEditor";
import {elementOrNull} from "../../utils";
import classNames from "classnames";
import {ReactComponent as EditIcon} from "../../resources/edit.svg";
import {ReactComponent as DeleteIcon} from "../../resources/trash-2.svg";

const gridImageStyle = {
  width: "100%",
  height: "100%"
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
    this.editing = props.editing;
    this.deleteSelf = () => props.delete(props.id);
  }

  updateContent = () => {
    this.updateFunc({id: this.id, title: this.state.title, content: this.state.content})
  }

  render() {
    return (
        <div className={classNames("grid-item", this.image ? "ImageItem" : "TextItem")}>
          {elementOrNull(
              this.editing,
              <div>
                <button className={classNames("item-edit-button", this.editing() ? "visible" : "hidden", "Clickable")}
                        onClick={this.updateContent}><EditIcon/></button>
                <button className={classNames("item-edit-button", this.editing() ? "visible" : "hidden", "Clickable")}
                        onClick={this.deleteSelf}><DeleteIcon/></button>
              </div>)}
          {elementOrNull(
              this.title,
              <div>
                <h1>{this.title}</h1>
              </div>
          )}
          {elementOrNull(
              this.image,
              <img style={gridImageStyle} alt={this.title} src={this.image}/>
          )}
          {elementOrNull(
              this.state.content,
                <div className="grid-item-text">
                  <ReadOnlyEditor ref={this.reader} content={this.state.content}/>
                </div>
          )}
        </div>
    );
  }
}