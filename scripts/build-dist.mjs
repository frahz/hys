import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { buildIndex } from "./manifest.mjs"

const outDir = process.env.DIST_DIR ?? "dist"
const baseUrl = process.env.BASE_URL ?? "https://hys.pages.dev"

const stripJsdoc = (source) =>
  source
    .replace(/^[ \t]*\/\*\*[\s\S]*?\*\/[ \t]*\n?/gm, "")
    .replace(/\/\*\*[\s\S]*?\*\//g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimStart()

async function copyExtWithoutJsdoc(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true })

  for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      await copyExtWithoutJsdoc(sourcePath, targetPath)
      continue
    }

    const source = await readFile(sourcePath, "utf8")
    const output = entry.name.endsWith(".js") ? stripJsdoc(source) : source
    await writeFile(targetPath, output)
  }
}

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })
await copyExtWithoutJsdoc("ext", path.join(outDir, "ext"))

await buildIndex({
  outputFile: path.join(outDir, "index.json"),
  baseUrl,
  updatePath: "index.json",
})
