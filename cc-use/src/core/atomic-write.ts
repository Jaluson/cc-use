import { readFile, writeFile, rename, unlink, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export interface AtomicWriteResult {
  success: boolean;
  backupPath?: string;
}

export async function atomicWrite(filePath: string, content: string): Promise<AtomicWriteResult> {
  const backupPath = `${filePath}.backup`;
  const tmpPath = `${filePath}.tmp`;

  if (existsSync(filePath)) {
    await copyFile(filePath, backupPath);
  }

  try {
    await writeFile(tmpPath, content, 'utf-8');
    // Windows: rename fails if target exists, must unlink first
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
    await rename(tmpPath, filePath);
    return { success: true, backupPath: existsSync(backupPath) ? backupPath : undefined };
  } catch (error) {
    if (existsSync(tmpPath)) {
      await unlink(tmpPath).catch(() => {});
    }
    throw error;
  }
}

export async function restoreBackup(filePath: string, backupPath: string): Promise<void> {
  if (existsSync(backupPath)) {
    await copyFile(backupPath, filePath);
    await unlink(backupPath);
  }
}

export async function cleanupBackup(backupPath: string): Promise<void> {
  if (existsSync(backupPath)) {
    await unlink(backupPath);
  }
}
