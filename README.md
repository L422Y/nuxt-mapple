# Nuxt: Mapple - A Sitemap Generator

![npm](https://img.shields.io/npm/dt/nuxt-mapple)

This module will build and put a sitemap at `/sitemap.xml` using a combination of optional static, dynamic, and
generated routes. All pages without parameters in their paths will be inserted automatically (i.e. `pages/blog.vue`),
and when `useContent` is enabled, the `content` folder is scanned for `.md` files, and added to the sitemap.

# Installation

`yarn add nuxt-mapple`

Add the module to your `nuxt.config.ts`:
`modules: ['nuxt-mapple'],`

# Usage

### Exclude content with a Regular Expression

You can exclude paths (as well as separately/specifically content paths) from the sitemap by using a Regular Expression (with leading and trailing slashes):

```ts
defineNuxtConfig({
  mapple: {
    excludeAny: "(/early-signup|/u/*)",
    excludeContent: "^/(references/).*",
  }
})
```

### Static Paths

You can list static paths manually in your `nuxt.config.ts`, in an array of relative paths:

```js
defineNuxtConfig({
  mapple: {
    basePath: 'https://l422y.com',
    static: [
      '/projects/mtv/the-buried-life-storefront',
      '/projects/travelers/umbrella-hall',
      '/projects/mayo-clinic/mayo-clinic-memory-game',
      '/projects/f4w/tactica',
    ]
  }
})
```

### Content Directory

or enable scanning of your `content` folder for `.md` files by enabling `useContent` and, optionally, including a filter
for paths to exclude (example below will exclude `/references/*`):

```js
defineNuxtConfig({
  mapple: {
    basePath: 'https://l422y.com',
    useContent: true,
    excludeContent: "^/(references/).*", // Regular Expression (with leading and trailing slashes)
  }
})
```

### Build using templates and datasets

... or you can build based on route templates and datasets, using multi-dimensional arrays, i.e. a route template
of `/@/@` and a dataset like the following:

```js
[
  ['blog', ['post-a', 'post-b', 'post-c']],
  ['projects', ['project-1', 'project-2', 'project-3']]
]
```

Our configuration would look something like this:

```js
defineNuxtConfig({
  modules: ['nuxt-mapple'],
  mapple: {
    basePath: 'https://l422y.com',
    staticRoutes: ['/'],
    dynamicRoutes: [
      {
        route: '/@/@',
        data: [
          ['blog', ['post-a', 'post-b', 'post-c']],
          ['projects', ['project-1', 'project-2', 'project-3']]
        ]
      }
    ]
  }
})
```

Our `sitemap.xml` will look like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://l422y.com/blog/post-a</loc>
  </url>
  <url>
    <loc>https://l422y.com/blog/post-b</loc>
  </url>
  <url>
    <loc>https://l422y.com/blog/post-c</loc>
  </url>
  <url>
    <loc>https://l422y.com/projects/project-1</loc>
  </url>
  <url>
    <loc>https://l422y.com/projects/project-2</loc>
  </url>
  <url>
    <loc>https://l422y.com/projects/project-3</loc>
  </url>
  <url>
    <loc>https://l422y.com/</loc>
  </url>
</urlset>
```

##

Here's a full configuration example:

```js
defineNuxtConfig({
  mapple: {
    basePath: 'https://l422y.com',
    dynamic: [
      {
        // single depth route template
        route: '/projects/@',
        // single depth dataset
        data: [
          'personal/musicmonitor',
          'disney/photo-video-kiosk',
        ]
      },
      {
        // double depth route template
        route: '/projects/@/@',
        // double depth dataset
        data: [
          ['personal',
            [
              'whatcd-releases-tracker',
              'music-shop-aggregator'
            ]
          ],
          ['monstermedia',
            [
              'flash-analytics',
              'monitoring-control-system',
              'hbo-unwrap',
            ]
          ],
        ]
      },
      {
        // single depth route template
        route: '/blog/@',
        // single depth dataset
        data: [
          'nuxt-adventures-1',
          'nuxt-adventures-2',
          'nuxt3-dynamic-social-images',
          'web3-endpoint-cycler',
          'wordpress-paywall',
        ]
      },
      {
        // single depth route template
        route: '/@',
        // single depth dataset
        data: [
          'projects',
          'experience',
          'skills',
          'references',
          'blog',
          'about'
        ]
      }
    ]

  }
})
```

## Development

- Run `npm run dev:prepare` to generate type stubs.

## Credits

Made with 💚 by [Larry Williamson](https://l422y.com) / [@l422y](https://twitter.com/l422y)

Originally ideated from @benoitdemaegdt's [nuxt3-sitemap](https://github.com/benoitdemaegdt/nuxt3-sitemap)
