import { writeFileSync } from 'fs'
import path from 'path'
import pc from 'picocolors'
import { CustomDiagram } from './types'

export const writeHtml = (diagram: CustomDiagram): void => {
  const outputFilePath = path.resolve(path.resolve(), './stats.html')
  writeFileSync(outputFilePath, makeHtml(diagram))
  console.log(pc.green(`Success. ${outputFilePath}`))
  return
}

const getDiagramJson = (diagram: CustomDiagram): string => {
  return `const diagram =${JSON.stringify(diagram)}`
}

const makeHtml = (diagram: CustomDiagram) => {
  const resolveFilePath = (filaPath: string) => {
    return path.resolve(__dirname, filaPath)
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title></title>
    <link href="${resolveFilePath('../dist/viewer.css')}" rel="stylesheet" />
    <script>
    ${getDiagramJson(diagram)}
    </script>
  </head>
  <body>
    <div id="root" />
    <script src="${resolveFilePath('../dist/viewer.js')}"></script>
  </body>
</html>`
}
