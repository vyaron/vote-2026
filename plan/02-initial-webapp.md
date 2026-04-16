# Knesset 2026 - Web Application Plan

> A modern, visually stunning web application showcasing all 120 Members of the Knesset (MKs) with rich data, beautiful animations, and comprehensive political insights.

> This is a Hebrew first webapp

---

## 🎯 Vision

Create the most comprehensive and visually impressive Israeli parliamentary information platform. The app should feel premium, modern, and engaging - making political data accessible and interesting to citizens.

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14+ (App Router) | SSG for performance, RSC for dynamic content |
| **Language** | TypeScript | Type safety with our scraped data |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, beautiful defaults |
| **Animations** | Framer Motion | Smooth, professional animations |
| **3D/Effects** | Three.js / React Three Fiber | Optional: Knesset building visualization |
| **Charts** | Recharts or Nivo | Data visualizations |
| **Search** | Fuse.js | Client-side fuzzy search |
| **i18n** | next-intl | Hebrew (RTL) + English support |
| **Images** | Next/Image + Blurhash | Optimized loading with placeholders |
| **Hosting** | Vercel | Edge functions, automatic CDN |
| **Analytics** | Plausible/Umami | Privacy-friendly analytics |

---

## 📄 Pages & Routes

### Public Pages

```
/                           # Homepage - Hero + Featured MKs + Party breakdown
/mks                        # All MKs gallery with filters
/mks/[id]                   # Individual MK profile page
/parties                    # All parties overview
/parties/[id]               # Individual party page
/compare                    # Compare MKs side-by-side
/search                     # Global search results
/about                      # About the project
/elections                  # Election info & countdown
```

---

## 🏠 Homepage

### Hero Section
- **Full-viewport hero** with animated Knesset building silhouette
- Floating particle effect in party colors
- **Bold headline**: "הכירו את 120 נבחרי העם" (Meet the 120 Representatives)
- **Search bar** with instant suggestions
- Scroll indicator with smooth animation

### Quick Stats Bar
- Animated counters on scroll-into-view
- 120 MKs | X Parties | X Committees | Days until election

### Featured MKs Carousel
- Large photo cards with hover effects
- Auto-rotating with manual navigation
- Shows: Photo, Name, Party, Position
- Click to expand or navigate to profile

### Party Breakdown Section
- **Interactive donut chart** showing seat distribution
- Hover to highlight party
- Click to filter MKs by party
- Animated seat count badges

### Knesset Plenum Visualization
- **SVG semicircle seating chart**
- Each seat is clickable
- Color-coded by party
- Hover shows MK name & photo tooltip
- Zoom & pan on mobile

### Latest Activity Feed
- Recent committee sessions
- Bills proposed
- Voting highlights

### Footer
- Social links
- Data sources attribution
- Last updated timestamp
- Language toggle (HE/EN)

---

## 👥 MKs Gallery Page (`/mks`)

### Header
- Page title with animated underline
- Total count with faction breakdown mini-chart

### Filter/Sort Bar (Sticky)
- **Search**: Real-time fuzzy search by name
- **Party filter**: Multi-select dropdown with party colors
- **Gender filter**: All / Male / Female
- **Sort**: Name (א-ת) | Party | Seniority | Age
- **View toggle**: Grid / List / Compact

### MK Cards Grid

#### Card Design (Grid View)
```
┌─────────────────────────────┐
│  ┌─────────────────────┐    │
│  │                     │    │
│  │      PHOTO          │    │
│  │   (hover: zoom)     │    │
│  │                     │    │
│  └─────────────────────┘    │
│  ━━━━━ Party Color Bar ━━━━━│
│                             │
│  יולי יואל אדלשטיין         │
│  הליכוד                     │
│  יו"ר ועדה                  │
│                             │
│  [FB] [TW] [Email]          │
└─────────────────────────────┘
```

#### Animations
- **Staggered entrance**: Cards fade in with 50ms delay each
- **Hover**: Scale up 1.02, shadow elevation, photo slight zoom
- **Click**: Ripple effect, navigate with page transition
- **Scroll**: Parallax effect on photos

---

## 👤 MK Profile Page (`/mks/[id]`)

### Hero Section
- **Full-width banner image** (from `images.banner`)
- **Profile photo** overlaid at bottom-left with ring in party color
- **Name & title** with elegant typography
- **Party badge** with logo
- **Current position** highlighted

### Quick Info Bar
- Birth date & age
- Place of birth → Immigration year
- Residence
- Languages (with flags)
- Social media links (animated icons)

### Tab Navigation
- **Overview** | **Biography** | **Gallery** | **Activity** | **Contact**

### Overview Tab
- Summary stats cards (committees, years in Knesset, etc.)
- Party affiliation history timeline
- Current committees list
- Quick bio excerpt

### Biography Tab
- Full bio with proper formatting
- Expandable sections
- Timeline of political career
- Education & military service

### Gallery Tab
- **Masonry photo grid**
- Lightbox on click with captions
- Swipe navigation
- Download option
- Filter by year/event

### Activity Tab (Future)
- Voting record visualization
- Bills proposed/supported
- Committee attendance
- Speeches/quotes

### Contact Tab
- Email (click to copy)
- Phone numbers
- Office location
- Social media cards

### Related MKs Section
- Same party members
- Same committee members
- "You might also be interested in" based on similar profiles

---

## 🏛️ Party Page (`/parties/[id]`)

### Hero
- **Party logo** (large)
- **Party name** in party colors
- **Seat count** with animated badge
- **Founded date** | **Current leader**

### Members Grid
- All party MKs in card format
- Option to sort by seniority/position

### Party Stats
- Gender breakdown (pie chart)
- Age distribution (bar chart)
- Geographic spread (map)
- Committee representation

### History Timeline
- Key party events
- Leadership changes
- Election results over time

### Ideology Section (Manual data)
- Political spectrum position
- Key policy positions
- Notable legislation

---

## 🔍 Compare Page (`/compare`)

### MK Selector
- Two searchable dropdowns
- Recent comparisons history

### Comparison View
```
┌─────────────────┬─────────────────┐
│     MK 1        │      MK 2       │
├─────────────────┼─────────────────┤
│     Photo       │      Photo      │
│     Name        │      Name       │
│     Party       │      Party      │
├─────────────────┼─────────────────┤
│ Age: 65         │ Age: 45         │
│ Since: 2003     │ Since: 2019     │
│ Committees: 3   │ Committees: 2   │
└─────────────────┴─────────────────┘
```

### Radar Chart
- Compare across multiple dimensions
- Animated transitions when changing MKs

---

## 🎨 Design System

### Colors
```css
/* Primary - Deep Blue (Knesset official) */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-900: #1e3a5f;

/* Accent - Gold */
--accent-400: #fbbf24;
--accent-500: #f59e0b;

/* Party Colors (examples) */
--likud: #1e40af;
--yesh-atid: #f97316;
--labor: #dc2626;
--shas: #1f2937;
/* ... all parties */
```

### Typography
- **Hebrew**: Heebo / Assistant / Rubik
- **English**: Inter / Plus Jakarta Sans
- **Headlines**: Bold, large, dramatic
- **Body**: Clean, readable

### Spacing & Layout
- 8px base grid
- Max-width container: 1280px
- Generous whitespace
- RTL-first design

### Components
- Cards with consistent shadows
- Buttons with hover states
- Badges with party colors
- Tooltips with smooth transitions
- Modals with backdrop blur
- Toast notifications

---

## ✨ Animations & Micro-interactions

### Page Transitions
- Fade + slide for navigation
- Shared element transitions (photo from card to profile)

### Scroll Effects
- Parallax on hero sections
- Fade-in on scroll for cards
- Counter animations on stats
- Progress indicator in header

### Hover Effects
- Card elevation with shadow
- Photo zoom with slight rotation
- Button scale and glow
- Social icons bounce

### Loading States
- Skeleton placeholders matching layout
- Shimmer effect on skeletons
- Spinner for actions
- Progress bar for page loads

### Celebration Effects
- Confetti on election day
- Particle effects for featured content

---

## 📱 Responsive Design

### Breakpoints
```
sm: 640px    # Small phones
md: 768px    # Tablets
lg: 1024px   # Small laptops
xl: 1280px   # Desktop
2xl: 1536px  # Large screens
```

### Mobile Adaptations
- Bottom navigation bar
- Swipeable carousels
- Collapsible filter drawer
- Touch-friendly card sizes
- Reduced animation complexity

---

## 🌐 Internationalization

### Languages
- **Hebrew (default)** - RTL layout
- **English** - LTR layout
- **Arabic** (future) - RTL layout
- **Russian** (future) - LTR layout

### Implementation
- next-intl for routing and translations
- Automatic RTL/LTR switching
- Date formatting per locale
- Number formatting

---

## 📊 Data Architecture

### Static Generation
- All MK pages pre-rendered at build time
- Incremental Static Regeneration for updates
- JSON data embedded in page bundles

### Data Files
```
/public/data/
  ├── mks/
  │   ├── index.json      # All MKs summary
  │   └── [id].json       # Individual MK data
  ├── parties/
  │   ├── index.json      # All parties
  │   └── [id].json       # Party detail
  └── meta.json           # Last updated, stats
```

### Image Optimization
- Convert all photos to WebP
- Generate multiple sizes (thumbnail, medium, large)
- Generate blur placeholders
- Lazy load below-fold images

---

## 🚀 Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 95 |
| First Contentful Paint | < 1.2s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3s |
| Cumulative Layout Shift | < 0.1 |
| Bundle Size (initial) | < 150kb |

### Optimizations
- Route-based code splitting
- Dynamic imports for heavy components
- Image optimization with Next/Image
- Font subsetting for Hebrew
- Service worker for offline support

---

## 📋 Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (Next.js, Tailwind, TypeScript)
- [ ] Design system & component library
- [ ] Data layer & types
- [ ] Basic routing structure
- [ ] RTL support setup

### Phase 2: Core Pages (Week 3-4)
- [ ] Homepage with hero & stats
- [ ] MKs gallery with filters
- [ ] MK profile page (all tabs)
- [ ] Search functionality

### Phase 3: Party & Compare (Week 5)
- [ ] Parties overview page
- [ ] Individual party pages
- [ ] Compare MKs feature
- [ ] Committees pages

### Phase 4: Polish & Animations (Week 6)
- [ ] Page transitions
- [ ] Scroll animations
- [ ] Micro-interactions
- [ ] Loading states
- [ ] Error boundaries

### Phase 5: Optimization & Launch (Week 7)
- [ ] Performance optimization
- [ ] SEO metadata
- [ ] Social sharing cards
- [ ] Analytics setup
- [ ] Production deployment

### Phase 6: Future Enhancements
- [ ] Voting record integration
- [ ] Bills tracking
- [ ] News integration
- [ ] Election countdown
- [ ] Poll aggregation
- [ ] Push notifications

---

## 🔒 SEO & Social

### Meta Tags
- Dynamic OG images for each MK
- Twitter cards
- Structured data (Person, Organization)
- Sitemap generation
- robots.txt

### Social Sharing
- Share buttons on profiles
- WhatsApp integration
- Copy link functionality
- QR code generation

---

## 📁 Project Structure

```
webapp/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              # Homepage
│   │   ├── mks/
│   │   │   ├── page.tsx          # MKs gallery
│   │   │   └── [id]/page.tsx     # MK profile
│   │   ├── parties/
│   │   │   ├── page.tsx          # Parties list
│   │   │   └── [id]/page.tsx     # Party page
│   │   ├── compare/page.tsx      # Compare tool
│   │   └── search/page.tsx       # Search results
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn components
│   ├── mks/                      # MK-specific components
│   ├── parties/                  # Party components
│   ├── charts/                   # Visualization components
│   └── layout/                   # Layout components
├── lib/
│   ├── data.ts                   # Data fetching utilities
│   ├── utils.ts                  # Helper functions
│   └── constants.ts              # App constants
├── types/
│   └── index.ts                  # TypeScript types
├── public/
│   ├── data/                     # JSON data files
│   ├── images/                   # Static images
│   └── photos/                   # MK photos
├── messages/
│   ├── he.json                   # Hebrew translations
│   └── en.json                   # English translations
└── tailwind.config.ts
```

---

## 🎨 Key Visual References

### Inspiration Sites
- Apple product pages (hero animations)
- Linear.app (smooth transitions)
- Stripe (micro-interactions)
- gov.il (Israeli government style)
- Knesset.gov.il (official reference)

### Design Mood
- **Professional** but not boring
- **Modern** with subtle Israeli motifs
- **Accessible** to all users
- **Fast** and responsive
- **Trustworthy** data presentation

---

## ✅ Success Metrics

- **Engagement**: Average session > 3 minutes
- **Pages/Session**: > 5 pages viewed
- **Bounce Rate**: < 40%
- **Mobile Usage**: > 60% (Israel mobile-first)
- **Share Rate**: Track social shares
- **Return Visitors**: > 30%

---

*Last Updated: April 16, 2026*
