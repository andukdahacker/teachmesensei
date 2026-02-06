---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-01b-continue
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-teachmesensei-2026-02-05.md'
  - '_bmad-output/planning-artifacts/research/market-online-tutoring-mentorship-research-2026-02-05.md'
  - '_bmad-output/analysis/brainstorming-session-2026-02-05.md'
documentCounts:
  briefs: 1
  research: 1
  brainstorming: 1
  projectDocs: 0
classification:
  projectType: web_app
  domain: edtech
  complexity: medium
  projectContext: greenfield
  launchFocus: consumer-first
workflowType: 'prd'
date: 2026-02-06
author: Ducdo
project_name: TeachMeSensei
---

# Product Requirements Document - TeachMeSensei

**Author:** Ducdo
**Date:** 2026-02-06

---

## Executive Summary

TeachMeSensei is a mentorship community — not a tutoring marketplace — where career switchers into tech find working professionals who were in their shoes two years ago. A learner taps "I'm stuck" at 11pm, and within 60 seconds they're talking to a real human who felt the same way and made it through.

**The problem:** Career switchers are abandoned after bootcamp — no mentorship, no community, no one to navigate the gap between learning skills and surviving a real job. Meanwhile, working professionals want to help but every platform makes mentoring feel transactional and thankless.

**The solution:** A platform that meets learners where they are emotionally, honors mentors as practitioners (not tutors), builds relationships naturally through a Discover → Follow → Partner gradient, and uses AI to make humans more valuable (free AI handles 60%+ of questions; humans handle career navigation, judgment, and emotional support).

**Key differentiators:**
1. **Designed to Graduate** — The platform celebrates your departure. Anti-engagement as the most powerful trust-building and growth strategy.
2. **Practitioner Supply Model** — Working professionals, not career tutors. 10x larger addressable mentor pool motivated by identity, community, and legacy.
3. **Signal-Based Trust** — Behavioral signals (return rates, session extensions, referrals) replace star ratings. Ungameable, meaningful reputation.

**Target users:** Career-switching learners (25-40, post-bootcamp), practitioner Senseis (working professionals 2+ years in), lurkers (pre-commitment explorers).

**Technology:** SvelteKit + Supabase + Daily.co. Solo developer architecture optimized for shipping speed.

**MVP strategy:** Launch as a mentor tool (not a marketplace) enhancing existing informal mentorship, then layer in Flash Help matching once supply-side is proven.

---

## Success Criteria

### User Success

**Career-Switchers (Primary — "Wanderers"):**
- **Graduation:** Land first tech job within 6 months of first Flash Help
- **Graduation moment:** Job offer accepted + 90-day mark survived
- **Flywheel closure:** 20%+ of graduates become Senseis within 12 months

**Skill-Builders (Secondary):**
- **Sustained engagement:** Active subscription retained month-over-month
- **Relationship depth:** Progression from Flash Help → Follow → Partner
- **No forced graduation:** Value is ongoing mentorship, not an exit

**Both Segments:**
- **The Exhale:** Time-to-human-connection <60 seconds (from "I'm stuck" to live Sensei)
- **Resolution:** "I'm stuck" → problem solved <24 hours
- Return rate to same Sensei: >60%
- Emotional support delivered: Tracked via session tags, gratitude signals, AI escalation triggers

**Sensei Success:**
- Constellation growth: 3-4 graduates/year (career-switchers helped to job)
- Learner return rate: >60%
- Producer credits: Visible on profile when mentees land jobs
- Peer recognition: Guild spotlights, endorsements

### Business Success

**Early Signal (Month 1-2):**
- Active mentor-learner pairs using tool weekly: 10 → 25 → 50

**Growth Trajectory (6-12 months):**
- Active pairs: 100 → 500 → 2,000
- Lurker-to-first-interaction: >5%
- Graduate-to-Sensei pipeline: >20%

**Intermediate Gates:**
- Flash Help → Follow conversion: >40% (validates relationship deepening before graduations)

**Unit Economics:**
- AI resolution rate: >60% of questions handled free
- Human escalation conversion: >40% convert to Follow relationship
- Revenue grows with relationship depth (Discover $3-5 → Follow $40/mo → Partner $99/mo)

### Technical Success

- **The Exhale:** Flash Help matching <60 seconds from "I'm stuck" to live human
- **Graceful degradation:** When no Sensei available within 60s, AI holds conversation warm + provides ETA for human connection
- Video reliability: Sessions complete without drops >99%
- AI transcription accuracy: Usable notes requiring minimal Sensei edits
- Signal-based reputation: Return rates, session extensions, referrals tracked and surfaced

**Leading Quality Indicators:**
- Session extension rate: >20% (they wanted to keep talking)
- Session-end sentiment: >80% positive (they left feeling better)

### Measurable Outcomes

| Metric | Phase 1 Target | Phase 2 Target | Scale Target |
|--------|----------------|----------------|--------------|
| Active pairs | 10 weekly | 50 weekly | 500+ weekly |
| Second session within 14 days | >50% | >60% | >65% |
| Flash Help → Follow conversion | — | >40% | >50% |
| Session extension rate | — | >20% | >25% |
| AI resolution rate | — | >60% | >70% |
| First graduation | — | 1 | 50+ |
| Graduate-to-Sensei | — | — | >20% |

---

## User Journeys

### Journey 1: Maya's First Exhale (Wanderer — Success Path)

**Opening Scene:**
It's 11:47pm on a Tuesday. Maya, 29, is staring at her 47th job rejection email. Three months post-bootcamp, her savings are bleeding out. She finished top of her cohort, but nobody told her that "knowing React" and "surviving a real engineering team" are different planets. She opens LinkedIn, sees a former classmate announce their new dev role, and feels her chest tighten. *Am I just not good enough?*

She Googles "how to get first developer job" for the hundredth time. A graduation story catches her eye — someone who switched from marketing (like her) landed a role at a startup. She clicks through and lands on TeachMeSensei.

**Rising Action:**
The landing page doesn't ask her to sign up. She scrolls a curiosity feed — short clips of real developers talking about real struggles. One Sensei, Marcus, is talking about his first month on the job: "I broke production twice in week one. My manager laughed and said 'welcome to engineering.'" Maya exhales slightly. *Maybe it's not just me.*

She taps "I'm stuck." No login wall. Just a simple prompt: *"What's going on?"*

She types: "I keep getting rejected. I don't know if I'm applying wrong or if I'm just not ready."

The AI responds instantly — acknowledges her frustration, asks a clarifying question about her resume. It's helpful but... clinical. Then: *"This sounds like something a human Sensei could really help with. Marcus was in your exact situation 2 years ago. Want to talk to him? ($5, usually 15 minutes)"*

She hesitates. $5 is nothing, but asking for help feels like admitting failure. She taps "Connect."

**The Wait (UI Micro-Moment):**
The screen shifts to a calming gradient. A soft animation pulses. Text appears: *"Finding your Sensei..."* with a live countdown: *"Marcus is joining in ~40 seconds."* Maya sees Marcus's photo, his style tags (Sherpa, 2 Years Ahead), and a one-liner: *"Career-switched from teaching. 47 rejections before my first yes."*

She exhales again before he even appears.

Forty-three seconds later, Marcus appears on video. He's in a hoodie, clearly just finished his own workday. "Hey Maya. I read your message. I remember that feeling — the rejections hit different when you've already bet everything on this working."

**Climax:**
For 23 minutes, Marcus doesn't teach her anything. He tells her about his 4-month job search. He looks at her resume and says, "This is better than mine was." He asks about her portfolio projects and says, "You're ready. The market is just brutal right now. It's not you."

Maya cries a little. Marcus pretends not to notice.

Before they end, he says: "Same time Thursday? I want to do a mock behavioral interview with you. The technical stuff isn't your problem — it's confidence. I can hear it."

**Resolution:**
Maya books the Thursday session. Then the next Tuesday. She starts looking forward to Thursdays. Three weeks later, Marcus reviews her take-home assignment for a startup. He spots a bug she missed. She fixes it, submits it, and gets the offer.

At her 90-day mark, she gets a notification: *"Congratulations on graduating, Maya. You did it. Want to help someone else?"*

She taps "Yes."

---

### Journey 2: Maya's Dark Night (Wanderer — Edge Case/Recovery)

**Opening Scene:**
Same Maya, different night. It's week 6 of using TeachMeSensei. She's had four sessions with Marcus, made real progress, felt hopeful. Then: a final-round interview at her dream company. She bombed the system design question. Completely froze. The rejection email arrives 2 hours later.

She opens TeachMeSensei at 1am, but Marcus isn't available. No Senseis are. She taps "I'm stuck" and types: "I just failed my final round. I don't think I can do this anymore."

**Rising Action:**
The AI recognizes distress signals. It doesn't try to solve the technical problem. Instead:

*"That sounds really hard. Final rounds are brutal because you get so close. Before we talk about next steps — how are you feeling right now?"*

Maya types: "Like I should just go back to marketing."

**The Warm-Hold (UI Micro-Moment):**
The screen doesn't show an error or empty state. Instead: *"No Senseis are available right now, but I'm here. Let me help until morning."*

The AI continues: *"A lot of people feel that way after a final round rejection. It doesn't mean it's true — it means you're exhausted. Marcus has talked about this exact feeling. He'll be available in 6 hours. Want me to book you a session for 8am?"*

She books it. The AI sends her a short voice clip from another Sensei who went through 11 final rounds before landing: "The eleventh one said yes. You only need one yes."

**Test Scenario (Critical Edge Case):**
- User reports distress at off-peak hours (1am)
- Zero Senseis available in matching pool
- AI must: detect emotional state, hold conversation warmly, schedule morning session, provide async comfort (voice clip)
- Failure mode: If warm-hold fails, show "We're having trouble connecting. Your message has been saved and Marcus will see it first thing." — never leave Maya staring at an error.

**Climax:**
The next morning, Marcus doesn't lecture. He just listens. Then he says: "I'm going to tell you something I haven't told other mentees. I almost quit after my 8th rejection. I drafted an email to my old principal asking for my teaching job back. I never sent it — but I wrote it."

Maya realizes she's not uniquely broken.

**Resolution:**
Marcus helps her request feedback from the company. They actually respond. The system design gap is specific and fixable. He connects her with another Sensei who specializes in system design. Three weeks later, a different company makes an offer.

---

### Journey 3: Marcus Becomes a Sensei (Sensei — Onboarding)

**Opening Scene:**
Marcus, 31, has been a software engineer for 2.5 years. He's competent now — not senior, but solid. He remembers being lost. He's been informally mentoring a bootcamp grad he met at a meetup, but it's messy — scheduling over text, Zoom links that expire, no way to track what they've covered.

A colleague mentions TeachMeSensei: "It's like... infrastructure for the mentoring you're already doing."

**Rising Action:**
Marcus signs up. The onboarding flow:

**Happy Path (LinkedIn):**
1. Tap "Become a Sensei"
2. Connect LinkedIn (OAuth) — auto-fills name, photo, headline, experience
3. Pick topics (career switching, junior dev survival, React)
4. Set style tags (Sherpa, 2 Years Ahead)
5. Set availability (Tuesday/Thursday evenings, 7-10pm)
6. Get 5 invite codes

**Fallback Path (No LinkedIn):**
1. Tap "Become a Sensei"
2. LinkedIn auth fails or user opts out → "No problem, tell us about yourself"
3. Manual entry: name, photo upload, current role, years of experience
4. Same flow: topics, style tags, availability, invite codes

**Invite Code UX:**
Marcus sees his 5 codes on a simple screen:
- Shareable link (tap to copy): `teachmesensei.com/invite/marcus-7x9k`
- Or individual codes: `MARCUS-001` through `MARCUS-005`
- Each code shows status: unused / claimed by [name]

He invites his current mentee. Their next session is through the platform. Afterward, the AI sends him a summary of what they discussed. *That would have taken me 20 minutes to write myself.*

**Climax:**
A week later, he gets his first match from the platform — Maya. He sees her profile: marketing background, 3 months post-bootcamp, struggling with confidence. *That was me.*

He accepts the Flash Help. The session goes 8 minutes over. He doesn't care.

After, he sees his constellation: two small stars now. It's just a simple visualization, but something about seeing it makes him want more.

**Resolution:**
Six months later, Marcus has helped 4 people land jobs. His constellation has grown. At a company all-hands, someone asks what he does outside work. He pulls up TeachMeSensei and shows his producer credits. His manager notices. It comes up in his performance review — "shows leadership and mentorship skills."

He realizes: this thing that felt like giving back is actually making him better at his job.

---

### Journey 4: Jordan Stops Lurking (Lurker — Conversion)

**Opening Scene:**
Jordan, 26, is an accountant who codes at night. They're not ready to commit to a career switch — too risky, too uncertain. But they're curious. They've been lurking on TeachMeSensei for 3 weeks: watching Sensei clips, reading graduation stories, absorbing without engaging.

No one has asked them to sign up. No pop-ups. They feel no pressure, which is why they keep coming back.

**Funnel Instrumentation (Metrics to Track):**
- Lurker sessions per week (Jordan: 4)
- Clips watched per session (Jordan: 2.3 avg)
- Profile views (Jordan has viewed 6 Sensei profiles)
- "Ask" button views vs. taps (Jordan: 3 views, 0 taps... until now)
- First-session conversion (moment Jordan becomes a paying user)

**Rising Action:**
One night, a Sensei posts a Hot Take: "Bootcamps won't teach you how to survive your first code review. That's where most people's confidence dies." Jordan has been terrified of exactly this. They've imagined senior engineers tearing apart their code. They didn't know other people felt this way.

They tap on the Sensei's profile. She's a data engineer, 3 years in, career-switched from finance (close enough to accounting). Jordan watches 4 of her clips.

**The Conversion Moment (UI Micro-Moment):**
On her profile, below the clips: *"Ask me anything. $5."*

The button is calm, not pushy. Jordan hovers. A soft tooltip: *"Usually responds in under 2 minutes. 89% of learners come back."*

Jordan doesn't want to talk about code. They want to know: "How did you know you were ready to quit your finance job?"

**Climax:**
The Sensei, unexpectedly, answers with a question: "What would make you feel ready?"

It's the first time anyone has asked Jordan that. They realize they've been waiting for permission.

**Resolution:**
Jordan books a second session. Then starts a check-in pattern. Three months later, they put in their notice at the accounting firm. Their first TeachMeSensei session had nothing to do with code — but it was the moment they stopped being a lurker.

---

### Journey 5: Maya Becomes Maya 2.0 (Graduated Sensei — Flywheel)

**Opening Scene:**
Maya has been at her startup job for 8 months. She's shipped features, survived a production incident, gotten good performance reviews. She still has imposter syndrome, but it's quieter now.

She gets a notification: *"Someone just asked the same question you asked Marcus 10 months ago: 'How do I know if I'm ready?' Want to help?"*

**Rising Action:**
Maya hesitates. *Am I qualified? I've only been doing this 8 months.* Then she remembers: Marcus was only 2 years ahead of her. She was 8 months ahead of being stuck.

She accepts the Flash Help. A face appears — Priya, 27, bootcamp grad, 2 months into the job search. Priya looks exactly like Maya felt.

**Climax:**
Maya doesn't have all the answers. But she has something better: a recent map of the territory. She tells Priya about her 47 rejections. About the final-round failure. About Marcus. Priya exhales.

"I thought I was the only one," Priya says.

"You're not," Maya says. "And you only need one yes."

**Resolution:**
Maya's constellation has one star now. It's tiny, but it's hers. She wants more. She sets availability for Thursday nights — the same night Marcus used to meet with her. She sends Marcus a message: "I just helped my first person. Thank you."

Marcus sees it and smiles. His constellation now has a second-generation branch.

---

### Journey 6: Marcus No-Shows (Sensei Edge Case — Trust Recovery)

**Opening Scene:**
It's Thursday at 7pm. Maya is waiting for her scheduled session with Marcus. She's prepared questions about negotiating her first offer. The video room loads. She sees: *"Waiting for Marcus to join..."*

One minute passes. Two. Five.

**Rising Action:**
**The No-Show Flow (UI Micro-Moments):**

At 2 minutes: *"Marcus seems to be running late. Hang tight..."*

At 5 minutes: *"Still waiting. We'll keep trying to reach Marcus."* (System sends Marcus a push notification + SMS)

At 7 minutes: *"We're sorry — Marcus hasn't joined. This is unusual for him (98% on-time rate)."*

Options appear:
1. *"Reschedule with Marcus"* — opens his next available slots
2. *"Connect with another Sensei now"* — shows 2-3 similar Senseis available
3. *"Get a refund"* — instant, no questions

Maya chooses to reschedule. She's annoyed but not furious — the platform handled it gracefully.

**Behind the Scenes (Admin View):**
Alex sees a flag in the morning dashboard:
- **Flag type:** Sensei no-show (category, not free-text)
- **Sensei:** Marcus
- **Learner:** Maya
- **Resolution:** Learner rescheduled
- **Sensei history:** First no-show in 6 months

Alex sends Marcus a check-in: "Hey, noticed you missed a session yesterday. Everything okay?"

Marcus responds: "Family emergency, couldn't get to my phone. Already rescheduled with Maya and apologized."

Alex logs the context. No escalation needed.

**Climax:**
If this were a pattern (3 no-shows in a month), the system would:
1. Auto-reduce Marcus's visibility in matching
2. Require Marcus to acknowledge and recommit
3. Surface to Admin for potential conversation

**Resolution:**
Maya's rescheduled session happens. Marcus apologizes in person. The relationship continues. Trust maintained because the platform had a recovery path.

---

### Journey 7: Admin Alex Keeps the Lights On (Lightweight Admin — MVP Ops)

**Opening Scene:**
Alex is the founder (or a trusted early team member). It's Week 3 of the beta. There are 15 active Sensei-learner pairs. Things are mostly working, but Alex needs to keep eyes on the system.

**Rising Action:**
Alex opens the admin dashboard each morning. The view is simple:
- **Active pairs this week:** 15 (↑3 from last week)
- **Sessions completed:** 23
- **Average session length:** 18 min
- **Flags:** 1 (learner reported audio issue)

Alex clicks the flag. Flags use a **category taxonomy** (not free-text):
- Technical issue (audio/video)
- Sensei no-show
- Uncomfortable interaction
- Billing issue
- Other (with optional notes)

This flag: "Technical issue (audio)" — video worked, audio dropped for 30 seconds, Sensei switched to phone. Not urgent, but logged for engineering.

Alex also checks Sensei health:
- **Senseis active this week:** 8
- **Senseis with 0 sessions this week:** 2 (Marcus on vacation, Sarah marked unavailable)
- **Sensei with highest return rate:** Marcus (85%)

**Trust Boundary (Data Access Levels):**

| Role | Access |
|------|--------|
| Learner | Own sessions, own recordings (if enabled), own growth journal |
| Sensei | Own sessions, own constellation, AI-generated summaries of their sessions |
| Admin (MVP) | Aggregate metrics, flags, AI-generated summaries (no raw transcripts), direct learner/Sensei outreach |
| Trust & Safety (Future) | Flagged session transcripts only (with escalation protocol) |

Raw transcripts are stored encrypted. Admins see AI summaries only. Full transcript access requires explicit escalation (e.g., legal, safety investigation) with audit logging.

**Climax:**
One day, a different flag: *"Uncomfortable interaction"* (category).

Alex reviews the AI-generated session summary (no full transcript access for privacy). The summary is vague. Alex reaches out to the learner directly: "Hey, I saw you flagged something. Want to tell me more?"

The learner explains: the Sensei was dismissive, made them feel stupid. Alex thanks them, reviews the Sensei's other session feedback (return rates, sentiment). This is the first negative signal — maybe a bad day. Alex sends the Sensei a gentle note: "Noticed a flag on your last session. Everything okay?"

**Resolution:**
The Sensei apologizes — they were stressed from work and shouldn't have taken sessions that day. Alex notes it internally but doesn't escalate. The system self-corrects through transparency.

At scale, this becomes a Trust & Safety role. For now, it's 15 minutes of Alex's morning.

---

### Journey Requirements Summary

| Journey | Capabilities Revealed |
|---------|----------------------|
| Maya's First Exhale | Curiosity feed, "I'm stuck" entry, AI triage, Sensei matching, "Finding your Sensei" UI state, video sessions, booking, session notes, graduation tracking |
| Maya's Dark Night | AI emotional detection, warm-hold when no Sensei available, graceful degradation UI, Sensei-to-Sensei referrals, scheduled follow-up booking |
| Marcus Becomes a Sensei | 90-second onboarding, LinkedIn OAuth + email fallback, style tags, availability settings, invite codes with shareable links, session summaries, constellation visualization |
| Jordan Stops Lurking | Public curiosity feed (no login), Hot Takes, Sensei profiles, funnel instrumentation (profile views, "Ask" taps), low-friction first interaction |
| Maya Becomes Maya 2.0 | Graduate-to-Sensei pipeline prompt, question-matching notification, constellation growth, cross-generational tracking |
| Marcus No-Shows | No-show detection flow, learner recovery options (reschedule/switch/refund), Sensei notification escalation, pattern detection, admin flag visibility |
| Admin Alex | Dashboard (active pairs, session counts, flags), flag taxonomy (categories), trust boundaries (data access levels), Sensei health monitoring, direct learner/Sensei outreach |

---

## Domain-Specific Requirements

### Privacy & Compliance

- **Age restriction:** 18+ only — age gate at registration (date-of-birth + terms acceptance). No COPPA applicability.
- **GDPR compliance:** Required for global user base. Consent management, right to access, right to deletion, data portability.
- **Vietnam PDPD:** Awareness-level compliance for operational base. Data processing aligned with Vietnamese data protection requirements.
- **Joint data ownership:** Both learner and Sensei own session data. Deletion conflict policy: either party can request deletion of their participation; other party is notified. Architectural decision needed: redaction vs. access removal on deletion request.
- **Sensitive data classification:** Video recordings and AI transcripts classified as sensitive personal data (emotionally vulnerable conversations).

### Data Residency & Retention

- **Primary database hosting:** Supabase Singapore (`ap-southeast-1`) — low latency for SEA/APAC, acceptable for global API calls.
- **Video infrastructure:** Daily.co handles edge routing globally — no latency concern for live sessions.
- **Data retention policy:** Video recordings auto-delete after 90 days unless learner explicitly saves. AI transcripts retained longer (lightweight storage). Raw video is high storage cost and high breach liability — minimize retention window.

### Content Moderation

- **MVP approach:** Flag-based taxonomy system (backend categories: technical issue, no-show, uncomfortable interaction, billing, other).
- **User-facing UX:** Flag trigger uses warm, empathetic language — *"That session didn't feel right"* — one tap, optional detail. No bureaucratic complaint forms. Taxonomy is for admin routing, not user experience.
- **Admin visibility:** Admin (Alex) sees flags with categories, AI session summaries, Sensei history. No raw transcript access without explicit escalation protocol + audit logging.
- **Scale path:** Trust & Safety role and proactive AI transcript monitoring layered in when scale demands it.

### Sensei Identity Verification

- **MVP approach:** LinkedIn OAuth auto-fills profile and verifies employment history. Combined with invite-only launch (5 codes per Sensei), this creates a natural trust filter.
- **Email fallback:** Manual entry with current role, years of experience, photo upload when LinkedIn auth unavailable.
- **Documented risk:** Fake Sensei identity is a high-impact risk for a platform built on trust with vulnerable users. One bad actor story on social media could damage platform trust significantly.
- **Scale mitigation plan:** Enhanced verification (employer email confirmation, peer endorsement requirements, community vouching) to be designed before open marketplace launch in Phase 2.

### Accessibility

- **Target standard:** WCAG 2.1 AA baseline.
- **Video accessibility:** AI transcription doubles as captioning for recorded sessions.
- **UI accessibility:** Screen reader compatibility for constellation visualization, keyboard navigation for all core flows including "I'm stuck" entry.

### Payment Compliance

- **PCI DSS:** Handled via payment processor (Stripe). Platform never touches raw card data.
- **Marketplace payouts:** Stripe Connect for Sensei payouts with KYC-lite requirements.
- **Pricing tiers:** Micro-transactions ($5 Flash Help), subscriptions ($40/mo Follow), future Knowledge Passport ($29-49/mo).

---

## Innovation & Novel Patterns

### Detected Innovation Areas

1. **Signal-Based Trust (No Star Ratings)** — Behavioral reputation built from return rates, session extensions, referrals, and session-end sentiment. Ungameable, removes review fatigue, creates authentic quality signals. No major competitor uses this model.
2. **"Designed to Graduate" Philosophy** — Anti-engagement as growth engine. Platform celebrates departure. Graduated learners are the strongest referral source and become the next generation of Senseis. Proven in adjacent market (Hinge: "designed to be deleted"), untested in EdTech.
3. **AI-First Economics with Emotional Escalation** — Free AI resolves 60%+ of questions. Human mentorship reserved for career navigation, judgment calls, and emotional support. AI detects distress signals and imposter syndrome to route appropriately. Novel combination of AI triage with emotional intelligence.
4. **Practitioner Supply Model** — Working professionals motivated by identity, community, and legacy rather than income. Unlocks 10x larger mentor pool than professional tutor platforms. Retention through constellation growth and producer credits, not payment.
5. **Constellation as Emotional Switching Cost** — Visual galaxy of mentorship impact. Every person helped is a star. Leaving the platform means abandoning your visible legacy. Novel retention mechanic that deepens with time.

### Market Context & Competitive Landscape

- No existing mentorship platform combines community-driven discovery + practitioner supply + AI-first economics + signal-based trust.
- Chegg's collapse ($12B → revenue -30%) validates that information-based EdTech is dead. Relationship-based platforms are the future.
- MentorCruise (closest competitor) uses traditional star ratings, professional tutors, and high pricing ($50-400/mo). TeachMeSensei inverts every axis.
- ADPList has volume (25K mentors) but no quality signals, no revenue model, and no relationship depth.
- The "Designed to Graduate" philosophy has no EdTech precedent but strong validation from Hinge's success with the same contrarian positioning in dating.

### Validation Approach

| Innovation | Validation Method | Phase | Success Signal |
|---|---|---|---|
| Signal-based trust | Measure first-time Flash Help booking rate with unknown Senseis (pure trust signal — distinct from conversion). Pre-build validation: mockup A/B test of Sensei profiles with star ratings vs. behavioral signals to measure click-through before writing platform code. | Phase 2 | >30% of Flash Help bookings are with Senseis the learner has no prior connection to; A/B test shows behavioral signals profile performs within 80% of star ratings profile |
| Designed to Graduate | Track whether graduation stories drive referrals and whether graduates convert to Senseis | Phase 2+ | >20% graduate-to-Sensei conversion, graduates refer at higher rate than active users |
| AI-first economics | Measure AI resolution rate and conversion from AI to human escalation | Phase 2 | >60% AI resolution, >40% escalation-to-Follow conversion |
| Practitioner supply | Track Sensei session consistency and churn through invite-only tool phase | Phase 1 | >80% Senseis active monthly, >50% learners book second session |
| Constellation retention | Measure engagement with constellation feature and correlation with Sensei retention | Phase 2 | Senseis who view constellation weekly retain at higher rate |

### Risk Mitigation

| Risk | Fallback | Trigger |
|---|---|---|
| Users don't trust without ratings | Surface behavioral signals more prominently ("85% came back"), add optional written testimonials (not ratings). Pre-validate with landing page A/B test before building. | Flash Help → Follow conversion <20% or first-time unknown Sensei booking <15% |
| Practitioner supply unreliable (real-time) | Shift to async-first mentorship modes: voice memo Flash Help, async PR reviews, written Q&A with 24-hour turnaround. Same practitioner supply, different availability model — preserves product thesis without diluting to career coaches. | >20% no-show rate or <5 available Senseis at any given time |
| AI resolution rate too low | Invest in domain-specific fine-tuning, expand knowledge base, lower escalation threshold | AI resolution <40% |
| Graduation philosophy confuses users | A/B test messaging — "designed to graduate" vs standard engagement framing | Qualitative signal: users express confusion about platform purpose |
| Constellation doesn't drive retention | Simplify to basic impact stats if visual doesn't resonate | No measurable retention lift after 60 days |

---

## Web App Specific Requirements

### Project-Type Overview

SvelteKit SPA with SSR for public content. Two-layer architecture:

- **Public content layer** (SSR, SEO-optimized): Curiosity feed, graduation stories, Sensei profiles, Hot Takes. Server-rendered for crawlability.
- **Authenticated app layer** (SPA-like, interactive): Video sessions, real-time matching, constellation visualization, admin dashboard. No SEO needed.

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend framework** | SvelteKit | SSR + SPA hybrid, full-stack framework |
| **Backend / Database** | Supabase (Postgres) | Auth, database, realtime, storage — managed platform |
| **Hosting region** | Supabase Singapore (`ap-southeast-1`) | Data residency for SEA/APAC, aligns with Railway choice |
| **Auth** | Supabase Auth | LinkedIn OAuth for Sensei onboarding, email fallback, 18+ age gate |
| **Realtime** | Supabase Realtime | WebSocket subscriptions for matching status, Sensei presence, admin dashboard |
| **Storage** | Supabase Storage | Video recordings with signed URLs, 90-day lifecycle expiration for auto-delete retention |
| **Serverless compute** | Supabase Edge Functions (Deno) | AI/LLM API calls (transcription, emotional triage, Flash Help AI layer) |
| **Video** | Daily.co SDK | Live video sessions, recording, WebRTC edge routing (global) |
| **CDN** | Cloudflare or Vercel Edge | Public content layer caching, global edge delivery for SEO pages |
| **Constellation viz** | d3-force or Threlte (Three.js for Svelte) | Galaxy visualization — evaluate during implementation |

### Technical Architecture Considerations

- **No custom backend required for MVP.** Supabase + Edge Functions replaces a traditional API server. Auth, database, realtime, storage, and serverless compute all managed.
- **Row-level security (RLS)** enforces trust boundaries at the database level: learners see own data, Senseis see own constellation, Admin sees aggregates and AI summaries only.
- **WebSocket connections persist** via Supabase Realtime — initial connection has latency but ongoing updates are fast.
- **Daily.co handles video edge routing globally** — no latency concern for live sessions regardless of user location.
- **AI integration via Edge Functions** — call OpenAI/Anthropic APIs for transcription, emotional detection, and Flash Help AI triage without managing a separate backend service.

### Browser Support

- **Evergreen browsers only:** Latest Chrome, Firefox, Safari, Edge.
- **No IE/legacy support.** WebRTC (Daily.co) requires modern browser capabilities.

### SEO Strategy

- **Critical for acquisition.** Public pages server-rendered by SvelteKit for crawlability.
- **SEO-relevant pages:** Curiosity feed, graduation stories, Sensei profiles, Hot Takes, Forked Path Library (future).
- **No SEO needed:** Authenticated app routes (sessions, dashboard, constellation, messaging).
- **CDN layer** in front of public content for global edge delivery and performance.

### Performance Targets

- **"Finding your Sensei" matching:** Under 60 seconds end-to-end (product requirement, not latency target).
- **Video session initialization:** Under 3 seconds (Daily.co handles).
- **Public content pages:** Fast globally via CDN edge caching.
- **Authenticated API calls:** 300-400ms for US-based users connecting to Singapore — acceptable for MVP at 10-50 users. Known tradeoff, not a blocker. Optimize with edge compute or regional read replicas if needed at scale.

### Responsive Design

- **Web-first, mobile-responsive.** No native app for MVP.
- **Core flows (I'm stuck, Flash Help, video sessions) must work well on mobile browsers.**

### Implementation Considerations

- **Solo developer architecture.** Every technology choice optimizes for shipping speed and minimal infrastructure management.
- **Supabase migrations** for database schema versioning.
- **Environment-based configuration** for development, staging, production.
- **Scale path:** If real-time demands exceed Supabase Realtime capacity (unlikely before 1,000+ concurrent users), evaluate dedicated WebSocket infrastructure or Phoenix LiveView migration for the real-time layer only.

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — validate that enhancing existing informal mentorship with scheduling, video, and AI-generated session notes creates a "can't go back to Zoom" experience.

**Resource Requirements:** Solo developer. SvelteKit + Supabase architecture chosen specifically to maximize shipping speed and eliminate backend infrastructure management.

### Phase 1: Mentor Tool (Weeks 1-4)

**Goal:** 10 active Sensei-learner pairs using tool weekly

**Core User Journeys Supported:**
- Journey 3 (Marcus Becomes a Sensei) — onboarding, invite codes, session management
- Partial Journey 1 (Maya's First Exhale) — video sessions, AI notes, relationship building with existing pairs

**Must-Have Capabilities:**

| Feature | Description | Rationale |
|---|---|---|
| Auth & onboarding | Supabase Auth, LinkedIn OAuth + email fallback, 18+ age gate | Foundation — nothing works without identity |
| Sensei onboarding | Topics, availability slots, 5 invite codes per Sensei | Supply-side activation |
| In-app scheduling | Sensei sets available time slots, learner picks one, email confirmations | Simpler than Google Calendar integration, builds in a weekend. Calendar sync deferred to Phase 2 |
| Video chat + recording | Daily.co integration with session recording | Core interaction — the mentorship session |
| Post-session AI notes | Async pipeline: Daily.co recording → Whisper API → LLM summary → stored notes delivered to both parties within 15-30 min | The "can't go back to Zoom" differentiator |
| Invite code system | 5 codes per Sensei, shareable links, claim tracking | Supply-controlled growth, trust filter |
| Basic learner list | Simple view: learner names, session count, last interaction | Minimum Sensei dashboard — NOT constellation viz |
| Row-level security | Supabase RLS policies for trust boundaries | Privacy compliance from day 1 |
| Encrypted video storage | Supabase Storage with signed URLs, 90-day lifecycle expiration | Data retention policy enforcement |

**Explicitly NOT in Phase 1:**
- Google Calendar integration (in-app scheduler is sufficient for 10 pairs)
- Constellation visualization (Phase 2 reward)
- Sensei style tags (not needed until matching)
- Flag-based reporting (invite-only known pairs don't need it yet)
- Any marketplace or matching features

**Success Gate:** >50% of learners book second session within 14 days. Senseis report "I can't go back to Zoom."

### Phase 1.5: Open Invite Validation (Weeks 4-5)

**Goal:** Validate stranger-trust before building matching infrastructure

**What changes:**
- Senseis share invite codes publicly — LinkedIn posts, bootcamp Slack channels, meetup announcements
- Still invite-only (supply-controlled), but learners no longer have prior relationships with Senseis
- Track: do strangers book? Do they return? Does the tool work without existing trust?

**Why this matters:** Phase 2 assumes strangers will match and trust each other through the platform. Phase 1.5 tests that assumption cheaply before building Flash Help, matching algorithms, and payment infrastructure.

**Success Gate:** Strangers book and return at comparable rates to existing pairs. If not, investigate trust gaps before Phase 2.

### Phase 2: Flash Help (Weeks 5-8)

**Goal:** 50+ Flash Help sessions, prove unit economics

**Capabilities:**
- Three entry points: "I'm stuck" / "I'm curious" / "I'm preparing"
- AI-first triage layer (free, 24/7, resolves 60%+)
- Human escalation with "2 Years Ahead" + style matching
- $5 micro-transaction for human Flash Help (Stripe + Stripe Connect)
- Sensei style tags (DJ, Sherpa, Provocateur) — now needed for matching
- Flag-based reporting ("That session didn't feel right" — warm UX, backend taxonomy)
- Signal-based trust (return rate, session extensions tracked and surfaced)
- Constellation visualization (galaxy view as mentoring reward)
- Graceful degradation: AI warm-hold + ETA when no Sensei available
- Async fallback modes: voice memo Flash Help, written Q&A with 24-hour turnaround
- Google Calendar sync (deferred from Phase 1)

**Success Gates:**
- >60% AI resolution rate
- >40% of human escalations lead to repeat booking
- At least 1 learner lands a job (first graduation)

### Phase 3: Growth (Months 3-6)

- Curiosity feed and Hot Takes (content as organic discovery)
- Follow mode — deeper engagement beyond Flash Help ($40/mo recurring)
- Knowledge Passport subscription ($29-49/mo)
- Graduation ceremony + producer credits
- Graduate-to-Sensei pipeline prompt
- Session-end sentiment capture

### Phase 4: Vision (Months 6-12+)

- Guilds (purpose-based communities)
- Learning Parties, Quests, Knowledge Jams
- Employer Quests (B2B hiring pipeline)
- Bootcamp partnerships (post-graduation layer)
- Sensei Economy (micro-communities, own pricing)
- TeachMeSensei API (mentorship as infrastructure)

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Mitigation | Fallback |
|---|---|---|
| AI transcription quality | Post-session async pipeline (Whisper API is mature). No real-time processing complexity. | Manual session notes by Sensei if pipeline fails — still better than nothing |
| Daily.co integration complexity | Well-documented SDK, SvelteKit JS interop is straightforward | Fallback to simple peer-to-peer WebRTC if Daily.co costs become prohibitive at scale |
| 4-week solo timeline | In-app scheduler (not Google Calendar), Supabase eliminates backend work, 10 feature areas scoped tightly | Slip Phase 1 to 5 weeks if needed — better to ship complete than ship broken |

**Market Risks:**

| Risk | Mitigation | Fallback |
|---|---|---|
| Senseis don't adopt over Zoom | AI notes as killer differentiator — the feature Zoom can't match | If AI notes aren't enough, add constellation viz earlier as retention hook |
| Strangers don't trust the platform | Phase 1.5 validates stranger-trust before building Flash Help | If Phase 1.5 fails, pivot to referral-only growth (existing pairs invite their networks) |
| Learners don't return for second session | Success gate at >50% — if missed, investigate why before Phase 2 | Reduce friction: auto-suggest next session time at end of each call |

**Resource Risks:**

| Risk | Mitigation | Fallback |
|---|---|---|
| Solo dev bottleneck | SvelteKit + Supabase architecture minimizes custom code | Identify one freelancer for video integration if needed |
| Scope creep | Strict phase boundaries, success gates before advancing | Cut to absolute minimum: auth + video + AI notes. Everything else is enhancement |

---

## Functional Requirements

*This section defines THE CAPABILITY CONTRACT for the entire product. UX designers will only design, architects will only support, and epics will only implement what is listed here. If a capability is missing, it will not exist in the final product.*

### Identity & Access

- **FR1:** Senseis can create an account using LinkedIn OAuth or email registration
- **FR2:** Learners can create an account using LinkedIn OAuth or email registration
- **FR3:** Users must verify they are 18+ during registration
- **FR4:** Users can manage their profile information (name, photo, bio)
- **FR5:** Senseis can set their topic expertise areas during onboarding
- **FR6:** The system enforces role-based data access boundaries (learners see own data, Senseis see own learners, Admin sees aggregates)

### Sensei Management

- **FR7:** Senseis can set their available time slots for sessions
- **FR8:** Senseis can generate and manage up to 5 invite codes
- **FR9:** Senseis can share invite codes via link or individual codes
- **FR10:** Senseis can view their learner list with session count and last interaction date
- **FR11:** Senseis can view AI-generated session summaries for their sessions
- **FR12:** Learners can claim a Sensei's invite code to establish a connection

### Learner Management

- **FR13:** Learners can optionally select topic interests during onboarding
- **FR14:** Learners can view their session history, connected Senseis, and past session notes

### Session Scheduling

- **FR15:** Learners can view a Sensei's available time slots
- **FR16:** Learners can book a session by selecting an available time slot
- **FR17:** Both parties receive email confirmation when a session is booked
- **FR18:** Either party can cancel or reschedule a booked session
- **FR19:** Both parties receive reminders before upcoming sessions
- **FR20:** The system displays and manages scheduling across timezones, showing availability in each user's local time

### Video Sessions

- **FR21:** Senseis and learners can join a live video session at the scheduled time
- **FR22:** Video sessions are automatically recorded (with two-party consent)
- **FR23:** Either participant can opt out of session recording before or during a session
- **FR24:** Session recordings are stored encrypted with access limited to both participants
- **FR25:** Either participant can mark a session recording for permanent retention before the 90-day expiration
- **FR26:** Session recordings are automatically deleted after 90 days unless explicitly saved

### AI-Powered Session Notes

- **FR27:** The system automatically transcribes completed session recordings
- **FR28:** The system generates a structured summary from session transcripts
- **FR29:** Both Sensei and learner receive session notes within 30 minutes of session end
- **FR30:** Session notes are stored and accessible for review before future sessions
- **FR31:** Senseis can view a pre-session brief showing learner context and previous session summary before joining a session
- **FR32:** Senseis can add personal annotations to AI-generated session notes
- **FR33:** Users can copy session notes to clipboard for use in external tools

### Flash Help & AI Triage (Phase 2)

- **FR34:** Learners can initiate help through three entry points: "I'm stuck" / "I'm curious" / "I'm preparing"
- **FR35:** The AI layer can respond to learner questions instantly (24/7)
- **FR36:** The AI can detect emotional distress signals and adjust response approach
- **FR37:** The AI can escalate to human Sensei matching when appropriate
- **FR38:** Learners can connect to a matched Sensei for a paid Flash Help session
- **FR39:** The system matches learners to Senseis based on experience proximity ("2 Years Ahead") and style compatibility
- **FR40:** When no Sensei is available, the system provides an AI warm-hold experience with estimated human availability
- **FR41:** The system supports async fallback modes (voice memo, written Q&A) when live Senseis are unavailable

### Trust & Reputation (Phase 2)

- **FR42:** The system tracks behavioral signals: return rate, session extensions, referrals
- **FR43:** Behavioral trust signals are surfaced on Sensei profiles
- **FR44:** Senseis can self-select style tags (DJ, Sherpa, Provocateur)
- **FR45:** Learners can view Sensei profiles with style tags, experience proximity, and behavioral signals

### Safety & Moderation (Phase 2)

- **FR46:** Learners can flag a session that didn't feel right (one-tap with optional detail)
- **FR47:** The system categorizes flags by type for admin routing (technical, no-show, uncomfortable interaction, billing, other)
- **FR48:** The no-show detection flow provides learner recovery options (reschedule, connect with another Sensei, refund)

### Payments (Phase 2)

- **FR49:** Learners can pay for Flash Help sessions via micro-transaction
- **FR50:** Senseis receive payouts for completed paid sessions
- **FR51:** Learners can request instant refunds for no-show sessions

### Constellation & Growth (Phase 2)

- **FR52:** Senseis can view their mentorship constellation — a visual representation of people they've helped
- **FR53:** The system tracks graduation milestones (job landed, 90-day mark)
- **FR54:** Graduated learners receive a prompt to become Senseis

### Admin Operations

- **FR55:** Admin can view aggregate platform metrics (active pairs, session counts, flags)
- **FR56:** Admin can view and respond to flagged sessions
- **FR57:** Admin can view AI-generated session summaries (not raw transcripts) for flagged sessions
- **FR58:** Admin can directly contact learners or Senseis regarding flags

### Data Privacy & Ownership

- **FR59:** Either participant can request deletion of their session data
- **FR60:** The other participant is notified when deletion is requested
- **FR61:** Users can export their personal data (GDPR data portability)

---

## Non-Functional Requirements

*NFRs define HOW WELL the system performs, not WHAT it does. Only categories relevant to TeachMeSensei are included.*

### Performance

- Page load time for public content (curiosity feed, Sensei profiles): < 2 seconds globally via CDN
- Authenticated app interactions (booking, navigation, dashboard): < 500ms server response
- "Finding your Sensei" matching flow: complete end-to-end within 60 seconds (product requirement)
- Video session join: < 3 seconds from clicking "Join" to seeing video
- AI session notes delivery: within 30 minutes of session end for sessions under 60 minutes (longer sessions scale proportionally with transcription time)
- Concurrent video sessions supported: 10 simultaneous (Phase 1), 50 simultaneous (Phase 2)

### Security

- All data encrypted in transit (TLS 1.2+) and at rest (AES-256)
- Video recordings encrypted at rest with access via signed, expiring URLs
- Session transcripts stored encrypted, accessible only to participants and (for flagged sessions) admin via AI summaries
- Raw transcript access requires explicit escalation protocol with audit logging
- Authentication via Supabase Auth with OAuth 2.0 (LinkedIn) and email/password
- Row-level security enforced at database level for all user data
- PCI DSS compliance via Stripe (platform never handles raw card data)
- Two-party consent required for session recording
- Age verification (18+) enforced at registration

### Scalability

- Phase 1: Support 10 concurrent Sensei-learner pairs (20 active users)
- Phase 2: Support 50+ Flash Help sessions, 100 active users
- Architecture must not preclude 10x growth without re-architecture (Supabase + SvelteKit support this natively)
- Video infrastructure scales independently via Daily.co's managed service

### Accessibility

- WCAG 2.1 AA compliance for all user-facing interfaces
- AI transcription provides captioning for recorded sessions
- Keyboard navigation for all core flows including "I'm stuck" entry
- Screen reader compatibility for constellation visualization and dashboard
- Sufficient color contrast and text scaling support

### Reliability

- Platform uptime: 99.5% (allows ~3.6 hours downtime/month — realistic for managed services at MVP)
- Video session completion rate: > 99% (sessions complete without drops — depends on Daily.co SLA)
- Graceful degradation: when no Sensei is available, AI warm-hold activates (never show an error or empty state to a vulnerable user)
- AI transcription pipeline failure handling: session recording is preserved, transcription retried up to 3 attempts over 2 hours. After max retries, admin is alerted and user receives message: "Session notes are taking longer than usual. Your recording is safe — we'll deliver notes as soon as possible."
- When payment processing fails, session still proceeds — billing resolved async

### Observability

- Structured logging for all Edge Functions (especially AI transcription pipeline, payment processing, video room creation)
- Error alerting for: failed transcription jobs, payment failures, video room creation failures, Sensei no-shows
- Basic operational dashboard: API error rates, transcription pipeline health, active sessions count
- Alert routing: critical failures (payment, video) notify immediately; non-critical (transcription delay) batch to daily summary

### Error Experience

- All user-facing error states must use empathetic, reassuring language appropriate for emotionally vulnerable users
- No raw technical error messages exposed to users
- Every failure state has a warm fallback message that maintains trust:
  - Payment failure: "No worries — your session is still happening. We'll sort out billing afterward."
  - Video connection drop: "Connection hiccup — reconnecting you now..."
  - Notes delayed: "Your session notes are taking a bit longer than usual. They'll be in your inbox soon."
  - Sensei unavailable: AI warm-hold with ETA, never an empty state or error screen
- Error tone is a product differentiator: a cold error message can undo the trust built in an entire session

### Integration

- Daily.co: video sessions, recording, WebRTC edge routing. Dependency: session scheduling triggers room creation
- Stripe + Stripe Connect: payment processing for Flash Help micro-transactions and Sensei payouts
- Whisper API (OpenAI): post-session audio transcription
- LLM API (Claude/GPT): session summary generation, Flash Help AI triage, emotional detection
- LinkedIn OAuth: identity verification for Sensei and learner onboarding
- Email service: session confirmations, reminders, notes delivery
