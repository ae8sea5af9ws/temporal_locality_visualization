const { rmSync, cpSync } = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const build = path.join(root, "build");

// clean
rmSync(build, { recursive: true, force: true });

// bundle
execSync(
  `npx esbuild src/main.js --bundle --outfile=build/assets/bundle.js --minify`,
  { cwd: root, stdio: "inherit" }
);

// copy html
cpSync(
  path.join(root, "public", "index.html"),
  path.join(build, "index.html")
);

console.log("build complete -> build/");
