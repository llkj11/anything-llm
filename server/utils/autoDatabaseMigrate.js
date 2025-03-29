const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Auto-detects and fixes database schema issues by running Prisma migrations
 * This is run on server startup to prevent "column does not exist" errors
 */
async function autoMigrateDatabaseIfNeeded() {
  try {
    console.log('Checking if database schema needs migration...');
    
    // Path to Prisma executable
    const prismaBin = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma');
    
    // Check if prisma exists
    if (!fs.existsSync(prismaBin)) {
      console.log('Prisma executable not found, skipping auto-migration');
      return;
    }
    
    // Try to run a quick database check query through Prisma
    // We specifically try to access a model or field that might be missing
    try {
      // This will throw an error if schema is out of sync
      const prisma = require('../utils/prisma');
      await prisma.workspaces.findFirst({
        select: {
          id: true,
          name: true,
          ttsProvider: true, // This is a field that might be missing in older schemas
        },
      });
      
      console.log('Database schema is up to date');
      return;
    } catch (error) {
      // If this error message contains something about a column not existing,
      // we need to run a migration
      if (error.message && (
        error.message.includes('does not exist in the current database') || 
        error.message.includes('Invalid `prisma') ||
        error.message.includes('column') ||
        error.message.includes('table')
      )) {
        console.log('Database schema mismatch detected');
        console.log('Running automatic migration...');
        
        // Execute the migration command
        const migrationOutput = execSync(
          `cd "${path.join(__dirname, '..')}" && npx prisma migrate dev --name auto_migration`,
          { encoding: 'utf8' }
        );
        
        console.log('Auto-migration completed successfully');
        console.log(migrationOutput);
        
        return;
      }
      
      // If it's a different error, just log it
      console.log('Error checking database schema, but not a schema mismatch:', error.message);
    }
  } catch (error) {
    console.error('Error in auto database migration:', error);
  }
}

module.exports = { autoMigrateDatabaseIfNeeded }; 