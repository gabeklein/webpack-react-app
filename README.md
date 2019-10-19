<br/>

<h2 align="center">Standard Webpack deployment for React</h2>

<br/>

## About
This exports the standard webpack configuration for WirelessMatch React deployments. 

<br/>

## Installation

```
npm install @gabeklein/webpack-react-app
```

<br/>

## Usage

> webpack.config.js
```js
const config = require("@gabeklein/webpack-react-app");

module.exports = config({
  title: "My Website"
})
```

<br/>

## Arguments

<br/>

- `title` - Title of HTML webpage by default.
- `dir` - Working directory (optional)
- `mode` - Webpack mode - `"development" | "production"`

<br/>

<h4 align="center"><a href="https://github.com/gabeklein">@gabeklein</a></h4>

<br/><br/>
