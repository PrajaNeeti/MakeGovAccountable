# Phase 4 Discussion Log

This file is for human reference only (audits, retrospectives) and is NOT consumed by downstream agents.

## 1. Forum Creation
**Options presented:** User-initiated vs. Auto-create.
**User selected:** User-initiated — Only create a thread when a user clicks 'Start Discussion' (prevents empty ghost-town threads).
**Notes:** User chose to avoid ghost-town threads on obscure bills.

## 2. Transparency Ledger Format
**Options presented:** Interactive UI vs. Embedded/Static.
**User selected:** Interactive UI — Build a custom native data table fetching from the DB (takes more time but feels integrated).
**Notes:** The user asked for clarification on what a transparency ledger is, and after explanation, chose the custom native UI for a better feel.

## 3. Forum Identity
**Options presented:** Pseudonymous handles vs. Completely anonymous.
**User selected:** Pseudonymous handles — Users get auto-generated or chosen names (e.g., 'Citizen_42') to allow following conversational threads.
**Notes:** Allows tracking conversations while retaining anonymity.

## 4. Moderation Approach
**Options presented:** AI pre-filter vs. Report-driven.
**User selected:** "can we not use a moderation library that pre filters set things i guess there should be something as such. there should be option to report as well"
**Notes:** We settled on a hybrid approach: static library for immediate filtering (toxicity/profanity) + report button for nuanced/partisan issues.
