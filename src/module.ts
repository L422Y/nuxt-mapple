import { mkdirSync, readdirSync, statSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { createResolver, defineNuxtModule } from "@nuxt/kit"
import { NuxtPage } from "@nuxt/schema"
import { MappleDynamicRoute, SiteMapGenerator } from "./SiteMapGenerator"

// @ts-ignore

const lsDir = function (dir, files: string[] = []) {
  if (statSync(dir).isDirectory()) {
    readdirSync(dir).forEach((file) => {
      const absolute: string = join(dir, file)
      if (statSync(absolute).isDirectory()) {
        return lsDir(absolute, files)
      } else {
        files.push(absolute)
      }
    })
  }
  return files
}

export interface ModuleOptions {
  /**
   * Base path/URL for the sitemap
   */
  basePath?: string,
  /**
   * Static routes to include in the sitemap
   */
  staticRoutes?: string[],
  /**
   * Verbose logging
   */
  verbose?: boolean,
  /**
   * Dynamic routes to include in the sitemap
   */
  dynamicRoutes?: any | MappleDynamicRoute[],
  /**
   * Whether to scan the content directory for content pages
   */
  useContent?: boolean,
  /**
   * RegExp to exclude content paths from the sitemap
   */
  excludeContent?: undefined | string,
  /**
   * RegExp to exclude any routes from the sitemap
   */
  excludeAny?: undefined | string,
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-mapple",
    version: "0.2.0",
    configKey: "mapple",
    compatibility: {nuxt: "^3.0.0"}
  },
  defaults: {
    basePath: "",
    dynamicRoutes: [] as MappleDynamicRoute[],
    staticRoutes: [] as string[],
    verbose: false,
    useContent: false,
    excludeContent: undefined,
    excludeAny: undefined
  } as ModuleOptions,

  setup: function (options, nuxt) {
    let sitemapRoutes: string[]
    let pages = [] as NuxtPage[]
    let contentPaths: string[] = []

    const resolver = createResolver(import.meta.url)
    const filePath = resolver.resolve(
      nuxt.options.srcDir,
      "node_modules/.cache/.sitemap/sitemap.xml"
    )
    let excludeAnyRegExp: RegExp | undefined

    if (options.useContent) {
      // scan the content directory
      const dir = resolver.resolve(
        nuxt.options.srcDir,
        "content"
      )
      const contentPath = join(nuxt.options.srcDir, "content")
      const files = lsDir(dir) || []
      contentPaths = files.filter(el => el.match(/\/[^.]*(\.md$|[[\]:])/)).map((el: string) => {
        return el.replace(contentPath, "").replace(/\.md$/, "")
      })

      // filter out unwanted content paths
      if (options.excludeContent) {
        try {
          const excludeContentRegExp = new RegExp(options.excludeContent)
          contentPaths = contentPaths.filter(el => excludeContentRegExp.test(el) !== true)
        } catch (err) {
          console.error(err)
        }
      }

      // filter out unwanted routes
      if (options.excludeAny) {
        try {
          excludeAnyRegExp = new RegExp(options.excludeAny)
          if (excludeAnyRegExp) {
            contentPaths = contentPaths.filter(el => excludeAnyRegExp?.test(el) !== true)
          }
        } catch (err) {
          console.error(err)
        }
      }


    }

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({baseURL: "/", dir: dirname(filePath)})

    nuxt.hook("pages:extend", (pagesExtend) => {

      pages = [...pages, ...pagesExtend]

      const sitemapRoutesOrig: string[] = pages.map(route => route.path)
      sitemapRoutes = sitemapRoutesOrig.filter(r => !r.includes(":"))
      sitemapRoutes = [...sitemapRoutes, ...options?.staticRoutes || []].filter(v => !!v)
      const generator = new SiteMapGenerator(options?.dynamicRoutes, {...options, excludeAnyRegExp})

      if (options.useContent) {
        generator.pushPaths(contentPaths)
      }

      generator.pushPaths(sitemapRoutes)

      const sitemap = generator.getSiteMap()

      mkdirSync(dirname(filePath), {recursive: true})
      writeFileSync(filePath, sitemap)
      // @ts-ignore
      console.log(`🌐️ Sitemap created (${generator.urlCount} URLs${generator.urlCount === 0 ? "... did you forget your config?" : ""})`)
      if (options.verbose) {
        console.log("-----------------------")
        console.log(sitemap)
        console.log("-----------------------")
      }
    })
  }
})
