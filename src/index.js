import React from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";
import "./styles.css";
import {GalleryGrid} from "./components/grid/GalleryGrid";
import {ReactComponent as AddIcon} from "./resources/add.svg";
import {ReactComponent as ExpandIcon} from "./resources/expand.svg";
import {ReactComponent as UserIcon} from "./resources/user.svg";
import {ReactComponent as ShrinkIcon} from "./resources/shrink.svg";
import {Grid} from "@material-ui/core"
import {SectionWindow} from "./components/windows/SectionWindow";
import {sortableContainer, sortableElement, sortableHandle} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import {getSectionAll, setSection} from "./firebase/Database";

const uuidv4 = require("uuid/v4");

const DragHandle = sortableHandle(() => <span>::</span>);

const SortableContainer = sortableContainer(({children}) => {
  return <Grid className={"SortableList"}>{children}</Grid>;
});

export class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: "0",
      addingSection: false,
      expandingSection: false,
    };
    this.grid = React.createRef();
  }

  componentDidMount() {
    let script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js";
    script.async = true;
    script.type = 'text/javascript';
    document.head.appendChild(script);
    this.loadFromDB()
  }

  SortableItem = sortableElement(({value, id}) => (
      <Grid item>
        <button onClick={() => this.setSelected(id)}
                className={classNames("section-button", "toggleable", this.state.selected === id ? "toggled" : "untoggled", this.state.expandingSection ? "expanded" : "shrunk")}>
          <DragHandle/>
          {value}
        </button>
      </Grid>
  ));

  loadFromDB = () => {
    let setter = this;
    getSectionAll(this.state.user).then(function(querySnapshot) {
      let data = [];
      let names = []
      querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        data = [...data, doc.id];
        console.log(data)
        names = [...names, doc.get("title")];
        console.log(data)
      });
      if(data.length > 0) {
        setter.setState({
          sections: data,
          names: names,
          selected: data[0],
          addingSection: false
        });
      }
    });
  };

  addSection = (title) => {
    if (title !== "") {
      let newId = uuidv4();
      setSection(this.state.user, newId, {title: title, layout: JSON.stringify([])});
      this.loadFromDB();
    }
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
          <UserIcon/>
        </button>
        <button className={"Clickable section-toggle"}  onClick={this.openSectionPopup}>
          <AddIcon/>
        </button>
        <button className={"Clickable section-toggle"}  onClick={this.toggleExpandingSection}>
          {this.state.expandingSection ?
              <ShrinkIcon/> :
              <ExpandIcon/>}
        </button>
        {/*<button className={"Clickable section-toggle"}  onClick={this.deleteSection}>*/}
          {/*<DeleteIcon/>*/}
        {/*</button>*/}
        {this.state.selected !== undefined ?

        <SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
          {this.state.names.map((value, index) => (
              <this.SortableItem key={`item-${this.state.sections[index]}`}
                                 index={index} value={value}
                                 id={this.state.sections[index]}/>
          ))}
        </SortableContainer>
            : null}
      </div>
      {this.state.selected !== undefined ?
      <div className={classNames("gallery-section", this.state.expandingSection ? "shifted" : "unshifted")}>
        {<GalleryGrid ref={this.grid} user={this.state.user} id={this.state.selected}/>}
      </div>
          : null }
    </div>;
  }
}

const rootElement = document.getElementById("root");

ReactDOM.render(<App/>, rootElement);
