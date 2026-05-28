import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import pkg from "../package.json" with { type: "json" };

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const demoPages = resolve(root, "../hs-uix-demos/src/app/pages");
const vendorDir = resolve(demoPages, "vendor");
const vendorPackageDir = resolve(vendorDir, "hs-uix");
const tarballName = `hs-uix-${pkg.version}.tgz`;

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: false });
  if (result.status !== 0) process.exit(result.status || 1);
};

mkdirSync(vendorDir, { recursive: true });
for (const file of readdirSync(vendorDir)) {
  if (/^hs-uix-.*\.tgz$/.test(file)) rmSync(resolve(vendorDir, file), { force: true });
}
rmSync(vendorPackageDir, { recursive: true, force: true });

run("npm", ["run", "build"], root);
run("npm", ["pack", "--pack-destination", vendorDir], root);

const tempDir = resolve(vendorDir, ".tmp-pack");
rmSync(tempDir, { recursive: true, force: true });
mkdirSync(tempDir, { recursive: true });
run("tar", ["-xzf", resolve(vendorDir, tarballName), "-C", tempDir], root);
cpSync(resolve(tempDir, "package"), vendorPackageDir, { recursive: true });
const vendorPackageJsonPath = resolve(vendorPackageDir, "package.json");
const vendorPackageJson = JSON.parse(readFileSync(vendorPackageJsonPath, "utf8"));
delete vendorPackageJson.devDependencies;
delete vendorPackageJson.scripts;
delete vendorPackageJson.workspaces;
writeFileSync(vendorPackageJsonPath, `${JSON.stringify(vendorPackageJson, null, 2)}\n`);
rmSync(tempDir, { recursive: true, force: true });
rmSync(resolve(vendorDir, tarballName), { force: true });

run("npm", ["install", "./vendor/hs-uix"], demoPages);

console.log(`\nPacked hs-uix into demos: ${vendorPackageDir}`);
console.log("Run `cd ../hs-uix-demos && hs project install-deps` before HubSpot builds if needed.");
