import React from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";
import "./styles.css";
import {GalleryGrid} from "./grid/GalleryGrid";
import db from "./firebase/firebase";
import {ReactComponent as AddIcon} from "./resources/add.svg";
import {ReactComponent as ExpandIcon} from "./resources/expand.svg";
import {ReactComponent as ShrinkIcon} from "./resources/shrink.svg";
import {Grid} from "@material-ui/core"
import {SectionWindow} from "./editor/SectionWindow";
import {sortableContainer, sortableElement, sortableHandle} from 'react-sortable-hoc';
import arrayMove from 'array-move';

const uuidv4 = require("uuid/v4");

const DragHandle = sortableHandle(() => <span>::</span>);


const SortableContainer = sortableContainer(({children}) => {
  return <Grid justify={"column"} className={"SortableList"}>{children}</Grid>;
});


export class App extends React.Component {
  constructor(props) {
    super(props);
    let ids = ["0"];
    this.state = {
      sections: ids,
      selected: ids[0],
      addingSection: false,
      expandingSection: false
    };
    this.grid = React.createRef();
    this.loadFromDB();
  }

  SortableItem = sortableElement(({value}) => (
      <Grid item>
        <button onClick={() => this.setSelected(value)}
                className={classNames("section-button", "toggleable", this.state.selected === value ? "toggled" : "untoggled", this.state.expandingSection ? "expanded" : "shrunk")}>
          <DragHandle/>
          {value}
        </button>
      </Grid>
  ));

  loadFromDB = () => {
    let sectionNames = db.collection("sectiondata").doc("metadata");
    if (sectionNames !== undefined) {
      sectionNames.get().then(data => {
        let names = data.get("names");
        if (names !== undefined) {
          this.setState({
            sections: names,
            selected: names[0],
            addingSection: false
          });
          console.log(names.length)
        }
      });
    }
  };

  addSection = (title) => {
    if (title !== "") {
      let newId = uuidv4();
      let newSections = [newId, ...this.state.sections];
      this.setState({
        sections: newSections,
        selected: newId
      });
      let sectionDoc = db.collection("sectiondata").doc(newId);
      sectionDoc.set({title: title});
      this.grid.current.newId(newId);
      let sectionNames = db.collection("sectiondata").doc("metadata");
      sectionNames.set({names: newSections});
    }
    this.toggleAddingSection(false);
  };

  onSortEnd = ({oldIndex, newIndex}) => {
    this.setState({
      sections: arrayMove(this.state.sections, oldIndex, newIndex),
    });
  };


  openSectionPopup = () => {
    this.toggleAddingSection(true)
  }

  toggleAddingSection = (b) => {
    this.setState({
      addingSection: b
    })
  }

  toggleExpandingSection = () => {
    this.setState({
      expandingSection: !this.state.expandingSection
    })
  }

  setSelected = (id) => {
    this.setState({selected: id});
    this.grid.current.newId(id);
  }


  render() {
    return <div className="App">
      {this.state.addingSection ? <SectionWindow onSubmit={this.addSection}/> : null}
      <div className={classNames("section-bar", this.state.expandingSection ? "expanded" : "shrunk")}>
        <button className={"Clickable section-toggle"}  onClick={this.openSectionPopup}>
          <AddIcon/>
        </button>
        <button className={"Clickable section-toggle"}  onClick={this.toggleExpandingSection}>
          {this.state.expandingSection ?
              <ShrinkIcon/> :
              <ExpandIcon/>}
        </button>
        <SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
          {this.state.sections.map((value, index) => (
              <this.SortableItem key={`item-${value}`} index={index} value={value}/>
          ))}
        </SortableContainer>
      </div>
      <div className={classNames("gallery-section", this.state.expandingSection ? "shifted" : "unshifted")}>
        {<GalleryGrid ref={this.grid} id={this.state.selected}/>}
      </div>
    </div>;
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
