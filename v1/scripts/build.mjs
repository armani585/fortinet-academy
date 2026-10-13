import { mkdir, copyFile, cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
const destination = path.resolve(root, "dist");
// Only remove this project's generated distribution, never the working directory.
if (path.dirname(destination) !== path.resolve(root)) throw new Error("Invalid build destination");
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const file of ["index.html", "favicon.svg", ".nojekyll"])
  await copyFile(path.join(root, file), path.join(destination, file));
await cp(path.join(root, "src"), path.join(destination, "src"), { recursive: true });
console.log("Site statique prêt dans dist/. Aucun service externe requis.");
