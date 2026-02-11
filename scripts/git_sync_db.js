#!/usr/bin/env node

/**
 * FBN XAI - GIT DATABASE SYNC TOOL
 * Version: 1.0
 * Automates: Backup -> Git Add -> Git Commit -> Git Push
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function runCommand(command) {
    try {
        console.log(`\n🏃 Executing: ${command}`);
        const output = execSync(command, { encoding: 'utf8' });
        console.log(output);
        return true;
    } catch (error) {
        console.error(`\n❌ Error executing command: ${command}`);
        console.error(error.stdout || error.message);
        return false;
    }
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   FBN XAI - GIT DATABASE SYNC TOOL                     ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const backupScript = path.join(__dirname, 'backup_vault.js');

    // 1. Run Backup
    console.log('🧱 Step 1: Generating Latest Database Vault...');
    if (!runCommand(`node "${backupScript}"`)) {
        console.error('🛑 Sync aborted due to backup failure.');
        process.exit(1);
    }

    // 2. Git Add
    console.log('🌿 Step 2: Adding changes to Git archive...');
    runCommand('git add backups/latest backend/data');

    // 3. Git Commit
    const timestamp = new Date().toLocaleString();
    console.log('📝 Step 3: Committing state... ');
    const commitMsg = `[DB-SYNC] Automated database update: ${timestamp}`;
    runCommand(`git commit -m "${commitMsg}"`);

    // 4. Git Push
    console.log('🚀 Step 4: Launching to GitHub...');
    if (runCommand('git push origin main')) {
        console.log('\n✨ [MISSION SUCCESS] Database synchronized with GitHub repository!');
    } else {
        console.warn('\n⚠️  Push failed. Check your internet connection or git credentials.');
    }
}

main();
