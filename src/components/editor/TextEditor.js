import {Editor} from 'slate-react'
import {Value} from 'slate'
import React from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import {isKeyHotkey} from 'is-hotkey'
import {Button, Icon, Toolbar} from './components'

const initialValue = {
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            text: '',
          },
        ],
      },
    ],
  },
}
const DEFAULT_NODE = 'paragraph'
const hotkeys = new Map([
  ['bold', isKeyHotkey('mod+b')],
  ['italic', isKeyHotkey('mod+i')],
  ['underlined', isKeyHotkey('mod+u')],
  ['code', isKeyHotkey('mod+`')],
  ['exitBlock', isKeyHotkey('mod+Enter')],
  ['newline', isKeyHotkey('Enter')],
  ['tab', isKeyHotkey('Tab')],
  ['backspace', isKeyHotkey('Backspace')],
])

export class TextEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: Value.fromJSON(JSON.parse(props.json) || initialValue),
      readOnly: props.readOnly,
    }
  }

  getJsonString = () => (
      JSON.stringify(this.state.value.toJSON())
  )

  hasMark = type => {
    const {value} = this.state
    return value.activeMarks.some(mark => mark.type === type)
  }
  hasBlock = type => {
    const {value} = this.state
    return value.blocks.some(node => node.type === type)
  }
  ref = editor => {
    this.editor = editor
  }

  render() {
    return (
        <div className={'SlateEditor'}>
          {this.state.readOnly ? null :
              <div className={'SlateEditor-Toolbar'}>
                <Toolbar>
                  {this.renderMarkButton('bold', 'format_bold')}
                  {this.renderMarkButton('italic', 'format_italic')}
                  {this.renderMarkButton('underlined', 'format_underlined')}
                  {this.renderBlockButton('code', 'code')}
                  {this.renderBlockButton('heading-one', 'looks_one')}
                  {this.renderBlockButton('heading-two', 'looks_two')}
                  {this.renderBlockButton('block-quote', 'format_quote')}
                  {this.renderBlockButton('numbered-list', 'format_list_numbered')}
                  {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
                </Toolbar>
              </div>
          }
          <div className={'SlateEditor-Content'}>
            <Editor
                readOnly={this.state.readOnly}
                autoFocus
                placeholder="Enter some rich text..."
                ref={this.ref}
                value={this.state.value}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                renderBlock={this.renderBlock}
                renderMark={this.renderMark}
                renderDecoration={this.renderDecoration}
                decorateNode={this.decorateNode}
            />
          </div>
        </div>
    )
  }

  renderMarkButton = (type, icon) => {
    return (
        <Button
            active={this.hasMark(type)}
            onMouseDown={event => this.onClickMark(event, type)}
        >
          <Icon>{icon}</Icon>
        </Button>
    )
  }
  renderBlockButton = (type, icon) => {
    let isActive = this.hasBlock(type)

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const {
        value: {document, blocks},
      } = this.state

      if (blocks.size > 0) {
        const parent = document.getParent(blocks.first().key)
        isActive = this.hasBlock('list-item') && parent && parent.type === type
      }
    }

    return (
        <Button
            active={isActive}
            onMouseDown={event => this.onClickBlock(event, type)}
        >
          <Icon>{icon}</Icon>
        </Button>
    )
  }

  renderBlock = (props, editor, next) => {
    const {attributes, children, node} = props

    switch (node.type) {
      case 'code':
        return (
            <div className="code" style={overallCodeStyle} {...attributes}>
            <pre>
              <code style={overallCodeStyle}>
                {children}
              </code>
            </pre>
            </div>
        )
      case 'code_line':
        return <div {...attributes}>{children}</div>
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>
      default:
        return next()
    }
  }

  renderMark = (props, editor, next) => {
    const {children, mark, attributes} = props

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>
      case 'italic':
        return <em {...attributes}>{children}</em>
      case 'underlined':
        return <u {...attributes}>{children}</u>
      default:
        return next()
    }
  }

  decorateNode = (node, editor, next) => {
    const others = next() || []
    if (node.type !== 'code_line') return others

    const texts = Array.from(node.texts())
    const string = texts.map(([n]) => n.text).join('\n')
    const grammar = Prism.languages.python
    const tokens = Prism.tokenize(string, grammar)
    const decorations = []
    let startEntry = texts.shift()
    let endEntry = startEntry
    let startOffset = 0
    let endOffset = 0
    let start = 0

    for (const token of tokens) {
      startEntry = endEntry
      startOffset = endOffset

      const [startText, startPath] = startEntry
      const content = getContent(token)
      const length = content.length
      const end = start + length

      let available = startText.text.length - startOffset
      let remaining = length

      endOffset = startOffset + remaining

      while (available < remaining && texts.length > 0) {
        endEntry = texts.shift()
        const [endText] = endEntry
        remaining = length - available
        available = endText.text.length
        endOffset = remaining
      }

      const [endText, endPath] = endEntry

      if (typeof token !== 'string') {
        const dec = {
          type: token.type,
          anchor: {
            key: startText.key,
            path: startPath,
            offset: startOffset,
          },
          focus: {
            key: endText.key,
            path: endPath,
            offset: endOffset,
          },
        }

        decorations.push(dec)
      }

      start = end
    }

    return [...others, ...decorations]
  }
  renderDecoration = (props, editor, next) => {
    const {children, decoration, attributes} = props
    if (decoration.type in codeStyle) {
      return (
          <span {...attributes} style={codeStyle[decoration.type]}>
          {children}
        </span>
      )
    }
    console.log(decoration.type)
    return next()
  }
  onChange = ({value}) => {
    this.setState({value})
  }

  onKeyDown = (event, editor, next) => {
    let hotkey = null
    for (const [val, check] of hotkeys) {
      if (check(event)) {
        hotkey = val
        break
      }
    }
    if (hotkey == null) return next()
    switch (hotkey) {
      case 'newline':
        if (this.hasBlock('code_line')) {
          editor.insertBlock('code_line').focus()
          event.preventDefault()
        }
        return
      case 'exitBlock':
        editor.insertBlock('paragraph')
        editor.unwrapBlock('code')
        break
      case 'code':
        if (this.hasBlock('code_line')) {
          editor.setBlocks('paragraph').focus()
          editor.unwrapBlock('code')
        } else {
          editor.setBlocks('code_line')
          editor.wrapBlock('code').focus()
        }
        break
      case 'bold':
      case 'italic':
      case 'underlined':
        if (!this.hasBlock('code')) editor.toggleMark(hotkey)
        break
      case 'backspace':
        if (editor.value.focusBlock.text === '') {
          editor.unwrapBlock('bulleted-list')
          editor.unwrapBlock('numbered-list')
          editor.unwrapBlock('code')
          if (editor.value.focusBlock.getParent() === null) {
            editor.setBlocks('paragraph')
          } else {
            editor.setBlocks('list-item')
          }
        }
        return next()
      case 'tab':
        if (editor.value.focusBlock.type === 'list-item') {
          if (editor.value.focusBlock.text !== '') {
            editor.insertBlock('list-item')
            editor.wrapBlock('bulleted-list')
          }
        } else {
          editor.insertText('  ')
        }
        event.preventDefault()
        return
      default:
        return next()
    }
    event.preventDefault()
    return
  }

  onClickMark = (event, type) => {
    event.preventDefault()
    this.editor.toggleMark(type)
  }
  onClickBlock = (event, type) => {
    event.preventDefault()

    const {editor} = this
    const {value} = editor
    const {document} = value

    // Handle everything but list buttons.
    if (type !== 'bulleted-list' && type !== 'numbered-list') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      if (isList) {
        editor
            .setBlocks(isActive ? DEFAULT_NODE : type)
            .unwrapBlock('bulleted-list')
            .unwrapBlock('numbered-list')
      } else {
        editor.setBlocks(isActive ? DEFAULT_NODE : type)
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list-item')
      const isType = value.blocks.some(block => {
        return !!document.getClosest(block.key, parent => parent.type === type)
      })

      if (isList && isType) {
        editor
            .setBlocks(DEFAULT_NODE)
            .unwrapBlock('bulleted-list')
            .unwrapBlock('numbered-list')
      } else if (isList) {
        editor
            .unwrapBlock(
                type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list',
            )
            .wrapBlock(type)
      } else {
        editor.setBlocks('list-item').wrapBlock(type)
      }
    }
  }
}

function getContent(token) {
  if (typeof token === 'string') {
    return token
  } else if (typeof token.content === 'string') {
    return token.content
  } else {
    return token.content.map(getContent).join('')
  }
}

const overallCodeStyle = {
  backgroundColor: '#f4f6f6',
  color: '#005661',
  fontFamily: '\'Oxygen Mono\', Serif',
}
const codeStyle = {
  keyword: {
    color: '#ff5792',
    fontWeight: 'bold',
  },
  punctuation: {
    color: '#5842ff',
  },
  tag: {
    color: '#e64100',
  },
  comment: {
    color: '#8ca6a6',
    fontStyle: 'italic',
  },
  string: {
    color: '#00b368',
  },
  number: {
    color: '#5842ff',
  },
  boolean: {
    color: '#f49725',
  },
  operator: {
    color: '#b3694d',
  },
}
