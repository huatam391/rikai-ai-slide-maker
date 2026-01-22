import Database from 'better-sqlite3';
import { join } from 'path';
import type { Job, SlideStructure, PPTXConfig } from '~/types';

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    const config = useRuntimeConfig();

    // Use environment variable for database path, or default to current directory
    const dbPath = config.dbPath || join(process.cwd(), 'jobs.db');

    console.log(`Initializing database at: ${dbPath}`);

    db = new Database(dbPath);

    // Initialize jobs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        job_id TEXT PRIMARY KEY,
        file_path TEXT,
        structure_json TEXT,
        content_json TEXT,
        structure_model TEXT,
        structure_input_tokens INTEGER DEFAULT 0,
        structure_output_tokens INTEGER DEFAULT 0,
        structure_cost REAL DEFAULT 0,
        total_cost REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Initialize slides table - NEW
    db.exec(`
      CREATE TABLE IF NOT EXISTS slides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT NOT NULL,
        slide_index INTEGER NOT NULL,
        slide_title TEXT NOT NULL,
        slide_description TEXT,
        content_json TEXT,
        image_url TEXT,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        model TEXT,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        cost REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
        UNIQUE(job_id, slide_index)
      )
    `);

    // Create index for faster queries
    try {
      db.exec(`CREATE INDEX IF NOT EXISTS idx_slides_job_id ON slides(job_id)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_slides_status ON slides(status)`);
    } catch (e) {
      // Index already exists
    }

    // Add new columns to jobs table if they don't exist (for existing databases)
    try {
      db.exec(`ALTER TABLE jobs ADD COLUMN structure_json TEXT`);
    } catch (e) {
      // Column already exists
    }

    try {
      db.exec(`ALTER TABLE jobs ADD COLUMN content_json TEXT`);
    } catch (e) {
      // Column already exists
    }

    try {
      db.exec(`ALTER TABLE jobs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    } catch (e) {
      // Column already exists
    }

    // Add model and cost tracking columns to jobs table if they don't exist
    try {
      db.exec(`ALTER TABLE jobs ADD COLUMN structure_model TEXT`);
    } catch (e) {
      // Column already exists
    }

    try {
      db.exec(`ALTER TABLE jobs ADD COLUMN structure_input_tokens INTEGER DEFAULT 0`);
    } catch (e) {
      // Column already exists
    }

    try {
      db.exec(`ALTER TABLE jobs ADD COLUMN structure_output_tokens INTEGER DEFAULT 0`);
    } catch (e) {
      // Column already exists
    }

    try {
      db.exec(`ALTER TABLE jobs ADD COLUMN structure_cost REAL DEFAULT 0`);
    } catch (e) {
      // Column already exists
    }

    try {
      db.exec(`ALTER TABLE jobs ADD COLUMN total_cost REAL DEFAULT 0`);
    } catch (e) {
      // Column already exists
    }

    // Add model and cost tracking columns to slides table if they don't exist
    try {
      db.exec(`ALTER TABLE slides ADD COLUMN model TEXT`);
    } catch (e) {
      // Column already exists
    }

    try {
      db.exec(`ALTER TABLE slides ADD COLUMN input_tokens INTEGER DEFAULT 0`);
    } catch (e) {
      // Column already exists
    }

    try {
      db.exec(`ALTER TABLE slides ADD COLUMN output_tokens INTEGER DEFAULT 0`);
    } catch (e) {
      // Column already exists
    }

    try {
      db.exec(`ALTER TABLE slides ADD COLUMN cost REAL DEFAULT 0`);
    } catch (e) {
      // Column already exists
    }
  }

  return db;
}

export function getAllJobs(): Job[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT job_id, file_path, created_at FROM jobs ORDER BY created_at DESC');
  return stmt.all() as Job[];
}

export function getJobById(jobId: string): Job | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM jobs WHERE job_id = ?');
  return stmt.get(jobId) as Job | undefined;
}

export function createJob(jobId: string, structureJson: string, filePath?: string): void {
  const db = getDatabase();
  const stmt = db.prepare('INSERT INTO jobs (job_id, structure_json, file_path) VALUES (?, ?, ?)');
  stmt.run(jobId, structureJson, filePath || null);
}

export function getJobStructure(jobId: string): SlideStructure[] | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT structure_json FROM jobs WHERE job_id = ?');
  const result = stmt.get(jobId) as { structure_json: string } | undefined;

  if (!result || !result.structure_json) {
    return null;
  }

  return JSON.parse(result.structure_json) as SlideStructure[];
}

export function getJobContent(jobId: string): PPTXConfig | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT content_json FROM jobs WHERE job_id = ?');
  const result = stmt.get(jobId) as { content_json: string } | undefined;

  if (!result || !result.content_json) {
    return null;
  }

  return JSON.parse(result.content_json) as PPTXConfig;
}

export function updateJobContent(jobId: string, contentJson: string): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE jobs SET content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?');
  stmt.run(contentJson, jobId);
}

export function updateJobStructure(jobId: string, structureJson: string): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE jobs SET structure_json = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?');
  stmt.run(structureJson, jobId);
}

// ==================== SLIDES TABLE FUNCTIONS ====================

export interface Slide {
  id: number;
  job_id: string;
  slide_index: number;
  slide_title: string;
  slide_description?: string;
  content_json?: string;
  image_url?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  error_message?: string;
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
  cost?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new slide record
 */
export function createSlide(
  jobId: string,
  slideIndex: number,
  slideTitle: string,
  slideDescription?: string
): Slide {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO slides (job_id, slide_index, slide_title, slide_description)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(jobId, slideIndex, slideTitle, slideDescription || null);

  return getSlideById(result.lastInsertRowid as number)!;
}

/**
 * Get slide by ID
 */
export function getSlideById(slideId: number): Slide | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM slides WHERE id = ?');
  return stmt.get(slideId) as Slide | undefined;
}

/**
 * Get slide by job_id and slide_index
 */
export function getSlideByIndex(jobId: string, slideIndex: number): Slide | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM slides WHERE job_id = ? AND slide_index = ?');
  return stmt.get(jobId, slideIndex) as Slide | undefined;
}

/**
 * Get all slides for a job
 */
export function getSlidesByJobId(jobId: string): Slide[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM slides WHERE job_id = ? ORDER BY slide_index ASC');
  return stmt.all(jobId) as Slide[];
}

/**
 * Update slide content
 */
export function updateSlideContent(
  jobId: string,
  slideIndex: number,
  contentJson: string
): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE slides
    SET content_json = ?, updated_at = CURRENT_TIMESTAMP
    WHERE job_id = ? AND slide_index = ?
  `);
  stmt.run(contentJson, jobId, slideIndex);
}

/**
 * Update slide status
 */
export function updateSlideStatus(
  jobId: string,
  slideIndex: number,
  status: 'pending' | 'generating' | 'completed' | 'error',
  errorMessage?: string
): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE slides
    SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP
    WHERE job_id = ? AND slide_index = ?
  `);
  stmt.run(status, errorMessage || null, jobId, slideIndex);
}

/**
 * Update slide image URL
 */
export function updateSlideImageUrl(
  jobId: string,
  slideIndex: number,
  imageUrl: string
): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE slides
    SET image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE job_id = ? AND slide_index = ?
  `);
  stmt.run(imageUrl, jobId, slideIndex);
}

/**
 * Update slide structure (title, description)
 */
export function updateSlideStructure(
  jobId: string,
  slideIndex: number,
  slideTitle?: string,
  slideDescription?: string
): void {
  const db = getDatabase();

  if (slideTitle !== undefined && slideDescription !== undefined) {
    const stmt = db.prepare(`
      UPDATE slides
      SET slide_title = ?, slide_description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE job_id = ? AND slide_index = ?
    `);
    stmt.run(slideTitle, slideDescription, jobId, slideIndex);
  } else if (slideTitle !== undefined) {
    const stmt = db.prepare(`
      UPDATE slides
      SET slide_title = ?, updated_at = CURRENT_TIMESTAMP
      WHERE job_id = ? AND slide_index = ?
    `);
    stmt.run(slideTitle, jobId, slideIndex);
  } else if (slideDescription !== undefined) {
    const stmt = db.prepare(`
      UPDATE slides
      SET slide_description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE job_id = ? AND slide_index = ?
    `);
    stmt.run(slideDescription, jobId, slideIndex);
  }
}

/**
 * Delete slide
 */
export function deleteSlide(jobId: string, slideIndex: number): void {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM slides WHERE job_id = ? AND slide_index = ?');
  stmt.run(jobId, slideIndex);
}

/**
 * Bulk create slides from structure
 */
export function bulkCreateSlides(jobId: string, slides: SlideStructure[]): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO slides (job_id, slide_index, slide_title, slide_description, status)
    VALUES (?, ?, ?, ?, 'pending')
  `);

  const transaction = db.transaction((slidesToInsert: SlideStructure[]) => {
    for (const slide of slidesToInsert) {
      stmt.run(
        jobId,
        slide.slide_index,
        slide.slide_title,
        slide.slide_description || null
      );
    }
  });

  transaction(slides);
}

/**
 * Get slides count by status
 */
export function getSlideStatusCount(jobId: string): Record<string, number> {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM slides
    WHERE job_id = ?
    GROUP BY status
  `);

  const results = stmt.all(jobId) as Array<{ status: string; count: number }>;

  const counts: Record<string, number> = {
    pending: 0,
    generating: 0,
    completed: 0,
    error: 0
  };

  results.forEach(row => {
    counts[row.status] = row.count;
  });

  return counts;
}

// ==================== COST TRACKING FUNCTIONS ====================

/**
 * Update structure generation cost for a job
 */
export function updateJobStructureCost(
  jobId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cost: number
): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE jobs
    SET structure_model = ?,
        structure_input_tokens = ?,
        structure_output_tokens = ?,
        structure_cost = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE job_id = ?
  `);
  stmt.run(model, inputTokens, outputTokens, cost, jobId);
}

/**
 * Update slide generation cost
 */
export function updateSlideCost(
  jobId: string,
  slideIndex: number,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cost: number
): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE slides
    SET model = ?,
        input_tokens = ?,
        output_tokens = ?,
        cost = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE job_id = ? AND slide_index = ?
  `);
  stmt.run(model, inputTokens, outputTokens, cost, jobId, slideIndex);
}

/**
 * Calculate and update total job cost
 */
export function updateTotalJobCost(jobId: string): void {
  const db = getDatabase();

  // Get structure cost
  const jobStmt = db.prepare('SELECT structure_cost FROM jobs WHERE job_id = ?');
  const job = jobStmt.get(jobId) as { structure_cost: number } | undefined;
  const structureCost = job?.structure_cost || 0;

  // Get sum of all slides costs
  const slidesStmt = db.prepare('SELECT SUM(cost) as total FROM slides WHERE job_id = ?');
  const slides = slidesStmt.get(jobId) as { total: number | null } | undefined;
  const slidesCost = slides?.total || 0;

  // Update total cost
  const totalCost = structureCost + slidesCost;
  const updateStmt = db.prepare(`
    UPDATE jobs
    SET total_cost = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE job_id = ?
  `);
  updateStmt.run(totalCost, jobId);
}

/**
 * Get cost summary for a job
 */
export function getJobCostSummary(jobId: string): {
  structureCost: number;
  slidesCost: number;
  totalCost: number;
  structureModel?: string;
  structureInputTokens: number;
  structureOutputTokens: number;
  slides: Array<{
    slideIndex: number;
    model?: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }>;
} | null {
  const db = getDatabase();

  // Get job structure cost
  const jobStmt = db.prepare(`
    SELECT structure_model, structure_input_tokens, structure_output_tokens, structure_cost, total_cost
    FROM jobs
    WHERE job_id = ?
  `);
  const job = jobStmt.get(jobId) as {
    structure_model?: string;
    structure_input_tokens: number;
    structure_output_tokens: number;
    structure_cost: number;
    total_cost: number;
  } | undefined;

  if (!job) {
    return null;
  }

  // Get all slides costs
  const slidesStmt = db.prepare(`
    SELECT slide_index, model, input_tokens, output_tokens, cost
    FROM slides
    WHERE job_id = ?
    ORDER BY slide_index ASC
  `);
  const slides = slidesStmt.all(jobId) as Array<{
    slide_index: number;
    model?: string;
    input_tokens: number;
    output_tokens: number;
    cost: number;
  }>;

  const slidesCost = slides.reduce((sum, slide) => sum + (slide.cost || 0), 0);

  return {
    structureCost: job.structure_cost || 0,
    slidesCost,
    totalCost: job.total_cost || 0,
    structureModel: job.structure_model,
    structureInputTokens: job.structure_input_tokens || 0,
    structureOutputTokens: job.structure_output_tokens || 0,
    slides: slides.map(s => ({
      slideIndex: s.slide_index,
      model: s.model,
      inputTokens: s.input_tokens || 0,
      outputTokens: s.output_tokens || 0,
      cost: s.cost || 0
    }))
  };
}