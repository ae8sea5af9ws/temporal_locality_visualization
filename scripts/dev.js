const { execSync, spawn } = require("fs").existsSync
  ? require("child_process")
  : {};
const { createServer } = require("http");
const { readFile } = require("fs/promises");
const { resolve, join, extname } = require("path");
const { spawn: _spawn } = require("child_process");

const root = resolve(__dirname, "..");
const buildDir = join(root, "build");
const PORT = 3000;

// initial build
require("./build.js");

// esbuild watch
const watcher = _spawn(
  "npx",
  ["esbuild", "src/main.js", "--bundle", "--outfile=build/assets/bundle.js", "--watch"],
  { cwd: root, stdio: "inherit" }
);

// tiny static server
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
};

const server = createServer(async (req, res) => {
  let filePath = join(buildDir, req.url === "/" ? "index.html" : req.url);
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": mime[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

server.listen(PORT, () => {
  console.log(`dev server -> http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  watcher.kill();
  server.close();
  process.exit();
});
