import { cp, rm, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const standalonePublicDir = path.join(standaloneDir, 'public');
const standaloneStaticDir = path.join(standaloneDir, '.next', 'static');
const sourcePublicDir = path.join(rootDir, 'public');
const sourceStaticDir = path.join(rootDir, '.next', 'static');

await ensureExists(standaloneDir, 'Next standalone output');
await copyDir(sourcePublicDir, standalonePublicDir);
await copyDir(sourceStaticDir, standaloneStaticDir);

async function ensureExists(targetPath, label) {
  try {
    await access(targetPath);
  } catch {
    throw new Error(`${label} not found at ${targetPath}. Run \`npm run build\` first.`);
  }
}

async function copyDir(source, target) {
  try {
    await access(source);
  } catch {
    return;
  }

  await rm(target, { recursive: true, force: true });
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
}
