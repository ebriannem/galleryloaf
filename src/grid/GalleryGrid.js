import React from "react";
import _ from "lodash";
import RGL, {WidthProvider} from "react-grid-layout";
import {GridItem} from "./GridItem";
import {EditorWindow} from "../editor/EditorWindow";
import {convertFromRaw, convertToRaw} from "draft-js";
import db from "../firebase/firebase";
import {ReactComponent as CameraIcon} from "../resources/camera.svg";
import {ReactComponent as TextIcon} from "../resources/file-text.svg";
import {ReactComponent as EditIcon} from "../resources/edit.svg";
import {ImageWindow} from "../editor/ImageWindow";
import {propOrDefault} from "../utils";
import classNames from "classnames";
import Slide from "react-reveal/Slide";
import {items, layout} from "../data";

const uuidv4 = require("uuid/v4");

const ReactGridLayout = WidthProvider(RGL);

export class GalleryGrid extends React.Component {
  constructor(props) {
    super(props);

    this.id = propOrDefault(props.id, uuidv4());
    this.state = {

      title: propOrDefault(props.title, "New Section"),
      isEditing: false,
      layout: [],
      itemsContent: [],
      cols: 50,
      addingText: false,
      addingImage: false,
      editingOld: false,
      current: {}
    };
  }

  newId = (id) => {
    this.id = id;
    this.loadFromDb();
    let secdoc = db.collection("sectiondata").doc(id);
    if (secdoc !== undefined) {
      console.log("loading new section..");
      secdoc.get().then(doc => {
        console.log(doc);
        let title = doc.get("title");
        this.setState({title: title});
        let layout = doc.get("layout");
        if (layout !== undefined) {
          console.log("loaded..");
          console.log(layout)

          this.setState({
            layout: JSON.parse(layout)
          });
        }
      });

    }
    this.loadFromDbId(id)
  }

  onLayoutChange = l => {
    console.log(this.id)
    if (l.length > 0) {
      db.collection("sectiondata")
          .doc(this.id)
          .set({title: this.state.title, layout: JSON.stringify(l)});
      this.setState({
        layout: l
      })
    }
  };

  componentDidMount() {
    console.log("Mounted");
    this.initialLoad()
  };

  initialLoad = () => {
    this.loadFromDb();
    let laydoc = db.collection("sectiondata").doc(this.id);
    if (laydoc !== undefined) {
      console.log("loading layout..");
      laydoc.get().then(doc => {
        console.log(doc);
        let layout = doc.get("layout");
        if (layout !== undefined) {
          console.log("loaded..");
          console.log(layout)
          this.setState({
            layout: JSON.parse(layout)
          });
        }
      });

    }
  };

  loadFromDbId = (id) => {
    db.collection(id)
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


  loadFromDb = () => {
    this.loadFromDbId(this.id)
  };

  /*
  Adding
   */

  updateContent = item => {
    this.state.current = item;
    this.setEditingOld(true);
  }

  addItem = item => {
    const id = item.id || uuidv4();
    db.collection(this.id)
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
        w: 10,
        h: 10,
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
    console.log(id);
    console.log(title);
    db.collection(this.id)
        .doc(id)
        .set({
          title: title,
          content: convertToRaw(content),
        });
    this.loadFromDb();
  };

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
      ) : null;

  generateDOM = () => {
    let stuff = this.state.itemsContent;
    let updateContent = this.updateContent;
    return _.map(_.range(this.state.itemsContent.length), function (i) {
      return (
          <div key={stuff[i].id}>
            <GridItem
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
  };

  render() {
    return (
        <div className={"Gallery-Grid"}>
          {this.editingWindow()}
          <div className={"edit-bar"}>
            <Slide top collapse when={this.state.isEditing}>
              <button onClick={() => this.setAdding(true)}>
                <TextIcon className={"Clickable"}/>
              </button>
              <button onClick={() => this.setAddingImage(true)}>
                <CameraIcon className={"Clickable"}/>
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
        </div>
    );
  }
}
