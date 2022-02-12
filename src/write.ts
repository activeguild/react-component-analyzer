import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import pc from 'picocolors'
import { Config, CustomDiagram } from './types'

export const writeHtml = (
  diagram: CustomDiagram,
  config: Required<Config>
): void => {
  const outputFilePath = config.outputPath
    ? config.outputPath
    : path.resolve(path.resolve(), './stats.html')
  const viewerJsAsString = readFileSync(
    path.resolve(__dirname, './viewer.js')
  ).toString()
  const viewerCssAsString = readFileSync(
    path.resolve(__dirname, './viewer.css')
  ).toString()

  writeFileSync(
    outputFilePath,
    makeHtml(diagram, viewerJsAsString, viewerCssAsString)
  )
  console.log(pc.green(`Success. ${outputFilePath}`))
  return
}

const getDiagramJson = (diagram: CustomDiagram): string => {
  return `const diagram =${JSON.stringify(diagram)}`
}

const makeHtml = (
  diagram: CustomDiagram,
  viewerJsAsString: string,
  viewerCssAsString: string
) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>react component analyzer</title>
    <style>${viewerCssAsString}</style>
    <script>
    ${getDiagramJson(diagram)}
    </script>
  </head>
  <body>
    <div id="root" />
    <script>${viewerJsAsString}</script>
  </body>
</html>`
}
