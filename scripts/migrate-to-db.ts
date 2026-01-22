/**
 * Migration script to move structure and content JSON from files to database
 * Run with: npx tsx scripts/migrate-to-db.ts
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';

interface Job {
  job_id: string;
  file_path: string | null;
  created_at: string;
}

function getDatabase() {
  const dbPath = join(process.cwd(), 'jobs.db');
  const db = new Database(dbPath);

  // Ensure new columns exist
  try {
    db.exec(`ALTER TABLE jobs ADD COLUMN structure_json TEXT`);
    console.log('Added structure_json column');
  } catch (e) {
    // Column already exists
  }

  try {
    db.exec(`ALTER TABLE jobs ADD COLUMN content_json TEXT`);
    console.log('Added content_json column');
  } catch (e) {
    // Column already exists
  }

  try {
    db.exec(`ALTER TABLE jobs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('Added updated_at column');
  } catch (e) {
    // Column already exists
  }

  return db;
}

function migrateStructureFiles(db: Database.Database) {
  console.log('\n=== Migrating Structure Files ===');

  const structureDir = join(process.cwd(), 'structure');
  if (!existsSync(structureDir)) {
    console.log('Structure directory does not exist. Skipping structure migration.');
    return 0;
  }

  const files = readdirSync(structureDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} structure files`);

  let migratedCount = 0;
  const updateStmt = db.prepare('UPDATE jobs SET structure_json = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?');

  for (const file of files) {
    const jobId = file.replace('.json', '');
    const filePath = join(structureDir, file);

    try {
      // Check if job exists
      const job = db.prepare('SELECT job_id FROM jobs WHERE job_id = ?').get(jobId) as Job | undefined;

      if (!job) {
        console.log(`- Skipping ${jobId}: Job not found in database`);
        continue;
      }

      // Read structure file
      const structureContent = readFileSync(filePath, 'utf-8');

      // Update database
      updateStmt.run(structureContent, jobId);
      migratedCount++;
      console.log(`✓ Migrated structure for job ${jobId}`);
    } catch (error: any) {
      console.error(`✗ Error migrating ${jobId}:`, error.message);
    }
  }

  return migratedCount;
}

function migrateContentFiles(db: Database.Database) {
  console.log('\n=== Migrating Content Files ===');

  const outputDir = join(process.cwd(), 'output');
  if (!existsSync(outputDir)) {
    console.log('Output directory does not exist. Skipping content migration.');
    return 0;
  }

  const files = readdirSync(outputDir).filter(f => f.endsWith('_content.json'));
  console.log(`Found ${files.length} content files`);

  let migratedCount = 0;
  const updateStmt = db.prepare('UPDATE jobs SET content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?');

  for (const file of files) {
    const jobId = file.replace('_content.json', '');
    const filePath = join(outputDir, file);

    try {
      // Check if job exists
      const job = db.prepare('SELECT job_id FROM jobs WHERE job_id = ?').get(jobId) as Job | undefined;

      if (!job) {
        console.log(`- Skipping ${jobId}: Job not found in database`);
        continue;
      }

      // Read content file
      const contentData = readFileSync(filePath, 'utf-8');

      // Update database
      updateStmt.run(contentData, jobId);
      migratedCount++;
      console.log(`✓ Migrated content for job ${jobId}`);
    } catch (error: any) {
      console.error(`✗ Error migrating ${jobId}:`, error.message);
    }
  }

  return migratedCount;
}

function printMigrationSummary(db: Database.Database) {
  console.log('\n=== Migration Summary ===');

  const totalJobs = db.prepare('SELECT COUNT(*) as count FROM jobs').get() as { count: number };
  const jobsWithStructure = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE structure_json IS NOT NULL').get() as { count: number };
  const jobsWithContent = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE content_json IS NOT NULL').get() as { count: number };

  console.log(`Total jobs: ${totalJobs.count}`);
  console.log(`Jobs with structure in DB: ${jobsWithStructure.count}`);
  console.log(`Jobs with content in DB: ${jobsWithContent.count}`);

  console.log('\n✓ Migration completed!');
  console.log('\nNote: Old JSON files have NOT been deleted. You can delete them manually after verifying the migration:');
  console.log('  - structure/*.json');
  console.log('  - output/*_content.json');
}

// Main migration
async function main() {
  console.log('Starting migration...\n');

  const db = getDatabase();

  try {
    const structureCount = migrateStructureFiles(db);
    const contentCount = migrateContentFiles(db);

    console.log(`\nMigrated ${structureCount} structure files`);
    console.log(`Migrated ${contentCount} content files`);

    printMigrationSummary(db);
  } catch (error: any) {
    console.error('\nMigration failed:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();