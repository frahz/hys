import { spawn } from "node:child_process"
import { watch } from "node:fs"
import { buildIndex } from "./manifest.mjs"
import "./build-dist.mjs"

const rebuildIndex = () => {
  buildIndex({
    outputFile: "dist/index.json",
    baseUrl: process.env.BASE_URL ?? "http://localhost:8080",
    updatePath: "index.json",
  }).catch((error) => {
    console.error(error)
  })
}

watch("index.template.json", rebuildIndex)
watch("ext", { recursive: true }, (_eventType, filename) => {
  if (filename?.endsWith(".js")) {
    spawn(process.execPath, ["scripts/build-dist.mjs"], {
      env: { ...process.env, BASE_URL: process.env.BASE_URL ?? "http://localhost:8080" },
      stdio: "inherit",
    })
  }
})

const vite = spawn("vite", ["--host", "127.0.0.1", "--port", "8080", "--config", "vite.config.mjs", "dist"], {
  stdio: "inherit",
})

const shutdown = (signal) => {
  vite.kill(signal)
  process.exit(0)
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
