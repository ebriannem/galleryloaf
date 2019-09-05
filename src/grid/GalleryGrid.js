import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";
import { GridItem } from "./GridItem";
import { EditorWindow } from "../editor/EditorWindow";
import { convertFromRaw, convertToRaw } from "draft-js";
import db from "../firebase/firebase";
import { ReactComponent as CameraIcon } from "../resources/camera.svg";
import { ReactComponent as TextIcon } from "../resources/file-text.svg";
import { ReactComponent as EditIcon } from "../resources/edit.svg";
import { ImageWindow } from "../editor/ImageWindow";
import { propOrDefault } from "../utils";
import classNames from "classnames";
import Slide from "react-reveal/Slide";
import { items, layout } from "../data";

const uuidv4 = require("uuid/v4");

const ReactGridLayout = WidthProvider(RGL);

export class GalleryGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: propOrDefault(props.title, "New Section"),
      isEditing: false,
      layout: [],
      itemsContent: [],
      cols: 50,
      addingText: false,
      addingImage: false
    };
    this.initialLoad();
  }

  onLayoutChange = l => {
    db.collection("test")
      .doc("layout")
      .set({ layout: JSON.stringify(l) });
  };

  componentDidMount = () => {
    console.log("Mounted");
    this.setState({
      itemsContent: items,
      layout: layout
    });
  };

  initialLoad = () => {
    this.loadFromDb();
    let laydoc = db.collection("test").doc("layout");
    this.setState({
      layout: laydoc.get().then(doc => {
        console.log(doc.get("layout"));
        return JSON.parse(doc.get("layout"));
      })
    });
  };

  loadFromDb = () => {
    db.collection("test")
      .get()
      .then(querySnapshot => {
        let documents = querySnapshot.docs.map(doc => {
          let data = doc.data();
          return {
            id: doc.id,
            title: data["title"],
            content: data["content"],
            image: data["image"]
          };
        });
        this.setState({
          itemsContent: documents,
          items: documents.length
        });
      });
  };

  /*
  Adding
   */

  addItem = item => {
    const id = item.id || uuidv4();
    db.collection("test")
      .doc(id)
      .set({
        title: propOrDefault(item.title, ""),
        content: item.content !== undefined ? convertToRaw(item.content) : "",
        image: propOrDefault(item.image, "")
      });
    this.onLayoutChange([
      ...this.state.layout,
      {
        i: id,
        x: 0,
        y: 0,
        w: 2,
        h: 2
      }
    ]);
    this.loadFromDb();
  };

  addText = (title, content) => {
    if (title) {
      this.addItem({
        title: title,
        content: content
      });
    }
    this.setAdding(false);
  };
  addImage = src => {
    if (src) {
      this.addItem({
        image: src
      });
    }
    this.setAddingImage(false);
  };

  updateText = (id, title, content) => {
    this.setEditingOld(false);
    this.addItem({ id: id, tile: title, content: content });
    this.triggerEditing();
  };

  /*
  State Setting
   */

  triggerEditing = () =>
    this.setState({
      isEditing: !this.state.isEditing
    });
  setAdding = toggle => {
    this.setState({ addingText: toggle });
  };
  setAddingImage = toggle => {
    this.setState({ addingImage: toggle });
  };
  setEditingOld = toggle => {
    this.setState({ editingOld: toggle });
  };

  /*
  Rendering
   */

  editingWindow = () =>
    this.state.addingText ? (
      <div className="popup">
        <EditorWindow onSubmit={this.addText} />
      </div>
    ) : this.state.addingImage ? (
      <div className="popup">
        <ImageWindow onSubmit={this.addImage} />
      </div>
    ) : null;

  generateDOM = () => {
    let stuff = this.state.itemsContent;
    return _.map(_.range(this.state.itemsContent.length), function(i) {
      return (
        <div key={stuff[i].id}>
          <GridItem
            title={stuff[i].title}
            content={
              stuff[i].content ? convertFromRaw(stuff[i].content) : false
            }
            image={stuff[i].image ? stuff[i].image : false}
          />
        </div>
      );
    });
  };

  render() {
    return (
      <div>
        {this.editingWindow()}
        <div className={"edit-bar"}>
          <Slide top collapse when={this.state.isEditing}>
            <button onClick={() => this.setAdding(true)}>
              <TextIcon className={"toggleable"} />
            </button>
            <button onClick={() => this.setAddingImage(true)}>
              <CameraIcon className={"toggleable"} />
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
        <h1 className={"Gallery-Title"}>
          <span>{this.state.title}</span>
        </h1>
        <ReactGridLayout
          layout={this.state.layout}
          items={this.state.itemsContent.length}
          isDraggable={this.state.isEditing}
          isResizable={this.state.isEditing}
          onLayoutChange={this.onLayoutChange}
          margin={[10, 4]}
          cols={this.state.cols}
          rowHeight={5}
          {...this.props}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
}
