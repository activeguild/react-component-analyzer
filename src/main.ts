import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'
import type { Link, Node } from 'beautiful-react-diagrams/@types/DiagramSchema'
import chalk from 'chalk'
import path from 'path'
import { analyze } from './analyze'
import { resolveFinalConfig } from './config'
import {
  NEXT_NODE_POSITION_X,
  NEXT_NODE_POSITION_Y,
  NODE_MARGIN,
} from './constants'
import type {
  Config,
  CustomDiagram,
  Data,
  ExtentionNode,
  LineColumn,
} from './types'
import { writeHtml } from './write'

let diagramWidth = 0
let diagramHeight = 0

const defaultLineColumn: LineColumn = { line: 1, column: 1 }

export const main = async (fileName: string, config: Config) => {
  try {
    if (!path.isAbsolute(fileName)) {
      fileName = path.resolve(path.resolve(), fileName)
    }

    const finalConfig: Required<Config> = resolveFinalConfig(config)

    const title = path.basename(fileName).replace(/\.[^/.]+$/, '')

    const parentNode: ExtentionNode = {
      id: title,
      title,
      astType: AST_NODE_TYPES.ImportSpecifier,
      fileName,
      disableDrag: false,
      exportName: '',
      coordinates: [0, 0],
      children: [],
      exists: true,
      loc: {
        start: { ...defaultLineColumn },
        end: { ...defaultLineColumn },
      },
    }

    analyze(
      true,
      finalConfig.alias,
      fileName,
      parentNode,
      path.dirname(fileName)
    )

    const x = NODE_MARGIN,
      y = NODE_MARGIN
    const { id, content } = parentNode
    const nodes: Node<Data>[] = [
      {
        id,
        content,
        coordinates: [x, y],
        data: {
          title: id,
          fileName,
          loc: {
            start: { ...defaultLineColumn },
            end: { ...defaultLineColumn },
          },
        },
      },
    ]
    const links: Link[] = []
    convertToFinalNode(parentNode, nodes, links, x, y + NEXT_NODE_POSITION_Y)

    const diagram: CustomDiagram = {
      vscode: finalConfig.vscode,
      width: diagramWidth + NEXT_NODE_POSITION_X,
      height: diagramHeight + NEXT_NODE_POSITION_Y,
      schema: {
        nodes,
        links,
      },
    }

    writeHtml(diagram)
  } catch (e) {
    console.log(chalk.red(`e: ${e}`))
  }
}

const convertToFinalNode = (
  parentNode: ExtentionNode,
  nodes: Node<Data>[],
  links: Link[],
  x: number,
  y: number
) => {
  const { children } = parentNode

  for (const child of children) {
    const { id, content, disableDrag, exists, loc, fileName } = child
    if (exists) {
      const findedNode = nodes.find((node) => node.id === id)
      if (!findedNode) {
        x += NEXT_NODE_POSITION_X
        if (diagramWidth < x) {
          diagramWidth = x
        }
        if (diagramHeight < y) {
          diagramHeight = y
        }
        nodes.push({
          id,
          content,
          disableDrag,
          coordinates: [x, y],
          data: { title: id, fileName, loc },
        })
        x = convertToFinalNode(child, nodes, links, x, y + NEXT_NODE_POSITION_Y)
      }
      links.push({ input: parentNode.id, output: id })
    }
  }

  return x
}
