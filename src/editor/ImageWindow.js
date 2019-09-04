import React from "react";
import { Grid } from "@material-ui/core";
import {ReactComponent as SaveIcon} from "../resources/save.svg";
import {propOrDefault} from "../utils";

export class ImageWindow extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = props.onSubmit;
    this.state = {
      src: propOrDefault(props.src, "")
    };
  }

  handleSubmit = () => {
    this.onSubmit(
        this.state.src
    );
  };

  updateSrc = event => {
    this.setState({ src: event.target.value });
  };
  render() {
    return (
        <div id="image-window">
          <Grid container justify="space-between">
            <Grid item>
              <input
                  style={{ float: "left", margin: "0" }}
                  value={this.state.src}
                  onChange={this.updateSrc}
              />
            </Grid>
            <Grid item>
          <button className="ImageWindow-SaveButton" onClick={this.handleSubmit} style={{height:"100%"}}>
            <SaveIcon style={{height:"auto", width:"auto"}}/>
          </button>
            </Grid>
          </Grid>
        </div>
    );
  }
}
