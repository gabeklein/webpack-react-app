// const PresetExpressive = require("@expressive/babel-preset-react");
const GradientModifier = require("@expressive/modify-gradient");

// const PresetReact = require("@babel/preset-react");
// const PluginClassProperties = require("@babel/plugin-proposal-class-properties");

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');

const { resolve } = require("path");

module.exports = configureDefault;

function configureDefault(opts = {}){

  /** ------------------ OPTS ------------------- */

  const {
    directory: DIR = process.cwd(),
    mode = process.env.WEBPACK_DEV_SERVER ? "development" : "production",
    title
  } = opts;

  const dir = path => resolve(DIR, path);
  const DEV = mode === "development";
  
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

  /** ------------------ WEBPACK ----------------- */

  const plugins = [
    new CopyWebpackPlugin([
      { from: dir("static"), to: dir("public") } 
    ])
  ];

  const loaders = [
    {
      test: /\.ya?ml$/,
      use: ["yaml", "json"]
    },
    {
      test: /\.js$/,
      loader: "babel-loader",
      include: __dirname,
      exclude: dir("node_modules"),
      options: babelrc
    },
    {
      test: /\.(png|jpe?g|gif|mp4)$/i,
      loader: 'file-loader',
      options: { name: '[md5:hash:base64:10].[ext]' },
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
      title, 
      inject: true,
      base: "/",
      meta: {
        "viewport": "viewport-fit=cover, maximum-scale=1.0, initial-scale=1.0"
      }
    }),
    new HtmlWebpackTagsPlugin({ 
      links: ["style.css"] 
    }),
    new HtmlWebpackRootPlugin("react-root"),
    new HtmlWebpackRootPlugin("react-modal-root")
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

  /** ----------------- EXPORT ------------------- */

  return config;
}
