import React from "react";
import _ from "lodash";
import RGL, {WidthProvider} from "react-grid-layout";
import {GridItem} from "./GridItem";
import {sizeMe} from "react-sizeme";
import {EditorWindow} from "./editor/EditorWindow";
import {convertFromRaw, convertToRaw} from "draft-js"
import db from "./firebase/firebase";
import {ReactComponent as CameraIcon} from './resources/camera.svg';
import {ReactComponent as TextIcon} from './resources/file-text.svg';
import {ReactComponent as EditIcon} from './resources/edit.svg';
import {ImageWindow} from "./editor/ImageWindow";
import {propOrDefault} from "./utils";


const uuidv4 = require('uuid/v4');

const ReactGridLayout = WidthProvider(RGL);

export class GalleryGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDraggable: false,
      isResizable: false,
      items: 0,
      layout: [],
      itemsContent: [],
      cols: 10,
      adding: false,
      addingImage: false,
    };
    this.loadFromDb();
  }

  loadFromDb = () => {
    db.collection("test").get().then((querySnapshot) => {
      let documents = querySnapshot.docs.map((doc) => {
        let data = doc.data();
        return ({
          id: doc.id,
          title: data["title"],
          content: data["content"],
          image: data["image"]
        });
      });
      let layouts = querySnapshot.docs.map((doc) => {
            let data = doc.data();
            return {i: doc.id, ...data["layout"]};
          }
      );
      this.setState({
        itemsContent: documents,
        items: documents.length,
        layout: layouts
      })
    });
  };

  /*
  Adding
   */

  addItem = item => {
    const id = item.id || uuidv4();
    db.collection("test").doc(id).set({
      title: propOrDefault(item.title, ""),
      content: (item.content !== undefined ? convertToRaw(item.content) : ""),
      image: propOrDefault(item.image, ""),
      layout: {
        i: id,
        ...item.layout
      }
    });
    this.loadFromDb();
  };

  addText = (title, content) => {
    if (title) {
      this.addItem({
        title: title,
        content: content,
        layout: {x: 0, y: 0, w: 5, h: 5}
      });
    }
    this.setAdding(false);
  };
  addImage = (src) => {
    if (src) {
      this.addItem({
        image: src,
        layout: {x: 0, y: 0, w: 5, h: 5}
      });
    }
    this.setAddingImage(false);
  };

  updateText = (id, title, content) => {
    this.setEditingOld(false);
    this.addItem({id: id, tile: title, content: content});
    this.triggerEditing();
  };

  /*
  State Setting
   */

  triggerEditing = () => this.setState({
        isResizable: !this.state.isResizable,
        isDraggable: !this.state.isDraggable
      });
  setAdding = toggle => {
    this.setState({adding: toggle});
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

  editingWindow = () => (
      this.state.adding ? (
              <div className="popup">
                <EditorWindow onSubmit={this.addText}/>
              </div>)
          :
              this.state.addingImage ? (
                  <div className="popup">
                    <ImageWindow
                        onSubmit={this.addImage}
                    />
                  </div>
              ): null
  );

  generateDOM = () => {
    let stuff = this.state.itemsContent;
    return _.map(_.range(this.state.items), function (i) {
      return (
          <div key={stuff[i].id}>
            <GridItem
                title={stuff[i].title}
                content={stuff[i].content ? convertFromRaw(stuff[i].content) : false}
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
            {this.state.isDraggable ?
            <div>
              <button onClick={() => this.setAdding(true)}><TextIcon/></button>
            <button onClick={() => this.setAddingImage(true)}><CameraIcon/></button></div>
                : null}
            <button onClick={this.triggerEditing}><EditIcon/></button>
          </div>
          <ReactGridLayout
              layout={this.state.layout}
              items={this.state.items}
              isDraggable={this.state.isDraggable}
              isResizable={this.state.isResizable}
              cols={this.state.cols}
              {...this.props}
          >
            {this.generateDOM()}
          </ReactGridLayout>
        </div>
    );
  }
}
