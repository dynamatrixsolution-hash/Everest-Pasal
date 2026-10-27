// ==============================================================================
// EVEREST PASAL - BACKUP MANIFEST UTILITY
// Generates and verifies cryptographic metadata manifests for database archives
// ==============================================================================

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

export interface BackupManifest {
  backupId: string;
  createdAt: string;
  database: string;
  format: 'postgresql-custom';
  filename: string;
  sizeBytes: number;
  sha256: string;
  status: 'CREATED' | 'VERIFIED' | 'FAILED';
  schemaVersion: string;
  prismaVersion: string;
  applicationVersion: string;
  verifiedAt?: string;
  tablesCount?: number;
}

/**
 * Computes SHA-256 hash of a file.
 */
export async function computeFileSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Derives the manifest file path from a dump file path.
 * e.g. backups/database/file.dump -> backups/database/file.dump.manifest.json
 */
export function getManifestPath(dumpPath: string): string {
  return `${dumpPath}.manifest.json`;
}

/**
 * Writes the manifest JSON file adjacent to the backup archive.
 */
export function writeManifest(dumpPath: string, manifest: BackupManifest): void {
  const manifestPath = getManifestPath(dumpPath);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

/**
 * Reads the manifest file if it exists.
 */
export function readManifest(dumpPath: string): BackupManifest | null {
  const manifestPath = getManifestPath(dumpPath);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    return JSON.parse(raw) as BackupManifest;
  } catch {
    return null;
  }
}

/**
 * Verifies that the manifest exists, matches the actual dump size, and has matching SHA-256.
 */
export async function verifyManifest(dumpPath: string): Promise<{ valid: boolean; reason?: string; manifest?: BackupManifest }> {
  if (!fs.existsSync(dumpPath)) {
    return { valid: false, reason: 'Backup dump file does not exist.' };
  }

  const stats = fs.statSync(dumpPath);
  if (stats.size === 0) {
    return { valid: false, reason: 'Backup dump file has zero bytes.' };
  }

  const manifest = readManifest(dumpPath);
  if (!manifest) {
    return { valid: false, reason: 'Backup manifest file (.manifest.json) not found.' };
  }

  if (manifest.sizeBytes !== stats.size) {
    return {
      valid: false,
      reason: `Size mismatch: manifest records ${manifest.sizeBytes} bytes, actual file has ${stats.size} bytes.`,
      manifest,
    };
  }

  const actualSha256 = await computeFileSha256(dumpPath);
  if (actualSha256 !== manifest.sha256) {
    return {
      valid: false,
      reason: `SHA-256 checksum mismatch: manifest expected ${manifest.sha256}, actual is ${actualSha256}.`,
      manifest,
    };
  }

  return { valid: true, manifest };
}
