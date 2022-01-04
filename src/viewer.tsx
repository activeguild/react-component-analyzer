import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams'
import type {
  DiagramSchema,
  Node,
} from 'beautiful-react-diagrams/@types/DiagramSchema'
import 'beautiful-react-diagrams/styles.css'
import React, { ElementType, ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { FaExternalLinkAlt } from 'react-icons/fa'
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

  return <CustomDiagram customDiagram={diagram} initialSchema={initialSchema} />
}

type CustomNodeType = (
  props: Omit<Node<Data>, 'coordinates'>
) => ElementType | ReactNode

const CustomNode: CustomNodeType = (props) => {
  const { id, data } = props

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
        {data && data.vscode ? (
          <a
            href={data ? data.fileName : ''}
            onClick={(event) => {
              const { loc } = data
              location.href = `vscode://file/${data ? data.fileName : ''}:${
                loc.start.line
              }:${loc.start.column}`

              event.preventDefault()
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
