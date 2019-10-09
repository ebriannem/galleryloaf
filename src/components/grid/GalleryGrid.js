import React from "react";
import RGL, {WidthProvider} from "react-grid-layout";
import {GridItem} from "./GridItem";
import {EditorWindow} from "../windows/EditorWindow";
import {ReactComponent as CameraIcon} from "../../resources/camera.svg";
import {ReactComponent as TextIcon} from "../../resources/file-text.svg";
import {ReactComponent as TypeIcon} from "../../resources/type.svg";
import {ReactComponent as EditIcon} from "../../resources/edit.svg";
import {ImageWindow} from "../windows/ImageWindow";
import {propOrDefault} from "../../utils";
import classNames from "classnames";
import Slide from "react-reveal/Slide";

import {layout} from "../../data";
import {deleteDocument, getDocumentAll, getSection, setDocument, setSection} from "../../firebase/Database";
import {SectionWindow} from "../windows/SectionWindow";

const uuidv4 = require("uuid/v4");

const ReactGridLayout = WidthProvider(RGL);

export class GalleryGrid extends React.Component {
  constructor(props) {
    super(props);
    this.firstChange = true;
    this.user = props.user;
    this.cols = 50
    this.state = {
      editingTitle: false,
      id: props.id,
      title: props.title,
      isEditing: false,
      addingText: false,
      addingImage: false,
      editingOld: false,
      recentItem: {}
    };
  }

  newId = (id) => {
    this.firstChange = true;
    this.loadFromDbId(id);
    getSection(this.user, id).then((section) => {
      this.setState(
          {
            id: id,
            title: section.get("title"),
            layout: JSON.parse(section.get("layout")),
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
    setSection(this.user, this.state.id,
        {title: this.state.title, layout: JSON.stringify(this.state.layout)});
  }
  
  componentDidMount() {
    this.initialLoad()
  };

  initialLoad = () => {
    this.loadFromDb()
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
  }

  loadFromDbId = (id) => {
    getDocumentAll(this.user, id).then((documents) => {
      this.setState({
        itemsContent: documents.docs.map(doc => {
          let newDoc = doc.data()
          newDoc["id"] = doc.id
          return newDoc
        }),
      })
    });
  };

  loadFromDb = () => {
    this.loadFromDbId(this.state.id)
  };

  updateContent = item => {
    this.state.recentItem = item;
    this.setEditingOld(true);
  };

  addItem = item => {
    item.id = item.id || uuidv4();
    setDocument(this.user, this.state.id, item.id, {
      title: propOrDefault(item.title, ""),
      content: propOrDefault(item.content, ""),
      image: propOrDefault(item.image, "")
    });
    this.setState({
      itemsContent: [item, ...this.state.itemsContent],
      layout: [
        ...this.state.layout,
        {
          i: item.id,
          x: 0,
          y: 0,
          w: 40,
          h: 40,
          maxW: 47,
          minW: 5,
          minH: 5
        }
      ]
    })
  };

  addText = (title, content) => {
    if (title) {
      this.addItem({
        title: title,
        content: content
      });
      this.setState({
            recentItem: {}
          }
      )
    } else {
      this.setState({
            recentItem: {title: title, content: content}
          }
      )
    }
  };

  closeOldWindow = () => {
    this.setState({
      recentItem: {}
    })
    this.triggerEditing();
    this.setEditingOld(false);
  }

  closeWindow = () => {
    this.setAdding(false);
    this.triggerEditing();
  }

  addImage = src => {
    if (src) {
      this.addItem({
        image: src
      });
    }
    this.setAddingImage(false);
  };

  deleteItem = (id) => {
    deleteDocument(this.user, this.state.id, id);
    for( let i = 0; i < this.state.itemsContent.length; i++){
      if ( this.state.itemsContent[i].id === id) {
        this.state.itemsContent.splice(i, 1);
        this.forceUpdate()
        return
      }
    }
  };

  updateText = (id, title, content) => {
    for( let i = 0; i < this.state.itemsContent.length; i++){
      if (this.state.itemsContent[i].id === id) {
        this.state.itemsContent[i]["title"] = title;
        this.state.itemsContent[i]["content"] = content;
        setDocument(this.user, this.state.id, id, {
          title: title,
          content: content,
        });
        return
      }
    }
    this.addItem({id: id, title: title, content: content})
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

  triggerEditing = () =>{
      this.setState({
        isEditing: !this.state.isEditing
      });}
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
            <EditorWindow
                title={this.state.recentItem.title}
                content={this.state.recentItem.content}
                saveContent={this.addText}
                closeSelf={this.closeWindow}/>
          </div>
      ) : this.state.addingImage ? (
          <div className="popup">
            <ImageWindow onSubmit={this.addImage}/>
          </div>
      ) : this.state.editingOld ? (
          <div className="popup">
            <EditorWindow title={this.state.recentItem.title}
                          content={this.state.recentItem.content}
                          closeSelf={this.closeOldWindow}
                          saveContent={(title, content) => this.updateText(this.state.recentItem.id, title, content)}
            />
          </div>
      ) : this.state.editingTitle ? (
          <div className="popup">
            <SectionWindow title={this.state.title}
                           onSubmit={this.updateTitle}/>
          </div>
      ) : null;


  generateDOM = () => {
    const parent = this
    return this.state.itemsContent.map(item =>
          <div key={item.id}>
            <GridItem
                delete={parent.deleteItem}
                editing={() => parent.state.isEditing}
                id={item.id}
                title={item.title}
                content={item.content}
                image={item.image ? item.image : false}
                updateFunc={parent.updateContent}
            />
          </div>
    );
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
                      items={this.state.itemsContent.length}
                      isDraggable={this.state.isEditing}
                      isResizable={this.state.isEditing}
                      onLayoutChange={this.onLayoutChange}
                      margin={[10, 4]}
                      cols={this.cols}
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
