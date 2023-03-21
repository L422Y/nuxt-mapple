export default defineNuxtConfig({
  modules: ['../src/module'],
  ssr: true,
  mapple: {
    // use nuxt content?
    useContent: true,
    // exclude content matching this RegEx
    excludeContent: ".*(test.*|some.*)",
    verbose: true,
    basePath: "https://l422y.com",
    staticRoutes: [
      "/some-other-route"
    ]
  }
})
