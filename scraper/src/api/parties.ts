/**
 * Fetch faction/party and committee data from OData
 */

import { config } from '../config.js';
import { httpClient, logger } from '../utils/index.js';
import type { 
  ODataFaction, 
  ODataCommittee, 
  ODataBill,
  Party, 
  Committee, 
  Bill 
} from '../types/index.js';

const ODATA_BASE = config.odata.baseUrl;

/**
 * Fetch all factions/parties for specified Knessets
 */
export async function fetchFactions(knessetNums: number[]): Promise<ODataFaction[]> {
  logger.info('Fetching factions from OData...', 'Parties');
  
  const allFactions: ODataFaction[] = [];
  
  for (const knessetNum of knessetNums) {
    const url = `${ODATA_BASE}/KNS_Faction?$filter=KnessetNum eq ${knessetNum}`;
    const factions = await httpClient.getAllODataPages<ODataFaction>(url);
    allFactions.push(...factions);
    logger.debug(`Knesset ${knessetNum}: ${factions.length} factions`, 'Parties');
  }
  
  logger.success(`Fetched ${allFactions.length} total factions`, 'Parties');
  return allFactions;
}

/**
 * Transform OData faction to Party object
 */
export function transformFaction(faction: ODataFaction, memberIds: number[] = []): Party {
  return {
    id: faction.FactionID,
    name: faction.Name,
    knessetNum: faction.KnessetNum,
    startDate: faction.StartDate,
    finishDate: faction.FinishDate,
    isCurrent: faction.IsCurrent,
    members: memberIds,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Fetch all committees for specified Knessets
 */
export async function fetchCommittees(knessetNums: number[]): Promise<ODataCommittee[]> {
  logger.info('Fetching committees from OData...', 'Committees');
  
  const allCommittees: ODataCommittee[] = [];
  
  for (const knessetNum of knessetNums) {
    const url = `${ODATA_BASE}/KNS_Committee?$filter=KnessetNum eq ${knessetNum}`;
    const committees = await httpClient.getAllODataPages<ODataCommittee>(url);
    allCommittees.push(...committees);
    logger.debug(`Knesset ${knessetNum}: ${committees.length} committees`, 'Committees');
  }
  
  logger.success(`Fetched ${allCommittees.length} total committees`, 'Committees');
  return allCommittees;
}

/**
 * Transform OData committee to Committee object
 */
export function transformCommittee(committee: ODataCommittee): Committee {
  return {
    id: committee.CommitteeID,
    name: committee.Name,
    category: committee.CategoryDesc,
    type: committee.CommitteeTypeDesc,
    knessetNum: committee.KnessetNum,
    email: committee.Email,
    isCurrent: committee.IsCurrent,
    parentCommitteeId: committee.ParentCommitteeID,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Fetch bills for specified Knessets
 */
export async function fetchBills(knessetNums: number[]): Promise<ODataBill[]> {
  logger.info('Fetching bills from OData...', 'Bills');
  
  const allBills: ODataBill[] = [];
  
  for (const knessetNum of knessetNums) {
    const url = `${ODATA_BASE}/KNS_Bill?$filter=KnessetNum eq ${knessetNum}`;
    const bills = await httpClient.getAllODataPages<ODataBill>(url);
    allBills.push(...bills);
    logger.debug(`Knesset ${knessetNum}: ${bills.length} bills`, 'Bills');
  }
  
  logger.success(`Fetched ${allBills.length} total bills`, 'Bills');
  return allBills;
}

/**
 * Transform OData bill to Bill object
 */
export function transformBill(bill: ODataBill): Bill {
  return {
    id: bill.BillID,
    name: bill.Name,
    knessetNum: bill.KnessetNum,
    type: bill.SubTypeDesc,
    committeeId: bill.CommitteeID,
    status: bill.StatusID,
    publicationDate: bill.PublicationDate,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Fetch KNS_KnessetDates for term information
 */
export async function fetchKnessetDates(): Promise<unknown[]> {
  logger.info('Fetching Knesset dates from OData...', 'KnessetDates');
  
  const url = `${ODATA_BASE}/KNS_KnessetDates`;
  const dates = await httpClient.getAllODataPages<unknown>(url);
  
  logger.success(`Fetched ${dates.length} Knesset date records`, 'KnessetDates');
  return dates;
}
