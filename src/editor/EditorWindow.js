import React from "react";
import { TextEditor } from "./TextEditor";
import { Grid } from "@material-ui/core";
import { ReactComponent as SaveIcon } from "../resources/save.svg";
import { propOrDefault } from "../utils";

export class EditorWindow extends React.Component {
  constructor(props) {
    super(props);
    this.editor = React.createRef();
    this.onSubmit = props.onSubmit;
    this.state = {
      title: propOrDefault(props.title, ""),
      content: propOrDefault(props.content, "")
    };
  }

  handleSubmit = () => {
    this.onSubmit(this.state.title, this.editor.current.getContent());
  };

  updateTitle = event => {
    this.setState({ title: event.target.value });
  };

  handleChangeComplete = color => {
    this.setState({ color: color.hex });
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
          onChange={content => {
            this.setState({ content: content });
          }}
          content={this.state.content || null}
        />
        <button className="EditorWindow-SaveButton Clickable" onClick={this.handleSubmit}>
          <SaveIcon style={{width:"100%", height:"100%"}}/>
        </button>
      </div>
    );
  }
}
