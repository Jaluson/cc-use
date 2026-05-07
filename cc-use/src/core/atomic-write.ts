import { readFile, writeFile, rename, unlink, copyFile, open, chmod } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { platform } from 'node:os';

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

    // fsync to ensure data is on disk before rename
    const fd = await open(tmpPath, 'r+');
    await fd.sync();
    await fd.close();

    // Windows: rename fails if target exists, must unlink first
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
    await rename(tmpPath, filePath);

    // Set restrictive permissions on Unix
    if (platform() !== 'win32') {
      await chmod(filePath, 0o600);
    }

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
    if (platform() !== 'win32') {
      await chmod(filePath, 0o600);
    }
    await unlink(backupPath);
  }
}

export async function cleanupBackup(backupPath: string): Promise<void> {
  if (existsSync(backupPath)) {
    await unlink(backupPath);
  }
}
