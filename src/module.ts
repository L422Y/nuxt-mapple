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
  basePath?: string,
  staticRoutes?: string[],
  verbose?: boolean,
  dynamicRoutes?: any | MappleDynamicRoute[],
  useContent?: boolean,
  excludeContent?: undefined | RegExp,
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-mapple",
    version: "0.0.1",
    configKey: "mapple",
    compatibility: {nuxt: "^3.0.0"}
  },
  defaults: {
    basePath: "",
    dynamicRoutes: [] as MappleDynamicRoute[],
    staticRoutes: [] as string[],
    verbose: false,
    useContent: false,
    excludeContent: undefined
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
        contentPaths = contentPaths.filter((el) => {
          const match = options.excludeContent?.exec(el)
          return match === null
        })
      }
    }

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({baseURL: "/", dir: dirname(filePath)})

    nuxt.hook("pages:extend", (pagesExtend) => {

      pages = pages.concat(pagesExtend)

      const sitemapRoutesOrig: string[] = pages.map(route => route.path)
      sitemapRoutes = sitemapRoutesOrig.filter(r => !r.includes(":"))
      sitemapRoutes = [...sitemapRoutes, ...options?.staticRoutes || []].filter(v => !!v)
      const generator = new SiteMapGenerator(options?.dynamicRoutes, options.basePath)
      generator.pushPaths(contentPaths)
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
