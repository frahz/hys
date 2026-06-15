import { buildIndex } from "./manifest.mjs"

const templateFile = process.env.TEMPLATE_FILE ?? "index.template.json"
const outputFile = process.env.INDEX_FILE ?? "index.json"
const baseUrl = process.env.BASE_URL ?? "https://hys.pages.dev"

await buildIndex({ templateFile, outputFile, baseUrl })
