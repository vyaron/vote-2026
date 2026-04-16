/**
 * API Exploration Script
 * 
 * This script tests the Knesset APIs to discover:
 * 1. What data is available from each endpoint
 * 2. The structure of the responses
 * 3. Any additional endpoints we might find
 * 
 * Run with: npm run explore
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../../data/exploration');

// Sample MK ID for testing (Benjamin Netanyahu as example)
const TEST_MK_ID = 876;

interface ExplorationResult {
  endpoint: string;
  status: number;
  data: unknown;
  error?: string;
}

const results: ExplorationResult[] = [];

async function log(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function testEndpoint(name: string, url: string, options?: { method?: 'GET' | 'POST'; data?: unknown }): Promise<unknown> {
  log(`Testing: ${name}`);
  log(`  URL: ${url}`);
  
  try {
    const response = await axios({
      method: options?.method || 'GET',
      url,
      data: options?.data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });
    
    log(`  ✅ Status: ${response.status}`);
    results.push({ endpoint: name, status: response.status, data: response.data });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 0;
    const errorMsg = error.message;
    log(`  ❌ Error: ${status} - ${errorMsg}`);
    results.push({ endpoint: name, status, data: null, error: errorMsg });
    return null;
  }
}

async function exploreMainPage() {
  log('\n========== EXPLORING MAIN PAGE ==========\n');
  
  try {
    const response = await axios.get(config.mainPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });
    
    const $ = cheerio.load(response.data);
    
    // Try to find MK links/IDs in the page
    log('Looking for MK links in the page...');
    
    // Common patterns for MK links
    const mkLinks: { id: string; name?: string; href: string }[] = [];
    
    $('a[href*="mkId"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/mkId[=\/](\d+)/i);
      if (match) {
        mkLinks.push({
          id: match[1],
          name: $(el).text().trim(),
          href,
        });
      }
    });
    
    // Also look for data attributes
    $('[data-mk-id], [data-mkid]').each((_, el) => {
      const id = $(el).attr('data-mk-id') || $(el).attr('data-mkid');
      if (id) {
        mkLinks.push({
          id,
          name: $(el).text().trim(),
          href: '',
        });
      }
    });
    
    log(`Found ${mkLinks.length} MK references in the page`);
    
    // Get unique IDs
    const uniqueIds = [...new Set(mkLinks.map(m => m.id))];
    log(`Unique MK IDs found: ${uniqueIds.length}`);
    
    if (uniqueIds.length > 0) {
      log(`Sample IDs: ${uniqueIds.slice(0, 10).join(', ')}...`);
    }
    
    // Look for any API calls or JSON data in scripts
    const scripts = $('script').toArray();
    const apiPatterns: string[] = [];
    
    scripts.forEach((script) => {
      const content = $(script).html() || '';
      const apiMatches = content.match(/\/WebSiteApi\/[^\s"']+/g);
      if (apiMatches) {
        apiPatterns.push(...apiMatches);
      }
    });
    
    if (apiPatterns.length > 0) {
      log('\nAPI patterns found in page scripts:');
      [...new Set(apiPatterns)].forEach(p => log(`  - ${p}`));
    }
    
    results.push({
      endpoint: 'Main Page Analysis',
      status: response.status,
      data: {
        mkLinksFound: mkLinks.length,
        uniqueIds: uniqueIds.slice(0, 20), // First 20 IDs
        apiPatterns: [...new Set(apiPatterns)],
      },
    });
    
    return uniqueIds;
  } catch (error: any) {
    log(`❌ Failed to fetch main page: ${error.message}`);
    results.push({
      endpoint: 'Main Page Analysis',
      status: 0,
      data: null,
      error: error.message,
    });
    return [];
  }
}

async function exploreMkApis(mkId: number) {
  log('\n========== EXPLORING MK APIs ==========\n');
  
  // Test GetMkdetailsHeader
  await testEndpoint(
    'GetMkdetailsHeader',
    `${config.baseUrl}${config.api.mkHeader}?mkId=${mkId}&languageKey=${config.languageKey}`
  );
  
  // Small delay
  await new Promise(r => setTimeout(r, config.delayMs));
  
  // Test GetMkDetailsContent
  await testEndpoint(
    'GetMkDetailsContent',
    `${config.baseUrl}${config.api.mkContent}?mkId=${mkId}&languageKey=${config.languageKey}`
  );
  
  await new Promise(r => setTimeout(r, config.delayMs));
  
  // Test GetMKImages
  await testEndpoint(
    'GetMKImages',
    `${config.baseUrl}${config.api.mkImages}`,
    {
      method: 'POST',
      data: {
        RelativeSiteUrl: 'mk',
        Folder: 'MKPersonalDetailsImages',
        ObjectId: String(mkId),
      },
    }
  );
}

async function exploreODataApi() {
  log('\n========== EXPLORING ODATA API ==========\n');
  
  // Test the main OData endpoint
  await testEndpoint(
    'OData - Root',
    config.odata.baseUrl
  );
  
  await new Promise(r => setTimeout(r, config.delayMs));
  
  // Try to get metadata
  await testEndpoint(
    'OData - Metadata',
    `${config.odata.baseUrl}/$metadata`
  );
  
  await new Promise(r => setTimeout(r, config.delayMs));
  
  // Try common entity sets
  const entitySets = [
    'KNS_Person',
    'KNS_MK',
    'KNS_Faction',
    'KNS_Committee',
    'KNS_Bill',
    'KNS_Vote',
    'KNS_Knesset',
  ];
  
  for (const entity of entitySets) {
    await testEndpoint(
      `OData - ${entity}`,
      `${config.odata.baseUrl}/${entity}?$top=2`
    );
    await new Promise(r => setTimeout(r, config.delayMs));
  }
}

async function exploreAdditionalEndpoints() {
  log('\n========== EXPLORING ADDITIONAL ENDPOINTS ==========\n');
  
  // Try to find an endpoint that lists all MKs
  const potentialEndpoints = [
    '/WebSiteApi/knessetapi/MKs/GetAllMks',
    '/WebSiteApi/knessetapi/MKs/GetCurrentMks',
    '/WebSiteApi/knessetapi/MKs/GetMksList',
    '/WebSiteApi/knessetapi/MKs/GetAllCurrentMks',
  ];
  
  for (const endpoint of potentialEndpoints) {
    await testEndpoint(
      `Potential MK List - ${endpoint}`,
      `${config.baseUrl}${endpoint}?languageKey=${config.languageKey}`
    );
    await new Promise(r => setTimeout(r, config.delayMs));
  }
}

async function saveResults() {
  log('\n========== SAVING RESULTS ==========\n');
  
  await mkdir(OUTPUT_DIR, { recursive: true });
  
  const outputPath = join(OUTPUT_DIR, `exploration-${Date.now()}.json`);
  await writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  log(`Results saved to: ${outputPath}`);
  
  // Also save a summary
  const summary = {
    timestamp: new Date().toISOString(),
    testMkId: TEST_MK_ID,
    endpoints: results.map(r => ({
      endpoint: r.endpoint,
      status: r.status,
      success: r.status >= 200 && r.status < 300,
      hasData: r.data !== null,
      error: r.error,
    })),
  };
  
  const summaryPath = join(OUTPUT_DIR, 'exploration-summary.json');
  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
  log(`Summary saved to: ${summaryPath}`);
}

async function main() {
  log('🔍 Starting Knesset API Exploration\n');
  log(`Test MK ID: ${TEST_MK_ID}`);
  log(`Language: ${config.languageKey}`);
  log(`Delay between requests: ${config.delayMs}ms\n`);
  
  // Explore main page first
  const mkIds = await exploreMainPage();
  
  // Explore MK APIs
  await exploreMkApis(TEST_MK_ID);
  
  // Explore OData API
  await exploreODataApi();
  
  // Try additional endpoints
  await exploreAdditionalEndpoints();
  
  // Save all results
  await saveResults();
  
  log('\n✅ Exploration complete! Check the data/exploration folder for results.');
  
  // Print summary
  log('\n========== SUMMARY ==========\n');
  const successful = results.filter(r => r.status >= 200 && r.status < 300);
  const failed = results.filter(r => r.status < 200 || r.status >= 300);
  
  log(`✅ Successful endpoints: ${successful.length}`);
  successful.forEach(r => log(`   - ${r.endpoint}`));
  
  if (failed.length > 0) {
    log(`\n❌ Failed endpoints: ${failed.length}`);
    failed.forEach(r => log(`   - ${r.endpoint}: ${r.error || r.status}`));
  }
}

main().catch(console.error);
