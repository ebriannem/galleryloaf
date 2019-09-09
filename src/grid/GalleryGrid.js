import React from "react";
import _ from "lodash";
import RGL, {WidthProvider} from "react-grid-layout";
import {GridItem} from "./GridItem";
import {EditorWindow} from "../editor/EditorWindow";
import {convertFromRaw, convertToRaw} from "draft-js";
import {ReactComponent as CameraIcon} from "../resources/camera.svg";
import {ReactComponent as TextIcon} from "../resources/file-text.svg";
import {ReactComponent as TypeIcon} from "../resources/type.svg";

import {ReactComponent as EditIcon} from "../resources/edit.svg";
import {ImageWindow} from "../editor/ImageWindow";
import {propOrDefault} from "../utils";
import classNames from "classnames";
import Slide from "react-reveal/Slide";
import Flip from "react-reveal/Flip";

import {layout} from "../data";
import {deleteDocument, getDocumentAll, getSection, setDocument, setSection} from "../firebase/Database";
import {SectionWindow} from "../editor/SectionWindow";

const uuidv4 = require("uuid/v4");

const ReactGridLayout = WidthProvider(RGL);

export class GalleryGrid extends React.Component {
  constructor(props) {
    super(props);
    this.firstChange = true;
    this.user = props.user;
    this.state = {
      editingTitle: false,
      id: props.id,
      loaded: false,
      title: props.title,
      isEditing: false,
      loadingNew: false,
      cols: 50,
      addingText: false,
      addingImage: false,
      editingOld: false,
      current: {}
    };
  }

  newId = (id) => {
    this.setState({
      loadingNew: false
    });
    this.firstChange = true;
    this.loadFromDbId(id);
    getSection(this.user, id).then((section) => {
      this.setState(
          {
            id: id,
            title: section.get("title"),
            layout: JSON.parse(section.get("layout")),
            loadingNew: true
          });
    });
  };

  onLayoutChange = l => {
    if (!this.firstChange) {
      this.setState({
        layout: l
      });
      setSection(this.user, this.state.id, {title: this.state.title, layout: JSON.stringify(l)});
    }
    this.firstChange = false
  };

  componentWillUnmount() {
    this.logData("componentWillUnmount");
    console.log("Setting layout...")
    setSection(this.user, this.state.id, {title: this.state.title, layout: JSON.stringify(this.state.layout)});
  }

  componentDidMount() {
    this.logData("componentDidMount");
    console.log("Mounted");
    this.initialLoad()
    this.setState({
      loadingNew: true
    })
  };

  initialLoad = () => {
    this.logData("initialLoad");
    getSection(this.user, this.state.id).then((sectionData) => {
      this.setState({
        title: sectionData.get("title"),
      });
      if (sectionData.get("layout") !== undefined) {
        this.setState({
          layout: JSON.parse(sectionData.get("layout"))
        })
      }
    });
    getDocumentAll(this.user, this.state.id).then((documents) => {
      let docs = documents.docs.map(doc => {
        return {title: doc.data().title, content: doc.data().content, image: doc.data().image, id: doc.id}
      });
      this.setState({
        itemsContent: docs,
        items: docs.length
      })

    });
  }


  loadFromDbId = (id) => {
    this.logData("loadFromDbId");
    getDocumentAll(this.user, id).then((documents) => {
      let docs = documents.docs.map(doc => {
        return {title: doc.data().title, content: doc.data().content, image: doc.data().image, id: doc.id}
      });
      if (docs === undefined) {
        docs = []
      }
      this.setState({
        itemsContent: docs,
        items: docs.length
      })
    })
  };


  loadFromDb = () => {
    this.logData("loadFromDb");
    this.loadFromDbId(this.state.id)
  };

  updateContent = item => {
    this.logData("updateContent");
    this.state.current = item;
    this.setEditingOld(true);
  };

  addItem = item => {
    this.logData("addItem");
    console.log("Adding item")
    const id = item.id || uuidv4();
    setDocument(this.user, this.state.id, id, {
      title: propOrDefault(item.title, ""),
      content: item.content !== undefined ? convertToRaw(item.content) : "",
      image: propOrDefault(item.image, "")
    });
    this.setState({
      layout: [
        ...this.state.layout,
        {
          i: id,
          x: 10,
          y: 10,
          w: 50,
          h: 50,
          minW: 10,
          maxW: 10
        }
      ]
    })
    this.loadFromDb();
  };

  addText = (title, content) => {
    this.logData("addText");
    if (title) {
      this.addItem({
        title: title,
        content: content
      });
    }
    this.setAdding(false);
  };
  addImage = src => {
    this.logData("addImage");
    if (src) {
      this.addItem({
        image: src
      });
    }
    this.setAddingImage(false);
  };

  deleteItem = (id) => {
    this.logData("deleteItem");
    deleteDocument(this.user, this.state.id, id);
    this.loadFromDb();
  };

  updateText = (id, title, content) => {
    this.logData("updateText");
    this.setEditingOld(false);
    setDocument(this.user, this.state.id, id, {
      title: title,
      content: convertToRaw(content),
    });
    this.loadFromDb();
  };

  updateTitle = (title) => {
    this.setState({title: title, editingTitle: false});
    setSection(this.user, this.state.id, {
      title: title,
    });
  };

  /*
  /*
  State Setting
   */

  triggerEditing = () =>
      this.setState({
        isEditing: !this.state.isEditing
      });
  setAdding = toggle => {
    this.setState({addingText: toggle});
  };
  setAddingImage = toggle => {
    this.setState({addingImage: toggle});
  };
  setEditingOld = toggle => {
    this.setState({editingOld: toggle});
  };
  setEditingTitle = toggle => {
    this.setState({editingTitle: toggle});
  };


  /*
  Rendering
   */

  editingWindow = () =>
      this.state.addingText ? (
          <div className="popup">
            <EditorWindow onSubmit={this.addText}/>
          </div>
      ) : this.state.addingImage ? (
          <div className="popup">
            <ImageWindow onSubmit={this.addImage}/>
          </div>
      ) : this.state.editingOld ? (
          <div className="popup">
            <EditorWindow title={this.state.current.title} content={this.state.current.content}
                          onSubmit={(title, content) => this.updateText(this.state.current.id, title, content)}/>
          </div>
      ) : this.state.editingTitle ? (
          <div className="popup">
            <SectionWindow title={this.state.title}
                           onSubmit={this.updateTitle}/>
          </div>
      ) : null;

  logData = (name) => {
    console.log(name)
    console.log(this.state.layout)
    console.log(this.state.itemsContent)
  }
  generateDOM = () => {
    this.logData("generateDOM");
    let stuff = this.state.itemsContent;
    let updateContent = this.updateContent;
    let editFunc = () => this.state.isEditing;
    let deleteFunc = this.deleteItem;
    let contents = _.map(_.range(this.state.itemsContent.length), function (i) {
      return (
          <div key={stuff[i].id}>
            <GridItem
                delete={deleteFunc}
                editing={editFunc}
                id={stuff[i].id}
                title={stuff[i].title}
                content={
                  stuff[i].content ? convertFromRaw(stuff[i].content) : false
                }
                image={stuff[i].image ? stuff[i].image : false}
                updateFunc={updateContent}
            />
          </div>
      );
    });
    console.log(contents);
    return contents;
  };

  render() {
    return (
        <div className={"Gallery-Grid"} style={{overflowX: "hidden"}}>
          {this.editingWindow()}
          <div className={"edit-bar"}>
            <Slide top collapse when={this.state.isEditing}>
              <button onClick={() => this.setAdding(true)}>
                <TextIcon className={"Clickable"}/>
              </button>
              <button onClick={() => this.setAddingImage(true)}>
                <CameraIcon className={"Clickable"}/>
              </button>
              <button onClick={() => this.setEditingTitle(true)}>
                <TypeIcon className={"Clickable"}/>
              </button>
            </Slide>
            <button onClick={this.triggerEditing}>
              <EditIcon
                  className={classNames(
                      "toggleable",
                      this.state.isEditing ? "toggled" : "untoggled"
                  )}
              />
            </button>
          </div>
            <div className={"gallery-content"}>

              <h1 className={"Gallery-Title Line"}>
                <span>{this.state.title}</span>
              </h1>
              {this.state.itemsContent !== undefined ?
                  <ReactGridLayout
                      layout={this.state.layout}
                      items={this.state.items}
                      isDraggable={this.state.isEditing}
                      isResizable={this.state.isEditing}
                      onLayoutChange={this.onLayoutChange}
                      margin={[10, 4]}
                      cols={this.state.cols}
                      rowHeight={5}
                  >
                    {this.generateDOM()}
                  </ReactGridLayout>
                  : null}
            </div>
        </div>
    );
  }
}
