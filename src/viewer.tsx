import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams'
import type {
  DiagramSchema,
  Node,
} from 'beautiful-react-diagrams/@types/DiagramSchema'
import 'beautiful-react-diagrams/styles.css'
import classNames from 'classnames'
import Prism from 'prismjs'
import React, {
  ElementType,
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useState,
  VFC,
} from 'react'
import ReactDOM from 'react-dom'
import { FaExternalLinkAlt, FaTimes } from 'react-icons/fa'
import { GoSearch } from 'react-icons/go'
import 'viewer.css'
import { NODE_HEIGHT, NODE_WIDTH } from './constants'
import type { CustomDiagram as CustomDiagramType, Data, Loc } from './types'
const NavContext = React.createContext<NavContext>({})
type NavContext = {
  navId?: string
  setNavId?: React.Dispatch<React.SetStateAction<string>>
}

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
    <div className={className}>
      <pre data-line={dataLine} className="language-typescript line-numbers">
        <code
          dangerouslySetInnerHTML={{
            __html,
          }}
        ></code>
      </pre>
      <a className="drawerClose" onClick={handleClose}>
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
  const { navId } = useContext(NavContext)
  return (
    <div
      id={id}
      className={classNames('customNode', { active: id === navId })}
      style={{
        height: `${NODE_HEIGHT}px`,
        width: `${NODE_WIDTH}px`,
      }}
    >
      <div className="customNodeId">{data ? data.title : id}</div>
      <div className="customNodeToolbar">
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
  const [navId, setNavId] = useState('')
  const sideMenu: string[] = []

  for (const node of initialSchema.nodes) {
    node.render = CustomNode
    if (node.data) {
      const data = node.data
      node.data.handleShowDetail = () => {
        setNavId(node.id)
        toggle({
          open: state.open,
          title: data.title,
          code: data.code,
          loc: data.loc,
        })
      }
    }
    sideMenu.push(node.id)
  }
  const handleClose = () => {
    toggle({ open: false, title: '', code: '' })
  }
  const handleMenuClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    document.getElementById(id)?.scrollIntoView()
    setNavId(id)
    event.preventDefault()
  }

  const navContextValue = {
    navId,
    setNavId,
  }

  return (
    <NavContext.Provider value={navContextValue}>
      <Drawer state={state} handleClose={handleClose} />
      <aside className="sideNavContainer">
        <ul className="sideNav">
          {sideMenu.map((id) => (
            <li key={id}>
              <a
                className={classNames('sideNavLink', { active: navId === id })}
                onClick={(event) => handleMenuClick(event, id)}
              >
                {id}
              </a>
            </li>
          ))}
        </ul>
      </aside>
      <CustomDiagram
        customDiagram={customSchema}
        initialSchema={initialSchema}
      />
    </NavContext.Provider>
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
      className="diagramWrapper"
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
