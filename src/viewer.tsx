import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams'
import type {
  DiagramSchema,
  Node,
} from 'beautiful-react-diagrams/@types/DiagramSchema'
import 'beautiful-react-diagrams/styles.css'
import Prism from 'prismjs'
import React, {
  ElementType,
  ReactNode,
  useCallback,
  useState,
  VFC,
} from 'react'
import ReactDOM from 'react-dom'
import { FaExternalLinkAlt, FaTimes } from 'react-icons/fa'
import { GoSearch } from 'react-icons/go'
import { NODE_HEIGHT, NODE_WIDTH } from './constants'
import type { CustomDiagram as CustomDiagramType, Data } from './types'

const App = () => {
  const initialSchema = createSchema(diagram.schema)

  for (const node of initialSchema.nodes) {
    if (node.data) {
      node.data.vscode = diagram.vscode
    }
    node.render = CustomNode
  }

  return <Layout customSchema={diagram} initialSchema={initialSchema} />
}

type DrawerProps = {
  code: string
  open: boolean
  handleClose: () => void
}
const Drawer: VFC<DrawerProps> = (props) => {
  const { open, code, handleClose } = props
  let className = 'drawer'
  if (open) {
    className = `${className} open`
  }
  const html = Prism.highlight(code, Prism.languages.javascript, 'javascript')
  return (
    <div style={{ background: '#272822' }} className={className}>
      <pre className="line-numbers">
        <code
          className="language-typescript"
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        ></code>
      </pre>
      <a
        style={{
          position: 'absolute',
          fontSize: '14px',
          top: '12px',
          right: '12px',
        }}
        onClick={handleClose}
      >
        <FaTimes />
      </a>
    </div>
  )
}
const useDrawer = (initialValue = false) => {
  const [state, setState] = useState(initialValue)
  const [code, setCode] = useState('')

  const toggle = useCallback(
    (newCode: string) => {
      if (!newCode) {
        setCode('')
        setState(false)
        return
      }

      setCode((prevCode) => {
        if (prevCode !== newCode) {
          setState(true)
          return newCode
        } else {
          setState((prevState) => !prevState)
          return ''
        }
      })
    },
    [code, state]
  )

  return { state, toggle, code }
}
type CustomNodeType = (
  props: Omit<Node<Data>, 'coordinates'>
) => ElementType | ReactNode

const CustomNode: CustomNodeType = (props) => {
  const { id, data } = props
  const { fileName, handleShowDetail } = data || {
    fileName: '',
    handleShowDetail: () => {
      // default
    },
  }

  return (
    <div
      style={{
        background: '#01060B',
        borderRadius: '10px',
        height: `${NODE_HEIGHT}px`,
        width: `${NODE_WIDTH}px`,
        border: 'solid 1px #1bfdc8',
        padding: '10px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          color: 'white',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {data ? data.title : id}
      </div>
      <div style={{ textAlign: 'right' }}>
        <a onClick={handleShowDetail}>
          <GoSearch />
        </a>
        {data && data.vscode ? (
          <a
            href={fileName}
            onClick={(event) => {
              if (data) {
                const { loc } = data
                location.href = `vscode://file/${fileName}:${loc.start.line}:${loc.start.column}`

                event.preventDefault()
              }
            }}
          >
            <FaExternalLinkAlt />
          </a>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

type LayoutProps = {
  customSchema: CustomDiagramType
  initialSchema: DiagramSchema<Data>
}

const Layout: VFC<LayoutProps> = (prpops) => {
  const { customSchema, initialSchema } = prpops
  const { state: open, toggle: toggle, code } = useDrawer(false)

  for (const node of initialSchema.nodes) {
    node.render = CustomNode
    if (node.data) {
      const data = node.data
      node.data.handleShowDetail = () => {
        toggle(data.code)
      }
    }
  }
  const handleClose = () => {
    toggle('')
  }
  return (
    <>
      <Drawer open={open} code={code} handleClose={handleClose} />
      <CustomDiagram
        customDiagram={customSchema}
        initialSchema={initialSchema}
      />
    </>
  )
}

const CustomDiagram = ({
  customDiagram,
  initialSchema,
}: {
  customDiagram: CustomDiagramType
  initialSchema: DiagramSchema<Data>
}) => {
  const [schema, { onChange }] = useSchema<any>(initialSchema)

  return (
    <div
      style={{
        height: `${customDiagram.height}px`,
        width: `${customDiagram.width}px`,
      }}
    >
      <Diagram schema={schema} onChange={onChange} />
    </div>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
)
