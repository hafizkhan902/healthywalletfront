// Migration utility functions for managing localStorage to backend migration

/**
 * Clear migration flags from sessionStorage
 * Useful for resetting migration state during development or troubleshooting
 */
export const clearMigrationFlags = () => {
  sessionStorage.removeItem('healthywallet-migration-attempted');
  sessionStorage.removeItem('healthywallet-migration-failed');
  sessionStorage.removeItem('healthywallet-migration-successful');
  // console.log('🧹 Migration flags cleared from sessionStorage');
};

/**
 * Get migration status from sessionStorage
 * @returns {Object} Migration status object
 */
export const getMigrationStatus = () => {
  return {
    attempted: !!sessionStorage.getItem('healthywallet-migration-attempted'),
    failed: !!sessionStorage.getItem('healthywallet-migration-failed'),
    successful: !!sessionStorage.getItem('healthywallet-migration-successful')
  };
};

/**
 * Force reset migration state
 * Use this in development console if migration gets stuck
 */
export const resetMigrationState = () => {
  clearMigrationFlags();
  // console.log('🔄 Migration state reset. Page refresh recommended.');
};

// Make functions available in development console
if (process.env.NODE_ENV === 'development') {
  window.clearMigrationFlags = clearMigrationFlags;
  window.getMigrationStatus = getMigrationStatus;
  window.resetMigrationState = resetMigrationState;
}
