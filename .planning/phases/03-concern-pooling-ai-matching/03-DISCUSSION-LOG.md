# Phase 3: Concern Pooling & AI Matching - Discussion Log

**Date:** 2026-07-21

## 1. Citizen Authentication
**Options presented:** Standard Email/Password, Magic Link, Social Logins, Email/Password + Social Logins
**User selected:** Anonymous submissions (No login required, just IP rate limits)
**Notes:** The user clarified they want public data to be visible without any login, and for submitting concerns, they want anonymous submissions protected by strict IP rate limits.

## 2. AI Matching Experience
**Options presented:** Real-time (User waits), Background Processing, Hybrid
**User selected:** Hybrid (semantic clustering for initial, LLM based in backend)
**Notes:** User specifically requested semantic clustering for the initial fast match, and an LLM-based background job that runs periodically to group problems more deeply.

## 3. Concern Privacy
**Options presented:** Public by default, Private until verified, User chooses
**User selected:** Public by default (Anyone can see it, full transparency)

## 4. Concern Grouping
**Options presented:** Auto-merge, Separate but linked, Manual merging
**User selected:** Manual merging (Moderators group them manually)
**Notes:** AI suggests groupings (from the backend job), but moderators do the actual manual merging.
