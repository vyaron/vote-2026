/**
 * Fetch and download MK photos
 */

import { config } from '../config.js';
import { httpClient, logger, fileWriter } from '../utils/index.js';
import type { MkImageResponse, MkPhoto } from '../types/index.js';

// Different base URLs for different image types
const PROFILE_IMAGE_BASE = 'https://fs.knesset.gov.il';
const GALLERY_IMAGE_BASE = 'https://main.knesset.gov.il';

/**
 * Fetch image metadata for an MK
 */
export async function fetchMkImageMetadata(mkId: number): Promise<MkImageResponse[]> {
  const url = `${config.baseUrl}${config.api.mkImages}`;
  const payload = {
    RelativeSiteUrl: 'mk',
    Folder: 'MKPersonalDetailsImages',
    ObjectId: String(mkId),
  };
  
  const response = await httpClient.post<MkImageResponse[]>(url, payload);
  return response || [];
}

/**
 * Download a single image
 */
export async function downloadImage(imagePath: string): Promise<Buffer | null> {
  let fullUrl: string;
  
  if (imagePath.startsWith('http')) {
    fullUrl = imagePath;
  } else if (imagePath.startsWith('/mk/')) {
    // Gallery images use main.knesset.gov.il
    fullUrl = `${GALLERY_IMAGE_BASE}${imagePath}`;
  } else {
    // Profile images use fs.knesset.gov.il
    fullUrl = `${PROFILE_IMAGE_BASE}${imagePath}`;
  }
  
  // Strip query parameters (e.g., ?v=...) - they cause 406 errors
  fullUrl = fullUrl.split('?')[0];
  
  return httpClient.downloadFile(fullUrl);
}

/**
 * Download all photos for an MK (highest resolution versions)
 */
export async function downloadMkPhotos(
  mkId: number,
  imageMetadata: MkImageResponse[],
  options: { highestResOnly?: boolean; maxPhotos?: number } = {}
): Promise<MkPhoto[]> {
  const { highestResOnly = true, maxPhotos } = options;
  
  if (imageMetadata.length === 0) {
    logger.debug(`No photos found for MK ${mkId}`, 'MkImages');
    return [];
  }
  
  let imagesToDownload = imageMetadata;
  
  // Sort by resolution (highest first)
  if (highestResOnly) {
    imagesToDownload = [...imageMetadata].sort((a, b) => {
      const aPixels = parseInt(a.ImageWidth) * parseInt(a.ImageHeight);
      const bPixels = parseInt(b.ImageWidth) * parseInt(b.ImageHeight);
      return bPixels - aPixels;
    });
  }
  
  // Limit number of photos if specified
  if (maxPhotos && maxPhotos > 0) {
    imagesToDownload = imagesToDownload.slice(0, maxPhotos);
  }
  
  const downloadedPhotos: MkPhoto[] = [];
  
  for (const img of imagesToDownload) {
    try {
      const buffer = await downloadImage(img.ImagePath);
      
      if (buffer) {
        // Save the image
        const filename = img.ImageName;
        const localPath = await fileWriter.savePhoto(mkId, filename, buffer);
        
        downloadedPhotos.push({
          id: img.ID,
          filename,
          localPath: `photos/${mkId}/${filename}`,
          originalUrl: img.ImagePath,
          width: parseInt(img.ImageWidth) || 0,
          height: parseInt(img.ImageHeight) || 0,
          title: img.ImageTitle,
        });
      }
    } catch (error) {
      logger.warn(`Failed to download image ${img.ImageName} for MK ${mkId}`, 'MkImages');
    }
  }
  
  logger.debug(`Downloaded ${downloadedPhotos.length}/${imagesToDownload.length} photos for MK ${mkId}`, 'MkImages');
  return downloadedPhotos;
}

/**
 * Download just the profile image
 */
export async function downloadProfileImage(mkId: number, profileUrl: string): Promise<MkPhoto | null> {
  if (!profileUrl) return null;
  
  try {
    const buffer = await downloadImage(profileUrl);
    
    if (buffer) {
      const filename = 'profile.jpg';
      const localPath = await fileWriter.savePhoto(mkId, filename, buffer);
      
      return {
        id: 0,
        filename,
        localPath: `photos/${mkId}/${filename}`,
        originalUrl: profileUrl,
        width: 0,
        height: 0,
        title: 'Profile Image',
      };
    }
  } catch (error) {
    logger.warn(`Failed to download profile image for MK ${mkId}`, 'MkImages');
  }
  
  return null;
}
