import React from "react";
import { Grid } from "@material-ui/core";
import {ReactComponent as SaveIcon} from "../../resources/save.svg";
import {propOrDefault} from "../../utils";

export class SectionWindow extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = props.onSubmit;
    this.state = {
      title: propOrDefault(props.title, "")
    };
  }

  handleSubmit = () => {
    this.onSubmit(
        this.state.title
    );
  };

  updateTitle = event => {
    this.setState({ title: event.target.value });
  };
  render() {
    return (
        <div className="popup">
        <div id="section-window">
          <Grid container justify="space-between">
            <Grid item>
              <input
                  style={{ float: "left", margin: "0" }}
                  value={this.state.title}
                  onChange={this.updateTitle}
              />
            </Grid>
            <Grid item>
              <button className="SectionWindow-SaveButton" onClick={this.handleSubmit} style={{height:"100%"}}>
                <SaveIcon style={{height:"auto", width:"auto"}}/>
              </button>
            </Grid>
          </Grid>
        </div>
        </div>
    );
  }
}
