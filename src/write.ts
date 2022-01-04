import chalk from 'chalk'
import { writeFileSync } from 'fs'
import path from 'path'
import { CustomSchema } from './types'

export const writeHtml = (diagram: CustomSchema): void => {
  const outputFilePath = path.resolve(__dirname, '../dist/stats.html')
  writeFileSync(outputFilePath, getHtml(diagram))
  console.log(chalk.green(`Success. ${outputFilePath}`))
  return
}

const getDiagramJson = (diagram: CustomSchema): string => {
  return `const diagram =${JSON.stringify(diagram)}`
}

const getHtml = (diagram: CustomSchema) => {
  const getScriptPath = () => path.resolve(__dirname, '../dist/viewer.js')

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title></title>
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
    a,
    a:visited {
      color: white !important;
    }
    a:hover {
      opacity: .7;
    }
    </style>
  </head>
  <body>
    <div id="root" />
    <script src="${getScriptPath()}"></script>
  </body>
</html>`
}
