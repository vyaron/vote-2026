/**
 * TypeScript types for Faction/Party data
 */

// OData KNS_Faction response
export interface ODataFaction {
  FactionID: number;
  Name: string;
  KnessetNum: number;
  StartDate: string;
  FinishDate: string | null;
  IsCurrent: boolean;
  LastUpdatedDate: string;
}

// OData KNS_Committee response
export interface ODataCommittee {
  CommitteeID: number;
  Name: string;
  CategoryID: number;
  CategoryDesc: string;
  KnessetNum: number;
  CommitteeTypeID: number;
  CommitteeTypeDesc: string;
  Email: string | null;
  StartDate: string;
  FinishDate: string | null;
  AdditionalTypeID: number;
  AdditionalTypeDesc: string;
  ParentCommitteeID: number | null;
  CommitteeParentName: string | null;
  IsCurrent: boolean;
  LastUpdatedDate: string;
}

// OData KNS_Bill response
export interface ODataBill {
  BillID: number;
  KnessetNum: number;
  Name: string;
  SubTypeID: number;
  SubTypeDesc: string;
  PrivateNumber: number | null;
  CommitteeID: number;
  StatusID: number;
  Number: number | null;
  PostponementReasonID: number | null;
  PostponementReasonDesc: string | null;
  PublicationDate: string;
  MagazineNumber: number;
  PageNumber: number;
  IsContinuationBill: boolean | null;
  SummaryLaw: string | null;
  PublicationSeriesID: number;
  PublicationSeriesDesc: string;
  PublicationSeriesFirstCall: string | null;
  LastUpdatedDate: string;
}

// OData KNS_PersonToPosition (for MK positions)
export interface ODataPersonToPosition {
  PersonToPositionID: number;
  PersonID: number;
  PositionID: number;
  KnessetNum: number;
  GovMinistryID: number | null;
  GovMinistryName: string | null;
  DutyDesc: string | null;
  FactionID: number | null;
  FactionName: string | null;
  GovernmentNum: number | null;
  CommitteeID: number | null;
  CommitteeName: string | null;
  StartDate: string;
  FinishDate: string | null;
  IsCurrent: boolean;
  LastUpdatedDate: string;
}

// Transformed Party data
export interface Party {
  id: number;
  name: string;
  knessetNum: number;
  startDate: string;
  finishDate: string | null;
  isCurrent: boolean;
  members: number[]; // MK IDs
  scrapedAt: string;
}

// Transformed Committee data
export interface Committee {
  id: number;
  name: string;
  category: string;
  type: string;
  knessetNum: number;
  email: string | null;
  isCurrent: boolean;
  parentCommitteeId: number | null;
  scrapedAt: string;
}

// Transformed Bill data
export interface Bill {
  id: number;
  name: string;
  knessetNum: number;
  type: string;
  committeeId: number;
  status: number;
  publicationDate: string;
  scrapedAt: string;
}

// OData response wrapper
export interface ODataResponse<T> {
  'odata.metadata': string;
  value: T[];
  'odata.nextLink'?: string;
}
