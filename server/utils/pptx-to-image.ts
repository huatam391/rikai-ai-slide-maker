import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

interface ConvertOptions {
  pptxPath: string;
  outputDir: string;
  format?: 'png' | 'jpg';
  resolution?: number; // DPI
}

interface ConvertResult {
  success: boolean;
  images: string[];
  error?: string;
}

/**
 * Convert PPTX to images using LibreOffice + pdftoppm
 * Strategy: PPTX → PDF → PNG images (one per slide)
 */
export async function convertPPTXToImages(options: ConvertOptions): Promise<ConvertResult> {
  const {
    pptxPath,
    outputDir,
    format = 'png',
    resolution = 150 // Default 150 DPI for good quality
  } = options;

  let pdfPath: string | null = null;

  try {
    // Validate input file
    if (!existsSync(pptxPath)) {
      throw new Error(`PPTX file not found: ${pptxPath}`);
    }

    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Get LibreOffice path from environment or use default
    const libreOfficePath = process.env.LIBRE_OFFICE_PATH || 'libreoffice';
    const baseFileName = pptxPath.split('/').pop()?.replace('.pptx', '') || 'slides';

    // Step 1: Convert PPTX to PDF using LibreOffice
    console.log('Step 1: Converting PPTX to PDF...');
    const pdfCommand = `${libreOfficePath} --headless --convert-to pdf --outdir "${outputDir}" "${pptxPath}"`;
    console.log('Executing:', pdfCommand);

    const { stdout: pdfStdout, stderr: pdfStderr } = await execAsync(pdfCommand, {
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024
    });

    if (pdfStderr && !pdfStderr.includes('Warning')) {
      console.warn('LibreOffice PDF stderr:', pdfStderr);
    }
    console.log('LibreOffice PDF stdout:', pdfStdout);

    // Find the generated PDF
    pdfPath = join(outputDir, `${baseFileName}.pdf`);
    if (!existsSync(pdfPath)) {
      throw new Error('PDF conversion failed - output file not found');
    }

    console.log('PDF generated at:', pdfPath);

    // Step 2: Convert PDF to PNG images using pdftoppm
    console.log('Step 2: Converting PDF to PNG images...');
    const imagePrefix = join(outputDir, baseFileName);

    // pdftoppm command: -png for PNG output, -r for resolution
    const pngCommand = `pdftoppm -png -r ${resolution} "${pdfPath}" "${imagePrefix}"`;
    console.log('Executing:', pngCommand);

    const { stdout: pngStdout, stderr: pngStderr } = await execAsync(pngCommand, {
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024
    });

    if (pngStderr) {
      console.warn('pdftoppm stderr:', pngStderr);
    }
    if (pngStdout) {
      console.log('pdftoppm stdout:', pngStdout);
    }

    // Step 3: Collect generated PNG files
    const files = readdirSync(outputDir);

    // pdftoppm generates files like: prefix-1.png, prefix-2.png, etc.
    const imageFiles = files
      .filter(file => file.endsWith('.png') && file.startsWith(baseFileName))
      .sort((a, b) => {
        // Extract page numbers for proper sorting
        const getPageNum = (filename: string) => {
          const match = filename.match(/-(\d+)\.png$/);
          return match ? parseInt(match[1]) : 0;
        };
        return getPageNum(a) - getPageNum(b);
      })
      .map(file => join(outputDir, file));

    if (imageFiles.length === 0) {
      throw new Error('No PNG images were generated from PDF');
    }

    console.log(`Successfully converted PPTX to ${imageFiles.length} PNG images`);

    // Clean up: delete the temporary PDF file
    if (pdfPath && existsSync(pdfPath)) {
      try {
        unlinkSync(pdfPath);
        console.log('Cleaned up temporary PDF file');
      } catch (err) {
        console.warn('Failed to delete temporary PDF:', err);
      }
    }

    return {
      success: true,
      images: imageFiles
    };
  } catch (error: any) {
    console.error('Error converting PPTX to images:', error);

    // Clean up PDF on error
    if (pdfPath && existsSync(pdfPath)) {
      try {
        unlinkSync(pdfPath);
      } catch (err) {
        // Ignore cleanup errors
      }
    }

    return {
      success: false,
      images: [],
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Get image URLs for preview
 */
export function getImageUrls(imagePaths: string[], baseUrl: string = ''): string[] {
  return imagePaths.map(path => {
    // Convert absolute path to relative URL
    const filename = path.split('/').pop() || '';
    return `${baseUrl}/api/pptx/preview-image/${filename}`;
  });
}