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
import type { CustomDiagram as CustomDiagramType, Data, Loc } from './types'

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
  state: DrawerState
  handleClose: () => void
}
const Drawer: VFC<DrawerProps> = (props) => {
  const { state, handleClose } = props
  const { open, code, loc } = state
  let className = 'drawer'
  if (open) {
    className = `${className} open`
  }
  setTimeout(() => {
    Prism.highlightAll()
  }, 100)

  let dataLine = ''
  if (loc) {
    dataLine = `${loc.start.line}-${loc.end.line}`
  }

  const __html = Prism.highlight(code, Prism.languages.typescript, 'typescript')
  return (
    <div
      style={{
        background: '#272822',
        paddingLeft: '16px',
        paddingTop: '18px',
        overflow: 'scroll',
      }}
      className={className}
    >
      <pre data-line={dataLine} className="language-typescript line-numbers">
        <code
          dangerouslySetInnerHTML={{
            __html,
          }}
        ></code>
      </pre>
      <a
        style={{
          position: 'absolute',
          fontSize: '14px',
          top: '8px',
          left: '8px',
        }}
        onClick={handleClose}
      >
        <FaTimes />
      </a>
    </div>
  )
}
type DrawerState = {
  open: boolean
  title: string
  code: string
  loc?: Loc
}
const useDrawer = () => {
  const [state, setState] = useState<DrawerState>({
    open: false,
    title: '',
    code: '',
  })

  const toggle = useCallback(
    (newState: DrawerState) => {
      if (!newState.code) {
        setState({ open: false, title: '', code: '' })
        return
      }

      setState((prevState) => {
        if (prevState.title !== newState.title) {
          return {
            ...prevState,
            open: true,
            title: newState.title,
            code: newState.code,
            loc: newState.loc,
          }
        } else {
          return { ...prevState, open: !prevState.open, title: '', code: '' }
        }
      })
    },
    [state]
  )

  return { state, toggle }
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
  const { state, toggle: toggle } = useDrawer()

  for (const node of initialSchema.nodes) {
    node.render = CustomNode
    if (node.data) {
      const data = node.data
      node.data.handleShowDetail = () => {
        toggle({
          open: state.open,
          title: data.title,
          code: data.code,
          loc: data.loc,
        })
      }
    }
  }
  const handleClose = () => {
    toggle({ open: false, title: '', code: '' })
  }
  return (
    <>
      <Drawer state={state} handleClose={handleClose} />
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
