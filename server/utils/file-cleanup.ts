import { unlink, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Delete a single file if it exists
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
  }
}

/**
 * Delete a directory and all its contents
 */
export async function deleteDirectory(dirPath: string): Promise<void> {
  try {
    if (existsSync(dirPath)) {
      await rm(dirPath, { recursive: true, force: true });
      console.log(`Deleted directory: ${dirPath}`);
    }
  } catch (error) {
    console.error(`Failed to delete directory ${dirPath}:`, error);
  }
}

/**
 * Delete temporary PPTX file after conversion
 */
export async function deleteTemporaryPPTX(
  jobId: string,
  slideKey: string
): Promise<void> {
  const pptxPath = join(
    process.cwd(),
    'output',
    'single-slides',
    jobId,
    `slide-${slideKey}.pptx`
  );

  await deleteFile(pptxPath);
}

/**
 * Clean up all temporary files for a job
 */
export async function cleanupJobTemporaryFiles(jobId: string): Promise<void> {
  const singleSlidesDir = join(process.cwd(), 'output', 'single-slides', jobId);
  await deleteDirectory(singleSlidesDir);
}