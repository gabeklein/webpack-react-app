const { DefinePlugin, EnvironmentPlugin } = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');
const IntermediateEntryPlugin = require("webpack-intermediate-entry");

const { resolve } = require("path");
const { env } = process;

module.exports = configureDefault;

function configureDefault(opts = {}){

  /** ------------------ OPTS ------------------- */

  const {
    dir: currentDir = process.cwd(),
    mode: envMode = env.NODE_ENV || (env.WEBPACK_DEV_SERVER ? "development" : "production"),
    root: reactRoot = "react-root",
    entry: entryModule = "src/app.js",
    modal: modalRoot,
    static: staticDir,
    babel: babelInsert = {},
    loaders: webpackLoaders,
    optimization: webpackOptimization = {},
    plugins: webpackPlugins,
    ext: extraExtentions,
    title: htmlTitle,
    tags: insertTags,
    meta: insertMeta,
    scripts: insertScripts,
    links: insertLinks,
    proxy: devProxyConfig,
    resolve: configResolve,
    externals,
    styleCSS
  } = opts;

  const dir = path => resolve(currentDir, path);
  const DEV = envMode === "development";
  
  /** ------------------ BABEL ------------------ */

  const babelrc = {
    presets: [
      "@babel/react",
    ],
    plugins: [
      "@babel/proposal-class-properties"
    ]
  }

  if(babelInsert.presets)
    babelrc.presets.push(...babelInsert.presets)

  if(babelInsert.plugins)
    babelrc.plugins.push(...babelInsert.plugins)

  /** ------------------ WEBPACK ----------------- */

  const plugins = [
    new DefinePlugin({ REACT_ROOT: `"${reactRoot}"` }),
    new EnvironmentPlugin({ NODE_ENV: envMode })
  ];

  let moduleExt = ['.js', '.jsx', '.md', '.yml'];
  let assetExt = "png|jpe?g|gif|mp4";

  if(staticDir !== false)
    plugins.push(
      new CopyWebpackPlugin([
        { from: dir(staticDir || "static"), to: dir("public") } 
      ])
    )

  if(webpackPlugins)
    plugins.push(...webpackPlugins);
    
  if(extraExtentions){
    const { assets: aE, modules: mE } = extraExtentions;
    if(Array.isArray(aE))
      aE = aE.join("|");
    assetExt += "|" + aE;
    if(mE)
      moduleExt = moduleExt.concat(mE.map(x => '.'+x));
  }

  const loaders = [
    {
      test: /\.js$/,
      loader: "babel-loader",
      include: currentDir,
      exclude: dir("node_modules"),
      options: babelrc
    },
    {
      test: new RegExp(`\.(${assetExt})$`, 'i'),
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

  if(webpackLoaders)
    loaders.push(...webpackLoaders);

  const config = {
    mode: envMode,
    entry: {
      main: dir(entryModule)
    },
    stats: {
      assets: false
    },
    performance: {
      maxAssetSize: 1000000
    },
    optimization: webpackOptimization,
    output: {
      filename: "[name].js",
      publicPath: "/",
      path: dir("public")
    },
    resolve: {
      modules: [ dir("src"), dir("node_modules") ],
      extensions: moduleExt
    },
    plugins,
    module: {
      rules: loaders
    }
  }

  if(externals)
    config.externals = externals;

  if(configResolve)
    Object.assign(config.resolve, configResolve);

  /** ---------------- INDEX.HMTL ---------------- */

  const metaTags = {
    "viewport": "viewport-fit=cover, maximum-scale=1.0, initial-scale=1.0"
  };

  if(insertMeta)
    Object.assign(metaTags, insertMeta);

  plugins.push(
    new HtmlWebpackPlugin({
      title: htmlTitle, 
      inject: true,
      base: "/",
      meta: metaTags
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

  if(insertLinks || insertScripts || insertTags){
    const opts = {};
    const maybe = { 
      tags: insertTags,
      scripts: insertScripts,
      links: insertLinks
    };

    for(const k in maybe)
      if(maybe[k])
        opts[k] = maybe[k].map(x => {
          if(typeof x == "string" && /https?:\/\//.test(x))
            return { path: x, publicPath: false }
          return x;
        })

    plugins.push(
      new HtmlWebpackTagsPlugin(opts)
    )
  }

  /** --------------- DEVELOPMENT ---------------- */

  if(DEV){
    babelrc.plugins.unshift("react-hot-loader/babel");

    config.devtool = "source-map";
    config.resolve.alias = { 
      'react-dom': '@hot-loader/react-dom'
    }
    config.devServer = {
      historyApiFallback: true,
      contentBase: dir("./public"),
      host: "0.0.0.0",
      port: 3000,
      hot: true,
      stats: {
        modules: false,
        excludeAssets: [
          (assetName, x) => !/js$/.test(assetName)
        ]
      },
      proxy: devProxyConfig
    }

    plugins.push(
      new IntermediateEntryPlugin({ insert: resolve(__dirname, "entry.hot.js") })
    )
  }

  /** --------------- PRODUCTION ----------------- */

  if(!DEV){
    let scripts = ["react", "react-dom"];

    scripts = scripts.map(package => ({ 
      path: `https://cdnjs.cloudflare.com/ajax/libs/${package}/16.10.2/umd/${package}.production.min.js`,
      attributes: { crossorigin: true },
      publicPath: false
    }))

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