# Israel 2026 Elections Website

## Overview
Creating a website about the 2026 elections in Israel.

---

## Phase 1: Data Collection (Scraping)

### Goals
- Scrape all current Knesset members info
- Create a JSON file for each MK (in camelCase)
- Download and organize member photos

### Data Source
**Main page:** https://main.knesset.gov.il/mk/apps/mklobby/main/current-knesset-mks/all-current-mks

### API Endpoints Identified

```
GET https://www.knesset.gov.il/WebSiteApi/knessetapi/MKs/GetMkdetailsHeader?mkId=876&languageKey=he
GET https://www.knesset.gov.il/WebSiteApi/knessetapi/MKs/GetMkDetailsContent?mkId=876&languageKey=he
```

**Images:**
```
POST https://www.knesset.gov.il/WebSiteApi/knessetapi/SpList/GetMKImages/
Payload: {
    "RelativeSiteUrl": "mk",
    "Folder": "MKPersonalDetailsImages",
    "ObjectId": "876"
}
```

### Proposed Folder Structure
```
elect-2026/
├── scraper/
│   ├── src/
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── utils.ts
│   └── package.json
├── data/
│   ├── mks/
│   │   ├── 876.json
│   │   ├── 877.json
│   │   └── ...
│   ├── photos/
│   │   ├── 876/
│   │   │   ├── profile.jpg
│   │   │   └── ...
│   │   └── ...
│   └── parties/
│       └── index.json
└── plan/
```

---

## ✅ Decisions Made

| Topic | Decision |
|-------|----------|
| MK List Source | Scrape from main page HTML |
| Language | Hebrew only (Phase 1) |
| Data Scope | Everything available |
| Party Data | Yes, include party-level data |
| Historical Data | Yes, all available Knessets |
| Update Frequency | Weekly, manual |
| Rate Limiting | Add delays (500-1000ms) to be safe |
| Error Handling | Skip failed MKs and log errors |
| Website Stack | Next.js + Tailwind + Vercel (Phase 2) |
| Target Audience | General public |

---

## Phase 1A: Scraper Implementation Plan

### Tech Stack for Scraper
- **Runtime:** Node.js with TypeScript
- **HTTP Client:** `axios` or `node-fetch`
- **HTML Parsing:** `cheerio` (for scraping the main page)
- **File System:** Native `fs/promises`
- **Logging:** `winston` or simple console with timestamps

### Scraper Modules

```
scraper/
├── src/
│   ├── index.ts              # Main entry point, orchestrates scraping
│   ├── config.ts             # API URLs, delays, output paths
│   ├── api/
│   │   ├── mkList.ts         # Scrape MK list from main page
│   │   ├── mkDetails.ts      # Fetch header + content for each MK
│   │   ├── mkImages.ts       # Download MK photos
│   │   ├── parties.ts        # Fetch party/faction data
│   │   └── historical.ts     # Fetch previous Knesset data
│   ├── utils/
│   │   ├── httpClient.ts     # Axios instance with retry/delay
│   │   ├── fileWriter.ts     # Save JSON files
│   │   └── logger.ts         # Logging utility
│   └── types/
│       ├── mk.ts             # MK TypeScript interfaces
│       └── party.ts          # Party TypeScript interfaces
├── package.json
├── tsconfig.json
└── .env                      # (optional) config overrides
```

### Scraping Flow

```
1. Scrape main page → Extract all MK IDs + basic info
                          ↓
2. For each MK ID:
   ├─→ GET /GetMkdetailsHeader?mkId=X
   ├─→ GET /GetMkDetailsContent?mkId=X  
   ├─→ POST /GetMKImages (download photos)
   └─→ Wait 500-1000ms (rate limiting)
                          ↓
3. Aggregate party data from MK records
                          ↓
4. Save all data to /data/ folder
```

### Expected JSON Schema (Draft)

```typescript
// types/mk.ts
interface MK {
  id: number;
  name: string;
  nameEn?: string;
  partyId: number;
  partyName: string;
  imageUrl: string;
  localImagePath: string;
  birthDate?: string;
  birthPlace?: string;
  residence?: string;
  email?: string;
  phone?: string;
  committees: Committee[];
  bills: Bill[];
  socialLinks: SocialLinks;
  bio: string;
  knessetNumber: number;
  isCurrentMK: boolean;
  // ... more fields based on API response
}
```

---

## ❓ FOLLOW-UP QUESTIONS

### Q12: API Discovery - Need to Explore
> I need to actually call the Knesset APIs to see what data they return. 
> Should I:
> - **Option A:** Create a small test script first to explore the API responses, then finalize the schema
> - **Option B:** Start building the full scraper and adapt as we go

**Your answer:**
A
---

### Q13: Historical Knessets - Scope
> You said "yes, anything" for historical data. The Knesset has existed since 1949 (1st Knesset).
> How far back do you want to go?
> - Current Knesset only (26th)
> - Last 5 Knessets (22nd-26th, ~2019-2026)
> - All Knessets since 1949 (thousands of MKs)
> - Other: ___________

**Your answer:**
Last 7 Knessets

---

### Q14: Additional Data Sources
> The Knesset has an official Open Data portal: https://knesset.gov.il/Odata/ParliamentInfo.svc/
> This might have voting records, bills, etc. Should I explore this as well?

**Your answer:**
YES

---

### Q15: Data Output Format
> Besides individual JSON files per MK, do you also want:
> - [ ] A combined `all-mks.json` with all MKs in one file
> - [X] A `summary.json` with just names/IDs/parties for quick lookups
> - [ ] CSV exports for spreadsheet analysis
> - [ ] SQLite database file

**Your answer:**

---

### Q16: Photos - Quality/Size
> For MK photos, do you want:
> - All available resolutions (might be multiple per MK)
> X Only the highest resolution
> - Only a standard "profile" size
> - Resize/optimize for web (specify max dimensions)

**Your answer:**

---

### Q17: Parties API
> Do you know if there's a specific API endpoint for party data, or should I extract it from MK records?
> (I can explore the network requests on the Knesset site to find this)

**Your answer:**
No

---

## Phase 2: Website (Future - After Data Collection)

### Planned Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Data:** Static JSON files or API routes reading from JSON

### Planned Features
- MK profiles/cards with photos
- Party comparison and breakdown
- Search/filter MKs by name, party, committee
- Voting record visualization
- Election predictions/polls integration
- News integration

---

## Next Steps

### ✅ COMPLETED: API Exploration (Phase 1A Step 3)

**Exploration ran on:** April 15, 2026

---

## 📊 API EXPLORATION FINDINGS

### Working Endpoints

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GetMkdetailsHeader` | ✅ 200 | Full header info for MK |
| `GetMkDetailsContent` | ✅ 200 | Biography, education, etc. |
| `GetMKImages` | ✅ 200 | Multiple photos per MK |
| `OData - KNS_Person` | ✅ 200 | Person records with `IsCurrent` flag |
| `OData - KNS_Faction` | ✅ 200 | Party data with Knesset number |
| `OData - KNS_Committee` | ✅ 200 | Committee data |
| `OData - KNS_Bill` | ✅ 200 | Bill/legislation data |

### Failed/Unavailable

| Endpoint | Status | Notes |
|----------|--------|-------|
| Main page HTML scraping | ⚠️ | No MK IDs in HTML (loaded via JS) |
| `OData - KNS_MK` | ❌ 404 | Entity doesn't exist |
| `OData - KNS_Vote` | ❌ 404 | Entity doesn't exist |
| `GetAllMks`, `GetCurrentMks` | ❌ 400 | Endpoints don't exist |

---

### Sample Data Retrieved

**GetMkdetailsHeader (MK ID 876 - Mickey Levy):**
```json
{
  "ID": 876,
  "Name": "מיקי לוי",
  "Faction": "יש עתיד",
  "Email": "mickeylevy@knesset.gov.il",
  "mk_work_phone": "8187",
  "Facebook": "http://www.facebook.com/LevyYeshAtid",
  "Twitter": "https://twitter.com/MKMickeyLevy",
  "Instagram": "https://www.instagram.com/mkmickeylevy/",
  "Youtube": "...",
  "MkImage": "https://fs.knesset.gov.il/globaldocs/MK/876/...",
  "Gender": 1,
  "IsCurrentMk": true,
  "KnessetId": 25
}
```

**GetMkDetailsContent:**
```json
{
  "DateOfBirth": "21/06/1951",
  "PlaceOfBirth": "ירושלים, ישראל",
  "Residence": "מבשרת ציון",
  "Education": "BA, MA",
  "MilitaryService": "רס\"ן",
  "Languages": "אנגלית",
  "Content": "Full biography text...",
  "PlenumSeatNumber": "37"
}
```

**GetMKImages:** Returns 26 photos with dimensions (750x500 to 6000x4000)

---

### OData Entities Available

From the OData root, these entities are available:
- `KNS_Person` - People (MKs and others)
- `KNS_PersonToPosition` - Position assignments
- `KNS_Faction` - Parties/factions with Knesset number
- `KNS_Committee` - Committees
- `KNS_Bill` - Bills and legislation
- `KNS_KnessetDates` - Knesset term dates
- `KNS_Agenda` - Agenda items
- `KNS_PlenumSession` - Plenum session data
- `KNS_Query` - Parliamentary queries
- And many more...

---

## 🔑 KEY INSIGHT: How to Get All MK IDs

The main page loads MKs via JavaScript, not in HTML. 

**Recommended approach:**
1. Use `KNS_Person` with `IsCurrent=true` filter to get current MKs
2. OR use `KNS_PersonToPosition` to find people with MK positions
3. The PersonID from OData maps to mkId in the WebSiteApi

**OData endpoint:**
```
https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Person?$filter=IsCurrent eq true
```

---

## ❓ NEXT STEP QUESTIONS

### Q18: Ready to Build Full Scraper?
> Now that we understand the APIs, should I:
> - **Option A:** Build the full scraper now (fetch all MKs, photos, parties)
> - **Option B:** First test fetching the MK list from KNS_Person
> - **Option C:** Something else?

**Your answer:**
A

---

### Q19: Which Data to Prioritize First?
> What should we scrape first?
> - [ ] Current Knesset MKs only (120 members)
> - [ ] All 7 Knessets of MKs (~500-700 records)
> - [ ] Bills and legislation
> - [ ] Committee data
> - [X] Everything at once

**Your answer:**

Create a script with various steps


---

### Q20: Photo Strategy
> Found 26 photos for one MK. For storage efficiency:
> - Download ALL photos for each MK (can be 20-30+ per person)
> - Download only the main profile image (MkImage from header)
> - Download top 5 photos only

**Your answer:**
All photos

---

### Immediate (Phase 1A)
1. [x] Answer follow-up questions above
2. [x] Create initial scraper project structure
3. [x] Write test script to explore API responses
4. [x] Finalize JSON schema based on actual data
5. [x] Implement full scraper with all modules
6. [~] **← YOU ARE HERE** Run initial scrape and validate data quality
7. [ ] Document any API quirks or edge cases

### Scraper Status (Updated)
**Discovery Complete:**
- ✅ Scanned MK ID range 1-1200
- ✅ Found **974 valid MK IDs** (saved to `data/discovered-mk-ids.json`)
- ✅ Saved **159 MK detail files** before hitting rate limits

**Rate Limiting Issue:**
- Knesset API returns HTTP 481 after ~160 rapid requests
- Current delay: 750ms between requests
- May need to increase delay or add longer pauses

**To Resume Scraping:**
```bash
cd scraper
npm run scrape:resume   # Continues from where it stopped
```

**Next Steps:**
1. Resume MK details (815 remaining)
2. Download photos for all MKs
3. Fetch party/committee/bill data from OData

### Later (Phase 1B - Historical)
8. [x] Research historical data availability (OData has all Knessets)
9. [x] Extend scraper for previous Knessets (range scan covers all)
10. [ ] Handle data format differences across eras

### Phase 2 (Website)
11. [ ] Set up Next.js project
12. [ ] Design component library
13. [ ] Build core pages
14. [ ] Deploy to Vercel



[...document.querySelectorAll('a[href*="/mk/apps/mk/mk-personal-details/"]')].map(a => a.href.split('/').pop())

[
    "1029",
    "1",
    "953",
    "970",
    "1116",
    "1093",
    "860",
    "1096",
    "768",
    "1008",
    "861",
    "1126",
    "1039",
    "1088",
    "1094",
    "1055",
    "1003",
    "914",
    "1095",
    "1049",
    "915",
    "1022",
    "1056",
    "1129",
    "906",
    "974",
    "1125",
    "1098",
    "1099",
    "1002",
    "981",
    "723",
    "988",
    "35",
    "1085",
    "771",
    "1059",
    "1100",
    "1101",
    "41",
    "1044",
    "950",
    "1045",
    "1060",
    "1102",
    "1032",
    "1103",
    "854",
    "1026",
    "872",
    "1050",
    "208",
    "1043",
    "1090",
    "996",
    "1000",
    "874",
    "1006",
    "1013",
    "976",
    "69",
    "1061",
    "998",
    "1127",
    "876",
    "826",
    "1082",
    "214",
    "878",
    "1076",
    "881",
    "1118",
    "1115",
    "1105",
    "956",
    "957",
    "1122",
    "1063",
    "814",
    "751",
    "1106",
    "90",
    "995",
    "994",
    "1121",
    "1107",
    "1108",
    "977",
    "884",
    "1109",
    "1007",
    "1128",
    "938",
    "1130",
    "992",
    "837",
    "1110",
    "951",
    "1001",
    "1124",
    "103",
    "1079",
    "978",
    "1091",
    "987",
    "1114",
    "1066",
    "1011",
    "1111",
    "1067",
    "1048",
    "1068",
    "982",
    "1018",
    "899",
    "1004",
    "1112",
    "1123",
    "948",
    "905"
]

