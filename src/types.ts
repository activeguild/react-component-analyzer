import type { AST, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'
import type {
  DiagramSchema,
  Node,
} from 'beautiful-react-diagrams/@types/DiagramSchema'

export type Config = {
  vscode?: boolean
  alias?: Alias[]
  outputPath?: string
}

export type Alias = {
  find: string
  replacement: string
}

export type ExtentionNode = Node<unknown> & {
  title: string
  code: string
  fileName: string
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

export type LoadedFile = {
  code: string
  ast: AST<{
    loc: true
    jsx: true
  }>
}

export type LineColumn = { line: number; column: number }
export type Loc = { start: LineColumn; end: LineColumn }
export type Data = {
  vscode?: boolean
  code: string
  title: string
  fileName: string
  loc: Loc
  handleShowDetail?: React.MouseEventHandler<HTMLAnchorElement>
}

export type CustomDiagram = {
  vscode: boolean
  width: number
  height: number
  schema: DiagramSchema<Data>
}
