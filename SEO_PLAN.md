# SEO Plan for Jobhi

## Executive Summary
Comprehensive SEO strategy for Jobhi - a homemade meal ordering platform serving Brussels, Belgium with pickup-only service. Multi-language support (EN, NL, FR).

---

## 1. Technical SEO ✅ (Mostly Complete)

### Current Status:
- ✅ Next.js 16 with App Router
- ✅ Metadata API implementation
- ✅ Robots.txt configured
- ✅ Sitemap exists
- ✅ Canonical URLs
- ✅ hreflang tags for multi-language
- ✅ Structured data (Organization, Product, Breadcrumb)
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Performance optimized

### Improvements Needed:
- [ ] **Verify sitemap includes all pages** (dishes, categories, static pages)
- [ ] **Add LocalBusiness schema** (critical for Brussels pickup location)
- [ ] **Add FoodEstablishment schema** (restaurant/food service)
- [ ] **Add FAQ schema** (if FAQ page exists)
- [ ] **Add Review/Rating schema** (if reviews exist)
- [ ] **Verify all images have alt text**
- [ ] **Add image sitemap** (for dish images)

---

## 2. On-Page SEO

### Homepage
**Current:**
- Title: "Jobhi - Delicious Homemade Meals"
- Description: Mentions pickup in Brussels ✅

**Improvements:**
- [ ] Add location-specific keywords: "Brussels", "Belgium", "homemade meals Brussels"
- [ ] Include primary keyword in H1
- [ ] Add internal links to menu categories
- [ ] Add local business information (address, hours)

### Menu Pages
**Current:**
- Dynamic metadata per dish ✅
- Product schema ✅
- Breadcrumbs ✅

**Improvements:**
- [ ] Add category pages with metadata
- [ ] Add menu collection schema
- [ ] Optimize dish descriptions (currently concise, good)
- [ ] Add nutritional information schema (if available)
- [ ] Add allergen information prominently

### Category Pages
**Needed:**
- [ ] Create category landing pages (`/menu/starters`, `/menu/main-courses`, etc.)
- [ ] Category-specific metadata
- [ ] Category descriptions
- [ ] Collection schema for categories

---

## 3. Local SEO (Critical for Brussels)

### Current Gaps:
- [ ] **LocalBusiness Schema** - Add complete business information:
  - Address (pickup location)
  - Opening hours
  - Phone number
  - Service area (Brussels)
  - Price range
  - Accepts reservations (pickup orders)

- [ ] **Google Business Profile** - Create and verify
- [ ] **Local Keywords**:
  - "homemade meals Brussels"
  - "pickup meals Brussels"
  - "Pakistani food Brussels" (if applicable)
  - "Indian food Brussels" (if applicable)
  - "meal prep Brussels"

- [ ] **Location Pages** (if multiple pickup points):
  - [ ] Create location-specific pages
  - [ ] Location-specific metadata

---

## 4. Content SEO

### Blog/Content Strategy
- [ ] **Recipe blog** - Share cooking tips, ingredient stories
- [ ] **About ingredients** - Local sourcing, quality
- [ ] **Cuisine education** - Pakistani/Indian food culture
- [ ] **Nutritional content** - Health benefits, dietary info
- [ ] **Seasonal menus** - Holiday specials, seasonal dishes

### Internal Linking
- [ ] Link related dishes together
- [ ] Link from homepage to popular categories
- [ ] Link from about page to menu
- [ ] Add "Related dishes" section

---

## 5. Structured Data (Schema.org)

### Currently Implemented:
- ✅ Organization
- ✅ Product
- ✅ BreadcrumbList

### To Add:
- [ ] **LocalBusiness** (highest priority)
  ```json
  {
    "@type": "LocalBusiness",
    "name": "Jobhi",
    "image": "...",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Brussels",
      "addressCountry": "BE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "...",
      "longitude": "..."
    },
    "openingHoursSpecification": [...],
    "priceRange": "€€",
    "servesCuisine": ["Pakistani", "Indian"],
    "acceptsReservations": false
  }
  ```

- [ ] **FoodEstablishment**
- [ ] **Menu** (for menu page)
- [ ] **MenuItem** (enhanced product schema)
- [ ] **AggregateRating** (if reviews exist)
- [ ] **FAQPage** (if FAQ exists)
- [ ] **HowTo** (for ordering process)

---

## 6. Keyword Strategy

### Primary Keywords:
- "homemade meals Brussels"
- "pickup meals Brussels"
- "order food online Brussels"
- "Pakistani food Brussels" (if applicable)
- "Indian food Brussels" (if applicable)
- "meal prep Brussels"
- "fresh meals Brussels"

### Long-tail Keywords:
- "order homemade meals for pickup Brussels"
- "fresh Pakistani food pickup Brussels"
- "healthy meal prep Brussels"
- "order food 48 hours in advance Brussels"

### Category Keywords:
- "starters Brussels"
- "main courses Brussels"
- "desserts Brussels"
- [Category name] + "Brussels"

---

## 7. Image SEO

### Current:
- ✅ Images use Next.js Image component
- ✅ Lazy loading implemented

### Improvements:
- [ ] **Alt text optimization**:
  - Descriptive alt text for all dish images
  - Include dish name and key ingredients
  - Example: "Chicken Biryani - aromatic basmati rice with tender chicken and spices"

- [ ] **Image file names**:
  - Use descriptive names: `chicken-biryani-brussels.jpg`
  - Include keywords naturally

- [ ] **Image sitemap**:
  - Generate sitemap for all dish images
  - Helps with Google Images ranking

---

## 8. International SEO (Multi-language)

### Current:
- ✅ hreflang tags implemented
- ✅ Language-specific metadata
- ✅ Separate URLs per language

### Improvements:
- [ ] **Verify hreflang implementation**:
  - Check all pages have correct hreflang
  - Include x-default

- [ ] **Language-specific keywords**:
  - Dutch: "zelfgemaakte maaltijden Brussel"
  - French: "plats faits maison Bruxelles"

- [ ] **Local content**:
  - Ensure translations are natural, not just literal
  - Use local terminology

---

## 9. Performance & Core Web Vitals

### Current:
- ✅ Performance optimized
- ✅ Image optimization
- ✅ Code splitting
- ✅ Caching headers

### Monitor:
- [ ] **LCP (Largest Contentful Paint)** - Target: < 2.5s
- [ ] **FID (First Input Delay)** - Target: < 100ms
- [ ] **CLS (Cumulative Layout Shift)** - Target: < 0.1
- [ ] **TTFB (Time to First Byte)** - Target: < 800ms

---

## 10. Link Building Strategy

### Local Citations:
- [ ] **Brussels business directories**
- [ ] **Food delivery platforms** (even if pickup-only, for visibility)
- [ ] **Local food blogs**
- [ ] **Belgium restaurant directories**

### Content Marketing:
- [ ] **Guest posts** on food blogs
- [ ] **Social media** (Instagram, Facebook)
- [ ] **Local partnerships** (food events, markets)

---

## 11. Analytics & Monitoring

### Setup:
- [ ] **Google Search Console** - Verify and monitor
- [ ] **Google Analytics 4** - Track conversions
- [ ] **Bing Webmaster Tools** - For Bing search
- [ ] **Monitor rankings** - Track keyword positions
- [ ] **Track conversions** - Order completions, menu views

### Key Metrics:
- Organic traffic
- Keyword rankings
- Click-through rate (CTR)
- Conversion rate
- Bounce rate
- Pages per session

---

## 12. Mobile SEO

### Current:
- ✅ Responsive design
- ✅ Mobile-friendly

### Verify:
- [ ] **Mobile-first indexing** - Ensure mobile version is complete
- [ ] **Mobile page speed** - Test on mobile devices
- [ ] **Touch targets** - Ensure buttons are easily tappable
- [ ] **Mobile menu** - Easy navigation

---

## 13. Competitive Analysis

### Research:
- [ ] **Identify competitors** in Brussels food space
- [ ] **Analyze their SEO** - Keywords, backlinks, content
- [ ] **Find gaps** - What they're missing
- [ ] **Differentiate** - Emphasize pickup-only, homemade, quality

---

## 14. Implementation Priority

### Phase 1 (Immediate - High Impact):
1. ✅ Remove delivery references (DONE)
2. Add LocalBusiness schema
3. Optimize dish image alt text
4. Create category landing pages
5. Verify sitemap completeness

### Phase 2 (Short-term):
1. Add FAQ schema
2. Create blog/content section
3. Optimize internal linking
4. Set up Google Search Console
5. Add location-specific content

### Phase 3 (Long-term):
1. Content marketing strategy
2. Link building campaign
3. Review/rating system
4. Seasonal content
5. Local partnerships

---

## 15. Quick Wins

1. **Add LocalBusiness schema** - Immediate local SEO boost
2. **Optimize alt text** - Easy, high impact
3. **Category pages** - More indexable pages
4. **Internal linking** - Better site structure
5. **Google Business Profile** - Free local visibility

---

## 16. Tools & Resources

### Recommended Tools:
- Google Search Console
- Google Analytics 4
- Google Business Profile
- Ahrefs / SEMrush (for keyword research)
- PageSpeed Insights
- Schema.org validator
- Rich Results Test

---

## Success Metrics

### 3 Months:
- 50+ indexed pages
- Top 20 rankings for 5+ primary keywords
- 1000+ monthly organic visitors

### 6 Months:
- Top 10 rankings for 10+ keywords
- 5000+ monthly organic visitors
- 5%+ conversion rate from organic traffic

### 12 Months:
- Top 5 rankings for primary keywords
- 10,000+ monthly organic visitors
- Established local presence in Brussels

---

## Notes

- Focus on **local SEO** (Brussels) as primary strategy
- **Pickup-only** is a differentiator - emphasize convenience
- **Multi-language** (EN/NL/FR) expands reach in Brussels
- **Quality over quantity** - Better to rank for fewer, high-intent keywords
- **User experience** = SEO - Fast, mobile-friendly, easy to order

