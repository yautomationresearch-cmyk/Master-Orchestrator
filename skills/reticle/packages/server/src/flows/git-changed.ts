import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

/** Parse `git diff --name-only` output into a clean file list. Pure; exported for testing. */
export function parseGitFiles(output: string): string[] {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Files changed since a git ref (`git diff --name-only <ref>`), so `reticle gate --since main` works from
 * the real diff instead of hand-listed files. Returns [] on any git failure (not a repo, bad ref) rather
 * than throwing — the caller degrades to "no changes" and the gate simply passes, never crashes CI.
 */
export async function changedFilesSince(ref: string, cwd: string): Promise<string[]> {
  try {
    const { stdout } = await run('git', ['diff', '--name-only', ref], { cwd });
    return parseGitFiles(stdout);
  } catch {
    return [];
  }
}
