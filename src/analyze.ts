import type {
  BlockStatement,
  CallExpressionArgument,
  ImportDeclaration,
  JSXElement,
  JSXEmptyExpression,
  JSXFragment,
  JSXOpeningElement,
  ProgramStatement,
  Statement,
  VariableDeclaration,
} from '@typescript-eslint/types/dist/ast-spec'
import { AST_NODE_TYPES, parse } from '@typescript-eslint/typescript-estree'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { resolveAlias } from './config'
import { EXTENTIONS } from './constants'
import { Alias, ExtentionNode, LineColumn } from './types'

const defaultLineColumn: LineColumn = { line: 1, column: 1 }
const loadedFile = new Map<string, string>()

export const analyze = (
  root: boolean,
  alias: Alias[],
  parentPath: string,
  parentNode: ExtentionNode,
  dir: string
) => {
  try {
    const { fileName } = parentNode
    let code: string | undefined = ''
    if (loadedFile.has(fileName)) {
      code = loadedFile.get(fileName)
    } else {
      code = fs.readFileSync(fileName).toString()
      loadedFile.set(fileName, code)
    }

    if (!code) {
      return
    }

    const parseOptions = {
      loc: true,
      jsx: true,
    }
    const ast = parse(code, parseOptions)
    const defaultDeclarationName = findDefaultDeclarationName(ast.body)
    if (
      defaultDeclarationName &&
      parentNode.astType === AST_NODE_TYPES.ImportDefaultSpecifier
    ) {
      parentNode.exportName = defaultDeclarationName
    }

    for (const state of ast.body) {
      if (!state.type.startsWith('TS')) {
        analyzeAst(root, alias, parentNode, dir, state)
      }
    }

    for (const childNode of parentNode.children) {
      // [Note]: Block circular references.
      if (
        parentPath !== childNode.fileName &&
        childNode.exists &&
        parentNode.fileName !== childNode.fileName
      ) {
        analyze(
          false,
          alias,
          fileName,
          childNode,
          path.dirname(childNode.fileName)
        )
      }
    }
  } catch (e) {
    console.log(chalk.red(e))
    parentNode.exists = false
  }
}

const analyzeAst = (
  root: boolean,
  alias: Alias[],
  parentNode: ExtentionNode,
  dir: string,
  body: ProgramStatement
) => {
  if (body.type === AST_NODE_TYPES.ImportDeclaration) {
    analyzeImport(alias, parentNode, dir, body)
  } else if (body.type === AST_NODE_TYPES.FunctionDeclaration) {
    if (
      parentNode.astType !== AST_NODE_TYPES.ImportDefaultSpecifier ||
      (parentNode.astType === AST_NODE_TYPES.ImportDefaultSpecifier &&
        body.id &&
        body.id.name === parentNode.id)
    )
      analyzeBlockStatement(parentNode, body.body)
  } else if (body.type === AST_NODE_TYPES.ExpressionStatement) {
    if (
      body.expression.type === AST_NODE_TYPES.CallExpression ||
      body.expression.type === AST_NODE_TYPES.NewExpression
    ) {
      for (const argument of body.expression.arguments) {
        analyzeExpression(parentNode, argument)
      }
    }
  } else if (body.type === AST_NODE_TYPES.VariableDeclaration) {
    for (const declaration of body.declarations) {
      if (declaration.id.type === AST_NODE_TYPES.Identifier) {
        const { name } = declaration.id
        if (
          declaration.init &&
          (declaration.init.type === AST_NODE_TYPES.ArrowFunctionExpression ||
            declaration.init.type === AST_NODE_TYPES.FunctionExpression)
        ) {
          if (declaration.init.body.type === AST_NODE_TYPES.JSXElement) {
            parentNode.children.push({
              id: name,
              title: name,
              astType: AST_NODE_TYPES.VariableDeclarator,
              fileName: parentNode.fileName,
              // default values
              exportName: name,
              coordinates: [0, 0],
              children: [],
              exists: false,
              loc: declaration.id.loc,
            })
          } else if (declaration.id.name === parentNode.exportName) {
            parentNode.loc = declaration.id.loc
            analyzeExpression(parentNode, declaration.init)
          } else if (root) {
            // [Note]: Root file parsing also parses non-exported declarations.
            analyzeExpression(parentNode, declaration.init)
          }
        }
      }
    }
  } else if (body.type === AST_NODE_TYPES.ExportNamedDeclaration) {
    if (
      body.declaration &&
      body.declaration.type === AST_NODE_TYPES.VariableDeclaration
    ) {
      analyzeVariableDeclaration(parentNode, body.declaration)
    }
  }
}

export const analyzeVariableDeclaration = (
  parentNode: ExtentionNode,
  declaration: VariableDeclaration
) => {
  if (declaration.type !== AST_NODE_TYPES.VariableDeclaration) {
    return
  }
  for (const _declaration of declaration.declarations) {
    if (_declaration.id.type === AST_NODE_TYPES.Identifier) {
      if (
        _declaration.id.name === parentNode.exportName ||
        parentNode.exportName === ''
      ) {
        parentNode.loc = _declaration.id.loc
        if (_declaration.init) {
          analyzeExpression(parentNode, _declaration.init)
        }
      }
    }
  }
}

const analyzeImport = (
  alias: Alias[],
  parentNode: ExtentionNode,
  dir: string,
  importDec: ImportDeclaration
) => {
  if (importDec.importKind === 'type') return
  const filePath = resolveAlias(alias, dir, importDec)
  const fileName = path.basename(filePath)
  const { filePath: finalFilePath, existsFile } = findAnalyzeFilePath(filePath)
  let id: string | null = null

  if (!existsFile) {
    return
  }

  for (const specifier of importDec.specifiers) {
    const { type, local } = specifier
    id = null
    if (
      type === AST_NODE_TYPES.ImportDefaultSpecifier &&
      local.type === AST_NODE_TYPES.Identifier
    ) {
      // [Note]: For default import, set the file name.
      id = fileName
    } else if (
      (type === AST_NODE_TYPES.ImportSpecifier &&
        specifier.importKind === 'value') ||
      (type === AST_NODE_TYPES.ImportNamespaceSpecifier &&
        local.type === AST_NODE_TYPES.Identifier)
    ) {
      id = local.name
    }
    if (id) {
      parentNode.children.push({
        id,
        title: id,
        astType: type,
        fileName: finalFilePath,
        exportName: local.name,
        // default values
        coordinates: [0, 0],
        children: [],
        exists: false,
        loc: {
          start: { ...defaultLineColumn },
          end: { ...defaultLineColumn },
        },
      })
    }
  }
}

const analyzeExpression = (
  parentNode: ExtentionNode,
  elm: CallExpressionArgument | JSXEmptyExpression
) => {
  if (!elm) {
    return
  }
  if (elm.type === AST_NODE_TYPES.JSXElement) {
    analyzeChildrenJSXElement(parentNode, elm)
    updateExists(parentNode, elm.openingElement, parentNode.children)
    analyzeChildrenJSXElement(parentNode, elm)
  } else if (elm.type === AST_NODE_TYPES.JSXFragment) {
    analyzeChildrenJSXElement(parentNode, elm)
  } else if (elm.type === AST_NODE_TYPES.SpreadElement) {
    analyzeExpression(parentNode, elm.argument)
  } else if (elm.type === AST_NODE_TYPES.ArrayExpression) {
    for (const element of elm.elements) {
      analyzeExpression(parentNode, element)
    }
  } else if (
    elm.type === AST_NODE_TYPES.AssignmentExpression ||
    elm.type === AST_NODE_TYPES.LogicalExpression
  ) {
    analyzeExpression(parentNode, elm.right)
  } else if (elm.type === AST_NODE_TYPES.AwaitExpression) {
    analyzeExpression(parentNode, elm.argument)
  } else if (elm.type === AST_NODE_TYPES.CallExpression) {
    for (const argument of elm.arguments) {
      analyzeExpression(parentNode, argument)
    }
  } else if (elm.type === AST_NODE_TYPES.ChainExpression) {
    analyzeExpression(parentNode, elm.expression)
  } else if (elm.type === AST_NODE_TYPES.ClassExpression) {
    // todo
  } else if (elm.type === AST_NODE_TYPES.ImportExpression) {
    if (elm.attributes) {
      analyzeExpression(parentNode, elm.attributes)
    }
  } else if (elm.type === AST_NODE_TYPES.MemberExpression) {
    analyzeExpression(parentNode, elm.object)
  } else if (elm.type === AST_NODE_TYPES.NewExpression) {
    for (const argument of elm.arguments) {
      analyzeExpression(parentNode, argument)
    }
    analyzeExpression(parentNode, elm.callee)
  } else if (elm.type === AST_NODE_TYPES.ObjectExpression) {
    for (const property of elm.properties) {
      if (property.type === AST_NODE_TYPES.MethodDefinition) {
        if (property.decorators) {
          for (const decorator of property.decorators) {
            analyzeExpression(parentNode, decorator.expression)
          }
        }
        if (property.value.type === AST_NODE_TYPES.FunctionExpression) {
          analyzeExpression(parentNode, property.value)
        }
      }
    }
  } else if (elm.type === AST_NODE_TYPES.SequenceExpression) {
    for (const expression of elm.expressions) {
      analyzeExpression(parentNode, expression)
    }
  } else if (elm.type === AST_NODE_TYPES.TaggedTemplateExpression) {
    for (const expression of elm.quasi.expressions) {
      analyzeExpression(parentNode, expression)
    }
  } else if (elm.type === AST_NODE_TYPES.TemplateLiteral) {
    for (const expression of elm.expressions) {
      analyzeExpression(parentNode, expression)
    }
  } else if (elm.type === AST_NODE_TYPES.YieldExpression) {
    if (elm.argument) {
      analyzeExpression(parentNode, elm.argument)
    }
  } else if (elm.type === AST_NODE_TYPES.ConditionalExpression) {
    analyzeExpression(parentNode, elm.alternate)
    analyzeExpression(parentNode, elm.consequent)
  } else if (
    elm.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    elm.type === AST_NODE_TYPES.FunctionExpression
  ) {
    if (elm.body.type === AST_NODE_TYPES.BlockStatement) {
      analyzeBlockStatement(parentNode, elm.body)
    } else {
      analyzeExpression(parentNode, elm.body)
    }
  } else if (
    elm.type === AST_NODE_TYPES.ArrayPattern ||
    elm.type === AST_NODE_TYPES.ObjectPattern ||
    elm.type === AST_NODE_TYPES.BinaryExpression ||
    elm.type === AST_NODE_TYPES.Identifier ||
    elm.type === AST_NODE_TYPES.JSXEmptyExpression ||
    elm.type === AST_NODE_TYPES.MetaProperty ||
    elm.type === AST_NODE_TYPES.Super ||
    elm.type === AST_NODE_TYPES.ThisExpression ||
    elm.type === AST_NODE_TYPES.TSAsExpression ||
    elm.type === AST_NODE_TYPES.TSNonNullExpression ||
    elm.type === AST_NODE_TYPES.TSTypeAssertion ||
    elm.type === AST_NODE_TYPES.UnaryExpression ||
    elm.type === AST_NODE_TYPES.UpdateExpression
  ) {
    // [Note]: Unprocessed.
  }

  return
}

const analyzeBlockStatement = (
  parentNode: ExtentionNode,
  statement: BlockStatement
) => {
  if (!statement) {
    return
  }
  for (const b of statement.body) {
    analyzeStatement(parentNode, b)
  }
}

const analyzeStatement = (parentNode: ExtentionNode, statement: Statement) => {
  if (!statement) {
    return
  }
  if (statement.type === AST_NODE_TYPES.BlockStatement) {
    analyzeBlockStatement(parentNode, statement)
  } else if (statement.type === AST_NODE_TYPES.ClassDeclaration) {
    // todo
  } else if (statement.type === AST_NODE_TYPES.DoWhileStatement) {
    analyzeStatement(parentNode, statement.body)
  } else if (statement.type === AST_NODE_TYPES.ExpressionStatement) {
    analyzeExpression(parentNode, statement.expression)
  } else if (statement.type === AST_NODE_TYPES.ForInStatement) {
    analyzeStatement(parentNode, statement.body)
  } else if (statement.type === AST_NODE_TYPES.ForOfStatement) {
    analyzeStatement(parentNode, statement.body)
  } else if (statement.type === AST_NODE_TYPES.ForStatement) {
    analyzeStatement(parentNode, statement.body)
  } else if (statement.type === AST_NODE_TYPES.FunctionDeclaration) {
    analyzeBlockStatement(parentNode, statement.body)
  } else if (statement.type === AST_NODE_TYPES.IfStatement) {
    if (statement.alternate) {
      analyzeStatement(parentNode, statement.alternate)
    }
    analyzeStatement(parentNode, statement.consequent)
  } else if (statement.type === AST_NODE_TYPES.ReturnStatement) {
    if (statement.argument) {
      analyzeExpression(parentNode, statement.argument)
    }
  } else if (statement.type === AST_NODE_TYPES.SwitchStatement) {
    for (const cs of statement.cases) {
      for (const con of cs.consequent) {
        analyzeStatement(parentNode, con)
      }
    }
  } else if (statement.type === AST_NODE_TYPES.TryStatement) {
    analyzeBlockStatement(parentNode, statement.block)
    if (statement.finalizer) {
      analyzeBlockStatement(parentNode, statement.finalizer)
    }
  } else if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
    for (const declaration of statement.declarations) {
      if (declaration.init) {
        analyzeExpression(parentNode, declaration.init)
      }
    }
  } else if (statement.type === AST_NODE_TYPES.WhileStatement) {
    analyzeStatement(parentNode, statement.body)
  } else if (statement.type === AST_NODE_TYPES.WithStatement) {
    analyzeStatement(parentNode, statement.body)
  } else if (
    statement.type === AST_NODE_TYPES.DebuggerStatement ||
    statement.type === AST_NODE_TYPES.ContinueStatement ||
    statement.type === AST_NODE_TYPES.ExportAllDeclaration ||
    statement.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
    statement.type === AST_NODE_TYPES.ExportNamedDeclaration ||
    statement.type === AST_NODE_TYPES.LabeledStatement ||
    statement.type === AST_NODE_TYPES.BreakStatement ||
    statement.type === AST_NODE_TYPES.ThrowStatement ||
    statement.type === AST_NODE_TYPES.TSDeclareFunction ||
    statement.type === AST_NODE_TYPES.TSEnumDeclaration ||
    statement.type === AST_NODE_TYPES.TSExportAssignment ||
    statement.type === AST_NODE_TYPES.TSImportEqualsDeclaration ||
    statement.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
    statement.type === AST_NODE_TYPES.TSModuleDeclaration ||
    statement.type === AST_NODE_TYPES.TSNamespaceExportDeclaration
  ) {
    // [Note]: Unprocessed.
  }
}

const analyzeChildrenJSXElement = (
  parentNode: ExtentionNode,
  element: JSXElement | JSXFragment
) => {
  for (const child of element.children) {
    if (
      child.type === AST_NODE_TYPES.JSXElement ||
      child.type === AST_NODE_TYPES.JSXFragment
    ) {
      analyzeExpression(parentNode, child)
    } else if (
      child.type === AST_NODE_TYPES.JSXExpressionContainer ||
      child.type === AST_NODE_TYPES.JSXSpreadChild
    ) {
      analyzeExpression(parentNode, child.expression)
    } else if (
      child.type === AST_NODE_TYPES.JSXEmptyExpression ||
      child.type == AST_NODE_TYPES.JSXText
    ) {
      // [Note]: Unprocessed.
    }
  }
}

const updateExists = (
  parentNode: ExtentionNode,
  openingElm: JSXOpeningElement,
  children: ExtentionNode[]
) => {
  if (openingElm.name.type === AST_NODE_TYPES.JSXIdentifier) {
    const name = openingElm.name.name
    const child = children.find((child) => child.exportName === name)
    if (!child) {
      return
    }
    child.exists = true
    parentNode.exists = true
  } else if (openingElm.name.type === AST_NODE_TYPES.JSXNamespacedName) {
    if (openingElm.name.name.type === AST_NODE_TYPES.JSXIdentifier) {
      const name = openingElm.name.name.name
      const child = children.find((child) => child.exportName === name)
      if (!child) {
        return
      }
      child.exists = true
      parentNode.exists = true
    }
  } else if (openingElm.name.type === AST_NODE_TYPES.JSXMemberExpression) {
    if (openingElm.name.object.type === AST_NODE_TYPES.JSXIdentifier) {
      const name = openingElm.name.object.name
      const childIndex = children.findIndex(
        (child) => child.exportName === name
      )

      if (childIndex === -1) {
        return
      }

      const child = children[childIndex]
      if (openingElm.name.property.type === AST_NODE_TYPES.JSXIdentifier) {
        child.exists = false
        const { name } = openingElm.name.property
        const childFromProperty: ExtentionNode = {
          id: name,
          astType: AST_NODE_TYPES.ImportSpecifier,
          title: name,
          fileName: child.fileName,
          exportName: name,
          coordinates: [0, 0],
          children: [],
          exists: true,
          loc: {
            start: { ...defaultLineColumn },
            end: { ...defaultLineColumn },
          },
        }
        children.splice(childIndex, 0, childFromProperty)
        parentNode.exists = true
      }
    }
  }
  return
}

const findAnalyzeFilePath = (basePath: string) => {
  for (const ext of EXTENTIONS) {
    if (fs.existsSync(`${basePath}${ext}`)) {
      return { filePath: `${basePath}${ext}`, existsFile: true }
    } else if (fs.existsSync(`${basePath}/index${ext}`)) {
      return { filePath: `${basePath}/index${ext}`, existsFile: true }
    }
  }

  return { filePath: '', existsFile: false }
}

// [Note]: The calling component cannot get the exact name of the loaded function by default.
const findDefaultDeclarationName = (
  body: ProgramStatement[]
): string | undefined => {
  const defaultDeclaration = body.find(
    ({ type }) => type === AST_NODE_TYPES.ExportDefaultDeclaration
  )

  if (!defaultDeclaration) {
    return undefined
  }

  if (defaultDeclaration.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
    const { type } = defaultDeclaration.declaration
    if (type === AST_NODE_TYPES.Identifier) {
      const { name } = defaultDeclaration.declaration
      return name
    }
  }
}
