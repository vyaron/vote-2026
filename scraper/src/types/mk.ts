/**
 * TypeScript types for Knesset Member data
 */

// Raw API response from GetMkdetailsHeader
export interface MkHeaderResponse {
  ID: number;
  Name: string;
  MkName: string;
  Position: string;
  Faction: string;
  mk_work_phone: string;
  mk_home_phone: string;
  mk_fax: string;
  Email: string;
  IsPresent: boolean;
  Video: string;
  Facebook: string;
  Twitter: string;
  Website: string;
  Instagram: string;
  Youtube: string;
  MkImage: string;
  LobbyImage: string;
  BannerImage: string;
  BannerMobile: string;
  CurrentKnesset: boolean;
  KnessetId: number;
  Gender: number;
  IsCurrentMk: boolean;
  KnessetsList: number[] | null;
}

// Raw API response from GetMkDetailsContent
export interface MkContentResponse {
  ID: number;
  DateOfBirth: string;
  DeathDate: string | null;
  PlaceOfBirth: string;
  ImmigrationYear: string;
  Residence: string;
  Education: string;
  MilitaryService: string;
  NationalService: string;
  profession: string | null;
  Languages: string;
  Content: string;
  PlenumSeatNumber: string;
  IsCurrentMk: boolean;
  ProfessionsDetails: string;
}

// Raw API response from GetMKImages
export interface MkImageResponse {
  ID: number;
  SpId: number;
  ImageName: string;
  ImagePath: string;
  ImageWidth: string;
  ImageHeight: string;
  ImageTitle: string;
  FolderName: string;
  SiteName: string;
}

// OData KNS_Person response
export interface ODataPerson {
  PersonID: number;
  LastName: string;
  FirstName: string;
  GenderID: number;
  GenderDesc: string;
  Email: string | null;
  IsCurrent: boolean;
  LastUpdatedDate: string;
}

// Transformed MK data (camelCase, cleaned up)
export interface MK {
  id: number;
  name: string;
  fullTitle: string;
  faction: string;
  
  // Contact
  email: string | null;
  workPhone: string | null;
  homePhone: string | null;
  fax: string | null;
  
  // Social Media
  socialLinks: {
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
    youtube: string | null;
    website: string | null;
  };
  
  // Videos
  videoId: string | null;
  
  // Images
  images: {
    profile: string;
    lobby: string;
    banner: string;
    bannerMobile: string;
  };
  
  // Personal Info
  gender: 'male' | 'female' | 'unknown';
  dateOfBirth: string | null;
  deathDate: string | null;
  placeOfBirth: string | null;
  immigrationYear: string | null;
  residence: string | null;
  
  // Background
  education: string | null;
  militaryService: string | null;
  nationalService: string | null;
  profession: string | null;
  languages: string[];
  bio: string | null;
  
  // Knesset Info
  knessetId: number;
  plenumSeatNumber: string | null;
  isCurrentMk: boolean;
  isPresent: boolean;
  position: string | null;
  knessetsList: number[];
  
  // Photos (downloaded)
  photos: MkPhoto[];
  
  // Metadata
  scrapedAt: string;
}

export interface MkPhoto {
  id: number;
  filename: string;
  localPath: string;
  originalUrl: string;
  width: number;
  height: number;
  title: string;
}

// Summary format for quick lookups
export interface MkSummary {
  id: number;
  name: string;
  faction: string;
  isCurrentMk: boolean;
  profileImage: string;
}
