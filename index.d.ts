import {
  LinkTagOptions,
  MaybeLinkTagOptions,
  MaybeScriptTagOptions,
  MetaTagOptions,
  ScriptTagOptions,
} from 'html-webpack-tags-plugin';

import { Plugin, RuleSetLoader, Options, ExternalsElement, Resolve } from "webpack"
import { ProxyConfigArray, ProxyConfigMap } from "webpack-dev-server"

declare function Prefab(opts: Prefab.Options): any;

export = Prefab;

declare namespace Prefab {
  interface Options {
    /** Root directory.
     * 
     * Defaults to `process.cwd()`
     */
    dir?: string;

    /**
     * Entry point, relative to `dir`. 
     * 
     * Export a component as default and it will be rendered in your application's root.
     * 
     * Default: `src/app.js`
     */
    entry?: string;

    ext: {
      modules: string[];
      assets: string | string[];
    }
  
    /**
     * Env mode; production or development. Is passed to webpack.
     * 
     * Automatically `development` if `process.env.WEBPACK_DEV_SERVER` is true.
     */
    mode?: "development" | "production";
  
    /**
     * Title used in generated HTML entry point.
     */
    title: string;
  
    /**
     * Custom static directory (for `copy-webpack-plugin` to copy to public). 
     * 
     * - `string` - override default `/static`. Relative to `dir`. 
     * - `false` - plugin will not run.
     */
    static?: string | false;

    /**
     * Proxy configuration passed to webpack-dev-server.
     */
    proxy?: ProxyConfigArray | ProxyConfigMap;

    optimization?: Options.Optimization;
  
    /**
     * Append `<link>` style tag to html. Relative to `public`.
     * 
     * - `true` - use default id `style.css`; 
     * - `string` - custom `href`
     */
    styleCSS?: true | string;
  
    /**
     * Passed to appended instance of `html-webpack-tags-plugin`.
     */
    tags?: string | MaybeLinkTagOptions | MaybeScriptTagOptions | Array<string | MaybeLinkTagOptions | MaybeScriptTagOptions> 
    
    /**
     * Passed to appended instance of `html-webpack-tags-plugin`.
     */
    links?: string | LinkTagOptions | Array<string | LinkTagOptions>;

    /**
     * Passed to appended instance of `html-webpack-tags-plugin`.
     */
    scripts?: string | ScriptTagOptions | Array<string | ScriptTagOptions>;

    /**
     * Passed to appended instance of `html-webpack-plugin`.
     */
    meta?: string | MetaTagOptions | Array<string | MetaTagOptions>;

    /**
     * Override `id` for React root `<div>`.
     */
    root?: string;
  
    /**
     * Add additional root `<div>` for a modal. Intended for use via `React.createPortal()`. 
     * 
     * - `true` - use default id `react-modal-root`; 
     * - `string` - apply as custom `id`
     */
    modal?: true | string;
  
    /**
     * Merge into babel config.
     */
    babel?: {
      plugins: any;
      presets: any;
    }
  
    /**
     * Append webpack plugins.
     */
    plugins?: Plugin[];
    resolve: Resolve;

    externals: ExternalsElement | ExternalsElement[]

    /**
     * Append webpack loaders.
     */
    loaders?: RuleSetLoader[];
  }
}