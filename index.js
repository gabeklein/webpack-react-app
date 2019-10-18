const GradientModifier = require("@expressive/modify-gradient");

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');

const { resolve } = require("path");

module.exports = configureDefault;

function configureDefault(opts = {}){

  /** ------------------ OPTS ------------------- */

  const {
    dir: currentDir = process.cwd(),
    mode: envMode = process.env.WEBPACK_DEV_SERVER ? "development" : "production",
    title: htmlTitle,
    tags: insertTags,
    metas: insertMetas,
    root: reactRoot,
    modal: modalRoot,
    babel: babelInsert = {},
    static: staticDir,
    styleCSS,
    plugins: webpackPlugins
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

  const plugins = [];

  if(staticDir !== false)
    plugins.push(
    new CopyWebpackPlugin([
      { from: dir(staticDir || "static"), to: dir("public") } 
    ])
    )

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
      main: dir("src/index.js")
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

  /** --------------- DEVELOPMENT ---------------- */

  if(DEV){
    babelrc.plugins.unshift("react-hot-loader/babel");

    config.mode = "development"
    config.devtool = "source-map"
    config.stats = {
      modules: false
    }
    config.resolve.alias = {
      "react-dom": "@hot-loader/react-dom",
      "./app": dir("./src/app.hot.js")
    };
    config.devServer = {
      historyApiFallback: true,
      contentBase: dir("./public"),
      host: "0.0.0.0",
      port: 3000,
      hot: true
    }
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
      new HtmlWebpackTagsPlugin({ scripts, append: false })
    )
  }

  /** ----------------- APPEND ------------------- */

  if(insertTags)
    plugins.push(
      new HtmlWebpackTagsPlugin({ 
        tags: insertTags
      })
    )

  if(insertMetas)
    plugins.push(
      new HtmlWebpackTagsPlugin({
        metas: insertMetas
      })
    )

  if(webpackPlugins)
    plugins.push(...webpackPlugins)

  /** ----------------- EXPORT ------------------- */

  return config;
}
