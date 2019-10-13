<p align="center">
<h2 align="center">
  Wireless Match ²
</h2>
<h4 align="center">Standard Webpack deployment for React</h4>

<br/>

## About
This exports the standard webpack configuration for WirelessMatch React deployments. 

<br/>

## Installation

```
npm install @wirelessmatch/webpack
```

<br/>

## Usage

> webpack.config.js
```js
const config = require("@wirelessmatch/webpack");

module.exports = config({
  title: "Wireless Match"
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
