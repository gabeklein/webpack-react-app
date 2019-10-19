const { DefinePlugin } = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');
const IntermediateEntryPlugin = require("webpack-intermediate-entry");

const GradientModifier = require("@expressive/modify-gradient");

const { resolve } = require("path");

module.exports = configureDefault;

function configureDefault(opts = {}){

  /** ------------------ OPTS ------------------- */

  const {
    dir: currentDir = process.cwd(),
    mode: envMode = process.env.WEBPACK_DEV_SERVER ? "development" : "production",
    root: reactRoot = "react-root",
    entry: entryModule = "src/app.js",
    modal: modalRoot,
    static: staticDir,
    babel: babelInsert = {},
    plugins: webpackPlugins,
    title: htmlTitle,
    tags: insertTags,
    metas: insertMetas,
    scripts: insertScripts,
    links: insertLinks,
    styleCSS
  } = opts;

  const dir = path => resolve(currentDir, path);
  const DEV = envMode === "development";
  
  /** ------------------ BABEL ------------------ */

  const babelrc = {
    presets: [
      "@babel/react",
      ["@expressive/react", {
        modifiers: [ GradientModifier ],
        hot: DEV
      }]
    ],
    plugins: [
      "@babel/proposal-class-properties"
    ]
  }

  if(babelInsert.presets)
    Object.assign(babelrc.presets, babelInsert.presets)

  if(babelInsert.plugins)
    Object.assign(babelrc.plugins, babelInsert.plugins)

  /** ------------------ WEBPACK ----------------- */

  const plugins = [
    new DefinePlugin({ REACT_ROOT: `"${reactRoot}"` })
  ];

  if(staticDir !== false)
    plugins.push(
      new CopyWebpackPlugin([
        { from: dir(staticDir || "static"), to: dir("public") } 
      ])
    )

  if(webpackPlugins)
    plugins.push(...webpackPlugins)

  const loaders = [
    {
      test: /\.js$/,
      loader: "babel-loader",
      include: currentDir,
      exclude: dir("node_modules"),
      options: babelrc
    },
    {
      test: /\.(png|jpe?g|gif|mp4)$/i,
      loader: 'file-loader',
      options: { name: '[md5:hash:base64:10].[ext]' },
    },
    {
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    },
    {
      test: /\.ya?ml$/,
      use: ["yaml", "json"]
    },
    {
      test: /\.mdx?$/,
      use: [
        { 
          loader: 'babel-loader', 
          options: babelrc 
        },
        '@mdx-js/loader'
      ]
    }
  ];

  const config = {
    entry: {
      main: dir(entryModule)
    },
    stats: {
      assets: false
    },
    performance: {
      maxAssetSize: 1000000
    },
    output: {
      filename: "[name].js",
      publicPath: "/",
      path: dir("public")
    },
    resolve: {
      modules: [ dir("src"), dir("node_modules") ],
      extensions: ['.js', '.md', '.yml']
    },
    plugins,
    module: {
      rules: loaders
    }
  }

  /** ---------------- INDEX.HMTL ---------------- */

  plugins.push(
    new HtmlWebpackPlugin({
      title: htmlTitle, 
      inject: true,
      base: "/",
      meta: {
        "viewport": "viewport-fit=cover, maximum-scale=1.0, initial-scale=1.0"
      }
    }),
    new HtmlWebpackRootPlugin(reactRoot || "react-root")
  )
  
  if(modalRoot)
    plugins.push(
      new HtmlWebpackRootPlugin(modalRoot === true ? "react-modal-root" : modalRoot)
    )

  if(styleCSS)
    plugins.push(
      new HtmlWebpackTagsPlugin({ 
        links: [
          styleCSS === true ? "style.css" : styleCSS
        ] 
      })
    )

  if(insertLinks || insertMetas || insertScripts || insertTags){
    const conf = { 
      tags: insertTags,
      scripts: insertScripts,
      metas: insertMetas,
      links: insertLinks
    };

    for(const k in conf)
      if(conf[k])
        conf[k] = conf[k].map(x => {
          if(typeof x == "string" && /https?:\/\//.test(x))
            return { path: x, publicPath: false }
          return x;
        })

    plugins.push(
      new HtmlWebpackTagsPlugin(conf)
    )
  }

  /** --------------- DEVELOPMENT ---------------- */

  if(DEV){
    babelrc.plugins.unshift("react-hot-loader/babel");

    config.mode = "development"
    config.devtool = "source-map"
    config.stats = {
      modules: false
    }
    config.devServer = {
      historyApiFallback: true,
      contentBase: dir("./public"),
      host: "0.0.0.0",
      port: 3000,
      hot: true
    }

    plugins.push(
      new IntermediateEntryPlugin({ insert: resolve(__dirname, "entry.hot.js") })
    )
  }

  /** --------------- PRODUCTION ----------------- */

  if(!DEV){
    let scripts = ["react", "react-dom"];

    scripts = scripts.map(package => ({ 
      path: `https://unpkg.com/${package}@16/umd/${package}.production.min.js`, 
      attributes: { crossorigin: true },
      publicPath: false
    }))

    config.mode = "production"
    config.devtool = "none"
    config.externals = {
      "react": "React",
      "react-dom": "ReactDOM"
    };
    
    plugins.push(
      new IntermediateEntryPlugin({ insert: resolve(__dirname, "entry.prod.js") }),
      new HtmlWebpackTagsPlugin({ scripts, append: false })
    )
  }

  /** ----------------- EXPORT ------------------- */

  return config;
}
