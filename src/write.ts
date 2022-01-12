import chalk from 'chalk'
import { writeFileSync } from 'fs'
import path from 'path'
import { CustomDiagram } from './types'

export const writeHtml = (diagram: CustomDiagram): void => {
  const outputFilePath = path.resolve(path.resolve(), './stats.html')
  writeFileSync(outputFilePath, makeHtml(diagram))
  console.log(chalk.green(`Success. ${outputFilePath}`))
  return
}

const getDiagramJson = (diagram: CustomDiagram): string => {
  return `const diagram =${JSON.stringify(diagram)}`
}

const makeHtml = (diagram: CustomDiagram) => {
  const resolveFilePath = (filaPath: string) =>
    path.resolve(__dirname, filaPath)

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
    <style>
    body {
      font-family:"ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", "メイリオ", Meiryo, Osaka, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif;
      color: white !important;
      font-size: 11px;
      background: #01060B;
    }
    .bi.bi-diagram {      
      background-color: #01060B !important;
      overflow: scroll !important;
      border: none !important;
      box-shadow: none !important;
    }
    a {
      padding: 4px;
      cursor: pointer;
    }
    a + a {
      margin-left: 4px;
    }
    a,
    a:visited {
      color: white;
    }
    a:hover {
      opacity: .7;
    }
    .drawer { 
      height: 100%;
      background: white;
      position: fixed;
      top: 0;
      right: 0;
      width: 600px;
      z-index: 200;
      box-shadow: 1px 0px 7px rgba(0,0,0,0.5); 
      transform: translateX(100%);
      transition: transform 0.3s ease-out;
    }
    .drawer.open {
      transform: translateX(0);
    }
    .line-highlight {
      background: linear-gradient(to right, hsla(124, 120%, 50%,.15) 100%, hsla(24, 20%, 50%,0)) !important;
    }
    div.code-toolbar > .toolbar {
      top: -4px;
    }
    </style>
  </head>
  <body>
    <div id="root" />
    <script src="${resolveFilePath('../dist/viewer.js')}"></script>
  </body>
</html>`
}
