export default defineNuxtConfig({
  modules: ['../src/module'],
  ssr: true,
  mapple: {
    useContent: true,
    verbose: true,

    staticRoutes: [
      "/some-other-route"
    ]
  }
})
