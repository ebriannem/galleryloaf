import React from "react";
import { ConvertFromRaw, EditorState } from "draft-js";
import { TextEditor } from "./TextEditor";

export class ReadOnlyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.editor = React.createRef();
    this.content = props.content;
  }

  render() {
    return (
      <div className="readonly-editor">
        <TextEditor ref={this.editor} content={this.content} readOnly={true} />
      </div>
    );
  }
}
