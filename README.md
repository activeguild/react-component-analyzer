<h1 align="center">react-component-analyzer ⚡ Welcome 😀</h1>

<p align="left">
  <a href="https://github.com/actions/setup-node"><img alt="GitHub Actions status" src="https://github.com/activeguild/visualize-react-component/workflows/automatic%20release/badge.svg" style="max-width:100%;"></a>
</p>

## react-component-analyzer

Analyze the component tree of react and displays it as a diagram in the browser.
You can refer to the corresponding code from the diagram.

![demo.png](https://user-images.githubusercontent.com/39351982/151507430-aa84e421-f77f-45aa-ba76-76504ebd7610.png)

## Motivation

- It plays an auxiliary role in visualizing the component design during implementation and activating smooth discussions.
- It will lead to shrinking the cost of development.

## Point

- Using the popular library, [@typescript-eslint/typescript-estree](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/typescript-estree) AST to do the analysis.
- By using VSCode's schema in the Browser, you can quickly check the implementation of components you are interested in.If you do not have vscode installed, you can also check the code in your browser.
- If you are using vite without setting it in the config file, you can resolve the alias from vite.config.ts.
- It uses [prismjs](https://github.com/PrismJS/prism/), which allows for code reading that is more like an IDE.

## On Daiagram

- You can check the code of the component.
- Reference to VS Code allows code to be referenced in VS Code.
- New nodes can be added by double-clicking on a background other than the component.
- Links between each node can be removed by double-clicking.
- Dragging from the top and bottom of a node to another node to link to it.

## Install

```bash
npm i -D react-component-analyzer
```

## Usage

By specifying the React root file and the component files, it will parse them and output the `stats.html` file.

```
npx virot ./src/main.tsx
```

## Config

The following options can be set in the configuration file.
Prepare a `virot.config.js` file with the following properties.

| Property | Type    | Description                                                              |
| -------- | ------- | ------------------------------------------------------------------------ |
| vscode   | boolean | Use vscode schema to code jump to the target component. (default `true`) |
| alias    | Array   | Specify multiple aliases for entry points.                               |

`alias Property`
| Property | Type | Description |
| -------- | ----- | ----------- |
| find | String | Entry point alias. |
| replacement | String | Resolve aliases by specifying absolute paths. |

#### Sample

```js
const path = require('path')

module.exports = {
  alias: [
    {
      find: '@',
      replacement: path.resolve(__dirname, 'src'),
    },
  ],
}
```

## Principles of conduct

Please see [the principles of conduct](https://github.com/activeguild/visualize-react-component/blob/master/.github/CONTRIBUTING.md) when building a site.

## License

This library is licensed under the [MIT license](https://github.com/activeguild/visualize-react-component/blob/master/LICENSE).
