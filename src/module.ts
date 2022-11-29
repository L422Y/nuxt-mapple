import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { NuxtPage } from '@nuxt/schema'
import { SiteMapGenerator, MappleDynamicRoute } from './SiteMapGenerator'

export interface ModuleOptions {
  basePath?: string,
  staticRoutes?: string[],
  verbose?: boolean,
  dynamicRoutes?: any | MappleDynamicRoute[]
}
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mapple',
    version: '0.0.1',
    configKey: 'mapple',
    compatibility: { nuxt: '^3.0.0' }
  },
  defaults: {
    basePath: '',
    dynamicRoutes: [] as MappleDynamicRoute[],
    staticRoutes: [] as string[],
    verbose: false
  } as ModuleOptions,

  setup (options, nuxt) {
    let generator: SiteMapGenerator
    let sitemapRoutes: string[]

    const resolver = createResolver(import.meta.url)
    const filePath = resolver.resolve(
      nuxt.options.srcDir,
      'node_modules/.cache/.sitemap/sitemap.xml'
    )

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({ baseURL: '/', dir: dirname(filePath) })
    const pages = [] as NuxtPage[]

    nuxt.hook('vite:serverCreated', (vite, env) => {
      if (env.isServer) {
        const sitemapRoutesOrig: string[] = pages.map(route => route.path)
        sitemapRoutes = sitemapRoutesOrig.filter(r => !r.includes(':'))
        sitemapRoutes = [...sitemapRoutes, ...options?.staticRoutes].filter(v => !!v)
        const generator = new SiteMapGenerator(options?.dynamicRoutes, options.basePath)
        generator.pushPaths(sitemapRoutes)
        const sitemap = generator.getSiteMap()

        mkdirSync(dirname(filePath), { recursive: true })
        writeFileSync(filePath, sitemap)
        // @ts-ignore
        console.log(`🌐️Sitemap created (${generator.urlCount} URLs${generator.urlCount === 0 ? '... did you forget your config?' : ''})`)
        if (options.verbose) {
          console.log('-----------------------')
          console.log(sitemapRoutes.join('\r\n'))
          console.log('-----------------------')
        }
      }
    })
    nuxt.hook('pages:extend', (pagesExtend) => {
      pages.concat(pagesExtend)
    })
  }
})
