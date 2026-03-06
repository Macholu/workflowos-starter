import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export interface FileSearchMatch {
  path: string;
  line: number;
  column: number;
  text: string;
}

function fallbackScan(query: string, cwd: string, maxResults: number): FileSearchMatch[] {
  const matches: FileSearchMatch[] = [];
  const skipDirs = new Set(['.git', 'node_modules', 'dist', 'coverage']);
  const pattern = query.toLowerCase();

  function walk(currentPath: string): void {
    if (matches.length >= maxResults) {
      return;
    }

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (matches.length >= maxResults) {
        return;
      }

      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) {
          walk(fullPath);
        }
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      let content = '';
      try {
        content = fs.readFileSync(fullPath, 'utf8');
      } catch {
        continue;
      }

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i] ?? '';
        const idx = line.toLowerCase().indexOf(pattern);
        if (idx >= 0) {
          matches.push({
            path: path.relative(cwd, fullPath),
            line: i + 1,
            column: idx + 1,
            text: line.trim()
          });
          if (matches.length >= maxResults) {
            return;
          }
        }
      }
    }
  }

  walk(cwd);
  return matches;
}

export async function fileSearch(
  query: string,
  cwd: string,
  maxResults = 25
): Promise<FileSearchMatch[]> {
  const result = spawnSync(
    'rg',
    ['--line-number', '--column', '--no-heading', '--max-count', String(maxResults), query, '.'],
    {
      cwd,
      encoding: 'utf8'
    }
  );

  if (result.error) {
    if ((result.error as NodeJS.ErrnoException).code === 'ENOENT') {
      return fallbackScan(query, cwd, maxResults);
    }
    throw new Error(`fileSearch failed: ${result.error.message}`);
  }

  if (result.status === 1 || !result.stdout.trim()) {
    return [];
  }

  if (result.status !== 0) {
    throw new Error(`fileSearch failed with exit code ${result.status}: ${result.stderr}`);
  }

  return result.stdout
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const firstColon = line.indexOf(':');
      const secondColon = line.indexOf(':', firstColon + 1);
      const thirdColon = line.indexOf(':', secondColon + 1);

      return {
        path: line.slice(0, firstColon),
        line: Number(line.slice(firstColon + 1, secondColon)),
        column: Number(line.slice(secondColon + 1, thirdColon)),
        text: line.slice(thirdColon + 1).trim()
      };
    });
}
