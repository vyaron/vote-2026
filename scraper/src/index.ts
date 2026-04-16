/**
 * Knesset Scraper - Main Entry Point
 * 
 * Usage:
 *   npm run scrape                    # Run all steps
 *   npm run scrape -- --step=mks      # Run MK scraping only
 *   npm run scrape -- --step=photos   # Run photo download only
 *   npm run scrape -- --step=parties  # Run party/committee scraping only
 *   npm run scrape -- --resume        # Resume from last position
 */

import { config } from './config.js';
import { logger, fileWriter } from './utils/index.js';
import {
  getCurrentMkIds,
  getAllMkIds,
  discoverAllMkIds,
  getActiveMkIds,
  MkListItem,
  fetchMkDetails,
  transformMkData,
  fetchMkImageMetadata,
  downloadMkPhotos,
  downloadProfileImage,
  fetchFactions,
  transformFaction,
  fetchCommittees,
  transformCommittee,
  fetchBills,
  transformBill,
} from './api/index.js';
import type { MK, MkSummary, MkPhoto, Party, Committee, Bill } from './types/index.js';

// Parse command line arguments
const args = process.argv.slice(2);
const stepArg = args.find(a => a.startsWith('--step='));
const resumeArg = args.includes('--resume');
const step = stepArg ? stepArg.split('=')[1] : 'all';

// Knesset numbers to scrape (last 7: 20-26)
const KNESSET_NUMS = Array.from(
  { length: config.knessetRange.current - config.knessetRange.oldest + 1 },
  (_, i) => config.knessetRange.oldest + i
);

interface ScrapingState {
  startedAt: string;
  step: string;
  mkIds: number[];
  completedMkIds: number[];
  errors: { mkId: number; error: string }[];
}

/**
 * Step 1: Fetch and save the list of all MK IDs
 */
async function step1_fetchMkList(): Promise<number[]> {
  logger.section('STEP 1: Loading Active MK List');
  
  // Load the 120 active MKs from pre-extracted JSON
  // IDs were extracted from main page using browser console
  const mkIds = await getActiveMkIds();
  
  // Save the list for reference
  await fileWriter.saveJson('active-mk-ids-copy.json', mkIds);
  
  logger.success(`Loaded ${mkIds.length} active MKs to scrape`);
  return mkIds;
}

/**
 * Step 2: Scrape detailed info for each MK
 */
async function step2_scrapeMkDetails(mkIds: number[], resume: boolean = false): Promise<MK[]> {
  logger.section('STEP 2: Scraping MK Details');
  
  const allMks: MK[] = [];
  let skipped = 0;
  
  // Get already saved MKs if resuming
  const savedMkIds = resume ? await fileWriter.getSavedMkIds() : [];
  
  const total = mkIds.length;
  let current = 0;
  
  for (const mkId of mkIds) {
    current++;
    
    // Skip if already scraped (resume mode)
    if (savedMkIds.includes(mkId)) {
      skipped++;
      logger.debug(`Skipping MK ${mkId} (already saved)`, 'Scraper');
      continue;
    }
    
    logger.progress(current, total, `MK ${mkId}`);
    
    try {
      const mkData = await fetchMkDetails(mkId);
      
      if (mkData) {
        // Save individual MK file
        await fileWriter.saveMk(mkId, mkData);
        allMks.push(mkData);
      }
    } catch (error) {
      logger.error(`Failed to scrape MK ${mkId}: ${error}`, 'Scraper');
    }
  }
  
  if (skipped > 0) {
    logger.info(`Skipped ${skipped} already saved MKs`, 'Scraper');
  }
  
  logger.success(`Scraped ${allMks.length} MKs`);
  return allMks;
}

/**
 * Step 3: Download photos for each MK
 */
async function step3_downloadPhotos(mkIds: number[], resume: boolean = false): Promise<void> {
  logger.section('STEP 3: Downloading All MK Photos');
  
  const total = mkIds.length;
  let current = 0;
  let totalPhotos = 0;
  
  for (const mkId of mkIds) {
    current++;
    logger.progress(current, total, `Photos for MK ${mkId}`);
    
    try {
      // Read the MK data
      const mkPath = fileWriter.paths.mksDir + `/${mkId}.json`;
      const mkData = await fileWriter.readJson<MK>(mkPath);
      
      if (!mkData) continue;
      
      const allPhotos: MkPhoto[] = [];
      
      // 1. Download profile image from header (uses fs.knesset.gov.il)
      if (mkData.images?.profile) {
        const profilePhoto = await downloadProfileImage(mkId, mkData.images.profile);
        if (profilePhoto) {
          allPhotos.push(profilePhoto);
        }
      }
      
      // 2. Fetch and download all gallery images (uses main.knesset.gov.il)
      const imageMetadata = await fetchMkImageMetadata(mkId);
      if (imageMetadata.length > 0) {
        const galleryPhotos = await downloadMkPhotos(mkId, imageMetadata, {
          highestResOnly: false, // Download all photos
        });
        allPhotos.push(...galleryPhotos);
      }
      
      totalPhotos += allPhotos.length;
      
      // Update the MK JSON with all photo info
      mkData.photos = allPhotos;
      if (allPhotos.length > 0) {
        mkData.localImagePath = allPhotos[0].localPath;
      }
      await fileWriter.saveMk(mkId, mkData);
      
      logger.debug(`MK ${mkId}: ${allPhotos.length} photos`, 'Photos');
      
    } catch (error) {
      logger.error(`Failed to download photos for MK ${mkId}: ${error}`, 'Scraper');
    }
  }
  
  logger.success(`Downloaded ${totalPhotos} photos total`);
}

/**
 * Step 4: Scrape party/faction data
 */
async function step4_scrapeParties(): Promise<Party[]> {
  logger.section('STEP 4: Scraping Factions/Parties');
  
  const factions = await fetchFactions(KNESSET_NUMS);
  const parties: Party[] = factions.map(f => transformFaction(f));
  
  // Save all parties
  await fileWriter.saveJson('factions.json', parties, 'parties');
  
  // Save individual party files
  for (const party of parties) {
    await fileWriter.saveJson(`${party.id}.json`, party, 'parties');
  }
  
  logger.success(`Saved ${parties.length} factions`);
  return parties;
}

/**
 * Step 5: Scrape committee data
 */
async function step5_scrapeCommittees(): Promise<Committee[]> {
  logger.section('STEP 5: Scraping Committees');
  
  const rawCommittees = await fetchCommittees(KNESSET_NUMS);
  const committees: Committee[] = rawCommittees.map(c => transformCommittee(c));
  
  // Save all committees
  await fileWriter.saveJson('committees.json', committees);
  
  logger.success(`Saved ${committees.length} committees`);
  return committees;
}

/**
 * Step 6: Scrape bills data
 */
async function step6_scrapeBills(): Promise<Bill[]> {
  logger.section('STEP 6: Scraping Bills');
  
  const rawBills = await fetchBills(KNESSET_NUMS);
  const bills: Bill[] = rawBills.map(b => transformBill(b));
  
  // Save all bills  
  await fileWriter.saveJson('bills.json', bills);
  
  logger.success(`Saved ${bills.length} bills`);
  return bills;
}

/**
 * Step 7: Generate summary files
 */
async function step7_generateSummaries(mks: MK[]): Promise<void> {
  logger.section('STEP 7: Generating Summary Files');
  
  // Load all MKs if not provided
  if (mks.length === 0) {
    const savedIds = await fileWriter.getSavedMkIds();
    for (const id of savedIds) {
      const mk = await fileWriter.readJson<MK>(`${fileWriter.paths.mksDir}/${id}.json`);
      if (mk) mks.push(mk);
    }
  }
  
  // Generate summary
  const summary: MkSummary[] = mks.map(mk => ({
    id: mk.id,
    name: mk.name,
    faction: mk.faction,
    isCurrentMk: mk.isCurrentMk,
    profileImage: mk.images.profile,
  }));
  
  await fileWriter.saveJson('summary.json', summary, 'mks');
  
  // Group by faction
  const byFaction: Record<string, MkSummary[]> = {};
  for (const mk of summary) {
    if (!byFaction[mk.faction]) {
      byFaction[mk.faction] = [];
    }
    byFaction[mk.faction].push(mk);
  }
  await fileWriter.saveJson('by-faction.json', byFaction, 'mks');
  
  // Stats
  const stats = await fileWriter.getStats();
  await fileWriter.saveJson('stats.json', {
    ...stats,
    totalMks: mks.length,
    currentMks: mks.filter(m => m.isCurrentMk).length,
    factions: Object.keys(byFaction).length,
    scrapedAt: new Date().toISOString(),
  });
  
  logger.success('Summary files generated');
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();
  
  logger.section('🔍 KNESSET SCRAPER');
  logger.info(`Step: ${step}`);
  logger.info(`Resume mode: ${resumeArg}`);
  logger.info(`Knessets: ${KNESSET_NUMS.join(', ')}`);
  
  // Ensure directories exist
  await fileWriter.ensureDirectories();
  
  let mkIds: number[] = [];
  let mks: MK[] = [];
  
  try {
    switch (step) {
      case 'mks':
        mkIds = await step1_fetchMkList();
        mks = await step2_scrapeMkDetails(mkIds, resumeArg);
        break;
        
      case 'photos':
        mkIds = await fileWriter.getSavedMkIds();
        await step3_downloadPhotos(mkIds, resumeArg);
        break;
        
      case 'parties':
        await step4_scrapeParties();
        await step5_scrapeCommittees();
        break;
        
      case 'bills':
        await step6_scrapeBills();
        break;
        
      case 'summary':
        await step7_generateSummaries([]);
        break;
        
      case 'all':
      default:
        // Run all steps
        mkIds = await step1_fetchMkList();
        mks = await step2_scrapeMkDetails(mkIds, resumeArg);
        await step3_downloadPhotos(mkIds, resumeArg);
        await step4_scrapeParties();
        await step5_scrapeCommittees();
        await step6_scrapeBills();
        await step7_generateSummaries(mks);
        break;
    }
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    const stats = await fileWriter.getStats();
    
    logger.section('✅ SCRAPING COMPLETE');
    logger.info(`Duration: ${duration}s`);
    logger.info(`MKs saved: ${stats.mks}`);
    logger.info(`Photos saved: ${stats.photos}`);
    logger.info(`Parties saved: ${stats.parties}`);
    
  } catch (error) {
    logger.error(`Scraping failed: ${error}`, 'Main');
    process.exit(1);
  }
}

main();
