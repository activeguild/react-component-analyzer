import type { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'
import type {
  DiagramSchema,
  Node,
} from 'beautiful-react-diagrams/@types/DiagramSchema'

export type Alias = {
  find: string
  replacement: string
}

export type ExtentionNode = Node<unknown> & {
  title: string
  astType:
    | AST_NODE_TYPES.ImportDefaultSpecifier
    | AST_NODE_TYPES.ImportNamespaceSpecifier
    | AST_NODE_TYPES.ImportSpecifier
    | AST_NODE_TYPES.VariableDeclarator
  exportName: string
  children: ExtentionNode[]
  exists: boolean
  loc: { start: LineColumn; end: LineColumn }
}

export type LineColumn = { line: number; column: number }
export type Loc = { start: LineColumn; end: LineColumn }
export type Data = {
  title: string
  loc: Loc
}

export type CustomSchema = {
  width: number
  height: number
  schema: DiagramSchema<Data>
}
