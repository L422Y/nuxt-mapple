export interface MappleDynamicRoute {
  route: string;
  data: undefined | string[] | MappleDynamicRoute[];
}

export class SiteMapGenerator {
  // @ts-ignore
  #urls: string[] = []
  // @ts-ignore
  #basePath = ''

  getSiteMap () {
    return this.getXML()
  }

  constructor (input: MappleDynamicRoute[], basePath = '') {
    this.#basePath = basePath
    for (const r of input) {
      const genURLs: string[] = this.#generateUrls(
        r.route as string,
        r.data
      )
      this.#urls.push(...genURLs)
    }
  }

  // @ts-ignore
  #generateUrls (route: string, data: string[] | MappleDynamicRoute[] | undefined): string[] {
    const urls = [] as string[]
    if (data) {
      for (const o of data) {
        if (Array.isArray(o) && o.length > 1 && Array.isArray(o[1])) {
          urls.push(...this.#generateUrls(route.replace('@', o[0]), o[1]))
        } else if (typeof o === 'string') {
          urls.push(route.replace('@', o))
        }
      }
    }
    return urls
  }

  pushPaths (paths: string[]) {
    for (const path of paths) {
      this.#urls.push(`${path}`)
    }
  }

  // @ts-ignore
  get urlCount () {
    return this.#urls.length
  }

  // @ts-ignore
  getXML (): string {
    // @ts-ignore
    this.#urls = [...new Set(this.#urls)]
    const items = `\t<url><loc>${this.#basePath}` +
      this.#urls.join(`</loc></url>\n\t<url><loc>${this.#basePath}`) +
      '</loc></url>'

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += `${items}\n`
    xml += '</urlset>'
    return xml
  }
}
