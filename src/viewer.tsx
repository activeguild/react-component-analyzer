import { BlanckLink, CloseA, Search } from '@ubie/ubie-icons'
import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams'
import type {
  DiagramSchema,
  Node,
} from 'beautiful-react-diagrams/@types/DiagramSchema'
import 'beautiful-react-diagrams/styles.css'
import Avatar from 'boring-avatars'
import classNames from 'classnames'
import Fuse from 'fuse.js'
import 'modern-css-reset/dist/reset.min.css'
import Prism from 'prismjs'
import React, {
  ChangeEventHandler,
  ElementType,
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
  VFC,
} from 'react'
import ReactDOM from 'react-dom'
import ReactTooltip from 'react-tooltip'
import 'styles/base.css'
import { styles } from 'styles/viewer.css'
import { NODE_HEIGHT, NODE_WIDTH } from './constants'
import './styles/vendor.css'
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
      node.inputs = [{ id: `${node.id}-input` }]
      node.outputs = [{ id: `${node.id}-output` }]
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
  let className = styles.drawer
  if (open) {
    className = `${className} ${styles.open}`
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
      <a className={styles.drawerClose} onClick={handleClose}>
        <CloseA />
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
  const { id, data, inputs, outputs } = props
  const { fileName, handleShowDetail } = data || {
    fileName: '',
  }
  const { navId } = useContext(NavContext)
  const [title, setTitle] = useState(data?.title)

  return (
    <div
      id={id}
      className={classNames(styles.customNode, { active: id === navId })}
      style={{
        height: `${NODE_HEIGHT}px`,
        width: `${NODE_WIDTH}px`,
      }}
      onDoubleClick={(event) => event.stopPropagation()}
      data-tip={id}
      data-for="component-name"
    >
      <div className={styles.customNodeInput}>
        {inputs &&
          inputs.map((port) =>
            // [Note] https://github.com/antonioru/beautiful-react-diagrams/pull/91
            React.cloneElement(
              port as unknown as React.DetailedReactHTMLElement<
                React.HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
              >,
              {
                style: { width: '40px', height: '16px', background: '#1B263B' },
              }
            )
          )}
      </div>
      {data && data.code ? (
        <div className={styles.customNodeId}>{title}</div>
      ) : (
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      )}
      {data && data.code ? (
        <div className={styles.customNodeToolbar}>
          <a onClick={handleShowDetail}>
            <Search />
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
              <BlanckLink />
            </a>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
      <div className={styles.customNodeOutput}>
        {outputs &&
          outputs.map((port) =>
            // [Note] https://github.com/antonioru/beautiful-react-diagrams/pull/91
            React.cloneElement(
              port as unknown as React.DetailedReactHTMLElement<
                React.HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
              >,
              {
                style: { width: '40px', height: '16px', background: '#1B263B' },
              }
            )
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
  const { state, toggle } = useDrawer()
  const [navId, setNavId] = useState('')
  const sideMenu: string[] = []
  const [searchTxt, setSearchTxt] = useState('')

  for (const node of initialSchema.nodes) {
    node.render = CustomNode
    if (node.data) {
      const { title, code, loc } = node.data
      node.data.handleShowDetail = () => {
        setNavId(node.id)
        toggle({
          open: state.open,
          title,
          code,
          loc,
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
    document
      .getElementById(id)
      ?.scrollIntoView({ block: 'center', inline: 'center' })
    setNavId(id)
    if (state.open) {
      const node = initialSchema.nodes.find((node) => node.id === id)
      if (node && node.data) {
        const { title, code, loc } = node.data
        toggle({
          open: state.open,
          title,
          code,
          loc,
        })
      }
    }
    event.preventDefault()
  }

  const navContextValue = {
    navId,
    setNavId,
  }
  const fuse = new Fuse(sideMenu, { threshold: 0.3 })

  const search = (searchTxt: string) => {
    if (!searchTxt) return sideMenu

    const result = fuse.search(searchTxt)

    return result.map(({ item }) => item)
  }

  const result = useMemo(() => search(searchTxt), [searchTxt])
  const handleTxtChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    search(event.target.value)
    setSearchTxt(event.target.value)
  }

  return (
    <NavContext.Provider value={navContextValue}>
      <Drawer state={state} handleClose={handleClose} />
      <aside className={styles.sideNavContainer}>
        <h3 className={styles.sideNavTitle}>Components</h3>
        <input
          className={styles.sideNavSearch}
          type="text"
          placeholder="Find a component"
          onChange={handleTxtChange}
        ></input>
        <ul className={styles.sideNav}>
          {result.map((id) => (
            <li
              className={styles.sideNavItem}
              key={id}
              data-tip={id}
              data-for="component-name"
            >
              <Avatar
                size={6}
                name={id}
                variant="marble"
                colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
              />
              <a
                className={classNames(styles.sideNavLink, {
                  [styles.active]: navId === id,
                })}
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
      <ReactTooltip id="component-name" />
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
  const [addCount, setAddCount] = useState<number>(1)

  const handleBackgroundDoubleClick: React.MouseEventHandler<HTMLDivElement> = (
    event
  ) => {
    if (
      (event.target as Element).classList.contains('bi-link-ghost') ||
      (event.target as Element).classList.contains('bi-diagram-link')
    ) {
      return
    }
    const { clientX, clientY } = event
    const id = `Add${addCount}`
    onChange({
      ...schema,
      nodes: [
        ...schema.nodes,
        {
          id,
          coordinates: [clientX - 160, clientY],
          inputs: [{ id: `${id}-input` }],
          outputs: [{ id: `${id}-input` }],
          render: CustomNode,
          data: { title: id },
        },
      ],
    })
    setAddCount(addCount + 1)
  }

  return (
    <div
      className={styles.diagramWrapper}
      style={{
        height: `${customDiagram.height + 1000}px`,
        width: `${customDiagram.width + 1000}px`,
      }}
      onDoubleClick={handleBackgroundDoubleClick}
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
