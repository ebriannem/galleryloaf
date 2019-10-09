import React from "react";
import { TextEditor } from "./TextEditor";

export class ReadOnlyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.content = props.content;
  }

  render() {
    return (
      <div className="readonly-editor">
        <TextEditor json={this.content} readOnly={true} />
      </div>
    );
  }
}
