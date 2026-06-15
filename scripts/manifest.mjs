import { readFile, writeFile } from "node:fs/promises"

export async function buildIndex({
  templateFile = "index.template.json",
  outputFile = "index.json",
  baseUrl = "https://hys.pages.dev",
  updatePath = outputFile,
} = {}) {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "")
  const template = JSON.parse(await readFile(templateFile, "utf8"))

  const index = template.map(({ codePath, ...extension }) => {
    if (!codePath) {
      throw new Error(`Missing codePath for extension ${extension.id ?? extension.name ?? "<unknown>"}`)
    }

    return {
      ...extension,
      update: `${cleanBaseUrl}/${updatePath.replace(/^\/+/, "")}`,
      code: `${cleanBaseUrl}/${codePath.replace(/^\/+/, "")}`,
    }
  })

  await writeFile(outputFile, `${JSON.stringify(index, null, 2)}\n`)
}
