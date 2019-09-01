import React from "react";
import _ from "lodash";
import RGL, { Responsive, WidthProvider } from "react-grid-layout";
import { GridItem } from "./GridItem";
import { sizeMe } from "react-sizeme";
import { EditorWindow } from "./editor/EditorWindow";
import { ReadOnlyEditor } from "./editor/ReadOnlyEditor";
import { stateToHTML } from "draft-js-export-html";
import { EditorState } from "draft-js";

const ReactGridLayout = WidthProvider(RGL);

export class BasicLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    rowHeight: 50,
    onLayoutChange: function(l) {
      localStorage.setItem("layout", JSON.stringify(l));
    }
  };

  constructor(props) {
    super(props);
    var layout = this.generateLayout();
    this.state = {
      isDraggable: false,
      isResizable: false,
      items: 1,
      layout: layout,
      itemsContent: [{ title: "First", color: "#4a4e69" }],
      cols: 10,
      adding: false
    };

    this.store(this.state.itemsContent);
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
    return _.map(_.range(this.state.items), function(i) {
      return (
        <div key={i}>
          <GridItem
            index={i}
            title={stuff[i].title}
            image={stuff[i].image}
            color={stuff[i].color}
            logKey={opener}
            content={stuff[i].content}
          />
        </div>
      );
    });
  };

  addItem = item => {
    let newC = [...JSON.parse(localStorage.getItem("contents")), item];
    this.setState({
      itemsContent: [...JSON.parse(localStorage.getItem("contents")), item],
      layout: [
        ...JSON.parse(localStorage.getItem("layout")),
        this.randomLayout(this.state.items)
      ],
      items: this.state.items + 1
    });
    this.store(newC);
  };

  triggerEditing = () =>
    this.setState({
      isResizable: !this.state.isResizable,
      isDraggable: !this.state.isDraggable
    });

  addItemR = () =>
    this.addItem({
      title: "Title",
      content: <p>Content</p>
      // image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Doublecrestcorm14.jpg/170px-Doublecrestcorm14.jpg"
    });

  onResize = () => {
    if (window.innerWidth < 500) {
      this.setState({
        cols: Math.ceil(window.innerWidth / 100)
      });
    }
    console.log(this.state.cols);
  };

  componentDidMount = () => {
    this.onResize();
  };
  componentDidMount = () => {
    window.addEventListener("resize", this.onResize);
  };
  componentWillUnmount = () => {
    window.removeEventListener("resize", this.onResize);
  };

  generateLayout() {
    const p = this.props;
    var layout = _.map(new Array(p.items), function(item, i) {
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
    this.setState({ adding: toggle });
  };

  setEditingOld = toggle => {
    this.setState({ editingOld: toggle });
  };

  updateText = (title, content, color) => {
    this.setEditingOld(false);
    let newItem = { title: title, content: content, color: color };
    console.log(stateToHTML(content));
    let newContent = [
      ...this.state.itemsContent.slice(0, this.state.index),
      newItem,
      ...this.state.itemsContent.slice(this.state.index + 1)
    ];
    this.store(newContent);
    this.setState({
      itemsContent: newContent
    });
    this.triggerEditing();
  };

  render() {
    return (
      <div>
        {this.state.adding ? (
          <div className="popup">
            <EditorWindow onSubmit={this.addText} />
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
