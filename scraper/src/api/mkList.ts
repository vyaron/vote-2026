/**
 * Fetch list of MK IDs from OData KNS_MkSiteCode endpoint
 * 
 * Key insight: PersonID in KNS_Person does NOT equal mkId in WebSiteApi
 * We need to use KNS_MkSiteCode to get the correct mapping
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';
import { httpClient, logger } from '../utils/index.js';
import type { ODataPerson, ODataPersonToPosition, ODataResponse } from '../types/index.js';

const ODATA_BASE = config.odata.baseUrl;

// OData KNS_MkSiteCode response - this maps PersonID to the WebSiteApi mkId
export interface ODataMkSiteCode {
  MKSiteCode: number;  // This is the mkId used in WebSiteApi
  KnsID: number;
}

export interface MkListItem {
  mkId: number;       // For WebSiteApi (MKSiteCode)
  personId: number;   // For OData (KnsID)
  firstName: string;
  lastName: string;
  fullName: string;
  isCurrent: boolean;
}

/**
 * Get all MK site codes (the mkId used in WebSiteApi)
 */
export async function getMkSiteCodes(): Promise<ODataMkSiteCode[]> {
  logger.info('Fetching MK site codes from OData...', 'MkList');
  
  const url = `${ODATA_BASE}/KNS_MkSiteCode`;
  const codes = await httpClient.getAllODataPages<ODataMkSiteCode>(url);
  
  logger.success(`Found ${codes.length} MK site codes`, 'MkList');
  return codes;
}

/**
 * Get all current MKs with their proper mkIds
 */
export async function getCurrentMkIds(): Promise<MkListItem[]> {
  logger.info('Fetching current MKs from OData...', 'MkList');
  
  // First try to get all MK site codes (mapping PersonID -> mkId)
  const siteCodes = await getMkSiteCodes();
  const siteCodeMap = new Map<number, number>();
  for (const sc of siteCodes) {
    // MKSiteCode can be string or number
    const mkId = typeof sc.MKSiteCode === 'string' ? parseInt(sc.MKSiteCode, 10) : sc.MKSiteCode;
    if (!isNaN(mkId)) {
      siteCodeMap.set(sc.KnsID, mkId);
    }
  }
  
  logger.info(`Site code mapping has ${siteCodeMap.size} entries`, 'MkList');
  
  // Get current persons
  const url = `${ODATA_BASE}/KNS_Person?$filter=IsCurrent eq true`;
  const persons = await httpClient.getAllODataPages<ODataPerson>(url);
  
  const mks: MkListItem[] = [];
  
  for (const p of persons) {
    // Get the mkId from site codes, or fallback to PersonID
    const mkId = siteCodeMap.get(p.PersonID) || p.PersonID;
    
    mks.push({
      mkId,
      personId: p.PersonID,
      firstName: p.FirstName,
      lastName: p.LastName,
      fullName: `${p.FirstName} ${p.LastName}`,
      isCurrent: p.IsCurrent,
    });
  }
  
  logger.success(`Found ${mks.length} current MKs`, 'MkList');
  return mks;
}

/**
 * Get MK IDs for specific Knesset numbers using PersonToPosition
 */
export async function getMkIdsByKnesset(knessetNums: number[]): Promise<Map<number, MkListItem[]>> {
  logger.info(`Fetching MKs for Knessets: ${knessetNums.join(', ')}...`, 'MkList');
  
  // Get site code mapping first
  const siteCodes = await getMkSiteCodes();
  const siteCodeMap = new Map<number, number>();
  for (const sc of siteCodes) {
    siteCodeMap.set(sc.KnsID, sc.MKSiteCode);
  }
  
  const result = new Map<number, MkListItem[]>();
  
  for (const knessetNum of knessetNums) {
    // Position ID 54 is typically "חבר הכנסת" (Knesset Member)
    const url = `${ODATA_BASE}/KNS_PersonToPosition?$filter=KnessetNum eq ${knessetNum} and (PositionID eq 54 or PositionID eq 43 or PositionID eq 61)`;
    
    const positions = await httpClient.getAllODataPages<ODataPersonToPosition>(url);
    
    // Get unique person IDs
    const uniquePersonIds = [...new Set(positions.map(p => p.PersonID))];
    
    // Get person details for each
    const mks: MkListItem[] = [];
    for (const personId of uniquePersonIds) {
      const personUrl = `${ODATA_BASE}/KNS_Person(${personId})`;
      const person = await httpClient.get<ODataPerson>(personUrl);
      
      if (person) {
        const mkId = siteCodeMap.get(person.PersonID) || person.PersonID;
        
        mks.push({
          mkId,
          personId: person.PersonID,
          firstName: person.FirstName,
          lastName: person.LastName,
          fullName: `${person.FirstName} ${person.LastName}`,
          isCurrent: person.IsCurrent,
        });
      }
    }
    
    result.set(knessetNum, mks);
    logger.info(`Knesset ${knessetNum}: ${mks.length} MKs`, 'MkList');
  }
  
  return result;
}

/**
 * Get all unique MK IDs across multiple Knessets
 */
export async function getAllMkIds(knessetNums: number[]): Promise<MkListItem[]> {
  const mksByKnesset = await getMkIdsByKnesset(knessetNums);
  
  // Combine and deduplicate by mkId
  const uniqueMks = new Map<number, MkListItem>();
  
  for (const [_, mks] of mksByKnesset) {
    for (const mk of mks) {
      uniqueMks.set(mk.mkId, mk);
    }
  }
  
  const allMks = Array.from(uniqueMks.values());
  logger.success(`Total unique MKs across all Knessets: ${allMks.length}`, 'MkList');
  
  return allMks;
}

/**
 * Simple approach: scan ID range to find valid MKs
 * This is the most reliable method since OData mapping is incomplete
 */
export async function scanMkIdRange(startId: number, endId: number): Promise<number[]> {
  logger.info(`Scanning MK ID range ${startId}-${endId}...`, 'MkList');
  
  const validIds: number[] = [];
  const batchSize = 10; // Test multiple IDs in parallel for speed
  
  for (let i = startId; i <= endId; i += batchSize) {
    const batch = Array.from(
      { length: Math.min(batchSize, endId - i + 1) },
      (_, j) => i + j
    );
    
    const results = await Promise.all(
      batch.map(async (id) => {
        const url = `${config.baseUrl}${config.api.mkHeader}?mkId=${id}&languageKey=${config.languageKey}`;
        const response = await httpClient.get<{ ID: number; Name: string }>(url, { retries: 1, skipRateLimit: true });
        return response && response.ID && response.Name ? id : null;
      })
    );
    
    for (const id of results) {
      if (id !== null) {
        validIds.push(id);
      }
    }
    
    // Show progress
    logger.progress(Math.min(i + batchSize, endId) - startId, endId - startId, `Found ${validIds.length} valid MKs`);
    
    // Small delay between batches
    await new Promise(r => setTimeout(r, 200));
  }
  
  logger.success(`Found ${validIds.length} valid MK IDs in range`, 'MkList');
  return validIds;
}

/**
 * Get all valid MK IDs by scanning common ranges
 * Based on exploration, MK IDs are typically 1-1200
 */
export async function discoverAllMkIds(): Promise<number[]> {
  logger.info('Discovering all valid MK IDs by range scan...', 'MkList');
  
  // Scan the typical MK ID range
  const validIds = await scanMkIdRange(1, 1200);
  
  logger.success(`Discovered ${validIds.length} total valid MK IDs`, 'MkList');
  return validIds;
}

/**
 * Load active MK IDs from pre-extracted JSON file
 * These IDs were extracted from the main Knesset page using:
 * [...document.querySelectorAll('a[href*="/mk/apps/mk/mk-personal-details/"]')].map(a => a.href.split('/').pop())
 */
export async function getActiveMkIds(): Promise<number[]> {
  logger.info('Loading active MK IDs from JSON file...', 'MkList');
  
  const filePath = path.resolve(process.cwd(), '../data/active-mk-ids.json');
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ids: number[] = JSON.parse(content);
    logger.success(`Loaded ${ids.length} active MK IDs`, 'MkList');
    return ids;
  } catch (error) {
    logger.error(`Failed to load active MK IDs: ${error}`, 'MkList');
    throw error;
  }
}
