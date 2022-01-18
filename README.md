<h1 align="center">visualize-react-component ⚡ Welcome 😀</h1>

<p align="left">
  <a href="https://github.com/actions/setup-node"><img alt="GitHub Actions status" src="https://github.com/activeguild/visualize-react-component/workflows/automatic%20release/badge.svg" style="max-width:100%;"></a>
</p>

## visualize-react-component

Analyze the component tree of react and displays it as a diagram in the browser.
You can refer to the corresponding code from the diagram.

![demo.png](https://user-images.githubusercontent.com/39351982/149858365-0fd560bf-6d7e-408f-b9be-d88ed63abe2d.png)

## Motivation

- It plays an auxiliary role in visualizing the component design during implementation and activating smooth discussions.
- It will lead to shrinking the cost of development.

## Point

- Using the popular library, [@typescript-eslint/typescript-estree](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/typescript-estree) AST to do the analysis.
- By using VSCode's schema in the Browser, you can quickly check the implementation of components you are interested in.If you do not have vscode installed, you can also check the code in your browser.
- If you are using vite without setting it in the config file, you can resolve the alias from vite.config.ts.
- It uses [prismjs](https://github.com/PrismJS/prism/), which allows for code reading that is more like an IDE.

## Install

```bash
npm i -D visualize-react-component
```

## Usage

By specifying the React root file and the component files, it will parse them and output the `stats.html` file.

```
npm run virot ./src/main.tsx
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
