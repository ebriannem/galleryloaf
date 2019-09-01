import React from "react";
import { TextEditor } from "./TextEditor";
import { Grid, TextField } from "@material-ui/core";
import { CirclePicker } from "react-color";
import { stateToHTML } from "draft-js-export-html";

const colorOptions = ["#4a4e69", "#9a8c98", "#c9ada7", "#f2e9e4"];

export class EditorWindow extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = props.onSubmit;
    this.editor = React.createRef();
    this.state = {
      title: props.title || "",
      color: props.color || "#4a4e69",
      content: props.content
    };
  }

  handleSubmit = () => {
    this.onSubmit(
      this.state.title,
      this.editor.current.getContent(),
      this.state.color
    );
  };

  updateTitle = event => {
    this.setState({ title: event.target.value });
  };

  handleChangeComplete = color => {
    this.setState({ color: color.hex });
    console.log(color.hex);
  };

  render() {
    return (
      <div id="editor-window">
        <Grid container justify="space-between">
          <Grid item>
            <input
              style={{ float: "left", margin: "0" }}
              label="Title"
              value={this.state.title}
              onChange={this.updateTitle}
              margin="normal"
            />
          </Grid>
          <Grid item>
            <CirclePicker
              color={this.state.color}
              onChangeComplete={this.handleChangeComplete}
              colors={colorOptions}
            />
          </Grid>
        </Grid>
        <TextEditor
          onChange={content => {
            this.setState({ content: content });
          }}
          ref={this.editor}
          backgroundColor={this.state.selectedColor}
          content={this.state.content || null}
        />
        <button className="EditorWindow-SaveButton" onClick={this.handleSubmit}>
          {this.state.title ? "Save!" : "Exit!"}
        </button>
      </div>
    );
  }
}
