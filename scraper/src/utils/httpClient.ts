/**
 * HTTP Client with rate limiting and retry logic
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { config } from '../config.js';
import { logger } from './logger.js';

// Rate limiting state
let lastRequestTime = 0;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < config.delayMs) {
    await delay(config.delayMs - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
}

// Create axios instance with defaults
const axiosInstance: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
});

interface HttpClientOptions {
  retries?: number;
  skipRateLimit?: boolean;
}

export const httpClient = {
  /**
   * GET request with rate limiting and retry
   */
  async get<T>(url: string, options: HttpClientOptions = {}): Promise<T | null> {
    const { retries = 3, skipRateLimit = false } = options;
    
    if (!skipRateLimit) {
      await rateLimit();
    }
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.debug(`GET ${url}`, 'HTTP');
        const response = await axiosInstance.get<T>(url);
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 0;
        
        if (attempt === retries) {
          logger.error(`GET ${url} failed after ${retries} attempts: ${status}`, 'HTTP');
          return null;
        }
        
        // Wait before retry (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        logger.warn(`GET ${url} failed (${status}), retrying in ${waitTime}ms...`, 'HTTP');
        await delay(waitTime);
      }
    }
    
    return null;
  },
  
  /**
   * POST request with rate limiting and retry
   */
  async post<T>(url: string, data: unknown, options: HttpClientOptions = {}): Promise<T | null> {
    const { retries = 3, skipRateLimit = false } = options;
    
    if (!skipRateLimit) {
      await rateLimit();
    }
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.debug(`POST ${url}`, 'HTTP');
        const response = await axiosInstance.post<T>(url, data);
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 0;
        
        if (attempt === retries) {
          logger.error(`POST ${url} failed after ${retries} attempts: ${status}`, 'HTTP');
          return null;
        }
        
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        logger.warn(`POST ${url} failed (${status}), retrying in ${waitTime}ms...`, 'HTTP');
        await delay(waitTime);
      }
    }
    
    return null;
  },
  
  /**
   * Download binary file (for images)
   */
  async downloadFile(url: string, options: HttpClientOptions = {}): Promise<Buffer | null> {
    const { retries = 3, skipRateLimit = false } = options;
    
    if (!skipRateLimit) {
      await rateLimit();
    }
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.debug(`DOWNLOAD ${url}`, 'HTTP');
        const response = await axiosInstance.get(url, {
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'image/jpeg,image/png,image/webp,image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
            'Referer': 'https://www.knesset.gov.il/',
          },
        });
        return Buffer.from(response.data);
      } catch (error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 0;
        
        if (attempt === retries) {
          logger.error(`DOWNLOAD ${url} failed after ${retries} attempts: ${status}`, 'HTTP');
          return null;
        }
        
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        logger.warn(`DOWNLOAD ${url} failed (${status}), retrying in ${waitTime}ms...`, 'HTTP');
        await delay(waitTime);
      }
    }
    
    return null;
  },
  
  /**
   * Fetch all pages from an OData endpoint
   */
  async getAllODataPages<T>(baseUrl: string): Promise<T[]> {
    const allItems: T[] = [];
    let url: string | null = baseUrl;
    let page = 1;
    
    while (url) {
      logger.debug(`Fetching OData page ${page}...`, 'HTTP');
      
      const response = await this.get<{ value: T[]; 'odata.nextLink'?: string }>(url);
      
      if (!response || !response.value) {
        break;
      }
      
      allItems.push(...response.value);
      url = response['odata.nextLink'] || null;
      page++;
    }
    
    logger.info(`Fetched ${allItems.length} items from OData`, 'HTTP');
    return allItems;
  },
};
