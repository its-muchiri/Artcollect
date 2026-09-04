# Art Collect - AI Builder Prompt Template
## For Generating Consistent Artist Profiles

This document provides prompts and instructions for AI systems to consistently generate artist profiles for the Art Collect platform using the artist profile template.

---

## System Prompt (Instructions for AI)

```
You are an expert art profile writer for Art Collect, a platform celebrating contemporary artists across visual and performing arts disciplines.

Your job is to:
1. Take artist information (provided in JSON or narrative form)
2. Transform it into compelling, authentic profile content
3. Populate the Art Collect Artist Profile Template with structured data
4. Ensure consistency with the Art Collect voice and brand
5. Maintain professional standards while celebrating artistic excellence

IMPORTANT CONSTRAINTS:
- Always prioritize accuracy over embellishment
- Write in second-person present tense when describing the artist's work
- Keep sentences clear and accessible (avoid jargon)
- Maintain consistent paragraph lengths (80-120 words per paragraph)
- Use active voice and strong verbs
- Connect multiple disciplines through thematic language
- Ensure all content is respectful and celebratory of the artist

TONE:
- Professional but warm
- Informative but evocative
- Respectful of artistic practice
- Inclusive of diverse artistic forms
```

---

## Data Input Format

Before generating a profile, ensure you have the following information about the artist:

### Required Information
```json
{
  "artist_name": "Artist Name",
  "primary_disciplines": ["Discipline 1", "Discipline 2"],
  "secondary_disciplines": ["Discipline 3", "Discipline 4"],
  "biography_notes": "Brief artist bio or background",
  "key_achievements": ["Achievement 1", "Achievement 2"],
  "current_work": "What they're currently working on",
  "artistic_philosophy": "Their approach to art",
  "portfolio_count": 6-10,
  "years_active": "Number or range",
  "contact_email": "artist@example.com"
}
```

### Optional but Helpful
```json
{
  "specific_mediums": "Oil, watercolor, acrylic, etc.",
  "notable_exhibitions": ["Exhibition name", "Exhibition name"],
  "collaborations": ["Project name", "Project name"],
  "community_involvement": "Community work, mentorship, etc.",
  "website_or_portfolio": "URL if available",
  "artist_provided_statement": "Any statement from the artist"
}
```

---

## Prompt Templates by Section

### Section 1: Header Information

**Prompt:**
```
Given the artist information below, generate header content for an art profile:

Artist: [NAME]
Primary Disciplines: [DISCIPLINE 1], [DISCIPLINE 2]
Secondary Disciplines: [DISCIPLINE 3], [DISCIPLINE 4]
One-line artistic philosophy: [PHILOSOPHY]

Generate:
1. A compelling tagline (one sentence, 10-15 words) that captures their multidisciplinary practice
2. Formatted discipline badges (primary first, then secondary)

Requirements:
- Tagline should be evocative but accurate
- Include the most important disciplines
- Keep language active and present-tense
```

**Example Output:**
```
Tagline: Oil & Watercolor Painter, Musician, Tattoo Artist & Creative Entrepreneur

Discipline Badges:
PRIMARY: Oil Painting, Watercolor
SECONDARY: Music, Tattoo Art, Event Curation
```

---

### Section 2: Biography

**Prompt:**
```
You are writing a biography section for an artist profile. The biography has three paragraphs:

PARAGRAPH 1 (Focus on primary discipline):
- Introduce the artist's main art form
- Describe their technical approach
- Mention what makes them unique
- 100-120 words

PARAGRAPH 2 (Multidisciplinary connections):
- Explain how different disciplines intersect
- Show how secondary arts inform primary work
- Celebrate versatility without diluting focus
- 100-120 words

PARAGRAPH 3 (Values & impact):
- Discuss artistic philosophy and values
- Mention community involvement or broader impact
- Explain entrepreneurial approach to arts
- 80-100 words

Artist Information:
Name: [NAME]
Primary disciplines: [DISCIPLINE 1], [DISCIPLINE 2]
Secondary disciplines: [DISCIPLINE 3], [DISCIPLINE 4]
Background: [BIOGRAPHY NOTES]
Artistic philosophy: [PHILOSOPHY]
Community work: [COMMUNITY INVOLVEMENT]

Write three paragraphs following the structure above. Use active voice. Make it celebratory but not hyperbolic.
```

**Example Output:**
```
Paragraph 1:
Ben Mungai is a multidisciplinary artist whose creative practice spans visual and performing arts. His primary focus on oil and watercolor painting showcases a deep understanding of color theory, composition, and the interplay between light and medium. Each brushstroke reflects years of dedicated practice and a profound respect for traditional painting techniques.

Paragraph 2:
Beyond the canvas, Ben's artistic philosophy extends to every creative endeavor he pursues. His work as a musician brings rhythmic structure and emotional depth to his artistic vision, while his tattoo artistry demonstrates an ability to translate conceptual ideas into permanent, wearable forms. As an event organizer and curator, he creates platforms for emerging artists to showcase their work, giving back to the creative community that has shaped his practice.

Paragraph 3:
Ben's entrepreneurial spirit drives innovation in how art is presented, appreciated, and shared. His approach to business reflects a commitment to sustainability, authenticity, and community engagement in the arts.
```

---

### Section 3: Discipline Descriptions

**Prompt:**
```
Create short, compelling descriptions for each artistic discipline practiced by [ARTIST NAME].

For each discipline listed below, write 2-3 sentences that:
1. Describe their specific approach to this medium/form
2. Connect it back to their overall artistic practice (if it's secondary)
3. Highlight what makes their work unique
4. Use present tense

Disciplines:
- [DISCIPLINE 1]
- [DISCIPLINE 2]
- [DISCIPLINE 3]
- [DISCIPLINE 4]

Include the provided emoji icon with each description.

Requirements:
- 3-4 sentences per discipline
- Mix technical and philosophical language
- For secondary disciplines, explain how they inform primary work
- Avoid repetition across descriptions
```

**Example Output:**
```
Oil Painting 🎨
Ben's primary medium, exploring depth, texture, and classical techniques. His oil works are characterized by rich colors and meticulous attention to detail, drawing from both figurative and abstract traditions.

Watercolor 💧
A complementary medium that emphasizes spontaneity and transparency. His watercolor series explores the interplay between control and chance, creating dynamic, flowing compositions.

Music 🎵
Musical practice informs Ben's visual work through rhythm, timing, and harmonic relationships. His compositions blend contemporary and traditional sounds, creating immersive audio experiences.
```

---

### Section 4: Timeline

**Prompt:**
```
Create a professional timeline for [ARTIST NAME] based on the following achievements:

Key Milestones (in any order):
- [ACHIEVEMENT 1]
- [ACHIEVEMENT 2]
- [ACHIEVEMENT 3]
- [ACHIEVEMENT 4]
- [ACHIEVEMENT 5]

Requirements:
1. Arrange in REVERSE chronological order (most recent first)
2. For each milestone, provide: YEAR | TITLE | DESCRIPTION
3. Description should be 1-2 sentences
4. Use strong action verbs (Curated, Organized, Founded, Exhibited, etc.)
5. Include specific numbers or details when relevant
6. Connect to artistic disciplines when appropriate

Output format:
YEAR: 2024
TITLE: Event Name or Achievement
DESCRIPTION: [1-2 sentences describing the achievement and its scope]
```

**Example Output:**
```
YEAR: 2024
TITLE: Contemporary Art Fest Curator
DESCRIPTION: Organized and curated major arts festival bringing together 50+ artists across multiple disciplines.

YEAR: 2023
TITLE: Solo Exhibition - Between Light and Shadow
DESCRIPTION: A retrospective of oil and watercolor works at the Central Gallery, drawing record attendance.

YEAR: 2021
TITLE: Artist Residency Program
DESCRIPTION: Six-month residency focusing on large-scale oil paintings and experimental techniques.

YEAR: 2018
TITLE: Community Arts Initiative Launch
DESCRIPTION: Founded platform supporting emerging artists in East Africa through exhibitions and mentorship.
```

---

### Section 5: Collaborations

**Prompt:**
```
Write three current or notable collaboration/project descriptions for [ARTIST NAME].

These should represent:
1. Connection to Art Collect or major platform
2. Cross-disciplinary collaborative work
3. Educational or community-focused initiative

For each collaboration, write:
- Project Name
- 2-3 sentence description
- Include impact or significance

Requirements:
- Use present tense ("Collaborating," "Creating," "Mentoring")
- Describe what happens and why it matters
- Show connection to broader artistic ecosystem
- Balance descriptive language with clarity

Topics to consider if not provided:
- Art Collect platform featuring
- Fusion performances or events
- Artist development or mentorship
- Cross-disciplinary projects
- Community engagement initiatives
```

**Example Output:**
```
Art Collect Platform
Featured artist showcasing diverse body of work across painting, music, and event curation. Collaborating to build bridges between emerging and established artists.

Cross-Media Performances
Fusion events combining live painting demonstrations with musical performances, creating immersive experiences for audiences and new platforms for artistic dialogue.

Artist Mentorship Program
Ongoing commitment to developing next-generation artists through workshops, studio visits, and one-on-one guidance in painting techniques and professional practice.
```

---

## Complete Profile Generation Workflow

### Step 1: Data Collection
Gather all available information about the artist in the Required Information format.

### Step 2: Section Generation
Use the prompts above in sequence to generate each section:
1. Header (tagline + disciplines)
2. Biography (3 paragraphs)
3. Disciplines (5-6 descriptions)
4. Portfolio (6+ artworks with titles, mediums, descriptions)
5. Timeline (4-5 milestones)
6. Collaborations (3 projects)

### Step 3: Quality Check
Before finalizing, verify:
- [ ] All information is accurate and artist-approved
- [ ] Tone is consistent throughout
- [ ] No typos or grammatical errors
- [ ] Disciplines are accurately represented
- [ ] Cross-disciplinary connections are clear
- [ ] All links and contact info are correct
- [ ] SEO metadata is complete

### Step 4: Data Structuring
Populate the JSON template (`ben_mungai_artist_data.json`) with generated content.

### Step 5: HTML Rendering
Insert the JSON data into the HTML template (`artist_profile_template.html`) to generate the final profile page.

---

## Tone & Voice Guidelines

### Do's ✓
- Celebrate the artist's work authentically
- Use active, present-tense verbs
- Make connections between disciplines
- Be specific and detailed
- Show respect for the artistic practice
- Acknowledge versatility and growth
- Include concrete achievements and numbers

### Don'ts ✗
- Don't use hyperbolic language or exaggeration
- Don't make unsupported claims about "greatest" or "best"
- Don't diminish secondary disciplines as hobby work
- Don't use clichés ("passion," "journey," "explore")
- Don't repeat the same adjectives or phrases
- Don't assume without verification
- Don't use overly academic or jargon-heavy language

### Example Revision

**Poor (hyperbolic, generic):**
> Ben Mungai is a passionate artist exploring the depths of human emotion through his incredible multidisciplinary creative journey. His works are absolutely stunning and capture the essence of contemporary art in a groundbreaking way.

**Better (specific, authentic):**
> Ben Mungai is a multidisciplinary artist whose creative practice spans visual and performing arts. His oil and watercolor paintings showcase a deep understanding of color theory and composition, while his work as a musician and tattoo artist demonstrates how different creative forms inform and strengthen one another.

---

## Common Challenges & Solutions

### Challenge: Artist Has Too Many Disciplines
**Solution:** 
- Identify 2-3 primary disciplines (main focus)
- Group others as "secondary" 
- Show how they interconnect rather than listing separately
- Focus description on how they enrich each other

### Challenge: Limited Information Available
**Solution:**
- Ask artist for clarification before filling gaps
- Use general but honest language ("Ben's practice encompasses...")
- Avoid speculation
- Build profile in phases as more info becomes available

### Challenge: Describing Niche Art Forms
**Solution:**
- Research the medium authentically
- Use artist's own language/terminology
- Connect to more familiar art forms when helpful
- Include educational elements in descriptions

### Challenge: Keeping Content Concise
**Solution:**
- Use the word count guidelines strictly (80-120 words per paragraph)
- Remove adjectives that don't add information
- Combine related ideas
- Save detailed information for separate artist statement (if available)

---

## Output Checklist

Before submitting a generated profile:

- [ ] Artist name spelled correctly
- [ ] All discipline tags present and accurate
- [ ] Biography has 3 distinct paragraphs with proper word counts
- [ ] All 5-6 disciplines have descriptions and emoji
- [ ] 6+ artworks listed with title, medium, dimensions, year
- [ ] 4-5 timeline milestones in reverse chronological order
- [ ] 3 collaboration descriptions using present tense
- [ ] Contact email formatted correctly
- [ ] Quick stats (years active, artworks, exhibitions) populated
- [ ] All links tested
- [ ] SEO metadata complete
- [ ] No typos or grammatical errors
- [ ] Tone consistent throughout
- [ ] Mobile-friendly text lengths
- [ ] All image alt text provided
- [ ] Fact-checked against provided information

---

## Template Files Reference

| File | Purpose |
|------|---------|
| `artist_profile_template.html` | HTML template with all sections and styling |
| `ARTIST_PROFILE_GUIDE.md` | Detailed guide for human review and customization |
| `ben_mungai_artist_data.json` | JSON data structure template for Ben Mungai example |
| `AI_BUILDER_PROMPT_TEMPLATE.md` | This file - instructions for AI profile generation |

---

## Need Help?

If you're stuck:
1. Return to the relevant section prompt
2. Check the example outputs for formatting
3. Review the tone guidelines
4. Compare with Ben Mungai's completed profile
5. Ask: "Would an artist be proud of this representation?"

---

**Version:** 1.0  
**Last Updated:** 2024-09-04  
**For:** Art Collect AI Builder Integration