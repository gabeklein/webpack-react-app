import { MaybeLinkTagOptions, MaybeScriptTagOptions, MetaTagOptions } from "html-webpack-tags-plugin"

declare function ExpressiveWebpackConfig(opts: ExpressiveWebpackConfig.ConfigOptions): any;

export = ExpressiveWebpackConfig;

declare namespace ExpressiveWebpackConfig {
  interface ConfigOptions {
    /** Root directory.
     * 
     * Defaults to `process.cwd()`
     */
    dir?: string;
  
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
     * Append `<link>` style tag to html. Relative to `public`.
     * 
     * - `true` - use default id `style.css`; 
     * - `string` - custom `href`
     */
    styleCSS?: true | string;
  
    /**
     * If defined, passed to appended instance of `html-webpack-tags-plugin`.
     */
    tags?: string | MaybeLinkTagOptions | MaybeScriptTagOptions | Array<string | MaybeLinkTagOptions | MaybeScriptTagOptions> 
  
    /**
     * If defined, passed to appended instance of `html-webpack-tags-plugin`.
     */
    metas?: string | MetaTagOptions | Array<string | MetaTagOptions>
  
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
    plugins?: any;
  }
}