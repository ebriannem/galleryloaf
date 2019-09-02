import React from "react";
import _ from "lodash";
import RGL, {Responsive, WidthProvider} from "react-grid-layout";
import {GridItem} from "./GridItem";
import {sizeMe} from "react-sizeme";
import {EditorWindow} from "./editor/EditorWindow";
import {stateToHTML} from "draft-js-export-html";
import {convertFromRaw, convertToRaw} from "draft-js"
import db from "./firebase/firebase";

const ReactGridLayout = WidthProvider(RGL);

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export class BasicLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    rowHeight: 50,
    onLayoutChange: function (l) {
      localStorage.setItem("layout", JSON.stringify(l));
    }
  };

  constructor(props) {
    super(props);
    var layout = this.generateLayout();
    this.state = {
      isDraggable: false,
      isResizable: false,
      items: 0,
      layout: layout,
      itemsContent: [],
      cols: 10,
      adding: false
    };

    this.loadFromDb();
    console.log("data:" + this.state.itemsContent + "count:" + this.state.items);

  }


  store = c => {
    localStorage.setItem("contents", JSON.stringify(c));
  };

  openEditor = (title, content, color, index) => {
    console.log("OP");
    this.setState({
      editorTitle: title,
      editorContent: content,
      editorColor: color,
      index: index
    });
    this.setEditingOld(true);
  };

  generateDOM = () => {
    let stuff = this.state.itemsContent;
    let opener = this.openEditor;
    return _.map(_.range(this.state.items), function (i) {
      return (
          <div key={i}>
            <GridItem
                title={stuff[i].title}
                color={stuff[i].color}
                logKey={opener}
                content={stuff[i].content ? convertFromRaw(stuff[i].content) : false}
            />
          </div>
      );
    });
  };

  loadFromDb = () => {
    db.collection("test").get().then((querySnapshot) => {
      let documents = querySnapshot.docs.map((doc) => {
            return (doc.data());
          }
      );
      console.log(documents);
      this.setState({
        itemsContent: documents,
        items: documents.length,
      })
    })
  };

  addItem = item => {
    const key = item.title.hashCode();
    db.collection("test").doc(item.title).set({
      title: item.title,
      content: convertToRaw(item.content),
      color: item.color,
      layout: this.randomLayout(key)
    });
    this.loadFromDb();
  };

  triggerEditing = () =>
      this.setState({
        isResizable: !this.state.isResizable,
        isDraggable: !this.state.isDraggable
      });

  generateLayout = () => {
    const p = this.props;
    var layout = _.map(new Array(p.items), function (item, i) {
      const y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: 2,
        h: y,
        i: i.toString()
      };
    });
    return layout;
  }

  randomLayout = i => {
    const y = _.result(this.state, "y") || Math.ceil(Math.random() * 4) + 1;
    return {
      x: (i * 2) % 12,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString()
    };
  };

  addText = (title, content, color) => {
    if (title) {
      this.addItem({
        title: title,
        content: content,
        color: color
      });
    }
    this.setAdding(false);
  };

  setAdding = toggle => {
    this.setState({adding: toggle});
  };

  setEditingOld = toggle => {
    this.setState({editingOld: toggle});
  };

  updateText = (title, content, color) => {
    this.setEditingOld(false);
    let newItem = {title: title, content: content, color: color};
    this.addItem(newItem);
    this.triggerEditing();
  };


  render() {
    return (
        <div>
          {this.state.adding ? (
              <div className="popup">
                <EditorWindow onSubmit={this.addText}/>
              </div>
          ) : null}

          {this.state.editingOld ? (
              <div className="popup">
                <EditorWindow
                    onSubmit={this.updateText}
                    title={this.state.editorTitle}
                    content={this.state.editorContent}
                    color={this.state.editorColor}
                />
              </div>
          ) : null}
          <button onClick={() => this.setAdding(true)}>Add</button>
          <button onClick={this.triggerEditing}>Edit</button>
          <ReactGridLayout
              layout={this.state.layout}
              onLayoutChange={this.onLayoutChange}
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
