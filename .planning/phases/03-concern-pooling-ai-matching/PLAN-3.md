---
wave: 3
depends_on: ["PLAN-2.md"]
files_modified:
  - "frontend/src/app/moderation/page.tsx"
autonomous: true
truths:
  - "D-07: The AI suggests groupings but merging similar concerns into a master petition is done manually by Moderators."
---

# Phase 3 - Wave 3: Moderation Interface

<must_haves>
- [ ] D-07: The AI suggests groupings, but merging similar concerns into a master petition is done manually by Moderators — the /moderation interface provides approve/reject controls for suggested groups
- [ ] Restricted moderator interface to review AI-suggested concern groups
- [ ] Ability to manually merge, approve, or reject suggested groupings into a master petition
</must_haves>

## 1. Moderator UI
<read_first>
- frontend/src/app/moderation/page.tsx
- .planning/phases/03-concern-pooling-ai-matching/03-UI-SPEC.md
</read_first>
<action>
Create `frontend/src/app/moderation/page.tsx` for the moderator view:
- Build a restricted UI accessible only to moderators (implement basic role check).
- Display a list of `concern_groups` marked as "suggested" by the AI.
- For each group, show the included concerns and the matched government entities.
- Provide actions to approve (merge into a master petition) or reject the grouping.
</action>
<acceptance_criteria>
- `frontend/src/app/moderation/page.tsx` renders a dashboard for reviewing AI-suggested groups and provides approval/rejection functionality.
</acceptance_criteria>

<verification>
- Verify that only moderators can access the `/moderation` route.
- Verify UI accurately displays grouped concerns and linked government entities.
</verification>
