export interface d {
  route: string;
  data: undefined | string[] | MappleDynamicRoute[];
}

export interface MappleDynamicRoute {
  route: string;
  data: undefined | string[] | MappleDynamicRoute[];
}

export interface SiteMapGeneratorOptions {
  basePath?: string;
  excludeAnyRegExp?: undefined | RegExp;
}

export class SiteMapGenerator {
  urls: string[] = []
  basePath = ""
  excludeAnyRegExp?: undefined | RegExp

  constructor(input: MappleDynamicRoute[], opts: SiteMapGeneratorOptions) {
    this.basePath = opts.basePath || "/"
    this.excludeAnyRegExp = opts.excludeAnyRegExp
    for (const r of input) {
      const genURLs: string[] = this.generateUrls(
        r.route as string,
        r.data
      )
      this.urls.push(...genURLs)
    }
  }

  get urlCount() {
    return this.urls.length
  }

  getSiteMap() {
    return this.getXML()
  }

  pushPaths(paths: string[]) {
    for (const path of paths) {
      this.urls.push(`${path}`)
    }
  }

  getXML(): string {
    // @ts-ignore
    this.urls = [...new Set(this.urls)]
      .filter((v) => this.excludeAnyRegExp?.test(v) !== true)
    const items = `\t<url><loc>${this.basePath}` +
      this.urls.join(`</loc></url>\n\t<url><loc>${this.basePath}`) +
      "</loc></url>"

    let xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
    xml += "<urlset xmlns=\"https://www.sitemaps.org/schemas/sitemap/0.9\">\n"
    xml += `${items}\n`
    xml += "</urlset>"
    return xml
  }

  generateUrls(route: string, data: string[] | MappleDynamicRoute[] | undefined): string[] {
    const urls = [] as string[]
    if (data) {
      for (const o of data) {
        if (Array.isArray(o) && o.length > 1 && Array.isArray(o[1])) {
          urls.push(...this.generateUrls(route.replace("@", o[0]), o[1]))
        } else if (typeof o === "string") {
          urls.push(route.replace("@", o))
        }
      }
    }
    return urls
  }
}
