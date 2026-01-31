const { createServer } = require("http")
const { WebSocketServer } = require("ws")
const { readFile, copyFile, mkdir } = require("fs/promises")
const { readFileSync, writeFileSync, rmSync } = require("fs")
const { resolve, join, extname } = require("path")
const esbuild = require("esbuild")

const root = resolve(__dirname, "..")
const buildDir = join(root, "build")
const PORT = 3000
const WS_PORT = 3001

const reloadSnippet = `<script>(() => {
  const ws = new WebSocket("ws://localhost:${WS_PORT}")
  ws.onmessage = () => location.reload()
  ws.onclose = () => setTimeout(() => location.reload(), 1000)
})()</script>`

// --- websocket reload server ---
const wss = new WebSocketServer({ port: WS_PORT })

function notifyClients() {
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send("reload")
  }
}

// --- copy html with reload snippet injected ---
function copyHtmlDev() {
  const html = readFileSync(join(root, "public", "index.html"), "utf8")
  const injected = html.replace("</body>", `  ${reloadSnippet}\n</body>`)
  writeFileSync(join(buildDir, "index.html"), injected)
}

// --- static file server ---
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
}

const server = createServer(async (req, res) => {
  const filePath = join(buildDir, req.url === "/" ? "index.html" : req.url)
  try {
    const data = await readFile(filePath)
    res.writeHead(200, {
      "Content-Type": mime[extname(filePath)] || "application/octet-stream",
    })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end("not found")
  }
})

// --- start ---
async function start() {
  // clean + dirs
  rmSync(buildDir, { recursive: true, force: true })
  await mkdir(join(buildDir, "assets"), { recursive: true })

  // copy html (with reload snippet)
  copyHtmlDev()

  // esbuild context with watch
  const ctx = await esbuild.context({
    entryPoints: [join(root, "src/main.js")],
    bundle: true,
    outfile: join(buildDir, "assets/bundle.js"),
    plugins: [
      {
        name: "reload",
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length === 0) {
              copyHtmlDev()
              notifyClients()
              console.log(`[reload] ${new Date().toLocaleTimeString()}`)
            }
          })
        },
      },
    ],
  })

  await ctx.watch()

  server.listen(PORT, () => {
    console.log(`dev server  -> http://localhost:${PORT}`)
    console.log(`ws reload   -> ws://localhost:${WS_PORT}`)
  })

  process.on("SIGINT", async () => {
    await ctx.dispose()
    wss.close()
    server.close()
    process.exit()
  })
}

start()
