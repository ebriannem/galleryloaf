import React from "react";
import { TextEditor } from "../editor/TextEditor";
import { Grid } from "@material-ui/core";
import { ReactComponent as SaveIcon } from "../../resources/save.svg";
import { ReactComponent as CheckIcon } from "../../resources/check.svg";
import { ReactComponent as ExitIcon } from "../../resources/exit.svg";

import { propOrDefault } from "../../utils";

export class EditorWindow extends React.Component {
  constructor(props) {
    super(props);
    this.editor = React.createRef();
    this.closeSelf = props.closeSelf;
    this.saveContent = props.saveContent;
    this.state = {
      title: propOrDefault(props.title, ""),
      content: propOrDefault(props.content, false)
    };
  }

  handleSubmit = () => {
    this.handleSave();
    this.closeSelf();
  };

  handleSave = () => {
    this.saveContent(this.state.title, this.editor.current.getJsonString());
  };

  updateTitle = event => {
    this.setState({ title: event.target.value });
  };

  render() {
    return (
      <div id="editor-window">
        <Grid container justify="space-between">
          <Grid item>
            <input
              placeholder={"Title..."}
              style={{ float: "left", margin: "0" }}
              value={this.state.title}
              onChange={this.updateTitle}
            />
          </Grid>
        </Grid>
        <TextEditor
          ref={this.editor}
          json={this.state.content}
        />
        <button className="EditorWindow-Button Clickable" onClick={this.handleSave}>
          <SaveIcon style={{width:"100%", height:"100%"}}/>
        </button>
        <button className="EditorWindow-Button Clickable" onClick={this.handleSubmit}>
          <CheckIcon style={{width:"100%", height:"100%"}}/>
        </button>
        <button className="EditorWindow-Button Clickable" onClick={this.closeSelf}>
          <ExitIcon style={{width:"100%", height:"100%"}}/>
        </button>
      </div>
    );
  }
}
